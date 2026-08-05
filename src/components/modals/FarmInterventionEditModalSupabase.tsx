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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface DatabaseFarmIntervention {
  id: string;
  farm_id: string;
  veterinarian_id: string | null;
  intervention_date: string;
  intervention_type: string;
  animal_count: number | null;
  description: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications_used: string[] | null;
  cost: number | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FarmInterventionEditModalSupabaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: DatabaseFarmIntervention | null;
}

interface SupabaseFarm {
  id: string;
  farm_name: string;
}

const FarmInterventionEditModalSupabase = ({ 
  open, 
  onOpenChange, 
  intervention 
}: FarmInterventionEditModalSupabaseProps) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [farms, setFarms] = useState<SupabaseFarm[]>([]);
  const [formData, setFormData] = useState({
    farm_id: "",
    intervention_date: "",
    intervention_type: "",
    animal_count: "",
    description: "",
    diagnosis: "",
    treatment: "",
    medications_used: [] as string[],
    cost: "",
    follow_up_date: "",
    notes: ""
  });
  const [medicationInput, setMedicationInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Intervention types
  const interventionTypes = [
    "vaccination",
    "traitement_preventif", 
    "traitement_curatif",
    "chirurgie",
    "diagnostic",
    "suivi_reproduction",
    "consultation_generale",
    "urgence",
    "autre"
  ];

  const interventionTypeLabels: Record<string, string> = {
    vaccination: t("farms.supabaseInterventionTypes.vaccination"),
    traitement_preventif: t("farms.supabaseInterventionTypes.traitement_preventif"),
    traitement_curatif: t("farms.supabaseInterventionTypes.traitement_curatif"),
    chirurgie: t("farms.supabaseInterventionTypes.chirurgie"),
    diagnostic: t("farms.supabaseInterventionTypes.diagnostic"),
    suivi_reproduction: t("farms.supabaseInterventionTypes.suivi_reproduction"),
    consultation_generale: t("farms.supabaseInterventionTypes.consultation_generale"),
    urgence: t("farms.supabaseInterventionTypes.urgence"),
    autre: t("farms.supabaseInterventionTypes.autre")
  };

  // Fetch farms when modal opens
  useEffect(() => {
    if (open && user) {
      fetchFarms();
    }
  }, [open, user]);

  // Populate form when intervention changes
  useEffect(() => {
    if (intervention) {
      setFormData({
        farm_id: intervention.farm_id,
        intervention_date: intervention.intervention_date,
        intervention_type: intervention.intervention_type,
        animal_count: intervention.animal_count?.toString() || "",
        description: intervention.description || "",
        diagnosis: intervention.diagnosis || "",
        treatment: intervention.treatment || "",
        medications_used: intervention.medications_used || [],
        cost: intervention.cost?.toString() || "",
        follow_up_date: intervention.follow_up_date || "",
        notes: intervention.notes || ""
      });
    } else {
      resetForm();
    }
  }, [intervention]);

  const fetchFarms = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, farm_name')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('farm_name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: tc("error"),
        description: t("farms.ui.loadFarmsError"),
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      farm_id: "",
      intervention_date: today,
      intervention_type: "",
      animal_count: "",
      description: "",
      diagnosis: "",
      treatment: "",
      medications_used: [],
      cost: "",
      follow_up_date: "",
      notes: ""
    });
    setMedicationInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !intervention) return;

    if (!formData.intervention_type) {
      toast({
        title: tc("error"),
        description: t("farms.ui.selectInterventionTypeError"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.intervention_date) {
      toast({
        title: tc("error"),
        description: t("farms.ui.selectInterventionDateError"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        intervention_date: formData.intervention_date,
        intervention_type: formData.intervention_type,
        animal_count: formData.animal_count ? parseInt(formData.animal_count) : null,
        description: formData.description || null,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        medications_used: formData.medications_used.length > 0 ? formData.medications_used : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('farm_interventions')
        .update(updateData)
        .eq('id', intervention.id);

      if (error) throw error;

      toast({
        title: tc("success"),
        description: t("farms.ui.interventionUpdatedSuccess"),
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating intervention:', error);
      toast({
        title: tc("error"),
        description: error.message || t("farms.ui.updateInterventionError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    if (medicationInput.trim() && !formData.medications_used.includes(medicationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        medications_used: [...prev.medications_used, medicationInput.trim()]
      }));
      setMedicationInput("");
    }
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      medications_used: prev.medications_used.filter(m => m !== medication)
    }));
  };

  const selectedFarm = farms.find(f => f.id === formData.farm_id);

  if (!intervention) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("farms.editIntervention")}</DialogTitle>
          <DialogDescription>
            {t("farms.ui.editInterventionDescGeneric")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm_id">{t("farms.selectFarm")}</Label>
              <Select 
                value={formData.farm_id} 
                onValueChange={(value) => handleChange('farm_id', value)}
                disabled // Usually don't allow changing farm for existing intervention
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.selectFarm")} />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.farm_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervention_date">{t("farms.ui.interventionDate")}</Label>
              <Input
                id="intervention_date"
                type="date"
                value={formData.intervention_date}
                onChange={(e) => handleChange('intervention_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intervention_type">{t("farms.interventionType")}</Label>
              <Select 
                value={formData.intervention_type} 
                onValueChange={(value) => handleChange('intervention_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("farms.ui.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {interventionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {interventionTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal_count">{t("farms.ui.animalCount")}</Label>
              <Input
                id="animal_count"
                type="number"
                value={formData.animal_count}
                onChange={(e) => handleChange('animal_count', e.target.value)}
                placeholder={t("farms.ui.animalsCountPlaceholder")}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{tc("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t("farms.interventionDescPlaceholder")}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">{t("farms.ui.diagnosis")}</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder={t("farms.ui.diagnosisPlaceholder")}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">{t("farms.ui.treatment")}</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              placeholder={t("farms.ui.treatmentPlaceholder")}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("farms.medicationsUsed")}</Label>
            <div className="flex gap-2">
              <Input
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                placeholder={t("farms.medicationNamePlaceholder")}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
              />
              <Button type="button" onClick={addMedication} variant="outline">
                {tc("add")}
              </Button>
            </div>
            {formData.medications_used.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medications_used.map((medication, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {medication}
                    <button
                      type="button"
                      onClick={() => removeMedication(medication)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">{t("farms.cost", { currency: "MAD" })}</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="follow_up_date">{t("farms.ui.followUpDate")}</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => handleChange('follow_up_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t("farms.notesComplementary")}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("farms.ui.updating") : t("farms.ui.saveChanges")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmInterventionEditModalSupabase;