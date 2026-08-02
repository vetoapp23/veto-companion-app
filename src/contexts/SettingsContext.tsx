import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { getCatalogDefaultPrices } from '@/lib/visitCatalog';

export interface FarmManagementSettings {
  farmTypes: string[];
  animalCategories: string[];
  breedsByCategory: Record<string, string[]>;
  certificationTypes: string[];
  equipmentTypes: string[];
  defaultSurfaceUnit: string;
  defaultCoordinateFormat: string;
}

export type StandardDisplayMode = "table" | "cards";
export type AppointmentDisplayMode = "calendar" | "list" | "table" | "cards";

export interface DisplayPreferences {
  clients: StandardDisplayMode;
  pets: StandardDisplayMode;
  consultations: StandardDisplayMode;
  appointments: AppointmentDisplayMode;
  visits: StandardDisplayMode;
  prescriptions: StandardDisplayMode;
  farms: StandardDisplayMode;
  vaccinations: StandardDisplayMode;
  antiparasitics: StandardDisplayMode;
  history: StandardDisplayMode;
}

export interface ScheduleSettings {
  openingTime: string; // Format HH:MM
  closingTime: string; // Format HH:MM
  slotDuration: number; // Durée en minutes (15, 30, 45, 60)
  lunchBreakStart?: string; // Format HH:MM
  lunchBreakEnd?: string; // Format HH:MM
  workingDays: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
}

export interface Veterinarian {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ClinicSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  footerText?: string;
  logo?: string;
  currency: string;
  species: string;
  showClinicInfo: boolean;
  showVetsInfo: boolean;
  veterinarians: Veterinarian[];
  farmManagement: FarmManagementSettings;
  displayPreferences: DisplayPreferences;
  /** @deprecated Prefer servicePrices.consultation — kept for compat */
  defaultConsultationPrice: number;
  /** Prix par défaut des prestations visite (code → montant) */
  servicePrices: Record<string, number>;
  scheduleSettings: ScheduleSettings;
}

const SETTINGS_KEY = 'vetpro-clinicSettings';

interface SettingsContextType {
  settings: ClinicSettings;
  updateSettings: (settings: ClinicSettings) => void;
}

const defaultFarmManagementSettings: FarmManagementSettings = {
  farmTypes: [
    'Bovin laitier', 'Bovin viande', 'Porcin', 'Avicole', 'Ovin', 'Caprin', 
    'Équin', 'Apiculture', 'Aquaculture', 'Cuniculture', 'Mixte'
  ],
  animalCategories: [
    'Bovins laitiers', 'Bovins à viande', 'Porcs', 'Poules pondeuses', 
    'Poulets de chair', 'Ovins', 'Caprins', 'Chevaux', 'Lapins', 'Abeilles', 'Poissons'
  ],
  breedsByCategory: {
    'Bovins laitiers': ['Holstein', 'Prim\'Holstein', 'Montbéliarde', 'Normande', 'Simmental'],
    'Bovins à viande': ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Angus', 'Salers'],
    'Porcs': ['Large White', 'Landrace', 'Piétrain', 'Duroc', 'Hampshire'],
    'Poules pondeuses': ['ISA Brown', 'Lohmann Brown', 'Hy-Line', 'Novogen', 'Dekalb'],
    'Poulets de chair': ['Cobb 500', 'Ross 308', 'Hubbard', 'Arbor Acres'],
    'Ovins': ['Lacaune', 'Brebis laitière', 'Ile-de-France', 'Texel', 'Suffolk'],
    'Caprins': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora'],
    'Chevaux': ['Pur-sang', 'Trotteur', 'Selle français', 'Arabe', 'Quarter Horse'],
    'Lapins': ['Néo-Zélandais', 'Californien', 'Fauve de Bourgogne', 'Géant des Flandres'],
    'Abeilles': ['Abeille noire', 'Buckfast', 'Carnica', 'Caucasienne'],
    'Poissons': ['Truite arc-en-ciel', 'Saumon', 'Carpe', 'Bar', 'Daurade']
  },
  certificationTypes: [
    'Agriculture Biologique', 'Label Rouge', 'AOC/AOP', 'IGP', 
    'Haute Valeur Environnementale', 'Bien-être animal', 'Global GAP',
    'IFS Food', 'BRC Food', 'Œufs de France'
  ],
  equipmentTypes: [
    'Tracteur', 'Moissonneuse', 'Épandeur', 'Charrue', 'Système de traite',
    'Tank à lait', 'Système d\'alimentation automatique', 'Ventilation',
    'Générateur', 'Système d\'irrigation', 'Matériel de récolte'
  ],
  defaultSurfaceUnit: 'hectares',
  defaultCoordinateFormat: 'decimal'
};

const defaultDisplayPreferences: DisplayPreferences = {
  clients: "table",
  pets: "cards",
  consultations: "table",
  appointments: "calendar",
  visits: "cards",
  prescriptions: "table",
  farms: "cards",
  vaccinations: "table",
  antiparasitics: "table",
  history: "cards",
};

const defaultScheduleSettings: ScheduleSettings = {
  openingTime: '08:00',
  closingTime: '18:00',
  slotDuration: 30,
  lunchBreakStart: '12:00',
  lunchBreakEnd: '14:00',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
};

const defaultVeterinarians: Veterinarian[] = [];

const defaultSettings: ClinicSettings = {
  clinicName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  footerText: '',
  logo: '',
  currency: 'MAD',
  species: '',
  showClinicInfo: true,
  showVetsInfo: true,
  veterinarians: defaultVeterinarians,
  farmManagement: defaultFarmManagementSettings,
  displayPreferences: defaultDisplayPreferences,
  defaultConsultationPrice: getCatalogDefaultPrices().consultation ?? 150,
  servicePrices: getCatalogDefaultPrices(),
  scheduleSettings: defaultScheduleSettings
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        // Fusionner avec les paramètres par défaut pour s'assurer que toutes les propriétés sont présentes
        const catalogPrices = getCatalogDefaultPrices();
        const mergedServicePrices = {
          ...catalogPrices,
          ...(parsedSettings.servicePrices || {}),
        };
        // Migrate legacy single consultation price into servicePrices
        if (
          typeof parsedSettings.defaultConsultationPrice === 'number' &&
          parsedSettings.defaultConsultationPrice > 0 &&
          parsedSettings.servicePrices?.consultation == null
        ) {
          mergedServicePrices.consultation = parsedSettings.defaultConsultationPrice;
        }

        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          // Prefer DB vets; strip known mock names from legacy local settings
          veterinarians: (() => {
            const list = parsedSettings.veterinarians || [];
            const mockNames = ['Dr. Jean Dupont', 'Dr. Marie Martin', 'Pr. Ahmed El Alaoui', 'Dr. Martin', 'Dr. Dupont'];
            const cleaned = list.filter((vet: any) => !mockNames.includes(vet.name));
            return cleaned;
          })(),
          farmManagement: {
            ...defaultFarmManagementSettings,
            ...parsedSettings.farmManagement
          },
          displayPreferences: (() => {
            const prev = parsedSettings.displayPreferences || {};
            const merged = {
              ...defaultDisplayPreferences,
              ...prev,
            };
            // Migration anciennes prefs : RDV → Calendrier par défaut si Visites/Historiques absents
            if (prev.visits == null && prev.history == null && prev.appointments === "table") {
              merged.appointments = "calendar";
            }
            return merged;
          })(),
          scheduleSettings: {
            ...defaultScheduleSettings,
            ...parsedSettings.scheduleSettings
          },
          servicePrices: mergedServicePrices,
          defaultConsultationPrice:
            mergedServicePrices.consultation ??
            parsedSettings.defaultConsultationPrice ??
            defaultSettings.defaultConsultationPrice,
        };
        // Settings loaded successfully
        setSettings(mergedSettings);
        // Sauvegarder la version mise à jour pour éviter les problèmes futurs
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        setSettings(defaultSettings);
      }
    } else {
      // Si aucun paramètre n'existe, sauvegarder les paramètres par défaut
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }, []);

  const updateSettings = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
//!/ note: AD - not important
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
