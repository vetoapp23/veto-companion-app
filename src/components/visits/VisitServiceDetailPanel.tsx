import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ImagePlus,
  Loader2,
  Pill,
  Play,
  SkipForward,
  Trash2,
  X,
} from "lucide-react";
import type { VisitService } from "@/lib/visits";
import { getServiceDef, type VisitServiceDef } from "@/lib/visitCatalog";
import { compressPhoto, recordStorageChange, estimateDataUrlBytes } from "@/lib/photoCompression";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type Details = Record<string, string>;

interface VisitServiceDetailPanelProps {
  service: VisitService;
  currency: string;
  perHead?: boolean;
  readOnly?: boolean;
  onSaveAmount: (amount: number) => void;
  onSaveDetails: (payload: {
    notes?: string;
    details?: Record<string, unknown>;
    attachments?: string[];
    markDone?: boolean;
  }) => Promise<void>;
  onRealize: () => void;
  onMarkDone: () => void;
  onSkip: () => void;
  onRemove: () => void;
  onOpenRx?: () => void;
}

function detailsAsStrings(raw: Record<string, unknown> | undefined): Details {
  const out: Details = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    if (v == null) continue;
    out[k] = String(v);
  }
  return out;
}

export function VisitServiceDetailPanel({
  service,
  currency,
  perHead,
  readOnly = false,
  onSaveAmount,
  onSaveDetails,
  onRealize,
  onMarkDone,
  onSkip,
  onRemove,
  onOpenRx,
}: VisitServiceDetailPanelProps) {
  const { toast } = useToast();
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const def = getServiceDef(service.service_code);
  const panel = def?.panel || "generic";
  const fileRef = useRef<HTMLInputElement>(null);

  const [details, setDetails] = useState<Details>(() => detailsAsStrings(service.details));
  const [notes, setNotes] = useState(service.notes || "");
  const [attachments, setAttachments] = useState<string[]>(service.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDetails(detailsAsStrings(service.details));
    setNotes(service.notes || "");
    setAttachments(service.attachments || []);
  }, [service.id, service.notes, service.details, service.attachments]);

  const setDetail = (key: string, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const results: string[] = [];
      let totalBytes = 0;
      for (const file of Array.from(files)) {
        try {
          const c = await compressPhoto(file);
          results.push(c.dataUrl);
          totalBytes += c.bytes;
        } catch {
          const dataUrl = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(String(reader.result));
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });
          results.push(dataUrl);
          totalBytes += estimateDataUrlBytes(dataUrl);
        }
      }
      const next = [...attachments, ...results];
      setAttachments(next);
      recordStorageChange("consultation", totalBytes, results.length).catch(() => {});
      toast({
        title: t("visitServicePanel.imagesAdded"),
        description: t("visitServicePanel.imagesAddedDesc", { count: results.length }),
      });
    } catch (e: any) {
      toast({
        title: t("visitServicePanel.photosError"),
        description: e?.message || t("alerts.cannotProcessImages"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const savePanel = async (markDone = false) => {
    setSaving(true);
    try {
      await onSaveDetails({
        notes: notes.trim() || undefined,
        details,
        attachments,
        markDone,
      });
      toast({
        title: markDone ? t("visitServicePanel.serviceSaved") : t("visitServicePanel.changesSaved"),
        description:
          panel === "imaging" || panel === "lab"
            ? t("visitServicePanel.syncedToRecord")
            : undefined,
      });
    } catch (e: any) {
      toast({ title: tc("error"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const realizeLabel = (panelKey: string) => {
    switch (panelKey) {
      case "clinical":
        return t("visitServicePanel.openConsultation");
      case "vaccination":
        return t("visitServicePanel.saveVaccine");
      case "antiparasitic":
        return t("visitServicePanel.saveTreatment");
      case "prescription":
        return t("visitServicePanel.writePrescription");
      case "farm":
        return t("visitServicePanel.openFarmIntervention");
      default:
        return t("visitServicePanel.realize");
    }
  };

  const AmountField = (
    <div className="space-y-2">
      <Label>
        {t("visitServicePanel.amountLabel", { currency })}
        {perHead ? t("visitServicePanel.perHeadUnit") : ""}
      </Label>
      <Input
        type="number"
        min={0}
        step={1}
        defaultValue={Number(service.amount || 0)}
        key={`amt-${service.id}-${service.amount}`}
        disabled={readOnly}
        onBlur={(e) => {
          if (readOnly) return;
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onSaveAmount(v);
        }}
      />
    </div>
  );

  const ImageGallery = (
    <div className="space-y-2">
      <Label>{t("visitServicePanel.imagesLabel")}</Label>
      <div className="flex flex-wrap gap-2">
        {attachments.map((src, idx) => (
          <div key={idx} className="relative group">
            <img
              src={src}
              alt={t("visitServicePanel.imageAlt", { n: idx + 1 })}
              className="h-20 w-20 object-cover rounded-md border"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 hover:opacity-100"
                aria-label={t("visitServicePanel.removeImageAria")}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="h-20 w-20 rounded-md border border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">{tc("add")}</span>
              </>
            )}
          </button>
        )}
      </div>
      {!readOnly && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleAddImages(e.target.files)}
        />
      )}
      {!readOnly && (
        <p className="text-[11px] text-muted-foreground">
          {t("visitServicePanel.compressHint")}
        </p>
      )}
    </div>
  );

  const ActionBar = readOnly ? null : (
    <>
      <Separator />
      <div className="flex flex-wrap gap-2">
        {needsRealize(def) && service.status !== "done" && (
          <Button className="gap-2" onClick={onRealize}>
            <Play className="h-4 w-4" />
            {realizeLabel(panel)}
          </Button>
        )}

        {needsInlineSave(panel) && service.status !== "done" && (
          <Button
            className="gap-2"
            disabled={saving || uploading}
            onClick={() => savePanel(true)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {t("visitServicePanel.saveAndMarkDone")}
          </Button>
        )}

        {needsInlineSave(panel) && service.status === "done" && (
          <Button
            variant="secondary"
            className="gap-2"
            disabled={saving || uploading}
            onClick={() => savePanel(false)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {t("visitServicePanel.update")}
          </Button>
        )}

        {!needsInlineSave(panel) && service.status !== "done" && (
          <Button variant="secondary" className="gap-2" onClick={onMarkDone}>
            <Check className="h-4 w-4" />
            {t("visitServicePanel.markDone")}
          </Button>
        )}

        {service.status !== "skipped" && service.status !== "done" && (
          <Button variant="outline" className="gap-2" onClick={onSkip}>
            <SkipForward className="h-4 w-4" />
            {t("visitServicePanel.skip")}
          </Button>
        )}

        {panel === "prescription" && service.status !== "done" && onOpenRx && (
          <Button variant="outline" className="gap-2" onClick={onOpenRx}>
            <Pill className="h-4 w-4" />
            {t("visitServicePanel.prescription")}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive ml-auto"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{def?.description}</p>
      {AmountField}

      {panel === "clinical" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">{t("visitServicePanel.clinicalReport")}</p>
          <p className="text-muted-foreground text-xs">
            {t("visitServicePanel.clinicalHint")}
          </p>
          {service.reference_id && (
            <p className="text-xs text-muted-foreground pt-1">
              {t("visitServicePanel.consultationLinked", { ref: service.reference_id.slice(0, 8) })}
            </p>
          )}
        </div>
      )}

      {panel === "vaccination" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">{t("visitServicePanel.vaccination")}</p>
          <p className="text-muted-foreground text-xs">
            {t("visitServicePanel.vaccinationHint", {
              saveVaccine: t("visitServicePanel.saveVaccine"),
              markDone: t("visitServicePanel.markDone"),
            })}
          </p>
        </div>
      )}

      {panel === "antiparasitic" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">{t("visitServicePanel.antiparasitic")}</p>
          <p className="text-muted-foreground text-xs">
            {t("visitServicePanel.antiparasiticHint", {
              saveTreatment: t("visitServicePanel.saveTreatment"),
              markDone: t("visitServicePanel.markDone"),
            })}
          </p>
        </div>
      )}

      {panel === "prescription" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">{t("visitServicePanel.prescription")}</p>
          <p className="text-muted-foreground text-xs">
            {t("visitServicePanel.prescriptionHint")}
          </p>
        </div>
      )}

      {panel === "farm" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">{t("visitServicePanel.farmIntervention")}</p>
          <p className="text-muted-foreground text-xs">
            {t("visitServicePanel.farmHint")}
          </p>
        </div>
      )}

      {panel === "imaging" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground rounded-lg border bg-muted/30 p-2">
            {t("visitServicePanel.imagingSyncHint", { type: def?.label || "imagerie" })}
          </p>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.regionLabel")}</Label>
            <Input
              value={details.region || ""}
              onChange={(e) => setDetail("region", e.target.value)}
              placeholder={t("visitServicePanel.regionPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.techniqueLabel")}</Label>
            <Input
              value={details.technique || ""}
              onChange={(e) => setDetail("technique", e.target.value)}
              placeholder={t("visitServicePanel.techniquePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.findingsLabel")}</Label>
            <Textarea
              rows={4}
              value={details.findings || notes}
              onChange={(e) => {
                setDetail("findings", e.target.value);
                setNotes(e.target.value);
              }}
              placeholder={t("visitServicePanel.findingsPlaceholder")}
            />
          </div>
          {ImageGallery}
        </div>
      )}

      {panel === "lab" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground rounded-lg border bg-muted/30 p-2">
            {t("visitServicePanel.labSyncHint")}
          </p>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.testsLabel")}</Label>
            <Input
              value={details.tests || ""}
              onChange={(e) => setDetail("tests", e.target.value)}
              placeholder={t("visitServicePanel.testsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.resultsLabel")}</Label>
            <Textarea
              rows={4}
              value={details.results || notes}
              onChange={(e) => {
                setDetail("results", e.target.value);
                setNotes(e.target.value);
              }}
              placeholder={t("visitServicePanel.resultsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("visitServicePanel.labRefLabel")}</Label>
            <Input
              value={details.lab_ref || ""}
              onChange={(e) => setDetail("lab_ref", e.target.value)}
              placeholder={t("visitServicePanel.labRefPlaceholder")}
            />
          </div>
        </div>
      )}

      {panel === "grooming" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{t("visitServicePanel.serviceDoneLabel")}</Label>
            <Input
              value={details.service_done || ""}
              onChange={(e) => setDetail("service_done", e.target.value)}
              placeholder={t("visitServicePanel.serviceDonePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{tc("notes")}</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("visitServicePanel.groomingPlaceholder")}
            />
          </div>
        </div>
      )}

      {panel === "generic" && (
        <div className="space-y-2">
          <Label>{t("visitServicePanel.genericNotesLabel")}</Label>
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("visitServicePanel.genericNotesPlaceholder")}
          />
        </div>
      )}

      {ActionBar}

      {service.reference_id && panel !== "clinical" && (
        <p className="text-xs text-muted-foreground">
          {t("visitServicePanel.linkedTo", {
            ref: `${service.reference_type} · ${service.reference_id.slice(0, 8)}…`,
          })}
        </p>
      )}
    </div>
  );
}

function needsRealize(def?: VisitServiceDef) {
  if (!def) return false;
  return (
    def.action === "consultation" ||
    def.action === "vaccination" ||
    def.action === "antiparasitic" ||
    def.action === "prescription" ||
    def.action === "farm_intervention"
  );
}

function needsInlineSave(panel: string) {
  return panel === "imaging" || panel === "lab" || panel === "grooming" || panel === "generic";
}
