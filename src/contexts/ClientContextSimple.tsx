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
  presetEntries: PresetEntry[];
  addClient: (clientData: Omit<Client, 'id' | 'pets' | 'lastVisit' | 'totalVisits'>) => void;
