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
  useUpdateAntiparasitic,
  useAnimals,
  useClients
} from '@/hooks/useDatabase';
import { 
  Bug,
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
  Package,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppPageHeader } from '@/components/AppPageHeader';
import NewAntiparasiticModal from '@/components/forms/NewAntiparasiticModalDynamic';
import AntiparasiticProtocolModal from '@/components/forms/AntiparasiticProtocolModalDynamic';
import type { Antiparasitic, Animal, Client } from '@/lib/database';

// Helper functions
const getAntiparasiticStatus = (antiparasitic: Antiparasitic): 'completed' | 'overdue' | 'scheduled' | 'upcoming' => {
  if (!antiparasitic.next_treatment_date) return 'completed';
  
  const nextDate = new Date(antiparasitic.next_treatment_date);
  const today = new Date();
  const weekFromNow = addDays(today, 7);
  
  if (isBefore(nextDate, today)) return 'overdue';
  if (isBefore(nextDate, weekFromNow)) return 'upcoming';
  return 'scheduled';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'upcoming': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4" />;
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'upcoming': return <Calendar className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Terminé';
    case 'overdue': return 'En retard';
    case 'scheduled': return 'Programmé';
    case 'upcoming': return 'À venir';
    default: return 'Inconnu';
  }
};

// Enrich antiparasitic data with animal and client info
const enrichAntiparasiticData = (antiparasitics: Antiparasitic[], animals: Animal[], clients: Client[]) => {
  return antiparasitics.map(antiparasitic => {
    const animal = animals.find(a => a.id === antiparasitic.animal_id);
    const client = animal ? clients.find(c => c.id === animal.client_id) : null;
    const status = getAntiparasiticStatus(antiparasitic);
    
    return {
      ...antiparasitic,
      petName: animal?.name || 'Animal inconnu',
      petSpecies: animal?.species || 'Espèce inconnue',
      clientName: client ? `${client.first_name} ${client.last_name}` : 'Client inconnu',
      status,
      animal,
      client
    };
  });
};

export default function Antiparasites() {
  const { currentView } = useDisplayPreference('antiparasitics');
  const { data: antiparasitics = [], isLoading: isLoadingAntiparasitics } = useAntiparasitics();
  const { data: protocols = [], isLoading: isLoadingProtocols } = useAntiparasiticProtocols();
  const { data: animals = [] } = useAnimals();
  const { data: clients = [] } = useClients();
  const deleteAntiparasitic = useDeleteAntiparasitic();
  const { toast } = useToast();

  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parasiteFilter, setParasiteFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [showNewAntiparasitic, setShowNewAntiparasitic] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showAntiparasiticDetails, setShowAntiparasiticDetails] = useState(false);
  const [selectedAntiparasitic, setSelectedAntiparasitic] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [antiparasiticToDelete, setAntiparasiticToDelete] = useState<any>(null);
  const [editingProtocol, setEditingProtocol] = useState<any>(null);

  // Enrich data
  const enrichedAntiparasitics = useMemo(() => 
    enrichAntiparasiticData(antiparasitics, animals, clients), 
    [antiparasitics, animals, clients]
  );

  // Filter and search
  const filteredAntiparasitics = useMemo(() => {
    return enrichedAntiparasitics.filter(antiparasitic => {
      const matchesSearch = !searchTerm || 
        antiparasitic.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antiparasitic.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antiparasitic.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || antiparasitic.status === statusFilter;
      
      const matchesParasite = parasiteFilter === 'all' || antiparasitic.parasite_type === parasiteFilter;
      
      const matchesSpecies = speciesFilter === 'all' || antiparasitic.petSpecies === speciesFilter;
      
      return matchesSearch && matchesStatus && matchesParasite && matchesSpecies;
    });
  }, [enrichedAntiparasitics, searchTerm, statusFilter, parasiteFilter, speciesFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = enrichedAntiparasitics.length;
    const overdue = enrichedAntiparasitics.filter(a => a.status === 'overdue').length;
    const upcoming = enrichedAntiparasitics.filter(a => a.status === 'upcoming').length;
    const completed = enrichedAntiparasitics.filter(a => a.status === 'completed').length;
    
    // Parasite type breakdown
    const parasiteTypes = enrichedAntiparasitics.reduce((acc, antiparasitic) => {
      const type = antiparasitic.parasite_type || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      overdue,
      upcoming, 
      completed,
      parasiteTypes
    };
  }, [enrichedAntiparasitics]);

  const handleDeleteAntiparasitic = (antiparasitic: any) => {
    setAntiparasiticToDelete(antiparasitic);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAntiparasitic = async () => {
    if (!antiparasiticToDelete) return;

    try {
      await deleteAntiparasitic.mutateAsync(antiparasiticToDelete.id);
      toast({
        title: "Succès",
        description: "Le traitement antiparasitaire a été supprimé.",
      });
      setShowDeleteConfirm(false);
      setAntiparasiticToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le traitement.",
        variant: "destructive",
      });
    }
  };

  const unique = (arr: string[]) => [...new Set(arr)];
  const availableParasiteTypes = unique(
    enrichedAntiparasitics.map(a => a.parasite_type).filter(Boolean)
  );

  if (isLoadingAntiparasitics) {
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
        description="Gestion des traitements antiparasitaires et protocoles"
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

      {/* Statistics Cards */}
      <div className="app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <p className="text-sm text-gray-600">À venir</p>
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
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        </CardContent>
      </Card>
      </div>

      {/* Filters and Search */}
      <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par animal, client ou produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
            <SelectItem value="upcoming">À venir</SelectItem>
            <SelectItem value="scheduled">Programmés</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
          </SelectContent>
          </Select>
          
          <Select value={parasiteFilter} onValueChange={setParasiteFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par parasite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les parasites</SelectItem>
            {availableParasiteTypes.map(type => (
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

      {/* Main Content */}
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
          <span>Traitements antiparasitaires ({filteredAntiparasitics.length})</span>
          <div className="flex items-center gap-2">
            <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            >
            <Download className="h-4 w-4 mr-1" />
            Export
            </Button>
          </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentView === 'table' ? (
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Parasite</TableHead>
              <TableHead>Date traitement</TableHead>
              <TableHead>Prochain traitement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAntiparasitics.map(antiparasitic => (
              <TableRow key={antiparasitic.id}>
                <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <PawPrint className="h-4 w-4" />
                  </AvatarFallback>
                  </Avatar>
                  <div>
                  <div className="font-medium">{antiparasitic.petName}</div>
                  <div className="text-sm text-gray-500">{antiparasitic.petSpecies}</div>
                  </div>
                </div>
                </TableCell>
                <TableCell>{antiparasitic.clientName}</TableCell>
                <TableCell>
                <div>
                  <div className="font-medium">{antiparasitic.product_name}</div>
                  {antiparasitic.active_ingredient && (
                  <div className="text-sm text-gray-500">{antiparasitic.active_ingredient}</div>
                  )}
                </div>
                </TableCell>
                <TableCell>
                {antiparasitic.parasite_type && (
                  <Badge variant="outline">
                  {antiparasitic.parasite_type}
                  </Badge>
                )}
                </TableCell>
                <TableCell>
                {format(new Date(antiparasitic.treatment_date), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                {antiparasitic.next_treatment_date ? 
                  format(new Date(antiparasitic.next_treatment_date), 'dd/MM/yyyy', { locale: fr }) : 
                  'N/A'
                }
                </TableCell>
                <TableCell>
                <Badge className={getStatusColor(antiparasitic.status)}>
                  <div className="flex items-center gap-1">
                  {getStatusIcon(antiparasitic.status)}
                  {getStatusLabel(antiparasitic.status)}
                  </div>
                </Badge>
                </TableCell>
                <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAntiparasitic(antiparasitic);
                    setShowAntiparasiticDetails(true);
                  }}
                  >
                  <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAntiparasitic(antiparasitic)}
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
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAntiparasitics.map(antiparasitic => (
            <Card key={antiparasitic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                  <PawPrint className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{antiparasitic.petName}</h4>
                  <p className="text-xs text-gray-600">{antiparasitic.clientName}</p>
                </div>
                </div>
                <Badge className={getStatusColor(antiparasitic.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(antiparasitic.status)}
                  {getStatusLabel(antiparasitic.status)}
                </div>
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Produit:</span> {antiparasitic.product_name}</div>
                {antiparasitic.parasite_type && (
                <div><span className="font-medium">Parasite:</span> {antiparasitic.parasite_type}</div>
                )}
                <div><span className="font-medium">Date:</span> {format(new Date(antiparasitic.treatment_date), 'dd/MM/yyyy')}</div>
                {antiparasitic.next_treatment_date && (
                <div><span className="font-medium">Prochain:</span> {format(new Date(antiparasitic.next_treatment_date), 'dd/MM/yyyy')}</div>
                )}
              </div>
              
              <div className="flex justify-between mt-4">
                <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAntiparasitic(antiparasitic);
                  setShowAntiparasiticDetails(true);
                }}
                >
                <Eye className="h-4 w-4 mr-1" />
                Détails
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteAntiparasitic(antiparasitic)}
                >
                <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              </CardContent>
            </Card>
            ))}
          </div>
          )}
          
          {filteredAntiparasitics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun traitement antiparasitaire trouvé</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map(protocol => (
            <Card key={protocol.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">{protocol.species}</Badge>
              <div className="flex gap-1">
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
          
          {protocols.length === 0 && (
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
                style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{count}</span>
              </div>
            </div>
            ))}
          </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
          <CardTitle>Résumé des traitements</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
            <span>Total des traitements</span>
            <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
            <span>En retard</span>
            <span className="font-bold text-red-600">{stats.overdue}</span>
            </div>
            <div className="flex justify-between items-center">
            <span>À venir (7 jours)</span>
            <span className="font-bold text-orange-600">{stats.upcoming}</span>
            </div>
            <div className="flex justify-between items-center">
            <span>Terminés</span>
            <span className="font-bold text-green-600">{stats.completed}</span>
            </div>
          </div>
          </CardContent>
        </Card>
        </div>
      </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewAntiparasiticModal 
      open={showNewAntiparasitic} 
      onOpenChange={setShowNewAntiparasitic}
      />

      <AntiparasiticProtocolModal 
      open={showProtocolModal} 
      onOpenChange={setShowProtocolModal}
      editingProtocol={editingProtocol}
      />

      {/* Antiparasitic Details Modal */}
      <Dialog open={showAntiparasiticDetails} onOpenChange={setShowAntiparasiticDetails}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
        <DialogTitle>Détails du traitement</DialogTitle>
        </DialogHeader>
        {selectedAntiparasitic && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Animal:</p>
            <p>{selectedAntiparasitic.petName}</p>
          </div>
          <div>
            <p className="font-medium">Client:</p>
            <p>{selectedAntiparasitic.clientName}</p>
          </div>
          <div>
            <p className="font-medium">Produit:</p>
            <p>{selectedAntiparasitic.product_name}</p>
          </div>
          <div>
            <p className="font-medium">Principe actif:</p>
            <p>{selectedAntiparasitic.active_ingredient || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Type de parasite:</p>
            <p>{selectedAntiparasitic.parasite_type || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Voie d'administration:</p>
            <p>{selectedAntiparasitic.administration_route || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Dosage:</p>
            <p>{selectedAntiparasitic.dosage || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Date du traitement:</p>
            <p>{format(new Date(selectedAntiparasitic.treatment_date), 'dd/MM/yyyy', { locale: fr })}</p>
          </div>
          {selectedAntiparasitic.next_treatment_date && (
            <div>
            <p className="font-medium">Prochain traitement:</p>
            <p>{format(new Date(selectedAntiparasitic.next_treatment_date), 'dd/MM/yyyy', { locale: fr })}</p>
            </div>
          )}
          {/* {selectedAntiparasitic.administered_by && (
            <div>
            <p className="font-medium">Administré par:</p>
            <p>{selectedAntiparasitic.administered_by}</p>
            </div>
          )} */}
          {selectedAntiparasitic.effectiveness_rating && (
            <div>
            <p className="font-medium">Efficacité:</p>
            <p>{selectedAntiparasitic.effectiveness_rating}/10</p>
            </div>
          )}
          </div>
          {selectedAntiparasitic.notes && (
          <div>
            <p className="font-medium">Notes:</p>
            <p className="text-gray-600">{selectedAntiparasitic.notes}</p>
          </div>
          )}
        </div>
        )}
      </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        {antiparasiticToDelete && (
        <div className="space-y-4">
          <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer le traitement <strong>{antiparasiticToDelete.product_name}</strong> pour <strong>{antiparasiticToDelete.petName}</strong> ?
          </p>
          <p className="text-sm text-red-600">
          Cette action est irréversible.
          </p>
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