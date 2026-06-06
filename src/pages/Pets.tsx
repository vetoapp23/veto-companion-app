// @ts-nocheck
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Heart, User, Calendar, Stethoscope, Eye, Edit, Activity, Grid, List, Loader2, AlertTriangle, CheckCircle, XCircle, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { PetViewModal } from "@/components/modals/PetViewModal";
import { SimplePetDossierModal } from "@/components/modals/SimplePetDossierModal";
import { MedicalStats } from "@/components/MedicalStats";
import { useAnimals, useClients, useUpdateAnimal, useDeleteAnimal, useClientStats, useConsultations, useVaccinations } from "@/hooks/useDatabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Animal, Client, CreateAnimalData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { calculateAge } from "@/lib/utils";
import { 
  useFarmManagementSettings,
  useAnimalColors,
  DEFAULT_SETTINGS
} from "@/hooks/useAppSettings";

// Import the original Pet interface from ClientContext for compatibility
import { Pet } from "@/contexts/ClientContext";

const statusStyles = {
  healthy: "bg-secondary text-secondary-foreground",
  treatment: "bg-accent text-accent-foreground", 
  urgent: "bg-destructive text-destructive-foreground"
};

// Interface extending Pet to include database ID
interface PetUI extends Pet {
  dbId: string; // Store original DB UUID for updates
  dbClientId: string; // Store client's DB UUID
}

// Convert database Animal to old Pet format
const convertAnimalToPet = (animal: Animal, clients: Client[]): PetUI => {
  const client = clients.find(c => c.id === animal.client_id);
  const clientName = client ? `${client.first_name} ${client.last_name}` : 'Propriétaire inconnu';
  
  // Convert UUID to number for compatibility (using hash)
  const petId = Math.abs(animal.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const clientId = Math.abs(animal.client_id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  return {
    id: petId,
    name: animal.name,
    type: animal.species,
    breed: animal.breed || '',
    gender: animal.sex === 'Mâle' ? 'male' : (animal.sex === 'Femelle' ? 'female' : undefined),
    birthDate: animal.birth_date || '',
    weight: animal.weight ? animal.weight.toString() : '',
    color: animal.color || '',
    microchip: animal.microchip_number || '',
    medicalNotes: animal.notes || '',
    photo: animal.photo_url || '',
    ownerId: clientId,
    owner: clientName,
    status: animal.status === 'vivant' ? 'healthy' : (animal.status === 'décédé' ? 'urgent' : 'treatment'),
    lastVisit: animal.updated_at ? new Date(animal.updated_at).toLocaleDateString('fr-FR') : 'Jamais',
    nextAppointment: undefined,
    vaccinations: [],
    // Store original DB IDs for updates
    dbId: animal.id,
    dbClientId: animal.client_id
  };
};

const PetsContent = () => {
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: stats } = useClientStats();
  const updateAnimalMutation = useUpdateAnimal();
  const deleteAnimalMutation = useDeleteAnimal();
  
  // Settings hooks for dynamic animal data
  const { data: farmSettings } = useFarmManagementSettings();
  const { data: animalColors = DEFAULT_SETTINGS.animal_colors } = useAnimalColors();
  
  // Extract animal settings from farm management settings with fallbacks
  const animalSpecies = farmSettings?.animal_categories || ['Chien', 'Chat', 'Bovin', 'Ovin', 'Caprin'];
  const animalBreeds = farmSettings?.breeds_by_category || {};
  
  // Convert animals to pets format for compatibility
  const pets = animals.map(animal => convertAnimalToPet(animal, clients));
  // Import consultation and vaccination hooks
  const { data: consultations = [] } = useConsultations();
  const { data: vaccinations = [] } = useVaccinations();
  
  // Get consultations for a specific pet
  const getConsultationsByPetId = useCallback((petId: string | number) => {
    const animalId = typeof petId === 'string' ? petId : pets.find(p => p.id === petId)?.dbId;
    if (!animalId) return [];
    return consultations.filter(c => c.animal_id === animalId);
  }, [pets, consultations]);

  // Get vaccinations for a specific pet
  const getVaccinationsByPetId = useCallback((petId: string | number) => {
    const animalId = typeof petId === 'string' ? petId : pets.find(p => p.id === petId)?.dbId;
    if (!animalId) return [];
    return vaccinations.filter(v => v.animal_id === animalId);
  }, [pets, vaccinations]);

  // Convert database consultation to old format for MedicalStats compatibility
  const convertConsultationForStats = useCallback((dbConsultation: any) => {
    return {
      id: Math.abs(dbConsultation.id.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)),
      clientId: Math.abs(dbConsultation.client_id.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)),
      clientName: dbConsultation.client?.first_name && dbConsultation.client?.last_name 
        ? `${dbConsultation.client.first_name} ${dbConsultation.client.last_name}` 
        : 'Client inconnu',
      petId: Math.abs(dbConsultation.animal_id.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)),
      petName: dbConsultation.animal?.name || 'Animal inconnu',
      date: dbConsultation.consultation_date || dbConsultation.created_at,
      weight: dbConsultation.weight?.toString(),
      temperature: dbConsultation.temperature?.toString(),
      symptoms: dbConsultation.symptoms,
      diagnosis: dbConsultation.diagnosis,
      treatment: dbConsultation.treatment,
      medications: dbConsultation.medications,
      followUp: dbConsultation.follow_up,
      cost: dbConsultation.cost?.toString(),
      notes: dbConsultation.notes,
      photos: dbConsultation.photos || [],
      createdAt: dbConsultation.created_at,
      purpose: dbConsultation.consultation_type || 'consultation',
      veterinarian: dbConsultation.veterinarian_name || 'Vétérinaire'
    };
  }, []);
  const { currentView } = useDisplayPreference('pets');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const { settings } = useSettings();
  
  // Use dynamic species list from settings instead of hardcoded values
  const speciesList = animalSpecies;
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetUI | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [petToDelete, setPetToDelete] = useState<PetUI | null>(null);
  const { toast } = useToast();
  
  // Edit form state
  const [editForm, setEditForm] = useState<CreateAnimalData>({
    client_id: '',
    name: '',
    species: 'Chien',
    breed: '',
    color: '',
    sex: 'Inconnu',
    weight: undefined,
    height: undefined,
    birth_date: '',
    microchip_number: '',
    tattoo_number: '',
    sterilized: false,
    sterilization_date: '',
    notes: '',
    photo_url: '',
    status: 'vivant'
  });

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         pet.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || pet.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === "all" || pet.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleView = (pet: PetUI) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  const handleEdit = (pet: PetUI) => {
    setSelectedPet(pet);
    // Populate edit form with pet data
    setEditForm({
      client_id: pet.dbClientId,
      name: pet.name,
      species: pet.type as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre',
      breed: pet.breed || '',
      color: pet.color || '',
      sex: pet.gender === 'male' ? 'Mâle' : (pet.gender === 'female' ? 'Femelle' : 'Inconnu'),
      weight: pet.weight ? parseFloat(pet.weight) : undefined,
      height: undefined,
      birth_date: pet.birthDate || '',
      microchip_number: pet.microchip || '',
      tattoo_number: '',
      sterilized: false,
      sterilization_date: '',
      notes: pet.medicalNotes || '',
      photo_url: pet.photo || '',
      status: pet.status === 'healthy' ? 'vivant' : (pet.status === 'urgent' ? 'décédé' : 'perdu')
    });
    setShowEditModal(true);
  };

  const handleEditFromView = () => {
    if (selectedPet) {
      // Populate edit form with pet data
      setEditForm({
        client_id: selectedPet.dbClientId,
        name: selectedPet.name,
        species: selectedPet.type as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre',
        breed: selectedPet.breed || '',
        color: selectedPet.color || '',
        sex: selectedPet.gender === 'male' ? 'Mâle' : (selectedPet.gender === 'female' ? 'Femelle' : 'Inconnu'),
        weight: selectedPet.weight ? parseFloat(selectedPet.weight) : undefined,
        height: undefined,
        birth_date: selectedPet.birthDate || '',
        microchip_number: selectedPet.microchip || '',
        tattoo_number: '',
        sterilized: false,
        sterilization_date: '',
        notes: selectedPet.medicalNotes || '',
        photo_url: selectedPet.photo || '',
        status: selectedPet.status === 'healthy' ? 'vivant' : (selectedPet.status === 'urgent' ? 'décédé' : 'perdu')
      });
    }
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleDelete = (pet: PetUI) => {
    setPetToDelete(pet);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    try {
      await deleteAnimalMutation.mutateAsync(petToDelete.dbId);
      
      toast({
        title: "Suppression réussie",
        description: `${petToDelete.name} a été supprimé avec succès de la base de données`,
      });
      
      setShowDeleteAlert(false);
      setPetToDelete(null);
    } catch (error) {
      console.error('Error deleting animal:', error);
      
      let errorMessage = "Erreur lors de la suppression de l'animal";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('foreign key') || errorMsg.includes('constraint')) {
          errorMessage = "Impossible de supprimer cet animal car il a des données associées (consultations, vaccinations, etc.). Supprimez d'abord ces données.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour supprimer cet animal.";
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (errorMsg.includes('authentication')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleShowDossier = (pet: PetUI) => {
    setSelectedPet(pet);
    setShowDossierModal(true);
  };

  const handleShowDossierFromView = () => {
    setShowViewModal(false);
    setShowDossierModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPet) return;
    
    // Basic validation
    if (!editForm.name?.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'animal est obligatoire.",
        variant: "destructive",
      });
      return;
    }
    
    if (!editForm.client_id) {
      toast({
        title: "Erreur de validation",
        description: "Le propriétaire est obligatoire.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for existing microchip number if one is provided
    if (editForm.microchip_number && editForm.microchip_number.trim()) {
      const existingAnimal = animals.find(animal => 
        animal.microchip_number === editForm.microchip_number.trim() && animal.id !== selectedPet.dbId
      );
      if (existingAnimal) {
        toast({
          title: "Erreur de validation",
          description: "Un animal avec ce numéro de puce existe déjà.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      await updateAnimalMutation.mutateAsync({
        id: selectedPet.dbId,
        data: editForm
      });
      
      toast({
        title: "Modification réussie",
        description: `${editForm.name} a été modifié avec succès.`,
      });
      
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating animal:', error);
      
      // Enhanced error handling
      let errorMessage = "Une erreur inattendue s'est produite";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('microchip') || errorMsg.includes('unique')) {
          errorMessage = "Ce numéro de puce électronique est déjà utilisé par un autre animal";
        } else if (errorMsg.includes('client') || errorMsg.includes('foreign key')) {
          errorMessage = "Le propriétaire sélectionné n'est plus valide";
        } else if (errorMsg.includes('name') || errorMsg.includes('not null')) {
          errorMessage = "Tous les champs obligatoires doivent être remplis";
        } else if (errorMsg.includes('authentication') || errorMsg.includes('not authenticated')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur lors de la modification",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Memoized consultations for selected pet to ensure reactivity
  const selectedPetConsultations = useMemo(() => {
    if (!selectedPet) return [];
    return getConsultationsByPetId(selectedPet.id).map(convertConsultationForStats);
  }, [selectedPet, getConsultationsByPetId, convertConsultationForStats]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Gestion des Animaux</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
        Suivez tous les animaux et leurs informations médicales
        </p>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
        size="sm" 
        variant={viewMode === 'cards' ? 'default' : 'outline'} 
        onClick={() => setViewMode('cards')}
        className="gap-2 flex-1 sm:flex-none"
        >
        <Grid className="h-4 w-4" />
        Cartes
        </Button>
        <Button 
        size="sm" 
        variant={viewMode === 'table' ? 'default' : 'outline'} 
        onClick={() => setViewMode('table')}
        className="gap-2 flex-1 sm:flex-none"
        >
        <List className="h-4 w-4" />
        Tableau
        </Button>
        <Button className="gap-2 medical-glow flex-1 sm:flex-none" onClick={() => setShowPetModal(true)}>
        <Plus className="h-4 w-4" />
        Nouvel Animal
        </Button>
      </div>
      </div>

      {/* Statistiques médicales globales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <div>
          <p className="text-sm text-muted-foreground">Total animaux</p>
          <p className="text-2xl font-bold">{stats?.totalAnimals || pets.length}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
          <p className="text-sm text-muted-foreground">En bonne santé</p>
          <p className="text-2xl font-bold">{stats?.animalsByStatus?.vivant || pets.filter(p => p.status === 'healthy').length}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <div>
          <p className="text-sm text-muted-foreground">En traitement</p>
          <p className="text-2xl font-bold">{pets.filter(p => p.status === 'treatment').length}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <div>
          <p className="text-sm text-muted-foreground">Clients actifs</p>
          <p className="text-2xl font-bold">{stats?.totalClients || clients.length}</p>
          </div>
        </div>
        </CardContent>
      </Card>
      </div>

      {/* Settings Indicator */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Configuration dynamique activée</p>
                <p className="text-xs text-muted-foreground">
                  Les types d'animaux sont configurables dans les paramètres
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{animalSpecies.length} espèces</span>
              <span>{Object.keys(animalBreeds).length} groupes de races</span>
              <span>{animalColors.length} couleurs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
        <Search className="h-5 w-5" />
        Rechercher et filtrer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
        placeholder="Rechercher par nom, race ou propriétaire..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md"
        />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Tous types" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">Tous types</SelectItem>
          {speciesList.map((sp, idx) => (
            <SelectItem key={idx} value={sp.toLowerCase()}>
            {sp}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">Tous statuts</SelectItem>
          <SelectItem value="healthy">En bonne santé</SelectItem>
          <SelectItem value="treatment">En traitement</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </CardContent>
      </Card>

      {viewMode === 'cards' ? (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPets.map((pet) => (
        <Card key={pet.id} className="card-hover">
          <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              {pet.photo ? (
                <AvatarImage src={pet.photo} alt={pet.name} />
              ) : (
                <AvatarFallback className="bg-primary-glow text-primary-foreground">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
                </AvatarFallback>
              )}
              </Avatar>
              
              <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold truncate">{pet.name}</h3>
              <p className="text-muted-foreground text-sm truncate">{pet.breed}</p>
              <Badge 
                variant="outline"
                className={`${statusStyles[pet.status as keyof typeof statusStyles]} text-xs`}
              >
                {pet.status === 'healthy' ? 'En bonne santé' : 
                 pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
              </Badge>
              </div>
            </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Type:</span> {pet.type}
            </div>
            <div>
              <span className="font-medium">Âge:</span> {pet.birthDate ? calculateAge(pet.birthDate) : 'Non renseigné'}
            </div>
            <div>
              <span className="font-medium">Poids:</span> {pet.weight}
            </div>
            <div>
              <span className="font-medium">Couleur:</span> {pet.color}
            </div>
            </div>
            
            <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">Propriétaire: {typeof pet.owner === 'string' ? pet.owner : 
               (() => {
                 const client = clients.find(c => String(c.id) === String(pet.ownerId));
                 return client ? `${client.first_name} ${client.last_name}` : 'Non spécifié';
               })()}</span>
               
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Dernière visite: {pet.lastVisit ? new Date(pet.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Consultations: {getConsultationsByPetId(pet.id).length}</span>
            </div>
            </div>
            
            <div className="space-y-2">
            <h4 className="font-medium text-sm">Vaccinations:</h4>
            <div className="text-sm text-muted-foreground">
              {(() => {
              const petVaccinations = getVaccinationsByPetId(pet.id);
              return petVaccinations.length > 0 ? (
                `${petVaccinations.length} vaccination${petVaccinations.length > 1 ? 's' : ''} enregistrée${petVaccinations.length > 1 ? 's' : ''}`
              ) : (
                'Aucune vaccination enregistrée'
              );
              })()}
            </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={() => handleView(pet)}>
              <Eye className="h-4 w-4" />
              Voir
            </Button>
            <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={() => handleEdit(pet)}>
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 flex-1 text-destructive hover:text-destructive-foreground hover:bg-destructive" 
              onClick={() => handleDelete(pet)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
            </div>
            
            <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => {
              setSelectedPet(pet);
              setShowConsultationModal(true);
            }}>
              <Stethoscope className="h-4 w-4 mr-2" />
              Consultation
            </Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleShowDossier(pet)}>
              <FileText className="h-4 w-4 mr-2" />
              Dossier
            </Button>
            </div>
          </div>
          </CardContent>
        </Card>
        ))}
      </div>
      ) : (
      <Card>
        <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead className="border-b">
            <tr className="text-left">
            <th className="p-4 font-medium">Animal</th>
            <th className="p-4 font-medium">Type</th>
            <th className="p-4 font-medium">Âge</th>
            <th className="p-4 font-medium">Propriétaire</th>
            <th className="p-4 font-medium">Statut</th>
            <th className="p-4 font-medium">Dernière visite</th>
            <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPets.map((pet) => (
            <tr key={pet.id} className="border-b hover:bg-muted/50">
              <td className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                {pet.photo ? (
                  <AvatarImage src={pet.photo} alt={pet.name} />
                ) : (
                  <AvatarFallback className="bg-primary-glow text-primary-foreground">
                  <Heart className="h-5 w-5" />
                  </AvatarFallback>
                )}
                </Avatar>
                <div>
                <div className="font-medium">{pet.name}</div>
                <div className="text-sm text-muted-foreground">{pet.breed}</div>
                </div>
              </div>
              </td>
              <td className="p-4">{pet.type}</td>
              <td className="p-4">{pet.birthDate ? calculateAge(pet.birthDate) : 'Non renseigné'}</td>
              <td className="p-4">
              {typeof pet.owner === 'string' ? pet.owner : 
               (() => {
                 const client = clients.find(c => String(c.id) === String(pet.ownerId));
                 return client ? `${client.first_name} ${client.last_name}` : 'Non spécifié';
               })()}
              </td>
              <td className="p-4">
              <Badge 
                variant="outline"
                className={statusStyles[pet.status as keyof typeof statusStyles]}
              >
                {pet.status === 'healthy' ? 'En bonne santé' : 
                 pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
              </Badge>
              </td>
              <td className="p-4">
              {pet.lastVisit ? new Date(pet.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'}
              </td>
              <td className="p-4">
              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleView(pet)}>
                <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(pet)}>
                <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => handleDelete(pet)}
                >
                <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShowDossier(pet)}>
                Dossier
                </Button>
              </div>
              </td>
            </tr>
            ))}
          </tbody>
          </table>
        </div>
        </CardContent>
      </Card>
      )}

        {/* Statistiques médicales détaillées pour l'animal sélectionné */}
      {selectedPet && (
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Activity className="h-5 w-5" />
          Statistiques médicales - {selectedPet.name}
        </CardTitle>
        </CardHeader>
        <CardContent>
        <MedicalStats 
          pet={selectedPet} 
          consultations={selectedPetConsultations} 
        />
        </CardContent>
      </Card>
      )}
      
      <NewPetModal 
      open={showPetModal} 
      onOpenChange={setShowPetModal} 
      />
      
      <NewConsultationModal 
      open={showConsultationModal} 
      onOpenChange={setShowConsultationModal} 
      prefillData={selectedPet ? { clientId: selectedPet.dbClientId, animalId: selectedPet.dbId } : undefined}
      />
      
      <PetViewModal
      open={showViewModal}
      onOpenChange={setShowViewModal}
      pet={selectedPet}
      onEdit={handleEditFromView}
      onShowDossier={handleShowDossierFromView}
      onDelete={selectedPet ? () => handleDelete(selectedPet) : undefined}
      />
      
      {/* Custom Dynamic Pet Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto mx-4">
        <DialogHeader>
        <DialogTitle>Modifier Animal</DialogTitle>
        <DialogDescription>
          Modifiez les informations de l'animal.
        </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          </div>
          <div className="space-y-2">
          <Label htmlFor="species">Espèce *</Label>
          <Select value={editForm.species} onValueChange={(value) => setEditForm(prev => ({ ...prev, species: value }))}>
            <SelectTrigger>
            <SelectValue placeholder="Sélectionner l'espèce" />
            </SelectTrigger>
            <SelectContent>
            {animalSpecies.map(species => (
              <SelectItem key={species} value={species}>{species}</SelectItem>
            ))}
            </SelectContent>
          </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client_id">Propriétaire *</Label>
          <Select value={editForm.client_id} onValueChange={(value) => setEditForm(prev => ({ ...prev, client_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le propriétaire" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.first_name} {client.last_name}
            </SelectItem>
            ))}
          </SelectContent>
          </Select>
             
        
    
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="breed">Race</Label>
          <Input
            id="breed"
            value={editForm.breed || ""}
            onChange={(e) => setEditForm(prev => ({ ...prev, breed: e.target.value }))}
          />
          </div>
          <div className="space-y-2">
          <Label htmlFor="sex">Sexe</Label>
          <Select value={editForm.sex} onValueChange={(value) => setEditForm(prev => ({ ...prev, sex: value as 'Mâle' | 'Femelle' | 'Inconnu' }))}>
            <SelectTrigger>
            <SelectValue placeholder="Sélectionner le sexe" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="Mâle">Mâle</SelectItem>
            <SelectItem value="Femelle">Femelle</SelectItem>
            <SelectItem value="Inconnu">Inconnu</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="birth_date">Date de naissance</Label>
          <Input
            id="birth_date"
            type="date"
            value={editForm.birth_date || ""}
            onChange={(e) => setEditForm(prev => ({ ...prev, birth_date: e.target.value || undefined }))}
          />
          </div>
          <div className="space-y-2">
          <Label htmlFor="weight">Poids (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={editForm.weight || ""}
            onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
          />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="color">Couleur</Label>
          <Input
            id="color"
            value={editForm.color || ""}
            onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
          />
          </div>
          <div className="space-y-2">
          <Label htmlFor="microchip_number">N° puce électronique</Label>
          <Input
            id="microchip_number"
            value={editForm.microchip_number || ""}
            onChange={(e) => setEditForm(prev => ({ ...prev, microchip_number: e.target.value }))}
          />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes médicales</Label>
          <Textarea
          id="notes"
          value={editForm.notes || ""}
          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes additionnelles..."
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">
          Annuler
          </Button>
          <Button onClick={handleSaveEdit} disabled={updateAnimalMutation.isPending} className="w-full sm:w-auto">
          {updateAnimalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sauvegarder
          </Button>
        </div>
        </div>
      </DialogContent>
      </Dialog>
      
      <SimplePetDossierModal
      open={showDossierModal}
      onOpenChange={setShowDossierModal}
      pet={selectedPet}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'animal <strong>{petToDelete?.name}</strong> ?
              Cette action est irréversible et supprimera définitivement toutes les données associées à cet animal, 
              y compris ses consultations, vaccinations et historique médical.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAnimalMutation.isPending}
            >
              {deleteAnimalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Pets = () => {
  return <PetsContent />;
};

export default Pets;