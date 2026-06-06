import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFarmManagementSettings, useVeterinarianSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface NewFarmModalOldUIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SupabaseClient {
  id: string;
  first_name: string;
  last_name: string;
}

interface FarmAnimalDetail {
  category: string;
  maleCount: number;
  femaleCount: number;
  breeds: string[];
  ageGroups: string[];
}

const NewFarmModalOldUI = ({ open, onOpenChange }: NewFarmModalOldUIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch settings for dynamic data
  const { data: farmSettings } = useFarmManagementSettings();
  const { data: veterinarians = [] } = useVeterinarianSettings();
  
  const [clients, setClients] = useState<SupabaseClient[]>([]);
  const [formData, setFormData] = useState({
    // Basic info
    farm_name: "",
    client_id: "",
    owner_name: "",
    owner_id_number: "",
    
    // Contact & Location
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    
    // Farm details
    farm_types: [] as string[],
    total_animals: "",
    surface_area: "",
    registration_number: "",
    herd_size: "",
    
    // Professional info
    veterinarian: "",
    building_details: "",
    equipment_details: "",
    insurance_details: "",
    
    // Status & notes
    status: "active",
    notes: "",
    certifications: [] as string[],
    
    // Emergency contact
    emergency_contact: {
      name: "",
      phone: "",
      relation: ""
    },
    
    // Animal details
    animal_details: [] as FarmAnimalDetail[]
  });
  
  const [currentAnimalDetail, setCurrentAnimalDetail] = useState<FarmAnimalDetail>({
    category: "",
    maleCount: 0,
    femaleCount: 0,
    breeds: [],
    ageGroups: []
  });
  
  const [loading, setLoading] = useState(false);

  // Farm types available - dynamic from settings with fallback
  const farmTypesFromSettings = farmSettings?.farm_types || ['Laitière', 'Viande', 'Mixte', 'Avicole', 'Ovine', 'Caprine'];
  const farmTypes = farmTypesFromSettings.map(type => ({
    id: type.toLowerCase().replace(/\s+/g, '_'),
    label: type
  }));

  // Available certifications - dynamic from settings with fallback
  const availableCertifications = farmSettings?.certification_types || [
    "Bio",
    "Label Rouge",
    "Standard",
    "AOC",
    "IGP"
  ];

  // Fetch clients when modal opens
  useEffect(() => {
    if (open && user) {
      fetchClients();
      resetForm();
    }
  }, [open, user]);

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id
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
        return;
      }

      // Query clients by organization_id (shared across organization)
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'actif')
        .order('first_name');

      if (error) throw error;
      console.log('✅ Clients loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      farm_name: "",
      client_id: "",
      owner_name: "",
      owner_id_number: "",
      address: "",
      latitude: "",
      longitude: "",
      phone: "",
      email: "",
      farm_types: [],
      total_animals: "",
      surface_area: "",
      registration_number: "",
      herd_size: "",
      veterinarian: "",
      building_details: "",
      equipment_details: "",
      insurance_details: "",
      status: "active",
      notes: "",
      certifications: [],
      emergency_contact: {
        name: "",
        phone: "",
        relation: ""
      },
      animal_details: []
    });
    setCurrentAnimalDetail({
      category: "",
      maleCount: 0,
      femaleCount: 0,
      breeds: [],
      ageGroups: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.farm_name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'exploitation est requis",
        variant: "destructive",
      });
      return;
    }

    if (!formData.client_id) {
      toast({
        title: "Erreur", 
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('Profil utilisateur ou organisation introuvable');
      }

      const insertData: any = {
        farm_name: formData.farm_name.trim(),
        client_id: formData.client_id,
        user_id: user.id,
        organization_id: profile.organization_id,
        active: true,
        farm_type: formData.farm_types[0] || null, // Keep single type for compatibility
        registration_number: formData.registration_number || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        herd_size: formData.herd_size ? parseInt(formData.herd_size) : null,
        notes: formData.notes || null,
        certifications: formData.certifications.length > 0 ? formData.certifications : null
      };

      const { error } = await supabase
        .from('farms')
        .insert([insertData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Exploitation créée avec succès",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating farm:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'exploitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergency_contact: { ...prev.emergency_contact, [field]: value }
    }));
  };

  const toggleFarmType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      farm_types: prev.farm_types.includes(typeId)
        ? prev.farm_types.filter(t => t !== typeId)
        : [...prev.farm_types, typeId]
    }));
  };

  const toggleCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const addAnimalDetail = () => {
    if (currentAnimalDetail.category) {
      setFormData(prev => ({
        ...prev,
        animal_details: [...prev.animal_details, currentAnimalDetail]
      }));
      setCurrentAnimalDetail({
        category: "",
        maleCount: 0,
        femaleCount: 0,
        breeds: [],
        ageGroups: []
      });
    }
  };

  const removeAnimalDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      animal_details: prev.animal_details.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Exploitation Agricole</DialogTitle>
          <DialogDescription>
            Créer une nouvelle exploitation agricole avec toutes les informations détaillées
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_name">Nom de l'exploitation *</Label>
                  <Input
                    id="farm_name"
                    value={formData.farm_name}
                    onChange={(e) => handleChange('farm_name', e.target.value)}
                    placeholder="Ex: Ferme Ben Ali"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Propriétaire *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Nom du propriétaire</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    placeholder="Nom du propriétaire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_id_number">N° pièce d'identité du propriétaire</Label>
                  <Input
                    id="owner_id_number"
                    value={formData.owner_id_number}
                    onChange={(e) => handleChange('owner_id_number', e.target.value)}
                    placeholder="Numéro de carte d'identité, passeport, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    placeholder="47.9058"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    placeholder="1.9190"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Téléphone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Vétérinaire responsable</Label>
                  <Select 
                    value={formData.veterinarian} 
                    onValueChange={(value) => handleChange('veterinarian', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un vétérinaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {veterinarians.filter(v => v.is_active).map((vet) => (
                        <SelectItem key={vet.id} value={vet.name}>
                          {vet.name} {vet.title ? `- ${vet.title}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="attention">Attention</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Types d'élevage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Types d'élevage *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {farmTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={formData.farm_types.includes(type.id)}
                      onCheckedChange={() => toggleFarmType(type.id)}
                    />
                    <Label htmlFor={type.id}>{type.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détails de l'exploitation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails de l'exploitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">N° d'enregistrement</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                    placeholder="Ex: MA-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surface_area">Surface (hectares)</Label>
                  <Input
                    id="surface_area"
                    type="number"
                    step="0.01"
                    value={formData.surface_area}
                    onChange={(e) => handleChange('surface_area', e.target.value)}
                    placeholder="Surface en hectares"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_animals">Nombre total d'animaux</Label>
                  <Input
                    id="total_animals"
                    type="number"
                    value={formData.total_animals}
                    onChange={(e) => handleChange('total_animals', e.target.value)}
                    placeholder="Nombre d'animaux"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="building_details">Détails des bâtiments</Label>
                <Textarea
                  id="building_details"
                  value={formData.building_details}
                  onChange={(e) => handleChange('building_details', e.target.value)}
                  placeholder="Description des bâtiments d'élevage..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment_details">Équipements</Label>
                <Textarea
                  id="equipment_details"
                  value={formData.equipment_details}
                  onChange={(e) => handleChange('equipment_details', e.target.value)}
                  placeholder="Description des équipements..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_details">Détails assurance</Label>
                <Textarea
                  id="insurance_details"
                  value={formData.insurance_details}
                  onChange={(e) => handleChange('insurance_details', e.target.value)}
                  placeholder="Informations sur l'assurance..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact d'urgence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact d'urgence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">Nom</Label>
                  <Input
                    id="emergency_name"
                    value={formData.emergency_contact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    placeholder="Nom du contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Téléphone</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_contact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    placeholder="Téléphone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_relation">Relation</Label>
                  <Input
                    id="emergency_relation"
                    value={formData.emergency_contact.relation}
                    onChange={(e) => handleEmergencyContactChange('relation', e.target.value)}
                    placeholder="Ex: Famille, Associé"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {availableCertifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={() => toggleCertification(cert)}
                    />
                    <Label htmlFor={cert}>{cert}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'exploitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmModalOldUI;