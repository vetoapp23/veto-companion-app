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
  useVaccinations,
  useVaccinationProtocols,
  useDeleteVaccination,
  useCreateVaccination,
  useUpdateVaccination,
  useUpdateAppointment,
  useAppointments,
  useAnimals,
  useClients,
  appointmentKeys,
} from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Syringe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Download,
  Grid3X3,
  List,
  TrendingUp,
  Shield,
  Users,
  PawPrint,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { format, isBefore, addDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAppLocale } from '@/i18n/useAppLocale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from '@/components/ListDateFilter';
import { matchesListDateFilter, type ListDateFilterState } from '@/lib/dateLocal';
import { AppPageHeader } from '@/components/AppPageHeader';
import NewVaccinationModal from '@/components/forms/NewVaccinationModalDynamic';
import VaccinationProtocolModal from '@/components/forms/VaccinationProtocolModalDynamic';
import CertificateVaccinationPrintDynamic from '@/components/CertificateVaccinationPrintDynamic';
import type { Vaccination, Appointment } from '@/lib/database';
import { syncRemindersAfterAdministered } from '@/lib/medicalDoseSync';
import {
  buildCertificateDoseRows,
  buildVaccinationNotes,
  todayDayKey,
  type CertificateDoseRow,
} from '@/lib/vaccinationCertificate';
import { useWriteAccess } from '@/components/RoleGuard';

type DoseListStatus = 'administered' | 'planned' | 'overdue';

type UnifiedDoseRow = CertificateDoseRow & {
  rowKey: string;
  animalId: string;
  petName: string;
  clientName: string;
  species?: string;
  listStatus: DoseListStatus;
  /** Original vaccination record when source is vaccination (for edit/delete) */
  vaccinationRecord?: Vaccination;
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

export default function Vaccinations() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { dateFns } = useAppLocale();
  const getStatusLabel = (status: DoseListStatus) => t(`vaccinations.status.${status}`);
  // Data fetching hooks
  const { data: vaccinations = [], isLoading: vaccinationsLoading } = useVaccinations();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: vaccinationProtocols = [] } = useVaccinationProtocols();
  
  // Mutation hooks
  const deleteVaccinationMutation = useDeleteVaccination();
  const createVaccinationMutation = useCreateVaccination();
  const updateVaccinationMutation = useUpdateVaccination();
  const updateAppointmentMutation = useUpdateAppointment();
  const queryClient = useQueryClient();
  
  const { toast } = useToast();
  const { currentView } = useDisplayPreference('vaccinations');
  const { canWrite, guardWrite } = useWriteAccess("can_manage_vaccinations");
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  
  // UI state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedDose, setSelectedDose] = useState<UnifiedDoseRow | null>(null);
  const [showVaccinationDetails, setShowVaccinationDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);

  const openEditVaccination = (vaccination: Vaccination) => {
    if (!guardWrite()) return;
    setEditingVaccination(vaccination);
    setEditOpen(true);
    setShowVaccinationDetails(false);
  };

  // Unified dose rows: administered vaccinations + planned RDV rappels
  const unifiedDoses = useMemo((): UnifiedDoseRow[] => {
    if (vaccinationsLoading || animalsLoading || clientsLoading || appointmentsLoading) {
      return [];
    }

    const byAnimal = new Map<string, Vaccination[]>();
    for (const v of vaccinations) {
      const list = byAnimal.get(v.animal_id) || [];
      list.push(v);
      byAnimal.set(v.animal_id, list);
    }

    const reminderApts = appointments.filter(
      (a: Appointment) =>
        a.animal_id &&
        a.status !== 'cancelled' &&
        a.status !== 'no-show' &&
        (a.appointment_type === 'vaccination' || a.appointment_type === 'follow-up')
    );

    const aptsByAnimal = new Map<string, Appointment[]>();
    for (const a of reminderApts) {
      if (!a.animal_id) continue;
      const list = aptsByAnimal.get(a.animal_id) || [];
      list.push(a);
      aptsByAnimal.set(a.animal_id, list);
    }

    const animalIds = new Set([
      ...byAnimal.keys(),
      ...aptsByAnimal.keys(),
    ]);

    const rows: UnifiedDoseRow[] = [];

    for (const animalId of animalIds) {
      const animal = animals.find((a) => a.id === animalId);
      const client = clients.find((c) => c.id === animal?.client_id);
      const petName = animal?.name || t("vaccinations.unknownPet");
      const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : t("vaccinations.unknownClient");

      const animalVax = byAnimal.get(animalId) || [];
      const animalApts = aptsByAnimal.get(animalId) || [];
      const doseRows = buildCertificateDoseRows(animalVax, animalApts);

      for (const row of doseRows) {
        const listStatus = resolveListStatus(row);
        const vaccinationRecord = row.vaccinationId
          ? animalVax.find(
              (v) =>
                v.id === row.vaccinationId &&
                (v.vaccination_date || '').slice(0, 10) === row.date
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
          vaccinationRecord,
        });
      }
    }

    return rows.sort((a, b) => b.date.localeCompare(a.date) || a.petName.localeCompare(b.petName));
  }, [
    vaccinations,
    appointments,
    animals,
    clients,
    vaccinationsLoading,
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

    return { total, administered, overdue, planned, upcoming };
  }, [unifiedDoses]);

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
        (statusFilter === 'scheduled' && dose.listStatus === 'planned');

      const matchesSpecies =
        speciesFilter === 'all' || dose.species === speciesFilter;

      const matchesDate = matchesListDateFilter(dose.date, dateFilter);

      return matchesSearch && matchesStatus && matchesSpecies && matchesDate;
    });
  }, [unifiedDoses, searchTerm, statusFilter, speciesFilter, dateFilter]);

  const handleDeleteVaccination = (vaccination: Vaccination) => {
    if (!guardWrite()) return;
    setVaccinationToDelete(vaccination);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteVaccination = () => {
    if (!guardWrite()) return;
    if (vaccinationToDelete) {
      deleteVaccinationMutation.mutate(vaccinationToDelete.id);
      toast({
        title: t("vaccinations.deletedTitle"),
        description: t("vaccinations.deletedBody"),
      });
      setShowDeleteConfirm(false);
      setVaccinationToDelete(null);
    }
  };

  const handleMarkDone = async (dose: UnifiedDoseRow) => {
    if (!guardWrite()) return;
    if (dose.listStatus === 'administered') return;
    setMarkingDoneId(dose.rowKey);
    try {
      const day = dose.date.slice(0, 10);
      const existingVax = vaccinations.find(
        (v) =>
          v.animal_id === dose.animalId &&
          (v.vaccination_date || '').slice(0, 10) === day &&
          (v.vaccine_name || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim() ===
            dose.vaccineName.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim()
      );

      // Si une vaccination existe déjà: ne pas toucher au libellé / notes.
      // Sinon: créer avec le libellé de la ligne planifiée telle quelle.
      if (!existingVax) {
        const notes = buildVaccinationNotes({
          doseLabel: dose.doseLabel,
          plannedReminders: [],
          userNotes: t("vaccinations.markDoneNote"),
        });
        await createVaccinationMutation.mutateAsync({
          animal_id: dose.animalId,
          vaccine_name: dose.vaccineName,
          vaccine_type: dose.vaccineType,
          vaccination_date: day,
          notes,
        });
      }

      await syncRemindersAfterAdministered({
        appointments,
        animalId: dose.animalId,
        productName: dose.vaccineName,
        date: day,
        kind: 'vaccination',
        primaryAppointmentId: dose.appointmentId,
        updateFn: (id, data) =>
          updateAppointmentMutation.mutateAsync({ id, data }),
      });

      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      if (dose.animalId) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.byAnimal(dose.animalId),
        });
      }

      toast({
        title: t("vaccinations.doseAdministeredTitle"),
        description: t("vaccinations.doseAdministeredBody"),
      });
      setShowVaccinationDetails(false);
      setSelectedDose(null);
    } catch (e: any) {
      toast({
        title: t("vaccinations.cannotMarkDone"),
        description: e?.message || t("vaccinations.cannotMarkDoneBody"),
        variant: 'destructive',
      });
    } finally {
      setMarkingDoneId(null);
    }
  };

  const exportVaccinationData = () => {
    const dataStr = JSON.stringify(filteredDoses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaccinations-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLoading =
    vaccinationsLoading || animalsLoading || clientsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>{t("vaccinations.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <AppPageHeader
        icon={Syringe}
        title={t("vaccinations.title")}
        description={t("vaccinations.description")}
        actions={
          <>
            <Button
              onClick={exportVaccinationData}
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 rounded-full px-2.5 sm:px-3"
              aria-label={t("vaccinations.export")}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("vaccinations.export")}</span>
            </Button>
            {canWrite && <NewVaccinationModal />}
          </>
        }
      />

      {/* Statistics */}
      <div className="app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
          <Syringe className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
          </div>
          <div>
          <p className="text-sm font-medium text-muted-foreground">{t("vaccinations.kpi.total")}</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-green-100 rounded-full">
          <CheckCircle className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
          </div>
          <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("vaccinations.kpi.administered")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.administered}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-red-100 rounded-full">
          <AlertTriangle className="h-5 sm:h-6 w-5 sm:w-6 text-red-600" />
          </div>
          <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("vaccinations.kpi.overdue")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
          <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600" />
          </div>
          <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("vaccinations.kpi.next30")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
          <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
          </div>
          <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("vaccinations.kpi.planned")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.planned}</p>
          </div>
        </div>
        </CardContent>
      </Card>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
        <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4" />
        {t("vaccinations.tabs.overview")}
        </TabsTrigger>
        <TabsTrigger value="protocols" className="flex items-center gap-2 text-xs sm:text-sm">
        <Shield className="h-3 sm:h-4 w-3 sm:w-4" />
        {t("vaccinations.tabs.protocols")}
        </TabsTrigger>
       
      </TabsList>

      <TabsContent value="overview" className="space-y-4" data-tour="vaccinations-list">
        {/* Filters */}
        <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 flex-1">
            <div className="relative w-full min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("vaccinations.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vaccinations.filters.allStatuses")}</SelectItem>
              <SelectItem value="administered">{t("vaccinations.status.administered")}</SelectItem>
              <SelectItem value="planned">{t("vaccinations.status.planned")}</SelectItem>
              <SelectItem value="overdue">{t("vaccinations.status.overdue")}</SelectItem>
            </SelectContent>
            </Select>
            
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vaccinations.filters.allSpecies")}</SelectItem>
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
            idPrefix="vaccinations-date"
            compact
          />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            >
            <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            >
            <List className="h-4 w-4" />
            </Button>
          </div>
          </div>
        </CardContent>
        </Card>

        {/* Unified doses: administered + planned RDVs */}
        {filteredDoses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Syringe className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t("vaccinations.empty")}</p>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoses.map((dose) => (
          <Card key={dose.rowKey} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                <PawPrint className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{dose.petName}</h3>
                <p className="text-xs text-gray-600">{dose.species} • {dose.clientName}</p>
              </div>
              </div>
              <Badge className={`${getStatusColor(dose.listStatus)} text-xs`}>
              {getStatusIcon(dose.listStatus)}
              <span className="ml-1">{getStatusLabel(dose.listStatus)}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
              <Syringe className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">{dose.vaccineName}</span>
              {dose.vaccineType && (
                <Badge variant="outline" className="text-xs">
                {dose.vaccineType}
                </Badge>
              )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{dose.doseLabel}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{t("vaccinations.dateLabel")}: {format(parseISO(dose.date), 'dd/MM/yyyy', { locale: dateFns })}</span>
              </div>

              {dose.administeredBy && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{dose.administeredBy}</span>
              </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setSelectedDose(dose);
                setShowVaccinationDetails(true);
              }}
              >
              <Eye className="h-4 w-4 mr-1" />
              {tc("details")}
              </Button>
              {canWrite && dose.listStatus !== 'administered' && (
              <Button
                size="sm"
                variant="default"
                disabled={markingDoneId === dose.rowKey}
                onClick={() => handleMarkDone(dose)}
                title={t("vaccinations.markDone")}
              >
                {markingDoneId === dose.rowKey ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
              )}
              {canWrite && dose.vaccinationRecord && (
              <>
                <Button
                size="sm"
                variant="outline"
                onClick={() => openEditVaccination(dose.vaccinationRecord!)}
                title={t("vaccinations.editTitle")}
                >
                <Edit className="h-4 w-4" />
                </Button>
                <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDeleteVaccination(dose.vaccinationRecord!)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        ) : (
        <Card>
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
              <TableHead>{t("vaccinations.columns.pet")}</TableHead>
              <TableHead>{t("vaccinations.columns.vaccine")}</TableHead>
              <TableHead>{t("vaccinations.doseDetails.label")}</TableHead>
              <TableHead>{t("vaccinations.columns.date")}</TableHead>
              <TableHead>{t("vaccinations.columns.status")}</TableHead>
              <TableHead>{t("vaccinations.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoses.map((dose) => (
              <TableRow key={dose.rowKey}>
                <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <PawPrint className="h-4 w-4" />
                  </AvatarFallback>
                  </Avatar>
                  <div>
                  <div className="font-medium text-sm">{dose.petName}</div>
                  <div className="text-xs text-gray-600">{dose.clientName}</div>
                  </div>
                </div>
                </TableCell>
                <TableCell className="font-medium">{dose.vaccineName}</TableCell>
                <TableCell>{dose.doseLabel}</TableCell>
                <TableCell>{format(parseISO(dose.date), 'dd/MM/yyyy', { locale: dateFns })}</TableCell>
                <TableCell>
                <Badge className={getStatusColor(dose.listStatus)}>
                  {getStatusIcon(dose.listStatus)}
                  <span className="ml-1">{getStatusLabel(dose.listStatus)}</span>
                </Badge>
                </TableCell>
                <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedDose(dose);
                    setShowVaccinationDetails(true);
                  }}
                  >
                  <Eye className="h-4 w-4" />
                  </Button>
                  {canWrite && dose.listStatus !== 'administered' && (
                  <Button
                    size="sm"
                    variant="default"
                    disabled={markingDoneId === dose.rowKey}
                    onClick={() => handleMarkDone(dose)}
                    title={t("vaccinations.markDone")}
                  >
                    {markingDoneId === dose.rowKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  )}
                  {canWrite && dose.vaccinationRecord && (
                  <>
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditVaccination(dose.vaccinationRecord!)}
                    title={t("vaccinations.editTitle")}
                    >
                    <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteVaccination(dose.vaccinationRecord!)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          </CardContent>
        </Card>
        )}
      </TabsContent>

      <TabsContent value="protocols">
        <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("vaccinations.protocols")} ({vaccinationProtocols.length})
          </div>
          {canWrite && <VaccinationProtocolModal mode="create" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaccinationProtocols.map(protocol => (
            <Card key={protocol.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold">{protocol.vaccine_name}</h4>
                {!protocol.active && (
                <Badge variant="secondary" className="text-xs">{t("vaccinations.inactive")}</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{t("vaccinations.protocolMeta.species", { species: protocol.species })}</p>
              <p className="text-sm text-gray-600">{t("vaccinations.columns.vaccine")}: {protocol.vaccine_type}</p>
              {protocol.frequency && (
                <p className="text-sm text-gray-600">{t("vaccinations.protocolMeta.frequency", { frequency: protocol.frequency })}</p>
              )}
              {protocol.age_recommendation && (
                <p className="text-sm text-gray-600">{tc("age")}: {protocol.age_recommendation}</p>
              )}
              {protocol.notes && (
                <p className="text-xs text-gray-500 mt-2">{protocol.notes}</p>
              )}
              {canWrite && (
              <div className="flex gap-2 mt-3">
                <VaccinationProtocolModal mode="edit" protocol={protocol}>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  {tc("edit")}
                </Button>
                </VaccinationProtocolModal>
              </div>
              )}
              </div>
            </CardContent>
            </Card>
          ))}
          </div>
          {vaccinationProtocols.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{t("vaccinations.emptyProtocols")}</p>
            {canWrite && (
            <VaccinationProtocolModal mode="create">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t("vaccinations.createProtocol")}
            </Button>
            </VaccinationProtocolModal>
            )}
          </div>
          )}
        </CardContent>
        </Card>
      </TabsContent>

      
      </Tabs>

      {/* Dose Details Modal */}
      <Dialog open={showVaccinationDetails} onOpenChange={setShowVaccinationDetails}>
      <DialogContent className="max-w-2xl w-full mx-4">
        <DialogHeader>
        <DialogTitle>{t("vaccinations.doseDetails.title")}</DialogTitle>
        </DialogHeader>
        {selectedDose && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{t("vaccinations.columns.pet")}:</p>
            <p>{selectedDose.petName}</p>
          </div>
          <div>
            <p className="font-medium">{t("vaccinations.columns.client")}:</p>
            <p>{selectedDose.clientName}</p>
          </div>
          <div>
            <p className="font-medium">{t("vaccinations.columns.vaccine")}:</p>
            <p>{selectedDose.vaccineName}</p>
          </div>
          <div>
            <p className="font-medium">{t("vaccinations.doseDetails.label")}:</p>
            <p>{selectedDose.doseLabel}</p>
          </div>
          <div>
            <p className="font-medium">{t("vaccinations.doseDetails.date")}:</p>
            <p>{format(parseISO(selectedDose.date), 'dd/MM/yyyy', { locale: dateFns })}</p>
          </div>
          <div>
            <p className="font-medium">{t("vaccinations.columns.status")}:</p>
            <Badge className={getStatusColor(selectedDose.listStatus)}>
              {getStatusIcon(selectedDose.listStatus)}
              <span className="ml-1">{getStatusLabel(selectedDose.listStatus)}</span>
            </Badge>
          </div>
          {selectedDose.administeredBy && (
            <div>
            <p className="font-medium">{t("vaccinations.status.administered")}:</p>
            <p>{selectedDose.administeredBy}</p>
            </div>
          )}
          </div>
          {selectedDose.notes && (
          <div>
            <p className="font-medium">{t("vaccinations.doseDetails.notes")}:</p>
            <p className="text-gray-600">{selectedDose.notes}</p>
          </div>
          )}
          
          <div className="border-t pt-4 mt-4 space-y-3">
          <div className="flex flex-wrap justify-center gap-2">
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
                {t("vaccinations.markDone")}
              </Button>
            )}
            {canWrite && selectedDose.vaccinationRecord && (
              <Button
                variant="outline"
                onClick={() => openEditVaccination(selectedDose.vaccinationRecord!)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {tc("edit")}
              </Button>
            )}
            <CertificateVaccinationPrintDynamic animalId={selectedDose.animalId} />
          </div>
          </div>
        </div>
        )}
      </DialogContent>
      </Dialog>

      <NewVaccinationModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingVaccination(null);
        }}
        editingVaccination={editingVaccination}
        onUpdated={() => {
          setEditingVaccination(null);
          setEditOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
        <DialogTitle>{t("vaccinations.deleteConfirmTitle")}</DialogTitle>
        </DialogHeader>
        {vaccinationToDelete && (
        <div className="space-y-4">
          <p className="text-gray-600">
          {t("vaccinations.deleteConfirmBody")}
          </p>
          <p className="text-sm text-red-600">
          {tc("cannotUndo")}
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto">
            {tc("cancel")}
          </Button>
          <Button variant="destructive" onClick={confirmDeleteVaccination} className="w-full sm:w-auto">
            {t("vaccinations.deleteConfirmAction")}
          </Button>
          </div>
        </div>
        )}
      </DialogContent>
      </Dialog>
    </div>
  );
}