// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Search, Heart, Eye, Edit, Grid, List, Loader2, Trash2, PawPrint } from "lucide-react";
// import { useAnimals, useCreateAnimal, useUpdateAnimal, useDeleteAnimal, useClients } from "@/hooks/useDatabase";
// import { useDisplayPreference } from "@/hooks/use-display-preference";
// import { useToast } from "@/hooks/use-toast";
// import type { Animal, CreateAnimalData } from "@/lib/database";

// const AnimalsPage = () => {
//   const { data: animals, isLoading, error } = useAnimals();
//   const { data: clients } = useClients();
//   const { currentView } = useDisplayPreference('animals');
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
  
//   const createAnimalMutation = useCreateAnimal();
//   const updateAnimalMutation = useUpdateAnimal();
//   const deleteAnimalMutation = useDeleteAnimal();
//   const { toast } = useToast();

//   // Animal form data
//   const [animalForm, setAnimalForm] = useState<CreateAnimalData>({
//     client_id: '',
//     name: '',
//     species: 'Chien',
//     breed: '',
//     color: '',
//     sex: 'Mâle',
//     weight: 0,
//     birth_date: '',
//     microchip_number: '',
//     sterilized: false,
//     notes: ''
//   });

//   const filteredAnimals = animals?.filter(animal =>
//     animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     animal.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   const handleCreateAnimal = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!animalForm.client_id || !animalForm.name || !animalForm.species) {
//       toast({
//         title: "Erreur",
//         description: "Le propriétaire, le nom et l'espèce sont obligatoires",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       await createAnimalMutation.mutateAsync(animalForm);
      
//       toast({
//         title: "Animal créé",
//         description: `${animalForm.name} a été ajouté avec succès`,
//       });
      
//       setShowCreateModal(false);
//       setAnimalForm({
//         client_id: '',
//         name: '',
//         species: 'Chien',
//         breed: '',
//         color: '',
//         sex: 'Mâle',
//         weight: 0,
//         birth_date: '',
//         microchip_number: '',
//         sterilized: false,
//         notes: ''
//       });
//     } catch (error: any) {
//       toast({
//         title: "Erreur",
//         description: error.message,
//         variant: "destructive"
//       });
//     }
//   };

//   const handleUpdateAnimal = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!selectedAnimal) return;

//     try {
//       await updateAnimalMutation.mutateAsync({
//         id: selectedAnimal.id,
//         data: animalForm
//       });
      
//       toast({
//         title: "Animal mis à jour",
//         description: `${animalForm.name} a été modifié avec succès`,
//       });
      
//       setShowEditModal(false);
//       setSelectedAnimal(null);
//     } catch (error: any) {
//       toast({
//         title: "Erreur",
//         description: error.message,
//         variant: "destructive"
//       });
//     }
//   };

//   const handleDeleteAnimal = async (animal: Animal) => {
//     if (!confirm(`Êtes-vous sûr de vouloir supprimer ${animal.name} ?`)) {
//       return;
//     }

//     try {
//       await deleteAnimalMutation.mutateAsync(animal.id);
      
//       toast({
//         title: "Animal supprimé",
//         description: `${animal.name} a été supprimé`,
//       });
//     } catch (error: any) {
//       toast({
//         title: "Erreur",
//         description: error.message,
//         variant: "destructive"
//       });
//     }
//   };

//   const handleView = (animal: Animal) => {
//     setSelectedAnimal(animal);
//     setShowViewModal(true);
//   };

//   const handleEdit = (animal: Animal) => {
//     setSelectedAnimal(animal);
//     setAnimalForm({
//       client_id: animal.client_id,
//       name: animal.name,
//       species: animal.species,
//       breed: animal.breed || '',
//       color: animal.color || '',
//       sex: animal.sex,
//       weight: animal.weight || 0,
//       birth_date: animal.birth_date || '',
//       microchip_number: animal.microchip_number || '',
//       sterilized: animal.sterilized || false,
//       notes: animal.notes || ''
//     });
//     setShowEditModal(true);
//   };

//   const getSpeciesIcon = (species: string) => {
//     switch (species.toLowerCase()) {
//       case 'chien': return '🐕';
//       case 'chat': return '🐱';
//       case 'lapin': return '🐰';
//       case 'oiseau': return '🐦';
//       case 'hamster': return '🐹';
//       default: return '🐾';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'vivant': return 'bg-green-100 text-green-800';
//       case 'décédé': return 'bg-red-100 text-red-800';
//       case 'perdu': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const calculateAge = (birthDate: string) => {
//     if (!birthDate) return 'Âge inconnu';
    
//     const birth = new Date(birthDate);
//     const today = new Date();
//     const diffInMs = today.getTime() - birth.getTime();
//     const ageInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365.25));
    
//     if (ageInYears < 1) {
//       const ageInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30.44));
//       return `${ageInMonths} mois`;
//     }
    
//     return `${ageInYears} an${ageInYears > 1 ? 's' : ''}`;
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-6 py-8">
//         <div className="flex items-center justify-center min-h-64">
//           <Loader2 className="h-8 w-8 animate-spin" />
//           <span className="ml-2">Chargement des animaux...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-6 py-8">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <p className="text-red-600">Erreur lors du chargement des animaux</p>
//               <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-6 py-8 space-y-8">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Gestion des Animaux</h1>
//           <p className="text-muted-foreground mt-2">
//             Gérez tous les animaux de vos clients
//           </p>
//         </div>
//         <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
//           <DialogTrigger asChild>
//             <Button className="gap-2">
//               <Plus className="h-4 w-4" />
//               Nouvel Animal
//             </Button>
//           </DialogTrigger>
//         </Dialog>
//       </div>

//       {/* Search and filters */}
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex-1 max-w-md">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Rechercher un animal..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Button
//             variant={viewMode === 'cards' ? 'default' : 'outline'}
//             size="sm"
//             onClick={() => setViewMode('cards')}
//           >
//             <Grid className="h-4 w-4" />
//           </Button>
//           <Button
//             variant={viewMode === 'table' ? 'default' : 'outline'}
//             size="sm"
//             onClick={() => setViewMode('table')}
//           >
//             <List className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Animal count */}
//       <div className="flex items-center gap-4">
//         <Badge variant="secondary">
//           {filteredAnimals.length} animal{filteredAnimals.length !== 1 ? 'x' : ''}
//         </Badge>
//       </div>

//       {/* Animals display */}
//       {viewMode === 'cards' ? (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {filteredAnimals.map((animal) => (
//             <Card key={animal.id} className="hover:shadow-md transition-shadow">
//               <CardHeader className="pb-3">
//                 <div className="flex items-center gap-3">
//                   <div className="text-2xl">
//                     {getSpeciesIcon(animal.species)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-semibold truncate">
//                       {animal.name}
//                     </h3>
//                     <p className="text-sm text-muted-foreground">
//                       {animal.species} • {animal.breed}
//                     </p>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Badge className={getStatusColor(animal.status)}>
//                         {animal.status}
//                       </Badge>
//                       <Badge variant="outline">
//                         {animal.sex}
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-0 space-y-2">
//                 <div className="text-sm text-muted-foreground">
//                   <strong>Propriétaire:</strong> {animal.owner_name}
//                 </div>
//                 <div className="text-sm text-muted-foreground">
//                   <strong>Âge:</strong> {calculateAge(animal.birth_date)}
//                 </div>
//                 {animal.weight && (
//                   <div className="text-sm text-muted-foreground">
//                     <strong>Poids:</strong> {animal.weight} kg
//                   </div>
//                 )}
//                 {animal.color && (
//                   <div className="text-sm text-muted-foreground">
//                     <strong>Couleur:</strong> {animal.color}
//                   </div>
//                 )}
                
//                 <div className="flex items-center gap-2 pt-3">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleView(animal)}
//                     className="gap-1"
//                   >
//                     <Eye className="h-4 w-4" />
//                     Voir
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleEdit(animal)}
//                     className="gap-1"
//                   >
//                     <Edit className="h-4 w-4" />
//                     Modifier
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleDeleteAnimal(animal)}
//                     className="gap-1 text-red-600 hover:text-red-700"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <Card>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Animal</TableHead>
//                 <TableHead>Propriétaire</TableHead>
//                 <TableHead>Espèce/Race</TableHead>
//                 <TableHead>Âge</TableHead>
//                 <TableHead>Poids</TableHead>
//                 <TableHead>Statut</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredAnimals.map((animal) => (
//                 <TableRow key={animal.id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       <div className="text-lg">
//                         {getSpeciesIcon(animal.species)}
//                       </div>
//                       <div>
//                         <div className="font-medium">{animal.name}</div>
//                         <div className="text-sm text-muted-foreground">
//                           {animal.sex} • {animal.color}
//                         </div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>{animal.owner_name}</TableCell>
//                   <TableCell>
//                     <div>
//                       {animal.species}
//                       {animal.breed && (
//                         <div className="text-sm text-muted-foreground">
//                           {animal.breed}
//                         </div>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>{calculateAge(animal.birth_date)}</TableCell>
//                   <TableCell>
//                     {animal.weight ? `${animal.weight} kg` : '-'}
//                   </TableCell>
//                   <TableCell>
//                     <Badge className={getStatusColor(animal.status)}>
//                       {animal.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleView(animal)}
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleEdit(animal)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDeleteAnimal(animal)}
//                         className="text-red-600 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {filteredAnimals.length === 0 && (
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">Aucun animal trouvé</h3>
//               <p className="text-muted-foreground mb-4">
//                 {searchTerm ? 'Aucun animal ne correspond à votre recherche.' : 'Commencez par ajouter votre premier animal.'}
//               </p>
//               {!searchTerm && (
//                 <Button onClick={() => setShowCreateModal(true)} className="gap-2">
//                   <Plus className="h-4 w-4" />
//                   Nouvel Animal
//                 </Button>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Create Animal Modal */}
//       <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Nouvel Animal</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleCreateAnimal} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="client_id">Propriétaire *</Label>
//                 <Select value={animalForm.client_id} onValueChange={(value) => setAnimalForm(prev => ({ ...prev, client_id: value }))}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Sélectionner un client" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {clients?.map((client) => (
//                       <SelectItem key={client.id} value={client.id}>
//                         {client.first_name} {client.last_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="name">Nom de l'animal *</Label>
//                 <Input
//                   id="name"
//                   value={animalForm.name}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                 />
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="species">Espèce *</Label>
//                 <Select value={animalForm.species} onValueChange={(value) => setAnimalForm(prev => ({ ...prev, species: value }))}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Chien">Chien</SelectItem>
//                     <SelectItem value="Chat">Chat</SelectItem>
//                     <SelectItem value="Lapin">Lapin</SelectItem>
//                     <SelectItem value="Oiseau">Oiseau</SelectItem>
//                     <SelectItem value="Hamster">Hamster</SelectItem>
//                     <SelectItem value="Autre">Autre</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="breed">Race</Label>
//                 <Input
//                   id="breed"
//                   value={animalForm.breed}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, breed: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="sex">Sexe</Label>
//                 <Select value={animalForm.sex} onValueChange={(value: any) => setAnimalForm(prev => ({ ...prev, sex: value }))}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Mâle">Mâle</SelectItem>
//                     <SelectItem value="Femelle">Femelle</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="color">Couleur</Label>
//                 <Input
//                   id="color"
//                   value={animalForm.color}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, color: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="weight">Poids (kg)</Label>
//                 <Input
//                   id="weight"
//                   type="number"
//                   step="0.1"
//                   value={animalForm.weight || ''}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="birth_date">Date de naissance</Label>
//                 <Input
//                   id="birth_date"
//                   type="date"
//                   value={animalForm.birth_date}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, birth_date: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="microchip_number">Numéro de puce</Label>
//               <Input
//                 id="microchip_number"
//                 value={animalForm.microchip_number}
//                 onChange={(e) => setAnimalForm(prev => ({ ...prev, microchip_number: e.target.value }))}
//               />
//             </div>

//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="sterilized"
//                 checked={animalForm.sterilized}
//                 onChange={(e) => setAnimalForm(prev => ({ ...prev, sterilized: e.target.checked }))}
//                 className="rounded border-gray-300"
//               />
//               <Label htmlFor="sterilized">Stérilisé</Label>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="notes">Notes</Label>
//               <Textarea
//                 id="notes"
//                 value={animalForm.notes}
//                 onChange={(e) => setAnimalForm(prev => ({ ...prev, notes: e.target.value }))}
//                 rows={3}
//               />
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
//                 Annuler
//               </Button>
//               <Button type="submit" disabled={createAnimalMutation.isPending}>
//                 {createAnimalMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Création...
//                   </>
//                 ) : (
//                   'Créer l\'animal'
//                 )}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Animal Modal */}
//       <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Modifier l'Animal</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleUpdateAnimal} className="space-y-4">
//             {/* Same form fields as create */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="edit_client_id">Propriétaire *</Label>
//                 <Select value={animalForm.client_id} onValueChange={(value) => setAnimalForm(prev => ({ ...prev, client_id: value }))}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Sélectionner un client" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {clients?.map((client) => (
//                       <SelectItem key={client.id} value={client.id}>
//                         {client.first_name} {client.last_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="edit_name">Nom *</Label>
//                 <Input
//                   id="edit_name"
//                   value={animalForm.name}
//                   onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                 />
//               </div>
//             </div>

//             {/* Add remaining fields similarly */}

//             <div className="flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
//                 Annuler
//               </Button>
//               <Button type="submit" disabled={updateAnimalMutation.isPending}>
//                 {updateAnimalMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Mise à jour...
//                   </>
//                 ) : (
//                   'Mettre à jour'
//                 )}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* View Animal Modal */}
//       <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Détails de l'Animal</DialogTitle>
//           </DialogHeader>
//           {selectedAnimal && (
//             <div className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <div className="text-4xl">
//                   {getSpeciesIcon(selectedAnimal.species)}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold">{selectedAnimal.name}</h3>
//                   <p className="text-muted-foreground">
//                     {selectedAnimal.species} • {selectedAnimal.breed}
//                   </p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <Badge className={getStatusColor(selectedAnimal.status)}>
//                       {selectedAnimal.status}
//                     </Badge>
//                     <Badge variant="outline">
//                       {selectedAnimal.sex}
//                     </Badge>
//                     {selectedAnimal.sterilized && (
//                       <Badge variant="outline">Stérilisé</Badge>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label>Propriétaire</Label>
//                   <p className="text-sm">{selectedAnimal.owner_name}</p>
//                 </div>
//                 <div>
//                   <Label>Âge</Label>
//                   <p className="text-sm">{calculateAge(selectedAnimal.birth_date)}</p>
//                 </div>
//                 {selectedAnimal.weight && (
//                   <div>
//                     <Label>Poids</Label>
//                     <p className="text-sm">{selectedAnimal.weight} kg</p>
//                   </div>
//                 )}
//                 {selectedAnimal.color && (
//                   <div>
//                     <Label>Couleur</Label>
//                     <p className="text-sm">{selectedAnimal.color}</p>
//                   </div>
//                 )}
//                 {selectedAnimal.microchip_number && (
//                   <div>
//                     <Label>Numéro de puce</Label>
//                     <p className="text-sm">{selectedAnimal.microchip_number}</p>
//                   </div>
//                 )}
//               </div>

//               {selectedAnimal.notes && (
//                 <div>
//                   <Label>Notes</Label>
//                   <p className="text-sm">{selectedAnimal.notes}</p>
//                 </div>
//               )}

//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setShowViewModal(false)}>
//                   Fermer
//                 </Button>
//                 <Button onClick={() => { setShowViewModal(false); handleEdit(selectedAnimal); }}>
//                   Modifier
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AnimalsPage;
