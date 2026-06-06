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
  useUpdateVaccination,
  useAnimals,
  useClients
} from '@/hooks/useDatabase';
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
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewVaccinationModal from '@/components/forms/NewVaccinationModalDynamic';
import VaccinationProtocolModal from '@/components/forms/VaccinationProtocolModalDynamic';
import CertificateVaccinationPrintDynamic from '@/components/CertificateVaccinationPrintDynamic';
import type { Vaccination, Animal, Client } from '@/lib/database';

// Helper functions
const getVaccinationStatus = (vaccination: Vaccination): 'completed' | 'overdue' | 'scheduled' | 'missed' => {
  if (!vaccination.next_due_date) return 'completed';
  
  const today = new Date();
  const dueDate = new Date(vaccination.next_due_date);
  
  if (isBefore(dueDate, today)) return 'overdue';
  return 'scheduled';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'missed': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4" />;
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'missed': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export default function Vaccinations() {
  // Data fetching hooks
  const { data: vaccinations = [], isLoading: vaccinationsLoading } = useVaccinations();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: vaccinationProtocols = [] } = useVaccinationProtocols();
  
  // Mutation hooks
  const deleteVaccinationMutation = useDeleteVaccination();
  const updateVaccinationMutation = useUpdateVaccination();
  
  const { toast } = useToast();
  const { currentView } = useDisplayPreference('vaccinations');
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  
  // UI state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
  const [showVaccinationDetails, setShowVaccinationDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<any>(null);

  // Enrich vaccinations with animal and client data
  const enrichedVaccinations = useMemo(() => {
    if (vaccinationsLoading || animalsLoading || clientsLoading) return [];
    
    return vaccinations.map(vaccination => {
      const animal = animals.find(a => a.id === vaccination.animal_id);
      const client = clients.find(c => c.id === animal?.client_id);
      
      return {
        ...vaccination,
        petName: animal?.name || 'Animal inconnu',
        clientName: client ? `${client.first_name} ${client.last_name}` : 'Client inconnu',
        status: getVaccinationStatus(vaccination),
        animal,
        client,
      };
    });
  }, [vaccinations, animals, clients, vaccinationsLoading, animalsLoading, clientsLoading]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = enrichedVaccinations.length;
    const completed = enrichedVaccinations.filter(v => v.status === 'completed').length;
    const overdue = enrichedVaccinations.filter(v => v.status === 'overdue').length;
    const scheduled = enrichedVaccinations.filter(v => v.status === 'scheduled').length;
    const upcoming = enrichedVaccinations.filter(v => {
      if (!v.next_due_date) return false;
      const today = new Date();
      const dueDate = new Date(v.next_due_date);
      const thirtyDaysFromNow = addDays(today, 30);
      return isAfter(dueDate, today) && isBefore(dueDate, thirtyDaysFromNow);
    }).length;
    
    return { total, completed, overdue, scheduled, upcoming };
  }, [enrichedVaccinations]);

  // Filter vaccinations
  const filteredVaccinations = useMemo(() => {
    return enrichedVaccinations.filter(vaccination => {
      const matchesSearch = 
        vaccination.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccination.vaccine_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vaccination.status === statusFilter;
      const matchesSpecies = speciesFilter === 'all' || vaccination.animal?.species === speciesFilter;
      
      return matchesSearch && matchesStatus && matchesSpecies;
    });
  }, [enrichedVaccinations, searchTerm, statusFilter, speciesFilter]);

  const handleDeleteVaccination = (vaccination: any) => {
    setVaccinationToDelete(vaccination);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteVaccination = () => {
    if (vaccinationToDelete) {
      deleteVaccinationMutation.mutate(vaccinationToDelete.id);
      toast({
        title: "Vaccination supprimée",
        description: `La vaccination ${vaccinationToDelete.vaccine_name} a été supprimée avec succès.`,
      });
      setShowDeleteConfirm(false);
      setVaccinationToDelete(null);
    }
  };

  const exportVaccinationData = () => {
    const dataStr = JSON.stringify(enrichedVaccinations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaccinations-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = vaccinationsLoading || animalsLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement des données de vaccination...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3 dark:text-white">
        <Syringe className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
        Gestion Vaccinale
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
        Suivi et planification des vaccinations
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button onClick={exportVaccinationData} variant="outline" className="gap-2 flex-1 sm:flex-none">
        <Download className="h-4 w-4" />
        Exporter
        </Button>
        <NewVaccinationModal />
      </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
          <Syringe className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
          </div>
          <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Retard</p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prochaines 30j</p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planifiées</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
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
        Vue d'ensemble
        </TabsTrigger>
        <TabsTrigger value="protocols" className="flex items-center gap-2 text-xs sm:text-sm">
        <Shield className="h-3 sm:h-4 w-3 sm:w-4" />
        Protocoles
        </TabsTrigger>
       
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Filters */}
        <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher animal, client, vaccin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
              <SelectItem value="scheduled">Planifiées</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
            </Select>
            
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
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

        {/* Vaccinations List */}
        {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVaccinations.map((vaccination) => (
          <Card key={vaccination.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                <PawPrint className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{vaccination.petName}</h3>
                <p className="text-xs text-gray-600">{vaccination.animal?.species} • {vaccination.clientName}</p>
              </div>
              </div>
              <Badge className={`${getStatusColor(vaccination.status)} text-xs`}>
              {getStatusIcon(vaccination.status)}
              <span className="ml-1 capitalize">{vaccination.status}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">{vaccination.vaccine_name}</span>
              {vaccination.vaccine_type && (
                <Badge variant="outline" className="text-xs">
                {vaccination.vaccine_type}
                </Badge>
              )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Date: {format(new Date(vaccination.vaccination_date), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
              
              {vaccination.next_due_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Prochain: {format(new Date(vaccination.next_due_date), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
              )}

              {vaccination.administered_by && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{vaccination.administered_by}</span>
              </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setSelectedVaccination(vaccination);
                setShowVaccinationDetails(true);
              }}
              >
              <Eye className="h-4 w-4 mr-1" />
              Détails
              </Button>
              <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteVaccination(vaccination)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
              <Trash2 className="h-4 w-4" />
              </Button>
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
              <TableHead>Animal</TableHead>
              <TableHead>Vaccin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Prochain</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaccinations.map((vaccination) => (
              <TableRow key={vaccination.id}>
                <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <PawPrint className="h-4 w-4" />
                  </AvatarFallback>
                  </Avatar>
                  <div>
                  <div className="font-medium text-sm">{vaccination.petName}</div>
                  <div className="text-xs text-gray-600">{vaccination.clientName}</div>
                  </div>
                </div>
                </TableCell>
                <TableCell className="font-medium">{vaccination.vaccine_name}</TableCell>
                <TableCell>{format(new Date(vaccination.vaccination_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                {vaccination.next_due_date 
                  ? format(new Date(vaccination.next_due_date), 'dd/MM/yyyy')
                  : 'N/A'
                }
                </TableCell>
                <TableCell>
                <Badge className={getStatusColor(vaccination.status)}>
                  {getStatusIcon(vaccination.status)}
                  <span className="ml-1 capitalize">{vaccination.status}</span>
                </Badge>
                </TableCell>
                <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedVaccination(vaccination);
                    setShowVaccinationDetails(true);
                  }}
                  >
                  <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteVaccination(vaccination)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                  <Trash2 className="h-4 w-4" />
                  </Button>
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
            Protocoles Vaccinaux ({vaccinationProtocols.length})
          </div>
          <VaccinationProtocolModal mode="create" />
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
                <Badge variant="secondary" className="text-xs">Inactif</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">Espèce: {protocol.species}</p>
              <p className="text-sm text-gray-600">Type: {protocol.vaccine_type}</p>
              {protocol.frequency && (
                <p className="text-sm text-gray-600">Fréquence: {protocol.frequency}</p>
              )}
              {protocol.age_recommendation && (
                <p className="text-sm text-gray-600">Âge: {protocol.age_recommendation}</p>
              )}
              {protocol.notes && (
                <p className="text-xs text-gray-500 mt-2">{protocol.notes}</p>
              )}
              <div className="flex gap-2 mt-3">
                <VaccinationProtocolModal mode="edit" protocol={protocol}>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                </VaccinationProtocolModal>
              </div>
              </div>
            </CardContent>
            </Card>
          ))}
          </div>
          {vaccinationProtocols.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun protocole vaccinal configuré</p>
            <VaccinationProtocolModal mode="create">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Créer un protocole
            </Button>
            </VaccinationProtocolModal>
          </div>
          )}
        </CardContent>
        </Card>
      </TabsContent>

      
      </Tabs>

      {/* Vaccination Details Modal */}
      <Dialog open={showVaccinationDetails} onOpenChange={setShowVaccinationDetails}>
      <DialogContent className="max-w-2xl w-full mx-4">
        <DialogHeader>
        <DialogTitle>Détails de la Vaccination</DialogTitle>
        </DialogHeader>
        {selectedVaccination && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Animal:</p>
            <p>{selectedVaccination.petName}</p>
          </div>
          <div>
            <p className="font-medium">Client:</p>
            <p>{selectedVaccination.clientName}</p>
          </div>
          <div>
            <p className="font-medium">Vaccin:</p>
            <p>{selectedVaccination.vaccine_name}</p>
          </div>
          <div>
            <p className="font-medium">Date:</p>
            <p>{format(new Date(selectedVaccination.vaccination_date), 'dd/MM/yyyy', { locale: fr })}</p>
          </div>
          {selectedVaccination.next_due_date && (
            <div>
            <p className="font-medium">Prochain rappel:</p>
            <p>{format(new Date(selectedVaccination.next_due_date), 'dd/MM/yyyy', { locale: fr })}</p>
            </div>
          )}
          {/* {selectedVaccination.administered_by && (
            <div>
            <p className="font-medium">Administré par:</p>
            <p>{selectedVaccination.administered_by}</p>
            </div>
          )} */}
          </div>
          {selectedVaccination.notes && (
          <div>
            <p className="font-medium">Notes:</p>
            <p className="text-gray-600">{selectedVaccination.notes}</p>
          </div>
          )}
          
          {/* Certificate Print Button */}
          <div className="border-t pt-4 mt-4">
          <div className="flex justify-center">
            <CertificateVaccinationPrintDynamic animalId={selectedVaccination.animal_id} />
          </div>
          </div>
        </div>
        )}
      </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        {vaccinationToDelete && (
        <div className="space-y-4">
          <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer la vaccination <strong>{vaccinationToDelete.vaccine_name}</strong> pour <strong>{vaccinationToDelete.petName}</strong> ?
          </p>
          <p className="text-sm text-red-600">
          Cette action est irréversible.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button variant="destructive" onClick={confirmDeleteVaccination} className="w-full sm:w-auto">
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