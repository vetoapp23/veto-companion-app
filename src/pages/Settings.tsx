import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Settings2, Shield, X } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { useSettings, ClinicSettings, DisplayPreferences } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/components/UserProfile";
import { User } from "lucide-react";
import { SettingsManagement } from "@/components/SettingsManagement";
import { StorageUsageCard } from "@/components/StorageUsageCard";
import { 
  useVeterinarianSettings,
  useUpdateVeterinarianSettings,
  useFarmManagementSettings,
  useUpdateFarmManagementSettings,
  useScheduleSettings,
  useUpdateScheduleSettings
} from '../hooks/useAppSettings'
import type { 
  VeterinarianSetting,
  FarmManagementSettings,
  ScheduleSettings
} from '../lib/database'

export default function Settings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  
  // Database hooks for veterinarians
  const { data: dbVeterinarians = [], isLoading: vetLoading } = useVeterinarianSettings();
  const updateVeterinarianMutation = useUpdateVeterinarianSettings();
  
  // Database hooks for farm management
  const { data: farmSettings, isLoading: farmLoading } = useFarmManagementSettings();
  const updateFarmMutation = useUpdateFarmManagementSettings();
  
  // Database hooks for schedule
  const { data: scheduleSettings, isLoading: scheduleLoading } = useScheduleSettings();
  const updateScheduleMutation = useUpdateScheduleSettings();
  
  // State for veterinarians
  const [showVetModal, setShowVetModal] = useState(false);
  const [editVet, setEditVet] = useState<VeterinarianSetting | null>(null);
  const [vetForm, setVetForm] = useState({ 
    name: '', 
    title: '', 
    specialty: '', 
    phone: '', 
    email: '',
    is_active: true
  });

  // Farm management modal states
  const [showFarmTypeModal, setShowFarmTypeModal] = useState(false);
  const [newFarmType, setNewFarmType] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [newBreed, setNewBreed] = useState('');
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [newCertification, setNewCertification] = useState('');

  // Computed vets for display
  const vets = dbVeterinarians.length > 0 ? dbVeterinarians : settings.veterinarians;

  const DEFAULT_VETS: VeterinarianSetting[] = [
    { 
      id: 'vet_001', 
      name: 'Dr. Jean Dupont',
      title: 'Dr.',
      specialty: 'Médecine générale',
      phone: '+212 6 00 00 00 01',
      email: 'j.dupont@clinique.ma',
      is_active: true
    },
    { 
      id: 'vet_002', 
      name: 'Dr. Marie Martin',
      title: 'Dr.',
      specialty: 'Chirurgie',
      phone: '+212 6 00 00 00 02',
      email: 'm.martin@clinique.ma',
      is_active: true
    },
    { 
      id: 'vet_003', 
      name: 'Pr. Ahmed El Alaoui',
      title: 'Pr.',
      specialty: 'Cardiologie vétérinaire',
      phone: '+212 6 00 00 00 03',
      email: 'a.elalaoui@clinique.ma',
      is_active: true
    }
  ];

  // Sync species with dynamic lists
  const { pets } = useClients();
  useEffect(() => {
    const dynamic = Array.from(new Set([
      ...pets.map(p => p.type)
    ]));
    const merged = Array.from(new Set([...settings.species.split(',').map(s => s.trim()), ...dynamic]));
    updateSettings({ ...settings, species: merged.join(', ') } as ClinicSettings);
  }, [pets]);

  // Handlers for clinic settings
  const handleSettingsChange = (field: keyof ClinicSettings, value: string | boolean | number | any) => {
    updateSettings({ ...settings, [field]: value } as ClinicSettings);
  };

  const saveSettings = () => {
    toast({ title: 'Paramètres sauvegardés', description: 'Informations de la clinique mises à jour.' });
  };

  // Logo handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSettingsChange('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Display preferences handler
  const handleDisplayPreferenceChange = (section: keyof DisplayPreferences, value: 'table' | 'cards') => {
    const updatedPreferences = {
      ...settings.displayPreferences,
      [section]: value
    };
    const updatedSettings = {
      ...settings,
      displayPreferences: updatedPreferences
    };
    updateSettings(updatedSettings);
    toast({ 
      title: 'Préférence d\'affichage mise à jour', 
      description: `${section} s'affichera maintenant en ${value === 'table' ? 'tableau' : 'cartes'}` 
    });
  };

  // Veterinarian handlers
  const openNewVet = () => {
    setEditVet(null);
    setVetForm({ 
      name: '', 
      title: '', 
      specialty: '', 
      phone: '', 
      email: '',
      is_active: true
    });
    setShowVetModal(true);
  };

  const openEditVet = (vet: VeterinarianSetting) => {
    setEditVet(vet);
    setVetForm({ 
      name: vet.name, 
      title: vet.title, 
      specialty: vet.specialty || '', 
      phone: vet.phone || '', 
      email: vet.email || '',
      is_active: vet.is_active
    });
    setShowVetModal(true);
  };

  const saveVet = () => {
    if (!vetForm.name || !vetForm.title) {
      toast({ title: 'Erreur', description: 'Nom et titre requis', variant: 'destructive' });
      return;
    }
    
    const fullName = `${vetForm.title} ${vetForm.name}`;
    let updatedVets;
    
    if (editVet) {
      updatedVets = dbVeterinarians.map(v => 
        v.id === editVet.id 
          ? { 
              ...v, 
              name: fullName,
              title: vetForm.title,
              specialty: vetForm.specialty,
              phone: vetForm.phone,
              email: vetForm.email,
              is_active: vetForm.is_active
            }
          : v
      );
    } else {
      const newVet: VeterinarianSetting = { 
        id: `vet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        name: fullName,
        title: vetForm.title,
        specialty: vetForm.specialty,
        phone: vetForm.phone,
        email: vetForm.email,
        is_active: true
      };
      updatedVets = [...dbVeterinarians, newVet];
    }
    
    updateVeterinarianMutation.mutate(updatedVets);
    toast({ title: 'Vétérinaire enregistré' });
    setShowVetModal(false);
  };

  const deleteVet = (id: string) => {
    if (!confirm('Supprimer ce vétérinaire ?')) return;
    const updatedVets = dbVeterinarians.filter(v => v.id !== id);
    updateVeterinarianMutation.mutate(updatedVets);
    toast({ title: 'Vétérinaire supprimé' });
  };

  // Farm management handlers
  const addFarmType = (type: string) => {
    if (!type.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      farm_types: [...farmSettings.farm_types, type.trim()]
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Type ajouté', description: `${type} a été ajouté aux types d'élevage` });
    setShowFarmTypeModal(false);
    setNewFarmType('');
  };

  const removeFarmType = (type: string) => {
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      farm_types: farmSettings.farm_types.filter(t => t !== type)
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Type supprimé', description: `${type} a été supprimé` });
  };

  const addAnimalCategory = (category: string) => {
    if (!category.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      animal_categories: [...farmSettings.animal_categories, category.trim()],
      breeds_by_category: {
        ...farmSettings.breeds_by_category,
        [category.trim()]: []
      }
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Catégorie ajoutée', description: `${category} a été ajoutée` });
    setShowCategoryModal(false);
    setNewCategory('');
  };

  const removeAnimalCategory = (category: string) => {
    if (!farmSettings) return;
    const { [category]: removed, ...remainingBreeds } = farmSettings.breeds_by_category;
    const updated = {
      ...farmSettings,
      animal_categories: farmSettings.animal_categories.filter(c => c !== category),
      breeds_by_category: remainingBreeds
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Catégorie supprimée', description: `${category} et ses races ont été supprimés` });
  };

  const addBreedToCategory = (category: string, breed: string) => {
    if (!breed.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      breeds_by_category: {
        ...farmSettings.breeds_by_category,
        [category]: [...(farmSettings.breeds_by_category[category] || []), breed.trim()]
      }
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Race ajoutée', description: `${breed} a été ajoutée à ${category}` });
    setShowBreedModal(false);
    setNewBreed('');
    setSelectedCategory('');
  };

  const removeBreedFromCategory = (category: string, breed: string) => {
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      breeds_by_category: {
        ...farmSettings.breeds_by_category,
        [category]: (farmSettings.breeds_by_category[category] || []).filter(b => b !== breed)
      }
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Race supprimée', description: `${breed} a été supprimée de ${category}` });
  };

  const addCertificationType = (type: string) => {
    if (!type.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      certification_types: [...farmSettings.certification_types, type.trim()]
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Certification ajoutée', description: `${type} a été ajoutée` });
    setShowCertificationModal(false);
    setNewCertification('');
  };

  const removeCertificationType = (type: string) => {
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      certification_types: farmSettings.certification_types.filter(t => t !== type)
    };
    updateFarmMutation.mutate(updated);
    toast({ title: 'Certification supprimée', description: `${type} a été supprimée` });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de l'application</CardTitle>
          <div className="flex items-center gap-4 mt-8 pt-8">
            <Button
              variant={activeTab === 'general' ? 'default' : 'outline'}
              onClick={() => setActiveTab('general')}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Paramètres généraux
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'outline'}
              onClick={() => setActiveTab('data')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Configuration des données
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Content */}
          {activeTab === 'data' ? (
            <SettingsManagement />
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Subscription & storage usage */}
                <StorageUsageCard />
                {/* Clinic Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de la Clinique</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logo">Logo de la clinique</Label>
                        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                        {settings.logo && <img src={settings.logo} alt="Logo" className="h-24 mt-2" />}
                      </div>
                      <div>
                        <Label htmlFor="clinicName">Nom de la clinique</Label>
                        <Input id="clinicName" value={settings.clinicName} onChange={e => handleSettingsChange('clinicName', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" value={settings.address} onChange={e => handleSettingsChange('address', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" value={settings.phone} onChange={e => handleSettingsChange('phone', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={settings.email} onChange={e => handleSettingsChange('email', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="website">Site web</Label>
                        <Input id="website" value={settings.website} onChange={e => handleSettingsChange('website', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="currency">Devise</Label>
                        <Input id="currency" value={settings.currency} onChange={e => handleSettingsChange('currency', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="defaultConsultationPrice">Prix de consultation par défaut ({settings.currency})</Label>
                        <Input 
                          id="defaultConsultationPrice" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={settings.defaultConsultationPrice} 
                          onChange={e => handleSettingsChange('defaultConsultationPrice', parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveSettings}>Enregistrer</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thème de l'application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Choisissez le thème de l'application pour votre confort visuel.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="theme-select">Thème</Label>
                          <p className="text-sm text-muted-foreground">
                            {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                          </p>
                        </div>
                        <Select
                          value={theme}
                          onValueChange={(value: 'light' | 'dark') => {
                            setTheme(value);
                            toast({
                              title: 'Thème mis à jour',
                              description: `Thème changé en mode ${value === 'light' ? 'clair' : 'sombre'}`,
                            });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Mode clair</SelectItem>
                            <SelectItem value="dark">Mode sombre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences d'affichage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Choisissez comment vous souhaitez afficher les différentes sections par défaut.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(settings.displayPreferences).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={`${key}-display`}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            <Select
                              value={value}
                              onValueChange={(newValue: 'table' | 'cards') => handleDisplayPreferenceChange(key as keyof DisplayPreferences, newValue)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Tableau</SelectItem>
                                <SelectItem value="cards">Cartes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Veterinarians */}
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle>Vétérinaires</CardTitle>
                    <Button onClick={openNewVet} className="gap-2">
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vets.length === 0 ? (
                      <p className="text-muted-foreground">Aucun vétérinaire configuré</p>
                    ) : (
                      vets.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{v.name}</p>
                            <p className="text-sm text-muted-foreground">{v.specialty}</p>
                            <p className="text-xs">{v.phone} | {v.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditVet(v)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteVet(v.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration des Horaires</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {scheduleLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="workingHours">Heure d'ouverture</Label>
                            <Input 
                              id="workingHours" 
                              type="time" 
                              value={scheduleSettings?.opening_time || '08:00'}
                              onChange={(e) => {
                                if (scheduleSettings) {
                                  updateScheduleMutation.mutate({
                                    ...scheduleSettings,
                                    opening_time: e.target.value
                                  });
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="closingTime">Heure de fermeture</Label>
                            <Input 
                              id="closingTime" 
                              type="time" 
                              value={scheduleSettings?.closing_time || '18:00'}
                              onChange={(e) => {
                                if (scheduleSettings) {
                                  updateScheduleMutation.mutate({
                                    ...scheduleSettings,
                                    closing_time: e.target.value
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Période déjeuner</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label htmlFor="lunchStart" className="text-xs text-muted-foreground">Début de pause</Label>
                              <Input 
                                id="lunchStart" 
                                type="time" 
                                value={scheduleSettings?.lunch_break_start || '12:00'}
                                onChange={(e) => {
                                  if (scheduleSettings) {
                                    updateScheduleMutation.mutate({
                                      ...scheduleSettings,
                                      lunch_break_start: e.target.value
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lunchEnd" className="text-xs text-muted-foreground">Fin de pause</Label>
                              <Input 
                                id="lunchEnd" 
                                type="time" 
                                value={scheduleSettings?.lunch_break_end || '14:00'}
                                onChange={(e) => {
                                  if (scheduleSettings) {
                                    updateScheduleMutation.mutate({
                                      ...scheduleSettings,
                                      lunch_break_end: e.target.value
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Durée des créneaux (minutes)</Label>
                          <Input 
                            type="number" 
                            value={scheduleSettings?.slot_duration || 30}
                            onChange={(e) => {
                              if (scheduleSettings) {
                                updateScheduleMutation.mutate({
                                  ...scheduleSettings,
                                  slot_duration: parseInt(e.target.value) || 30
                                });
                              }
                            }}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label className="mb-3 block">Jours de travail</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { day: 'Lundi', key: 'monday' },
                              { day: 'Mardi', key: 'tuesday' },
                              { day: 'Mercredi', key: 'wednesday' },
                              { day: 'Jeudi', key: 'thursday' },
                              { day: 'Vendredi', key: 'friday' },
                              { day: 'Samedi', key: 'saturday' },
                              { day: 'Dimanche', key: 'sunday' }
                            ].map((item) => {
                              const isEnabled = scheduleSettings?.working_days?.includes(item.key) ?? true;
                              return (
                                <div key={item.day} className="flex items-center justify-between">
                                  <Label htmlFor={item.day} className="text-sm">{item.day}</Label>
                                  <Switch 
                                    id={item.day} 
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => {
                                      if (scheduleSettings) {
                                        const workingDays = checked
                                          ? [...(scheduleSettings.working_days || []), item.key]
                                          : (scheduleSettings.working_days || []).filter(d => d !== item.key);
                                        updateScheduleMutation.mutate({
                                          ...scheduleSettings,
                                          working_days: workingDays
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Farm Management / Gestion des Exploitations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des Exploitations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {farmLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Farm Types */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Types d'élevage</Label>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => setShowFarmTypeModal(true)}
                            >
                              <Plus className="h-3 w-3" /> Ajouter
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.farm_types || []).map((type) => (
                              <Badge key={type} variant="secondary" className="gap-1">
                                {type}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                  onClick={() => removeFarmType(type)}
                                />
                              </Badge>
                            ))}
                            {(farmSettings?.farm_types || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">Aucun type d'élevage configuré</p>
                            )}
                          </div>
                        </div>

                        {/* Animal Categories */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Catégories d'animaux</Label>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => setShowCategoryModal(true)}
                            >
                              <Plus className="h-3 w-3" /> Ajouter
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.animal_categories || []).map((category) => (
                              <Badge key={category} variant="secondary" className="gap-1">
                                {category}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                  onClick={() => removeAnimalCategory(category)}
                                />
                              </Badge>
                            ))}
                            {(farmSettings?.animal_categories || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">Aucune catégorie configurée</p>
                            )}
                          </div>
                        </div>

                        {/* Breeds by Category */}
                        {farmSettings?.breeds_by_category && Object.keys(farmSettings.breeds_by_category).length > 0 ? (
                          Object.entries(farmSettings.breeds_by_category).map(([category, breeds]) => (
                            <div key={category}>
                              <div className="flex items-center justify-between mb-3">
                                <Label>{category}</Label>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="gap-2"
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setShowBreedModal(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3" /> Race
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(breeds || []).map((breed) => (
                                  <Badge key={breed} variant="outline" className="gap-1">
                                    {breed}
                                    <X 
                                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                      onClick={() => removeBreedFromCategory(category, breed)}
                                    />
                                  </Badge>
                                ))}
                                {(breeds || []).length === 0 && (
                                  <p className="text-sm text-muted-foreground">Aucune race configurée pour {category}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Aucune race configurée. Ajoutez des catégories d'animaux d'abord.
                          </div>
                        )}

                        {/* Certifications */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Types de certifications</Label>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => setShowCertificationModal(true)}
                            >
                              <Plus className="h-3 w-3" /> Ajouter
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.certification_types || []).map((cert) => (
                              <Badge key={cert} variant="secondary" className="gap-1">
                                {cert}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                  onClick={() => removeCertificationType(cert)}
                                />
                              </Badge>
                            ))}
                            {(farmSettings?.certification_types || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">Aucune certification configurée</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <UserProfile />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Veterinarian Modal */}
      <Dialog open={showVetModal} onOpenChange={setShowVetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVet ? 'Modifier vétérinaire' : 'Nouveau vétérinaire'}</DialogTitle>
            <DialogDescription>Nom, titre, spécialité, contact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vetName">Nom complet *</Label>
              <Input 
                id="vetName" 
                value={vetForm.name} 
                onChange={e => setVetForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetTitle">Titre *</Label>
              <Input 
                id="vetTitle" 
                value={vetForm.title} 
                onChange={e => setVetForm(f => ({ ...f, title: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetSpec">Spécialité</Label>
              <Input 
                id="vetSpec" 
                value={vetForm.specialty} 
                onChange={e => setVetForm(f => ({ ...f, specialty: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetPhone">Téléphone</Label>
              <Input 
                id="vetPhone" 
                value={vetForm.phone} 
                onChange={e => setVetForm(f => ({ ...f, phone: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetEmail">Email</Label>
              <Input 
                id="vetEmail" 
                type="email" 
                value={vetForm.email} 
                onChange={e => setVetForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVetModal(false)}>
                Annuler
              </Button>
              <Button onClick={saveVet}>
                {editVet ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Farm Type Modal */}
      <Dialog open={showFarmTypeModal} onOpenChange={setShowFarmTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un type d'élevage</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau type d'exploitation agricole
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="farmType">Type d'élevage *</Label>
              <Input 
                id="farmType"
                placeholder="Ex: Laitière, Viande, Avicole..."
                value={newFarmType}
                onChange={e => setNewFarmType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFarmType.trim()) {
                    addFarmType(newFarmType);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Appuyez sur Entrée ou cliquez sur Ajouter
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowFarmTypeModal(false);
                setNewFarmType('');
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => addFarmType(newFarmType)}
              disabled={!newFarmType.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Animal Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie d'animaux</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle catégorie d'animaux d'élevage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="animalCategory">Catégorie *</Label>
              <Input 
                id="animalCategory"
                placeholder="Ex: Bovin, Ovin, Caprin, Volaille..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    addAnimalCategory(newCategory);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Une section pour les races sera créée automatiquement
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategory('');
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => addAnimalCategory(newCategory)}
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breed Modal */}
      <Dialog open={showBreedModal} onOpenChange={setShowBreedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une race</DialogTitle>
            <DialogDescription>
              Ajouter une race pour la catégorie: <strong>{selectedCategory}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Nom de la race *</Label>
              <Input 
                id="breed"
                placeholder="Ex: Holstein, Timahdit, Drâa..."
                value={newBreed}
                onChange={e => setNewBreed(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newBreed.trim()) {
                    addBreedToCategory(selectedCategory, newBreed);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBreedModal(false);
                setNewBreed('');
                setSelectedCategory('');
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => addBreedToCategory(selectedCategory, newBreed)}
              disabled={!newBreed.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certification Modal */}
      <Dialog open={showCertificationModal} onOpenChange={setShowCertificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une certification</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau type de certification agricole
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="certification">Type de certification *</Label>
              <Input 
                id="certification"
                placeholder="Ex: Bio, Label Rouge, AOC, IGP..."
                value={newCertification}
                onChange={e => setNewCertification(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCertification.trim()) {
                    addCertificationType(newCertification);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCertificationModal(false);
                setNewCertification('');
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => addCertificationType(newCertification)}
              disabled={!newCertification.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}