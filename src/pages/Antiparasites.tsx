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
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppPageHeader } from '@/components/AppPageHeader';
import NewAntiparasiticModal from '@/components/forms/NewAntiparasiticModalDynamic';
import AntiparasiticProtocolModal from '@/components/forms/AntiparasiticProtocolModalDynamic';
import CertificateAntiparasiticPrintDynamic from '@/components/CertificateAntiparasiticPrintDynamic';
import type { Antiparasitic, Appointment } from '@/lib/database';
import { syncRemindersAfterAdministered } from '@/lib/medicalDoseSync';
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

const getStatusLabel = (status: DoseListStatus) => {
  switch (status) {
    case 'administered': return 'Administré';
    case 'overdue': return 'En retard';
    case 'planned': return 'Planifié';
    default: return status;
  }
};

export default function Antiparasites() {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parasiteFilter, setParasiteFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
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
      const petName = animal?.name || 'Animal inconnu';
      const clientName = client
        ? `${client.first_name} ${client.last_name}`
        : 'Client inconnu';

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
      const type = dose.vaccineType || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, administered, overdue, planned, upcoming, parasiteTypes };
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
        (statusFilter === 'scheduled' && dose.listStatus === 'planned') ||
        (statusFilter === 'upcoming' && dose.listStatus === 'planned');

      const matchesParasite =
        parasiteFilter === 'all' || dose.vaccineType === parasiteFilter;

      const matchesSpecies =
        speciesFilter === 'all' || dose.species === speciesFilter;

      return matchesSearch && matchesStatus && matchesParasite && matchesSpecies;
    });
  }, [unifiedDoses, searchTerm, statusFilter, parasiteFilter, speciesFilter]);

  const handleDeleteAntiparasitic = (antiparasitic: Antiparasitic) => {
    setAntiparasiticToDelete(antiparasitic);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAntiparasitic = async () => {
    if (!antiparasiticToDelete) return;
    try {
      await deleteAntiparasitic.mutateAsync(antiparasiticToDelete.id);
      toast({
        title: 'Succès',
        description: 'Le traitement antiparasitaire a été supprimé.',
      });
      setShowDeleteConfirm(false);
      setAntiparasiticToDelete(null);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le traitement.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkDone = async (dose: UnifiedDoseRow) => {
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
          userNotes: 'Marqué fait depuis la liste Antiparasites',
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
        title: 'Traitement administré',
        description: `${dose.vaccineName} · ${dose.doseLabel} — même ligne mise à jour.`,
      });
      setShowAntiparasiticDetails(false);
      setSelectedDose(null);
    } catch (e: any) {
      toast({
        title: 'Impossible de marquer fait',
        description: e?.message || 'Erreur lors de l’enregistrement.',
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
        <span className="ml-2">Chargement des traitements antiparasitaires...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <AppPageHeader
        icon={Bug}
        title="Antiparasites"
        description="Suivi et planification des traitements antiparasitaires"
        actions={
          <>
            <Button
              onClick={() => setShowProtocolModal(true)}
              variant="outline"
              className="gap-2 rounded-full"
            >
              <Shield className="h-4 w-4" />
              Protocoles
            </Button>
            <Button
              onClick={() => setShowNewAntiparasitic(true)}
              className="gap-2 rounded-full"
            >
              <Plus className="h-4 w-4" />
              Nouveau traitement
            </Button>
          </>
        }
      />

      <div className="app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
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
                <p className="text-sm text-gray-600">Administrés</p>
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
                <p className="text-sm text-gray-600">En retard</p>
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
                <p className="text-sm text-gray-600">Prochaines 30j</p>
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
                <p className="text-sm text-gray-600">Planifiés</p>
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
                placeholder="Rechercher par animal, client ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="administered">Administrés</SelectItem>
                  <SelectItem value="planned">Planifiés</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={parasiteFilter} onValueChange={setParasiteFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par parasite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les parasites</SelectItem>
                  {availableParasiteTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par espèce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes espèces</SelectItem>
                  {animalSpecies.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-none">
            <List className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Shield className="h-4 w-4" />
            Protocoles
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2 flex-1 sm:flex-none">
            <TrendingUp className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>Doses antiparasitaires ({filteredDoses.length})</span>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDoses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun traitement antiparasitaire trouvé</p>
                </div>
              ) : currentView === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Animal</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Dose</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
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
                          <TableCell>{format(parseISO(dose.date), 'dd/MM/yyyy')}</TableCell>
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
                              {dose.listStatus !== 'administered' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={markingDoneId === dose.rowKey}
                                  onClick={() => handleMarkDone(dose)}
                                  title="Marquer fait"
                                >
                                  {markingDoneId === dose.rowKey ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                              )}
                              {dose.treatmentRecord && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditAntiparasitic(dose.treatmentRecord!)}
                                    title="Modifier"
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
                            <div><span className="font-medium">Parasite:</span> {dose.vaccineType}</div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(dose.date), 'dd/MM/yyyy', { locale: fr })}</span>
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
                            Détails
                          </Button>
                          {dose.listStatus !== 'administered' && (
                            <Button
                              size="sm"
                              disabled={markingDoneId === dose.rowKey}
                              onClick={() => handleMarkDone(dose)}
                              title="Marquer fait"
                            >
                              {markingDoneId === dose.rowKey ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {dose.treatmentRecord && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditAntiparasitic(dose.treatmentRecord!)}
                                title="Modifier"
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
                <span>Protocoles antiparasitaires ({protocols.length})</span>
                <Button
                  onClick={() => {
                    setEditingProtocol(null);
                    setShowProtocolModal(true);
                  }}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau protocole
                </Button>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProtocol(protocol);
                              setShowProtocolModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">{protocol.product_name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div><span className="font-medium">Parasite:</span> {protocol.parasite_type}</div>
                          {protocol.active_ingredient && (
                            <div><span className="font-medium">Principe actif:</span> {protocol.active_ingredient}</div>
                          )}
                          {protocol.frequency && (
                            <div><span className="font-medium">Fréquence:</span> {protocol.frequency}</div>
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
                  <p>Aucun protocole configuré</p>
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
                  Répartition par type de parasite
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
                    <p className="text-sm text-muted-foreground">Aucune donnée</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé des doses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Administrés</span>
                    <span className="font-bold text-green-600">{stats.administered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Planifiés</span>
                    <span className="font-bold text-blue-600">{stats.planned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>En retard</span>
                    <span className="font-bold text-red-600">{stats.overdue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prochaines 30 jours</span>
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
            <DialogTitle>Détails de la dose</DialogTitle>
          </DialogHeader>
          {selectedDose && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Animal:</p>
                  <p>{selectedDose.petName}</p>
                </div>
                <div>
                  <p className="font-medium">Client:</p>
                  <p>{selectedDose.clientName}</p>
                </div>
                <div>
                  <p className="font-medium">Produit:</p>
                  <p>{selectedDose.vaccineName}</p>
                </div>
                <div>
                  <p className="font-medium">Dose:</p>
                  <p>{selectedDose.doseLabel}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{format(parseISO(selectedDose.date), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <p className="font-medium">Statut:</p>
                  <Badge className={getStatusColor(selectedDose.listStatus)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedDose.listStatus)}
                      {getStatusLabel(selectedDose.listStatus)}
                    </div>
                  </Badge>
                </div>
                {selectedDose.vaccineType && (
                  <div>
                    <p className="font-medium">Parasite:</p>
                    <p>{selectedDose.vaccineType}</p>
                  </div>
                )}
                {selectedDose.administeredBy && (
                  <div>
                    <p className="font-medium">Administré par:</p>
                    <p>{selectedDose.administeredBy}</p>
                  </div>
                )}
              </div>
              {selectedDose.notes && (
                <div>
                  <p className="font-medium">Notes:</p>
                  <p className="text-gray-600">{selectedDose.notes}</p>
                </div>
              )}
              <div className="border-t pt-4 flex flex-wrap gap-2 justify-center">
                {selectedDose.listStatus !== 'administered' && (
                  <Button
                    disabled={markingDoneId === selectedDose.rowKey}
                    onClick={() => handleMarkDone(selectedDose)}
                  >
                    {markingDoneId === selectedDose.rowKey ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Marquer fait
                  </Button>
                )}
                {selectedDose.treatmentRecord && (
                  <Button
                    variant="outline"
                    onClick={() => openEditAntiparasitic(selectedDose.treatmentRecord!)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          {antiparasiticToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer le traitement{' '}
                <strong>{antiparasiticToDelete.product_name}</strong> ?
              </p>
              <p className="text-sm text-red-600">Cette action est irréversible.</p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAntiparasitic} className="w-full sm:w-auto">
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
