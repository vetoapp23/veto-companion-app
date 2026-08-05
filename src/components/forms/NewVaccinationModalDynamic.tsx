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
  useUpdateVaccination,
  useDeleteVaccination,
  useAppointments,
  useUpdateAppointment,
  useVaccinationProtocolsBySpecies,
} from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { appointmentKeys } from '@/hooks/useDatabase';
import type { Vaccination, VaccinationProtocol } from '@/lib/database';
import { ComboboxFreeText } from '@/components/ui/combobox-freetext';
import { Checkbox } from '@/components/ui/checkbox';
import {
  createReminderAppointments,
  resolveMaintenanceDueDate,
  ensureFutureReminders,
  buildPlanFromSchedule,
} from '@/lib/reminderAppointments';
import {
  buildVaccinationNotes,
  parseVaccinationNotes,
  findMatchingReminderAppointment,
} from '@/lib/vaccinationCertificate';
import { localDateTimeToISO } from '@/lib/dateLocal';
import { useTranslation } from 'react-i18next';

interface NewVaccinationModalProps {
  children?: React.ReactNode;
  selectedAnimalId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When set, modal opens in edit mode */
  editingVaccination?: Vaccination | null;
  /** Called after successful save with the administered vaccination id */
  onCreated?: (vaccination: { id: string }) => void;
  onUpdated?: (vaccination: { id: string }) => void;
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
  editingVaccination,
  onCreated,
  onUpdated,
}: NewVaccinationModalProps) {
  const { t } = useTranslation('medical');
  const { t: tc } = useTranslation('common');
  const { data: animals = [] } = useAnimals();
  const { data: clients = [] } = useClients();
  const createVaccinationMutation = useCreateVaccination();
  const updateVaccinationMutation = useUpdateVaccination();
  const deleteVaccinationMutation = useDeleteVaccination();
  const updateAppointmentMutation = useUpdateAppointment();
  const { data: appointments = [] } = useAppointments();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingVaccination?.id;

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
    doseLabel: t('boosterSchedule.firstDose'),
  });

  const [plannedDoses, setPlannedDoses] = useState<PlannedDose[]>([]);
  const [appliedProtocolId, setAppliedProtocolId] = useState<string | null>(null);
  /** Create only: must confirm before writing an administered vaccination row. */
  const [doseConfirmed, setDoseConfirmed] = useState(false);
  /** Edit only: Administré ↔ Planifié */
  const [editStatus, setEditStatus] = useState<'administered' | 'planned'>('administered');

  const selectedAnimal = animals.find(a => a.id === formData.animalId);
  const animalClient = selectedAnimal ? clients.find(c => c.id === selectedAnimal.client_id) : null;
  const { data: protocols = [], isLoading: protocolsLoading } = useVaccinationProtocolsBySpecies(
    selectedAnimal?.species || ''
  );
  const speciesMatched = useMemo(() => {
    if (!selectedAnimal?.species) return false;
    const key = selectedAnimal.species.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    return protocols.some((p) => {
      const pk = (p.species || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
      return pk === key || pk.includes(key) || key.includes(pk);
    });
  }, [protocols, selectedAnimal?.species]);

  useEffect(() => {
    if (selectedAnimalId && !editingVaccination) {
      setFormData(prev => ({ ...prev, animalId: selectedAnimalId }));
    }
  }, [selectedAnimalId, editingVaccination]);

  // Prefill when editing
  useEffect(() => {
    if (!modalOpen) return;
    if (editingVaccination) {
      const parsed = parseVaccinationNotes(editingVaccination.notes);
      setFormData({
        animalId: editingVaccination.animal_id,
        vaccineName: editingVaccination.vaccine_name || '',
        vaccineType: editingVaccination.vaccine_type || '',
        manufacturer: editingVaccination.manufacturer || '',
        batchNumber: editingVaccination.batch_number || '',
        vaccinationDate: (editingVaccination.vaccination_date || '').slice(0, 10),
        nextDueDate: editingVaccination.next_due_date
          ? editingVaccination.next_due_date.slice(0, 10)
          : '',
        administeredBy: editingVaccination.administered_by || '',
        notes: parsed.freeNotes || '',
        doseLabel: parsed.doseLabel || 'Dose',
      });
      setPlannedDoses([]);
      setAppliedProtocolId(null);
      setEditStatus('administered');
    }
  }, [modalOpen, editingVaccination]);

  const applyProtocol = (protocol: VaccinationProtocol) => {
    const schedule = protocol.booster_schedule || [];
    setFormData(prev => ({
      ...prev,
      vaccineName: protocol.vaccine_name,
      vaccineType: protocol.vaccine_type,
    }));
    setAppliedProtocolId(protocol.id);
    const base = formData.vaccinationDate;
    const fromSchedule =
      schedule.length > 0 ? buildPlanFromSchedule(base, schedule) : [{ label: t('boosterSchedule.firstDose'), date: base }];
    const plan = ensureFutureReminders(base, fromSchedule, protocol.duration_days);
    setPlannedDoses(plan);
    setDoseConfirmed(false);
    const futureCount = plan.filter((d) => d.date > base).length;
    toast({
      title: t('alerts.protocolApplied'),
      description:
        futureCount > 0
          ? t('alerts.protocolCalendarReady', { count: futureCount })
          : t('alerts.protocolAppliedConfirm', { name: protocol.vaccine_name }),
    });
  };

  // If user changes the base vaccination date, shift planned doses proportionally.
  useEffect(() => {
    if (plannedDoses.length === 0 || !appliedProtocolId) return;
    const protocol = protocols.find(p => p.id === appliedProtocolId);
    if (!protocol) return;
    const schedule = protocol.booster_schedule || [];
    const fromSchedule =
      schedule.length > 0
        ? buildPlanFromSchedule(formData.vaccinationDate, schedule)
        : [{ label: t('boosterSchedule.firstDose'), date: formData.vaccinationDate }];
    setPlannedDoses(
      ensureFutureReminders(formData.vaccinationDate, fromSchedule, protocol.duration_days)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.vaccinationDate]);

  // Auto-suggest protocol when vaccine type or name matches and none applied yet.
  useEffect(() => {
    if (appliedProtocolId || protocols.length === 0) return;
    const type = formData.vaccineType?.trim().toLowerCase();
    const name = formData.vaccineName?.trim().toLowerCase();
    if (!type && !name) return;
    const matches = protocols.filter(p => {
      const pt = p.vaccine_type?.toLowerCase() || '';
      const pn = p.vaccine_name?.toLowerCase() || '';
      return (type && pt === type) || (name && pn === name);
    });
    if (matches.length === 1 && (matches[0].booster_schedule?.length || 0) > 0) {
      applyProtocol(matches[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.vaccineType, formData.vaccineName, protocols]);

  const updateDoseDate = (index: number, date: string) =>
    setPlannedDoses(prev => prev.map((d, i) => (i === index ? { ...d, date } : d)));

  const removeDose = (index: number) =>
    setPlannedDoses(prev => prev.filter((_, i) => i !== index));

  const addManualDose = () => {
    setPlannedDoses(prev => {
      // If no plan yet, seed with the current vaccination date as 1ère dose
      if (prev.length === 0) {
        const first: PlannedDose = { label: t('boosterSchedule.firstDose'), date: formData.vaccinationDate };
        const next: PlannedDose = {
          label: t('boosterSchedule.boosterN', { n: 1 }),
          date: format(addDays(new Date(formData.vaccinationDate), 28), 'yyyy-MM-dd'),
        };
        return [first, next];
      }
      const last = prev[prev.length - 1];
      const rappelNum = prev.filter(d => /rappel|booster|refuerzo/i.test(d.label)).length + 1;
      return [
        ...prev,
        {
          label: t('boosterSchedule.boosterN', { n: rappelNum }),
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
      doseLabel: t('boosterSchedule.firstDose'),
    });
    setPlannedDoses([]);
    setAppliedProtocolId(null);
    setDoseConfirmed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.animalId) {
      toast({ title: t('alerts.missingAnimal'), description: t('alerts.selectAnimalShort'), variant: 'destructive' });
      return;
    }
    if (!formData.vaccineName?.trim()) {
      toast({ title: t('alerts.missingVaccineName'), description: t('alerts.enterVaccineName'), variant: 'destructive' });
      return;
    }
    if (!formData.vaccinationDate) {
      toast({ title: t('alerts.missingDate'), description: t('alerts.enterDate'), variant: 'destructive' });
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

      const administeredDate = formData.vaccinationDate;
      const protocol = appliedProtocolId
        ? protocols.find((p) => p.id === appliedProtocolId)
        : undefined;

      const nextFromPlan = plannedDoses
        .filter((d) => d.date > administeredDate)
        .sort((a, b) => a.date.localeCompare(b.date))[0]?.date;

      const nextDue =
        nextFromPlan ||
        formData.nextDueDate ||
        resolveMaintenanceDueDate(
          administeredDate,
          plannedDoses,
          protocol?.duration_days
        );

      // En édition: garder le libellé saisi (prérempli depuis l'existant).
      // En création: le protocole peut proposer un libellé pour la date du jour.
      const todayLabel = (
        isEditing
          ? formData.doseLabel
          : plannedDoses.find((d) => d.date === administeredDate)?.label ||
            plannedDoses[0]?.label ||
            formData.doseLabel
      )?.trim() || t('boosterSchedule.firstDose');

      const futurePlan = plannedDoses
        .filter((d) => d.date > administeredDate)
        .sort((a, b) => a.date.localeCompare(b.date));

      // --- Edit path ---
      if (isEditing && editingVaccination) {
        const notes = buildVaccinationNotes({
          doseLabel: todayLabel,
          plannedReminders: [],
          userNotes: formData.notes?.trim(),
        });

        // Convert administered → planned: reuse existing RDV if any, else create one
        if (editStatus === 'planned') {
          if (!animalClient?.id) {
            toast({
              title: t('alerts.clientNotFound'),
              description: t('alerts.cannotConvertWithoutOwner'),
              variant: 'destructive',
            });
            return;
          }

          const productName = formData.vaccineName.trim();
          const existingApt = findMatchingReminderAppointment(appointments, {
            animalId: formData.animalId,
            productName,
            date: administeredDate,
            kind: 'vaccination',
          });

          await deleteVaccinationMutation.mutateAsync(editingVaccination.id);

          if (existingApt) {
            await updateAppointmentMutation.mutateAsync({
              id: existingApt.id,
              data: {
                status: 'scheduled',
                appointment_date: localDateTimeToISO(administeredDate, '09:00'),
                // Conserve le libellé du formulaire (celui de la vaccination), pas celui du protocole
                notes: t('alerts.reminderVaccineNotes', { label: todayLabel, product: productName }),
              },
            });
          } else {
            await createReminderAppointments({
              clientId: animalClient.id,
              animalId: formData.animalId,
              administeredDate,
              plannedDoses: [{ label: todayLabel, date: administeredDate }],
              appointmentType: 'vaccination',
              titlePrefix: t('alerts.reminderVaccinePrefix'),
              productName,
              includeBaseDate: true,
            });
          }

          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.byAnimal(formData.animalId),
          });
          toast({
            title: t('alerts.statusToPlanned'),
            description: t('alerts.statusToPlannedBody', { name: productName }),
          });
          onUpdated?.({ id: editingVaccination.id });
          setModalOpen(false);
          return;
        }

        await updateVaccinationMutation.mutateAsync({
          id: editingVaccination.id,
          data: {
            ...basePayload,
            vaccination_date: administeredDate,
            next_due_date: nextDue || undefined,
            notes,
          },
        });
        toast({
          title: t('alerts.vaccinationUpdated'),
          description: t('alerts.vaccinationUpdatedBody', { name: formData.vaccineName.trim() }),
        });
        onUpdated?.({ id: editingVaccination.id });
        setModalOpen(false);
        return;
      }

      // --- Create: plan-only (no dose confirmed) ---
      if (!doseConfirmed) {
        const planForAppointments =
          plannedDoses.length > 0
            ? plannedDoses
            : nextDue
              ? [
                  { label: todayLabel, date: administeredDate },
                  { label: tc('reminder'), date: nextDue },
                ]
              : [];

        if (planForAppointments.filter((d) => d.date >= administeredDate).length === 0) {
          toast({
            title: t('alerts.confirmationRequired'),
            description: t('alerts.confirmDoseOrPlan'),
            variant: 'destructive',
          });
          return;
        }

        if (!animalClient?.id) {
          toast({
            title: t('alerts.clientNotFound'),
            description: t('alerts.cannotCreateRemindersWithoutOwner'),
            variant: 'destructive',
          });
          return;
        }

        const { created: n } = await createReminderAppointments({
          clientId: animalClient.id,
          animalId: formData.animalId,
          administeredDate,
          plannedDoses: planForAppointments,
          nextDueDate: nextDue,
          appointmentType: 'vaccination',
          titlePrefix: t('alerts.reminderVaccinePrefix'),
          productName: formData.vaccineName.trim(),
          includeBaseDate: true,
        });

        if (n > 0) {
          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.byAnimal(formData.animalId),
          });
        }

        toast({
          title: t('alerts.calendarScheduled'),
          description:
            n > 0
              ? t('alerts.appointmentsCreatedNoDose', { count: n })
              : t('alerts.noAppointmentsCreated'),
        });
        resetForm();
        setModalOpen(false);
        return;
      }

      // --- Create: dose confirmed (administered) ---
      const notes = buildVaccinationNotes({
        doseLabel: todayLabel,
        plannedReminders: futurePlan,
        userNotes: formData.notes?.trim(),
      });

      const created = await createVaccinationMutation.mutateAsync({
        ...basePayload,
        vaccination_date: administeredDate,
        next_due_date: nextDue || undefined,
        notes,
      });

      let reminderCount = 0;
      if (animalClient?.id) {
        const { created: n } = await createReminderAppointments({
          clientId: animalClient.id,
          animalId: formData.animalId,
          administeredDate,
          plannedDoses,
          nextDueDate: nextDue,
          appointmentType: "vaccination",
          titlePrefix: t('alerts.reminderVaccinePrefix'),
          productName: formData.vaccineName.trim(),
        });
        reminderCount = n;
        if (n > 0) {
          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.byAnimal(formData.animalId),
          });
        }
      }

      toast({
        title: t('alerts.vaccinationSaved'),
        description:
          reminderCount > 0
            ? t('alerts.dosePlusReminders', { count: reminderCount })
            : t('alerts.vaccinationAddedFor', { name: selectedAnimal?.name || t('forms.selectAnimal') }),
      });

      onCreated?.({ id: created.id });
      resetForm();
      setModalOpen(false);
    } catch (error: any) {
      console.error('Error saving vaccination:', error);
      toast({
        title: t('alerts.cannotSave'),
        description: error?.message?.length < 200 ? error.message : t('alerts.genericRetry'),
        variant: 'destructive',
      });
    }
  };

  const futureReminders = plannedDoses.filter((d) => d.date > formData.vaccinationDate);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {(children || open === undefined) && (
        <DialogTrigger asChild>
          {children || (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('forms.newVaccination')}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            {isEditing ? t('forms.editVaccination') : t('forms.newVaccination')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal Selection */}
          <div className="space-y-2">
            <Label htmlFor="animal">{tc('animal')} *</Label>
            <Select
              value={formData.animalId}
              onValueChange={(value) => setFormData({ ...formData, animalId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('forms.selectAnimal')} />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => {
                  const client = clients.find((c) => c.id === animal.client_id);
                  return (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - {animal.species}{' '}
                      ({client ? `${client.first_name} ${client.last_name}` : t('forms.unknownClient')})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedAnimal && animalClient && (
              <p className="text-sm text-muted-foreground">
                {t('forms.ownerLabel', { name: `${animalClient.first_name} ${animalClient.last_name}` })}
              </p>
            )}
          </div>

          {/* Protocol suggestions — create only */}
          {!isEditing && selectedAnimal && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('forms.vaccineProtocols')}
                  {selectedAnimal.species ? ` · ${selectedAnimal.species}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {protocolsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('forms.loadingProtocols')}</p>
                ) : protocols.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('protocolEmpty.noneRegisteredVax')}
                  </p>
                ) : (
                  <>
                    {!speciesMatched && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5">
                        {t('protocolEmpty.noneExactOtherSpecies', { name: selectedAnimal.species })}
                      </p>
                    )}
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
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="h-5 font-normal">
                                {protocol.species}
                              </Badge>
                              <span>{protocol.vaccine_type}</span>
                              {doses > 0 && (
                                <Badge variant="secondary" className="h-5">
                                  {t('protocolEmpty.dosesCount', { count: doses })}
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
                            {isApplied ? t('protocolEmpty.applied') : t('protocolEmpty.apply')}
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vaccine Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccineName">{t('forms.vaccineName')}</Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                placeholder={t('forms.vaccineNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccineType">{t('forms.vaccineType')}</Label>
              <ComboboxFreeText
                value={formData.vaccineType}
                onChange={(value) => setFormData({ ...formData, vaccineType: value })}
                options={vaccinationTypes}
                category="vaccine_type"
                placeholder={t('forms.vaccineTypePlaceholder')}
                emptyText={t('forms.noTypeFound')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">{t('forms.manufacturer')}</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder={t('forms.manufacturerPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">{t('forms.batchNumber')}</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder={t('forms.batchNumberPlaceholder')}
              />
            </div>
          </div>

          {/* Dates: simple mode vs multi-dose plan */}
          {plannedDoses.length === 0 || isEditing ? (
            <>
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="editStatus">{tc('status')}</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as 'administered' | 'planned')}
                  >
                    <SelectTrigger id="editStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administered">{t('forms.administered')}</SelectItem>
                      <SelectItem value="planned">{t('forms.planned')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {editStatus === 'planned' && (
                    <p className="text-xs text-muted-foreground">
                      La dose sera retirée de l’historique et convertie en RDV planifié.
                    </p>
                  )}
                </div>
              )}
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="doseLabel">{t('forms.doseLabel')}</Label>
                  <Input
                    id="doseLabel"
                    value={formData.doseLabel}
                    onChange={(e) => setFormData({ ...formData, doseLabel: e.target.value })}
                    placeholder={t('forms.doseLabelPlaceholder')}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vaccinationDate">{t('forms.vaccinationDate')}</Label>
                  <Input
                    id="vaccinationDate"
                    type="date"
                    value={formData.vaccinationDate}
                    onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">{t('forms.nextBooster')}</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    min={formData.vaccinationDate}
                  />
                </div>
              </div>
              {!isEditing && (
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addManualDose}>
                    <CalendarClock className="h-4 w-4 mr-1" />
                    Planifier plusieurs rappels
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Dose du jour + rappels
                    {futureReminders.length > 0
                      ? ` (${futureReminders.length} RDV)`
                      : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={addManualDose}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t('forms.addReminder')}
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
                      {tc('reset')}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('protocolEmpty.protocolCalendarHintExtended')}
                </p>
                <div className="space-y-1">
                  <Label className="text-xs">{t('forms.doseDateToday')}</Label>
                  <Input
                    type="date"
                    value={formData.vaccinationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, vaccinationDate: e.target.value })
                    }
                    required
                  />
                </div>
                {plannedDoses.map((dose, i) => {
                  const isToday = dose.date === formData.vaccinationDate;
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-[1fr_160px_40px] gap-2 items-center rounded-md px-1 py-0.5 ${
                        isToday ? 'bg-background/80' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isToday ? (
                          <Badge variant="secondary" className="shrink-0 h-5 font-normal">
                            {tc('today')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 h-5 font-normal">
                            {t('protocolEmpty.reminderBadge')}
                          </Badge>
                        )}
                        <Input
                          value={dose.label}
                          onChange={(e) =>
                            setPlannedDoses((prev) =>
                              prev.map((d, idx) =>
                                idx === i ? { ...d, label: e.target.value } : d,
                              ),
                            )
                          }
                        />
                      </div>
                      <Input
                        type="date"
                        value={dose.date}
                        onChange={(e) => updateDoseDate(i, e.target.value)}
                        min={isToday ? undefined : formData.vaccinationDate}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDose(i)}
                        aria-label={t('protocolEmpty.removeDoseAria')}
                        disabled={isToday && plannedDoses.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {futureReminders.length === 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('forms.noFutureReminders')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{tc('notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('forms.notesComplementary')}
              rows={3}
            />
          </div>

          {!isEditing && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={doseConfirmed}
                  onCheckedChange={(v) => setDoseConfirmed(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">
                  <strong>Je confirme</strong> que la dose «{' '}
                  {plannedDoses.find((d) => d.date === formData.vaccinationDate)?.label ||
                    formData.doseLabel ||
                    t('boosterSchedule.firstDose')}{' '}
                  » a été <strong>administrée</strong> le{' '}
                  {formData.vaccinationDate
                    ? format(new Date(formData.vaccinationDate + 'T12:00:00'), 'dd/MM/yyyy')
                    : '—'}
                  .
                </span>
              </label>
              {!doseConfirmed && (
                <p className="text-xs text-muted-foreground pl-7">
                  {t('forms.planUncheckedHintDose')}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                createVaccinationMutation.isPending ||
                updateVaccinationMutation.isPending ||
                deleteVaccinationMutation.isPending
              }
            >
              {createVaccinationMutation.isPending ||
              updateVaccinationMutation.isPending ||
              deleteVaccinationMutation.isPending
                ? tc('saving')
                : isEditing
                ? editStatus === 'planned'
                  ? t('forms.convertToPlanned')
                  : t('forms.saveChanges')
                : doseConfirmed
                ? futureReminders.length > 0
                  ? t('forms.saveDosePlusReminders', { count: futureReminders.length })
                  : t('forms.saveAdministeredDose')
                : futureReminders.length > 0 || plannedDoses.length > 0
                ? t('forms.scheduleApptsNoDose', {
                    count: Math.max(futureReminders.length, plannedDoses.length),
                  })
                : t('forms.scheduleOrSave')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
