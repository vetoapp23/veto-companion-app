// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface NewFarmInterventionModalSupabaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId?: string;
  farmName?: string;
}

interface SupabaseFarm {
  id: string;
  farm_name: string;
}

const NewFarmInterventionModalSupabase = ({ 
  open, 
  onOpenChange, 
  farmId, 
  farmName 
}: NewFarmInterventionModalSupabaseProps) => {
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
    vaccination: "Vaccination",
    traitement_preventif: "Traitement préventif",
    traitement_curatif: "Traitement curatif", 
    chirurgie: "Chirurgie",
    diagnostic: "Diagnostic",
    suivi_reproduction: "Suivi reproduction",
    consultation_generale: "Consultation générale",
    urgence: "Urgence",
    autre: "Autre"
  };

  // Fetch farms when modal opens
  useEffect(() => {
    if (open && user) {
      fetchFarms();
      resetForm();
    }
  }, [open, user]);

  // Pre-fill farm if farmId is provided
  useEffect(() => {
    if (farmId && farmName) {
      setFormData(prev => ({
        ...prev,
        farm_id: farmId
      }));
    }
  }, [farmId, farmName]);

  const fetchFarms = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('Profil utilisateur ou organisation introuvable');
      }

      const { data, error } = await supabase
        .from('farms')
        .select('id, farm_name')
        .eq('organization_id', profile.organization_id)
        .eq('active', true)
        .order('farm_name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les exploitations",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      farm_id: farmId || "",
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
    if (!user) return;

    if (!formData.farm_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une exploitation",
        variant: "destructive",
      });
      return;
    }

    if (!formData.intervention_type) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type d'intervention",
        variant: "destructive",
      });
      return;
    }

    if (!formData.intervention_date) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date d'intervention",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('Profil utilisateur ou organisation introuvable');
      }

      const insertData: any = {
        farm_id: formData.farm_id,
        organization_id: profile.organization_id,
        veterinarian_id: user.id, // Current user as veterinarian
        intervention_date: formData.intervention_date,
        intervention_type: formData.intervention_type,
        animal_count: formData.animal_count ? parseInt(formData.animal_count) : null,
        description: formData.description || null,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        medications_used: formData.medications_used.length > 0 ? formData.medications_used : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from('farm_interventions')
        .insert([insertData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Intervention créée avec succès",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating intervention:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'intervention",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
          <DialogDescription>
            Créer une nouvelle intervention vétérinaire
            {farmName && ` pour ${farmName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm_id">Exploitation *</Label>
              <Select 
                value={formData.farm_id} 
                onValueChange={(value) => handleChange('farm_id', value)}
                disabled={!!farmId} // Disable if farmId is pre-selected
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une exploitation" />
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
              <Label htmlFor="intervention_date">Date d'intervention *</Label>
              <Input
                id="intervention_date"
                type="date"
                value={formData.intervention_date}
                onChange={(e) => handleChange('intervention_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intervention_type">Type d'intervention *</Label>
              <Select 
                value={formData.intervention_type} 
                onValueChange={(value) => handleChange('intervention_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
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
              <Label htmlFor="animal_count">Nombre d'animaux</Label>
              <Input
                id="animal_count"
                type="number"
                value={formData.animal_count}
                onChange={(e) => handleChange('animal_count', e.target.value)}
                placeholder="Nombre d'animaux concernés"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de l'intervention..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="Diagnostic vétérinaire..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Traitement</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              placeholder="Traitement prescrit..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Médicaments utilisés</Label>
            <div className="flex gap-2">
              <Input
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                placeholder="Nom du médicament"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
              />
              <Button type="button" onClick={addMedication} variant="outline">
                Ajouter
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Coût (MAD)</Label>
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
              <Label htmlFor="follow_up_date">Date de suivi</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => handleChange('follow_up_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'intervention"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmInterventionModalSupabase;