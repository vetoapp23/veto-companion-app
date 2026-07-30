import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useUpdateConsultation, type Consultation } from "@/hooks/useDatabase";
import type { CreateConsultationData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { roundTemperature, temperatureInputValue } from "@/lib/utils";

interface ConsultationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export function ConsultationEditModalNew({ open, onOpenChange, consultation }: ConsultationEditModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const updateConsultationMutation = useUpdateConsultation();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    client_id: "",
    animal_id: "",
    consultation_date: "",
    consultation_type: "routine",
    weight: "",
    temperature: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    follow_up_date: "",
    follow_up_notes: "",
    status: "completed"
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = animals.filter(animal => animal.client_id === formData.client_id);

  useEffect(() => {
    if (consultation && open) {
      setFormData({
        client_id: consultation.client_id || "",
        animal_id: consultation.animal_id || "",
        consultation_date: consultation.consultation_date ? consultation.consultation_date.split('T')[0] : "",
        consultation_type: consultation.consultation_type || "routine",
        weight: consultation.weight?.toString() || "",
        temperature: temperatureInputValue(consultation.temperature) || "",
        symptoms: consultation.symptoms || "",
        diagnosis: consultation.diagnosis || "",
        treatment: consultation.treatment || "",
        notes: consultation.notes || "",
        follow_up_date: consultation.follow_up_date || "",
        follow_up_notes: consultation.follow_up_notes || "",
        status: consultation.status || "completed"
      });
    }
  }, [consultation, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When client changes, reset animal selection
    if (field === 'client_id') {
      setFormData(prev => ({
        ...prev,
        animal_id: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultation) {
      toast({
        title: "Erreur",
        description: "Aucune consultation sélectionnée pour modification.",
        variant: "destructive",
      });
      return;
    }

    // Comprehensive form validation
    const validationErrors: string[] = [];
    
    // Validate numeric fields
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 999.9) {
        validationErrors.push("Le poids doit être un nombre valide entre 0.1 et 999.9 kg");
      }
    }
    
    if (formData.temperature) {
      const temperature = parseFloat(formData.temperature);
      if (isNaN(temperature) || temperature < 30 || temperature > 50) {
        validationErrors.push("La température doit être un nombre valide entre 30°C et 50°C");
      }
    }
    
    // Validate text field lengths
    if (formData.symptoms && formData.symptoms.length > 1000) {
      validationErrors.push("Les symptômes ne peuvent pas dépasser 1000 caractères");
    }
    
    if (formData.diagnosis && formData.diagnosis.length > 1000) {
      validationErrors.push("Le diagnostic ne peut pas dépasser 1000 caractères");
    }
    
    if (formData.treatment && formData.treatment.length > 1000) {
      validationErrors.push("Le traitement ne peut pas dépasser 1000 caractères");
    }
    
    if (formData.notes && formData.notes.length > 2000) {
      validationErrors.push("Les notes ne peuvent pas dépasser 2000 caractères");
    }
    
    if (formData.follow_up_notes && formData.follow_up_notes.length > 500) {
      validationErrors.push("Les notes de suivi ne peuvent pas dépasser 500 caractères");
    }
    
    // Validate follow-up date if provided
    if (formData.follow_up_date) {
      const followUpDate = new Date(formData.follow_up_date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (followUpDate > oneYearFromNow) {
        validationErrors.push("La date de suivi ne peut pas être plus d'un an dans le futur");
      }
      
      const consultationDate = new Date(consultation.consultation_date);
      if (followUpDate < consultationDate) {
        validationErrors.push("La date de suivi ne peut pas être antérieure à la date de consultation");
      }
    }
    
    // Validate status
    const validStatuses = ["scheduled", "in-progress", "completed", "cancelled"];
    if (formData.status && !validStatuses.includes(formData.status)) {
      validationErrors.push("Le statut sélectionné n'est pas valide");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: validationErrors.join(". "),
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: Partial<CreateConsultationData> = {
        // Note: client_id and animal_id are not included as they are read-only in edit mode
        consultation_type: formData.consultation_type,
        symptoms: formData.symptoms?.trim() || undefined,
        diagnosis: formData.diagnosis?.trim() || undefined,
        treatment: formData.treatment?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        temperature: formData.temperature
          ? roundTemperature(parseFloat(formData.temperature)) ?? undefined
          : undefined,
        follow_up_date: formData.follow_up_date || null,
        follow_up_notes: formData.follow_up_notes?.trim() || undefined,
        status: formData.status as "scheduled" | "in-progress" | "completed" | "cancelled"
      };

      await updateConsultationMutation.mutateAsync({ 
        id: consultation.id, 
        data: updateData 
      });

      toast({
        title: "Consultation modifiée",
        description: "La consultation a été modifiée avec succès.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating consultation:', error);
      
      let errorMessage = "Une erreur est survenue lors de la modification de la consultation.";
      
      // Handle specific error types
      if (error?.message) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          errorMessage = "Cette consultation n'existe plus. Elle a peut-être été supprimée.";
        } else if (error.message.includes('foreign key constraint')) {
          errorMessage = "Erreur: Le client ou l'animal associé n'existe plus. Veuillez actualiser la page.";
        } else if (error.message.includes('network')) {
          errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour modifier cette consultation.";
        } else if (error.message.includes('version') || error.message.includes('conflict')) {
          errorMessage = "Cette consultation a été modifiée par un autre utilisateur. Veuillez actualiser et réessayer.";
        }
      }
      
      toast({
        title: "Erreur lors de la modification",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const selectedClient = clients.find(client => client.id === formData.client_id);
  const selectedAnimal = animals.find(animal => animal.id === formData.animal_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la consultation</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la consultation
          </DialogDescription>
        </DialogHeader>

        {!consultation ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Aucune consultation sélectionnée</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only consultation context */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Consultation pour:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Client:</span>{' '}
                <span className="font-medium">
                  {clients.find(c => c.id === formData.client_id)?.first_name} {clients.find(c => c.id === formData.client_id)?.last_name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Animal:</span>{' '}
                <span className="font-medium">
                  {availablePets.find(a => a.id === formData.animal_id)?.name} ({availablePets.find(a => a.id === formData.animal_id)?.species})
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consultation_date">Date de consultation</Label>
              <Input
                id="consultation_date"
                type="date"
                value={formData.consultation_date}
                onChange={handleChange}
                className="bg-muted/50"
                readOnly
                title="La date ne peut pas être modifiée"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_type">Type de consultation</Label>
              <Select value={formData.consultation_type} onValueChange={(value) => handleSelectChange('consultation_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                  <SelectItem value="follow-up">Suivi</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="surgery">Chirurgie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="999.9"
                placeholder="Ex: 25.5"
                value={formData.weight}
                onChange={handleChange}
                title="Poids en kilogrammes (0.1 à 999.9 kg)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.01"
                min="30"
                max="50"
                placeholder="Ex: 38.50"
                value={formData.temperature}
                onChange={handleChange}
                title="Température corporelle (30°C à 50°C)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptômes</Label>
            <Textarea
              id="symptoms"
              placeholder="Décrivez les symptômes observés..."
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title="Maximum 1000 caractères"
            />
            <div className="text-xs text-muted-foreground text-right">
              {(formData.symptoms || '').length}/1000 caractères
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnostic posé..."
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title="Maximum 1000 caractères"
            />
            <div className="text-xs text-muted-foreground text-right">
              {(formData.diagnosis || '').length}/1000 caractères
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Traitement</Label>
            <Textarea
              id="treatment"
              placeholder="Traitement prescrit..."
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              title="Maximum 1000 caractères"
            />
            <div className="text-xs text-muted-foreground text-right">
              {(formData.treatment || '').length}/1000 caractères
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Date de suivi</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={handleChange}
              title="Date recommandée pour le prochain suivi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_notes">Notes de suivi</Label>
            <Textarea
              id="follow_up_notes"
              placeholder="Notes pour le suivi..."
              value={formData.follow_up_notes}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              title="Maximum 500 caractères"
            />
            <div className="text-xs text-muted-foreground text-right">
              {(formData.follow_up_notes || '').length}/500 caractères
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplémentaires..."
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              maxLength={2000}
              title="Maximum 2000 caractères"
            />
            <div className="text-xs text-muted-foreground text-right">
              {(formData.notes || '').length}/2000 caractères
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateConsultationMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={updateConsultationMutation.isPending || !consultation}
            >
              {updateConsultationMutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}