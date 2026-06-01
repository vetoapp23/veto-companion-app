import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Heart, Eye, Edit, Grid, List, Loader2, Trash2, PawPrint, Settings } from "lucide-react";
import { useAnimals, useCreateAnimal, useUpdateAnimal, useDeleteAnimal, useClients } from "@/hooks/useDatabase";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useToast } from "@/hooks/use-toast";
import { 
  useFarmManagementSettings,
  useAnimalColors,
  DEFAULT_SETTINGS
} from "@/hooks/useAppSettings";
import type { Animal, CreateAnimalData } from "@/lib/database";

const AnimalsPage = () => {
  const { data: animals, isLoading, error } = useAnimals();
  const { data: clients } = useClients();
  const { currentView } = useDisplayPreference('animals');
  
  // Settings hooks
  const { data: farmSettings } = useFarmManagementSettings();
  const { data: animalColors = DEFAULT_SETTINGS.animal_colors } = useAnimalColors();
  
  // Extract animal settings from farm management settings with fallbacks
  const animalSpecies = farmSettings?.animal_categories || ['Chien', 'Chat', 'Bovin', 'Ovin', 'Caprin'];
  const animalBreeds = farmSettings?.breeds_by_category || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  
  const createAnimalMutation = useCreateAnimal();
  const updateAnimalMutation = useUpdateAnimal();
  const deleteAnimalMutation = useDeleteAnimal();
  const { toast } = useToast();

  // Animal form data
  const [animalForm, setAnimalForm] = useState<CreateAnimalData>({
    client_id: '',
    name: '',
    species: animalSpecies[0] || 'Chien',
    breed: '',
    color: '',
    sex: 'Mâle',
    weight: 0,
    birth_date: '',
    microchip_number: '',
    sterilized: false,
    notes: ''
  });

  // Update available breeds when species changes
  const availableBreeds = animalBreeds[animalForm.species] || [];

  useEffect(() => {
    if (animalForm.species && availableBreeds.length > 0 && !availableBreeds.includes(animalForm.breed)) {
      setAnimalForm(prev => ({ ...prev, breed: '' }));
    }
  }, [animalForm.species, availableBreeds, animalForm.breed]);

  const filteredAnimals = animals?.filter(animal =>
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animalForm.client_id || !animalForm.name || !animalForm.species) {
      toast({
        title: "Erreur",
        description: "Le propriétaire, le nom et l'espèce sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAnimalMutation.mutateAsync(animalForm);
      
      toast({
        title: "Animal créé",
        description: `${animalForm.name} a été ajouté avec succès`,
      });
      
      setShowCreateModal(false);
      setAnimalForm({
        client_id: '',
        name: '',
        species: animalSpecies[0] || 'Chien',
        breed: '',
        color: '',
        sex: 'Mâle',
        weight: 0,
        birth_date: '',
        microchip_number: '',
        sterilized: false,
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnimal) return;

    try {
      await updateAnimalMutation.mutateAsync({
        id: selectedAnimal.id,
        data: animalForm
      });
      
      toast({
        title: "Animal mis à jour",
        description: `${animalForm.name} a été modifié avec succès`,
      });
      
      setShowEditModal(false);
      setSelectedAnimal(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAnimal = async (animal: Animal) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${animal.name} ?`)) {
      return;
    }

    try {
      await deleteAnimalMutation.mutateAsync(animal.id);
      
      toast({
        title: "Animal supprimé",
        description: `${animal.name} a été supprimé`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleView = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowViewModal(true);
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setAnimalForm({
      client_id: animal.client_id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || '',
      color: animal.color || '',
      sex: animal.sex || 'Mâle',
      weight: animal.weight || 0,
      birth_date: animal.birth_date || '',
      microchip_number: animal.microchip_number || '',
      sterilized: animal.sterilized || false,
      notes: animal.notes || ''
    });
    setShowEditModal(true);
  };

  const AnimalFormDialog = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={isEdit ? handleUpdateAnimal : handleCreateAnimal} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_id">Propriétaire *</Label>
          <Select
            value={animalForm.client_id}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, client_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
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

        <div>
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={animalForm.name}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nom de l'animal"
            required
          />
        </div>

        <div>
          <Label htmlFor="species">Espèce *</Label>
          <Select
            value={animalForm.species}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, species: value, breed: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une espèce" />
            </SelectTrigger>
            <SelectContent>
              {animalSpecies.map(species => (
                <SelectItem key={species} value={species}>
                  {species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="breed">Race</Label>
          <Select
            value={animalForm.breed}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, breed: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une race" />
            </SelectTrigger>
            <SelectContent>
              {availableBreeds.map(breed => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color">Couleur</Label>
          <Select
            value={animalForm.color}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, color: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une couleur" />
            </SelectTrigger>
            <SelectContent>
              {animalColors.map(color => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sex">Sexe</Label>
          <Select
            value={animalForm.sex}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, sex: value }))}
          >
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

        <div>
          <Label htmlFor="weight">Poids (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={animalForm.weight}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            placeholder="Poids en kg"
          />
        </div>

        <div>
          <Label htmlFor="birth_date">Date de naissance</Label>
          <Input
            id="birth_date"
            type="date"
            value={animalForm.birth_date}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, birth_date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="microchip_number">Numéro de puce</Label>
          <Input
            id="microchip_number"
            value={animalForm.microchip_number}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, microchip_number: e.target.value }))}
            placeholder="Numéro de puce électronique"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sterilized"
            checked={animalForm.sterilized}
            onCheckedChange={(checked) => setAnimalForm(prev => ({ ...prev, sterilized: checked }))}
          />
          <Label htmlFor="sterilized">Stérilisé(e)</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={animalForm.notes}
          onChange={(e) => setAnimalForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes additionnelles..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
            } else {
              setShowCreateModal(false);
            }
          }}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={createAnimalMutation.isPending || updateAnimalMutation.isPending}
        >
          {createAnimalMutation.isPending || updateAnimalMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Mise à jour..." : "Création..."}
            </>
          ) : (
            isEdit ? "Mettre à jour" : "Créer"
          )}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement des animaux</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PawPrint className="h-8 w-8" />
            Animaux
          </h1>
          <p className="text-muted-foreground">
            Gestion des animaux et de leurs informations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel animal</DialogTitle>
              </DialogHeader>
              <AnimalFormDialog />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un animal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid className="h-4 w-4" />
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

      {/* Settings Info */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Configuration dynamique activée</p>
                <p className="text-xs text-muted-foreground">
                  Les espèces, races et couleurs sont configurables dans les paramètres
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

      {/* Animals Display */}
      {filteredAnimals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun animal trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Aucun animal ne correspond à votre recherche." : "Commencez par ajouter votre premier animal."}
            </p>
            {!searchTerm && (
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un animal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel animal</DialogTitle>
                  </DialogHeader>
                  <AnimalFormDialog />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {animal.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{animal.name}</h3>
                      <p className="text-sm text-muted-foreground">{animal.species}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(animal)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(animal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteAnimal(animal)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {animal.breed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Race:</span>
                      <span>{animal.breed}</span>
                    </div>
                  )}
                  {animal.color && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Couleur:</span>
                      <span>{animal.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Propriétaire:</span>
                    <span>{animal.owner_name}</span>
                  </div>
                  {animal.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Poids:</span>
                      <span>{animal.weight} kg</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">{animal.sex}</Badge>
                  {animal.sterilized && (
                    <Badge variant="outline">Stérilisé</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Espèce</TableHead>
                  <TableHead>Race</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.name}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed || '-'}</TableCell>
                    <TableCell>{animal.color || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{animal.sex}</Badge>
                    </TableCell>
                    <TableCell>{animal.owner_name}</TableCell>
                    <TableCell>{animal.weight ? `${animal.weight} kg` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleView(animal)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(animal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteAnimal(animal)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Animal Dialog */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'animal</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedAnimal.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedAnimal.name}</h2>
                  <p className="text-muted-foreground">{selectedAnimal.species}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Race</Label>
                  <p className="text-sm">{selectedAnimal.breed || 'Non spécifiée'}</p>
                </div>
                <div>
                  <Label>Couleur</Label>
                  <p className="text-sm">{selectedAnimal.color || 'Non spécifiée'}</p>
                </div>
                <div>
                  <Label>Sexe</Label>
                  <p className="text-sm">{selectedAnimal.sex}</p>
                </div>
                <div>
                  <Label>Poids</Label>
                  <p className="text-sm">{selectedAnimal.weight ? `${selectedAnimal.weight} kg` : 'Non spécifié'}</p>
                </div>
                <div>
                  <Label>Date de naissance</Label>
                  <p className="text-sm">{selectedAnimal.birth_date || 'Non spécifiée'}</p>
                </div>
                <div>
                  <Label>Numéro de puce</Label>
                  <p className="text-sm">{selectedAnimal.microchip_number || 'Non spécifié'}</p>
                </div>
                <div>
                  <Label>Stérilisation</Label>
                  <p className="text-sm">{selectedAnimal.sterilized ? 'Oui' : 'Non'}</p>
                </div>
                <div>
                  <Label>Propriétaire</Label>
                  <p className="text-sm">{selectedAnimal.owner_name}</p>
                </div>
              </div>

              {selectedAnimal.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedAnimal.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Animal Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'animal</DialogTitle>
          </DialogHeader>
          <AnimalFormDialog isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalsPage;