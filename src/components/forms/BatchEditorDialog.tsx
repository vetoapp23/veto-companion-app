// @ts-nocheck
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { useCreateFarmBatch, useUpdateFarmBatch, type FarmBatch } from "@/hooks/useFarmBatches";
import { getFarmTypeConfig } from "@/lib/farmTypeConfig";
import { ChipNumbersField } from "@/components/forms/ChipNumbersField";
import { useTranslation } from "react-i18next";

interface BatchEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  farmType?: string | null;
  farmTypes?: string[];
  batch?: FarmBatch | null;
  /** Appelé après création / mise à jour réussie (ex. sélection auto) */
  onSaved?: (batch: FarmBatch) => void;
}

const BatchEditorDialog = ({ open, onOpenChange, farmId, farmType, farmTypes = [], batch, onSaved }: BatchEditorDialogProps) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  const create = useCreateFarmBatch();
  const update = useUpdateFarmBatch();

  const [data, setData] = useState({
    name: "", species: "", category: "", animal_count: "0",
    birth_period: "", location: "", status: "active", notes: "",
    farm_type: "",
    chip_numbers: [] as string[],
  });

  useEffect(() => {
    if (!open) return;
    if (batch) {
      setData({
        name: batch.name || "",
        species: batch.species || "",
        category: batch.category || "",
        animal_count: String(batch.animal_count ?? 0),
        birth_period: batch.birth_period || "",
        location: batch.location || "",
        status: batch.status || "active",
        notes: batch.notes || "",
        farm_type: (batch as any).farm_type || farmType || farmTypes[0] || "",
        chip_numbers: Array.isArray(batch.chip_numbers) ? [...batch.chip_numbers] : [],
      });
    } else {
      setData({
        name: "", species: "", category: "", animal_count: "0",
        birth_period: "", location: "", status: "active", notes: "",
        farm_type: farmType || farmTypes[0] || "",
        chip_numbers: [],
      });
    }
  }, [open, batch, farmType, farmTypes]);

  const config = getFarmTypeConfig(data.farm_type || farmType);

  const set = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }));
  const busy = create.isPending || update.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) {
      toast({ title: t("farms.batch.nameRequired"), variant: "destructive" });
      return;
    }
    const payload: any = {
      farm_id: farmId,
      name: data.name.trim(),
      species: data.species || null,
      category: data.category || null,
      animal_count: parseInt(data.animal_count) || 0,
      birth_period: data.birth_period || null,
      location: data.location || null,
      status: data.status,
      notes: data.notes || null,
      farm_type: data.farm_type || null,
      chip_numbers: data.chip_numbers.length ? data.chip_numbers : [],
    };
    try {
      if (batch?.id) {
        const updated = await update.mutateAsync({ id: batch.id, data: payload });
        toast({ title: t("farms.batch.updated") });
        onSaved?.(updated);
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: t("farms.batch.created") });
        onSaved?.(created);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: tc("error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{batch ? t("farms.batch.edit") : t("farms.batch.new")}</DialogTitle>
          <DialogDescription>{t("farms.batch.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {farmTypes.length > 1 && (
            <div className="space-y-2">
              <Label>{t("farms.batch.farmType")}</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.farm_type} onChange={(e) => set("farm_type", e.target.value)}>
                <option value="">{t("farms.batch.choose")}</option>
                {farmTypes.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
              </select>
              <p className="text-xs text-muted-foreground">
                {t("farms.batch.categoriesAdapt")}
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("farms.batch.name")}</Label>
              <Input value={data.name} onChange={(e) => set("name", e.target.value)} required placeholder={t("farms.batch.namePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("farms.batch.category")}</Label>
              <ComboboxFreeText
                value={data.category}
                onChange={(v) => set("category", v)}
                options={config.batchCategories}
                category="batch_category"
                placeholder={t("farms.batch.categoryPlaceholder")}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("farms.batch.speciesBreed")}</Label>
              <Input value={data.species} onChange={(e) => set("species", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("farms.batch.headcount")}</Label>
              <Input type="number" min={0} value={data.animal_count} onChange={(e) => set("animal_count", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("farms.batch.birthPeriod")}</Label>
              <Input value={data.birth_period} onChange={(e) => set("birth_period", e.target.value)} placeholder={t("farms.batch.birthPeriodPlaceholder")} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("farms.batch.locationBuilding")}</Label>
              <Input value={data.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{tc("status")}</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={data.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">{t("farms.batch.statusActive")}</option>
                <option value="sold">{t("farms.batch.statusSold")}</option>
                <option value="closed">{t("farms.batch.statusClosed")}</option>
                <option value="quarantine">{t("farms.batch.statusQuarantine")}</option>
              </select>
            </div>
          </div>
          <ChipNumbersField
            value={data.chip_numbers}
            onChange={(chips) => set("chip_numbers", chips)}
            label={t("farms.batch.chipNumbers")}
            hint={t("farms.batch.chipHint")}
          />
          <div className="space-y-2">
            <Label>{tc("notes")}</Label>
            <Textarea rows={2} value={data.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>{tc("cancel")}</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {batch ? tc("save") : t("farms.batch.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchEditorDialog;
