import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAnimalSpecies, useVaccinationTypes } from '@/hooks/useAppSettings';
import { Plus, Shield } from 'lucide-react';
import { useCreateVaccinationProtocol, useUpdateVaccinationProtocol } from '@/hooks/useDatabase';
import type { VaccinationProtocol, BoosterScheduleEntry } from '@/lib/database';
import BoosterScheduleEditor from './BoosterScheduleEditor';

interface VaccinationProtocolModalProps {
  children?: React.ReactNode;
  mode: 'create' | 'edit';
  protocol?: VaccinationProtocol;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function VaccinationProtocolModal({ 
  children,
  mode,
  protocol,
  open,
  onOpenChange
}: VaccinationProtocolModalProps) {
  const createProtocolMutation = useCreateVaccinationProtocol();
  const updateProtocolMutation = useUpdateVaccinationProtocol();
  const { toast } = useToast();
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: vaccinationTypes = [], isLoading: typesLoading } = useVaccinationTypes();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = open !== undefined ? open : internalOpen;
  const setModalOpen = onOpenChange || setInternalOpen;

  // Form state
  const [formData, setFormData] = useState({
    species: protocol?.species || '',
    vaccineName: protocol?.vaccine_name || '',
    vaccineType: protocol?.vaccine_type || '',
    ageRecommendation: protocol?.age_recommendation || '',
    frequency: protocol?.frequency || '',
    durationDays: protocol?.duration_days?.toString() || '',
    notes: protocol?.notes || '',
    active: protocol?.active ?? true
  });
  const [boosterSchedule, setBoosterSchedule] = useState<BoosterScheduleEntry[]>(
    protocol?.booster_schedule && protocol.booster_schedule.length > 0
      ? protocol.booster_schedule
      : [{ label: '1ère dose', offset_days: 0 }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.species || !formData.vaccineName || !formData.vaccineType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const protocolData = {
        species: formData.species,
        vaccine_name: formData.vaccineName,
        vaccine_type: formData.vaccineType,
        age_recommendation: formData.ageRecommendation || undefined,
        frequency: formData.frequency || undefined,
        duration_days: formData.durationDays ? parseInt(formData.durationDays) : undefined,
        notes: formData.notes || undefined,
        active: formData.active,
        booster_schedule: boosterSchedule
          .filter(b => b.label.trim())
          .sort((a, b) => a.offset_days - b.offset_days)
      };

      if (mode === 'create') {
        await createProtocolMutation.mutateAsync(protocolData);
        toast({
          title: "Protocole créé",
          description: `Le protocole ${formData.vaccineName} a été créé avec succès`
        });
      } else if (protocol) {
        await updateProtocolMutation.mutateAsync({
          id: protocol.id,
          data: protocolData
        });
        toast({
          title: "Protocole modifié",
          description: `Le protocole ${formData.vaccineName} a été modifié avec succès`
        });
      }

      // Reset form only for create mode
      if (mode === 'create') {
        setFormData({
          species: '',
          vaccineName: '',
          vaccineType: '',
          ageRecommendation: '',
          frequency: '',
          durationDays: '',
          notes: '',
          active: true
        });
      }

      setModalOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${mode === 'create' ? 'créer' : 'modifier'} le protocole`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {mode === 'create' ? 'Nouveau Protocole' : 'Modifier'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === 'create' ? 'Nouveau Protocole Vaccinal' : 'Modifier le Protocole'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Species and Vaccine Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Espèce *</Label>
              <Select value={formData.species} onValueChange={(value) => setFormData({...formData, species: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez l'espèce" />
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
            <div className="space-y-2">
              <Label htmlFor="vaccineName">Nom du vaccin *</Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                placeholder="ex: DHPP, Rage, FVRCP..."
                required
              />
            </div>
          </div>

          {/* Vaccine Type and Age Recommendation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccineType">Type de vaccin *</Label>
              <Select value={formData.vaccineType} onValueChange={(value) => setFormData({...formData, vaccineType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  {vaccinationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageRecommendation">Âge recommandé</Label>
              <Input
                id="ageRecommendation"
                value={formData.ageRecommendation}
                onChange={(e) => setFormData({...formData, ageRecommendation: e.target.value})}
                placeholder="ex: 8 semaines, 3 mois..."
              />
            </div>
          </div>

          {/* Frequency and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                placeholder="ex: Annuelle, Tous les 3 ans..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Durée (jours)</Label>
              <Input
                id="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                placeholder="ex: 365, 1095..."
                min="1"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Informations complémentaires sur le protocole..."
              rows={3}
            />
          </div>

          {/* Booster Schedule */}
          <BoosterScheduleEditor
            value={boosterSchedule}
            onChange={setBoosterSchedule}
            description="Définissez chaque dose (1ère injection, rappels...) avec son décalage en jours depuis la 1ère dose."
          />


          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="active">Protocole actif</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createProtocolMutation.isPending || updateProtocolMutation.isPending}
            >
              {(createProtocolMutation.isPending || updateProtocolMutation.isPending) 
                ? (mode === 'create' ? 'Création...' : 'Modification...') 
                : (mode === 'create' ? 'Créer le protocole' : 'Modifier le protocole')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}