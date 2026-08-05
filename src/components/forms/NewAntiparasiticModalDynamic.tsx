import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAnimals, useClients, useCreateAntiparasitic, useUpdateAntiparasitic, useDeleteAntiparasitic, useAppointments, useUpdateAppointment, useAntiparasiticProtocolsBySpecies, appointmentKeys } from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useParasiteTypes } from '@/hooks/useAppSettings';
import { format, addDays } from 'date-fns';
import { Plus, Package, CheckCircle, Search, AlertTriangle, Loader2, X, CalendarClock, Trash2, Sparkles } from 'lucide-react';
import type { Antiparasitic, CreateAntiparasiticData, BoosterScheduleEntry } from '@/lib/database';
import { ComboboxFreeText } from '@/components/ui/combobox-freetext';
import {
  createReminderAppointments,
  resolveMaintenanceDueDate,
  ensureFutureReminders,
  buildPlanFromSchedule,
} from '@/lib/reminderAppointments';
import {
  buildAntiparasiticNotes,
  parseAntiparasiticNotes,
  findMatchingReminderAppointment,
} from '@/lib/vaccinationCertificate';
import { localDateTimeToISO } from '@/lib/dateLocal';
import { useTranslation } from 'react-i18next';

const DEFAULT_ROUTES_ANTIPARASITIC = ['spot_on', 'oral', 'injection', 'spray', 'collier', 'shampoing'];

interface PlannedDose {
  label: string;
  date: string;
}

interface NewAntiparasiticModalDynamicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnimalId?: string;
  selectedClientId?: string;
  editingAntiparasitic?: Antiparasitic | null;
  onCreated?: (record: { id: string }) => void;
  onUpdated?: (record: { id: string }) => void;
}

export default function NewAntiparasiticModalDynamic({ 
  open, 
  onOpenChange, 
  selectedAnimalId, 
  selectedClientId,
  editingAntiparasitic,
  onCreated,
  onUpdated,
}: NewAntiparasiticModalDynamicProps) {
  const { t } = useTranslation('medical');
  const { t: tc } = useTranslation('common');
  const { data: animals } = useAnimals();
  const { data: clients } = useClients();
  const createAntiparasitic = useCreateAntiparasitic();
  const updateAntiparasitic = useUpdateAntiparasitic();
  const deleteAntiparasitic = useDeleteAntiparasitic();
  const updateAppointmentMutation = useUpdateAppointment();
  const { data: appointments = [] } = useAppointments();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingAntiparasitic?.id;

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
    doseLabel: t('forms.firstTreatmentLabel'),
  });

  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const { data: protocols = [], isLoading: protocolsLoading } = useAntiparasiticProtocolsBySpecies(
    selectedAnimal?.species
  );
  const [plannedDoses, setPlannedDoses] = useState<PlannedDose[]>([]);
  const [appliedProtocolId, setAppliedProtocolId] = useState<string | null>(null);
  const [doseConfirmed, setDoseConfirmed] = useState(false);
  const [editStatus, setEditStatus] = useState<'administered' | 'planned'>('administered');

  const speciesMatched = useMemo(() => {
    if (!selectedAnimal?.species) return false;
    const key = selectedAnimal.species.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    return protocols.some((p: any) => {
      const pk = (p.species || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
      return pk === key || pk.includes(key) || key.includes(pk);
    });
  }, [protocols, selectedAnimal?.species]);

  const futureReminders = plannedDoses.filter((d) => d.date > formData.treatmentDate);

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
    if (!open || !editingAntiparasitic) return;
    const parsed = parseAntiparasiticNotes(editingAntiparasitic.notes);
    const animal = animals?.find((a) => a.id === editingAntiparasitic.animal_id);
    setFormData({
      clientId: animal?.client_id || selectedClientId || '',
      animalId: editingAntiparasitic.animal_id,
      productName: editingAntiparasitic.product_name,
      activeIngredient: editingAntiparasitic.active_ingredient || '',
      parasiteType: editingAntiparasitic.parasite_type || '',
      administrationRoute: editingAntiparasitic.administration_route || '',
      dosage: editingAntiparasitic.dosage || '',
      treatmentDate: (editingAntiparasitic.treatment_date || '').slice(0, 10),
      nextTreatmentDate: editingAntiparasitic.next_treatment_date
        ? editingAntiparasitic.next_treatment_date.slice(0, 10)
        : '',
      administeredBy: editingAntiparasitic.administered_by || '',
      effectivenessRating: editingAntiparasitic.effectiveness_rating?.toString() || 'none',
      notes: parsed.freeNotes || '',
      doseLabel: parsed.doseLabel || t('forms.firstTreatmentLabel'),
    });
    setPlannedDoses([]);
    setAppliedProtocolId(null);
    setEditStatus('administered');
  }, [open, editingAntiparasitic, animals, selectedClientId]);

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
      dosage: protocol.dosage_per_kg || protocol.dosage_recommendation || '',
    }));
    setAppliedProtocolId(protocol.id);
    const schedule: BoosterScheduleEntry[] = protocol.booster_schedule || [];
    const base = formData.treatmentDate;
    const fromSchedule =
      schedule.length > 0
        ? buildPlanFromSchedule(base, schedule)
        : [{ label: t('forms.firstTreatmentLabel'), date: base }];
    const plan = ensureFutureReminders(base, fromSchedule, protocol.duration_days);
    setPlannedDoses(plan);
    setDoseConfirmed(false);
    const futureCount = plan.filter((d) => d.date > base).length;
    toast({
      title: t('alerts.protocolApplied'),
      description:
        futureCount > 0
          ? t('alerts.protocolTreatmentCalendarReady', { count: futureCount })
          : t('alerts.protocolAppliedConfirm', { name: protocol.product_name }),
    });
  };

  // Shift planned doses when base treatment date changes
  useEffect(() => {
    if (plannedDoses.length === 0 || !appliedProtocolId || !protocols) return;
    const protocol = protocols.find((p: any) => p.id === appliedProtocolId);
    if (!protocol) return;
    const schedule: BoosterScheduleEntry[] = protocol.booster_schedule || [];
    const base = formData.treatmentDate;
    const fromSchedule =
      schedule.length > 0
        ? buildPlanFromSchedule(base, schedule)
        : [{ label: t('forms.firstTreatmentLabel'), date: base }];
    setPlannedDoses(ensureFutureReminders(base, fromSchedule, protocol.duration_days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.treatmentDate]);

  const addManualDose = () => {
    setPlannedDoses((prev) => {
      if (prev.length === 0) {
        return [
          { label: t('forms.firstTreatmentLabel'), date: formData.treatmentDate },
          {
            label: t('boosterSchedule.boosterN', { n: 1 }),
            date: format(addDays(new Date(formData.treatmentDate), 28), 'yyyy-MM-dd'),
          },
        ];
      }
      const last = prev[prev.length - 1];
      const rappelNum = prev.filter((d) => /rappel|booster|refuerzo/i.test(d.label)).length + 1;
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
      doseLabel: t('forms.firstTreatmentLabel'),
    });
    setPlannedDoses([]);
    setAppliedProtocolId(null);
    setDoseConfirmed(false);
  };

  const buildBasePayload = () => {
    const base: any = {
      animal_id: formData.animalId,
      product_name: formData.productName,
    };
    if (formData.activeIngredient?.trim()) base.active_ingredient = formData.activeIngredient.trim();
    if (formData.parasiteType?.trim()) base.parasite_type = formData.parasiteType.trim();
    if (formData.administrationRoute?.trim()) base.administration_route = formData.administrationRoute.trim();
    if (formData.dosage?.trim()) base.dosage = formData.dosage.trim();
    if (formData.administeredBy?.trim()) base.administered_by = formData.administeredBy.trim();
    if (
      formData.effectivenessRating &&
      formData.effectivenessRating !== 'none' &&
      formData.effectivenessRating !== ''
    ) {
      const rating = parseInt(formData.effectivenessRating);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        base.effectiveness_rating = rating;
      }
    }
    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.animalId || !formData.productName || !formData.treatmentDate) {
      toast({
        title: tc('error'),
        description: t('alerts.fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    if (formData.effectivenessRating && formData.effectivenessRating !== 'none') {
      const rating = parseInt(formData.effectivenessRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        toast({
          title: tc('error'),
          description: t('alerts.effectivenessRatingInvalid'),
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      const base = buildBasePayload();
      const administeredDate = formData.treatmentDate;
      const protocol = appliedProtocolId
        ? protocols?.find((p: any) => p.id === appliedProtocolId)
        : undefined;

      const nextFromPlan = plannedDoses
        .filter((d) => d.date > administeredDate)
        .sort((a, b) => a.date.localeCompare(b.date))[0]?.date;

      const nextDue =
        nextFromPlan ||
        formData.nextTreatmentDate?.trim() ||
        resolveMaintenanceDueDate(
          administeredDate,
          plannedDoses,
          protocol?.duration_days
        );

      const todayLabel = (
        isEditing
          ? formData.doseLabel
          : plannedDoses.find((d) => d.date === administeredDate)?.label ||
            plannedDoses[0]?.label ||
            formData.doseLabel
      )?.trim() || t('forms.firstTreatmentLabel');

      const futurePlan = plannedDoses
        .filter((d) => d.date > administeredDate)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (isEditing && editingAntiparasitic) {
        const notes = buildAntiparasiticNotes({
          doseLabel: todayLabel,
          plannedReminders: [],
          userNotes: formData.notes?.trim(),
        });

        if (editStatus === 'planned') {
          const clientId =
            formData.clientId ||
            selectedClientId ||
            selectedAnimal?.client_id;
          if (!clientId) {
            toast({
              title: t('alerts.clientNotFound'),
              description: t('alerts.cannotConvertWithoutOwner'),
              variant: 'destructive',
            });
            return;
          }

          const productName = formData.productName.trim();
          const existingApt = findMatchingReminderAppointment(appointments, {
            animalId: formData.animalId,
            productName,
            date: administeredDate,
            kind: 'antiparasitic',
          });

          await deleteAntiparasitic.mutateAsync(editingAntiparasitic.id);

          if (existingApt) {
            await updateAppointmentMutation.mutateAsync({
              id: existingApt.id,
              data: {
                status: 'scheduled',
                appointment_date: localDateTimeToISO(administeredDate, '09:00'),
                notes: t('alerts.reminderAntiparasiticNotes', { label: todayLabel, product: productName }),
              },
            });
          } else {
            await createReminderAppointments({
              clientId,
              animalId: formData.animalId,
              administeredDate,
              plannedDoses: [{ label: todayLabel, date: administeredDate }],
              appointmentType: 'follow-up',
              titlePrefix: t('alerts.reminderAntiparasiticPrefix'),
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
          onUpdated?.({ id: editingAntiparasitic.id });
          onOpenChange(false);
          return;
        }

        await updateAntiparasitic.mutateAsync({
          id: editingAntiparasitic.id,
          updates: {
            ...base,
            treatment_date: administeredDate,
            next_treatment_date: nextDue || undefined,
            notes,
          } as Partial<CreateAntiparasiticData>,
        });
        toast({
          title: t('alerts.treatmentUpdated'),
          description: t('alerts.treatmentUpdatedBody', { name: formData.productName }),
        });
        onUpdated?.({ id: editingAntiparasitic.id });
        onOpenChange(false);
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
            description: t('alerts.confirmTreatmentOrPlan'),
            variant: 'destructive',
          });
          return;
        }

        const clientId = formData.clientId || selectedClientId;
        if (!clientId) {
          toast({
            title: t('alerts.clientNotFound'),
            description: t('alerts.cannotCreateRemindersWithoutOwner'),
            variant: 'destructive',
          });
          return;
        }

        const { created: n } = await createReminderAppointments({
          clientId,
          animalId: formData.animalId,
          administeredDate,
          plannedDoses: planForAppointments,
          nextDueDate: nextDue,
          appointmentType: 'follow-up',
          titlePrefix: t('alerts.reminderAntiparasiticPrefix'),
          productName: formData.productName.trim(),
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
              ? t('alerts.appointmentsCreatedNoTreatment', { count: n })
              : t('alerts.noAppointmentsCreated'),
        });
        resetForm();
        onOpenChange(false);
        return;
      }

      // --- Create: dose confirmed (administered) ---
      const notes = buildAntiparasiticNotes({
        doseLabel: todayLabel,
        plannedReminders: futurePlan,
        userNotes: formData.notes?.trim(),
      });

      const created = await createAntiparasitic.mutateAsync({
        ...base,
        treatment_date: administeredDate,
        next_treatment_date: nextDue || undefined,
        notes,
      } as CreateAntiparasiticData);

      const clientId = formData.clientId || selectedClientId;
      let reminderCount = 0;
      if (clientId) {
        const { created: n } = await createReminderAppointments({
          clientId,
          animalId: formData.animalId,
          administeredDate,
          plannedDoses,
          nextDueDate: nextDue,
          appointmentType: "follow-up",
          titlePrefix: t('alerts.reminderAntiparasiticPrefix'),
          productName: formData.productName,
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
        title: t('alerts.treatmentSaved'),
        description:
          reminderCount > 0
            ? t('alerts.treatmentPlusReminders', { count: reminderCount })
            : t('alerts.treatmentAddedFor', { name: selectedAnimal?.name || formData.productName }),
      });

      onCreated?.({ id: created.id });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: tc('error'),
        description: error?.message || t('alerts.cannotSaveTreatment'),
        variant: 'destructive',
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
            {editingAntiparasitic ? t('forms.editAntiparasitic') : t('forms.newAntiparasitic')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="clientId">{tc('client')} *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('forms.selectClient')} />
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
              <Label htmlFor="animalId">{tc('animal')} *</Label>
              <Select 
                value={formData.animalId} 
                onValueChange={(value) => handleInputChange('animalId', value)}
                disabled={!formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('forms.selectAnimal')} />
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
                <CardTitle className="text-sm">{t('forms.selectedAnimal')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">{tc('name')}:</span> {selectedAnimal.name}</div>
                  <div><span className="font-medium">{tc('species')}:</span> {selectedAnimal.species}</div>
                  <div><span className="font-medium">{tc('breed')}:</span> {selectedAnimal.breed || tc('notAvailable')}</div>
                  <div><span className="font-medium">{tc('weight')}:</span> {selectedAnimal.weight ? `${selectedAnimal.weight} kg` : tc('notAvailable')}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Protocol suggestions — create only */}
          {!isEditing && selectedAnimal && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('forms.antiparasiticProtocols')}
                  {selectedAnimal.species ? ` · ${selectedAnimal.species}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {protocolsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('forms.loadingProtocols')}</p>
                ) : protocols.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('protocolEmpty.noneRegisteredAnti')}
                  </p>
                ) : (
                  <>
                    {!speciesMatched && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5">
                        {t('protocolEmpty.noneExactOtherSpecies', { name: selectedAnimal.species })}
                      </p>
                    )}
                    {protocols.map((protocol: any) => {
                      const doses = protocol.booster_schedule?.length || 0;
                      const isApplied = appliedProtocolId === protocol.id;
                      return (
                        <div
                          key={protocol.id}
                          className="flex items-center justify-between gap-2 p-2 border rounded"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">{protocol.product_name}</div>
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="h-5 font-normal">
                                {protocol.species}
                              </Badge>
                              <span>
                                {protocol.parasite_type}
                                {protocol.active_ingredient
                                  ? ` - ${protocol.active_ingredient}`
                                  : ''}
                              </span>
                              {doses > 0 && (
                                <Badge variant="secondary" className="h-5">
                                  {t('protocolEmpty.dosesCount', { count: doses })}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant={isApplied ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => applyProtocol(protocol)}
                          >
                            {isApplied ? (
                              t('protocolEmpty.applied')
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                {t('protocolEmpty.apply')}
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">{t("forms.productName")}</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder={t("forms.productNamePlaceholder")}
                required
              />
            </div>

            {/* Active Ingredient */}
            <div className="space-y-2">
              <Label htmlFor="activeIngredient">{t("forms.activeIngredient")}</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient}
                onChange={(e) => handleInputChange('activeIngredient', e.target.value)}
                placeholder={t("forms.activeIngredientPlaceholder")}
              />
            </div>

            {/* Parasite Type */}
            <div className="space-y-2">
              <Label htmlFor="parasiteType">{t("forms.parasiteType")}</Label>
              <ComboboxFreeText
                value={formData.parasiteType}
                onChange={(v) => handleInputChange('parasiteType', v)}
                options={parasiteTypes}
                category="parasite_type"
                placeholder={t("forms.selectOrCreate")}
              />
            </div>

            {/* Administration Route */}
            <div className="space-y-2">
              <Label htmlFor="administrationRoute">{t('forms.administrationRoute')}</Label>
              <ComboboxFreeText
                value={formData.administrationRoute}
                onChange={(v) => handleInputChange('administrationRoute', v)}
                options={DEFAULT_ROUTES_ANTIPARASITIC}
                category="administration_route"
                placeholder={t("forms.selectOrCreate")}
              />
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">{t('forms.dosage')}</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder={t('forms.dosagePlaceholder')}
              />
            </div>

            {plannedDoses.length === 0 && (
              <>
                {isEditing && (
                  <div className="space-y-2 md:col-span-2">
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
                        Le traitement sera retiré de l’historique et converti en RDV planifié.
                      </p>
                    )}
                  </div>
                )}
                {isEditing && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="doseLabel">{t("forms.treatmentLabel")}</Label>
                    <Input
                      id="doseLabel"
                      value={formData.doseLabel}
                      onChange={(e) => handleInputChange('doseLabel', e.target.value)}
                      placeholder={t("forms.treatmentLabelPlaceholder")}
                    />
                  </div>
                )}
                {/* Treatment Date */}
                <div className="space-y-2">
                  <Label htmlFor="treatmentDate">{t("forms.treatmentDate")}</Label>
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
                  <Label htmlFor="nextTreatmentDate">{t("forms.nextTreatment")}</Label>
                  <Input
                    id="nextTreatmentDate"
                    type="date"
                    value={formData.nextTreatmentDate}
                    onChange={(e) => handleInputChange('nextTreatmentDate', e.target.value)}
                  />
                </div>
              </>
            )}
            {isEditing && plannedDoses.length > 0 && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="doseLabel2">{t("forms.treatmentLabel")}</Label>
                <Input
                  id="doseLabel2"
                  value={formData.doseLabel}
                  onChange={(e) => handleInputChange('doseLabel', e.target.value)}
                />
              </div>
            )}
          </div>

          {plannedDoses.length === 0 && !isEditing && (
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={addManualDose}>
                <CalendarClock className="h-4 w-4 mr-1" />
                Planifier plusieurs rappels
              </Button>
            </div>
          )}

          {/* Multi-dose calendar — create only */}
          {!isEditing && plannedDoses.length > 0 && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Traitement du jour + rappels
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
                  {t('protocolEmpty.treatmentCalendarHintExtended')}
                </p>
                <div className="space-y-1">
                  <Label className="text-xs">{t("forms.treatmentDateToday")}</Label>
                  <Input
                    type="date"
                    value={formData.treatmentDate}
                    onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
                  />
                </div>
                {plannedDoses.map((dose, i) => {
                  const isToday = dose.date === formData.treatmentDate;
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
                        onChange={(e) =>
                          setPlannedDoses((prev) =>
                            prev.map((d, idx) =>
                              idx === i ? { ...d, date: e.target.value } : d,
                            ),
                          )
                        }
                        min={isToday ? undefined : formData.treatmentDate}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setPlannedDoses((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        aria-label="Supprimer"
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


          {/* Effectiveness Rating */}
          <div className="space-y-2">
            <Label htmlFor="effectivenessRating">
              {t('forms.effectiveness')} ({tc('optional')})
              <span className="text-xs text-muted-foreground block">{t('protocolEmpty.efficacyHint')}</span>
            </Label>
            <Select 
              value={formData.effectivenessRating} 
              onValueChange={(value) => handleInputChange('effectivenessRating', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.selectEffectiveness")} />
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
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t("forms.observationsPlaceholder")}
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
                  <strong>Je confirme</strong> que le traitement «{' '}
                  {plannedDoses.find((d) => d.date === formData.treatmentDate)?.label ||
                    formData.doseLabel ||
                    t('forms.firstTreatmentLabel')}{' '}
                  » a été <strong>administré</strong> le{' '}
                  {formData.treatmentDate
                    ? format(new Date(formData.treatmentDate + 'T12:00:00'), 'dd/MM/yyyy')
                    : '—'}
                  .
                </span>
              </label>
              {!doseConfirmed && (
                <p className="text-xs text-muted-foreground pl-7">
                  {t('forms.planUncheckedHintTreatment')}
                </p>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                createAntiparasitic.isPending ||
                updateAntiparasitic.isPending ||
                deleteAntiparasitic.isPending
              }
            >
              {(createAntiparasitic.isPending ||
                updateAntiparasitic.isPending ||
                deleteAntiparasitic.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingAntiparasitic
                ? editStatus === 'planned'
                  ? t('forms.convertToPlanned')
                  : t('forms.saveChanges')
                : doseConfirmed
                ? futureReminders.length > 0
                  ? t('forms.saveTreatmentPlusReminders', { count: futureReminders.length })
                  : t('forms.saveAdministeredTreatment')
                : futureReminders.length > 0 || plannedDoses.length > 0
                ? t('forms.scheduleApptsNoTreatment', {
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