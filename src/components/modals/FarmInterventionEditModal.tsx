// @ts-nocheck
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
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
        title: tc("error"),
        description: t("farms.ui.requiredFieldsError"),
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
      title: tc("success"),
      description: t("farms.ui.interventionUpdatedSuccess")
    });
    
    onOpenChange(false);
  };

  if (!intervention) return null;

  const selectedFarm = farms.find(f => f.id === parseInt(formData.farmId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("farms.editIntervention")}</DialogTitle>
          <DialogDescription>
            {t("farms.ui.editInterventionDesc", { date: new Date(intervention.date).toLocaleDateString() })}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("farms.ui.farmRequired")}</Label>
              <Select value={formData.farmId} onValueChange={(value) => handleChange("farmId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.ui.selectFarmPlaceholder")} />
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
              <Label>{t("farms.interventionType")}</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.ui.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">{t("farms.types.vaccination")}</SelectItem>
                  <SelectItem value="controle">{t("farms.types.controle")}</SelectItem>
                  <SelectItem value="urgence">{t("farms.types.urgence")}</SelectItem>
                  <SelectItem value="chirurgie">{t("farms.types.chirurgie")}</SelectItem>
                  <SelectItem value="prevention">{t("farms.types.prevention")}</SelectItem>
                  <SelectItem value="consultation">{t("farms.types.consultation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{tc("date")} *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{tc("status")}</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">{t("farms.status.scheduled")}</SelectItem>
                  <SelectItem value="ongoing">{t("farms.status.ongoing")}</SelectItem>
                  <SelectItem value="completed">{t("farms.status.completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("farms.status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animals">{t("farms.animalsConcerned")} *</Label>
              <Input
                id="animals"
                value={formData.animals}
                onChange={(e) => handleChange("animals", e.target.value)}
                placeholder={t("farms.animalsPlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarian">{t("farms.ui.veterinarian")} *</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => handleChange("veterinarian", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{tc("description")} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder={t("farms.ui.interventionDescPlaceholder")}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUp">{t("farms.ui.recommendedFollowUp")}</Label>
              <Textarea
                id="followUp"
                value={formData.followUp}
                onChange={(e) => handleChange("followUp", e.target.value)}
                rows={2}
                placeholder={t("farms.ui.followUpPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">{t("farms.cost", { currency: "€" })}</Label>
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
              <h4 className="font-medium mb-2">{t("farms.ui.farmInfoTitle")}</h4>
              <div className="text-sm text-muted-foreground">
                <p><strong>{t("farms.ui.farmInfoName")}</strong> {selectedFarm.name}</p>
                <p><strong>{t("farms.ui.farmInfoOwner")}</strong> {selectedFarm.owner}</p>
                <p><strong>{t("farms.ui.farmInfoType")}</strong> {selectedFarm.type}</p>
                <p><strong>{t("farms.ui.farmInfoAddress")}</strong> {selectedFarm.address}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">
              {t("farms.ui.saveChanges")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmInterventionEditModal;
