// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDisplayPreference } from '@/hooks/use-display-preference';
import { useAnimalSpecies } from '@/hooks/useAppSettings';
import {
  useAntiparasitics,
  useAntiparasiticProtocols,
  useDeleteAntiparasitic,
  useCreateAntiparasitic,
  useUpdateAntiparasitic,
  useUpdateAppointment,
  useAppointments,
  useAnimals,
  useClients,
  appointmentKeys,
} from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bug,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Download,
  TrendingUp,
  Shield,
  Users,
  PawPrint,
  Package,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2,
  List,
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppPageHeader } from '@/components/AppPageHeader';
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from '@/components/ListDateFilter';
import { matchesListDateFilter, type ListDateFilterState } from '@/lib/dateLocal';
import NewAntiparasiticModal from '@/components/forms/NewAntiparasiticModalDynamic';
import AntiparasiticProtocolModal from '@/components/forms/AntiparasiticProtocolModalDynamic';
import CertificateAntiparasiticPrintDynamic from '@/components/CertificateAntiparasiticPrintDynamic';
import type { Antiparasitic, Appointment } from '@/lib/database';
import { syncRemindersAfterAdministered } from '@/lib/medicalDoseSync';
import { useWriteAccess } from '@/components/RoleGuard';
import { useTranslation } from 'react-i18next';
import { useAppLocale } from '@/i18n/useAppLocale';
import {
  buildAntiparasiticCertificateRows,
  buildAntiparasiticNotes,
  todayDayKey,
  type CertificateDoseRow,
} from '@/lib/vaccinationCertificate';

type DoseListStatus = 'administered' | 'planned' | 'overdue';

type UnifiedDoseRow = CertificateDoseRow & {
  rowKey: string;
  animalId: string;
  petName: string;
  clientName: string;
  species?: string;
  listStatus: DoseListStatus;
  treatmentRecord?: Antiparasitic;
};

function resolveListStatus(row: CertificateDoseRow): DoseListStatus {
  if (row.status === 'administered') return 'administered';
  const today = todayDayKey();
  if (row.date < today) return 'overdue';
  return 'planned';
}

const getStatusColor = (status: DoseListStatus) => {
  switch (status) {
    case 'administered': return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: DoseListStatus) => {
  switch (status) {
    case 'administered': return <CheckCircle className="h-4 w-4" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4" />;
    case 'planned': return <Clock className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export default function Antiparasites() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { dateFns } = useAppLocale();
  const getStatusLabel = (status: DoseListStatus) => t(`antiparasites.status.${status}`);
  const { currentView } = useDisplayPreference('antiparasitics');
  const { data: antiparasitics = [], isLoading: isLoadingAntiparasitics } = useAntiparasitics();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const { data: protocols = [], isLoading: isLoadingProtocols } = useAntiparasiticProtocols();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const deleteAntiparasitic = useDeleteAntiparasitic();
  const createAntiparasitic = useCreateAntiparasitic();
  const updateAntiparasitic = useUpdateAntiparasitic();
  const updateAppointmentMutation = useUpdateAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: animalSpecies = [] } = useAnimalSpecies();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_antiparasites");

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parasiteFilter, setParasiteFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const [showNewAntiparasitic, setShowNewAntiparasitic] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showAntiparasiticDetails, setShowAntiparasiticDetails] = useState(false);
  const [selectedDose, setSelectedDose] = useState<UnifiedDoseRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [antiparasiticToDelete, setAntiparasiticToDelete] = useState<Antiparasitic | null>(null);
  const [editingProtocol, setEditingProtocol] = useState<any>(null);
  const [editingAntiparasitic, setEditingAntiparasitic] = useState<Antiparasitic | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);

  const openEditAntiparasitic = (row: Antiparasitic) => {
    if (!guardWrite()) return;
    setEditingAntiparasitic(row);
    setEditOpen(true);
    setShowAntiparasiticDetails(false);
  };

  const unifiedDoses = useMemo((): UnifiedDoseRow[] => {
    if (isLoadingAntiparasitics || animalsLoading || clientsLoading || appointmentsLoading) {
      return [];
    }

    const byAnimal = new Map<string, Antiparasitic[]>();
    for (const t of antiparasitics) {
      const list = byAnimal.get(t.animal_id) || [];
      list.push(t);
      byAnimal.set(t.animal_id, list);
    }

    const reminderApts = appointments.filter(
      (a: Appointment) =>
        a.animal_id &&
        a.status !== 'cancelled' &&
        a.status !== 'no-show' &&
        (a.appointment_type === 'follow-up' || a.appointment_type === 'vaccination')
    );

    const aptsByAnimal = new Map<string, Appointment[]>();
    for (const a of reminderApts) {
      if (!a.animal_id) continue;
      const list = aptsByAnimal.get(a.animal_id) || [];
      list.push(a);
      aptsByAnimal.set(a.animal_id, list);
    }

    const animalIds = new Set([...byAnimal.keys(), ...aptsByAnimal.keys()]);
    const rows: UnifiedDoseRow[] = [];

    for (const animalId of animalIds) {
      const animal = animals.find((a) => a.id === animalId);
      const client = clients.find((c) => c.id === animal?.client_id);
      const petName = animal?.name || t("antiparasites.unknownPet");
      const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : t("antiparasites.unknownClient");

      const animalTreatments = byAnimal.get(animalId) || [];
      const animalApts = aptsByAnimal.get(animalId) || [];
      const doseRows = buildAntiparasiticCertificateRows(animalTreatments, animalApts);

      for (const row of doseRows) {
        const listStatus = resolveListStatus(row);
        const treatmentRecord = row.vaccinationId
          ? animalTreatments.find(
              (t) =>
                t.id === row.vaccinationId &&
                (t.treatment_date || '').slice(0, 10) === row.date
            )
          : undefined;

        rows.push({
          ...row,
          rowKey: `${row.source || 'x'}-${row.vaccinationId || row.appointmentId || row.date}-${row.doseLabel}-${row.vaccineName}`,
          animalId,
          petName,
          clientName,
          species: animal?.species,
          listStatus,
          treatmentRecord,
        });
      }
    }

    return rows.sort((a, b) => b.date.localeCompare(a.date) || a.petName.localeCompare(b.petName));
  }, [
    antiparasitics,
    appointments,
    animals,
    clients,
    isLoadingAntiparasitics,
    appointmentsLoading,
    animalsLoading,
    clientsLoading,
    t,
  ]);

  const stats = useMemo(() => {
    const total = unifiedDoses.length;
    const administered = unifiedDoses.filter((d) => d.listStatus === 'administered').length;
    const overdue = unifiedDoses.filter((d) => d.listStatus === 'overdue').length;
    const planned = unifiedDoses.filter((d) => d.listStatus === 'planned').length;
    const today = todayDayKey();
    const upcoming = unifiedDoses.filter((d) => {
      if (d.listStatus !== 'planned') return false;
      const limit = format(addDays(parseISO(today), 30), 'yyyy-MM-dd');
      return d.date >= today && d.date <= limit;
    }).length;

    const parasiteTypes = unifiedDoses.reduce((acc, dose) => {
      const type = dose.vaccineType || t("antiparasites.notSpecified");
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, administered, overdue, planned, upcoming, parasiteTypes };
  }, [unifiedDoses, t]);

  const filteredDoses = useMemo(() => {
    return unifiedDoses.filter((dose) => {
      const matchesSearch =
        dose.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dose.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dose.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        dose.listStatus === statusFilter ||
        (statusFilter === 'completed' && dose.listStatus === 'administered') ||
        (statusFilter === 'scheduled' && dose.listStatus === 'planned') ||
        (statusFilter === 'upcoming' && dose.listStatus === 'planned');

      const matchesParasite =
        parasiteFilter === 'all' || dose.vaccineType === parasiteFilter;

      const matchesSpecies =
        speciesFilter === 'all' || dose.species === speciesFilter;

      const matchesDate = matchesListDateFilter(dose.date, dateFilter);

      return matchesSearch && matchesStatus && matchesParasite && matchesSpecies && matchesDate;
    });
  }, [unifiedDoses, searchTerm, statusFilter, parasiteFilter, speciesFilter, dateFilter]);

  const handleDeleteAntiparasitic = (antiparasitic: Antiparasitic) => {
    if (!guardWrite()) return;
    setAntiparasiticToDelete(antiparasitic);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAntiparasitic = async () => {
    if (!guardWrite()) return;
    if (!antiparasiticToDelete) return;
    try {
      await deleteAntiparasitic.mutateAsync(antiparasiticToDelete.id);
      toast({
        title: t("antiparasites.deletedTitle"),
        description: t("antiparasites.deletedBody"),
      });
      setShowDeleteConfirm(false);
      setAntiparasiticToDelete(null);
    } catch {
      toast({
        title: tc("error"),
        description: t("antiparasites.cannotDelete"),
        variant: 'destructive',
      });
    }
  };

  const handleMarkDone = async (dose: UnifiedDoseRow) => {
    if (!guardWrite()) return;
    if (dose.listStatus === 'administered') return;
    setMarkingDoneId(dose.rowKey);
    try {
      const day = dose.date.slice(0, 10);
      const existing = antiparasitics.find(
        (t) =>
          t.animal_id === dose.animalId &&
          (t.treatment_date || '').slice(0, 10) === day &&
          (t.product_name || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim() ===
            dose.vaccineName.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim()
      );

      // Si un traitement existe déjà: ne pas toucher au libellé / notes.
      if (!existing) {
        const notes = buildAntiparasiticNotes({
          doseLabel: dose.doseLabel,
          plannedReminders: [],
          userNotes: t("antiparasites.markDoneNote"),
        });
        await createAntiparasitic.mutateAsync({
          animal_id: dose.animalId,
          product_name: dose.vaccineName,
          parasite_type: dose.vaccineType,
          treatment_date: day,
          notes,
        });
      }

      await syncRemindersAfterAdministered({
        appointments,
        animalId: dose.animalId,
        productName: dose.vaccineName,
        date: day,
        kind: 'antiparasitic',
        primaryAppointmentId: dose.appointmentId,
        updateFn: (id, data) =>
          updateAppointmentMutation.mutateAsync({ id, data }),
      });

      queryClient.invalidateQueries({ queryKey: ['antiparasitics'] });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      if (dose.animalId) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.byAnimal(dose.animalId),
        });
      }

      toast({
        title: t("antiparasites.treatmentAdministeredTitle"),
        description: t("antiparasites.treatmentAdministeredBody"),
      });
      setShowAntiparasiticDetails(false);
      setSelectedDose(null);
    } catch (e: any) {
      toast({
        title: t("antiparasites.cannotMarkDone"),
        description: e?.message || t("antiparasites.cannotMarkDoneBody"),
        variant: 'destructive',
      });
    } finally {
      setMarkingDoneId(null);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredDoses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `antiparasites-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const availableParasiteTypes = [...new Set(
    unifiedDoses.map((d) => d.vaccineType).filter(Boolean)
  )] as string[];

  const isLoading =
    isLoadingAntiparasitics || animalsLoading || clientsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("antiparasites.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <AppPageHeader
        icon={Bug}
        title={t("antiparasites.title")}
        description={t("antiparasites.description")}
        actions={
          <>
            {canWrite && (
            <Button
              onClick={() => {
                if (!guardWrite()) return;
                setShowProtocolModal(true);
              }}
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 rounded-full px-2.5 sm:px-3"
              aria-label={t("antiparasites.tabs.protocols")}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t("antiparasites.tabs.protocols")}</span>
            </Button>
            )}
            {canWrite && (
            <Button
              onClick={() => {
                if (!guardWrite()) return;
                setShowNewAntiparasitic(true);
              }}
              size="sm"
              className="gap-1 sm:gap-2 rounded-full"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t("antiparasites.new")}</span>
            </Button>
            )}
          </>
        }
      />

      <div className="app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("antiparasites.kpi.total")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("antiparasites.kpi.administered")}</p>
                <p className="text-2xl font-bold text-green-600">{stats.administered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("antiparasites.kpi.overdue")}</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("antiparasites.kpi.next30")}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t("antiparasites.kpi.planned")}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("antiparasites.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("antiparasites.filterStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("antiparasites.filters.allStatuses")}</SelectItem>
                  <SelectItem value="administered">{t("antiparasites.status.administered")}</SelectItem>
                  <SelectItem value="planned">{t("antiparasites.status.planned")}</SelectItem>
                  <SelectItem value="overdue">{t("antiparasites.status.overdue")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={parasiteFilter} onValueChange={setParasiteFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("antiparasites.filterParasite")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("antiparasites.filters.allParasites")}</SelectItem>
                  {availableParasiteTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("antiparasites.filterSpecies")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("antiparasites.filters.allSpecies")}</SelectItem>
                  {animalSpecies.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ListDateFilter
              value={dateFilter}
              onChange={setDateFilter}
              idPrefix="antiparasites-date"
              compact
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-none">
            <List className="h-4 w-4" />
            {t("antiparasites.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Shield className="h-4 w-4" />
            {t("antiparasites.tabs.protocols")}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2 flex-1 sm:flex-none">
            <TrendingUp className="h-4 w-4" />
            {t("antiparasites.statistics.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>{t("antiparasites.title")} ({filteredDoses.length})</span>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-1" />
                  {t("antiparasites.export")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDoses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("antiparasites.empty")}</p>
                </div>
              ) : currentView === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("antiparasites.columns.pet")}</TableHead>
                        <TableHead>{t("antiparasites.columns.product")}</TableHead>
                        <TableHead>{t("antiparasites.treatmentDetails.dosage")}</TableHead>
                        <TableHead>{t("antiparasites.columns.date")}</TableHead>
                        <TableHead>{t("antiparasites.columns.status")}</TableHead>
                        <TableHead>{t("antiparasites.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoses.map((dose) => (
                        <TableRow key={dose.rowKey}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  <PawPrint className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{dose.petName}</div>
                                <div className="text-sm text-gray-500">{dose.clientName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{dose.vaccineName}</div>
                            {dose.vaccineType && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {dose.vaccineType}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{dose.doseLabel}</TableCell>
                          <TableCell>{format(parseISO(dose.date), 'dd/MM/yyyy', { locale: dateFns })}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(dose.listStatus)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(dose.listStatus)}
                                {getStatusLabel(dose.listStatus)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDose(dose);
                                  setShowAntiparasiticDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canWrite && dose.listStatus !== 'administered' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={markingDoneId === dose.rowKey}
                                  onClick={() => handleMarkDone(dose)}
                                  title={t("antiparasites.markDone")}
                                >
                                  {markingDoneId === dose.rowKey ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                              )}
                              {canWrite && dose.treatmentRecord && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditAntiparasitic(dose.treatmentRecord!)}
                                    title={t("antiparasites.editTitle")}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAntiparasitic(dose.treatmentRecord!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDoses.map((dose) => (
                    <Card key={dose.rowKey} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <PawPrint className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-sm">{dose.petName}</h4>
                              <p className="text-xs text-gray-600">{dose.species} • {dose.clientName}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(dose.listStatus)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(dose.listStatus)}
                              {getStatusLabel(dose.listStatus)}
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{dose.vaccineName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{dose.doseLabel}</span>
                          </div>
                          {dose.vaccineType && (
                            <div><span className="font-medium">{t("antiparasites.parasiteLabel")}:</span> {dose.vaccineType}</div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(dose.date), 'dd/MM/yyyy', { locale: dateFns })}</span>
                          </div>
                          {dose.administeredBy && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{dose.administeredBy}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between mt-4 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedDose(dose);
                              setShowAntiparasiticDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {tc("details")}
                          </Button>
                          {canWrite && dose.listStatus !== 'administered' && (
                            <Button
                              size="sm"
                              disabled={markingDoneId === dose.rowKey}
                              onClick={() => handleMarkDone(dose)}
                              title={t("antiparasites.markDone")}
                            >
                              {markingDoneId === dose.rowKey ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {canWrite && dose.treatmentRecord && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditAntiparasitic(dose.treatmentRecord!)}
                                title={t("antiparasites.editTitle")}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAntiparasitic(dose.treatmentRecord!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>{t("antiparasites.protocolsTitle")} ({protocols.length})</span>
                {canWrite && (
                <Button
                  onClick={() => {
                    if (!guardWrite()) return;
                    setEditingProtocol(null);
                    setShowProtocolModal(true);
                  }}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  {t("antiparasites.createProtocol")}
                </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProtocols ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protocols.map((protocol) => (
                    <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{protocol.species}</Badge>
                          {canWrite && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!guardWrite()) return;
                              setEditingProtocol(protocol);
                              setShowProtocolModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                        <h4 className="font-medium mb-2">{protocol.product_name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div><span className="font-medium">{t("antiparasites.parasiteLabel")}:</span> {protocol.parasite_type}</div>
                          {protocol.active_ingredient && (
                            <div><span className="font-medium">{t("antiparasites.treatmentDetails.activeIngredient")}:</span> {protocol.active_ingredient}</div>
                          )}
                          {protocol.frequency && (
                            <div>{t("antiparasites.protocolMeta.frequency", { frequency: protocol.frequency })}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {protocols.length === 0 && !isLoadingProtocols && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("antiparasites.emptyProtocols")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t("antiparasites.statistics.byParasite")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.parasiteTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats.parasiteTypes).length === 0 && (
                    <p className="text-sm text-muted-foreground">{tc("noData")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("antiparasites.statistics.doseSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t("antiparasites.kpi.total")}</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("antiparasites.kpi.administered")}</span>
                    <span className="font-bold text-green-600">{stats.administered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("antiparasites.kpi.planned")}</span>
                    <span className="font-bold text-blue-600">{stats.planned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("antiparasites.kpi.overdue")}</span>
                    <span className="font-bold text-red-600">{stats.overdue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("antiparasites.kpi.next30")}</span>
                    <span className="font-bold text-orange-600">{stats.upcoming}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <NewAntiparasiticModal
        open={showNewAntiparasitic}
        onOpenChange={setShowNewAntiparasitic}
      />

      <NewAntiparasiticModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingAntiparasitic(null);
        }}
        editingAntiparasitic={editingAntiparasitic}
        onUpdated={() => {
          setEditingAntiparasitic(null);
          setEditOpen(false);
        }}
      />

      <AntiparasiticProtocolModal
        open={showProtocolModal}
        onOpenChange={setShowProtocolModal}
        editingProtocol={editingProtocol}
      />

      <Dialog open={showAntiparasiticDetails} onOpenChange={setShowAntiparasiticDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("antiparasites.treatmentDetails.title")}</DialogTitle>
          </DialogHeader>
          {selectedDose && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{t("antiparasites.columns.pet")}:</p>
                  <p>{selectedDose.petName}</p>
                </div>
                <div>
                  <p className="font-medium">{t("antiparasites.columns.client")}:</p>
                  <p>{selectedDose.clientName}</p>
                </div>
                <div>
                  <p className="font-medium">{t("antiparasites.treatmentDetails.product")}:</p>
                  <p>{selectedDose.vaccineName}</p>
                </div>
                <div>
                  <p className="font-medium">{t("antiparasites.treatmentDetails.dosage")}:</p>
                  <p>{selectedDose.doseLabel}</p>
                </div>
                <div>
                  <p className="font-medium">{t("antiparasites.treatmentDetails.date")}:</p>
                  <p>{format(parseISO(selectedDose.date), 'dd/MM/yyyy', { locale: dateFns })}</p>
                </div>
                <div>
                  <p className="font-medium">{t("antiparasites.columns.status")}:</p>
                  <Badge className={getStatusColor(selectedDose.listStatus)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedDose.listStatus)}
                      {getStatusLabel(selectedDose.listStatus)}
                    </div>
                  </Badge>
                </div>
                {selectedDose.vaccineType && (
                  <div>
                    <p className="font-medium">{t("antiparasites.parasiteLabel")}:</p>
                    <p>{selectedDose.vaccineType}</p>
                  </div>
                )}
                {selectedDose.administeredBy && (
                  <div>
                    <p className="font-medium">{t("antiparasites.status.administered")}:</p>
                    <p>{selectedDose.administeredBy}</p>
                  </div>
                )}
              </div>
              {selectedDose.notes && (
                <div>
                  <p className="font-medium">{t("antiparasites.treatmentDetails.notes")}:</p>
                  <p className="text-gray-600">{selectedDose.notes}</p>
                </div>
              )}
              <div className="border-t pt-4 flex flex-wrap gap-2 justify-center">
                {canWrite && selectedDose.listStatus !== 'administered' && (
                  <Button
                    disabled={markingDoneId === selectedDose.rowKey}
                    onClick={() => handleMarkDone(selectedDose)}
                  >
                    {markingDoneId === selectedDose.rowKey ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {t("antiparasites.markDone")}
                  </Button>
                )}
                {canWrite && selectedDose.treatmentRecord && (
                  <Button
                    variant="outline"
                    onClick={() => openEditAntiparasitic(selectedDose.treatmentRecord!)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {tc("edit")}
                  </Button>
                )}
                <CertificateAntiparasiticPrintDynamic animalId={selectedDose.animalId} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("antiparasites.deleteConfirmTitle")}</DialogTitle>
          </DialogHeader>
          {antiparasiticToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {t("antiparasites.deleteConfirmBody")}
              </p>
              <p className="text-sm text-red-600">{tc("cannotUndo")}</p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto">
                  {tc("cancel")}
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAntiparasitic} className="w-full sm:w-auto">
                  {t("antiparasites.deleteConfirmAction")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
