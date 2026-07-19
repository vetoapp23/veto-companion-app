// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

export interface Client {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  idNumber?: string; // N° pièce d'identité
  notes?: string;
  pets: Pet[];
  lastVisit: string;
  totalVisits: number;
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female'; // Sexe de l'animal
  birthDate?: string; // Date de naissance au format YYYY-MM-DD
  weight?: string;
  color?: string;
  microchip?: string;
  medicalNotes?: string;
  photo?: string;
  additionalPhotos?: string[]; // Photos supplémentaires de l'animal
  ownerId: number;
  owner: string;
  status: 'healthy' | 'treatment' | 'urgent';
  lastVisit?: string;
  nextAppointment?: string;
  vaccinations?: string[];
  // Propriétés du pedigree
  hasPedigree?: boolean;
  officialName?: string;
  pedigreeNumber?: string;
  breeder?: string;
  fatherName?: string;
  fatherPedigree?: string;
  fatherBreed?: string;
  fatherTitles?: string;
  motherName?: string;
  motherPedigree?: string;
  motherBreed?: string;
  motherTitles?: string;
  pedigreePhoto?: string;
}

export interface Consultation {
  purpose: string;
  veterinarian: ReactNode;
  id: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  weight?: string;
  temperature?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  followUp?: string;
  cost?: string;
  notes?: string;
  photos: string[]; // URLs ou DataURI des photos associées à la consultation
  createdAt: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  time: string;
  type: 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire';
  duration: number;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reminderSent: boolean;
  createdAt: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  clientId: number;
  clientName: string;
  petId: number;
  petName: string;
  date: string;
  prescribedBy: string;
  diagnosis: string;
  medications: PrescriptionMedication[];
  instructions: string;
  duration: string;
  followUpDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  createdAt: string;
}

export interface PrescriptionMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  unit: string;
  refills?: number;
  cost?: number;
  // Informations de stock
  stockItemId?: number; // ID de l'item en stock si disponible
  isInStock?: boolean; // Si le médicament est disponible en stock
  stockQuantity?: number; // Quantité disponible en stock
  stockDeducted?: boolean; // Si la quantité a été déduite du stock
}

export interface FarmAnimalDetail {
  category: string;
  maleCount: number;
  femaleCount: number;
  breeds: string[];
  ageGroups?: string[];
}

export interface Farm {
  id: number;
  name: string;
  owner: string;
  ownerIdNumber?: string; // N° pièce d'identité du propriétaire
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  types: string[]; // Permet plusieurs types d'élevage
  totalAnimals: number;
  animalDetails: FarmAnimalDetail[];
  lastVisit: string;
  status: 'active' | 'attention' | 'urgent';
  veterinarian: string;
  notes?: string;
  registrationNumber?: string; // Numéro d'immatriculation de l'exploitation
  surfaceArea?: number; // Surface en hectares
  buildingDetails?: string; // Détails des bâtiments
  equipmentDetails?: string; // Équipements disponibles
  certifications?: string[]; // Certifications (bio, etc.)
  insuranceDetails?: string; // Détails assurance
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  photos?: {
    id: string;
    url: string;
    description: string;
    category: 'cheptel' | 'batiments' | 'equipements' | 'general';
    uploadedAt: string;
  }[];
  createdAt: string;
}



export interface FarmIntervention {
  id: number;
  date: string;
  farmId: number;
  farmName: string;
  type: 'vaccination' | 'controle' | 'urgence' | 'chirurgie' | 'prevention' | 'consultation';
  animals: string;
  veterinarian: string;
  description: string;
  status: 'completed' | 'ongoing' | 'scheduled' | 'cancelled';
  followUp?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface Vaccination {
  id: number;
  petId: number;
  petName: string;
  clientId: number;
  clientName: string;
  vaccineName: string;
  vaccineType: 'core' | 'non-core' | 'rabies' | 'custom';
  vaccinationCategory: 'new' | 'reminder'; // Nouveau champ pour distinguer
  dateGiven: string;
  nextDueDate: string; // Date de rappel choisie (modifiable par le vétérinaire)
  calculatedDueDate?: string; // Date suggérée par le protocole (non modifiable)
  batchNumber?: string;
  veterinarian: string;
  notes?: string;
  status: 'completed' | 'overdue' | 'scheduled' | 'missed';
  cost?: string;
  location?: 'left_shoulder' | 'right_shoulder' | 'left_hip' | 'right_hip' | 'subcutaneous';
  adverseReactions?: string;
  manufacturer?: string;
  expirationDate?: string;
  createdAt: string;
  // Nouveaux champs pour les rappels
  originalVaccinationId?: number; // ID du vaccin original (pour les rappels)
  reminderAppointmentId?: number; // ID du rendez-vous de rappel
  isReminder?: boolean; // Indique si c'est un rappel
  reminderHistory?: VaccinationReminder[]; // Historique des rappels
  // Informations de stock
  stockItemId?: number; // ID de l'item en stock si disponible
  isInStock?: boolean; // Si le vaccin est disponible en stock
  stockQuantity?: number; // Quantité disponible en stock
  stockDeducted?: boolean; // Si la quantité a été déduite du stock
}

export interface VaccinationReminder {
  id: number;
  vaccinationId: number;
  appointmentId: number;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface VaccinationProtocol {
  id: number;
  name: string;
  species: string;
  vaccineType: 'core' | 'non-core' | 'rabies' | 'custom';
  description: string;
  manufacturer?: string;
  intervals: Array<{ offsetDays: number; label: string }>;
  ageRequirement?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Antiparasitic {
  id: number;
  petId: number;
  petName: string;
  clientId: number;
  clientName: string;
  productName: string;
  productType: 'external' | 'internal' | 'combined' | 'heartworm' | 'flea_tick' | 'worming';
  targetParasites: string; // ex: "Puces, Tiques, Poux"
  dateGiven: string;
  nextDueDate: string;
  dosage: string;
  administrationRoute: 'oral' | 'topical' | 'injection' | 'collar';
  veterinarian: string;
  notes?: string;
  batchNumber?: string;
  manufacturer?: string;
  weight?: string; // poids de l'animal au moment du traitement
  status: 'completed' | 'overdue' | 'scheduled' | 'missed';
  cost?: string;
  sideEffects?: string;
  createdAt: string;
  // Informations de stock
  stockItemId?: number; // ID de l'item en stock si disponible
  isInStock?: boolean; // Si l'antiparasitaire est disponible en stock
  stockQuantity?: number; // Quantité disponible en stock
  stockDeducted?: boolean; // Si la quantité a été déduite du stock
}

export interface AntiparasiticProtocol {
  id: number;
  name: string;
  species: string;
  productType: 'external' | 'internal' | 'combined' | 'heartworm' | 'flea_tick' | 'worming';
  targetParasites: string;
  description: string;
  manufacturer?: string;
  intervals: Array<{ offsetDays: number; label: string }>;
  weightRange?: string; // ex: "2-8kg"
  ageRequirement?: string;
  seasonalTreatment?: boolean; // pour certains traitements saisonniers
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientContextType {
  clients: Client[];
  pets: Pet[];
  consultations: Consultation[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  farms: Farm[];

  farmInterventions: FarmIntervention[];
  vaccinations: Vaccination[];
  vaccinationProtocols: VaccinationProtocol[];
  antiparasitics: Antiparasitic[];
  antiparasiticProtocols: AntiparasiticProtocol[];
  stockItems: StockItem[];
  stockAlerts: StockAlert[];
  stockMovements: StockMovement[];
  accountingEntries: AccountingEntry[];
  addClient: (clientData: Omit<Client, 'id' | 'pets' | 'lastVisit' | 'totalVisits'>) => void;
  addPet: (petData: Omit<Pet, 'id'>) => void;
  addConsultation: (consultationData: Omit<Consultation, 'id' | 'createdAt'>) => void;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  addPrescription: (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => void;
  addFarm: (farmData: Omit<Farm, 'id' | 'createdAt'>) => void;

  addFarmIntervention: (interventionData: Omit<FarmIntervention, 'id' | 'createdAt'>) => void;
  addVaccination: (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => number; // returns new vaccination id
  addVaccinationProtocol: (protocolData: Omit<VaccinationProtocol, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addAntiparasitic: (antiparasiticData: Omit<Antiparasitic, 'id' | 'createdAt'>) => void;
  addAntiparasiticProtocol: (protocolData: Omit<AntiparasiticProtocol, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addStockItem: (itemData: Omit<StockItem, 'id' | 'lastUpdated' | 'totalValue'>) => StockItem;
  addStockMovement: (movementData: Omit<StockMovement, 'id'>) => StockMovement;
  addAccountingEntry: (entryData: Omit<AccountingEntry, 'id' | 'createdAt'>) => AccountingEntry;
  updateAccountingEntry: (id: number, updates: Partial<AccountingEntry>) => void;
  deleteAccountingEntry: (id: number) => void;
  calculateAutomaticRevenue: (startDate: string, endDate: string) => { totalRevenue: number; revenueBreakdown: any };
  calculateAutomaticExpenses: (startDate: string, endDate: string) => { totalExpenses: number; expenseBreakdown: any };
  generateAccountingSummary: (period: string, startDate: string, endDate: string) => AccountingSummary;
  updateClient: (id: number, clientData: Partial<Client>) => void;
  updatePet: (id: number, petData: Partial<Pet>) => void;
  updateConsultation: (id: number, consultationData: Partial<Consultation>) => void;
  updateAppointment: (id: number, appointmentData: Partial<Appointment>) => void;
  updatePrescription: (id: number, prescriptionData: Partial<Prescription>) => void;
  updateFarm: (id: number, farmData: Partial<Farm>) => void;

  updateFarmIntervention: (id: number, interventionData: Partial<FarmIntervention>) => void;
  updateVaccination: (id: number, vaccinationData: Partial<Vaccination>) => void;
  updateVaccinationProtocol: (id: number, protocolData: Partial<VaccinationProtocol>) => void;
  updateAntiparasitic: (id: number, antiparasiticData: Partial<Antiparasitic>) => void;
  updateAntiparasiticProtocol: (id: number, protocolData: Partial<AntiparasiticProtocol>) => void;
  updateStockItem: (id: number, updates: Partial<StockItem>) => StockItem | undefined;
  deletePet: (id: number) => void;
  deleteConsultation: (id: number) => void;
  deleteAppointment: (id: number) => void;
  deletePrescription: (id: number) => void;
  deleteFarm: (id: number) => void;

  deleteFarmIntervention: (id: number) => void;
  deleteVaccination: (id: number) => void;
  deleteVaccinationProtocol: (id: number) => void;
  deleteAntiparasitic: (id: number) => void;
  deleteAntiparasiticProtocol: (id: number) => void;
  deleteStockItem: (id: number) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (data: { clients: Client[], pets: Pet[], consultations: Consultation[], appointments: Appointment[], prescriptions: Prescription[], farms: Farm[], farmInterventions: FarmIntervention[] }) => void;
  getClientById: (id: number) => Client | undefined;
  getPetById: (id: number) => Pet | undefined;
  getConsultationById: (id: number) => Consultation | undefined;
  getAppointmentById: (id: number) => Appointment | undefined;
  getPrescriptionById: (id: number) => Prescription | undefined;
  getFarmById: (id: number) => Farm | undefined;

  getFarmInterventionById: (id: number) => FarmIntervention | undefined;
  getVaccinationById: (id: number) => Vaccination | undefined;
  getVaccinationProtocolById: (id: number) => VaccinationProtocol | undefined;
  getVaccinationProtocolsBySpecies: (species: string) => VaccinationProtocol[];
  getActiveVaccinationProtocols: () => VaccinationProtocol[];
  getAntiparasiticById: (id: number) => Antiparasitic | undefined;
  getAntiparasiticsByPetId: (petId: number) => Antiparasitic[];
  getAntiparasiticsByClientId: (clientId: number) => Antiparasitic[];
  getOverdueAntiparasitics: () => Antiparasitic[];
  getUpcomingAntiparasitics: (days?: number) => Antiparasitic[];
  getAntiparasiticsByStatus: (status: string) => Antiparasitic[];
  getAntiparasiticProtocolById: (id: number) => AntiparasiticProtocol | undefined;
  getAntiparasiticProtocolsBySpecies: (species: string) => AntiparasiticProtocol[];
  getActiveAntiparasiticProtocols: () => AntiparasiticProtocol[];
  getPetsByOwnerId: (ownerId: number) => Pet[];
  getConsultationsByPetId: (petId: number) => Consultation[];
  getConsultationsByClientId: (clientId: number) => Consultation[];
  getAppointmentsByClientId: (clientId: number) => Appointment[];
  getAppointmentsByPetId: (petId: number) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
  getOverdueAppointments: () => Appointment[];
  getPrescriptionsByPetId: (petId: number) => Prescription[];
  getPrescriptionsByConsultationId: (consultationId: number) => Prescription[];
  getActivePrescriptions: () => Prescription[];

  getFarmInterventionsByFarmId: (farmId: number) => FarmIntervention[];
  getUpcomingFarmInterventions: () => FarmIntervention[];
  getFarmsByStatus: (status: Farm['status']) => Farm[];
  getVaccinationsByPetId: (petId: number) => Vaccination[];
  getVaccinationsByClientId: (clientId: number) => Vaccination[];
  getOverdueVaccinations: () => Vaccination[];
  getUpcomingVaccinations: () => Vaccination[];
  getVaccinationsByStatus: (status: Vaccination['status']) => Vaccination[];
  createVaccinationReminder: (originalVaccinationId: number, appointmentDate: string, appointmentTime: string) => any;
  completeVaccinationReminder: (vaccinationId: number, appointmentId: number, newNextDueDate?: string) => any;
  confirmVaccinationReminder: (vaccinationId: number, confirmationData: {
    datePerformed: string;
    veterinarian: string;
    batchNumber?: string;
    notes?: string;
    newNextDueDate?: string;
  }) => any;
  updateVaccinationStatuses: () => Vaccination[];
  calculateDueDateFromProtocol: (vaccineName: string, species: string, dateGiven: string) => string | null;
  updateClientStats: (clientId: number) => { totalVisits: number; lastVisit: string } | undefined;
  getStockAlerts: () => StockAlert[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const initialClients: Client[] = [];

const initialPets: Pet[] = [];

const initialConsultations: Consultation[] = [];

const initialAppointments: Appointment[] = [];

const initialPrescriptions: Prescription[] = [];

const initialFarms: Farm[] = [];



const initialFarmInterventions: FarmIntervention[] = [];

const initialVaccinations: Vaccination[] = [];

// Données initiales des antiparasites avec quelques exemples pour le test
const initialAntiparasitics: Antiparasitic[] = [];

// Protocoles antiparasitaires réalistes basés sur la pratique vétérinaire
const initialAntiparasiticProtocols: AntiparasiticProtocol[] = [];

// Données initiales pour la gestion de stock
const initialStockItems: StockItem[] = [];

const initialVaccinationProtocols: VaccinationProtocol[] = [];

const LEGACY_LOCAL_STORAGE_KEYS = [
  'vetpro-clients',
  'vetpro-pets',
  'vetpro-consultations',
  'vetpro-appointments',
  'vetpro-prescriptions',
  'vetpro-farms',
  'vetpro-farmInterventions',
  'vetpro-vaccinations',
  'vetpro-vaccinationProtocols',
  'vetpro-antiparasitics',
  'vetpro-antiparasiticProtocols',
  'vetpro-stockItems',
  'vetpro-stockAlerts',
  'vetpro-stockMovements',
  'vetpro-accountingEntries',
  'vetpro-veterinarians',
] as const;

function clearLegacyLocalStorageData() {
  for (const key of LEGACY_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export function ClientProvider({ children }: { children: ReactNode }) {
  // Legacy local context — kept for old modals only. No mock seeds; clinical data lives in Supabase.
  const loadDataFromStorage = () => {
    clearLegacyLocalStorageData();
    return {
      clients: [] as Client[],
      pets: [] as Pet[],
      consultations: [] as Consultation[],
      appointments: [] as Appointment[],
      prescriptions: [] as Prescription[],
      farms: [] as Farm[],
      farmInterventions: [] as FarmIntervention[],
      vaccinations: [] as Vaccination[],
      vaccinationProtocols: [] as VaccinationProtocol[],
      antiparasitics: [] as Antiparasitic[],
      antiparasiticProtocols: [] as AntiparasiticProtocol[],
      stockItems: [] as StockItem[],
      stockAlerts: [] as StockAlert[],
      stockMovements: [] as StockMovement[],
      accountingEntries: [] as AccountingEntry[],
    };
  };

  // Fonction pour sauvegarder les données dans localStorage
  const saveDataToStorage = (
    clientsData: Client[], 
    petsData: Pet[], 
    consultationsData: Consultation[], 
    appointmentsData: Appointment[] = appointments, 
    prescriptionsData: Prescription[] = prescriptions,
    farmsData: Farm[] = farms,

    farmInterventionsData: FarmIntervention[] = farmInterventions,
    vaccinationsData: Vaccination[] = vaccinations,
    vaccinationProtocolsData: VaccinationProtocol[] = vaccinationProtocols,
    antiparasiticsData: Antiparasitic[] = antiparasitics,
    antiparasiticProtocolsData: AntiparasiticProtocol[] = antiparasiticProtocols,
    stockItemsData: StockItem[] = stockItems,
    stockAlertsData: StockAlert[] = stockAlerts,
    stockMovementsData: StockMovement[] = stockMovements,
    accountingEntriesData: AccountingEntry[] = accountingEntries,
  ) => {
    // No-op: clinical data must persist via Supabase, not localStorage.
    void clientsData;
    void petsData;
    void consultationsData;
    void appointmentsData;
    void prescriptionsData;
    void farmsData;
    void farmInterventionsData;
    void vaccinationsData;
    void vaccinationProtocolsData;
    void antiparasiticsData;
    void antiparasiticProtocolsData;
    void stockItemsData;
    void stockAlertsData;
    void stockMovementsData;
    void accountingEntriesData;
  };

  const initialData = loadDataFromStorage();
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [pets, setPets] = useState<Pet[]>(initialData.pets);
  const [consultations, setConsultations] = useState<Consultation[]>(initialData.consultations);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialData.prescriptions);
  const [farms, setFarms] = useState<Farm[]>(initialData.farms);

  const [farmInterventions, setFarmInterventions] = useState<FarmIntervention[]>(initialData.farmInterventions);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialData.vaccinations);
  const [vaccinationProtocols, setVaccinationProtocols] = useState<VaccinationProtocol[]>(initialData.vaccinationProtocols);
  const [antiparasitics, setAntiparasitics] = useState<Antiparasitic[]>(initialData.antiparasitics);
  const [antiparasiticProtocols, setAntiparasiticProtocols] = useState<AntiparasiticProtocol[]>(initialData.antiparasiticProtocols);
  
  // États pour la gestion de stock
  const [stockItems, setStockItems] = useState<StockItem[]>(initialData.stockItems || []);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(initialData.stockAlerts || []);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialData.stockMovements || []);
  
  // États pour la gestion comptable
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>(initialData.accountingEntries || []);
  
  // Initialize antiparasitics state with stored data

  // Générer automatiquement les entrées récurrentes pour la période actuelle
  useEffect(() => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Générer les entrées pour le mois actuel
  }, []);

  // Générer automatiquement les entrées comptables quand les données changent
  useEffect(() => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Recalculer les entrées comptables automatiques
    calculateAutomaticRevenue(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
    calculateAutomaticExpenses(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }, [consultations, vaccinations, antiparasitics, prescriptions, stockMovements]); // Se déclenche quand les données changent

  // Debug: Monitor antiparasitics state changes
  useEffect(() => {
    // Antiparasitics state updated, save to localStorage
  }, [antiparasitics]);

  // Initialiser les statistiques de tous les clients existants
  useEffect(() => {
    if (clients.length > 0 && consultations.length >= 0 && vaccinations.length >= 0 && antiparasitics.length >= 0 && appointments.length >= 0) {
      clients.forEach(client => {
        updateClientStats(client.id);
      });
    }
  }, [clients.length, consultations.length, vaccinations.length, antiparasitics.length, appointments.length]);

  const addClient = (clientData: Omit<Client, 'id' | 'pets' | 'lastVisit' | 'totalVisits'>) => {
    const newClient: Client = {
      ...clientData,
      name: `${clientData.firstName} ${clientData.lastName}`,
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      pets: [],
      lastVisit: new Date().toISOString().split('T')[0],
      totalVisits: 0
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveDataToStorage(updatedClients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const addPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: Math.max(...pets.map(p => p.id), 0) + 1,
      status: petData.status || 'healthy',
      lastVisit: new Date().toISOString().split('T')[0]
    };
    
    // Add to pets array
    const updatedPets = [...pets, newPet];
    setPets(updatedPets);
    
    // Update client's pets array with the complete pet object
    const updatedClients = clients.map(client => 
      client.id === petData.ownerId 
        ? { 
            ...client, 
            pets: [...client.pets, {
              id: newPet.id,
              name: newPet.name,
              type: newPet.type,
              breed: newPet.breed,
              birthDate: newPet.birthDate,
              weight: newPet.weight,
              color: newPet.color,
              microchip: newPet.microchip,
              medicalNotes: newPet.medicalNotes,
              photo: newPet.photo,
              ownerId: newPet.ownerId,
              owner: newPet.owner,
              status: newPet.status,
              lastVisit: newPet.lastVisit,
              nextAppointment: newPet.nextAppointment,
              vaccinations: newPet.vaccinations
            }]
          }
        : client
    );
    
    setClients(updatedClients);
    saveDataToStorage(updatedClients, updatedPets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const updateClient = (id: number, clientData: Partial<Client>) => {
    const updatedClients = clients.map(client => 
      client.id === id 
        ? { ...client, ...clientData, name: clientData.firstName && clientData.lastName ? `${clientData.firstName} ${clientData.lastName}` : client.name }
        : client
    );
    setClients(updatedClients);
    saveDataToStorage(updatedClients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations);
  };

  const updatePet = (id: number, petData: Partial<Pet>) => {
    const updatedPet = { ...pets.find(p => p.id === id), ...petData };
    
    // Update pets array
    const updatedPets = pets.map(pet => 
      pet.id === id ? { ...pet, ...petData } : pet
    );
    setPets(updatedPets);
    
    // Update pet in client's pets array
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.map(pet => 
        pet.id === id ? { ...pet, ...petData } : pet
      )
    }));
    setClients(updatedClients);
    
    saveDataToStorage(updatedClients, updatedPets, consultations);
  };

  // Fonction utilitaire pour mettre à jour les statistiques du client
  const updateClientStats = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Récupérer toutes les activités médicales du client
    const clientConsultations = consultations.filter(c => c.clientId === clientId);
    const clientVaccinations = vaccinations.filter(v => v.clientId === clientId);
    const clientAntiparasitics = antiparasitics.filter(a => a.clientId === clientId);
    const clientAppointments = appointments.filter(a => a.clientId === clientId && a.status === 'completed');

    // Calculer le total des visites (consultations + vaccinations + antiparasites + rendez-vous complétés)
    const totalVisits = clientConsultations.length + clientVaccinations.length + clientAntiparasitics.length + clientAppointments.length;

    // Trouver la date de la dernière activité
    const allActivities = [
      ...clientConsultations.map(c => ({ date: c.date, type: 'consultation' })),
      ...clientVaccinations.map(v => ({ date: v.dateGiven, type: 'vaccination' })),
      ...clientAntiparasitics.map(a => ({ date: a.dateGiven, type: 'antiparasitic' })),
      ...clientAppointments.map(a => ({ date: a.date, type: 'appointment' }))
    ];

    const lastVisit = allActivities.length > 0 
      ? allActivities.reduce((latest, current) => 
          new Date(current.date) > new Date(latest.date) ? current : latest
        ).date
      : client.lastVisit;

    // Mettre à jour le client
    const updatedClients = clients.map(c => 
      c.id === clientId 
        ? { ...c, totalVisits, lastVisit }
        : c
    );
    setClients(updatedClients);
    
    return { totalVisits, lastVisit };
  };

  // Fonctions de gestion de stock
  const addStockItem = (itemData: Omit<StockItem, 'id' | 'lastUpdated' | 'totalValue'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: Math.max(...stockItems.map(item => item.id), 0) + 1,
      lastUpdated: new Date().toISOString(),
      totalValue: itemData.currentStock * itemData.purchasePrice
    };
    
    const updatedItems = [...stockItems, newItem];
    setStockItems(updatedItems);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, updatedItems, stockAlerts, stockMovements);
    
    return newItem;
  };

  const updateStockItem = (id: number, updates: Partial<StockItem>) => {
    const updatedItems = stockItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        // Recalculer la valeur totale si le stock ou le prix d'achat a changé
        if (updates.currentStock !== undefined || updates.purchasePrice !== undefined) {
          updatedItem.totalValue = updatedItem.currentStock * updatedItem.purchasePrice;
        }
        updatedItem.lastUpdated = new Date().toISOString();
        return updatedItem;
      }
      return item;
    });
    
    setStockItems(updatedItems);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, updatedItems, stockAlerts, stockMovements);
    
    return updatedItems.find(item => item.id === id);
  };

  const deleteStockItem = (id: number) => {
    const updatedItems = stockItems.filter(item => item.id !== id);
    setStockItems(updatedItems);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, updatedItems, stockAlerts, stockMovements);
  };

  const addStockMovement = (movementData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: Math.max(...stockMovements.map(m => m.id), 0) + 1
    };
    
    const updatedMovements = [...stockMovements, newMovement];
    setStockMovements(updatedMovements);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, updatedMovements);
    
    return newMovement;
  };

  const getStockAlerts = () => {
    const alerts: StockAlert[] = [];
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    stockItems.forEach(item => {
      // Alerte stock bas
      if (item.currentStock <= item.minimumStock) {
        alerts.push({
          id: alerts.length + 1,
          itemId: item.id,
          itemName: item.name,
          type: 'low_stock',
          message: `Stock bas: ${item.currentStock} ${item.unit} restant(s)`,
          severity: item.currentStock === 0 ? 'critical' : 'high',
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
      
      // Alerte expiration
      if (item.expirationDate) {
        if (item.expirationDate < today) {
          alerts.push({
            id: alerts.length + 1,
            itemId: item.id,
            itemName: item.name,
            type: 'expired',
            message: `Expiré le ${item.expirationDate}`,
            severity: 'critical',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        } else if (item.expirationDate <= thirtyDaysFromNow) {
          alerts.push({
            id: alerts.length + 1,
            itemId: item.id,
            itemName: item.name,
            type: 'expiring_soon',
            message: `Expire le ${item.expirationDate}`,
            severity: 'medium',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      }
    });
    
    return alerts;
  };

  const addConsultation = (consultationData: Omit<Consultation, 'id' | 'createdAt'>) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: Math.max(...consultations.map(c => c.id), 0) + 1,
      createdAt: new Date().toISOString(),
      photos: consultationData.photos || []
    };
    
    const updatedConsultations = [...consultations, newConsultation];
    setConsultations(updatedConsultations);
    
    // Mettre à jour la dernière visite de l'animal
    const updatedPets = pets.map(pet => 
      pet.id === consultationData.petId 
        ? { ...pet, lastVisit: consultationData.date }
        : pet
    );
    setPets(updatedPets);
    
    // Mettre à jour les clients avec les nouveaux animaux
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.map(pet => 
        pet.id === consultationData.petId 
          ? { ...pet, lastVisit: consultationData.date }
          : pet
      )
    }));
    setClients(updatedClients);
    
    // Mettre à jour les statistiques du client
    updateClientStats(consultationData.clientId);
    
    saveDataToStorage(updatedClients, updatedPets, updatedConsultations);
  };

  const deletePet = (id: number) => {
    const petToDelete = pets.find(p => p.id === id);
    if (!petToDelete) return;
    
    // Remove from pets array
    const updatedPets = pets.filter(pet => pet.id !== id);
    setPets(updatedPets);
    
    // Remove from client's pets array
    const updatedClients = clients.map(client => ({
      ...client,
      pets: client.pets.filter(pet => pet.id !== id)
    }));
    setClients(updatedClients);
    
    saveDataToStorage(updatedClients, updatedPets, consultations);
  };

  const resetData = () => {
    // Performing complete data reset
    
    // Effacer toutes les données localStorage
    localStorage.removeItem('vetpro-clients');
    localStorage.removeItem('vetpro-pets');
    localStorage.removeItem('vetpro-consultations');
    localStorage.removeItem('vetpro-appointments');
    localStorage.removeItem('vetpro-prescriptions');
    localStorage.removeItem('vetpro-farms');
    localStorage.removeItem('vetpro-farmInterventions');
    localStorage.removeItem('vetpro-vaccinations');
    localStorage.removeItem('vetpro-vaccinationProtocols');
    localStorage.removeItem('vetpro-antiparasitics');
    localStorage.removeItem('vetpro-antiparasiticProtocols');
    
    const synchronizedClients = initialClients.map(client => ({
      ...client,
      pets: initialPets.filter(pet => pet.ownerId === client.id)
    }));
    
    setClients(synchronizedClients);
    setPets(initialPets);
    setConsultations(initialConsultations);
    setAppointments(initialAppointments);
    setPrescriptions(initialPrescriptions);
    setFarms(initialFarms);
    // setLivestock removed
    setFarmInterventions(initialFarmInterventions);
    setVaccinations(initialVaccinations);
    setVaccinationProtocols(initialVaccinationProtocols);
    setAntiparasitics(initialAntiparasitics);
    setAntiparasiticProtocols(initialAntiparasiticProtocols);
    
    // Forcer la sauvegarde
    saveDataToStorage(synchronizedClients, initialPets, initialConsultations, initialAppointments, initialPrescriptions, initialFarms, initialFarmInterventions, initialVaccinations, initialVaccinationProtocols, initialAntiparasitics, initialAntiparasiticProtocols);
    
    // Reset completed with initial antiparasitics data
  };

  const exportData = () => {
    const data = { clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vetpro-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: { clients: Client[], pets: Pet[], consultations: Consultation[], appointments?: Appointment[], prescriptions?: Prescription[], farms?: Farm[], farmInterventions?: FarmIntervention[], vaccinations?: Vaccination[], vaccinationProtocols?: VaccinationProtocol[], antiparasitics?: Antiparasitic[], antiparasiticProtocols?: AntiparasiticProtocol[] }) => {
    const synchronizedClients = data.clients.map(client => ({
      ...client,
      pets: data.pets.filter(pet => pet.ownerId === client.id)
    }));
    
    setClients(synchronizedClients);
    setPets(data.pets);
    setConsultations(data.consultations || []);
    setAppointments(data.appointments || []);
    setPrescriptions(data.prescriptions || []);
    setFarms(data.farms || []);
    // setLivestock removed
    setFarmInterventions(data.farmInterventions || []);
    setVaccinations(data.vaccinations || []);
    setVaccinationProtocols(data.vaccinationProtocols || []);
    setAntiparasitics(data.antiparasitics || []);
    setAntiparasiticProtocols(data.antiparasiticProtocols || []);
    saveDataToStorage(synchronizedClients, data.pets, data.consultations || [], data.appointments || [], data.prescriptions || [], data.farms || [], data.farmInterventions || [], data.vaccinations || [], data.vaccinationProtocols || [], data.antiparasitics || [], data.antiparasiticProtocols || []);
  };

  const updateConsultation = (id: number, consultationData: Partial<Consultation>) => {
    const updatedConsultations = consultations.map(consultation => 
      consultation.id === id ? { ...consultation, ...consultationData } : consultation
    );
    setConsultations(updatedConsultations);
    saveDataToStorage(clients, pets, updatedConsultations);
  };

  const deleteConsultation = (id: number) => {
    const updatedConsultations = consultations.filter(consultation => consultation.id !== id);
    setConsultations(updatedConsultations);
    saveDataToStorage(clients, pets, updatedConsultations);
  };

  // CRUD Antiparasites
  // Fonction pour vérifier et gérer le stock des antiparasitaires
  const checkAndManageAntiparasiticStock = (antiparasiticData: Omit<Antiparasitic, 'id' | 'createdAt'>) => {
    // Chercher l'antiparasitaire dans le stock (catégorie medication)
    const stockItem = stockItems.find(item => 
      item.name.toLowerCase() === antiparasiticData.productName.toLowerCase() && 
      item.category === 'medication' &&
      item.isActive
    );

    if (stockItem && stockItem.currentStock >= 1) {
      // L'antiparasitaire est en stock et disponible
      return {
        ...antiparasiticData,
        stockItemId: stockItem.id,
        isInStock: true,
        stockQuantity: stockItem.currentStock,
        stockDeducted: true
      };
    } else if (stockItem && stockItem.currentStock > 0) {
      // L'antiparasitaire est en stock mais quantité insuffisante
      return {
        ...antiparasiticData,
        stockItemId: stockItem.id,
        isInStock: true,
        stockQuantity: stockItem.currentStock,
        stockDeducted: false // Pas de déduction car quantité insuffisante
      };
    } else {
      // L'antiparasitaire n'est pas en stock
      return {
        ...antiparasiticData,
        isInStock: false,
        stockQuantity: 0,
        stockDeducted: false
      };
    }
  };

  const addAntiparasitic = (antiparasiticData: Omit<Antiparasitic, 'id' | 'createdAt'>) => {
    // Vérifier et gérer le stock pour l'antiparasitaire
    const antiparasiticWithStock = checkAndManageAntiparasiticStock(antiparasiticData);
    
    // Déduire la quantité du stock si l'antiparasitaire est disponible
    let updatedStockItems = [...stockItems];
    
    if (antiparasiticWithStock.stockDeducted && antiparasiticWithStock.stockItemId) {
      const stockItemIndex = updatedStockItems.findIndex(item => item.id === antiparasiticWithStock.stockItemId);
      if (stockItemIndex !== -1) {
        const stockItem = updatedStockItems[stockItemIndex];
        updatedStockItems[stockItemIndex] = {
          ...stockItem,
          currentStock: stockItem.currentStock - 1, // Un antiparasitaire = 1 unité
          lastUpdated: new Date().toISOString()
        };

        // Enregistrer le mouvement de stock en utilisant la fonction du contexte
        const movement = addStockMovement({
          itemId: antiparasiticWithStock.stockItemId,
          itemName: antiparasiticWithStock.productName,
          type: 'out',
          quantity: 1,
          reason: 'Traitement antiparasitaire',
          reference: `Antiparasitaire #${Math.max(0, ...antiparasitics.map(a => a.id)) + 1}`,
          performedBy: antiparasiticWithStock.veterinarian,
          date: new Date().toISOString(),
          notes: `Traitement antiparasitaire de ${antiparasiticWithStock.petName} - ${antiparasiticWithStock.productName}`
        });
        // Stock movement recorded successfully
      }
    }

    const newAntiparasitic: Antiparasitic = {
      ...antiparasiticWithStock,
      id: Math.max(0, ...antiparasitics.map(a => a.id)) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedAntiparasitics = [...antiparasitics, newAntiparasitic];
    setAntiparasitics(updatedAntiparasitics);
    setStockItems(updatedStockItems);
    
    // Antiparasitic added successfully and synced to medical records
    
    // Mettre à jour les statistiques du client
    updateClientStats(antiparasiticData.clientId);
    
    // Sauvegarder toutes les données avec vérification
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, updatedAntiparasitics, antiparasiticProtocols, updatedStockItems, stockAlerts, stockMovements);
    
    // Vérifier la sauvegarde
    const savedData = localStorage.getItem('vetpro-antiparasitics');
    // Data saved to localStorage successfully
  };

  const updateAntiparasitic = (id: number, antiparasiticData: Partial<Antiparasitic>) => {
    const updatedAntiparasitics = antiparasitics.map(antiparasitic => 
      antiparasitic.id === id ? { ...antiparasitic, ...antiparasiticData } : antiparasitic
    );
    setAntiparasitics(updatedAntiparasitics);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, updatedAntiparasitics, antiparasiticProtocols);
  };

  const deleteAntiparasitic = (id: number) => {
    const updatedAntiparasitics = antiparasitics.filter(antiparasitic => antiparasitic.id !== id);
    setAntiparasitics(updatedAntiparasitics);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, updatedAntiparasitics, antiparasiticProtocols);
  };

  // CRUD Protocoles Antiparasitaires
  const addAntiparasiticProtocol = (protocolData: Omit<AntiparasiticProtocol, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProtocol: AntiparasiticProtocol = {
      ...protocolData,
      id: Math.max(0, ...antiparasiticProtocols.map(p => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedProtocols = [...antiparasiticProtocols, newProtocol];
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  const updateAntiparasiticProtocol = (id: number, protocolData: Partial<AntiparasiticProtocol>) => {
    const updatedProtocols = antiparasiticProtocols.map(protocol => 
      protocol.id === id ? { ...protocol, ...protocolData, updatedAt: new Date().toISOString() } : protocol
    );
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  const deleteAntiparasiticProtocol = (id: number) => {
    const updatedProtocols = antiparasiticProtocols.filter(protocol => protocol.id !== id);
    setAntiparasiticProtocols(updatedProtocols);
    localStorage.setItem('vetpro-antiparasiticProtocols', JSON.stringify(updatedProtocols));
  };

  // Getters Antiparasites
  const getAntiparasiticById = (id: number) => antiparasitics.find(a => a.id === id);
  const getAntiparasiticsByPetId = (petId: number) => {
    const result = antiparasitics.filter(a => a.petId === petId);
    // Return antiparasitics for specific pet

    return result;
  };
  const getAntiparasiticsByClientId = (clientId: number) => antiparasitics.filter(a => a.clientId === clientId);
  const getOverdueAntiparasitics = () => {
    const today = new Date().toISOString().split('T')[0];
    return antiparasitics.filter(a => a.nextDueDate && a.nextDueDate < today && a.status !== 'completed');
  };
  const getUpcomingAntiparasitics = (days: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return antiparasitics.filter(a => {
      if (!a.nextDueDate) return false;
      const dueDate = new Date(a.nextDueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  };
  const getAntiparasiticsByStatus = (status: string) => antiparasitics.filter(a => a.status === status);

  // Getters Protocoles Antiparasitaires
  const getAntiparasiticProtocolById = (id: number) => antiparasiticProtocols.find(p => p.id === id);
  const getAntiparasiticProtocolsBySpecies = (species: string) => antiparasiticProtocols.filter(p => p.species === species && p.isActive);
  const getActiveAntiparasiticProtocols = () => antiparasiticProtocols.filter(p => p.isActive);

  const getClientById = (id: number) => clients.find(c => c.id === id);
  const getPetById = (id: number) => pets.find(p => p.id === id);
  const getConsultationById = (id: number) => consultations.find(c => c.id === id);
  const getPetsByOwnerId = (ownerId: number) => pets.filter(p => p.ownerId === ownerId);
  const getConsultationsByPetId = (petId: number) => consultations.filter(c => c.petId === petId);
  const getConsultationsByClientId = (clientId: number) => consultations.filter(c => c.clientId === clientId);

  // Fonctions de gestion des rendez-vous
  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    
    // Mettre à jour les statistiques du client
    updateClientStats(appointmentData.clientId);
    
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const updateAppointment = (id: number, appointmentData: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, ...appointmentData } : appointment
    );
    setAppointments(updatedAppointments);
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const deleteAppointment = (id: number) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== id);
    setAppointments(updatedAppointments);
    saveDataToStorage(clients, pets, consultations, updatedAppointments, prescriptions);
  };

  const getAppointmentById = (id: number) => appointments.find(a => a.id === id);
  const getAppointmentsByClientId = (clientId: number) => appointments.filter(a => a.clientId === clientId);
  const getAppointmentsByPetId = (petId: number) => appointments.filter(a => a.petId === petId);
  const getAppointmentsByDate = (date: string) => appointments.filter(a => a.date === date);
  
  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  const getOverdueAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date < today && a.status === 'scheduled')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  };

  // Fonctions de gestion des prescriptions
  // Fonction pour vérifier et gérer le stock des médicaments
  const checkAndManageStock = (medications: PrescriptionMedication[]) => {
    return medications.map(medication => {
      // Chercher le médicament dans le stock
      const stockItem = stockItems.find(item => 
        item.name.toLowerCase() === medication.name.toLowerCase() && 
        item.category === 'medication' &&
        item.isActive
      );

      if (stockItem && stockItem.currentStock >= medication.quantity) {
        // Le médicament est en stock et disponible en quantité suffisante
        return {
          ...medication,
          stockItemId: stockItem.id,
          isInStock: true,
          stockQuantity: stockItem.currentStock,
          stockDeducted: true
        };
      } else if (stockItem && stockItem.currentStock > 0) {
        // Le médicament est en stock mais quantité insuffisante
        return {
          ...medication,
          stockItemId: stockItem.id,
          isInStock: true,
          stockQuantity: stockItem.currentStock,
          stockDeducted: false // Pas de déduction car quantité insuffisante
        };
      } else {
        // Le médicament n'est pas en stock
        return {
          ...medication,
          isInStock: false,
          stockQuantity: 0,
          stockDeducted: false
        };
      }
    });
  };

  const addPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => {
    // Vérifier et gérer le stock pour chaque médicament
    const medicationsWithStock = checkAndManageStock(prescriptionData.medications);
    
    // Déduire les quantités du stock pour les médicaments disponibles
    let updatedStockItems = [...stockItems];
    
    medicationsWithStock.forEach(medication => {
      if (medication.stockDeducted && medication.stockItemId) {
        const stockItemIndex = updatedStockItems.findIndex(item => item.id === medication.stockItemId);
        if (stockItemIndex !== -1) {
          const stockItem = updatedStockItems[stockItemIndex];
          updatedStockItems[stockItemIndex] = {
            ...stockItem,
            currentStock: stockItem.currentStock - medication.quantity,
            lastUpdated: new Date().toISOString()
          };

          // Enregistrer le mouvement de stock en utilisant la fonction du contexte
          const movement = addStockMovement({
            itemId: medication.stockItemId,
            itemName: medication.name,
            type: 'out',
            quantity: medication.quantity,
            reason: 'Prescription médicale',
            reference: `Prescription #${Math.max(...prescriptions.map(p => p.id), 0) + 1}`,
            performedBy: prescriptionData.prescribedBy,
            date: new Date().toISOString(),
            notes: `Prescription pour ${prescriptionData.petName} - ${prescriptionData.diagnosis}`
          });

        }
      }
    });

    const newPrescription: Prescription = {
      ...prescriptionData,
      medications: medicationsWithStock,
      id: Math.max(...prescriptions.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedPrescriptions = [...prescriptions, newPrescription];
    setPrescriptions(updatedPrescriptions);
    setStockItems(updatedStockItems);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, updatedStockItems, stockAlerts, stockMovements, accountingEntries);
  };

  const updatePrescription = (id: number, prescriptionData: Partial<Prescription>) => {
    const updatedPrescriptions = prescriptions.map(prescription => 
      prescription.id === id ? { ...prescription, ...prescriptionData } : prescription
    );
    setPrescriptions(updatedPrescriptions);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, stockMovements, accountingEntries);
  };

  const deletePrescription = (id: number) => {
    const updatedPrescriptions = prescriptions.filter(prescription => prescription.id !== id);
    setPrescriptions(updatedPrescriptions);
    saveDataToStorage(clients, pets, consultations, appointments, updatedPrescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, stockMovements, accountingEntries);
  };

  const getPrescriptionById = (id: number) => prescriptions.find(p => p.id === id);
  const getPrescriptionsByPetId = (petId: number) => prescriptions.filter(p => p.petId === petId);
  const getPrescriptionsByConsultationId = (consultationId: number) => prescriptions.filter(p => p.consultationId === consultationId);
  
  const getActivePrescriptions = () => {
    return prescriptions
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Fonctions de gestion des exploitations
  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: Math.max(...farms.map(f => f.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedFarms = [...farms, newFarm];
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };

  const updateFarm = (id: number, farmData: Partial<Farm>) => {
    const updatedFarms = farms.map(farm => 
      farm.id === id ? { ...farm, ...farmData } : farm
    );
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };

  const deleteFarm = (id: number) => {
    const updatedFarms = farms.filter(farm => farm.id !== id);
    setFarms(updatedFarms);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, updatedFarms, farmInterventions);
  };



  const addFarmIntervention = (interventionData: Omit<FarmIntervention, 'id' | 'createdAt'>) => {
    const newIntervention: FarmIntervention = {
      ...interventionData,
      id: Math.max(...farmInterventions.map(i => i.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedInterventions = [...farmInterventions, newIntervention];
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const updateFarmIntervention = (id: number, interventionData: Partial<FarmIntervention>) => {
    const updatedInterventions = farmInterventions.map(intervention => 
      intervention.id === id ? { ...intervention, ...interventionData } : intervention
    );
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const deleteFarmIntervention = (id: number) => {
    const updatedInterventions = farmInterventions.filter(intervention => intervention.id !== id);
    setFarmInterventions(updatedInterventions);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, updatedInterventions);
  };

  const getFarmById = (id: number) => farms.find(f => f.id === id);
  const getFarmInterventionById = (id: number) => farmInterventions.find(i => i.id === id);
  const getFarmInterventionsByFarmId = (farmId: number) => farmInterventions.filter(i => i.farmId === farmId);
  
  const getUpcomingFarmInterventions = () => {
    const today = new Date().toISOString().split('T')[0];
    return farmInterventions
      .filter(i => i.date >= today && i.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getFarmsByStatus = (status: Farm['status']) => {
    return farms.filter(f => f.status === status);
  };

  // Fonctions de gestion des vaccinations
  // Fonction pour vérifier et gérer le stock des vaccins
  const checkAndManageVaccineStock = (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    // Chercher le vaccin dans le stock
    const stockItem = stockItems.find(item => 
      item.name.toLowerCase() === vaccinationData.vaccineName.toLowerCase() && 
      item.category === 'vaccine' &&
      item.isActive
    );

    if (stockItem && stockItem.currentStock >= 1) {
      // Le vaccin est en stock et disponible
      return {
        ...vaccinationData,
        stockItemId: stockItem.id,
        isInStock: true,
        stockQuantity: stockItem.currentStock,
        stockDeducted: true
      };
    } else if (stockItem && stockItem.currentStock > 0) {
      // Le vaccin est en stock mais quantité insuffisante
      return {
        ...vaccinationData,
        stockItemId: stockItem.id,
        isInStock: true,
        stockQuantity: stockItem.currentStock,
        stockDeducted: false // Pas de déduction car quantité insuffisante
      };
    } else {
      // Le vaccin n'est pas en stock
      return {
        ...vaccinationData,
        isInStock: false,
        stockQuantity: 0,
        stockDeducted: false
      };
    }
  };

  const addVaccination = (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    // Vérifier et gérer le stock pour le vaccin
    const vaccinationWithStock = checkAndManageVaccineStock(vaccinationData);
    
    // Déduire la quantité du stock si le vaccin est disponible
    let updatedStockItems = [...stockItems];
    
    if (vaccinationWithStock.stockDeducted && vaccinationWithStock.stockItemId) {
      const stockItemIndex = updatedStockItems.findIndex(item => item.id === vaccinationWithStock.stockItemId);
      if (stockItemIndex !== -1) {
        const stockItem = updatedStockItems[stockItemIndex];
        updatedStockItems[stockItemIndex] = {
          ...stockItem,
          currentStock: stockItem.currentStock - 1, // Un vaccin = 1 dose
          lastUpdated: new Date().toISOString()
        };

        // Enregistrer le mouvement de stock en utilisant la fonction du contexte
        const movement = addStockMovement({
          itemId: vaccinationWithStock.stockItemId,
          itemName: vaccinationWithStock.vaccineName,
          type: 'out',
          quantity: 1,
          reason: 'Vaccination',
          reference: `Vaccination #${Math.max(...vaccinations.map(v => v.id), 0) + 1}`,
          performedBy: vaccinationWithStock.veterinarian,
          date: new Date().toISOString(),
          notes: `Vaccination de ${vaccinationWithStock.petName} - ${vaccinationWithStock.vaccineName}`
        });

      }
    }

    const newVaccination: Vaccination = {
      ...vaccinationWithStock,
      id: Math.max(...vaccinations.map(v => v.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    setVaccinations(prevVaccinations => {
      const updatedVaccinations = [...prevVaccinations, newVaccination];
    updateClientStats(vaccinationData.clientId);
      saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, updatedStockItems, stockAlerts, stockMovements);

      return updatedVaccinations;
    });
    
    setStockItems(updatedStockItems);
    return newVaccination.id;
  };

  const updateVaccination = (id: number, vaccinationData: Partial<Vaccination>) => {
    const updatedVaccinations = vaccinations.map(vaccination => 
      vaccination.id === id ? { ...vaccination, ...vaccinationData } : vaccination
    );
    setVaccinations(updatedVaccinations);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
  };

  const deleteVaccination = (id: number) => {

    
    const vaccinationToDelete = vaccinations.find(v => v.id === id);
    if (!vaccinationToDelete) {

      return;
    }
    

    
    let updatedVaccinations = [...vaccinations];
    
    if (vaccinationToDelete.vaccinationCategory === 'new') {
      // Si on supprime une vaccination originale, supprimer aussi tous ses rappels
      const relatedReminders = vaccinations.filter(v => v.originalVaccinationId === id);
      
      // Supprimer la vaccination originale et tous ses rappels
      updatedVaccinations = vaccinations.filter(vaccination => 
        vaccination.id !== id && vaccination.originalVaccinationId !== id
      );
    } else {
      // Si on supprime un rappel, supprimer uniquement ce rappel

      updatedVaccinations = vaccinations.filter(vaccination => vaccination.id !== id);
    }
    

    
    setVaccinations(updatedVaccinations);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
  };

  const getVaccinationById = (id: number) => vaccinations.find(v => v.id === id);
  const getVaccinationsByPetId = (petId: number) => vaccinations.filter(v => v.petId === petId);
  const getVaccinationsByClientId = (clientId: number) => vaccinations.filter(v => v.clientId === clientId);
  
  const getOverdueVaccinations = () => {
    const today = new Date().toISOString().split('T')[0];
    return vaccinations
      .filter(v => v.nextDueDate < today && v.status !== 'completed')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  };

  const getUpcomingVaccinations = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    return vaccinations
      .filter(v => v.nextDueDate >= todayStr && v.nextDueDate <= thirtyDaysFromNow && v.status !== 'completed')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  };

  const getVaccinationsByStatus = (status: Vaccination['status']) => {
    return vaccinations.filter(v => v.status === status);
  };

  // Fonction pour mettre à jour automatiquement les statuts des vaccinations
  const updateVaccinationStatuses = () => {
    const today = new Date().toISOString().split('T')[0];
    let hasUpdates = false;
    
    const updatedVaccinations = vaccinations.map(vaccination => {
      // Si la vaccination est déjà complétée, ne pas la modifier
      if (vaccination.status === 'completed') {
        return vaccination;
      }
      
      // Si la date de rappel est dépassée et pas encore marquée comme overdue
      if (vaccination.nextDueDate < today && vaccination.status !== 'overdue') {
        hasUpdates = true;
        return { ...vaccination, status: 'overdue' as const };
      }
      
      // Si la date de rappel est dans le futur et pas encore marquée comme scheduled
      if (vaccination.nextDueDate >= today && vaccination.status !== 'scheduled') {
        hasUpdates = true;
        return { ...vaccination, status: 'scheduled' as const };
      }
      
      return vaccination;
    });
    
    if (hasUpdates) {
      setVaccinations(updatedVaccinations);
      saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, updatedVaccinations);
    }
    
    return updatedVaccinations;
  };

  // Fonctions de gestion des protocoles de vaccination
  const addVaccinationProtocol = (protocolData: Omit<VaccinationProtocol, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProtocol: VaccinationProtocol = {
      ...protocolData,
      id: Math.max(...vaccinationProtocols.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedProtocols = [...vaccinationProtocols, newProtocol];
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const updateVaccinationProtocol = (id: number, protocolData: Partial<VaccinationProtocol>) => {
    const updatedProtocols = vaccinationProtocols.map(protocol => 
      protocol.id === id ? { ...protocol, ...protocolData, updatedAt: new Date().toISOString() } : protocol
    );
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const deleteVaccinationProtocol = (id: number) => {
    const updatedProtocols = vaccinationProtocols.filter(protocol => protocol.id !== id);
    setVaccinationProtocols(updatedProtocols);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, updatedProtocols);
  };

  const getVaccinationProtocolById = (id: number) => vaccinationProtocols.find(p => p.id === id);
  
  const getVaccinationProtocolsBySpecies = (species: string) => {
    return vaccinationProtocols.filter(p => p.species === species && p.isActive);
  };

  const getActiveVaccinationProtocols = () => {
    return vaccinationProtocols.filter(p => p.isActive);
  };

  // Fonction pour calculer la date de rappel selon le protocole
  const calculateDueDateFromProtocol = (vaccineName: string, species: string, dateGiven: string) => {
    const protocol = vaccinationProtocols.find(p => 
      p.name === vaccineName && p.species === species && p.isActive
    );
    
    if (!protocol || !protocol.intervals.length) {
      return null;
    }

    // Prendre le dernier intervalle (généralement le rappel annuel)
    const lastInterval = protocol.intervals[protocol.intervals.length - 1];
    const dueDate = new Date(dateGiven);
    dueDate.setDate(dueDate.getDate() + lastInterval.offsetDays);
    
    return dueDate.toISOString().split('T')[0];
  };

  // Fonction pour créer un rappel de vaccination (nouvelle vaccination avec catégorie "reminder")
  const createVaccinationReminder = (originalVaccinationId: number, appointmentDate: string, appointmentTime: string) => {
    const originalVaccination = getVaccinationById(originalVaccinationId);
    if (!originalVaccination) return;

    // Créer un rendez-vous pour le rappel
    const reminderAppointment: Omit<Appointment, 'id' | 'createdAt'> = {
      clientId: originalVaccination.clientId,
      clientName: originalVaccination.clientName,
      petId: originalVaccination.petId,
      petName: originalVaccination.petName,
      date: appointmentDate,
      time: appointmentTime,
      type: 'vaccination',
      duration: 30,
      reason: `Rappel vaccinal - ${originalVaccination.vaccineName}`,
      notes: `Rappel pour ${originalVaccination.vaccineName} (vaccination originale ID: ${originalVaccinationId})`,
      status: 'scheduled',
      reminderSent: false
    };

    // Ajouter le rendez-vous
    addAppointment(reminderAppointment);
    const appointmentId = Math.max(...appointments.map(a => a.id), 0) + 1;

    // Créer une NOUVELLE vaccination avec catégorie "reminder"
    const reminderVaccination: Omit<Vaccination, 'id' | 'createdAt'> = {
      petId: originalVaccination.petId,
      petName: originalVaccination.petName,
      clientId: originalVaccination.clientId,
      clientName: originalVaccination.clientName,
      vaccineName: originalVaccination.vaccineName,
      vaccineType: originalVaccination.vaccineType,
      vaccinationCategory: 'reminder', // Marqué comme rappel
      dateGiven: appointmentDate, // Date du rendez-vous
      nextDueDate: originalVaccination.nextDueDate, // Garde la même date de prochain rappel
      batchNumber: originalVaccination.batchNumber,
      veterinarian: originalVaccination.veterinarian,
      notes: `Rappel de ${originalVaccination.vaccineName} (original: ${originalVaccinationId})`,
      status: 'scheduled',
      cost: originalVaccination.cost,
      location: originalVaccination.location,
      manufacturer: originalVaccination.manufacturer,
      originalVaccinationId: originalVaccinationId, // Lien vers l'original
      reminderAppointmentId: appointmentId,
      isReminder: true
    };

    // Ajouter la nouvelle vaccination (rappel)
    addVaccination(reminderVaccination);

    // Créer un enregistrement de rappel dans l'historique de l'original
    const reminderRecord: VaccinationReminder = {
      id: Math.max(...(originalVaccination.reminderHistory?.map(r => r.id) || [0]), 0) + 1,
      vaccinationId: originalVaccinationId,
      appointmentId: appointmentId,
      scheduledDate: appointmentDate,
      status: 'scheduled',
      notes: `Rappel programmé pour ${originalVaccination.vaccineName}`,
      createdAt: new Date().toISOString()
    };

    // Mettre à jour la vaccination originale avec l'historique des rappels
    const updatedReminderHistory = [...(originalVaccination.reminderHistory || []), reminderRecord];
    updateVaccination(originalVaccinationId, { 
      reminderHistory: updatedReminderHistory
    });

    return { appointment: reminderAppointment, reminderVaccination, reminder: reminderRecord };
  };

  // Fonction pour marquer un rappel comme complété
  const completeVaccinationReminder = (vaccinationId: number, appointmentId: number, newNextDueDate?: string) => {
    const vaccination = getVaccinationById(vaccinationId);
    if (!vaccination) return;

    // Mettre à jour l'historique des rappels
    const updatedReminderHistory = vaccination.reminderHistory?.map(reminder => 
      reminder.appointmentId === appointmentId 
        ? { ...reminder, status: 'completed' as const }
        : reminder
    ) || [];

    // Mettre à jour la vaccination
    const updateData: Partial<Vaccination> = {
      status: 'completed',
      reminderHistory: updatedReminderHistory,
      reminderAppointmentId: undefined // Plus de rendez-vous en attente
    };

    // Si une nouvelle date de rappel est fournie, la mettre à jour
    if (newNextDueDate) {
      updateData.nextDueDate = newNextDueDate;
    }

    updateVaccination(vaccinationId, updateData);

    // Mettre à jour le statut du rendez-vous
    updateAppointment(appointmentId, { status: 'completed' });

    return vaccination;
  };

  // Fonction pour confirmer qu'un rappel de vaccination a été effectué
  const confirmVaccinationReminder = (vaccinationId: number, confirmationData: {
    datePerformed: string;
    veterinarian: string;
    batchNumber?: string;
    notes?: string;
    newNextDueDate?: string;
  }) => {
    const vaccination = getVaccinationById(vaccinationId);
    if (!vaccination) return null;

    // Créer une nouvelle vaccination pour le rappel effectué
    const reminderVaccination: Omit<Vaccination, 'id' | 'createdAt'> = {
      petId: vaccination.petId,
      petName: vaccination.petName,
      clientId: vaccination.clientId,
      clientName: vaccination.clientName,
      vaccineName: vaccination.vaccineName,
      vaccineType: vaccination.vaccineType,
      vaccinationCategory: 'reminder',
      dateGiven: confirmationData.datePerformed,
      nextDueDate: confirmationData.newNextDueDate || vaccination.nextDueDate,
      calculatedDueDate: vaccination.calculatedDueDate,
      batchNumber: confirmationData.batchNumber || vaccination.batchNumber,
      veterinarian: confirmationData.veterinarian,
      notes: confirmationData.notes || `Rappel effectué - ${vaccination.vaccineName}`,
      status: 'completed',
      cost: vaccination.cost,
      location: vaccination.location,
      manufacturer: vaccination.manufacturer,
      expirationDate: vaccination.expirationDate,
      adverseReactions: vaccination.adverseReactions,
      originalVaccinationId: vaccinationId,
      isReminder: true
    };

    // Ajouter la nouvelle vaccination
    addVaccination(reminderVaccination);

    // Mettre à jour la vaccination originale
    const updateData: Partial<Vaccination> = {
      status: 'completed',
      reminderAppointmentId: undefined
    };

    // Si une nouvelle date de rappel est fournie, la mettre à jour
    if (confirmationData.newNextDueDate) {
      updateData.nextDueDate = confirmationData.newNextDueDate;
    }

    updateVaccination(vaccinationId, updateData);

    return reminderVaccination;
  };

  // Fonctions de gestion comptable
  const addAccountingEntry = (entryData: Omit<AccountingEntry, 'id' | 'createdAt'>) => {
    const newEntry: AccountingEntry = {
      ...entryData,
      id: Math.max(...accountingEntries.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [...accountingEntries, newEntry];
    setAccountingEntries(updatedEntries);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, stockMovements, updatedEntries);
    
    return newEntry;
  };

  const updateAccountingEntry = (id: number, updates: Partial<AccountingEntry>) => {
    const updatedEntries = accountingEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setAccountingEntries(updatedEntries);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, stockMovements, updatedEntries);
  };

  const deleteAccountingEntry = (id: number) => {
    const updatedEntries = accountingEntries.filter(entry => entry.id !== id);
    setAccountingEntries(updatedEntries);
    saveDataToStorage(clients, pets, consultations, appointments, prescriptions, farms, farmInterventions, vaccinations, vaccinationProtocols, antiparasitics, antiparasiticProtocols, stockItems, stockAlerts, stockMovements, updatedEntries);
  };

  // Fonction pour calculer automatiquement les recettes
  const calculateAutomaticRevenue = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let totalRevenue = 0;
    const revenueBreakdown = {
      consultations: 0,
      vaccinations: 0,
      antiparasitics: 0,
      prescriptions: 0,
      stockSales: 0,
      manualEntries: 0,
      recurringCharges: 0
    };

    // Recettes des consultations
    consultations
      .filter(c => {
        const consultationDate = new Date(c.date);
        return consultationDate >= start && consultationDate <= end;
      })
      .forEach(consultation => {
        const cost = parseFloat(consultation.cost?.toString() || '0');
        totalRevenue += cost;
        revenueBreakdown.consultations += cost;
        
        // Créer une entrée comptable automatique si elle n'existe pas
        const existingEntry = accountingEntries.find(e => 
          e.source === 'consultation' && e.sourceId === consultation.id
        );
        if (!existingEntry) {
          addAccountingEntry({
            type: 'revenue',
            category: 'automatic',
            frequency: 'occasional',
            description: `Consultation - ${consultation.petName}`,
            amount: cost,
            date: consultation.date,
            reference: `Consultation #${consultation.id}`,
            source: 'consultation',
            sourceId: consultation.id,
            notes: `Consultation automatique pour ${consultation.petName}`
          });
        }
      });

    // Recettes des vaccinations
    vaccinations
      .filter(v => {
        const vaccinationDate = new Date(v.dateGiven);
        return vaccinationDate >= start && vaccinationDate <= end;
      })
      .forEach(vaccination => {
        const cost = parseFloat(vaccination.cost?.toString() || '0');
        totalRevenue += cost;
        revenueBreakdown.vaccinations += cost;
        
        const existingEntry = accountingEntries.find(e => 
          e.source === 'vaccination' && e.sourceId === vaccination.id
        );
        if (!existingEntry) {
          addAccountingEntry({
            type: 'revenue',
            category: 'automatic',
            frequency: 'occasional',
            description: `Vaccination - ${vaccination.vaccineName}`,
            amount: cost,
            date: vaccination.dateGiven,
            reference: `Vaccination #${vaccination.id}`,
            source: 'vaccination',
            sourceId: vaccination.id,
            notes: `Vaccination automatique pour ${vaccination.petName}`
          });
        }
      });

    // Recettes des antiparasitaires
    antiparasitics
      .filter(a => {
        const antiparasiticDate = new Date(a.dateGiven);
        return antiparasiticDate >= start && antiparasiticDate <= end;
      })
      .forEach(antiparasitic => {
        const cost = parseFloat(antiparasitic.cost?.toString() || '0');
        totalRevenue += cost;
        revenueBreakdown.antiparasitics += cost;
        
        const existingEntry = accountingEntries.find(e => 
          e.source === 'antiparasitic' && e.sourceId === antiparasitic.id
        );
        if (!existingEntry) {
          addAccountingEntry({
            type: 'revenue',
            category: 'automatic',
            frequency: 'occasional',
            description: `Antiparasitaire - ${antiparasitic.productName}`,
            amount: cost,
            date: antiparasitic.dateGiven,
            reference: `Antiparasitaire #${antiparasitic.id}`,
            source: 'antiparasitic',
            sourceId: antiparasitic.id,
            notes: `Antiparasitaire automatique pour ${antiparasitic.petName}`
          });
        }
      });

    // Recettes des prescriptions
    prescriptions
      .filter(p => {
        const prescriptionDate = new Date(p.createdAt);
        return prescriptionDate >= start && prescriptionDate <= end;
      })
      .forEach(prescription => {
        const totalCost = prescription.medications.reduce((sum, med) => {
          return sum + (parseFloat(med.cost?.toString() || '0') * med.quantity);
        }, 0);
        totalRevenue += totalCost;
        revenueBreakdown.prescriptions += totalCost;
        
        const existingEntry = accountingEntries.find(e => 
          e.source === 'prescription' && e.sourceId === prescription.id
        );
        if (!existingEntry && totalCost > 0) {
          addAccountingEntry({
            type: 'revenue',
            category: 'automatic',
            frequency: 'occasional',
            description: `Prescription - ${prescription.petName}`,
            amount: totalCost,
            date: prescription.createdAt,
            reference: `Prescription #${prescription.id}`,
            source: 'prescription',
            sourceId: prescription.id,
            notes: `Prescription automatique pour ${prescription.petName}`
          });
        }
      });

    return { totalRevenue, revenueBreakdown };
  };

  // Fonction pour calculer automatiquement les charges
  const calculateAutomaticExpenses = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let totalExpenses = 0;
    const expenseBreakdown = {
      stockPurchases: 0,
      salaries: 0,
      rent: 0,
      taxes: 0,
      insurance: 0,
      other: 0,
      manualEntries: 0,
      recurringCharges: 0
    };

    // Charges des achats de stock
    stockMovements
      .filter(m => {
        const movementDate = new Date(m.date);
        return movementDate >= start && movementDate <= end && m.type === 'in' && m.reason === 'Achat fournisseur';
      })
      .forEach(movement => {
        // Trouver l'item de stock pour calculer le coût
        const stockItem = stockItems.find(item => item.id === movement.itemId);
        if (stockItem) {
          const cost = stockItem.purchasePrice * movement.quantity;
          totalExpenses += cost;
          expenseBreakdown.stockPurchases += cost;
          
          const existingEntry = accountingEntries.find(e => 
            e.source === 'stock_purchase' && e.reference === movement.reference
          );
          if (!existingEntry) {
            addAccountingEntry({
              type: 'expense',
              category: 'automatic',
              frequency: 'occasional',
              description: `Achat stock - ${movement.itemName}`,
              amount: cost,
              date: movement.date,
              reference: movement.reference,
              source: 'stock_purchase',
              notes: `Achat automatique de ${movement.quantity} ${movement.itemName}`
            });
          }
        }
      });

    // Note: Les charges manuelles sont gérées séparément dans generateAccountingSummary
    // pour éviter la double comptabilisation

    return { totalExpenses, expenseBreakdown };
  };

  // Fonction pour générer un résumé comptable
  const generateAccountingSummary = (period: string, startDate: string, endDate: string): AccountingSummary => {
    const { totalRevenue, revenueBreakdown } = calculateAutomaticRevenue(startDate, endDate);
    const { totalExpenses, expenseBreakdown } = calculateAutomaticExpenses(startDate, endDate);
    
    // Ajouter les recettes manuelles
    const manualRevenue = accountingEntries
      .filter(e => {
        const entryDate = new Date(e.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end && e.category === 'manual' && e.type === 'revenue';
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Ajouter les charges manuelles
    const manualExpenses = accountingEntries
      .filter(e => {
        const entryDate = new Date(e.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end && e.category === 'manual' && e.type === 'expense';
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Mettre à jour les breakdowns
    revenueBreakdown.manualEntries = manualRevenue;
    expenseBreakdown.manualEntries = manualExpenses;
    
    // Calculer les totaux finaux
    const finalTotalRevenue = totalRevenue + manualRevenue;
    const finalTotalExpenses = totalExpenses + manualExpenses;
    
    return {
      period,
      totalRevenue: finalTotalRevenue,
      totalExpenses: finalTotalExpenses,
      netIncome: finalTotalRevenue - finalTotalExpenses,
      revenueBreakdown,
      expenseBreakdown
    };
  };











  return (
    <ClientContext.Provider value={{
      clients,
      pets,
      consultations,
      appointments,
      prescriptions,
      farms,
      farmInterventions,
      vaccinations,
      vaccinationProtocols,
      antiparasitics,
      antiparasiticProtocols,
      stockItems,
      stockAlerts,
      stockMovements,
      accountingEntries,
      addClient,
      addPet,
      addConsultation,
      addAppointment,
      addPrescription,
      addFarm,
      addFarmIntervention,
      addVaccination,
      addVaccinationProtocol,
      addAntiparasitic,
      addAntiparasiticProtocol,
      addStockItem,
      addStockMovement,
      addAccountingEntry,
      updateAccountingEntry,
      deleteAccountingEntry,
      calculateAutomaticRevenue,
      calculateAutomaticExpenses,
      generateAccountingSummary,
      updateClient,
      updatePet,
      updateConsultation,
      updateAppointment,
      updatePrescription,
      updateFarm,
      updateFarmIntervention,
      updateVaccination,
      updateVaccinationProtocol,
      updateAntiparasitic,
      updateAntiparasiticProtocol,
      updateStockItem,
      deletePet,
      deleteConsultation,
      deleteAppointment,
      deletePrescription,
      deleteFarm,
      deleteFarmIntervention,
      deleteVaccination,
      deleteVaccinationProtocol,
      deleteAntiparasitic,
      deleteAntiparasiticProtocol,
      deleteStockItem,
      resetData,
      exportData,
      importData,
      getClientById,
      getPetById,
      getConsultationById,
      getAppointmentById,
      getPrescriptionById,
      getFarmById,
      getFarmInterventionById,
      getVaccinationById,
      getVaccinationProtocolById,
      getVaccinationProtocolsBySpecies,
      getActiveVaccinationProtocols,
      getAntiparasiticById,
      getAntiparasiticsByPetId,
      getAntiparasiticsByClientId,
      getOverdueAntiparasitics,
      getUpcomingAntiparasitics,
      getAntiparasiticsByStatus,
      getAntiparasiticProtocolById,
      getAntiparasiticProtocolsBySpecies,
      getActiveAntiparasiticProtocols,
      getPetsByOwnerId,
      getConsultationsByPetId,
      getConsultationsByClientId,
      getAppointmentsByClientId,
      getAppointmentsByPetId,
      getAppointmentsByDate,
      getUpcomingAppointments,
      getOverdueAppointments,
      getPrescriptionsByPetId,
      getPrescriptionsByConsultationId,
      getActivePrescriptions,
      getFarmInterventionsByFarmId,
      getUpcomingFarmInterventions,
      getFarmsByStatus,
      getVaccinationsByPetId,
      getVaccinationsByClientId,
      getOverdueVaccinations,
      getUpcomingVaccinations,
      getVaccinationsByStatus,
      createVaccinationReminder,
      completeVaccinationReminder,
      confirmVaccinationReminder,
      updateVaccinationStatuses,
      calculateDueDateFromProtocol,
      updateClientStats,
      getStockAlerts
    }}>
      {children}
    </ClientContext.Provider>
  );
}

// Interfaces pour la gestion de stock
export interface StockItem {
  id: number;
  name: string;
  category: 'medication' | 'vaccine' | 'consumable' | 'equipment' | 'supplement';
  subcategory?: string;
  description?: string;
  manufacturer?: string;
  batchNumber?: string;
  dosage?: string;
  unit: 'unit' | 'box' | 'vial' | 'bottle' | 'pack' | 'kg' | 'g' | 'ml' | 'l';
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  purchasePrice: number; // Prix d'achat
  sellingPrice: number; // Prix de vente
  totalValue: number; // Valeur totale basée sur le prix d'achat
  expirationDate?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  lastUpdated: string;
  lastRestocked?: string;
  isActive: boolean;
  barcode?: string;
  sku?: string;
}

export interface StockAlert {
  id: number;
  itemId: number;
  itemName: string;
  type: 'low_stock' | 'expired' | 'expiring_soon';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
}

export interface StockMovement {
  id: number;
  itemId: number;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string; // Numéro de facture, consultation, etc.
  performedBy?: string;
  date: string;
  notes?: string;
}

// Interfaces pour la gestion comptable
export interface AccountingEntry {
  id: number;
  type: 'revenue' | 'expense';
  category: 'automatic' | 'manual';
  frequency: 'monthly' | 'annual' | 'occasional';
  description: string;
  amount: number;
  date: string;
  reference?: string; // Référence à une consultation, vente, etc.
  source?: 'consultation' | 'vaccination' | 'antiparasitic' | 'prescription' | 'stock_sale' | 'stock_purchase' | 'salary' | 'rent' | 'tax' | 'insurance' | 'other';
  sourceId?: number; // ID de la source (consultation, vaccination, etc.)
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface AccountingSummary {
  period: string; // "2024-01", "2024-Q1", "2024"
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  revenueBreakdown: {
    consultations: number;
    vaccinations: number;
    antiparasitics: number;
    prescriptions: number;
    stockSales: number;
    manualEntries: number;
  };
  expenseBreakdown: {
    stockPurchases: number;
    salaries: number;
    rent: number;
    taxes: number;
    insurance: number;
    other: number;
    manualEntries: number;
  };
}

// Interface pour les charges récurrentes

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};