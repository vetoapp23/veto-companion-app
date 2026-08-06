// @ts-nocheck
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Settings2, Shield, X, Cog, Banknote, RotateCcw, Save } from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { useWriteAccess } from "@/components/RoleGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAnimals } from "@/hooks/useDatabase";
import { useSettings, ClinicSettings, DisplayPreferences } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/components/UserProfile";
import { User } from "lucide-react";
import { SettingsManagement } from "@/components/SettingsManagement";
import { StorageUsageCard } from "@/components/StorageUsageCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  VISIT_SERVICE_CATALOG,
  getVisitServiceDescription,
  getVisitServiceLabel,
  getCatalogDefaultPrices,
} from "@/lib/visitCatalog";
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
import { DEFAULT_DB_SCHEDULE, dbScheduleToUi } from '@/lib/scheduleSettings'

export default function Settings() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { t: tm } = useTranslation("medical");
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      toast({
        title: t("billing.successTitle", { defaultValue: "Paiement reçu" }),
        description: t("billing.successBody", {
          defaultValue: "Votre abonnement Stripe est en cours d’activation. Rechargez si les quotas ne se mettent pas à jour.",
        }),
      });
      searchParams.delete("billing");
      searchParams.delete("session_id");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_settings");
  
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
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleSettings | null>(null);
  const [scheduleDirty, setScheduleDirty] = useState(false);

  useEffect(() => {
    if (!scheduleSettings) return;
    if (!scheduleDirty) {
      setScheduleDraft({ ...DEFAULT_DB_SCHEDULE, ...scheduleSettings });
    }
  }, [scheduleSettings, scheduleDirty]);

  const patchScheduleDraft = (patch: Partial<ScheduleSettings>) => {
    if (!canWrite) return;
    setScheduleDraft((prev) => ({
      ...DEFAULT_DB_SCHEDULE,
      ...(prev || scheduleSettings || {}),
      ...patch,
    }));
    setScheduleDirty(true);
  };

  const saveScheduleSettings = async () => {
    if (!guardWrite()) return;
    const payload = scheduleDraft || scheduleSettings;
    if (!payload) return;
    try {
      const toSave: ScheduleSettings = {
        ...DEFAULT_DB_SCHEDULE,
        ...payload,
        slot_duration: Number(payload.slot_duration) || 30,
        appointment_duration: Number(payload.slot_duration) || Number(payload.appointment_duration) || 30,
      };
      await updateScheduleMutation.mutateAsync(toSave);
      updateSettings({
        ...settings,
        scheduleSettings: dbScheduleToUi(toSave),
      } as ClinicSettings);
      setScheduleDirty(false);
      toast({
        title: t("schedule.saved"),
        description: t("schedule.savedBody"),
      });
    } catch (e: any) {
      toast({
        title: t("errors.generic"),
        description: e?.message || t("errors.generic"),
        variant: "destructive",
      });
    }
  };

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

  // Sync species with animals from Supabase
  const { data: animals = [] } = useAnimals();
  useEffect(() => {
    const dynamic = Array.from(new Set(animals.map((a: any) => a.species).filter(Boolean)));
    if (dynamic.length === 0) return;
    const merged = Array.from(new Set([
      ...settings.species.split(',').map((s: string) => s.trim()).filter(Boolean),
      ...dynamic,
    ]));
    const next = merged.join(', ');
    if (next !== settings.species) {
      updateSettings({ ...settings, species: next } as ClinicSettings);
    }
  }, [animals]);

  // Handlers for clinic settings
  const handleSettingsChange = (field: keyof ClinicSettings, value: string | boolean | number | any) => {
    if (!guardWrite()) return;
    updateSettings({ ...settings, [field]: value } as ClinicSettings);
  };

  const saveSettings = () => {
    if (!guardWrite()) return;
    toast({ title: t("clinic.saved"), description: t("clinic.savedBody") });
  };

  // Logo handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!guardWrite()) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSettingsChange('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Display preferences handler
  const DISPLAY_SECTION_KEYS: (keyof DisplayPreferences)[] = [
    "clients",
    "pets",
    "consultations",
    "appointments",
    "visits",
    "prescriptions",
    "farms",
    "vaccinations",
    "antiparasitics",
    "history",
  ];

  const displayOptionsFor = (section: keyof DisplayPreferences) => {
    if (section === "appointments") {
      return [
        { value: "calendar", label: t("display.modes.calendar") },
        { value: "list", label: t("display.modes.list") },
        { value: "table", label: t("display.modes.table") },
        { value: "cards", label: t("display.modes.cards") },
      ] as const;
    }
    return [
      { value: "table", label: t("display.modes.table") },
      { value: "cards", label: t("display.modes.cards") },
    ] as const;
  };

  const handleDisplayPreferenceChange = (
    section: keyof DisplayPreferences,
    value: DisplayPreferences[keyof DisplayPreferences]
  ) => {
    if (!guardWrite()) return;
    const updatedPreferences = {
      ...settings.displayPreferences,
      [section]: value,
    };
    updateSettings({
      ...settings,
      displayPreferences: updatedPreferences,
    });
    const optionLabel =
      displayOptionsFor(section).find((o) => o.value === value)?.label || value;
    toast({
      title: t("display.updated"),
      description: t("display.updatedBody", {
        section: t(`display.sections.${section}`),
        mode: optionLabel,
      }),
    });
  };

  // Veterinarian handlers
  const openNewVet = () => {
    if (!guardWrite()) return;
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
    if (!guardWrite()) return;
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
    if (!guardWrite()) return;
    if (!vetForm.name || !vetForm.title) {
      toast({ title: t("errors.generic"), description: t("veterinarians.nameTitleRequired"), variant: 'destructive' });
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
    toast({ title: t("veterinarians.saved") });
    setShowVetModal(false);
  };

  const deleteVet = (id: string) => {
    if (!guardWrite()) return;
    if (!confirm(t("veterinarians.deleteConfirm"))) return;
    const updatedVets = dbVeterinarians.filter(v => v.id !== id);
    updateVeterinarianMutation.mutate(updatedVets);
    toast({ title: t("veterinarians.deleted") });
  };

  // Farm management handlers
  const addFarmType = (type: string) => {
    if (!guardWrite()) return;
    if (!type.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      farm_types: [...farmSettings.farm_types, type.trim()]
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.farmTypeAdded"), description: t("farmsConfig.farmTypeAddedBody", { type }) });
    setShowFarmTypeModal(false);
    setNewFarmType('');
  };

  const removeFarmType = (type: string) => {
    if (!guardWrite()) return;
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      farm_types: farmSettings.farm_types.filter(t => t !== type)
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.farmTypeDeleted"), description: t("farmsConfig.farmTypeDeletedBody", { type }) });
  };

  const addAnimalCategory = (category: string) => {
    if (!guardWrite()) return;
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
    toast({ title: t("farmsConfig.categoryAdded"), description: t("farmsConfig.categoryAddedBody", { category }) });
    setShowCategoryModal(false);
    setNewCategory('');
  };

  const removeAnimalCategory = (category: string) => {
    if (!guardWrite()) return;
    if (!farmSettings) return;
    const { [category]: removed, ...remainingBreeds } = farmSettings.breeds_by_category;
    const updated = {
      ...farmSettings,
      animal_categories: farmSettings.animal_categories.filter(c => c !== category),
      breeds_by_category: remainingBreeds
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.categoryDeleted"), description: t("farmsConfig.categoryDeletedBody", { category }) });
  };

  const addBreedToCategory = (category: string, breed: string) => {
    if (!guardWrite()) return;
    if (!breed.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      breeds_by_category: {
        ...farmSettings.breeds_by_category,
        [category]: [...(farmSettings.breeds_by_category[category] || []), breed.trim()]
      }
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.breedAdded"), description: t("farmsConfig.breedAddedBody", { breed, category }) });
    setShowBreedModal(false);
    setNewBreed('');
    setSelectedCategory('');
  };

  const removeBreedFromCategory = (category: string, breed: string) => {
    if (!guardWrite()) return;
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      breeds_by_category: {
        ...farmSettings.breeds_by_category,
        [category]: (farmSettings.breeds_by_category[category] || []).filter(b => b !== breed)
      }
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.breedDeleted"), description: t("farmsConfig.breedDeletedBody", { breed, category }) });
  };

  const addCertificationType = (type: string) => {
    if (!guardWrite()) return;
    if (!type.trim() || !farmSettings) return;
    const updated = {
      ...farmSettings,
      certification_types: [...farmSettings.certification_types, type.trim()]
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.certificationAdded"), description: t("farmsConfig.certificationAddedBody", { type }) });
    setShowCertificationModal(false);
    setNewCertification('');
  };

  const removeCertificationType = (type: string) => {
    if (!guardWrite()) return;
    if (!farmSettings) return;
    const updated = {
      ...farmSettings,
      certification_types: farmSettings.certification_types.filter(t => t !== type)
    };
    updateFarmMutation.mutate(updated);
    toast({ title: t("farmsConfig.certificationDeleted"), description: t("farmsConfig.certificationDeletedBody", { type }) });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <AppPageHeader
        icon={Cog}
        title={t("page.title")}
        description={t("page.description")}
      />

      {!canWrite && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>{t("readOnly.title")}</AlertTitle>
          <AlertDescription>
            {t("readOnly.description")}
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("tabs.appSettings")}</CardTitle>
          <div className="flex items-center gap-4 mt-8 pt-8">
            <Button
              variant={activeTab === 'general' ? 'default' : 'outline'}
              onClick={() => setActiveTab('general')}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {t("tabs.general")}
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'outline'}
              onClick={() => setActiveTab('data')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {t("tabs.data")}
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
                {/* Language */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("language.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("language.description")}
                    </p>
                    <LanguageSwitcher />
                  </CardContent>
                </Card>

                {/* Subscription & storage usage */}
                <StorageUsageCard />
                {/* Clinic Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("clinic.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logo">{t("clinic.logo")}</Label>
                        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} disabled={!canWrite} />
                        {settings.logo && <img src={settings.logo} alt="Logo" className="h-24 mt-2" />}
                      </div>
                      <div>
                        <Label htmlFor="clinicName">{t("clinic.name")}</Label>
                        <Input id="clinicName" value={settings.clinicName} onChange={e => handleSettingsChange('clinicName', e.target.value)} disabled={!canWrite} />
                      </div>
                      <div>
                        <Label htmlFor="address">{t("clinic.address")}</Label>
                        <Input id="address" value={settings.address} onChange={e => handleSettingsChange('address', e.target.value)} disabled={!canWrite} />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("clinic.phone")}</Label>
                        <Input id="phone" value={settings.phone} onChange={e => handleSettingsChange('phone', e.target.value)} disabled={!canWrite} />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("clinic.email")}</Label>
                        <Input id="email" type="email" value={settings.email} onChange={e => handleSettingsChange('email', e.target.value)} disabled={!canWrite} />
                      </div>
                      <div>
                        <Label htmlFor="website">{t("clinic.website")}</Label>
                        <Input id="website" value={settings.website} onChange={e => handleSettingsChange('website', e.target.value)} disabled={!canWrite} />
                      </div>
                      <div>
                        <Label htmlFor="currency">{t("clinic.currency")}</Label>
                        <Input id="currency" value={settings.currency} onChange={e => handleSettingsChange('currency', e.target.value)} disabled={!canWrite} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canWrite && <Button onClick={saveSettings}>{t("clinic.save")}</Button>}
                    </div>
                  </CardContent>
                </Card>

                {/* Service default prices */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      {t("servicePrices.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("servicePrices.description")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {VISIT_SERVICE_CATALOG.map((def) => {
                        const Icon = def.icon;
                        const value =
                          settings.servicePrices?.[def.code] ?? def.defaultAmount;
                        return (
                          <div
                            key={def.code}
                            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                          >
                            <div className="rounded-md bg-muted p-2 text-muted-foreground w-fit">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Label
                                htmlFor={`price-${def.code}`}
                                className="text-sm font-medium"
                              >
                                {getVisitServiceLabel(def, tm)}
                              </Label>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {getVisitServiceDescription(def, tm)}
                              </p>
                            </div>
                            <div className="w-full sm:w-28 shrink-0">
                              <Input
                                id={`price-${def.code}`}
                                type="number"
                                step="1"
                                min="0"
                                className="text-right tabular-nums w-full"
                                value={value}
                                disabled={!canWrite}
                                onChange={(e) => {
                                  if (!canWrite) return;
                                  const amount = Math.max(
                                    0,
                                    parseFloat(e.target.value) || 0
                                  );
                                  const nextPrices = {
                                    ...(settings.servicePrices || getCatalogDefaultPrices()),
                                    [def.code]: amount,
                                  };
                                  updateSettings({
                                    ...settings,
                                    servicePrices: nextPrices,
                                    ...(def.code === "consultation"
                                      ? { defaultConsultationPrice: amount }
                                      : {}),
                                  });
                                }}
                              />
                              <p className="text-[10px] text-muted-foreground text-right mt-0.5">
                                {settings.currency}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canWrite && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              if (!guardWrite()) return;
                              const defaults = getCatalogDefaultPrices();
                              updateSettings({
                                ...settings,
                                servicePrices: defaults,
                                defaultConsultationPrice: defaults.consultation ?? 150,
                              });
                              toast({
                                title: t("servicePrices.resetToast"),
                                description: t("servicePrices.resetBody"),
                              });
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("servicePrices.reset")}
                          </Button>
                          <Button
                            onClick={() => {
                              if (!guardWrite()) return;
                              toast({
                                title: t("servicePrices.savedToast"),
                                description: t("servicePrices.savedBody"),
                              });
                            }}
                          >
                            {t("servicePrices.save")}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("theme.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {t("theme.description")}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="theme-select">{t("theme.label")}</Label>
                          <p className="text-sm text-muted-foreground">
                            {theme === 'light' ? t("theme.light") : t("theme.dark")}
                          </p>
                        </div>
                        <Select
                          value={theme}
                          onValueChange={(value: 'light' | 'dark') => {
                            setTheme(value);
                            toast({
                              title: t("theme.updated"),
                              description: t("theme.changedTo", {
                                mode: value === 'light' ? t("theme.light") : t("theme.dark"),
                              }),
                            });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">{t("theme.light")}</SelectItem>
                            <SelectItem value="dark">{t("theme.dark")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("display.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {t("display.description")}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DISPLAY_SECTION_KEYS.map((key) => {
                          const value =
                            settings.displayPreferences[key] ??
                            (key === "appointments" ? "calendar" : key === "pets" || key === "farms" || key === "visits" || key === "history" ? "cards" : "table");
                          const options = displayOptionsFor(key);
                          return (
                            <div key={key} className="space-y-2">
                              <Label htmlFor={`${key}-display`}>{t(`display.sections.${key}`)}</Label>
                              <Select
                                value={value}
                                disabled={!canWrite}
                                onValueChange={(newValue) =>
                                  handleDisplayPreferenceChange(
                                    key,
                                    newValue as DisplayPreferences[keyof DisplayPreferences]
                                  )
                                }
                              >
                                <SelectTrigger id={`${key}-display`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Veterinarians */}
                <Card>
                  <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>{t("veterinarians.title")}</CardTitle>
                    {canWrite && (
                      <Button onClick={openNewVet} className="gap-2 w-full sm:w-auto shrink-0">
                        <Plus className="h-4 w-4" /> {t("veterinarians.add")}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vets.length === 0 ? (
                      <p className="text-muted-foreground">{t("veterinarians.empty")}</p>
                    ) : (
                      vets.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{v.name}</p>
                            <p className="text-sm text-muted-foreground">{v.specialty}</p>
                            <p className="text-xs">{v.phone} | {v.email}</p>
                          </div>
                          {canWrite && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditVet(v)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteVet(v.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Configuration */}
                <Card>
                  <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>{t("schedule.title")}</CardTitle>
                    {canWrite && (
                      <Button
                        onClick={saveScheduleSettings}
                        disabled={!scheduleDirty || updateScheduleMutation.isPending || scheduleLoading}
                        className="gap-2 w-full sm:w-auto shrink-0"
                      >
                        {updateScheduleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {t("schedule.save")}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {scheduleLoading || !scheduleDraft ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {scheduleDirty && (
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {t("schedule.unsavedWarning")}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="workingHours">{t("schedule.openingTime")}</Label>
                            <Input
                              id="workingHours"
                              type="time"
                              disabled={!canWrite}
                              value={scheduleDraft.opening_time || '08:00'}
                              onChange={(e) => patchScheduleDraft({ opening_time: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="closingTime">{t("schedule.closingTime")}</Label>
                            <Input
                              id="closingTime"
                              type="time"
                              disabled={!canWrite}
                              value={scheduleDraft.closing_time || '18:00'}
                              onChange={(e) => patchScheduleDraft({ closing_time: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>{t("schedule.lunchPeriod")}</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label htmlFor="lunchStart" className="text-xs text-muted-foreground">{t("schedule.lunchStart")}</Label>
                              <Input
                                id="lunchStart"
                                type="time"
                                disabled={!canWrite}
                                value={scheduleDraft.lunch_break_start || '12:00'}
                                onChange={(e) => patchScheduleDraft({ lunch_break_start: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lunchEnd" className="text-xs text-muted-foreground">{t("schedule.lunchEnd")}</Label>
                              <Input
                                id="lunchEnd"
                                type="time"
                                disabled={!canWrite}
                                value={scheduleDraft.lunch_break_end || '14:00'}
                                onChange={(e) => patchScheduleDraft({ lunch_break_end: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="slotDuration">{t("schedule.slotDuration")}</Label>
                          <Input
                            id="slotDuration"
                            type="number"
                            min={5}
                            step={5}
                            disabled={!canWrite}
                            value={scheduleDraft.slot_duration || 30}
                            onChange={(e) =>
                              patchScheduleDraft({
                                slot_duration: parseInt(e.target.value, 10) || 30,
                              })
                            }
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label className="mb-3 block">{t("schedule.workingDays")}</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { dayKey: 'monday', key: 'monday' },
                              { dayKey: 'tuesday', key: 'tuesday' },
                              { dayKey: 'wednesday', key: 'wednesday' },
                              { dayKey: 'thursday', key: 'thursday' },
                              { dayKey: 'friday', key: 'friday' },
                              { dayKey: 'saturday', key: 'saturday' },
                              { dayKey: 'sunday', key: 'sunday' },
                            ].map((item) => {
                              const isEnabled = scheduleDraft.working_days?.includes(item.key) ?? false;
                              return (
                                <div key={item.key} className="flex items-center justify-between">
                                  <Label htmlFor={item.key} className="text-sm">{t(`schedule.days.${item.dayKey}`)}</Label>
                                  <Switch
                                    id={item.key}
                                    disabled={!canWrite}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => {
                                      const current = scheduleDraft.working_days || [];
                                      const working_days = checked
                                        ? Array.from(new Set([...current, item.key]))
                                        : current.filter((d) => d !== item.key);
                                      patchScheduleDraft({ working_days });
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
                    <CardTitle>{t("farmsConfig.title")}</CardTitle>
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
                            <Label>{t("farmsConfig.farmTypes")}</Label>
                            {canWrite && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => setShowFarmTypeModal(true)}
                              >
                                <Plus className="h-3 w-3" /> {t("veterinarians.add")}
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.farm_types || []).map((type) => (
                              <Badge key={type} variant="secondary" className="gap-1">
                                {type}
                                {canWrite && (
                                  <X 
                                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                    onClick={() => removeFarmType(type)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {(farmSettings?.farm_types || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">{t("farmsConfig.noFarmTypes")}</p>
                            )}
                          </div>
                        </div>

                        {/* Animal Categories */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>{t("farmsConfig.animalCategories")}</Label>
                            {canWrite && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => setShowCategoryModal(true)}
                              >
                                <Plus className="h-3 w-3" /> {t("veterinarians.add")}
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.animal_categories || []).map((category) => (
                              <Badge key={category} variant="secondary" className="gap-1">
                                {category}
                                {canWrite && (
                                  <X 
                                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                    onClick={() => removeAnimalCategory(category)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {(farmSettings?.animal_categories || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">{t("farmsConfig.noCategories")}</p>
                            )}
                          </div>
                        </div>

                        {/* Breeds by Category */}
                        {farmSettings?.breeds_by_category && Object.keys(farmSettings.breeds_by_category).length > 0 ? (
                          Object.entries(farmSettings.breeds_by_category).map(([category, breeds]) => (
                            <div key={category}>
                              <div className="flex items-center justify-between mb-3">
                                <Label>{t("farmsConfig.breedsFor", { category })}</Label>
                                {canWrite && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={() => {
                                      setSelectedCategory(category);
                                      setShowBreedModal(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3" /> {t("farmsConfig.addBreedBtn")}
                                  </Button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(breeds || []).map((breed) => (
                                  <Badge key={breed} variant="outline" className="gap-1">
                                    {breed}
                                    {canWrite && (
                                      <X 
                                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                        onClick={() => removeBreedFromCategory(category, breed)}
                                      />
                                    )}
                                  </Badge>
                                ))}
                                {(breeds || []).length === 0 && (
                                  <p className="text-sm text-muted-foreground">{t("farmsConfig.noBreedsFor", { category })}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {t("farmsConfig.noBreedsHint")}
                          </div>
                        )}

                        {/* Certifications */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>{t("farmsConfig.certifications")}</Label>
                            {canWrite && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => setShowCertificationModal(true)}
                              >
                                <Plus className="h-3 w-3" /> {t("veterinarians.add")}
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(farmSettings?.certification_types || []).map((cert) => (
                              <Badge key={cert} variant="secondary" className="gap-1">
                                {cert}
                                {canWrite && (
                                  <X 
                                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                    onClick={() => removeCertificationType(cert)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {(farmSettings?.certification_types || []).length === 0 && (
                              <p className="text-sm text-muted-foreground">{t("farmsConfig.noCertifications")}</p>
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
            <DialogTitle>{editVet ? t("veterinarians.editTitle") : t("veterinarians.newTitle")}</DialogTitle>
            <DialogDescription>{t("veterinarians.dialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vetName">{t("veterinarians.fullName")}</Label>
              <Input 
                id="vetName" 
                value={vetForm.name} 
                onChange={e => setVetForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetTitle">{t("veterinarians.titleLabel")}</Label>
              <Input 
                id="vetTitle" 
                value={vetForm.title} 
                onChange={e => setVetForm(f => ({ ...f, title: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetSpec">{t("veterinarians.specialty")}</Label>
              <Input 
                id="vetSpec" 
                value={vetForm.specialty} 
                onChange={e => setVetForm(f => ({ ...f, specialty: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetPhone">{t("veterinarians.phone")}</Label>
              <Input 
                id="vetPhone" 
                value={vetForm.phone} 
                onChange={e => setVetForm(f => ({ ...f, phone: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetEmail">{t("veterinarians.email")}</Label>
              <Input 
                id="vetEmail" 
                type="email" 
                value={vetForm.email} 
                onChange={e => setVetForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVetModal(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={saveVet}>
                {editVet ? t("veterinarians.update") : t("veterinarians.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Farm Type Modal */}
      <Dialog open={showFarmTypeModal} onOpenChange={setShowFarmTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("farmsConfig.addFarmTypeTitle")}</DialogTitle>
            <DialogDescription>
              {t("farmsConfig.addFarmTypeDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="farmType">{t("farmsConfig.farmTypeLabel")}</Label>
              <Input 
                id="farmType"
                placeholder={t("farmsConfig.farmTypePlaceholder")}
                value={newFarmType}
                onChange={e => setNewFarmType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFarmType.trim()) {
                    addFarmType(newFarmType);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                {t("farmsConfig.pressEnterHint")}
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
              {tc("cancel")}
            </Button>
            <Button 
              onClick={() => addFarmType(newFarmType)}
              disabled={!newFarmType.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("veterinarians.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Animal Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("farmsConfig.addCategoryTitle")}</DialogTitle>
            <DialogDescription>
              {t("farmsConfig.addCategoryDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="animalCategory">{t("farmsConfig.categoryLabel")}</Label>
              <Input 
                id="animalCategory"
                placeholder={t("farmsConfig.categoryPlaceholder")}
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    addAnimalCategory(newCategory);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                {t("farmsConfig.breedsAutoHint")}
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
              {tc("cancel")}
            </Button>
            <Button 
              onClick={() => addAnimalCategory(newCategory)}
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("veterinarians.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breed Modal */}
      <Dialog open={showBreedModal} onOpenChange={setShowBreedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("farmsConfig.addBreedTitle")}</DialogTitle>
            <DialogDescription>
              {t("farmsConfig.addBreedDesc", { category: selectedCategory })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="breed">{t("farmsConfig.breedLabel")}</Label>
              <Input 
                id="breed"
                placeholder={t("farmsConfig.breedPlaceholder")}
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
              {tc("cancel")}
            </Button>
            <Button 
              onClick={() => addBreedToCategory(selectedCategory, newBreed)}
              disabled={!newBreed.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("veterinarians.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certification Modal */}
      <Dialog open={showCertificationModal} onOpenChange={setShowCertificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("farmsConfig.addCertificationTitle")}</DialogTitle>
            <DialogDescription>
              {t("farmsConfig.addCertificationDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="certification">{t("farmsConfig.certificationLabel")}</Label>
              <Input 
                id="certification"
                placeholder={t("farmsConfig.certificationPlaceholder")}
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
              {tc("cancel")}
            </Button>
            <Button 
              onClick={() => addCertificationType(newCertification)}
              disabled={!newCertification.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("veterinarians.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}