import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnimals, useClients, useCreateAntiparasitic, useAntiparasiticProtocolsBySpecies } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { useParasiteTypes } from '@/hooks/useAppSettings';
import { format, addDays } from 'date-fns';
import { Plus, Package, CheckCircle, Search, AlertTriangle, Loader2, X, CalendarClock, Trash2 } from 'lucide-react';
import type { CreateAntiparasiticData, BoosterScheduleEntry } from '@/lib/database';

interface PlannedDose {
  label: string;
  date: string;
}

interface NewAntiparasiticModalDynamicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnimalId?: string;
  selectedClientId?: string;
  editingAntiparasitic?: any; // For future edit functionality
}

export default function NewAntiparasiticModalDynamic({ 
  open, 
  onOpenChange, 
  selectedAnimalId, 
  selectedClientId,
  editingAntiparasitic 
}: NewAntiparasiticModalDynamicProps) {
  const { data: animals } = useAnimals();
  const { data: clients } = useClients();
  const createAntiparasitic = useCreateAntiparasitic();
  const { toast } = useToast();

  // Dynamic settings
  const { data: parasiteTypes = [], isLoading: typesLoading } = useParasiteTypes();

  const [formData, setFormData] = useState({
    clientId: selectedClientId || '',
    animalId: selectedAnimalId || '',
    productName: '',
    activeIngredient: '',
    parasiteType: '',
    administrationRoute: '',
    dosage: '',
    treatmentDate: format(new Date(), 'yyyy-MM-dd'),
    nextTreatmentDate: '',
    administeredBy: '',
    effectivenessRating: 'none',
    notes: '',
  });

  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const { data: protocols } = useAntiparasiticProtocolsBySpecies(selectedAnimal?.species);
  const [plannedDoses, setPlannedDoses] = useState<PlannedDose[]>([]);
  const [appliedProtocolId, setAppliedProtocolId] = useState<string | null>(null);

  const buildPlanFromSchedule = (baseDate: string, schedule: BoosterScheduleEntry[]): PlannedDose[] => {
    return [...schedule]
      .sort((a, b) => a.offset_days - b.offset_days)
      .map(entry => ({
        label: entry.label,
        date: format(addDays(new Date(baseDate), entry.offset_days), 'yyyy-MM-dd'),
      }));
  };

  // Update form when props change
  useEffect(() => {
    if (selectedClientId) {
      setFormData(prev => ({ ...prev, clientId: selectedClientId, animalId: '' }));
    }
    if (selectedAnimalId) {
      setFormData(prev => ({ ...prev, animalId: selectedAnimalId }));
    }
  }, [selectedClientId, selectedAnimalId]);

  // Update selected animal when animalId changes
  useEffect(() => {
    if (formData.animalId && animals) {
      const animal = animals.find(a => a.id === formData.animalId);
      setSelectedAnimal(animal);
      if (animal) {
        setFormData(prev => ({ ...prev, clientId: animal.client_id }));
      }
    }
  }, [formData.animalId, animals]);

  // Pre-fill form for editing
  useEffect(() => {
    if (editingAntiparasitic) {
      setFormData({
        clientId: editingAntiparasitic.animal?.client_id || '',
        animalId: editingAntiparasitic.animal_id,
        productName: editingAntiparasitic.product_name,
        activeIngredient: editingAntiparasitic.active_ingredient || '',
        parasiteType: editingAntiparasitic.parasite_type || '',
        administrationRoute: editingAntiparasitic.administration_route || '',
        dosage: editingAntiparasitic.dosage || '',
        treatmentDate: editingAntiparasitic.treatment_date,
        nextTreatmentDate: editingAntiparasitic.next_treatment_date || '',
        administeredBy: editingAntiparasitic.administered_by || '',
        effectivenessRating: editingAntiparasitic.effectiveness_rating?.toString() || 'none',
        notes: editingAntiparasitic.notes || '',
      });
    }
  }, [editingAntiparasitic]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyProtocol = (protocol: any) => {
    setFormData(prev => ({
      ...prev,
      productName: protocol.product_name,
      activeIngredient: protocol.active_ingredient || '',
      parasiteType: protocol.parasite_type,
      administrationRoute: protocol.administration_route || '',
      dosage: protocol.dosage_recommendation || '',
      nextTreatmentDate: protocol.frequency_days ? 
        format(addDays(new Date(prev.treatmentDate), protocol.frequency_days), 'yyyy-MM-dd') : 
        '',
    }));
    
    toast({
      title: "Protocole appliqué",
      description: `Le protocole ${protocol.product_name} a été appliqué.`,
    });
  };

  const resetForm = () => {
    setFormData({
      clientId: selectedClientId || '',
      animalId: selectedAnimalId || '',
      productName: '',
      activeIngredient: '',
      parasiteType: '',
      administrationRoute: '',
      dosage: '',
      treatmentDate: format(new Date(), 'yyyy-MM-dd'),
      nextTreatmentDate: '',
      administeredBy: '',
      effectivenessRating: 'none',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalId || !formData.productName || !formData.treatmentDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Validate effectiveness rating if provided
    if (formData.effectivenessRating && formData.effectivenessRating !== 'none') {
      const rating = parseInt(formData.effectivenessRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        toast({
          title: "Erreur",
          description: "L'évaluation d'efficacité doit être un nombre entre 1 et 5.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Build the base data object with only required fields first
      const antiparasiticData: any = {
        animal_id: formData.animalId,
        product_name: formData.productName,
        treatment_date: formData.treatmentDate,
      };

      // Add optional fields only if they have valid values
      if (formData.activeIngredient?.trim()) {
        antiparasiticData.active_ingredient = formData.activeIngredient.trim();
      }

      if (formData.parasiteType?.trim()) {
        antiparasiticData.parasite_type = formData.parasiteType.trim();
      }

      if (formData.administrationRoute?.trim()) {
        antiparasiticData.administration_route = formData.administrationRoute.trim();
      }

      if (formData.dosage?.trim()) {
        antiparasiticData.dosage = formData.dosage.trim();
      }

      if (formData.nextTreatmentDate?.trim()) {
        antiparasiticData.next_treatment_date = formData.nextTreatmentDate.trim();
      }

      if (formData.administeredBy?.trim()) {
        antiparasiticData.administered_by = formData.administeredBy.trim();
      }

      if (formData.notes?.trim()) {
        antiparasiticData.notes = formData.notes.trim();
      }

      // Only add effectiveness_rating if it's explicitly set to a valid number (1-5)
      if (formData.effectivenessRating && 
          formData.effectivenessRating !== 'none' && 
          formData.effectivenessRating !== '' && 
          formData.effectivenessRating !== 'undefined') {
        const rating = parseInt(formData.effectivenessRating);
        if (!isNaN(rating) && rating >= 1 && rating <= 5) {
          antiparasiticData.effectiveness_rating = rating;
        }
      }

      console.log('Submitting antiparasitic data:', antiparasiticData);
      console.log('Effectiveness rating value:', formData.effectivenessRating);
      console.log('Effectiveness rating type:', typeof formData.effectivenessRating);

      await createAntiparasitic.mutateAsync(antiparasiticData as CreateAntiparasiticData);
      
      toast({
        title: "Succès",
        description: "Le traitement antiparasitaire a été enregistré avec succès.",
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur lors de la création du traitement antiparasitaire:', error);
      
      let errorMessage = "Une erreur s'est produite lors de l'enregistrement.";
      
      // Handle specific error types
      if (error?.code === '23514') {
        errorMessage = "Les données saisies ne respectent pas les contraintes de validation. Vérifiez que l'évaluation d'efficacité est entre 1 et 10.";
      } else if (error?.code === '42501') {
        errorMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const availableAnimals = animals?.filter(animal => {
    if (formData.clientId) {
      return animal.client_id === formData.clientId;
    }
    return true;
  }) || [];

  const getClient = (clientId: string) => {
    return clients?.find(c => c.id === clientId);
  };

  const getAnimal = (animalId: string) => {
    return animals?.find(a => a.id === animalId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingAntiparasitic ? 'Modifier le traitement' : 'Nouveau traitement antiparasitaire'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Animal Selection */}
            <div className="space-y-2">
              <Label htmlFor="animalId">Animal *</Label>
              <Select 
                value={formData.animalId} 
                onValueChange={(value) => handleInputChange('animalId', value)}
                disabled={!formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un animal" />
                </SelectTrigger>
                <SelectContent>
                  {availableAnimals.map(animal => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show selected animal info */}
          {selectedAnimal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Animal sélectionné</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Nom:</span> {selectedAnimal.name}</div>
                  <div><span className="font-medium">Espèce:</span> {selectedAnimal.species}</div>
                  <div><span className="font-medium">Race:</span> {selectedAnimal.breed || 'N/A'}</div>
                  <div><span className="font-medium">Poids:</span> {selectedAnimal.weight ? `${selectedAnimal.weight} kg` : 'N/A'}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Protocol suggestions */}
          {protocols && protocols.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Protocoles recommandés pour {selectedAnimal?.species}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {protocols.map(protocol => (
                    <div key={protocol.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{protocol.product_name}</div>
                        <div className="text-sm text-gray-600">
                          {protocol.parasite_type} - {protocol.active_ingredient}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyProtocol(protocol)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Appliquer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">Nom du produit *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Ex: Frontline, Bravecto..."
                required
              />
            </div>

            {/* Active Ingredient */}
            <div className="space-y-2">
              <Label htmlFor="activeIngredient">Principe actif</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient}
                onChange={(e) => handleInputChange('activeIngredient', e.target.value)}
                placeholder="Ex: Fipronil, Fluralaner..."
              />
            </div>

            {/* Parasite Type */}
            <div className="space-y-2">
              <Label htmlFor="parasiteType">Type de parasite</Label>
              <Select value={formData.parasiteType} onValueChange={(value) => handleInputChange('parasiteType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {parasiteTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Administration Route */}
            <div className="space-y-2">
              <Label htmlFor="administrationRoute">Voie d'administration</Label>
              <Select value={formData.administrationRoute} onValueChange={(value) => handleInputChange('administrationRoute', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la voie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spot_on">Spot-on (pipette)</SelectItem>
                  <SelectItem value="oral">Orale (comprimé/liquide)</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="spray">Spray</SelectItem>
                  <SelectItem value="collier">Collier</SelectItem>
                  <SelectItem value="shampoing">Shampoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="Ex: 1 pipette, 1 comprimé..."
              />
            </div>

            {/* Treatment Date */}
            <div className="space-y-2">
              <Label htmlFor="treatmentDate">Date du traitement *</Label>
              <Input
                id="treatmentDate"
                type="date"
                value={formData.treatmentDate}
                onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
                required
              />
            </div>

            {/* Next Treatment Date */}
            <div className="space-y-2">
              <Label htmlFor="nextTreatmentDate">Prochain traitement</Label>
              <Input
                id="nextTreatmentDate"
                type="date"
                value={formData.nextTreatmentDate}
                onChange={(e) => handleInputChange('nextTreatmentDate', e.target.value)}
              />
            </div>

            {/* Administered By */}
            {/* <div className="space-y-2">
              <Label htmlFor="administeredBy">Administré par</Label>
              <Input
                id="administeredBy"
                value={formData.administeredBy}
                onChange={(e) => handleInputChange('administeredBy', e.target.value)}
                placeholder="Nom du vétérinaire"
              />
            </div> */}
          </div>

          {/* Effectiveness Rating */}
          <div className="space-y-2">
            <Label htmlFor="effectivenessRating">
              Efficacité du traitement (optionnel)
              <span className="text-xs text-muted-foreground block">Évaluez l'efficacité sur une échelle de 1 à 5</span>
            </Label>
            <Select 
              value={formData.effectivenessRating} 
              onValueChange={(value) => handleInputChange('effectivenessRating', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'efficacité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non évalué</SelectItem>
                {[...Array(5)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} - {i + 1 <= 2 ? 'Faible' : i + 1 <= 3 ? 'Moyenne' : i + 1 <= 4 ? 'Bonne' : 'Excellente'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observations, effets secondaires, etc."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createAntiparasitic.isPending}>
              {createAntiparasitic.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAntiparasitic ? 'Modifier' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}