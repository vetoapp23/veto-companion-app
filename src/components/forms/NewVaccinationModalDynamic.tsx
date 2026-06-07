import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useVaccinationTypes } from '@/hooks/useAppSettings';
import { Plus, Syringe, CalendarClock, Trash2, Sparkles } from 'lucide-react';
import { format, addDays } from 'date-fns';
import {
  useAnimals,
  useClients,
  useCreateVaccination,
  useVaccinationProtocolsBySpecies,
} from '@/hooks/useDatabase';
import type { BoosterScheduleEntry, VaccinationProtocol } from '@/lib/database';
import { ComboboxFreeText } from '@/components/ui/combobox-freetext';

interface NewVaccinationModalProps {
  children?: React.ReactNode;
  selectedAnimalId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PlannedDose {
  label: string;
  date: string; // yyyy-MM-dd
}

export default function NewVaccinationModal({
  children,
  selectedAnimalId,
  open,
  onOpenChange,
}: NewVaccinationModalProps) {
  const { data: animals = [] } = useAnimals();
  const { data: clients = [] } = useClients();
  const createVaccinationMutation = useCreateVaccination();
  const { toast } = useToast();

  const { data: vaccinationTypes = [] } = useVaccinationTypes();

  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = open !== undefined ? open : internalOpen;
  const setModalOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    animalId: selectedAnimalId || '',
    vaccineName: '',
    vaccineType: '',
    manufacturer: '',
    batchNumber: '',
    vaccinationDate: format(new Date(), 'yyyy-MM-dd'),
    nextDueDate: '',
    administeredBy: '',
    notes: '',
  });

  const [plannedDoses, setPlannedDoses] = useState<PlannedDose[]>([]);
  const [appliedProtocolId, setAppliedProtocolId] = useState<string | null>(null);

  const selectedAnimal = animals.find(a => a.id === formData.animalId);
  const animalClient = selectedAnimal ? clients.find(c => c.id === selectedAnimal.client_id) : null;
  const { data: protocols = [] } = useVaccinationProtocolsBySpecies(selectedAnimal?.species || '');

  useEffect(() => {
    if (selectedAnimalId) {
      setFormData(prev => ({ ...prev, animalId: selectedAnimalId }));
    }
  }, [selectedAnimalId]);

  const buildPlanFromSchedule = (
    baseDate: string,
    schedule: BoosterScheduleEntry[],
  ): PlannedDose[] => {
    const sorted = [...schedule].sort((a, b) => a.offset_days - b.offset_days);
    return sorted.map(entry => ({
      label: entry.label,
      date: format(addDays(new Date(baseDate), entry.offset_days), 'yyyy-MM-dd'),
    }));
  };

  const applyProtocol = (protocol: VaccinationProtocol) => {
    const schedule = protocol.booster_schedule || [];
    setFormData(prev => ({
      ...prev,
      vaccineName: protocol.vaccine_name,
      vaccineType: protocol.vaccine_type,
    }));
    setAppliedProtocolId(protocol.id);
    if (schedule.length > 0) {
      const plan = buildPlanFromSchedule(formData.vaccinationDate, schedule);
      setPlannedDoses(plan);
      toast({
        title: 'Protocole appliqué',
        description: `${plan.length} dose(s) planifiée(s). Vous pouvez modifier les dates.`,
      });
    } else {
      setPlannedDoses([]);
      toast({
        title: 'Protocole appliqué',
        description: `Le protocole ${protocol.vaccine_name} a été appliqué.`,
      });
    }
  };

  // If user changes the base vaccination date, shift planned doses proportionally.
  useEffect(() => {
    if (plannedDoses.length === 0 || !appliedProtocolId) return;
    const protocol = protocols.find(p => p.id === appliedProtocolId);
    if (!protocol?.booster_schedule || protocol.booster_schedule.length === 0) return;
    setPlannedDoses(buildPlanFromSchedule(formData.vaccinationDate, protocol.booster_schedule));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.vaccinationDate]);

  const updateDoseDate = (index: number, date: string) =>
    setPlannedDoses(prev => prev.map((d, i) => (i === index ? { ...d, date } : d)));

  const removeDose = (index: number) =>
    setPlannedDoses(prev => prev.filter((_, i) => i !== index));

  const addManualDose = () => {
    setPlannedDoses(prev => {
      // If no plan yet, seed with the current vaccination date as 1ère dose
      if (prev.length === 0) {
        const first: PlannedDose = { label: '1ère dose', date: formData.vaccinationDate };
        const next: PlannedDose = {
          label: 'Rappel 1',
          date: format(addDays(new Date(formData.vaccinationDate), 28), 'yyyy-MM-dd'),
        };
        return [first, next];
      }
      const last = prev[prev.length - 1];
      const rappelNum = prev.filter(d => /rappel/i.test(d.label)).length + 1;
      return [
        ...prev,
        {
          label: `Rappel ${rappelNum}`,
          date: format(addDays(new Date(last.date), 28), 'yyyy-MM-dd'),
        },
      ];
    });
  };


  const resetForm = () => {
    setFormData({
      animalId: selectedAnimalId || '',
      vaccineName: '',
      vaccineType: '',
      manufacturer: '',
      batchNumber: '',
      vaccinationDate: format(new Date(), 'yyyy-MM-dd'),
      nextDueDate: '',
      administeredBy: '',
      notes: '',
    });
    setPlannedDoses([]);
    setAppliedProtocolId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.animalId) {
      toast({ title: 'Animal manquant', description: "Sélectionnez l'animal.", variant: 'destructive' });
      return;
    }
    if (!formData.vaccineName?.trim()) {
      toast({ title: 'Nom du vaccin manquant', description: 'Indiquez le nom du vaccin.', variant: 'destructive' });
      return;
    }
    if (!formData.vaccinationDate) {
      toast({ title: 'Date manquante', description: 'Indiquez la date.', variant: 'destructive' });
      return;
    }

    try {
      const basePayload = {
        animal_id: formData.animalId,
        vaccine_name: formData.vaccineName.trim(),
        vaccine_type: formData.vaccineType || undefined,
        manufacturer: formData.manufacturer?.trim() || undefined,
        batch_number: formData.batchNumber?.trim() || undefined,
        administered_by: formData.administeredBy?.trim() || undefined,
      };

      if (plannedDoses.length > 1) {
        // Multi-dose mode: create one row per planned dose, chaining next_due_date.
        const sorted = [...plannedDoses].sort((a, b) => a.date.localeCompare(b.date));
        for (let i = 0; i < sorted.length; i++) {
          const dose = sorted[i];
          const next = sorted[i + 1];
          await createVaccinationMutation.mutateAsync({
            ...basePayload,
            vaccination_date: dose.date,
            next_due_date: next ? next.date : undefined,
            notes: [dose.label, formData.notes?.trim()].filter(Boolean).join(' — ') || undefined,
          });
        }
        toast({
          title: '✓ Calendrier enregistré',
          description: `${sorted.length} doses planifiées pour ${selectedAnimal?.name || "l'animal"}.`,
        });
      } else {
        const singleDate = plannedDoses[0]?.date || formData.vaccinationDate;
        await createVaccinationMutation.mutateAsync({
          ...basePayload,
          vaccination_date: singleDate,
          next_due_date: formData.nextDueDate || undefined,
          notes: formData.notes?.trim() || undefined,
        });
        toast({
          title: '✓ Vaccination enregistrée',
          description: `Vaccination de ${selectedAnimal?.name || "l'animal"} ajoutée.`,
        });
      }

      resetForm();
      setModalOpen(false);
    } catch (error: any) {
      console.error('Error creating vaccination:', error);
      toast({
        title: "⚠ Impossible d'enregistrer",
        description: error?.message?.length < 200 ? error.message : "Une erreur s'est produite. Veuillez réessayer.",
        variant: 'destructive',
      });
    }
  };

  const hasMultiPlan = plannedDoses.length >= 1;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Vaccination
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Nouvelle Vaccination
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal Selection */}
          <div className="space-y-2">
            <Label htmlFor="animal">Animal *</Label>
            <Select
              value={formData.animalId}
              onValueChange={(value) => setFormData({ ...formData, animalId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => {
                  const client = clients.find((c) => c.id === animal.client_id);
                  return (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - {animal.species}{' '}
                      ({client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedAnimal && animalClient && (
              <p className="text-sm text-muted-foreground">
                Propriétaire: {animalClient.first_name} {animalClient.last_name}
              </p>
            )}
          </div>

          {/* Protocol suggestions */}
          {selectedAnimal && protocols.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Protocoles recommandés pour {selectedAnimal.species}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {protocols.map((protocol) => {
                  const doses = protocol.booster_schedule?.length || 0;
                  const isApplied = appliedProtocolId === protocol.id;
                  return (
                    <div
                      key={protocol.id}
                      className="flex items-center justify-between gap-2 p-2 border rounded"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{protocol.vaccine_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{protocol.vaccine_type}</span>
                          {doses > 0 && (
                            <Badge variant="secondary" className="h-5">
                              {doses} dose{doses > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {protocol.frequency && <span>· {protocol.frequency}</span>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant={isApplied ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyProtocol(protocol)}
                      >
                        {isApplied ? 'Appliqué' : 'Appliquer'}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Vaccine Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccineName">Nom du vaccin *</Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                placeholder="ex: DHPP, Rage, FVRCP..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccineType">Type de vaccin</Label>
              <ComboboxFreeText
                value={formData.vaccineType}
                onChange={(value) => setFormData({ ...formData, vaccineType: value })}
                options={vaccinationTypes}
                category="vaccine_type"
                placeholder="Sélectionnez ou tapez un type..."
                emptyText="Aucun type trouvé. Tapez pour en ajouter un."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="ex: Zoetis, Virbac..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Numéro de lot</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="Numéro de lot"
              />
            </div>
          </div>

          {/* Dates: simple mode vs multi-dose plan */}
          {plannedDoses.length === 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vaccinationDate">Date de vaccination *</Label>
                  <Input
                    id="vaccinationDate"
                    type="date"
                    value={formData.vaccinationDate}
                    onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Prochain rappel</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    min={formData.vaccinationDate}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={addManualDose}>
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Planifier plusieurs rappels
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Calendrier prévisionnel ({plannedDoses.length} dose{plannedDoses.length > 1 ? 's' : ''})
                  </span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={addManualDose}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un rappel
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPlannedDoses([]);
                        setAppliedProtocolId(null);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {appliedProtocolId
                    ? 'Dates idéales calculées selon le protocole. Modifiez librement, ajoutez ou supprimez des rappels.'
                    : 'Définissez chaque dose et sa date. Une vaccination sera enregistrée pour chaque ligne.'}
                </p>
                {plannedDoses.map((dose, i) => (
                  <div key={i} className="grid grid-cols-[1fr_160px_40px] gap-2 items-center">
                    <Input
                      value={dose.label}
                      onChange={(e) =>
                        setPlannedDoses((prev) =>
                          prev.map((d, idx) => (idx === i ? { ...d, label: e.target.value } : d)),
                        )
                      }
                    />
                    <Input
                      type="date"
                      value={dose.date}
                      onChange={(e) => updateDoseDate(i, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDose(i)}
                      aria-label="Supprimer cette dose"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createVaccinationMutation.isPending}>
              {createVaccinationMutation.isPending
                ? 'Enregistrement...'
                : hasMultiPlan
                ? `Enregistrer ${plannedDoses.length} doses`
                : 'Ajouter la vaccination'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
