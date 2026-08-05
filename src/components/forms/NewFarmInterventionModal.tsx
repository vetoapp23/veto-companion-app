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
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";

interface NewFarmInterventionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId?: number;
  farmName?: string;
}

const NewFarmInterventionModal = ({ open, onOpenChange, farmId, farmName }: NewFarmInterventionModalProps) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { addFarmIntervention, farms } = useClients();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    farmId: "",
    farmName: "",
    date: "",
    type: "" as FarmIntervention['type'],
    animals: "",
    veterinarian: "",
    description: "",
    status: "scheduled" as FarmIntervention['status'],
    followUp: "",
    cost: "",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        farmId: farmId?.toString() || "",
        farmName: farmName || "",
        date: today,
        type: "" as FarmIntervention['type'],
        animals: "",
        veterinarian: "",
        description: "",
        status: "scheduled" as FarmIntervention['status'],
        followUp: "",
        cost: "",
        notes: ""
      });
    }
  }, [open, farmId, farmName]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { settings } = useSettings();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.date || !formData.type || !formData.description) {
      toast({
        title: tc("error"),
        description: t("stock.fillRequired"),
        variant: "destructive"
      });
      return;
    }

    const selectedFarm = farms.find(f => f.id === parseInt(formData.farmId));
    if (!selectedFarm) {
      toast({
        title: tc("error"),
        description: t("farms.farmNotFound"),
        variant: "destructive"
      });
      return;
    }

    const newIntervention = {
      farmId: parseInt(formData.farmId),
      farmName: selectedFarm.name,
      date: formData.date,
      type: formData.type,
      animals: formData.animals,
      veterinarian: formData.veterinarian,
      description: formData.description,
      status: formData.status,
      followUp: formData.followUp,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes
    };

    addFarmIntervention(newIntervention);
    
    toast({
      title: tc("success"),
      description: t("farms.interventionScheduled")
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("farms.newIntervention")}</DialogTitle>
          <DialogDescription>
            {t("farms.scheduleIntervention")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmId">{t("farms.selectFarm")} *</Label>
              <Select value={formData.farmId} onValueChange={(value) => {
                const farm = farms.find(f => f.id === parseInt(value));
                handleChange("farmId", value);
                handleChange("farmName", farm?.name || "");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.selectFarm")} />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id.toString()}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t("farms.interventionType")}</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.selectType")} />
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
            
            <div className="space-y-2">
              <Label htmlFor="status">{tc("status")}</Label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animals">{t("farms.animalsConcerned")}</Label>
              <Input
                id="animals"
                value={formData.animals}
                onChange={(e) => handleChange("animals", e.target.value)}
                placeholder={t("farms.animalsPlaceholder")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="veterinarian">{tc("veterinarian")}</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => handleChange("veterinarian", e.target.value)}
                placeholder="Dr. Dupont"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{tc("description")} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("farms.interventionDescPlaceholder")}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">{t("farms.cost", { currency: settings.currency })}</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followUp">{t("farms.followUp")}</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={(e) => handleChange("followUp", e.target.value)}
                placeholder={t("farms.followUpPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("farms.notesComplementary")}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">
              {t("farms.scheduleInterventionBtn")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmInterventionModal;
