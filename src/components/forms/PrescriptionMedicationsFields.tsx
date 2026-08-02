import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { Plus, Trash2 } from "lucide-react";
import {
  findStockItemByName,
  isPrescriptionStockCategory,
} from "@/lib/prescriptionStock";
import type { StockItem } from "@/lib/database";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export type PrescriptionMedDraft = {
  medication_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity: number;
  instructions?: string;
  route?: string;
  sold_by_clinic: boolean;
  /** Prix unitaire MAD — prérempli depuis le stock, modifiable */
  unit_price?: number;
};

export const emptyPrescriptionMed = (): PrescriptionMedDraft => ({
  medication_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  quantity: 1,
  route: "oral",
  sold_by_clinic: true,
  unit_price: undefined,
});

export function catalogUnitPrice(item: StockItem | null | undefined): number {
  if (!item) return 0;
  const anyItem = item as StockItem & { selling_price?: number; unit_cost?: number };
  return Number(anyItem.selling_price ?? anyItem.unit_cost ?? 0) || 0;
}

type Props = {
  medications: PrescriptionMedDraft[];
  onChange: (next: PrescriptionMedDraft[]) => void;
  stockItems: StockItem[];
  /** En édition : pas de vente stock / prix (déjà traité à la création) */
  editMode?: boolean;
};

export function PrescriptionMedicationsFields({
  medications,
  onChange,
  stockItems,
  editMode = false,
}: Props) {
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");

  const defaultRoutes = [
    "oral",
    t("prescriptionMeds.routesList.injectable"),
    t("prescriptionMeds.routesList.topical"),
    t("prescriptionMeds.routes.iv"),
    t("prescriptionMeds.routes.im"),
    t("prescriptionMeds.routes.sc"),
  ];

  const defaultFrequencies = [
    t("prescriptionMeds.freq.onceDaily"),
    t("prescriptionMeds.freq.twiceDaily"),
    t("prescriptionMeds.freqList.threeDaily"),
    t("prescriptionMeds.freqList.onceWeekly"),
    t("prescriptionMeds.freq.asNeeded"),
  ];

  const availableMedications = stockItems.filter(
    (item) => isPrescriptionStockCategory(item.category) && item.active
  );

  const updateMed = (
    index: number,
    patch: Partial<PrescriptionMedDraft> | ((med: PrescriptionMedDraft) => PrescriptionMedDraft)
  ) => {
    onChange(
      medications.map((med, i) => {
        if (i !== index) return med;
        return typeof patch === "function" ? patch(med) : { ...med, ...patch };
      })
    );
  };

  const addMed = () => onChange([...medications, emptyPrescriptionMed()]);

  const removeMed = (index: number) => {
    if (medications.length <= 1) return;
    onChange(medications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("prescriptionMeds.productsAvailable", { count: availableMedications.length })}
        </p>
        <Button type="button" onClick={addMed} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {tc("add")}
        </Button>
      </div>

      {medications.map((medication, index) => {
        const stockMatch = findStockItemByName(availableMedications, medication.medication_name);
        const qty = stockMatch ? Number(stockMatch.current_quantity || 0) : 0;
        const canSell = Boolean(stockMatch && qty > 0);
        const showPrice = Boolean(stockMatch && medication.sold_by_clinic);
        const catalogPrice = catalogUnitPrice(stockMatch);
        const unitPrice =
          medication.unit_price != null && Number.isFinite(medication.unit_price)
            ? medication.unit_price
            : catalogPrice;
        const lineTotal = unitPrice * (Number(medication.quantity) || 1);
        const saleControlsEnabled = canSell || medication.sold_by_clinic;

        return (
          <div
            key={index}
            className="rounded-lg border border-border bg-muted/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {t("prescriptionMeds.medicationN", { n: index + 1 })}
              </h4>
              {medications.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMed(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="md:col-span-2 lg:col-span-1">
                <Label>{t("prescriptionMeds.medicationRequired")}</Label>
                <ComboboxFreeText
                  value={medication.medication_name}
                  onChange={(val) => {
                    const match = findStockItemByName(availableMedications, val);
                    updateMed(index, {
                      medication_name: val,
                      unit_price: match ? catalogUnitPrice(match) : undefined,
                    });
                  }}
                  options={availableMedications.map((i) => i.name)}
                  category="medication_name"
                  placeholder={t("prescriptionMeds.cataloguePlaceholder")}
                />
                {stockMatch ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stockMatch.description ? `${stockMatch.description} — ` : ""}
                    {t("prescriptionMeds.stockInfo", { qty, unit: stockMatch.unit })}
                    {qty <= 0 ? t("prescriptionMeds.outOfStockShort") : ""}
                    {catalogPrice > 0
                      ? t("prescriptionMeds.catalogPrice", { price: catalogPrice.toFixed(2) })
                      : ""}
                  </p>
                ) : medication.medication_name.trim() ? (
                  <p className="text-xs text-muted-foreground mt-1">{t("prescriptionMeds.offCatalog")}</p>
                ) : null}
              </div>

              <div>
                <Label>{t("prescriptionMeds.dosageLabel")}</Label>
                <Input
                  value={medication.dosage || ""}
                  onChange={(e) => updateMed(index, { dosage: e.target.value })}
                  placeholder={t("prescriptionMeds.dosagePlaceholder")}
                />
              </div>

              <div>
                <Label>{t("prescriptionMeds.frequencyLabel")}</Label>
                <ComboboxFreeText
                  value={medication.frequency || ""}
                  onChange={(val) => updateMed(index, { frequency: val })}
                  options={defaultFrequencies}
                  category="frequency"
                  placeholder={t("prescriptionMeds.frequencyPlaceholder")}
                />
              </div>

              <div>
                <Label>{t("prescriptionMeds.durationLabel")}</Label>
                <Input
                  value={medication.duration || ""}
                  onChange={(e) => updateMed(index, { duration: e.target.value })}
                  placeholder={t("prescriptionMeds.durationPlaceholder")}
                />
              </div>

              <div>
                <Label>{t("prescriptionMeds.quantityLabel")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={medication.quantity}
                  onChange={(e) =>
                    updateMed(index, { quantity: parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>

              <div>
                <Label>{t("prescriptionMeds.routeLabel")}</Label>
                <ComboboxFreeText
                  value={medication.route || "oral"}
                  onChange={(val) => updateMed(index, { route: val })}
                  options={defaultRoutes}
                  category="administration_route"
                  placeholder={t("prescriptionMeds.routePlaceholder")}
                />
              </div>
            </div>

            <div>
              <Label>{t("prescriptionMeds.instructionsLabel")}</Label>
              <Textarea
                value={medication.instructions || ""}
                onChange={(e) => updateMed(index, { instructions: e.target.value })}
                placeholder={t("prescriptionMeds.instructionsPlaceholder")}
                className="h-16"
              />
            </div>

            {stockMatch && (
              <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={`consult-sold-${index}`}
                    checked={medication.sold_by_clinic}
                    disabled={!saleControlsEnabled}
                    onCheckedChange={(checked) => {
                      const sold = checked === true;
                      updateMed(index, {
                        sold_by_clinic: sold,
                        unit_price: sold
                          ? medication.unit_price ?? catalogPrice
                          : medication.unit_price,
                      });
                    }}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor={`consult-sold-${index}`} className="text-sm font-medium cursor-pointer">
                      {t("prescriptionMeds.soldByClinic")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {editMode
                        ? medication.sold_by_clinic
                          ? t("prescriptionMeds.saleRecordedEdit")
                          : canSell
                            ? t("prescriptionMeds.saleEditHint")
                            : t("prescriptionMeds.outOfStockRxOnly")
                        : canSell
                          ? t("prescriptionMeds.deductOnSave")
                          : t("prescriptionMeds.outOfStockRxOnlyCreate")}
                    </p>
                  </div>
                </div>

                {showPrice && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    <div>
                      <Label htmlFor={`unit-price-${index}`}>{t("prescriptionMeds.unitPriceMad")}</Label>
                      <Input
                        id={`unit-price-${index}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateMed(index, {
                            unit_price: v === "" ? 0 : Math.max(0, Number(v) || 0),
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("prescriptionMeds.catalogPriceHint", { price: catalogPrice.toFixed(2) })}
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <p className="text-sm font-medium">
                        {t("prescriptionMeds.lineTotal", { total: lineTotal.toFixed(2) })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("prescriptionMeds.lineCalc", {
                          qty: Number(medication.quantity) || 1,
                          price: unitPrice.toFixed(2),
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Build CreatePrescriptionData.medications from drafts + stock. */
export function buildPrescriptionMedPayload(
  medications: PrescriptionMedDraft[],
  stockItems: StockItem[]
) {
  const available = stockItems.filter(
    (item) => isPrescriptionStockCategory(item.category) && item.active
  );

  return medications
    .filter((med) => med.medication_name.trim() !== "")
    .map((med) => {
      const stockMatch = findStockItemByName(available, med.medication_name);
      const qtyAvailable = Number(stockMatch?.current_quantity || 0);
      const wantsSale = Boolean(stockMatch && med.sold_by_clinic);
      if (wantsSale && qtyAvailable < Number(med.quantity || 1)) {
        throw new Error(
          i18n.t("medical:prescriptionMeds.insufficientStockFor", {
            name: med.medication_name.trim(),
            qty: qtyAvailable,
          })
        );
      }
      const soldByClinic = wantsSale && qtyAvailable > 0;
      const catalogPrice = catalogUnitPrice(stockMatch);
      const unitPrice =
        med.unit_price != null && Number.isFinite(med.unit_price)
          ? Number(med.unit_price)
          : catalogPrice;

      return {
        medication_name: med.medication_name.trim(),
        dosage: med.dosage || undefined,
        frequency: med.frequency || undefined,
        duration: med.duration || undefined,
        quantity: med.quantity || 1,
        instructions: med.instructions || undefined,
        route: med.route || undefined,
        stock_item_id: stockMatch?.id,
        sold_by_clinic: soldByClinic,
        unit_price: soldByClinic ? unitPrice : undefined,
      };
    });
}
