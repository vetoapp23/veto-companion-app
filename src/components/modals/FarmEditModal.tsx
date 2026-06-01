// @ts-nocheck
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
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFarmManagementSettings, useVeterinarianSettings } from "@/hooks/useAppSettings";
import { useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Farm, FarmAnimalDetail } from "@/contexts/ClientContext";
import FarmPhotoManager from "@/components/FarmPhotoManager";

interface FarmEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: Farm | null;
}

const FarmEditModal = ({ open, onOpenChange, farm }: FarmEditModalProps) => {
  const { updateFarm } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  // Fetch settings for dynamic data
  const { data: farmSettings } = useFarmManagementSettings();
  const { data: veterinarians = [] } = useVeterinarianSettings();
  
  const [formData, setFormData] = useState<Partial<Farm>>({
    name: "",
    owner: "",
    ownerIdNumber: "",
    address: "",
    coordinates: { latitude: 0, longitude: 0 },
    phone: "",
    email: "",
    types: [],
    totalAnimals: 0,
    animalDetails: [],
    veterinarian: "",
    notes: "",
    status: "active" as Farm['status'],
    registrationNumber: "",
    surfaceArea: 0,
    buildingDetails: "",
    equipmentDetails: "",
    certifications: [],
    insuranceDetails: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: ""
    }
  });

  const [currentAnimalDetail, setCurrentAnimalDetail] = useState<FarmAnimalDetail>({
    category: "",
    maleCount: 0,
    femaleCount: 0,
    breeds: [],
    ageGroups: []
  });

  // Vérification de sécurité pour s'assurer que farmManagement existe
  if (!settings.farmManagement) {
    console.error('farmManagement settings not found, using defaults');
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erreur de configuration</DialogTitle>
            <DialogDescription>
              Les paramètres de gestion des fermes ne sont pas configurés. Veuillez recharger la page ou vérifier les paramètres.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  useEffect(() => {
    if (farm && open) {
      setFormData({
        ...farm,
        coordinates: farm.coordinates || { latitude: 0, longitude: 0 },
        types: farm.types || [],
        animalDetails: farm.animalDetails || [],
        certifications: farm.certifications || [],
        emergencyContact: farm.emergencyContact || { name: "", phone: "", relation: "" }
      });
    }
  }, [farm, open]);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        owner: "",
        ownerIdNumber: "",
        address: "",
        coordinates: { latitude: 0, longitude: 0 },
        phone: "",
        email: "",
        types: [],
        totalAnimals: 0,
        animalDetails: [],
        veterinarian: "",
        notes: "",
        status: "active",
        registrationNumber: "",
        surfaceArea: 0,
        buildingDetails: "",
        equipmentDetails: "",
        certifications: [],
        insuranceDetails: "",
        emergencyContact: { name: "", phone: "", relation: "" }
      });
      setCurrentAnimalDetail({
        category: "",
        maleCount: 0,
        femaleCount: 0,
        breeds: [],
        ageGroups: []
      });
    }
  }, [open]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types?.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...(prev.types || []), type]
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...(prev.certifications || []), certification]
    }));
  };

  const addAnimalDetail = () => {
    if (!currentAnimalDetail.category) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie d'animal",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      animalDetails: [...(prev.animalDetails || []), { ...currentAnimalDetail }]
    }));

    setCurrentAnimalDetail({
      category: "",
      maleCount: 0,
      femaleCount: 0,
      breeds: [],
      ageGroups: []
    });
  };

  const removeAnimalDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      animalDetails: prev.animalDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const addBreedToCurrentDetail = (breed: string) => {
    setCurrentAnimalDetail(prev => ({
      ...prev,
      breeds: [...prev.breeds, breed]
    }));
  };

  const removeBreedFromCurrentDetail = (breed: string) => {
    setCurrentAnimalDetail(prev => ({
      ...prev,
      breeds: prev.breeds.filter(b => b !== breed)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!farm) return;
    
    if (!formData.name || !formData.owner || !formData.address || !formData.types?.length) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const updatedFarm = {
      ...farm,
      ...formData,
      coordinates: formData.coordinates || { latitude: 0, longitude: 0 },
      types: formData.types || [],
      animalDetails: formData.animalDetails || [],
      totalAnimals: (formData.animalDetails || []).reduce((total, detail) => total + detail.maleCount + detail.femaleCount, 0),
      certifications: formData.certifications || [],
      emergencyContact: formData.emergencyContact || { name: "", phone: "", relation: "" }
    };

    updateFarm(farm.id, updatedFarm);
    
    toast({
      title: "Succès",
      description: "Exploitation mise à jour avec succès"
    });
    
    onOpenChange(false);
  };

  if (!farm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'Exploitation</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'exploitation agricole
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'exploitation *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom de l'exploitation"
                />
              </div>
              <div>
                <Label htmlFor="owner">Propriétaire *</Label>
                <Input
                  id="owner"
                  value={formData.owner || ""}
                  onChange={(e) => handleChange("owner", e.target.value)}
                  placeholder="Nom du propriétaire"
                />
              </div>
              <div>
                <Label htmlFor="ownerIdNumber">N° pièce d'identité du propriétaire</Label>
                <Input
                  id="ownerIdNumber"
                  value={formData.ownerIdNumber || ""}
                  onChange={(e) => handleChange("ownerIdNumber", e.target.value)}
                  placeholder="Numéro de carte d'identité, passeport, etc."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.coordinates?.latitude || ""}
                  onChange={(e) => handleChange("coordinates.latitude", parseFloat(e.target.value) || 0)}
                  placeholder="47.9056"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.coordinates?.longitude || ""}
                  onChange={(e) => handleChange("coordinates.longitude", parseFloat(e.target.value) || 0)}
                  placeholder="1.9190"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Téléphone"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label htmlFor="veterinarian">Vétérinaire responsable</Label>
                <Select 
                  value={formData.veterinarian || ""} 
                  onValueChange={(value) => handleChange("veterinarian", value)}
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
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Types d'élevage */}
          <Card>
            <CardHeader>
              <CardTitle>Types d'élevage *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {settings.farmManagement.farmTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={formData.types?.includes(type) || false}
                      onCheckedChange={() => handleTypeToggle(type)}
                    />
                    <Label htmlFor={`type-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détails du cheptel */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du cheptel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ajout d'une nouvelle catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={currentAnimalDetail.category} onValueChange={(value) => setCurrentAnimalDetail(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.farmManagement.animalCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mâles</Label>
                  <Input
                    type="number"
                    value={currentAnimalDetail.maleCount}
                    onChange={(e) => setCurrentAnimalDetail(prev => ({ ...prev, maleCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Femelles</Label>
                  <Input
                    type="number"
                    value={currentAnimalDetail.femaleCount}
                    onChange={(e) => setCurrentAnimalDetail(prev => ({ ...prev, femaleCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addAnimalDetail} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Races pour la catégorie actuelle */}
              {currentAnimalDetail.category && (
                <div className="p-4 border rounded-lg">
                  <Label>Races pour {currentAnimalDetail.category}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {settings.farmManagement.breedsByCategory[currentAnimalDetail.category]?.map((breed) => (
                      <div key={breed} className="flex items-center space-x-2">
                        <Checkbox
                          id={`breed-${breed}`}
                          checked={currentAnimalDetail.breeds.includes(breed)}
                          onCheckedChange={() => {
                            if (currentAnimalDetail.breeds.includes(breed)) {
                              removeBreedFromCurrentDetail(breed);
                            } else {
                              addBreedToCurrentDetail(breed);
                            }
                          }}
                        />
                        <Label htmlFor={`breed-${breed}`}>{breed}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Résumé du cheptel configuré */}
              {formData.animalDetails && formData.animalDetails.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <Label>Cheptel configuré</Label>
                  <div className="mt-2 space-y-2">
                    {formData.animalDetails.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>
                          <Badge variant="secondary">{detail.category}</Badge>
                          <span className="ml-2">
                            {detail.maleCount} mâles, {detail.femaleCount} femelles
                          </span>
                          {detail.breeds.length > 0 && (
                            <span className="ml-2 text-sm text-gray-600">
                              Races: {detail.breeds.join(", ")}
                            </span>
                          )}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnimalDetail(index)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations administratives */}
          <Card>
            <CardHeader>
              <CardTitle>Informations administratives</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationNumber">Numéro d'immatriculation</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber || ""}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="Numéro d'immatriculation"
                />
              </div>
              <div>
                <Label htmlFor="surfaceArea">Surface (hectares)</Label>
                <Input
                  id="surfaceArea"
                  type="number"
                  step="0.1"
                  value={formData.surfaceArea || ""}
                  onChange={(e) => handleChange("surfaceArea", parseFloat(e.target.value) || 0)}
                  placeholder="Surface en hectares"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="buildingDetails">Détails des bâtiments</Label>
                <Textarea
                  id="buildingDetails"
                  value={formData.buildingDetails || ""}
                  onChange={(e) => handleChange("buildingDetails", e.target.value)}
                  placeholder="Description des bâtiments, étables, etc."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="equipmentDetails">Équipements</Label>
                <Textarea
                  id="equipmentDetails"
                  value={formData.equipmentDetails || ""}
                  onChange={(e) => handleChange("equipmentDetails", e.target.value)}
                  placeholder="Liste des équipements disponibles"
                />
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(farmSettings?.certification_types || ['Bio', 'Label Rouge', 'Standard']).map((certification) => (
                  <div key={certification} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cert-${certification}`}
                      checked={formData.certifications?.includes(certification) || false}
                      onCheckedChange={() => handleCertificationToggle(certification)}
                    />
                    <Label htmlFor={`cert-${certification}`}>{certification}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assurance et contact d'urgence */}
          <Card>
            <CardHeader>
              <CardTitle>Assurance et contact d'urgence</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="insuranceDetails">Détails de l'assurance</Label>
                <Input
                  id="insuranceDetails"
                  value={formData.insuranceDetails || ""}
                  onChange={(e) => handleChange("insuranceDetails", e.target.value)}
                  placeholder="Compagnie d'assurance et numéro de police"
                />
              </div>
              <div>
                <Label htmlFor="emergencyName">Nom du contact d'urgence</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) => handleChange("emergencyContact.name", e.target.value)}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact?.phone || ""}
                  onChange={(e) => handleChange("emergencyContact.phone", e.target.value)}
                  placeholder="Téléphone"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relation</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyContact?.relation || ""}
                  onChange={(e) => handleChange("emergencyContact.relation", e.target.value)}
                  placeholder="Relation (époux, fils, etc.)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gestion des photos */}
          <Card>
            <CardHeader>
              <CardTitle>Photos de l'exploitation</CardTitle>
            </CardHeader>
            <CardContent>
              <FarmPhotoManager
                photos={formData.photos || []}
                onPhotosChange={(photos) => handleChange("photos", photos)}
                farmName={formData.name || "Exploitation"}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes complémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Notes additionnelles sur l'exploitation..."
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Mettre à jour l'exploitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmEditModal;
