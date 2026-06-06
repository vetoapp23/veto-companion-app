// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, Mail, MapPin, Eye, Edit, Heart, Grid, List, Loader2, Trash2 } from "lucide-react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { useClients, useAnimals, useUpdateClient, useDeleteClient } from "@/hooks/useDatabase";
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
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useToast } from "@/hooks/use-toast";
import { useAnimalSpecies, useClientTypes } from '@/hooks/useAppSettings';
import type { Client as DBClient, Animal, CreateClientData } from "@/lib/database";

// Interface matching the old UI structure
interface ClientUI {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pets: Array<{
    id: number;
    name: string;
    type: string;
    breed?: string;
  }>;
  lastVisit: string;
  totalVisits: number;
  dbId: string; // Store original DB UUID for updates
}

const convertDatabaseClient = (dbClient: DBClient, animals: Animal[]): ClientUI => {
  const clientAnimals = animals.filter(animal => animal.client_id === dbClient.id);
  
  // Convert UUID to number for compatibility (using hash)
  const clientId = Math.abs(dbClient.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const pets = clientAnimals.map(animal => {
    const petId = Math.abs(animal.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
    
    return {
      id: petId,
      name: animal.name,
      type: animal.species,
      breed: animal.breed || ''
    };
  });

  return {
    id: clientId,
    name: `${dbClient.first_name} ${dbClient.last_name}`,
    firstName: dbClient.first_name,
    lastName: dbClient.last_name,
    email: dbClient.email || '',
    phone: dbClient.phone || dbClient.mobile_phone || '',
    address: dbClient.address || '',
    city: dbClient.city,
    pets,
    lastVisit: new Date(dbClient.updated_at).toLocaleDateString('fr-FR'),
    totalVisits: 0, // Placeholder - would need consultation data
    // Store original DB ID for updates
    dbId: dbClient.id
  };
};

const ClientsContent = () => {
  const { data: dbClients = [], isLoading: clientsLoading } = useClients();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const { toast } = useToast();
  
  // Dynamic settings
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: clientTypes = [], isLoading: clientTypesLoading } = useClientTypes();
  
  // Convert to old format for compatibility
  const clients = dbClients.map(dbClient => convertDatabaseClient(dbClient, animals));
  
  const { currentView } = useDisplayPreference('clients');
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientUI | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientUI | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState<CreateClientData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile_phone: '',
    address: '',
    city: 'Rabat',
    postal_code: '',
    country: 'Maroc',
    notes: '',
    client_type: 'particulier'
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecies = speciesFilter === "all" || 
      client.pets.some(pet => pet.type === speciesFilter);
    
    return matchesSearch && matchesSpecies;
  });

  const handleView = (client: ClientUI) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: ClientUI) => {
    setSelectedClient(client);
    // Populate edit form with client data
    setEditForm({
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      phone: client.phone,
      mobile_phone: '',
      address: client.address,
      city: client.city,
      postal_code: '',
      country: 'Maroc',
      notes: '',
      client_type: 'particulier'
    });
    setShowEditModal(true);
  };

  const handleDelete = (client: ClientUI) => {
    setClientToDelete(client);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClientMutation.mutateAsync(clientToDelete.dbId);
      
      toast({
        title: "Client supprimé",
        description: `${clientToDelete.name} a été supprimé avec succès`,
      });
      
      setShowDeleteAlert(false);
      setClientToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du client",
        variant: "destructive"
      });
    }
  };

  const handleEditFromView = () => {
    if (selectedClient) {
      setEditForm({
        first_name: selectedClient.firstName,
        last_name: selectedClient.lastName,
        email: selectedClient.email,
        phone: selectedClient.phone,
        mobile_phone: '',
        address: selectedClient.address,
        city: selectedClient.city,
        postal_code: '',
        country: 'Maroc',
        notes: '',
        client_type: 'particulier'
      });
    }
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !editForm.first_name || !editForm.last_name) {
      toast({
        title: "Erreur",
        description: "Le prénom et le nom sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        id: selectedClient.dbId,
        data: editForm
      });
      
      toast({
        title: "Client modifié",
        description: `${editForm.first_name} ${editForm.last_name} a été modifié avec succès`,
      });
      
      setShowEditModal(false);
      setSelectedClient(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la modification du client",
        variant: "destructive"
      });
    }
  };

  if (clientsLoading || animalsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Clients</h1>
        <p className="text-muted-foreground mt-2">
        Gérez tous vos clients et leurs informations
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
        size="sm" 
        variant={viewMode === 'cards' ? 'default' : 'outline'} 
        onClick={() => setViewMode('cards')}
        className="gap-2 w-full sm:w-auto"
        >
        <Grid className="h-4 w-4" />
        Cartes
        </Button>
        <Button 
        size="sm" 
        variant={viewMode === 'table' ? 'default' : 'outline'} 
        onClick={() => setViewMode('table')}
        className="gap-2 w-full sm:w-auto"
        >
        <List className="h-4 w-4" />
        Tableau
        </Button>
        <Button className="gap-2 medical-glow w-full sm:w-auto" onClick={() => setShowClientModal(true)}>
        <Plus className="h-4 w-4" />
        Nouveau Client
        </Button>
      </div>
      </div>

      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Rechercher un client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            placeholder="Rechercher par nom, email ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
      </CardContent>
      </Card>

      {viewMode === 'cards' ? (
      <div className="grid gap-6">
        {filteredClients.map((client) => (
        <Card key={client.id} className="card-hover">
          <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-lg">
              {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
              <h3 className="text-lg sm:text-xl font-semibold">{client.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                <Mail className="h-3 w-3" />
                {client.email}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-3 w-3" />
                {client.address}
                </div>
              </div>
              </div>
              
              <div className="space-y-2">
              <h4 className="font-medium flex items-center justify-center sm:justify-start gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Animaux ({client.pets.length})
              </h4>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                {client.pets.length > 0 ? (
                client.pets.map((pet, index) => (
                  <Badge key={pet.id || index} variant="secondary" className="gap-1">
                  {pet.name} - {pet.type} {pet.breed && `(${pet.breed})`}
                  </Badge>
                ))
                ) : (
                <span className="text-sm text-muted-foreground">Aucun animal enregistré</span>
                )}
              </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm justify-center sm:justify-start">
              <span>
                <strong>Dernière visite:</strong> {client.lastVisit}
              </span>
              <span>
                <strong>Total visites:</strong> {client.totalVisits}
              </span>
              </div>
            </div>
            </div>
            
            <div className="flex gap-2 justify-center sm:justify-end">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleView(client)}>
              <Eye className="h-4 w-4" />
              Voir
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEdit(client)}>
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive" 
              onClick={() => handleDelete(client)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
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
          <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
            <th className="p-2 sm:p-4 font-medium">Client</th>
            <th className="p-2 sm:p-4 font-medium hidden sm:table-cell">Contact</th>
            <th className="p-2 sm:p-4 font-medium hidden md:table-cell">Animaux</th>
            <th className="p-2 sm:p-4 font-medium hidden lg:table-cell">Dernière visite</th>
            <th className="p-2 sm:p-4 font-medium hidden lg:table-cell">Total visites</th>
            <th className="p-2 sm:p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
            <tr key={client.id} className="border-b hover:bg-muted/50">
              <td className="p-2 sm:p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
                </Avatar>
                <div>
                <div className="font-medium text-sm sm:text-base">{client.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{client.address}</div>
                </div>
              </div>
              </td>
              <td className="p-2 sm:p-4 hidden sm:table-cell">
              <div className="space-y-1">
                <div className="text-xs sm:text-sm">{client.email}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{client.phone}</div>
              </div>
              </td>
              <td className="p-2 sm:p-4 hidden md:table-cell">
              <div className="flex gap-1 flex-wrap">
                {client.pets.length > 0 ? (
                client.pets.map((pet, index) => (
                  <Badge key={pet.id || index} variant="secondary" className="text-xs">
                  {pet.name}
                  </Badge>
                ))
                ) : (
                <span className="text-xs text-muted-foreground">Aucun</span>
                )}
              </div>
              </td>
              <td className="p-2 sm:p-4 hidden lg:table-cell text-sm">
              {client.lastVisit}
              </td>
              <td className="p-2 sm:p-4 hidden lg:table-cell text-sm">
              {client.totalVisits}
              </td>
              <td className="p-2 sm:p-4">
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleView(client)}>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => handleDelete(client)}
                >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
      
      <NewClientModal 
      open={showClientModal} 
      onOpenChange={setShowClientModal} 
      />
      
      {/* Simple Client View Modal */}
      {selectedClient && showViewModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
          Profil Client - {selectedClient.name}
          <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
            ✕
          </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <p>{selectedClient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p>{selectedClient.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Téléphone</label>
            <p>{selectedClient.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Ville</label>
            <p>{selectedClient.city}</p>
          </div>
          </div>
          <div>
          <label className="text-sm font-medium">Adresse</label>
          <p>{selectedClient.address}</p>
          </div>
          <div>
          <label className="text-sm font-medium">Animaux ({selectedClient.pets.length})</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {selectedClient.pets.map((pet, index) => (
            <Badge key={pet.id || index} variant="secondary">
              {pet.name} - {pet.type} {pet.breed && `(${pet.breed})`}
            </Badge>
            ))}
          </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={() => handleEditFromView()} className="w-full sm:w-auto">Modifier</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowViewModal(false);
              if (selectedClient) {
                handleDelete(selectedClient);
              }
            }} 
            className="w-full sm:w-auto text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            Supprimer
          </Button>
          <Button variant="outline" onClick={() => setShowViewModal(false)} className="w-full sm:w-auto">Fermer</Button>
          </div>
        </CardContent>
        </Card>
      </div>
      )}
      
      {/* Dynamic Client Edit Modal */}
      {selectedClient && showEditModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
          Modifier Client - {selectedClient.name}
          <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
            ✕
          </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="edit_first_name">Prénom *</Label>
            <Input
              id="edit_first_name"
              value={editForm.first_name}
              onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Prénom du client"
              required
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_last_name">Nom *</Label>
            <Input
              id="edit_last_name"
              value={editForm.last_name}
              onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Nom du client"
              required
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_phone">Téléphone</Label>
            <Input
              id="edit_phone"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="06 12 34 56 78"
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_mobile_phone">Téléphone mobile</Label>
            <Input
              id="edit_mobile_phone"
              value={editForm.mobile_phone || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, mobile_phone: e.target.value }))}
              placeholder="06 12 34 56 78"
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_city">Ville</Label>
            <Input
              id="edit_city"
              value={editForm.city || 'Rabat'}
              onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Ville"
            />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_address">Adresse</Label>
            <Input
            id="edit_address"
            value={editForm.address || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Adresse complète"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="edit_postal_code">Code postal</Label>
            <Input
              id="edit_postal_code"
              value={editForm.postal_code || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, postal_code: e.target.value }))}
              placeholder="10000"
            />
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="edit_client_type">Type de client</Label>
            <Select
              value={editForm.client_type || 'particulier'}
              onValueChange={(value) => 
              setEditForm(prev => ({ ...prev, client_type: value }))
              }
            >
              <SelectTrigger>
              <SelectValue placeholder="Type de client" />
              </SelectTrigger>
              <SelectContent>
              {clientTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_notes">Notes</Label>
            <Textarea
            id="edit_notes"
            value={editForm.notes || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes supplémentaires..."
            rows={3}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
            type="submit" 
            disabled={updateClientMutation.isPending}
            className="w-full sm:flex-1"
            >
            {updateClientMutation.isPending ? (
              <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Modification...
              </>
            ) : (
              'Enregistrer'
            )}
            </Button>
            <Button 
            type="button"
            variant="outline" 
            onClick={() => setShowEditModal(false)}
            disabled={updateClientMutation.isPending}
            className="w-full sm:flex-1"
            >
            Annuler
            </Button>
          </div>
          </form>
        </CardContent>
        </Card>
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete?.name}</strong> ?
              Cette action est irréversible et supprimera définitivement toutes les données associées à ce client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? (
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

const Clients = () => {
  return <ClientsContent />;
};

export default Clients;