// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Stethoscope, Syringe, AlertCircle, TrendingUp, TrendingDown, Activity, Weight, Thermometer, Plus, Printer, Bug, Award, Edit, CheckCircle, CheckSquare } from "lucide-react";
import { Pet, Consultation, useClients, Antiparasitic } from "@/contexts/ClientContext";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { ConfirmVaccinationReminderModal } from "@/components/modals/ConfirmVaccinationReminderModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAge, formatDate } from "@/lib/utils";
import { PrescriptionsList } from "@/components/PrescriptionsList";

import { useToast } from '@/hooks/use-toast';
import CertificateVaccinationPrintDynamic from '@/components/CertificateVaccinationPrintDynamic';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NewVaccinationModal from "../forms/NewVaccinationModalDynamic";
import NewAntiparasiticModalDynamic from "../forms/NewAntiparasiticModalDynamic";

interface PetDossierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet | null;
}

// Interface pour les données de graphique
interface ChartData {
  date: string;
  weight: number;
  temperature: number;
}

export function PetDossierModal({ open, onOpenChange, pet }: PetDossierModalProps) {
  const { 
    consultations, 
    clients, 
    getConsultationsByPetId, 
    getClientById, 
    getPrescriptionsByPetId, 
    getActivePrescriptions,
    getVaccinationsByPetId,
    getAntiparasiticsByPetId,
    updatePet,
    updateConsultation,
    updateVaccination,
    updateVaccinationStatuses
  } = useClients();
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewVaccination, setShowNewVaccination] = useState(false);
  const [showNewAntiparasitic, setShowNewAntiparasitic] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview"); // Changed default to overview to show photos
  const [editingPedigree, setEditingPedigree] = useState(false);
  const [pedigreeData, setPedigreeData] = useState({
    hasPedigree: false,
    officialName: "",
    pedigreeNumber: "",
    breeder: "",
    fatherName: "",
    fatherPedigree: "",
    fatherBreed: "",
    fatherTitles: "",
    motherName: "",
    motherPedigree: "",
    motherBreed: "",
    motherTitles: "",
    pedigreePhoto: ""
  });

  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(pet?.additionalPhotos || []);
  const [alertPrefill, setAlertPrefill] = useState({
    clientId: 0,
    petId: 0,
    type: '' as 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire',
    reason: ''
  });
  const [selectedVaccinationForReminder, setSelectedVaccinationForReminder] = useState<any>(null);
  const [showConfirmReminder, setShowConfirmReminder] = useState(false);
  const [selectedVaccinationForConfirmation, setSelectedVaccinationForConfirmation] = useState<any>(null);
  const [editingVaccinationStatus, setEditingVaccinationStatus] = useState<number | null>(null);
  const { toast } = useToast();


  // Mettre à jour les statuts des vaccinations quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      updateVaccinationStatuses();
    }
  }, [open, updateVaccinationStatuses]);

  const handlePedigreeSave = () => {
    if (pet) {
      // Mettre à jour l'animal dans le contexte
      updatePet(pet.id, {
        ...pet,
        ...pedigreeData
      });
      
      // Mettre à jour l'objet pet localement pour l'impression
      Object.assign(pet, pedigreeData);
      
      setEditingPedigree(false);
    }
  };

  const handlePedigreeCancel = () => {
    if (pet) {
      setPedigreeData({
        hasPedigree: pet.hasPedigree || false,
        officialName: pet.officialName || "",
        pedigreeNumber: pet.pedigreeNumber || "",
        breeder: pet.breeder || "",
        fatherName: pet.fatherName || "",
        fatherPedigree: pet.fatherPedigree || "",
        fatherBreed: pet.fatherBreed || "",
        fatherTitles: pet.fatherTitles || "",
        motherName: pet.motherName || "",
        motherPedigree: pet.motherPedigree || "",
        motherBreed: pet.motherBreed || "",
        motherTitles: pet.motherTitles || "",
        pedigreePhoto: pet.pedigreePhoto || ""
      });
      setEditingPedigree(false);
    }
  };

  const handleVaccinationReminder = (vaccination: any) => {
    if (!pet) return;
    
    // Pré-remplir les données pour le rendez-vous de rappel
    setAlertPrefill({
      clientId: pet.ownerId,
      petId: pet.id,
      type: 'vaccination',
      reason: `Rappel vaccinal - ${vaccination.vaccineName}`
    });
    
    // Stocker la vaccination sélectionnée pour référence
    setSelectedVaccinationForReminder(vaccination);
    
    // Ouvrir le modal de rendez-vous
    setShowNewAppointment(true);
  };

  const handleConfirmReminder = (vaccination: any) => {
    setSelectedVaccinationForConfirmation(vaccination);
    setShowConfirmReminder(true);
  };

  const handleStatusChange = (vaccinationId: number, newStatus: 'completed' | 'scheduled' | 'overdue' | 'missed') => {
    updateVaccination(vaccinationId, { status: newStatus });
    setEditingVaccinationStatus(null);
    
    const statusLabels = {
      completed: 'Terminée',
      scheduled: 'Planifiée', 
      overdue: 'En retard',
      missed: 'Manquée'
    };
    
    toast({
      title: "Statut mis à jour",
      description: `Le statut de la vaccination a été changé en "${statusLabels[newStatus]}"`,
    });
  };

  const handleDeletePhoto = (consultationId: number, photoIndex: number) => {
    // Trouver la consultation
    const consultation = consultations.find(c => c.id === consultationId);
    if (!consultation || !consultation.photos) return;

    // Créer une nouvelle liste de photos sans la photo à supprimer
    const updatedPhotos = consultation.photos.filter((_, index) => index !== photoIndex);

    // Mettre à jour la consultation avec les nouvelles photos
    const updatedConsultation = {
      ...consultation,
      photos: updatedPhotos
    };

    // Mettre à jour dans le contexte
    updateConsultation(consultationId, updatedConsultation);
  };

  const handleAddAdditionalPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto = reader.result as string;
      const updatedPhotos = [...additionalPhotos, newPhoto];
      setAdditionalPhotos(updatedPhotos);
      
      // Mettre à jour l'animal dans le contexte
      if (pet) {
        updatePet(pet.id, {
          ...pet,
          additionalPhotos: updatedPhotos
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAdditionalPhoto = (photoIndex: number) => {
    const updatedPhotos = additionalPhotos.filter((_, index) => index !== photoIndex);
    setAdditionalPhotos(updatedPhotos);
    
    // Mettre à jour l'animal dans le contexte
    if (pet) {
      updatePet(pet.id, {
        ...pet,
        additionalPhotos: updatedPhotos
      });
    }
  };

  // Initialiser les données du pedigree
  useEffect(() => {
    if (pet) {
      setPedigreeData({
        hasPedigree: pet.hasPedigree || false,
        officialName: pet.officialName || "",
        pedigreeNumber: pet.pedigreeNumber || "",
        breeder: pet.breeder || "",
        fatherName: pet.fatherName || "",
        fatherPedigree: pet.fatherPedigree || "",
        fatherBreed: pet.fatherBreed || "",
        fatherTitles: pet.fatherTitles || "",
        motherName: pet.motherName || "",
        motherPedigree: pet.motherPedigree || "",
        motherBreed: pet.motherBreed || "",
        motherTitles: pet.motherTitles || "",
        pedigreePhoto: pet.pedigreePhoto || ""
      });
      setAdditionalPhotos(pet.additionalPhotos || []);
    }
  }, [pet]);

  if (!pet) return null;

  // Récupérer le propriétaire
  const owner = getClientById(pet.ownerId);
  
  // Récupérer toutes les consultations de cet animal
  const petConsultations = getConsultationsByPetId(pet.id);
  
  // Récupérer toutes les vaccinations de cet animal
  const petVaccinations = getVaccinationsByPetId(pet.id);
  // Récupérer tous les traitements antiparasitaires de cet animal
  const petAntiparasitics = getAntiparasiticsByPetId(pet.id);
  // Load antiparasitics data for this pet
  
  // Trier les consultations par date (plus récentes en premier)
  const sortedConsultations = [...petConsultations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Trier les vaccinations par date (plus récentes en premier)
  const sortedVaccinations = [...petVaccinations].sort((a, b) => 
    new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime()
  );

  // Trier les antiparasitaires par date (plus récentes en premier)
  const sortedAntiparasitics = [...(petAntiparasitics || [])].sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime());

  // Préparer les données pour les graphiques
  const chartData: ChartData[] = sortedConsultations
    .filter(c => c.weight || c.temperature)
    .map(c => ({
      date: new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      weight: c.weight ? parseFloat(c.weight) : 0,
      temperature: c.temperature ? parseFloat(c.temperature) : 0
    }))
    .reverse(); // Plus anciennes en premier pour le graphique

  // Calculer les statistiques
  const weightHistory = sortedConsultations.filter(c => c.weight).map(c => parseFloat(c.weight));
  const temperatureHistory = sortedConsultations.filter(c => c.temperature).map(c => parseFloat(c.temperature));
  
  const currentWeight = weightHistory[0] || 0;
  const previousWeight = weightHistory[1] || 0;
  const weightChange = currentWeight - previousWeight;
  const weightTrend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable';
  
  const currentTemperature = temperatureHistory[0] || 0;
  const avgTemperature = temperatureHistory.length > 0 
    ? temperatureHistory.reduce((a, b) => a + b, 0) / temperatureHistory.length 
    : 0;

  // Dernière consultation
  const lastConsultation = sortedConsultations[0];
  
  // Prochaine consultation recommandée (si followUp est défini)
  const nextConsultation = lastConsultation?.followUp ? {
    reason: lastConsultation.followUp,
    estimatedDate: new Date(lastConsultation.date)
  } : null;

  // Alertes
  const alerts = [];
  
  // Alerte si pas de consultation depuis plus de 6 mois
  if (lastConsultation) {
    const monthsSinceLastVisit = (new Date().getTime() - new Date(lastConsultation.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceLastVisit > 6) {
      alerts.push({
        type: 'warning',
        title: 'Contrôle de routine recommandé',
        message: `Dernière consultation il y a ${Math.floor(monthsSinceLastVisit)} mois`,
        action: 'Planifier consultation',
        actionType: 'consultation'
      });
    }
  }

  // Alerte si température anormale
  if (currentTemperature > 39.5 || currentTemperature < 37.5) {
    alerts.push({
      type: 'danger',
      title: 'Température anormale',
      message: `Température actuelle: ${currentTemperature}°C`,
      action: 'Contrôle urgent',
      actionType: 'consultation'
    });
  }

  // Alerte si perte de poids significative
  if (weightChange < -2) {
    alerts.push({
      type: 'warning',
      title: 'Perte de poids',
      message: `Perte de ${Math.abs(weightChange)}kg depuis la dernière consultation`,
      action: 'Surveiller',
      actionType: 'consultation'
    });
  }

  // Alertes pour les vaccinations en retard ou proches
  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  petVaccinations.forEach(vaccination => {
    if (vaccination.nextDueDate) {
      const dueDate = new Date(vaccination.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        // Vaccination en retard
        alerts.push({
          type: 'danger',
          title: 'Vaccination en retard',
          message: `${vaccination.vaccineName} - ${Math.abs(daysUntilDue)} jour(s) de retard`,
          action: 'Planifier vaccination',
          actionType: 'vaccination'
        });
      } else if (daysUntilDue <= 7) {
        // Vaccination dans la semaine
        alerts.push({
          type: 'warning',
          title: 'Vaccination à prévoir',
          message: `${vaccination.vaccineName} - Dans ${daysUntilDue} jour(s)`,
          action: 'Planifier vaccination',
          actionType: 'vaccination'
        });
      }
    }
  });

  // Alertes pour les antiparasitaires en retard ou proches
  petAntiparasitics.forEach(antiparasitic => {
    if (antiparasitic.nextDueDate) {
      const dueDate = new Date(antiparasitic.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        // Antiparasitaire en retard
        alerts.push({
          type: 'danger',
          title: 'Traitement antiparasitaire en retard',
          message: `${antiparasitic.productName} - ${Math.abs(daysUntilDue)} jour(s) de retard`,
          action: 'Planifier traitement',
          actionType: 'antiparasitic'
        });
              } else if (daysUntilDue <= 7) {
          // Antiparasitaire dans la semaine
          alerts.push({
            type: 'warning',
            title: 'Traitement antiparasitaire à prévoir',
            message: `${antiparasitic.productName} - Dans ${daysUntilDue} jour(s)`,
            action: 'Planifier traitement',
            actionType: 'antiparasitic'
          });
        }
    }
  });

  const handleNewConsultation = () => {
    // Ouvrir le modal de rendez-vous avec consultation pré-remplie
    setAlertPrefill({
      clientId: owner?.id || 0,
      petId: pet.id,
      type: 'consultation',
      reason: 'Nouvelle consultation'
    });
    setShowNewAppointment(true);
  };

  const handleNewAppointment = () => {
    setShowNewAppointment(true);
  };

  const handleNewVaccination = () => {
    setShowNewVaccination(true);
  };

  const handleNewAntiparasitic = () => {
    setShowNewAntiparasitic(true);
  };

  const handleAlertAction = (actionType: string) => {
    // Pré-remplir les informations selon le type d'alerte
    let appointmentType: 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire' = 'consultation';
    let reason = '';
    
    switch (actionType) {
      case 'consultation':
        appointmentType = 'consultation';
        reason = 'Contrôle de routine recommandé';
        break;
      case 'vaccination':
        appointmentType = 'vaccination';
        reason = 'Vaccination à effectuer';
        break;
      case 'antiparasitic':
        appointmentType = 'controle';
        reason = 'Traitement antiparasitaire à effectuer';
        break;
      default:
        appointmentType = 'consultation';
        reason = 'Rendez-vous médical';
    }
    
    setAlertPrefill({
      clientId: owner?.id || 0,
      petId: pet.id,
      type: appointmentType,
      reason: reason
    });
    
    setShowNewAppointment(true);
  };

  const handlePrintDossier = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dossier Médical - ${pet.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .pet-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-section { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .info-section h3 { margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .consultation { margin: 20px 0; border: 1px solid #eee; padding: 15px; border-radius: 5px; }
            .consultation h4 { margin: 0 0 10px 0; color: #333; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">VetoCrm</div>
            <h2>Dossier Médical Complet</h2>
            <p><strong>Animal:</strong> ${pet.name} | <strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>

          <div class="pet-info">
            <div class="info-section">
              <h3>Informations Animal</h3>
              <p><strong>Nom:</strong> ${pet.name}</p>
              <p><strong>Espèce:</strong> ${pet.type}</p>
              <p><strong>Race:</strong> ${pet.breed || 'Non spécifiée'}</p>
              <p><strong>Sexe:</strong> ${pet.gender === 'male' ? 'Mâle' : pet.gender === 'female' ? 'Femelle' : 'Non spécifié'}</p>
              <p><strong>Âge:</strong> ${pet.birthDate ? calculateAge(pet.birthDate) : 'Non spécifié'}</p>
              <p><strong>Poids actuel:</strong> ${currentWeight}kg</p>
              <p><strong>Température actuelle:</strong> ${currentTemperature}°C</p>
              <p><strong>Couleur:</strong> ${pet.color || 'Non spécifiée'}</p>
              <p><strong>Puce électronique:</strong> ${pet.microchip || 'Non spécifiée'}</p>
              ${pet.medicalNotes ? `<p><strong>Notes médicales:</strong> ${pet.medicalNotes}</p>` : ''}
            </div>
            <div class="info-section">
              <h3>Propriétaire</h3>
              <p><strong>Nom:</strong> ${owner?.name || 'Non spécifié'}</p>
              <p><strong>Email:</strong> ${owner?.email || 'Non spécifié'}</p>
              <p><strong>Téléphone:</strong> ${owner?.phone || 'Non spécifié'}</p>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${sortedConsultations.length}</div>
              <div class="stat-label">Consultations</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${petVaccinations.length}</div>
              <div class="stat-label">Vaccinations</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${petAntiparasitics.length}</div>
              <div class="stat-label">Antiparasitaires</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${currentWeight}kg</div>
              <div class="stat-label">Poids actuel</div>
            </div>
          </div>

          <!-- Photo principale de l'animal -->
          ${pet.photo ? `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${pet.photo}" alt="${pet.name}" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;" />
              <p style="margin-top: 10px; font-weight: bold;">Photo de ${pet.name}</p>
            </div>
          ` : ''}

          <!-- Historique des Consultations -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Historique des Consultations (${sortedConsultations.length})</h3>
            ${sortedConsultations.length > 0 ? sortedConsultations.map(c => `
              <div style="margin: 15px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f9f9f9;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Consultation du ${new Date(c.date).toLocaleDateString('fr-FR')}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p><strong>Poids:</strong> ${c.weight || 'Non renseigné'}</p>
                    <p><strong>Température:</strong> ${c.temperature || 'Non renseigné'}</p>
                    ${c.symptoms ? `<p><strong>Symptômes:</strong> ${c.symptoms}</p>` : ''}
                  </div>
                  <div>
                    ${c.diagnosis ? `<p><strong>Diagnostic:</strong> ${c.diagnosis}</p>` : ''}
                    ${c.treatment ? `<p><strong>Traitement:</strong> ${c.treatment}</p>` : ''}
                    ${c.medications ? `<p><strong>Médicaments:</strong> ${c.medications}</p>` : ''}
                  </div>
                </div>
                ${c.notes ? `<p><strong>Notes:</strong> ${c.notes}</p>` : ''}
                ${c.photos && c.photos.length > 0 ? `
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 15px 0;">
                    ${c.photos.map((photo, idx) => `
                      <div style="text-align: center;">
                        <img src="${photo}" alt="Photo consultation ${idx + 1}" style="max-width: 120px; max-height: 120px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                        <div style="font-size: 11px; color: #666; margin-top: 5px;">Photo ${idx + 1}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('') : '<p style="text-align: center; color: #666; font-style: italic;">Aucune consultation enregistrée</p>'}
          </div>

          <!-- Historique des Vaccinations -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Historique des Vaccinations (${petVaccinations.length})</h3>
            ${petVaccinations.length > 0 ? petVaccinations.map(v => `
              <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #4CAF50; background: #f0f8f0;">
                <h4 style="margin: 0 0 10px 0;">${v.vaccineName} - ${new Date(v.dateGiven).toLocaleDateString('fr-FR')}</h4>
                <p><strong>Type:</strong> ${v.vaccineType || 'Non spécifié'}</p>
                <p><strong>Prochain rappel:</strong> ${v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                <p><strong>Vétérinaire:</strong> ${v.veterinarian || 'Non spécifié'}</p>
                ${v.notes ? `<p><strong>Notes:</strong> ${v.notes}</p>` : ''}
              </div>
            `).join('') : '<p style="text-align: center; color: #666; font-style: italic;">Aucune vaccination enregistrée</p>'}
          </div>

          <!-- Historique des Antiparasitaires -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Historique des Traitements Antiparasitaires (${petAntiparasitics.length})</h3>
            ${petAntiparasitics.length > 0 ? petAntiparasitics.map(a => `
              <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #9C27B0; background: #f3e5f5; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #7B1FA2;">${a.productName} - ${new Date(a.dateGiven).toLocaleDateString('fr-FR')}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0;">
                  <div>
                    <p><strong>Type de produit:</strong> ${a.productType || 'Non spécifié'}</p>
                    <p><strong>Parasites ciblés:</strong> ${a.targetParasites || 'Non spécifié'}</p>
                    <p><strong>Voie d'administration:</strong> ${a.administrationRoute || 'Non spécifié'}</p>
                    <p><strong>Dosage:</strong> ${a.dosage || 'Non spécifié'}</p>
                  </div>
                  <div>
                <p><strong>Prochain traitement:</strong> ${a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                <p><strong>Vétérinaire:</strong> ${a.veterinarian || 'Non spécifié'}</p>
                    <p><strong>Statut:</strong> ${a.status === 'completed' ? 'Terminé' : a.status === 'scheduled' ? 'Planifié' : a.status === 'overdue' ? 'En retard' : 'Manqué'}</p>
                    ${a.cost ? `<p><strong>Coût:</strong> ${a.cost} €</p>` : ''}
                  </div>
                </div>
                ${a.batchNumber ? `<p><strong>Numéro de lot:</strong> ${a.batchNumber}</p>` : ''}
                ${a.manufacturer ? `<p><strong>Fabricant:</strong> ${a.manufacturer}</p>` : ''}
                ${a.weight ? `<p><strong>Poids de l'animal:</strong> ${a.weight}</p>` : ''}
                ${a.notes ? `
                  <div style="margin: 10px 0; padding: 10px; background: rgba(156, 39, 176, 0.1); border-radius: 3px;">
                    <p><strong>Notes:</strong> ${a.notes}</p>
                  </div>
                ` : ''}
                ${a.sideEffects ? `
                  <div style="margin: 10px 0; padding: 10px; background: #ffebee; border: 1px solid #f44336; border-radius: 3px;">
                    <p style="color: #d32f2f;"><strong>⚠️ Effets indésirables:</strong> ${a.sideEffects}</p>
                  </div>
                ` : ''}
              </div>
            `).join('') : '<p style="text-align: center; color: #666; font-style: italic;">Aucun traitement antiparasitaire enregistré</p>'}
          </div>

          <!-- Section Pedigree -->
          ${pet.hasPedigree ? `
            <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Pedigree Officiel</h3>
              
              <!-- Informations de l'animal -->
              <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Informations de l'animal</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p><strong>Nom officiel:</strong> ${pet.officialName || 'Non spécifié'}</p>
                    <p><strong>N° Pedigree/LOF:</strong> ${pet.pedigreeNumber || 'Non spécifié'}</p>
                    <p><strong>N° Puce/Tatouage:</strong> ${pet.microchip || 'Non spécifié'}</p>
                    <p><strong>Race:</strong> ${pet.breed || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p><strong>Sexe:</strong> ${pet.gender === 'male' ? 'Mâle' : pet.gender === 'female' ? 'Femelle' : 'Non spécifié'}</p>
                    <p><strong>Couleur/Robe:</strong> ${pet.color || 'Non spécifiée'}</p>
                    <p><strong>Date de naissance:</strong> ${pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                    <p><strong>Éleveur:</strong> ${pet.breeder || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              <!-- Parents -->
              <div style="margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Ascendance</h4>
                
                <!-- Père -->
                <div style="margin: 15px 0; padding: 15px; border-left: 3px solid #007bff; background: #f0f8ff;">
                  <h5 style="margin: 0 0 8px 0; color: #007bff;">Père</h5>
                  <p><strong>Nom:</strong> ${pet.fatherName || 'Non spécifié'}</p>
                  <p><strong>N° Pedigree:</strong> ${pet.fatherPedigree || 'Non spécifié'}</p>
                  <p><strong>Race:</strong> ${pet.fatherBreed || 'Non spécifiée'}</p>
                  ${pet.fatherTitles ? `<p><strong>Titres:</strong> ${pet.fatherTitles}</p>` : ''}
                </div>

                <!-- Mère -->
                <div style="margin: 15px 0; padding: 15px; border-left: 3px solid #e91e63; background: #fce4ec;">
                  <h5 style="margin: 0 0 8px 0; color: #e91e63;">Mère</h5>
                  <p><strong>Nom:</strong> ${pet.motherName || 'Non spécifié'}</p>
                  <p><strong>N° Pedigree:</strong> ${pet.motherPedigree || 'Non spécifié'}</p>
                  <p><strong>Race:</strong> ${pet.motherBreed || 'Non spécifiée'}</p>
                  ${pet.motherTitles ? `<p><strong>Titres:</strong> ${pet.motherTitles}</p>` : ''}
                </div>
              </div>

              <!-- Certificat Pedigree -->
              ${pet.pedigreePhoto ? `
                <div style="margin: 20px 0; text-align: center;">
                  <h4 style="margin: 0 0 15px 0; color: #333;">Certificat Pedigree</h4>
                  <img src="${pet.pedigreePhoto}" alt="Certificat Pedigree" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px; border: 2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                  <p style="margin-top: 10px; font-size: 12px; color: #666;">Document officiel du pedigree</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Album Photo -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Album Photo</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0;">
              ${pet.photo ? `
                <div style="text-align: center;">
                  <img src="${pet.photo}" alt="Photo principale" style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                  <div style="font-size: 11px; color: #666; margin-top: 5px;">Photo principale</div>
                </div>
              ` : ''}
              ${sortedConsultations.some(c => c.photos && c.photos.length > 0) ? 
                sortedConsultations.map(c => 
                  c.photos ? c.photos.map((photo, idx) => `
                    <div style="text-align: center;">
                      <img src="${photo}" alt="Consultation ${new Date(c.date).toLocaleDateString('fr-FR')} - Photo ${idx + 1}" style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                      <div style="font-size: 11px; color: #666; margin-top: 5px;">Consultation ${new Date(c.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                  `).join('') : ''
                ).join('') : ''
              }
            </div>
            ${!pet.photo && !sortedConsultations.some(c => c.photos && c.photos.length > 0) ? 
              '<p style="text-align: center; color: #666; font-style: italic;">Aucune photo disponible</p>' : ''
            }
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>VetoCrm - Gestion Vétérinaire Complète</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dossier Médical - {pet.name}
              {owner && (
                <span className="text-sm text-muted-foreground">
                  (Propriétaire: {owner.name})
                </span>
              )}
          </DialogTitle>
        </DialogHeader>
        
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Historique
            </TabsTrigger>
              <TabsTrigger value="prescriptions" className="gap-2">
              <Syringe className="h-4 w-4" />
                Prescriptions
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="gap-2">
              <Syringe className="h-4 w-4" />
              Vaccinations
              </TabsTrigger>
              <TabsTrigger value="antiparasites" className="gap-2">
                <Bug className="h-4 w-4" />
                Antiparasitaires
              </TabsTrigger>
              <TabsTrigger value="pedigree" className="gap-2">
                <Award className="h-4 w-4" />
                Pedigree
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Évolution
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertes
            </TabsTrigger>
          </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Galerie photos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Galerie photos</CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddAdditionalPhoto}
                      className="hidden"
                      id="add-photo-input"
                    />
                    <label
                      htmlFor="add-photo-input"
                      className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une photo
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Photo officielle */}
                    {pet.photo && (
                      <div className="relative flex-shrink-0">
                        <img src={pet.photo} alt="Photo officielle" className="h-32 w-32 object-cover rounded" />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          Officielle
                        </div>
                      </div>
                    )}
                    
                    {/* Photos supplémentaires */}
                    {additionalPhotos.map((src, idx) => (
                      <div key={`additional-${idx}`} className="relative flex-shrink-0 group">
                        <img src={src} alt={`Photo supplémentaire ${idx + 1}`} className="h-32 w-32 object-cover rounded" />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          Photo {idx + 1}
                        </div>
                        {/* Bouton de suppression */}
                        <button
                          onClick={() => handleDeleteAdditionalPhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Supprimer cette photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {/* Photos des consultations */}
                    {sortedConsultations.map(consultation => 
                      consultation.photos?.map((src, idx) => (
                        <div key={`${consultation.id}-${idx}`} className="relative flex-shrink-0 group">
                          <img src={src} alt={`consultation-${consultation.id}-${idx}`} className="h-32 w-32 object-cover rounded" />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            {new Date(consultation.date).toLocaleDateString('fr-FR')}
                          </div>
                          {/* Bouton de suppression */}
                          <button
                            onClick={() => handleDeletePhoto(consultation.id, idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Supprimer cette photo"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                    
                    {/* Message si aucune photo */}
                    {!pet.photo && additionalPhotos.length === 0 && sortedConsultations.every(c => !c.photos || c.photos.length === 0) && (
                      <div className="flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded text-gray-500">
                        Aucune photo disponible
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Statistiques KPI */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Poids actuel</p>
                        <p className="text-2xl font-bold">{currentWeight}kg</p>
                        {weightChange !== 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            {weightTrend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={weightTrend === 'up' ? 'text-green-600' : 'text-red-600'}>
                              {Math.abs(weightChange)}kg
                            </span>
            </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Température</p>
                        <p className="text-2xl font-bold">{currentTemperature}°C</p>
                        <p className="text-sm text-muted-foreground">
                          Moy: {avgTemperature.toFixed(1)}°C
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Consultations</p>
                        <p className="text-2xl font-bold">{sortedConsultations.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Dernière: {lastConsultation ? new Date(lastConsultation.date).toLocaleDateString('fr-FR') : 'Aucune'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alertes</p>
                      <p className="text-2xl font-bold">{alerts.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {alerts.length > 0 ? 'À traiter' : 'Aucune'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                      <p className="text-2xl font-bold">{getPrescriptionsByPetId(pet.id).length}</p>
                      <p className="text-sm text-muted-foreground">
                        {getActivePrescriptions().filter(p => p.petId === pet.id).length} active(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

              {nextConsultation && (
                <Card className="border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Prochain suivi recommandé</h4>
                        <p className="text-sm text-muted-foreground">{nextConsultation.reason}</p>
                      </div>
                      <Button size="sm" onClick={handleNewConsultation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Planifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {alerts.length > 0 && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Alertes importantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-destructive/10 rounded">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <div className="flex-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                                                  <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert.actionType)}
                          >
                            {alert.action}
                          </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historique des consultations</h3>
                <Button size="sm" onClick={handleNewConsultation} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Planifier Consultation
                </Button>
              </div>

              {sortedConsultations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucune consultation enregistrée</p>
                    <p className="text-sm">Commencez par créer la première consultation</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Consultation #{consultation.id}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(consultation.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Poids:</span>
                            <span className="ml-2">{consultation.weight || 'Non renseigné'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Température:</span>
                            <span className="ml-2">{consultation.temperature || 'Non renseigné'}</span>
                          </div>
                        </div>
                        
                        {consultation.symptoms && (
                          <div>
                            <span className="font-medium">Symptômes:</span>
                            <p className="text-sm mt-1">{consultation.symptoms}</p>
                          </div>
                        )}
                        
                        {consultation.diagnosis && (
                          <div>
                            <span className="font-medium">Diagnostic:</span>
                            <p className="text-sm mt-1">{consultation.diagnosis}</p>
                          </div>
                        )}
                        
                        {consultation.treatment && (
                          <div>
                            <span className="font-medium">Traitement:</span>
                            <p className="text-sm mt-1">{consultation.treatment}</p>
                          </div>
                        )}
                        
                        {consultation.medications && (
                          <div>
                            <span className="font-medium">Médicaments:</span>
                            <p className="text-sm mt-1">{consultation.medications}</p>
                          </div>
                        )}
                        
                        {consultation.notes && (
                          <div>
                            <span className="font-medium">Notes:</span>
                            <p className="text-sm mt-1 text-muted-foreground">{consultation.notes}</p>
                          </div>
                        )}
                        
                        {consultation.followUp && (
                          <div className="pt-2 border-t">
                            <span className="font-medium text-primary">Suivi recommandé:</span>
                            <p className="text-sm mt-1">{consultation.followUp}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <PrescriptionsList petId={pet.id} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <h3 className="text-lg font-semibold">Évolution du poids et de la température</h3>
              
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Weight className="h-5 w-5" />
                        Évolution du poids
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5" />
                        Évolution de la température
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="temperature" stroke="#dc2626" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucune donnée disponible pour les graphiques</p>
                    <p className="text-sm">Ajoutez des consultations avec poids et température</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="vaccinations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historique vaccinal</h3>
                <NewVaccinationModal selectedClientId={owner?.id} selectedPetId={pet.id}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvelle vaccination
                  </Button>
                </NewVaccinationModal>
              </div>
              
              {sortedVaccinations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucune vaccination enregistrée</p>
                    <p className="text-sm">Commencez par ajouter la première vaccination</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Statistiques vaccinales */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Syringe className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-xl font-bold">{sortedVaccinations.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">À jour</p>
                            <p className="text-xl font-bold">
                              {sortedVaccinations.filter(v => v.status === 'completed').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">En retard</p>
                            <p className="text-xl font-bold">
                              {sortedVaccinations.filter(v => v.status === 'overdue').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Planifiées</p>
                            <p className="text-xl font-bold">
                              {sortedVaccinations.filter(v => v.status === 'scheduled').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Liste des vaccinations */}
                  <div className="space-y-3">
                    {sortedVaccinations.map((vaccination) => (
                      <Card key={vaccination.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Syringe className={`h-5 w-5 ${vaccination.vaccinationCategory === 'reminder' ? 'text-orange-600' : 'text-blue-600'}`} />
                                <h4 className="font-semibold text-lg">
                                  {vaccination.vaccineName}
                                  {vaccination.vaccinationCategory === 'reminder' && (
                                    <span className="ml-2 text-sm text-orange-600 font-normal">(Rappel)</span>
                                  )}
                                </h4>
                                <Badge 
                                  variant={vaccination.vaccineType === 'core' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {vaccination.vaccineType === 'core' ? 'Essentiel' : 
                                   vaccination.vaccineType === 'non-core' ? 'Optionnel' :
                                   vaccination.vaccineType === 'rabies' ? 'Rage' : 'Personnalisé'}
                                </Badge>
                                {vaccination.vaccinationCategory === 'reminder' && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    Rappel
                                  </Badge>
                                )}
                                {editingVaccinationStatus === vaccination.id ? (
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={vaccination.status}
                                      onValueChange={(value: 'completed' | 'scheduled' | 'overdue' | 'missed') => 
                                        handleStatusChange(vaccination.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="completed">Terminée</SelectItem>
                                        <SelectItem value="scheduled">Planifiée</SelectItem>
                                        <SelectItem value="overdue">En retard</SelectItem>
                                        <SelectItem value="missed">Manquée</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingVaccinationStatus(null)}
                                    >
                                      Annuler
                                    </Button>
                                  </div>
                                ) : (
                                <Badge 
                                  className={
                                      vaccination.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200 cursor-pointer hover:bg-green-200' :
                                      vaccination.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200 cursor-pointer hover:bg-red-200' :
                                      vaccination.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200' :
                                      'bg-orange-100 text-orange-800 border-orange-200 cursor-pointer hover:bg-orange-200'
                                    }
                                    onClick={() => setEditingVaccinationStatus(vaccination.id)}
                                >
                                  {vaccination.status === 'completed' ? 'Terminée' :
                                   vaccination.status === 'overdue' ? 'En retard' :
                                   vaccination.status === 'scheduled' ? 'Planifiée' : 'Manquée'}
                                </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">
                                    {vaccination.vaccinationCategory === 'reminder' ? 'Date du rappel' : 'Date administrée'}
                                  </p>
                                  <p className="font-medium">{formatDate(vaccination.dateGiven)}</p>
                                </div>
                                {vaccination.vaccinationCategory === 'new' && (
                                <div>
                                  <p className="text-gray-600">Rappel prévu</p>
                                  <p className="font-medium">{formatDate(vaccination.nextDueDate)}</p>
                                </div>
                                )}
                                {vaccination.vaccinationCategory === 'reminder' && vaccination.originalVaccinationId && (
                                  <div>
                                    <p className="text-gray-600">Vaccination originale</p>
                                    <p className="font-medium text-sm text-gray-500">ID: {vaccination.originalVaccinationId}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-600">Vétérinaire</p>
                                  <p className="font-medium">{vaccination.veterinarian}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Coût</p>
                                  <p className="font-medium">
                                    {vaccination.cost ? `${vaccination.cost} €` : 'Non spécifié'}
                                  </p>
                                </div>
                              </div>

                              {vaccination.batchNumber && (
                                <div className="mt-3 text-sm">
                                  <p className="text-gray-600">Numéro de lot: <span className="font-medium">{vaccination.batchNumber}</span></p>
                                </div>
                              )}

                              {vaccination.manufacturer && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">Fabricant: <span className="font-medium">{vaccination.manufacturer}</span></p>
                                </div>
                              )}

                              {vaccination.location && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">Site d'injection: <span className="font-medium">
                                    {vaccination.location === 'left_shoulder' ? 'Épaule gauche' :
                                     vaccination.location === 'right_shoulder' ? 'Épaule droite' :
                                     vaccination.location === 'left_hip' ? 'Hanche gauche' :
                                     vaccination.location === 'right_hip' ? 'Hanche droite' :
                                     'Sous-cutané'}
                                  </span></p>
                                </div>
                              )}

                              {vaccination.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Notes:</strong> {vaccination.notes}
                                  </p>
                                </div>
                              )}

                              {vaccination.adverseReactions && (
                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm text-red-700">
                                    <strong>⚠️ Réactions adverses:</strong> {vaccination.adverseReactions}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <CertificateVaccinationPrintDynamic animalId={pet.id.toString()} />
                              {vaccination.nextDueDate && new Date(vaccination.nextDueDate) <= new Date() && vaccination.status !== 'completed' && !vaccination.reminderAppointmentId && (
                                <Button 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => handleVaccinationReminder(vaccination)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Rappel
                                </Button>
                              )}
                              {vaccination.reminderAppointmentId && (
                                <Badge variant="outline" className="text-xs">
                                  Rappel programmé
                                </Badge>
                              )}
                              {vaccination.status === 'overdue' && (
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleConfirmReminder(vaccination)}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                  Confirmer
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Historique des rappels */}
                          {vaccination.reminderHistory && vaccination.reminderHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="text-sm font-medium text-muted-foreground mb-2">Historique des rappels</h5>
                              <div className="space-y-2">
                                {vaccination.reminderHistory.map((reminder) => (
                                  <div key={reminder.id} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(reminder.scheduledDate).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <Badge 
                                      variant={reminder.status === 'completed' ? 'default' : 
                                              reminder.status === 'missed' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {reminder.status === 'completed' ? 'Complété' :
                                       reminder.status === 'missed' ? 'Manqué' :
                                       reminder.status === 'cancelled' ? 'Annulé' : 'Programmé'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="antiparasites" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historique antiparasitaire</h3>
                <NewAntiparasiticModalDynamic selectedClientId={owner?.id} selectedPetId={pet.id}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau Traitement
                  </Button>
                </NewAntiparasiticModalDynamic>
              </div>
              {sortedAntiparasitics.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucun traitement antiparasitaire enregistré</p>
                    <p className="text-sm">Ajoutez des traitements depuis l'onglet Antiparasitaires</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Statistiques antiparasitaires */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Bug className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-xl font-bold">{sortedAntiparasitics.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Complétés</p>
                            <p className="text-xl font-bold">
                              {sortedAntiparasitics.filter(a => a.status === 'completed').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">En retard</p>
                            <p className="text-xl font-bold">
                              {sortedAntiparasitics.filter(a => a.status === 'overdue').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Planifiés</p>
                            <p className="text-xl font-bold">
                              {sortedAntiparasitics.filter(a => a.status === 'scheduled').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Liste des traitements */}
                  <div className="space-y-3">
                  {sortedAntiparasitics.map((treatment) => (
                    <Card key={treatment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Bug className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">{treatment.productName}</h4>
                                <Badge 
                                  className={
                                    treatment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                    treatment.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                                    treatment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-orange-100 text-orange-800 border-orange-200'
                                  }
                                >
                                  {treatment.status === 'completed' ? 'Terminé' :
                                   treatment.status === 'overdue' ? 'En retard' :
                                   treatment.status === 'scheduled' ? 'Planifié' : 'Manqué'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Date administrée</p>
                                  <p className="font-medium">{new Date(treatment.dateGiven).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Prochain traitement</p>
                                  <p className="font-medium">{treatment.nextDueDate ? new Date(treatment.nextDueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Type</p>
                                  <p className="font-medium">{treatment.productType}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Vétérinaire</p>
                                  <p className="font-medium">{treatment.veterinarian}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <p className="text-gray-600">Parasites ciblés</p>
                                  <p className="font-medium">{treatment.targetParasites}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Dosage</p>
                                  <p className="font-medium">{treatment.dosage || 'Non spécifié'}</p>
                                </div>
                              </div>

                              {treatment.batchNumber && (
                                <div className="mt-3 text-sm">
                                  <p className="text-gray-600">Numéro de lot: <span className="font-medium">{treatment.batchNumber}</span></p>
                                </div>
                              )}

                              {treatment.manufacturer && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">Fabricant: <span className="font-medium">{treatment.manufacturer}</span></p>
                                </div>
                              )}

                              {treatment.weight && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">Poids de l'animal: <span className="font-medium">{treatment.weight}</span></p>
                                </div>
                              )}

                              {treatment.cost && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">Coût: <span className="font-medium">{treatment.cost} €</span></p>
                                </div>
                              )}

                              {treatment.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Notes:</strong> {treatment.notes}
                                  </p>
                                </div>
                              )}

                              {treatment.sideEffects && (
                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm text-red-700">
                                    <strong>⚠️ Effets indésirables:</strong> {treatment.sideEffects}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {treatment.nextDueDate && new Date(treatment.nextDueDate) <= new Date() && treatment.status !== 'completed' && (
                                <Button size="sm" className="gap-2">
                                  <Plus className="h-4 w-4" />
                                  Rappel
                                </Button>
                              )}
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pedigree" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pedigree Officiel</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingPedigree(!editingPedigree)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingPedigree ? 'Annuler' : 'Modifier'}
                </Button>
              </div>

              {/* Checkbox pour activer/désactiver le pedigree */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Checkbox 
                      id="hasPedigree"
                      checked={pedigreeData.hasPedigree}
                      onCheckedChange={(checked) => 
                        setPedigreeData(prev => ({ ...prev, hasPedigree: checked as boolean }))
                      }
                      disabled={!editingPedigree}
                    />
                    <Label htmlFor="hasPedigree" className="text-lg">Cet animal a un pedigree officiel</Label>
                  </CardTitle>
                </CardHeader>
              </Card>

              {pedigreeData.hasPedigree && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Informations sur l'animal */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informations sur l'animal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="officialName">Nom officiel</Label>
                            <Input
                              id="officialName"
                              value={pedigreeData.officialName}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, officialName: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder="Nom officiel du pedigree"
                            />
                          </div>
                          <div>
                            <Label htmlFor="pedigreeNumber">N° pedigree/LOF</Label>
                            <Input
                              id="pedigreeNumber"
                              value={pedigreeData.pedigreeNumber}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, pedigreeNumber: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder="Numéro de pedigree"
                            />
                          </div>
                          <div>
                            <Label htmlFor="breeder">Éleveur</Label>
                            <Input
                              id="breeder"
                              value={pedigreeData.breeder}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, breeder: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder="Nom de l'éleveur"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Parents */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Parents</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Père</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="Nom du père"
                                value={pedigreeData.fatherName}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherName: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder="N° pedigree du père"
                                value={pedigreeData.fatherPedigree}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherPedigree: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder="Race du père"
                                value={pedigreeData.fatherBreed}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherBreed: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Textarea
                                placeholder="Titres du père"
                                value={pedigreeData.fatherTitles}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherTitles: e.target.value }))}
                                disabled={!editingPedigree}
                                rows={2}
                              />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Mère</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="Nom de la mère"
                                value={pedigreeData.motherName}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherName: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder="N° pedigree de la mère"
                                value={pedigreeData.motherPedigree}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherPedigree: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder="Race de la mère"
                                value={pedigreeData.motherBreed}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherBreed: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Textarea
                                placeholder="Titres de la mère"
                                value={pedigreeData.motherTitles}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherTitles: e.target.value }))}
                                disabled={!editingPedigree}
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Upload du document pedigree */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Document officiel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setPedigreeData(prev => ({ ...prev, pedigreePhoto: reader.result as string }));
                            reader.readAsDataURL(file);
                          }}
                          disabled={!editingPedigree}
                        />
                        {pedigreeData.pedigreePhoto && (
                          <img src={pedigreeData.pedigreePhoto} alt="Document pedigree" className="h-48 w-auto object-contain rounded border" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Boutons de sauvegarde */}
                  {editingPedigree && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handlePedigreeCancel}>
                        Annuler
                      </Button>
                      <Button onClick={handlePedigreeSave}>
                        Sauvegarder
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!pedigreeData.hasPedigree && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucun pedigree officiel</p>
                    <p className="text-sm">Cochez la case ci-dessus pour ajouter les informations du pedigree</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <h3 className="text-lg font-semibold">Alertes et rappels</h3>
              
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucune alerte active</p>
                    <p className="text-sm">Tout va bien !</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <Card key={index} className={alert.type === 'danger' ? 'border-destructive' : 'border-accent'}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className={`h-5 w-5 ${alert.type === 'danger' ? 'text-destructive' : 'text-accent'}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            {alert.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
            <Button onClick={handlePrintDossier} className="gap-2">
              <Printer className="h-4 w-4" />
            Imprimer Dossier
          </Button>
        </div>
      </DialogContent>
    </Dialog>

      <NewConsultationModal 
        open={showNewConsultation} 
        onOpenChange={setShowNewConsultation} 
      />
      <NewAppointmentModal 
        open={showNewAppointment} 
        onOpenChange={(open) => {
          setShowNewAppointment(open);
          if (!open) {
            setAlertPrefill({ clientId: 0, petId: 0, type: '' as any, reason: '' });
            setSelectedVaccinationForReminder(null);
          }
        }}
        prefillClientId={alertPrefill.clientId.toString()}
        prefillPetId={alertPrefill.petId.toString()}
        prefillType={alertPrefill.type}
        prefillReason={alertPrefill.reason}
        originalVaccinationId={selectedVaccinationForReminder?.id} // Pass vaccination ID for reminder
      />
      {showNewVaccination && (
        <NewVaccinationModal 
          selectedClientId={owner?.id}
          selectedPetId={pet.id}
        >
          <Button onClick={() => setShowNewVaccination(false)}>Fermer</Button>
        </NewVaccinationModal>
      )}
      
      <ConfirmVaccinationReminderModal
        open={showConfirmReminder}
        onOpenChange={(open) => {
          setShowConfirmReminder(open);
          if (!open) {
            setSelectedVaccinationForConfirmation(null);
          }
        }}
        vaccination={selectedVaccinationForConfirmation}
      />
      {showNewAntiparasitic && (
        <NewAntiparasiticModalDynamic 
          selectedClientId={owner?.id}
          selectedPetId={pet.id}
        >
          <Button onClick={() => setShowNewAntiparasitic(false)}>Fermer</Button>
        </NewAntiparasiticModalDynamic>
      )}

    </>
  );
}