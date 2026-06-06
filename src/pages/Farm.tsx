// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Tractor, Users2, AlertTriangle, Calendar, MapPin, Phone, Eye, Edit, Trash2, Stethoscope, Grid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { useFarmManagementSettings } from "@/hooks/useAppSettings";
import NewFarmModalOldUI from "@/components/forms/NewFarmModalOldUI";
import NewFarmInterventionModalSupabase from "@/components/forms/NewFarmInterventionModalSupabase";
import FarmViewModalSupabase from "@/components/modals/FarmViewModalSupabase";
import FarmEditModalSupabase from "@/components/modals/FarmEditModalSupabase";
import FarmInterventionEditModalSupabase from "@/components/modals/FarmInterventionEditModalSupabase";

// Database types matching your schema
interface DatabaseFarm {
  id: string;
  client_id: string;
  farm_name: string;
  farm_type: string | null;
  registration_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  herd_size: number | null;
  certifications: string[] | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface DatabaseFarmIntervention {
  id: string;
  farm_id: string;
  veterinarian_id: string | null;
  intervention_date: string;
  intervention_type: string;
  animal_count: number | null;
  description: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications_used: string[] | null;
  cost: number | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  farms?: {
    farm_name: string;
  };
  user_profiles?: {
    full_name: string;
  };
}

const FarmPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Settings hook for dynamic farm types
  const { data: farmSettings } = useFarmManagementSettings();
  const farmTypes = farmSettings?.farm_types || ['Laitière', 'Viande', 'Mixte'];
  
  // State for database data
  const [farms, setFarms] = useState<DatabaseFarm[]>([]);
  const [farmInterventions, setFarmInterventions] = useState<DatabaseFarmIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal state
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);
  const [showNewInterventionModal, setShowNewInterventionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [showEditInterventionModal, setShowEditInterventionModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<DatabaseFarm | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<DatabaseFarmIntervention | null>(null);

  // Fetch farms from Supabase
  const fetchFarms = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil utilisateur",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Query farms by organization_id (shared across organization)
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          clients(first_name, last_name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Farms loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les exploitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch farm interventions from Supabase
  const fetchFarmInterventions = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Query farm interventions by organization_id (shared across organization)
      const { data, error } = await supabase
        .from('farm_interventions')
        .select(`
          *,
          farms(farm_name),
          user_profiles(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('intervention_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      console.log('✅ Farm interventions loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setFarmInterventions(data || []);
    } catch (error) {
      console.error('Error fetching farm interventions:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchFarms();
      fetchFarmInterventions();
    }
  }, [user]);

  // Delete farm function (soft delete by setting active to false)
  const deleteFarm = async (farmId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette exploitation ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('farms')
        .update({ active: false })
        .eq('id', farmId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Exploitation supprimée avec succès",
      });
      
      fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'exploitation",
        variant: "destructive",
      });
    }
  };

  // Delete farm intervention function
  const deleteFarmIntervention = async (interventionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('farm_interventions')
        .delete()
        .eq('id', interventionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Intervention supprimée avec succès",
      });
      
      fetchFarmInterventions();
    } catch (error) {
      console.error('Error deleting intervention:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'intervention",
        variant: "destructive",
      });
    }
  };

  // Handler functions for modals
  const handleViewFarm = (farm: DatabaseFarm) => {
    setSelectedFarm(farm);
    setShowViewModal(true);
  };

  const handleEditFarm = (farm: DatabaseFarm) => {
    setSelectedFarm(farm);
    setShowEditFarmModal(true);
  };

  const handleNewIntervention = (farm?: DatabaseFarm) => {
    if (farm) setSelectedFarm(farm);
    setShowNewInterventionModal(true);
  };

  const handleEditIntervention = (intervention: DatabaseFarmIntervention) => {
    setSelectedIntervention(intervention);
    setShowEditInterventionModal(true);
  };

  // Filter farms based on search and type
  const filteredFarms = farms.filter(farm => {
    const ownerName = farm.clients ? `${farm.clients.first_name} ${farm.clients.last_name}` : '';
    const matchesSearch = farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (farm.farm_type && farm.farm_type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || farm.farm_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get upcoming interventions (those with follow-up dates in the future)
  const upcomingInterventions = farmInterventions.filter(intervention => 
    intervention.follow_up_date && new Date(intervention.follow_up_date) > new Date()
  );

  const typeLabels = {
    "Élevage bovin": "Élevage bovin",
    "Élevage ovin": "Élevage ovin", 
    "Élevage caprin": "Élevage caprin",
    "Élevage équin": "Élevage équin",
    "Élevage avicole": "Élevage avicole",
    "Élevage porcin": "Élevage porcin",
    "Élevage mixte": "Élevage mixte",
    "Autre": "Autre"
  };

  const interventionTypeLabels = {
    "vaccination": "Vaccination",
    "controle": "Contrôle sanitaire",
    "urgence": "Urgence", 
    "chirurgie": "Chirurgie",
    "prevention": "Prévention",
    "consultation": "Consultation"
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement des exploitations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Exploitations</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les fermes, élevages et interventions vétérinaires
          </p>
        </div>
        
        <Button className="gap-2 medical-glow" onClick={() => setShowNewFarmModal(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle Exploitation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Tractor className="h-12 w-12 text-primary mx-auto mb-4" />
            <div className="text-2xl font-bold">{farms.length}</div>
            <div className="text-sm text-muted-foreground">Exploitations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users2 className="h-12 w-12 text-secondary mx-auto mb-4" />
            <div className="text-2xl font-bold">{farms.reduce((total, farm) => total + (farm.herd_size || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">Total animaux</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Alertes actives</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-2xl font-bold">{upcomingInterventions.length}</div>
            <div className="text-sm text-muted-foreground">Interventions à venir</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher et filtrer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Rechercher par nom, propriétaire ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type d'élevage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {farmTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="farms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="farms" className="gap-2">
            <Tractor className="h-4 w-4" />
            Exploitations
          </TabsTrigger>
          <TabsTrigger value="interventions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Interventions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Exploitations ({filteredFarms.length})
            </h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'cards' ? 'default' : 'outline'} 
                onClick={() => setViewMode('cards')}
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                Cartes
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Tableau
              </Button>
              <Button className="gap-2" onClick={() => setShowNewInterventionModal(true)}>
                <Stethoscope className="h-4 w-4" />
                Nouvelle Intervention
              </Button>
            </div>
          </div>
          
          {filteredFarms.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {farms.length === 0 ? "Aucune exploitation enregistrée" : "Aucune exploitation trouvée"}
              </CardContent>
            </Card>
          ) : viewMode === 'cards' ? (
            filteredFarms.map((farm) => (
              <Card key={farm.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="text-xl font-semibold">{farm.farm_name}</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Actif
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>Propriétaire:</strong> {farm.clients ? `${farm.clients.first_name} ${farm.clients.last_name}` : 'Non spécifié'}</p>
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {farm.address || 'Adresse non renseignée'}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {farm.phone || 'Téléphone non renseigné'}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p><strong>Type:</strong> 
                            <div className="flex flex-wrap gap-1 mt-1">
                              {farm.farm_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {typeLabels[farm.farm_type] || farm.farm_type}
                                </Badge>
                              )}
                            </div>
                          </p>
                          <p><strong>Animaux:</strong> {farm.herd_size || 0}</p>
                          <p><strong>N° enregistrement:</strong> {farm.registration_number || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {farm.certifications && farm.certifications.length > 0 && (
                        <div className="text-sm">
                          <strong>Certifications:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {farm.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground">
                        Créé le: {formatDate(farm.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewFarm(farm)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditFarm(farm)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleNewIntervention(farm)}>
                        <Stethoscope className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteFarm(farm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Exploitation</th>
                        <th className="p-4 font-medium">Propriétaire</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Animaux</th>
                        <th className="p-4 font-medium">Contact</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarms.map((farm) => (
                        <tr key={farm.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{farm.farm_name}</div>
                              <div className="text-sm text-muted-foreground">{farm.address}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">
                                {farm.clients ? `${farm.clients.first_name} ${farm.clients.last_name}` : 'Non spécifié'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {farm.registration_number && `N°: ${farm.registration_number}`}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {farm.farm_type && (
                              <Badge variant="secondary" className="text-xs">
                                {typeLabels[farm.farm_type] || farm.farm_type}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">{farm.herd_size || 0}</td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {farm.phone || 'N/A'}
                              </div>
                              <div className="text-muted-foreground">
                                {farm.email || 'Email non renseigné'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleViewFarm(farm)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditFarm(farm)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => handleNewIntervention(farm)}>
                                <Stethoscope className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteFarm(farm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Interventions récentes ({farmInterventions.length})
            </h3>
            <Button className="gap-2" onClick={() => setShowNewInterventionModal(true)}>
              <Stethoscope className="h-4 w-4" />
              Nouvelle Intervention
            </Button>
          </div>
          
          {farmInterventions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune intervention enregistrée
              </CardContent>
            </Card>
          ) : (
            farmInterventions.map((intervention) => (
              <Card key={intervention.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-semibold">
                            {interventionTypeLabels[intervention.intervention_type] || intervention.intervention_type}
                          </h4>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Terminé
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(intervention.intervention_date)}
                          </span>
                          <span>{intervention.farms?.farm_name}</span>
                          <span>{intervention.user_profiles?.full_name || 'Vétérinaire'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Animaux concernés:</span> {intervention.animal_count || 'Non spécifié'}
                      </div>
                      <div>
                        <span className="font-medium">Coût:</span> {intervention.cost ? `${intervention.cost} MAD` : 'N/A'}
                      </div>
                    </div>
                    
                    {intervention.description && (
                      <p className="text-sm">{intervention.description}</p>
                    )}
                    
                    {intervention.follow_up_date && (
                      <p className="text-sm text-blue-600">
                        <strong>Suivi prévu:</strong> {formatDate(intervention.follow_up_date)}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditIntervention(intervention)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteFarmIntervention(intervention.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Empty state for new users */}
      {farms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Tractor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune exploitation enregistrée</p>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première exploitation agricole.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une exploitation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <NewFarmModalOldUI 
        open={showNewFarmModal} 
        onOpenChange={(open) => {
          setShowNewFarmModal(open);
          if (!open) fetchFarms(); // Refresh after close
        }}
      />
      
      <NewFarmInterventionModalSupabase 
        open={showNewInterventionModal} 
        onOpenChange={(open) => {
          setShowNewInterventionModal(open);
          if (!open) {
            setSelectedFarm(null); // Clear selection
            fetchFarmInterventions(); // Refresh after close
          }
        }}
        farmId={selectedFarm ? selectedFarm.id : undefined}
        farmName={selectedFarm?.farm_name}
      />
      
      <FarmViewModalSupabase 
        farm={selectedFarm}
        open={showViewModal}
        onOpenChange={(open) => {
          setShowViewModal(open);
          if (!open) setSelectedFarm(null);
        }}
        onEdit={() => {
          setShowViewModal(false);
          handleEditFarm(selectedFarm!);
        }}
        onNewIntervention={() => {
          setShowViewModal(false);
          setShowNewInterventionModal(true);
        }}
      />

      <FarmEditModalSupabase
        farm={selectedFarm}
        open={showEditFarmModal}
        onOpenChange={(open) => {
          setShowEditFarmModal(open);
          if (!open) {
            setSelectedFarm(null); // Clear selection
            fetchFarms(); // Refresh after close
          }
        }}
      />

      <FarmInterventionEditModalSupabase
        intervention={selectedIntervention}
        open={showEditInterventionModal}
        onOpenChange={(open) => {
          setShowEditInterventionModal(open);
          if (!open) fetchFarmInterventions(); // Refresh after close
        }}
      />
    </div>
  );
};

export default FarmPage;