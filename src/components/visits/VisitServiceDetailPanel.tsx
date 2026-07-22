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

type Details = Record<string, string>;

interface VisitServiceDetailPanelProps {
  service: VisitService;
  currency: string;
  perHead?: boolean;
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
  onSaveAmount,
  onSaveDetails,
  onRealize,
  onMarkDone,
  onSkip,
  onRemove,
  onOpenRx,
}: VisitServiceDetailPanelProps) {
  const { toast } = useToast();
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
        title: "Images ajoutées",
        description: `${results.length} image(s). Enregistrez pour sauvegarder.`,
      });
    } catch (e: any) {
      toast({
        title: "Erreur images",
        description: e?.message || "Impossible de traiter les images",
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
        title: markDone ? "Prestation enregistrée" : "Modifications enregistrées",
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const AmountField = (
    <div className="space-y-2">
      <Label>
        Montant ({currency})
        {perHead ? " — prix unitaire / tête" : ""}
      </Label>
      <Input
        type="number"
        min={0}
        step={1}
        defaultValue={Number(service.amount || 0)}
        key={`amt-${service.id}-${service.amount}`}
        onBlur={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onSaveAmount(v);
        }}
      />
    </div>
  );

  const ImageGallery = (
    <div className="space-y-2">
      <Label>Images / clichés</Label>
      <div className="flex flex-wrap gap-2">
        {attachments.map((src, idx) => (
          <div key={idx} className="relative group">
            <img
              src={src}
              alt={`cliché ${idx + 1}`}
              className="h-20 w-20 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 hover:opacity-100"
              aria-label="Supprimer l'image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
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
              <span className="text-[10px]">Ajouter</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleAddImages(e.target.files)}
      />
      <p className="text-[11px] text-muted-foreground">
        JPG / PNG — compressées automatiquement. Cliquez Enregistrer pour les sauvegarder.
      </p>
    </div>
  );

  const ActionBar = (
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
            Enregistrer & marquer fait
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
            Mettre à jour
          </Button>
        )}

        {!needsInlineSave(panel) && service.status !== "done" && (
          <Button variant="secondary" className="gap-2" onClick={onMarkDone}>
            <Check className="h-4 w-4" />
            Marquer fait
          </Button>
        )}

        {service.status !== "skipped" && service.status !== "done" && (
          <Button variant="outline" className="gap-2" onClick={onSkip}>
            <SkipForward className="h-4 w-4" />
            Ignorer
          </Button>
        )}

        {panel === "prescription" && service.status !== "done" && onOpenRx && (
          <Button variant="outline" className="gap-2" onClick={onOpenRx}>
            <Pill className="h-4 w-4" />
            Ordonnance
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
          <p className="font-medium">Compte-rendu clinique</p>
          <p className="text-muted-foreground text-xs">
            Ouvrez le formulaire de consultation pour saisir symptômes, diagnostic, traitement
            et photos.
          </p>
          {service.reference_id && (
            <p className="text-xs text-muted-foreground pt-1">
              Consultation liée · {service.reference_id.slice(0, 8)}…
            </p>
          )}
        </div>
      )}

      {panel === "vaccination" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">Vaccination</p>
          <p className="text-muted-foreground text-xs">
            Enregistrez la dose du jour et le protocole — les rappels créeront des RDV
            automatiquement.
          </p>
        </div>
      )}

      {panel === "antiparasitic" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">Traitement antiparasitaire</p>
          <p className="text-muted-foreground text-xs">
            Saisissez le produit et le plan — les rappels futurs deviennent des RDV.
          </p>
        </div>
      )}

      {panel === "prescription" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">Ordonnance</p>
          <p className="text-muted-foreground text-xs">
            Prescrivez les médicaments liés au stock. Le montant peut être mis à jour
            automatiquement.
          </p>
        </div>
      )}

      {panel === "farm" && (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium">Intervention d&apos;élevage</p>
          <p className="text-muted-foreground text-xs">
            Ouvrez le formulaire d&apos;intervention ferme (lot, prophylaxie, coût…).
          </p>
        </div>
      )}

      {panel === "imaging" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Région / zone anatomique</Label>
            <Input
              value={details.region || ""}
              onChange={(e) => setDetail("region", e.target.value)}
              placeholder="ex. Thorax, membre antérieur G…"
            />
          </div>
          <div className="space-y-2">
            <Label>Technique / incidences</Label>
            <Input
              value={details.technique || ""}
              onChange={(e) => setDetail("technique", e.target.value)}
              placeholder="ex. Face + profil, Doppler…"
            />
          </div>
          <div className="space-y-2">
            <Label>Compte-rendu / findings</Label>
            <Textarea
              rows={4}
              value={details.findings || notes}
              onChange={(e) => {
                setDetail("findings", e.target.value);
                setNotes(e.target.value);
              }}
              placeholder="Observations radiographiques / échographiques…"
            />
          </div>
          {ImageGallery}
        </div>
      )}

      {panel === "lab" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Analyses demandées</Label>
            <Input
              value={details.tests || ""}
              onChange={(e) => setDetail("tests", e.target.value)}
              placeholder="ex. NFS, biochimie, test FIV/FeLV…"
            />
          </div>
          <div className="space-y-2">
            <Label>Résultats</Label>
            <Textarea
              rows={4}
              value={details.results || notes}
              onChange={(e) => {
                setDetail("results", e.target.value);
                setNotes(e.target.value);
              }}
              placeholder="Résultats et interprétation…"
            />
          </div>
          <div className="space-y-2">
            <Label>Laboratoire / référence</Label>
            <Input
              value={details.lab_ref || ""}
              onChange={(e) => setDetail("lab_ref", e.target.value)}
              placeholder="Labo externe, n° dossier…"
            />
          </div>
        </div>
      )}

      {panel === "grooming" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Prestation réalisée</Label>
            <Input
              value={details.service_done || ""}
              onChange={(e) => setDetail("service_done", e.target.value)}
              placeholder="ex. Coupe, bain, détartrage…"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, comportement…"
            />
          </div>
        </div>
      )}

      {panel === "generic" && (
        <div className="space-y-2">
          <Label>Notes / compte-rendu</Label>
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Détails de l'acte…"
          />
        </div>
      )}

      {ActionBar}

      {service.reference_id && panel !== "clinical" && (
        <p className="text-xs text-muted-foreground">
          Lié à {service.reference_type} · {service.reference_id.slice(0, 8)}…
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

function realizeLabel(panel: string) {
  switch (panel) {
    case "clinical":
      return "Ouvrir consultation";
    case "vaccination":
      return "Enregistrer vaccin";
    case "antiparasitic":
      return "Enregistrer traitement";
    case "prescription":
      return "Rédiger ordonnance";
    case "farm":
      return "Ouvrir intervention";
    default:
      return "Réaliser";
  }
}
