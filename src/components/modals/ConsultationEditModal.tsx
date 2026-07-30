import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, Consultation } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { temperatureInputValue, formatTemperatureValue } from "@/lib/utils";

interface ConsultationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export function ConsultationEditModal({ open, onOpenChange, consultation }: ConsultationEditModalProps) {
  const { clients, pets, updateConsultation } = useClients();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    clientId: 0,
    clientName: "",
    petId: 0,
    petName: "",
    date: "",
    weight: "",
    temperature: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    medications: "",
    followUp: "",
    cost: "",
    notes: ""
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = pets.filter(pet => pet.ownerId === formData.clientId);

  // Get today's date in YYYY-MM-DD format for default date
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'clientId') {
      const clientId = parseInt(value);
      const selectedClient = clients.find(c => c.id === clientId);
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient?.name || "",
        petId: 0,
        petName: ""
      }));
    } else if (field === 'petId') {
      const petId = parseInt(value);
      const selectedPet = pets.find(p => p.id === petId);
      setFormData(prev => ({
        ...prev,
        petId,
        petName: selectedPet?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultation) return;
    
    if (!formData.clientId || !formData.petId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et un animal.",
        variant: "destructive",
      });
      return;
    }
    
    // Update consultation
    updateConsultation(consultation.id, {
      clientId: formData.clientId,
      clientName: formData.clientName,
      petId: formData.petId,
      petName: formData.petName,
      date: formData.date || today,
      weight: formData.weight,
      temperature: formData.temperature
        ? formatTemperatureValue(formData.temperature) ?? formData.temperature
        : formData.temperature,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medications: formData.medications,
      followUp: formData.followUp,
      cost: formData.cost,
      notes: formData.notes
    });
    
    toast({
      title: "Consultation modifiée",
      description: `Consultation pour ${formData.petName} (${formData.clientName}) a été modifiée et sauvegardée.`,
    });
    
    onOpenChange(false);
  };

  // Reset form when modal opens with consultation data
  useEffect(() => {
    if (open && consultation) {
      setFormData({
        clientId: consultation.clientId,
        clientName: consultation.clientName,
        petId: consultation.petId,
        petName: consultation.petName,
        date: consultation.date,
        weight: consultation.weight || "",
        temperature: temperatureInputValue(consultation.temperature) || "",
        symptoms: consultation.symptoms || "",
        diagnosis: consultation.diagnosis || "",
        treatment: consultation.treatment || "",
        medications: consultation.medications || "",
        followUp: consultation.followUp || "",
        cost: consultation.cost || "",
        notes: consultation.notes || ""
      });
    }
  }, [open, consultation]);

  if (!consultation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la Consultation</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la consultation pour {consultation.petName}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select 
                value={formData.clientId.toString()} 
                onValueChange={(value) => handleSelectChange("clientId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Animal *</Label>
              <Select 
                value={formData.petId.toString()} 
                onValueChange={(value) => handleSelectChange("petId", value)}
                disabled={!formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.clientId ? "Sélectionner l'animal" : "Sélectionnez d'abord un client"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name} ({pet.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || today}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="ex: 25.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.01"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="ex: 38.50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptômes observés</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Décrivez les symptômes et observations..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Diagnostic posé..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatment">Traitement administré</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Traitements, injections, interventions..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medications">Médicaments prescrits</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={handleChange}
              placeholder="Liste des médicaments avec posologie..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUp">Suivi recommandé</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={handleChange}
                placeholder="ex: Contrôle dans 1 semaine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Coût ({settings.currency})</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                placeholder="ex: 85.50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes diverses, recommandations..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Modifier Consultation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
