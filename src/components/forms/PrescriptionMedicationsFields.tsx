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

const DEFAULT_ROUTES = ["oral", "injectable", "topique", "intraveineuse", "intramusculaire", "sous-cutanée"];
const DEFAULT_FREQUENCIES = ["1x/jour", "2x/jour", "3x/jour", "1x/semaine", "selon besoin"];

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
          {availableMedications.length} produit(s) disponibles dans le catalogue stock
        </p>
        <Button type="button" onClick={addMed} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
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
        /** Déjà vendu (édition) : garder les contrôles même si stock à 0 */
        const saleControlsEnabled = canSell || medication.sold_by_clinic;

        return (
          <div
            key={index}
            className="rounded-lg border border-border bg-muted/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Médicament {index + 1}</h4>
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
                <Label>Médicament *</Label>
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
                  placeholder="Catalogue ou saisie libre..."
                />
                {stockMatch ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stockMatch.description ? `${stockMatch.description} — ` : ""}
                    Stock: {qty} {stockMatch.unit}
                    {qty <= 0 ? " (rupture)" : ""}
                    {catalogPrice > 0 ? ` · Catalogue: ${catalogPrice.toFixed(2)} MAD` : ""}
                  </p>
                ) : medication.medication_name.trim() ? (
                  <p className="text-xs text-muted-foreground mt-1">Hors catalogue — prescription seule</p>
                ) : null}
              </div>

              <div>
                <Label>Dosage</Label>
                <Input
                  value={medication.dosage || ""}
                  onChange={(e) => updateMed(index, { dosage: e.target.value })}
                  placeholder="ex: 5mg"
                />
              </div>

              <div>
                <Label>Fréquence</Label>
                <ComboboxFreeText
                  value={medication.frequency || ""}
                  onChange={(val) => updateMed(index, { frequency: val })}
                  options={DEFAULT_FREQUENCIES}
                  category="frequency"
                  placeholder="ex: 2x/jour"
                />
              </div>

              <div>
                <Label>Durée</Label>
                <Input
                  value={medication.duration || ""}
                  onChange={(e) => updateMed(index, { duration: e.target.value })}
                  placeholder="ex: 7 jours"
                />
              </div>

              <div>
                <Label>Quantité</Label>
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
                <Label>Voie</Label>
                <ComboboxFreeText
                  value={medication.route || "oral"}
                  onChange={(val) => updateMed(index, { route: val })}
                  options={DEFAULT_ROUTES}
                  category="administration_route"
                  placeholder="Voie"
                />
              </div>
            </div>

            <div>
              <Label>Instructions</Label>
              <Textarea
                value={medication.instructions || ""}
                onChange={(e) => updateMed(index, { instructions: e.target.value })}
                placeholder="Instructions particulières..."
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
                      Vendu par le cabinet
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {editMode
                        ? medication.sold_by_clinic
                          ? "Vente déjà enregistrée — prix et infos conservés."
                          : canSell
                            ? "Cochez si délivré ici (stock non recalculé à la modification)."
                            : "Rupture de stock — ordonnance seule."
                        : canSell
                          ? "Déduit du stock à l'enregistrement de l'ordonnance."
                          : "Rupture de stock — ordonnance seule possible."}
                    </p>
                  </div>
                </div>

                {showPrice && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    <div>
                      <Label htmlFor={`unit-price-${index}`}>Prix unitaire (MAD)</Label>
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
                        Modifiable — catalogue: {catalogPrice.toFixed(2)} MAD
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <p className="text-sm font-medium">
                        Total ligne: {lineTotal.toFixed(2)} MAD
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(medication.quantity) || 1} × {unitPrice.toFixed(2)}
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
          `Stock insuffisant pour ${med.medication_name.trim()} (disponible: ${qtyAvailable})`
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
