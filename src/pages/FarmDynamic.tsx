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
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useFarmManagementSettings } from "@/hooks/useAppSettings";
import { formatDate } from "@/lib/utils";
import NewFarmModal from "@/components/forms/NewFarmModal";
import NewFarmInterventionModal from "@/components/forms/NewFarmInterventionModal";
import FarmViewModal from "@/components/modals/FarmViewModal";
import FarmEditModal from "@/components/modals/FarmEditModal";
import FarmInterventionEditModal from "@/components/modals/FarmInterventionEditModal";
import { useToast } from "@/hooks/use-toast";

// Types matching the database schema
interface Farm {
  id: string;
  name: string;
  owner: string;
  address: string;
  phone: string;
  email?: string;
  types: string[];
  animalCount: number;
  registrationNumber?: string;
  certifications?: string[];
  status: 'active' | 'attention' | 'urgent';
  healthStatus: 'good' | 'attention' | 'poor';
  lastVisit?: string;
  nextVisit?: string;
  notes?: string;
  client_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface FarmIntervention {
  id: string;
  farm_id: string;
  veterinarian_id?: string;
  intervention_date: string;
  intervention_type: string;
  animal_count?: number;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medications_used?: string[];
  cost?: number;
  follow_up_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const FarmPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Settings hook for dynamic farm types
  const { data: farmSettings } = useFarmManagementSettings();
  const farmTypes = farmSettings?.farm_types || ['Laitière', 'Viande', 'Mixte'];
  
  const { currentView } = useDisplayPreference('farms');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);
  const [showNewInterventionModal, setShowNewInterventionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [showEditInterventionModal, setShowEditInterventionModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<FarmIntervention | null>(null);
  
  // State for data from Supabase
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmInterventions, setFarmInterventions] = useState<FarmIntervention[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch farms from Supabase
  const fetchFarms = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to UI format
      const mappedFarms = data.map((farm: any) => ({
        id: farm.id,
        name: farm.farm_name,
        owner: farm.client_id || 'Non spécifié',
        address: farm.address || '',
        phone: farm.phone || '',
        email: farm.email || '',
        types: Array.isArray(farm.farm_type) ? farm.farm_type : farm.farm_type ? [farm.farm_type] : [],
        animalCount: farm.herd_size || 0,
        registrationNumber: farm.registration_number || '',
        certifications: farm.certifications || [],
        status: 'active' as const,
        healthStatus: 'good' as const,
        lastVisit: '',
        nextVisit: '',
        notes: farm.notes || '',
        client_id: farm.client_id,
        user_id: farm.user_id,
        created_at: farm.created_at,
        updated_at: farm.updated_at
      }));
      
      setFarms(mappedFarms);
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
      const { data, error } = await supabase
        .from('farm_interventions')
        .select('*')
        .order('intervention_date', { ascending: false });

      if (error) throw error;
      setFarmInterventions(data || []);
    } catch (error) {
      console.error('Error fetching farm interventions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFarms();
      fetchFarmInterventions();
    }
  }, [user]);

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farm.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farm.types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         false;
    const matchesType = filterType === "all" || farm.types?.includes(filterType) || false;
    
    return matchesSearch && matchesType;
  });

  const statusStyles = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    attention: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };

  const healthStyles = {
    good: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    attention: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    poor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };

  const typeLabels: Record<string, string> = {
    "Bovin laitier": "Élevage bovin laitier",
    "Bovin viande": "Élevage bovin viande",
    "Porcin": "Élevage porcin",
    "Avicole": "Élevage avicole",
    "Ovin": "Élevage ovin",
    "Caprin": "Élevage caprin",
    "Équin": "Élevage équin",
    "Apiculture": "Apiculture",
    "Aquaculture": "Aquaculture",
    "Cuniculture": "Cuniculture",
    "Mixte": "Élevage mixte"
  };

  const interventionTypeLabels: Record<string, string> = {
    vaccination: "Vaccination",
    controle: "Contrôle sanitaire",
    urgence: "Urgence",
    chirurgie: "Chirurgie",
    prevention: "Prévention",
    consultation: "Consultation"
  };

  const handleViewFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowViewModal(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowEditFarmModal(true);
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette exploitation ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
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

  const handleEditIntervention = (intervention: FarmIntervention) => {
    setSelectedIntervention(intervention);
    setShowEditInterventionModal(true);
  };

  const handleDeleteIntervention = async (interventionId: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Fermes</h1>
          <p className="text-muted-foreground mt-1">
            {filteredFarms.length} exploitation(s) • {farmInterventions.length} intervention(s)
          </p>
        </div>
        <Button onClick={() => setShowNewFarmModal(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle Ferme
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, propriétaire ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Type d'élevage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {farmTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('cards')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farms List */}
      <Tabs defaultValue="exploitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exploitations">
            <Tractor className="mr-2 h-4 w-4" />
            Exploitations
          </TabsTrigger>
          <TabsTrigger value="interventions">
            <Stethoscope className="mr-2 h-4 w-4" />
            Interventions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exploitations" className="space-y-4">
          {filteredFarms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Tractor className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune exploitation trouvée</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Commencez par ajouter votre première exploitation agricole
                </p>
                <Button onClick={() => setShowNewFarmModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Ferme
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFarms.map((farm) => (
                <Card key={farm.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Tractor className="h-5 w-5" />
                          {farm.name}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={statusStyles[farm.status]}>
                            {farm.status === 'active' ? 'Actif' : farm.status === 'attention' ? 'Attention' : 'Urgent'}
                          </Badge>
                          <Badge className={healthStyles[farm.healthStatus]}>
                            {farm.healthStatus === 'good' ? 'Bonne santé' : farm.healthStatus === 'attention' ? 'À surveiller' : 'Problème'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewFarm(farm)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditFarm(farm)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFarm(farm.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users2 className="h-4 w-4" />
                        <span>{farm.owner}</span>
                      </div>
                      {farm.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{farm.address}</span>
                        </div>
                      )}
                      {farm.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{farm.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Animaux</span>
                        <span className="font-semibold">{farm.animalCount}</span>
                      </div>
                    </div>

                    {farm.types && farm.types.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {farm.types.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {typeLabels[type] || type}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4">Nom</th>
                        <th className="p-4">Propriétaire</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Animaux</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarms.map((farm) => (
                        <tr key={farm.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{farm.name}</td>
                          <td className="p-4">{farm.owner}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {farm.types?.slice(0, 2).map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {typeLabels[type] || type}
                                </Badge>
                              ))}
                              {farm.types && farm.types.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{farm.types.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">{farm.animalCount}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Badge className={statusStyles[farm.status]} variant="secondary">
                                {farm.status === 'active' ? 'Actif' : farm.status === 'attention' ? 'Attention' : 'Urgent'}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewFarm(farm)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditFarm(farm)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteFarm(farm.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Interventions vétérinaires</h2>
            <Button onClick={() => setShowNewInterventionModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Intervention
            </Button>
          </div>

          {farmInterventions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Stethoscope className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune intervention enregistrée</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Commencez par enregistrer votre première intervention
                </p>
                <Button onClick={() => setShowNewInterventionModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Intervention
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmInterventions.map((intervention) => {
                const farm = farms.find(f => f.id === intervention.farm_id);
                return (
                  <Card key={intervention.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{farm?.name || 'Ferme inconnue'}</CardTitle>
                          <Badge className="mt-2" variant="secondary">
                            {interventionTypeLabels[intervention.intervention_type] || intervention.intervention_type}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditIntervention(intervention)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteIntervention(intervention.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(intervention.intervention_date)}</span>
                      </div>
                      {intervention.animal_count && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Animaux traités: </span>
                          <span className="font-semibold">{intervention.animal_count}</span>
                        </div>
                      )}
                      {intervention.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{intervention.description}</p>
                      )}
                      {intervention.cost && (
                        <div className="text-sm font-semibold pt-2 border-t">
                          Coût: {intervention.cost} MAD
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showNewFarmModal && (
        <NewFarmModal
          isOpen={showNewFarmModal}
          onClose={() => {
            setShowNewFarmModal(false);
            fetchFarms();
          }}
        />
      )}

      {showNewInterventionModal && (
        <NewFarmInterventionModal
          isOpen={showNewInterventionModal}
          onClose={() => {
            setShowNewInterventionModal(false);
            fetchFarmInterventions();
          }}
          farms={farms}
        />
      )}

      {showViewModal && selectedFarm && (
        <FarmViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedFarm(null);
          }}
          farm={selectedFarm}
        />
      )}

      {showEditFarmModal && selectedFarm && (
        <FarmEditModal
          isOpen={showEditFarmModal}
          onClose={() => {
            setShowEditFarmModal(false);
            setSelectedFarm(null);
            fetchFarms();
          }}
          farm={selectedFarm}
        />
      )}

      {showEditInterventionModal && selectedIntervention && (
        <FarmInterventionEditModal
          isOpen={showEditInterventionModal}
          onClose={() => {
            setShowEditInterventionModal(false);
            setSelectedIntervention(null);
            fetchFarmInterventions();
          }}
          intervention={selectedIntervention}
          farms={farms}
        />
      )}
    </div>
  );
};

export default FarmPage;
