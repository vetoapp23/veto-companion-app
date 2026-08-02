import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useStockItems,
  useUpdatePrescription,
  type Prescription,
  type StockItem,
} from "@/hooks/useDatabase";
import {
  PrescriptionMedicationsFields,
  emptyPrescriptionMed,
  catalogUnitPrice,
  type PrescriptionMedDraft,
} from "@/components/forms/PrescriptionMedicationsFields";
import { findStockItemByName, isPrescriptionStockCategory } from "@/lib/prescriptionStock";
import { supabase } from "@/lib/supabase";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PrescriptionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
  onUpdated?: (prescription: Prescription) => void;
}

type SaleInfo = {
  sold: boolean;
  unitPrice?: number;
  quantity?: number;
};

function parseUnitPriceFromNotes(notes?: string | null): number | undefined {
  if (!notes) return undefined;
  const m = notes.match(/PU\s*([0-9]+(?:[.,][0-9]+)?)\s*MAD/i);
  if (!m) return undefined;
  const n = Number(String(m[1]).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

async function loadSaleInfoByPrescription(
  prescriptionId: string
): Promise<Map<string, SaleInfo>> {
  const map = new Map<string, SaleInfo>();
  const { data, error } = await supabase
    .from("stock_movements")
    .select("item_name, quantity, notes, stock_item_id")
    .eq("reference", prescriptionId)
    .eq("movement_type", "out");

  if (error || !data) return map;

  for (const row of data) {
    const key = String(row.item_name || "")
      .trim()
      .toLowerCase();
    if (!key) continue;
    const fromNotes = parseUnitPriceFromNotes(row.notes);
    const info: SaleInfo = {
      sold: true,
      unitPrice: fromNotes,
      quantity: Number(row.quantity) || undefined,
    };
    map.set(key, info);
    if (row.stock_item_id) map.set(`id:${row.stock_item_id}`, info);
  }
  return map;
}

function medsToDraft(
  prescription: Prescription | null,
  stockItems: StockItem[],
  sales: Map<string, SaleInfo>
): PrescriptionMedDraft[] {
  const meds = prescription?.medications || [];
  if (meds.length === 0) return [emptyPrescriptionMed()];

  const available = stockItems.filter(
    (item) => isPrescriptionStockCategory(item.category) && item.active
  );

  return meds.map((m) => {
    const name = m.medication_name || "";
    const stockMatch =
      (m.stock_item_id && available.find((s) => s.id === m.stock_item_id)) ||
      findStockItemByName(available, name);
    const sale =
      (m.stock_item_id && sales.get(`id:${m.stock_item_id}`)) ||
      sales.get(name.trim().toLowerCase());
    const catalogPrice = catalogUnitPrice(stockMatch);

    // Priorité : prix persisté sur la prescription → mouvement → catalogue
    const dbPrice =
      m.unit_price != null && Number.isFinite(Number(m.unit_price))
        ? Number(m.unit_price)
        : undefined;
    const sold = Boolean(m.sold_by_clinic) || Boolean(sale?.sold);
    const unitPrice =
      dbPrice ??
      (sale?.unitPrice != null && Number.isFinite(sale.unitPrice)
        ? sale.unitPrice
        : sold
          ? catalogPrice
          : undefined);

    return {
      medication_name: name,
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
      quantity: m.quantity || sale?.quantity || 1,
      instructions: m.instructions || "",
      route: m.route || "oral",
      sold_by_clinic: sold,
      unit_price: unitPrice,
    };
  });
}

export function PrescriptionEditModal({
  open,
  onOpenChange,
  prescription,
  onUpdated,
}: PrescriptionEditModalProps) {
  const { toast } = useToast();
  const { data: stockItems = [] } = useStockItems();
  const updateMutation = useUpdatePrescription();
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");

  const [formData, setFormData] = useState({
    diagnosis: "",
    notes: "",
    validUntil: "",
    status: "active" as string,
  });
  const [medications, setMedications] = useState<PrescriptionMedDraft[]>([emptyPrescriptionMed()]);
  const [loadingMeds, setLoadingMeds] = useState(false);

  useEffect(() => {
    if (!open || !prescription) return;

    setFormData({
      diagnosis: prescription.diagnosis || "",
      notes: prescription.notes || "",
      validUntil: prescription.valid_until
        ? String(prescription.valid_until).slice(0, 10)
        : "",
      status: prescription.status || "active",
    });

    let cancelled = false;
    (async () => {
      setLoadingMeds(true);
      try {
        const sales = await loadSaleInfoByPrescription(prescription.id);
        if (cancelled) return;
        setMedications(medsToDraft(prescription, stockItems, sales));
      } catch {
        if (!cancelled) {
          setMedications(medsToDraft(prescription, stockItems, new Map()));
        }
      } finally {
        if (!cancelled) setLoadingMeds(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, prescription, stockItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescription?.id) return;

    const available = stockItems.filter(
      (item) => isPrescriptionStockCategory(item.category) && item.active
    );
    const medPayload = medications
      .filter((m) => m.medication_name.trim())
      .map((m) => {
        const stockMatch = findStockItemByName(available, m.medication_name);
        const unitPrice =
          m.unit_price != null && Number.isFinite(m.unit_price)
            ? Number(m.unit_price)
            : catalogUnitPrice(stockMatch);
        return {
          medication_name: m.medication_name.trim(),
          dosage: m.dosage || undefined,
          frequency: m.frequency || undefined,
          duration: m.duration || undefined,
          quantity: m.quantity || 1,
          instructions: m.instructions || undefined,
          route: m.route || undefined,
          stock_item_id: stockMatch?.id,
          sold_by_clinic: Boolean(m.sold_by_clinic),
          unit_price: m.sold_by_clinic ? unitPrice : undefined,
        };
      });

    if (medPayload.length === 0) {
      toast({
        title: tc("error"),
        description: t("prescriptionForm.needMedication"),
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: prescription.id,
        data: {
          diagnosis: formData.diagnosis,
          notes: formData.notes,
          status: formData.status,
          valid_until: formData.validUntil || null,
          medications: medPayload,
        },
      });

      toast({
        title: t("prescriptionForm.updated"),
        description: t("forms.prescriptionUpdatedBody"),
      });
      onUpdated?.(updated as Prescription);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: tc("error"),
        description: error?.message || t("prescriptionForm.cannotUpdate"),
        variant: "destructive",
      });
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("prescriptionForm.editTitle")}</DialogTitle>
          <DialogDescription>
            {t("prescriptionForm.editDesc", { id: prescription.id.slice(-8) })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-diagnosis">{t("forms.diagnosisLabel")}</Label>
              <Textarea
                id="edit-diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData((p) => ({ ...p, diagnosis: e.target.value }))}
                placeholder={t("prescriptionForm.diagnosisPlaceholder")}
                className="h-20"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-validUntil">{t("prescriptionForm.validUntil")}</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData((p) => ({ ...p, validUntil: e.target.value }))}
                />
              </div>
              <div>
                <Label>{tc("status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("prescriptionForm.statusActive")}</SelectItem>
                    <SelectItem value="completed">{t("prescriptionForm.statusCompleted")}</SelectItem>
                    <SelectItem value="cancelled">{t("prescriptionForm.statusCancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base font-semibold">{t("prescriptionForm.medicationsHeading")}</Label>
            {loadingMeds ? (
              <p className="text-sm text-muted-foreground">{t("prescriptionForm.loadingSaleInfo")}</p>
            ) : (
              <PrescriptionMedicationsFields
                medications={medications}
                onChange={setMedications}
                stockItems={stockItems}
                editMode
              />
            )}
          </div>

          <div>
            <Label htmlFor="edit-notes">{tc("notes")}</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              placeholder={t("prescriptionForm.notesPlaceholder")}
              className="h-20"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || loadingMeds}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? tc("saving") : tc("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
