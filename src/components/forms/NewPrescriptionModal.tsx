import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreatePrescription, useStockItems } from "@/hooks/useDatabase";
import type { CreatePrescriptionData } from "@/lib/database";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";

const DEFAULT_ROUTES = ["oral", "injectable", "topique", "intraveineuse", "intramusculaire", "sous-cutanée"];
const DEFAULT_FREQUENCIES = ["1x/jour", "2x/jour", "3x/jour", "1x/semaine", "selon besoin"];

interface NewPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  /** Optional — prescriptions can be linked to a visit without a consultation */
  consultationId?: string | null;
  visitId?: string | null;
  onCreated?: (prescription: { id: string; estimatedAmount?: number }) => void;
}

export function NewPrescriptionModal({
  open,
  onOpenChange,
  petId,
  consultationId,
  visitId,
  onCreated,
}: NewPrescriptionModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const { data: stockItems = [] } = useStockItems();
  const createPrescriptionMutation = useCreatePrescription();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    diagnosis: "",
    notes: "",
    validUntil: ""
  });

  const [medications, setMedications] = useState<{
    medication_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity: number;
    instructions?: string;
    route?: string;
  }[]>([
    {
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
      route: "oral"
    }
  ]);

  // Find the animal and associated client
  const animal = animals.find(a => a.id === petId);
  const client = animal ? clients.find(c => c.id === animal.client_id) : null;

  // Filter available medications from stock
  const availableMedications = stockItems.filter(item => 
    (item.category === 'medication' || item.category === 'supplement') && 
    item.current_quantity > 0 && 
    item.active
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationChange = (index: number, field: keyof typeof medications[0], value: string | number) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const addMedication = () => {
    setMedications(prev => [...prev, {
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
      route: "oral"
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animal || !client) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver l'animal ou le client associé.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty medications & attach stock_item_id when name matches a stock item
    const validMedications = medications
      .filter(med => med.medication_name.trim() !== "")
      .map(med => {
        const stockMatch = availableMedications.find(
          item => item.name.toLowerCase() === med.medication_name.trim().toLowerCase()
        );
        return {
          ...med,
          medication_name: med.medication_name.trim(),
          stock_item_id: stockMatch?.id,
          _unitPrice: stockMatch ? Number((stockMatch as any).selling_price || (stockMatch as any).unit_cost || 0) : 0,
        };
      });
    
    if (validMedications.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un médicament à la prescription.",
        variant: "destructive",
      });
      return;
    }

    // Prefer stock-linked meds when available in inventory
    const withoutStock = validMedications.filter((m) => !m.stock_item_id);
    if (withoutStock.length > 0 && availableMedications.length > 0) {
      toast({
        title: "Hors stock",
        description: `${withoutStock.map((m) => m.medication_name).join(", ")} non trouvé(s) en inventaire — prescrits sans décrément stock.`,
      });
    }

    const estimatedAmount = validMedications.reduce(
      (sum, m) => sum + (m._unitPrice || 0) * (m.quantity || 1),
      0
    );

    const prescriptionData: CreatePrescriptionData = {
      consultation_id: consultationId || null,
      visit_id: visitId || null,
      animal_id: animal.id,
      client_id: client.id,
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      valid_until: formData.validUntil || undefined,
      medications: validMedications.map(({ _unitPrice, ...med }) => med),
    };

    try {
      const created = await createPrescriptionMutation.mutateAsync(prescriptionData);

      toast({
        title: "Prescription créée",
        description: `Prescription créée avec succès pour ${animal.name}.`,
      });

      onCreated?.({ id: created.id, estimatedAmount });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        diagnosis: "",
        notes: "",
        validUntil: ""
      });
      
      setMedications([{
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        quantity: 1,
        route: "oral"
      }]);
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur est survenue lors de la création de la prescription.",
        variant: "destructive",
      });
    }
  };

  if (!animal || !client) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erreur</DialogTitle>
            <DialogDescription>
              Impossible de trouver l'animal ou le client associé.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Prescription</DialogTitle>
          <DialogDescription>
            Créer une nouvelle prescription pour {animal.name} ({client.first_name} {client.last_name})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnosis">Diagnostic</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Entrez le diagnostic..."
                className="h-20"
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valide jusqu'au (optionnel)</Label>
              <Input
                id="validUntil"
                name="validUntil" 
                type="date"
                value={formData.validUntil}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Medications */}
            <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Médicaments</Label>
              <Button type="button" onClick={addMedication} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médicament
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
              <h4 className="font-medium text-base text-gray-900 dark:text-gray-100">Médicament {index + 1}</h4>
              {medications.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeMedication(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
              <Label className="text-gray-700 dark:text-gray-300">Médicament *</Label>
              <ComboboxFreeText
                value={medication.medication_name}
                onChange={(val) => handleMedicationChange(index, 'medication_name', val)}
                options={availableMedications.map(i => i.name)}
                category="medication_name"
                placeholder="Sélectionner ou créer..."
              />
              {(() => {
                const m = availableMedications.find(i => i.name.toLowerCase() === medication.medication_name.trim().toLowerCase());
                return m ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {m.current_quantity} {m.unit} — déduit automatiquement
                  </p>
                ) : null;
              })()}
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Dosage</Label>
              <Input
                value={medication.dosage || ""}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                placeholder="ex: 5mg"
              />
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Fréquence</Label>
              <ComboboxFreeText
                value={medication.frequency || ""}
                onChange={(val) => handleMedicationChange(index, 'frequency', val)}
                options={DEFAULT_FREQUENCIES}
                category="frequency"
                placeholder="Sélectionner ou créer..."
              />
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Durée</Label>
              <Input
                value={medication.duration || ""}
                onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                placeholder="ex: 7 jours"
              />
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Quantité *</Label>
              <Input
                type="number"
                min="1"
                value={medication.quantity}
                onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
              />
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Voie d'administration</Label>
              <ComboboxFreeText
                value={medication.route || "oral"}
                onChange={(val) => handleMedicationChange(index, 'route', val)}
                options={DEFAULT_ROUTES}
                category="administration_route"
                placeholder="Sélectionner ou créer..."
              />
              </div>
              </div>

              <div>
              <Label className="text-gray-700 dark:text-gray-300">Instructions spéciales</Label>
              <Textarea
              value={medication.instructions || ""}
              onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
              placeholder="Instructions particulières pour ce médicament..."
              className="h-16"
              />
              </div>
              </div>
            ))}

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes générales</Label>
              <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes générales sur la prescription..."
              className="h-20"
              />
            </div>
            </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPrescriptionMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={createPrescriptionMutation.isPending}
            >
              {createPrescriptionMutation.isPending ? "Création..." : "Créer la prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
