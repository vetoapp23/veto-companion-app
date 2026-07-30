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
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreatePrescription, useStockItems } from "@/hooks/useDatabase";
import type { CreatePrescriptionData } from "@/lib/database";
import {
  PrescriptionMedicationsFields,
  emptyPrescriptionMed,
  buildPrescriptionMedPayload,
  type PrescriptionMedDraft,
} from "@/components/forms/PrescriptionMedicationsFields";

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
    validUntil: "",
  });

  const [medications, setMedications] = useState<PrescriptionMedDraft[]>([emptyPrescriptionMed()]);

  const animal = animals.find((a) => a.id === petId);
  const client = animal ? clients.find((c) => c.id === animal.client_id) : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    let validMedications: ReturnType<typeof buildPrescriptionMedPayload>;
    try {
      validMedications = buildPrescriptionMedPayload(medications, stockItems);
    } catch (error: any) {
      toast({
        title: "Stock insuffisant",
        description: error?.message || "Impossible de vendre ce médicament.",
        variant: "destructive",
      });
      return;
    }

    if (validMedications.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un médicament à la prescription.",
        variant: "destructive",
      });
      return;
    }

    const soldLines = validMedications.filter((m) => m.sold_by_clinic);
    const estimatedAmount = validMedications.reduce(
      (sum, m) => sum + (Number(m.unit_price) || 0) * (m.quantity || 1),
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
      medications: validMedications,
    };

    try {
      const created = await createPrescriptionMutation.mutateAsync(prescriptionData);

      toast({
        title: "Prescription créée",
        description:
          soldLines.length > 0
            ? `Ordonnance créée pour ${animal.name}. ${soldLines.length} médicament(s) déduit(s) du stock.`
            : `Ordonnance créée pour ${animal.name} (stock non modifié).`,
      });

      onCreated?.({ id: created.id, estimatedAmount });
      onOpenChange(false);

      setFormData({ diagnosis: "", notes: "", validUntil: "" });
      setMedications([emptyPrescriptionMed()]);
    } catch (error: any) {
      console.error("Error creating prescription:", error);
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

          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-lg font-semibold">Médicaments</Label>
            <PrescriptionMedicationsFields
              medications={medications}
              onChange={setMedications}
              stockItems={stockItems}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes générales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes générales sur la prescription..."
              className="h-20"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPrescriptionMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createPrescriptionMutation.isPending}>
              {createPrescriptionMutation.isPending ? "Création..." : "Créer la prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
