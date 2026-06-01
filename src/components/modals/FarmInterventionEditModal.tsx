// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/contexts/ClientContext";
import { FarmIntervention } from "@/contexts/ClientContext";

interface FarmInterventionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: FarmIntervention | null;
}

const FarmInterventionEditModal = ({ open, onOpenChange, intervention }: FarmInterventionEditModalProps) => {
  const { updateFarmIntervention, farms } = useClients();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    farmId: "",
    type: "" as FarmIntervention['type'],
    date: "",
    animals: "",
    description: "",
    veterinarian: "",
    status: "scheduled" as FarmIntervention['status'],
    followUp: "",
    cost: ""
  });

  useEffect(() => {
    if (intervention && open) {
      setFormData({
        farmId: intervention.farmId.toString(),
        type: intervention.type,
        date: intervention.date,
        animals: intervention.animals,
        description: intervention.description,
        veterinarian: intervention.veterinarian,
        status: intervention.status,
        followUp: intervention.followUp || "",
        cost: intervention.cost || ""
      });
    }
  }, [intervention, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intervention) return;
    
    if (!formData.farmId || !formData.type || !formData.date || !formData.animals || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const updatedIntervention = {
      farmId: parseInt(formData.farmId),
      type: formData.type,
      date: formData.date,
      animals: formData.animals,
      description: formData.description,
      veterinarian: formData.veterinarian,
      status: formData.status,
      followUp: formData.followUp,
      cost: formData.cost
    };

    updateFarmIntervention(intervention.id, updatedIntervention);
    
    toast({
      title: "Succès",
      description: "Intervention mise à jour avec succès"
    });
    
    onOpenChange(false);
  };

  if (!intervention) return null;

  const selectedFarm = farms.find(f => f.id === parseInt(formData.farmId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'Intervention</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'intervention du {new Date(intervention.date).toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exploitation *</Label>
              <Select value={formData.farmId} onValueChange={(value) => handleChange("farmId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'exploitation" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map(farm => (
                    <SelectItem key={farm.id} value={farm.id.toString()}>
                      {farm.name} - {farm.owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type d'intervention *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="controle">Contrôle sanitaire</SelectItem>
                  <SelectItem value="urgence">Urgence</SelectItem>
                  <SelectItem value="chirurgie">Chirurgie</SelectItem>
                  <SelectItem value="prevention">Prévention</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programmé</SelectItem>
                  <SelectItem value="ongoing">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animals">Animaux concernés *</Label>
              <Input
                id="animals"
                value={formData.animals}
                onChange={(e) => handleChange("animals", e.target.value)}
                placeholder="ex: 50 vaches, 100 porcs..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Vétérinaire *</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => handleChange("veterinarian", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Détails de l'intervention, observations, traitements..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUp">Suivi recommandé</Label>
              <Textarea
                id="followUp"
                value={formData.followUp}
                onChange={(e) => handleChange("followUp", e.target.value)}
                rows={2}
                placeholder="Recommandations, prochain contrôle..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Coût (€)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {selectedFarm && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Informations de l'exploitation</h4>
              <div className="text-sm text-muted-foreground">
                <p><strong>Nom:</strong> {selectedFarm.name}</p>
                <p><strong>Propriétaire:</strong> {selectedFarm.owner}</p>
                <p><strong>Type:</strong> {selectedFarm.type}</p>
                <p><strong>Adresse:</strong> {selectedFarm.address}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmInterventionEditModal;
