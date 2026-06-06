// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAppSettings, 
  getAppSettingsByCategory, 
  getAppSetting,
  createOrUpdateAppSetting,
  deleteAppSetting,
  getClinicSettings,
  updateClinicSettings,
  getVeterinarianSettings,
  updateVeterinarianSettings,
  getFarmManagementSettings,
  updateFarmManagementSettings,
  getScheduleSettings,
  updateScheduleSettings
} from '../lib/database'
import type { 
  AppSetting, 
  ClinicSettings, 
  VeterinarianSetting, 
  FarmManagementSettings, 
  ScheduleSettings 
} from '../lib/database'

// Default setting values that can be customized by users
export const DEFAULT_SETTINGS = {
  animal_species: ['Chien', 'Chat', 'Oiseau', 'Lapin', 'Furet', 'Bovin', 'Ovin', 'Caprin', 'Porc', 'Cheval', 'Âne', 'Autre'],
  animal_breeds: {
    'Chien': ['Labrador', 'Golden Retriever', 'Berger Allemand', 'Bulldog', 'Yorkshire Terrier', 'Chihuahua', 'Rottweiler', 'Poodle', 'Boxer', 'Husky'],
    'Chat': ['Persan', 'Siamois', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal', 'Abyssin', 'Sphinx', 'Scottish Fold', 'Chartreux'],
    'Oiseau': ['Canari', 'Perruche', 'Cockatiel', 'Inséparable', 'Perroquet', 'Cacatoès', 'Conure', 'Calopsitte'],
    'Lapin': ['Nain', 'Bélier', 'Angora', 'Rex', 'Géant des Flandres', 'Hollandais'],
    'Bovin': ['Holstein', 'Montbéliarde', 'Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Normande'],
    'Ovin': ['Lacaune', 'Île-de-France', 'Texel', 'Suffolk', 'Mérinos', 'Dorper'],
    'Caprin': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora', 'Nubienne'],
    'Cheval': ['Pur-sang', 'Arabe', 'Quarter Horse', 'Frison', 'Andalou', 'Trotteur']
  },
  animal_colors: ['Noir', 'Blanc', 'Marron', 'Gris', 'Roux', 'Crème', 'Tacheté', 'Tricolore', 'Bringé', 'Fauve'],
  // Note: client_types must match database constraint (particulier, eleveur, ferme)
  // Display names are shown in UI, but values sent to DB are lowercase without accents
  client_types: ['Particulier', 'Éleveur', 'Ferme'],
  consultation_types: [
    'Consultation générale',
    'Vaccination',
    'Chirurgie',
    'Urgence',
    'Contrôle post-opératoire',
    'Examen de santé',
    'Stérilisation',
    'Dentaire',
    'Dermatologie',
    'Cardiologie',
    'Ophtalmologie',
    'Orthopédie'
  ],
  appointment_types: [
    'Consultation',
    'Vaccination',
    'Chirurgie',
    'Urgence',
    'Contrôle',
    'Toilettage',
    'Radiographie',
    'Échographie',
    'Analyses'
  ],
  medication_categories: [
    'Antibiotiques',
    'Anti-inflammatoires',
    'Antiparasitaires',
    'Vaccins',
    'Anesthésiques',
    'Vitamines',
    'Compléments',
    'Dermatologie',
    'Cardiologie',
    'Neurologie'
  ],
  vaccination_types: [
    'CHPPI-L (Chien)',
    'Rage',
    'Toux du chenil',
    'TCL (Chat)',
    'Leucose féline',
    'FIV',
    'Myxomatose (Lapin)',
    'VHD (Lapin)'
  ],
  parasite_types: [
    'Puces',
    'Tiques',
    'Vers ronds',
    'Vers plats',
    'Giardia',
    'Coccidies',
    'Acariens',
    'Poux'
  ],
  farm_types: [
    'Bovin laitier',
    'Bovin viande',
    'Porcin',
    'Avicole',
    'Ovin',
    'Caprin',
    'Équin',
    'Apiculture',
    'Aquaculture',
    'Cuniculture',
    'Mixte'
  ],
  payment_methods: ['Espèces', 'Carte bancaire', 'Chèque', 'Virement', 'Autre'],
  currencies: ['MAD', 'EUR', 'USD'],
  countries: ['Maroc', 'France', 'Espagne', 'Algérie', 'Tunisie'],
  cities_morocco: ['Rabat', 'Casablanca', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan']
}

// Hook for all app settings
export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: getAppSettings,
  })
}

// Hook for settings by category
export const useAppSettingsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['app-settings', category],
    queryFn: () => getAppSettingsByCategory(category),
    enabled: !!category,
  })
}

// Hook for a specific setting
export const useAppSetting = (category: string, key: string) => {
  return useQuery({
    queryKey: ['app-setting', category, key],
    queryFn: () => getAppSetting(category, key),
    enabled: !!category && !!key,
  })
}

// Custom hooks for specific setting types
export const useAnimalSpecies = () => {
  return useQuery({
    queryKey: ['app-setting', 'animals', 'species'],
    queryFn: () => getAppSetting('animals', 'species'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.animal_species,
  })
}

export const useAnimalBreeds = (species?: string) => {
  return useQuery({
    queryKey: ['app-setting', 'animals', 'breeds'],
    queryFn: () => getAppSetting('animals', 'breeds'),
    select: (data) => {
      const breeds = data?.setting_value || DEFAULT_SETTINGS.animal_breeds
      return species ? breeds[species] || [] : breeds
    },
  })
}

export const useAnimalColors = () => {
  return useQuery({
    queryKey: ['app-setting', 'animals', 'colors'],
    queryFn: () => getAppSetting('animals', 'colors'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.animal_colors,
  })
}

export const useClientTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'clients', 'types'],
    queryFn: () => getAppSetting('clients', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.client_types,
  })
}

export const useConsultationTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'consultations', 'types'],
    queryFn: () => getAppSetting('consultations', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.consultation_types,
  })
}

export const useAppointmentTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'appointments', 'types'],
    queryFn: () => getAppSetting('appointments', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.appointment_types,
  })
}

export const useMedicationCategories = () => {
  return useQuery({
    queryKey: ['app-setting', 'medications', 'categories'],
    queryFn: () => getAppSetting('medications', 'categories'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.medication_categories,
  })
}

export const useVaccinationTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'vaccinations', 'types'],
    queryFn: () => getAppSetting('vaccinations', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.vaccination_types,
  })
}

export const useParasiteTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'parasites', 'types'],
    queryFn: () => getAppSetting('parasites', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.parasite_types,
  })
}

export const useFarmTypes = () => {
  return useQuery({
    queryKey: ['app-setting', 'farms', 'types'],
    queryFn: () => getAppSetting('farms', 'types'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.farm_types,
  })
}

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['app-setting', 'payments', 'methods'],
    queryFn: () => getAppSetting('payments', 'methods'),
    select: (data) => data?.setting_value || DEFAULT_SETTINGS.payment_methods,
  })
}

// Hook for clinic settings
export const useClinicSettings = () => {
  return useQuery({
    queryKey: ['clinic-settings'],
    queryFn: getClinicSettings,
  })
}

// Hook for veterinarian settings
export const useVeterinarianSettings = () => {
  return useQuery({
    queryKey: ['veterinarian-settings'],
    queryFn: getVeterinarianSettings,
  })
}

// Default values for settings
const DEFAULT_FARM_SETTINGS: FarmManagementSettings = {
  enabled: true,
  farm_types: ['Laitière', 'Viande', 'Mixte', 'Avicole', 'Ovine', 'Caprine'],
  animal_categories: ['Bovin', 'Ovin', 'Caprin', 'Volaille', 'Équin'],
  breeds_by_category: {
    'Bovin': ['Holstein', 'Montbéliarde', 'Prim Holstein', 'Charolaise', 'Limousine'],
    'Ovin': ['Timahdit', 'Beni Guil', 'Sardi', 'D\'man'],
    'Caprin': ['Drâa', 'Noire de Marrakech', 'Alpine', 'Saanen'],
    'Volaille': ['Pondeuse', 'Chair', 'Locale', 'Pintade'],
    'Équin': ['Arabe', 'Barbe', 'Trait', 'Pur-sang']
  },
  certification_types: ['Bio', 'Label Rouge', 'Standard', 'AOC', 'IGP'],
  equipment_types: ['Traite', 'Alimentation', 'Vétérinaire', 'Stockage'],
  default_surface_unit: 'hectare',
  default_coordinate_format: 'GPS'
}

const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  opening_time: '08:00',
  closing_time: '18:00',
  slot_duration: 30,
  lunch_break_start: '12:00',
  lunch_break_end: '14:00',
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  appointment_duration: 30,
  buffer_time: 10,
  max_appointments_per_day: 20
}

// Hook for farm management settings
export const useFarmManagementSettings = () => {
  return useQuery({
    queryKey: ['farm-management-settings'],
    queryFn: getFarmManagementSettings,
    select: (data) => data || DEFAULT_FARM_SETTINGS,
  })
}

// Hook for schedule settings
export const useScheduleSettings = () => {
  return useQuery({
    queryKey: ['schedule-settings'],
    queryFn: getScheduleSettings,
    select: (data) => data || DEFAULT_SCHEDULE_SETTINGS,
  })
}

// Mutation hooks for updating settings
export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      category, 
      key, 
      value, 
      description 
    }: { 
      category: string
      key: string
      value: any
      description?: string
    }) => {
      return createOrUpdateAppSetting(category, key, value, description)
    },
    onSuccess: (_, variables) => {
      // Invalidate specific setting
      queryClient.invalidateQueries({ 
        queryKey: ['app-setting', variables.category, variables.key] 
      })
      // Invalidate category settings
      queryClient.invalidateQueries({ 
        queryKey: ['app-settings', variables.category] 
      })
      // Invalidate all settings
      queryClient.invalidateQueries({ 
        queryKey: ['app-settings'] 
      })
    },
  })
}

export const useDeleteAppSetting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ category, key }: { category: string; key: string }) => 
      deleteAppSetting(category, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] })
    },
  })
}

export const useUpdateClinicSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClinicSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-settings'] })
    },
  })
}

export const useUpdateVeterinarianSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVeterinarianSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinarian-settings'] })
    },
  })
}

export const useUpdateFarmManagementSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateFarmManagementSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-management-settings'] })
    },
  })
}

export const useUpdateScheduleSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateScheduleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-settings'] })
    },
  })
}

// Utility hook to initialize default settings in database
export const useInitializeDefaultSettings = () => {
  const updateAppSetting = useUpdateAppSetting()

  const initializeDefaults = async () => {
    const settingsToInitialize = [
      { category: 'animals', key: 'species', value: DEFAULT_SETTINGS.animal_species, description: 'Types d\'espèces animales' },
      { category: 'animals', key: 'breeds', value: DEFAULT_SETTINGS.animal_breeds, description: 'Races par espèce' },
      { category: 'animals', key: 'colors', value: DEFAULT_SETTINGS.animal_colors, description: 'Couleurs des animaux' },
      { category: 'clients', key: 'types', value: DEFAULT_SETTINGS.client_types, description: 'Types de clients' },
      { category: 'consultations', key: 'types', value: DEFAULT_SETTINGS.consultation_types, description: 'Types de consultations' },
      { category: 'appointments', key: 'types', value: DEFAULT_SETTINGS.appointment_types, description: 'Types de rendez-vous' },
      { category: 'medications', key: 'categories', value: DEFAULT_SETTINGS.medication_categories, description: 'Catégories de médicaments' },
      { category: 'vaccinations', key: 'types', value: DEFAULT_SETTINGS.vaccination_types, description: 'Types de vaccinations' },
      { category: 'parasites', key: 'types', value: DEFAULT_SETTINGS.parasite_types, description: 'Types de parasites' },
      { category: 'farms', key: 'types', value: DEFAULT_SETTINGS.farm_types, description: 'Types de fermes' },
      { category: 'payments', key: 'methods', value: DEFAULT_SETTINGS.payment_methods, description: 'Méthodes de paiement' },
    ]

    for (const setting of settingsToInitialize) {
      try {
        await updateAppSetting.mutateAsync(setting)
      } catch (error) {
        console.error(`Failed to initialize setting ${setting.category}.${setting.key}:`, error)
      }
    }
  }

  return { initializeDefaults, isLoading: updateAppSetting.isPending }
}