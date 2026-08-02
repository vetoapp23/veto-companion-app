// @ts-nocheck
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
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

  const sexLabel = (sex?: string | null) => {
    if (!sex) return "";
    if (["Mâle", "Male", "Macho"].includes(sex)) return t("animalsWithSettings.sexMale");
    if (["Femelle", "Female", "Hembra"].includes(sex)) return t("animalsWithSettings.sexFemale");
    if (["Inconnu", "Unknown", "Desconocido"].includes(sex)) return t("animalsWithSettings.sexUnknown");
    return sex;
  };

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
        title: tc("error"),
        description: t("animalsWithSettings.ownerNameSpeciesRequired"),
        variant: "destructive"
      });
      return;
    }

    try {
      await createAnimalMutation.mutateAsync(animalForm);
      
      toast({
        title: t("animalsWithSettings.createdTitle"),
        description: t("animalsWithSettings.createdBody", { name: animalForm.name }),
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
        title: tc("error"),
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
        title: t("animalsWithSettings.updatedTitle"),
        description: t("animalsWithSettings.updatedBody", { name: animalForm.name }),
      });
      
      setShowEditModal(false);
      setSelectedAnimal(null);
    } catch (error: any) {
      toast({
        title: tc("error"),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAnimal = async (animal: Animal) => {
    if (!confirm(t("animalsWithSettings.deleteConfirm", { name: animal.name }))) {
      return;
    }

    try {
      await deleteAnimalMutation.mutateAsync(animal.id);
      
      toast({
        title: t("animalsWithSettings.deletedTitle"),
        description: t("animalsWithSettings.deletedBody", { name: animal.name }),
      });
    } catch (error: any) {
      toast({
        title: tc("error"),
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
          <Label htmlFor="client_id">{t("animalsWithSettings.owner")}</Label>
          <Select
            value={animalForm.client_id}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, client_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("animalsWithSettings.selectClient")} />
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
          <Label htmlFor="name">{t("animalsWithSettings.name")}</Label>
          <Input
            id="name"
            value={animalForm.name}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t("animalsWithSettings.namePlaceholder")}
            required
          />
        </div>

        <div>
          <Label htmlFor="species">{t("animalsWithSettings.species")}</Label>
          <Select
            value={animalForm.species}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, species: value, breed: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("animalsWithSettings.selectSpecies")} />
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
          <Label htmlFor="breed">{t("animalsWithSettings.breed")}</Label>
          <Select
            value={animalForm.breed}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, breed: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("animalsWithSettings.selectBreed")} />
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
          <Label htmlFor="color">{t("animalsWithSettings.color")}</Label>
          <Select
            value={animalForm.color}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, color: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("animalsWithSettings.selectColor")} />
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
          <Label htmlFor="sex">{t("animalsWithSettings.sex")}</Label>
          <Select
            value={animalForm.sex}
            onValueChange={(value) => setAnimalForm(prev => ({ ...prev, sex: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("animalsWithSettings.selectSex")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mâle">{t("animalsWithSettings.sexMale")}</SelectItem>
              <SelectItem value="Femelle">{t("animalsWithSettings.sexFemale")}</SelectItem>
              <SelectItem value="Inconnu">{t("animalsWithSettings.sexUnknown")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="weight">{t("animalsWithSettings.weightKg")}</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={animalForm.weight}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            placeholder={t("animalsWithSettings.weightPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="birth_date">{t("animalsWithSettings.birthDate")}</Label>
          <Input
            id="birth_date"
            type="date"
            value={animalForm.birth_date}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, birth_date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="microchip_number">{t("animalsWithSettings.microchip")}</Label>
          <Input
            id="microchip_number"
            value={animalForm.microchip_number}
            onChange={(e) => setAnimalForm(prev => ({ ...prev, microchip_number: e.target.value }))}
            placeholder={t("animalsWithSettings.microchipPlaceholder")}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sterilized"
            checked={animalForm.sterilized}
            onCheckedChange={(checked) => setAnimalForm(prev => ({ ...prev, sterilized: checked }))}
          />
          <Label htmlFor="sterilized">{t("animalsWithSettings.sterilized")}</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t("animalsWithSettings.notes")}</Label>
        <Textarea
          id="notes"
          value={animalForm.notes}
          onChange={(e) => setAnimalForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder={t("animalsWithSettings.notesPlaceholder")}
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
          {tc("cancel")}
        </Button>
        <Button 
          type="submit" 
          disabled={createAnimalMutation.isPending || updateAnimalMutation.isPending}
        >
          {createAnimalMutation.isPending || updateAnimalMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? t("animalsWithSettings.updating") : t("animalsWithSettings.creating")}
            </>
          ) : (
            isEdit ? t("animalsWithSettings.update") : t("animalsWithSettings.create")
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
        <p className="text-red-500">{t("animalsWithSettings.loadError")}</p>
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
            {t("animalsWithSettings.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("animalsWithSettings.description")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("animalsWithSettings.new")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("animalsWithSettings.addTitle")}</DialogTitle>
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
            placeholder={t("animalsWithSettings.searchPlaceholder")}
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
                <p className="text-sm font-medium">{t("animalsWithSettings.dynamicConfig")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("animalsWithSettings.dynamicConfigHint")}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{t("animalsWithSettings.speciesCount", { count: animalSpecies.length })}</span>
              <span>{t("animalsWithSettings.breedGroupsCount", { count: Object.keys(animalBreeds).length })}</span>
              <span>{t("animalsWithSettings.colorsCount", { count: animalColors.length })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animals Display */}
      {filteredAnimals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("animalsWithSettings.empty")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? t("animalsWithSettings.emptySearch") : t("animalsWithSettings.emptyHint")}
            </p>
            {!searchTerm && (
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("animalsWithSettings.addAnimal")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("animalsWithSettings.addTitle")}</DialogTitle>
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
                      <span className="text-muted-foreground">{t("animalsWithSettings.breed")}:</span>
                      <span>{animal.breed}</span>
                    </div>
                  )}
                  {animal.color && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("animalsWithSettings.color")}:</span>
                      <span>{animal.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("animalsWithSettings.ownerLabel")}:</span>
                    <span>{animal.owner_name}</span>
                  </div>
                  {animal.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("animalsWithSettings.weightLabel")}:</span>
                      <span>{animal.weight} kg</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">{sexLabel(animal.sex)}</Badge>
                  {animal.sterilized && (
                    <Badge variant="outline">{t("animalsWithSettings.sterilizedBadge")}</Badge>
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
                  <TableHead>{t("animalsWithSettings.columns.name")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.species")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.breed")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.color")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.sex")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.owner")}</TableHead>
                  <TableHead>{t("animalsWithSettings.columns.weight")}</TableHead>
                  <TableHead className="text-right">{t("animalsWithSettings.columns.actions")}</TableHead>
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
                      <Badge variant="secondary">{sexLabel(animal.sex)}</Badge>
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
            <DialogTitle>{t("animalsWithSettings.viewTitle")}</DialogTitle>
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
                  <Label>{t("animalsWithSettings.breed")}</Label>
                  <p className="text-sm">{selectedAnimal.breed || t("animalsWithSettings.notSpecified")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.color")}</Label>
                  <p className="text-sm">{selectedAnimal.color || t("animalsWithSettings.notSpecified")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.sex")}</Label>
                  <p className="text-sm">{sexLabel(selectedAnimal.sex)}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.weightLabel")}</Label>
                  <p className="text-sm">{selectedAnimal.weight ? `${selectedAnimal.weight} kg` : t("animalsWithSettings.notSpecified")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.birthDate")}</Label>
                  <p className="text-sm">{selectedAnimal.birth_date || t("animalsWithSettings.notSpecified")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.microchip")}</Label>
                  <p className="text-sm">{selectedAnimal.microchip_number || t("animalsWithSettings.notSpecified")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.sterilization")}</Label>
                  <p className="text-sm">{selectedAnimal.sterilized ? tc("yes") : tc("no")}</p>
                </div>
                <div>
                  <Label>{t("animalsWithSettings.ownerLabel")}</Label>
                  <p className="text-sm">{selectedAnimal.owner_name}</p>
                </div>
              </div>

              {selectedAnimal.notes && (
                <div>
                  <Label>{t("animalsWithSettings.notes")}</Label>
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
            <DialogTitle>{t("animalsWithSettings.editTitle")}</DialogTitle>
          </DialogHeader>
          <AnimalFormDialog isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalsPage;
