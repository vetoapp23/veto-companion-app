import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useCreateAntiparasiticProtocol, useUpdateAntiparasiticProtocol } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { useAnimalSpecies, useParasiteTypes } from '@/hooks/useAppSettings';
import { Shield, Loader2 } from 'lucide-react';
import type { AntiparasiticProtocol, BoosterScheduleEntry } from '@/lib/database';
import BoosterScheduleEditor from './BoosterScheduleEditor';
import { ComboboxFreeText } from '@/components/ui/combobox-freetext';

const DEFAULT_ROUTES_ANTIPARASITIC = ['spot_on', 'oral', 'injection', 'spray', 'collier', 'shampoing'];

interface AntiparasiticProtocolModalDynamicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProtocol?: AntiparasiticProtocol;
}

export default function AntiparasiticProtocolModalDynamic({ 
  open, 
  onOpenChange, 
  editingProtocol 
}: AntiparasiticProtocolModalDynamicProps) {
  const createProtocol = useCreateAntiparasiticProtocol();
  const updateProtocol = useUpdateAntiparasiticProtocol();
  const { toast } = useToast();

  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: parasiteTypes = [], isLoading: typesLoading } = useParasiteTypes();

  const [formData, setFormData] = useState({
    species: '',
    parasiteType: '',
    productName: '',
    activeIngredient: '',
    administrationRoute: '',
    dosageRecommendation: '',
    frequencyDays: '',
    ageRecommendation: '',
    weightRange: '',
    seasonRecommendation: '',
    notes: '',
    active: true,
  });
  const [boosterSchedule, setBoosterSchedule] = useState<BoosterScheduleEntry[]>([
    { label: '1er traitement', offset_days: 0 },
  ]);

  // Pre-fill form for editing
  useEffect(() => {
    if (editingProtocol) {
      setFormData({
        species: editingProtocol.species,
        parasiteType: editingProtocol.parasite_type,
        productName: editingProtocol.product_name,
        activeIngredient: editingProtocol.active_ingredient || '',
        administrationRoute: editingProtocol.administration_route || '',
        dosageRecommendation: editingProtocol.dosage_per_kg || '',
        frequencyDays: '', // This field doesn't exist, so we'll leave it empty
        ageRecommendation: editingProtocol.age_restriction || '',
        weightRange: '', // This field doesn't exist in the protocol interface
        seasonRecommendation: '', // This field doesn't exist in the protocol interface
        notes: editingProtocol.notes || '',
        active: editingProtocol.active,
      });
      if (editingProtocol.booster_schedule && editingProtocol.booster_schedule.length > 0) {
        setBoosterSchedule(editingProtocol.booster_schedule);
      }
    }
  }, [editingProtocol]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      species: '',
      parasiteType: '',
      productName: '',
      activeIngredient: '',
      administrationRoute: '',
      dosageRecommendation: '',
      frequencyDays: '',
      ageRecommendation: '',
      weightRange: '',
      seasonRecommendation: '',
      notes: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.species || !formData.parasiteType || !formData.productName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const protocolData = {
        species: formData.species,
        parasite_type: formData.parasiteType,
        product_name: formData.productName,
        active_ingredient: formData.activeIngredient || undefined,
        administration_route: formData.administrationRoute || undefined,
        dosage_per_kg: formData.dosageRecommendation || undefined,
        frequency: formData.frequencyDays ? `${formData.frequencyDays} jours` : undefined,
        age_restriction: formData.ageRecommendation || undefined,
        notes: [
          formData.notes,
          formData.weightRange ? `Poids: ${formData.weightRange}` : '',
          formData.seasonRecommendation ? `Saison: ${formData.seasonRecommendation}` : ''
        ].filter(Boolean).join(' | ') || undefined,
        active: formData.active,
        booster_schedule: boosterSchedule
          .filter(b => b.label.trim())
          .sort((a, b) => a.offset_days - b.offset_days),
      };

      if (editingProtocol) {
        await updateProtocol.mutateAsync({
          id: editingProtocol.id,
          updates: protocolData
        });
        toast({
          title: "Succès",
          description: "Le protocole antiparasitaire a été modifié avec succès.",
        });
      } else {
        await createProtocol.mutateAsync(protocolData);
        toast({
          title: "Succès",
          description: "Le protocole antiparasitaire a été créé avec succès.",
        });
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du protocole:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createProtocol.isPending || updateProtocol.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {editingProtocol ? 'Modifier le protocole' : 'Nouveau protocole antiparasitaire'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="species">Espèce *</Label>
              <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une espèce" />
                </SelectTrigger>
                <SelectContent>
                  {animalSpecies.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parasite Type */}
            <div className="space-y-2">
              <Label htmlFor="parasiteType">Type de parasite *</Label>
              <ComboboxFreeText
                value={formData.parasiteType}
                onChange={(v) => handleInputChange('parasiteType', v)}
                options={parasiteTypes}
                category="parasite_type"
                placeholder="Sélectionner ou créer..."
              />
            </div>

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

            {/* Administration Route */}
            <div className="space-y-2">
              <Label htmlFor="administrationRoute">Voie d'administration</Label>
              <ComboboxFreeText
                value={formData.administrationRoute}
                onChange={(v) => handleInputChange('administrationRoute', v)}
                options={DEFAULT_ROUTES_ANTIPARASITIC}
                category="administration_route"
                placeholder="Sélectionner ou créer..."
              />
            </div>

            {/* Dosage Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="dosageRecommendation">Recommandation de dosage</Label>
              <Input
                id="dosageRecommendation"
                value={formData.dosageRecommendation}
                onChange={(e) => handleInputChange('dosageRecommendation', e.target.value)}
                placeholder="Ex: 1 pipette par 10-20kg..."
              />
            </div>

            {/* Frequency Days */}
            <div className="space-y-2">
              <Label htmlFor="frequencyDays">Fréquence (jours)</Label>
              <Input
                id="frequencyDays"
                type="number"
                value={formData.frequencyDays}
                onChange={(e) => handleInputChange('frequencyDays', e.target.value)}
                placeholder="Ex: 30, 90..."
              />
            </div>

            {/* Age Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="ageRecommendation">Recommandation d'âge</Label>
              <Input
                id="ageRecommendation"
                value={formData.ageRecommendation}
                onChange={(e) => handleInputChange('ageRecommendation', e.target.value)}
                placeholder="Ex: > 8 semaines, adulte..."
              />
            </div>

            {/* Weight Range */}
            <div className="space-y-2">
              <Label htmlFor="weightRange">Gamme de poids</Label>
              <Input
                id="weightRange"
                value={formData.weightRange}
                onChange={(e) => handleInputChange('weightRange', e.target.value)}
                placeholder="Ex: 10-20kg, < 5kg..."
              />
            </div>

            {/* Season Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="seasonRecommendation">Recommandation saisonnière</Label>
              <Select value={formData.seasonRecommendation} onValueChange={(value) => handleInputChange('seasonRecommendation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la saison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toute_annee">Toute l'année</SelectItem>
                  <SelectItem value="printemps_ete">Printemps-Été</SelectItem>
                  <SelectItem value="automne_hiver">Automne-Hiver</SelectItem>
                  <SelectItem value="printemps">Printemps</SelectItem>
                  <SelectItem value="ete">Été</SelectItem>
                  <SelectItem value="automne">Automne</SelectItem>
                  <SelectItem value="hiver">Hiver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informations supplémentaires, contre-indications..."
              rows={3}
            />
          </div>

          {/* Booster Schedule */}
          <BoosterScheduleEditor
            value={boosterSchedule}
            onChange={setBoosterSchedule}
            title="Calendrier des traitements"
            description="Listez chaque traitement (1er, rappels...) avec son décalage en jours depuis le 1er traitement."
          />


          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
            />
            <Label htmlFor="active">Protocole actif</Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProtocol ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}