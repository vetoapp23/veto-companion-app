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
import { calculateAge, escapeHtml, formatDate, roundTemperature, formatTemperature, formatTemperatureValue, safePrintUrl } from "@/lib/utils";
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
import { useTranslation } from "react-i18next";
import { getBcp47Locale } from "@/i18n/useAppLocale";

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
  const { t, i18n } = useTranslation("medical");
  const { t: tc } = useTranslation("common");

  const vaccStatusLabel = (status: string) => {
    if (status === "completed") return t("petDossier.status.completedF");
    if (status === "scheduled") return t("petDossier.status.scheduledF");
    if (status === "overdue") return t("petDossier.status.overdue");
    return t("petDossier.status.missedF");
  };

  const antiStatusLabel = (status: string) => {
    if (status === "completed") return t("petDossier.status.completedM");
    if (status === "scheduled") return t("petDossier.status.scheduledM");
    if (status === "overdue") return t("petDossier.status.overdue");
    return t("petDossier.status.missedM");
  };

  const vaccineTypeLabel = (type?: string) => {
    if (type === "core") return t("petDossier.vaccineType.core");
    if (type === "non-core") return t("petDossier.vaccineType.nonCore");
    if (type === "rabies") return t("petDossier.vaccineType.rabies");
    return t("petDossier.vaccineType.custom");
  };

  const injectionSiteLabel = (loc?: string) => {
    if (loc === "left_shoulder") return t("petDossier.location.left_shoulder");
    if (loc === "right_shoulder") return t("petDossier.location.right_shoulder");
    if (loc === "left_hip") return t("petDossier.location.left_hip");
    if (loc === "right_hip") return t("petDossier.location.right_hip");
    return t("petDossier.location.subcutaneous");
  };

  const reminderStatusLabel = (status?: string) => {
    if (status === "completed") return t("petDossier.status.reminderCompleted");
    if (status === "missed") return t("petDossier.status.reminderMissed");
    if (status === "cancelled") return t("petDossier.status.reminderCancelled");
    return t("petDossier.status.reminderScheduled");
  };

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
      reason: t("petDossier.reason.vaccReminder", { name: vaccination.vaccineName })
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
    
    toast({
      title: t("petDossier.statusUpdatedTitle"),
      description: t("petDossier.statusUpdatedDesc", { status: vaccStatusLabel(newStatus) }),
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
      date: new Date(c.date).toLocaleDateString(getBcp47Locale(i18n.language), { day: '2-digit', month: '2-digit' }),
      weight: c.weight ? parseFloat(c.weight) : 0,
      temperature: c.temperature ? roundTemperature(c.temperature) ?? 0 : 0
    }))
    .reverse(); // Plus anciennes en premier pour le graphique

  // Calculer les statistiques
  const weightHistory = sortedConsultations.filter(c => c.weight).map(c => parseFloat(c.weight));
  const temperatureHistory = sortedConsultations
    .filter(c => c.temperature)
    .map(c => roundTemperature(c.temperature) ?? 0);
  
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

  const alerts = [];
  
  if (lastConsultation) {
    const monthsSinceLastVisit = (new Date().getTime() - new Date(lastConsultation.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceLastVisit > 6) {
      alerts.push({
        type: 'warning',
        title: t("petDossier.alerts.routineTitle"),
        message: t("petDossier.alerts.routineMessage", { months: Math.floor(monthsSinceLastVisit) }),
        action: t("petDossier.alerts.scheduleConsultation"),
        actionType: 'consultation'
      });
    }
  }

  if (currentTemperature > 39.5 || currentTemperature < 37.5) {
    alerts.push({
      type: 'danger',
      title: t("petDossier.alerts.abnormalTempTitle"),
      message: t("petDossier.alerts.abnormalTempMessage", { temp: formatTemperature(currentTemperature) }),
      action: t("petDossier.alerts.urgentCheck"),
      actionType: 'consultation'
    });
  }

  if (weightChange < -2) {
    alerts.push({
      type: 'warning',
      title: t("petDossier.alerts.weightLossTitle"),
      message: t("petDossier.alerts.weightLossMessage", { kg: Math.abs(weightChange) }),
      action: t("petDossier.alerts.monitor"),
      actionType: 'consultation'
    });
  }

  const today = new Date();
  
  petVaccinations.forEach(vaccination => {
    if (vaccination.nextDueDate) {
      const dueDate = new Date(vaccination.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        alerts.push({
          type: 'danger',
          title: t("petDossier.alerts.vaccOverdueTitle"),
          message: t("petDossier.alerts.daysOverdue", { name: vaccination.vaccineName, days: Math.abs(daysUntilDue) }),
          action: t("petDossier.alerts.scheduleVaccination"),
          actionType: 'vaccination'
        });
      } else if (daysUntilDue <= 7) {
        alerts.push({
          type: 'warning',
          title: t("petDossier.alerts.vaccDueSoonTitle"),
          message: t("petDossier.alerts.daysUntil", { name: vaccination.vaccineName, days: daysUntilDue }),
          action: t("petDossier.alerts.scheduleVaccination"),
          actionType: 'vaccination'
        });
      }
    }
  });

  petAntiparasitics.forEach(antiparasitic => {
    if (antiparasitic.nextDueDate) {
      const dueDate = new Date(antiparasitic.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        alerts.push({
          type: 'danger',
          title: t("petDossier.alerts.antiOverdueTitle"),
          message: t("petDossier.alerts.daysOverdue", { name: antiparasitic.productName, days: Math.abs(daysUntilDue) }),
          action: t("petDossier.alerts.scheduleTreatment"),
          actionType: 'antiparasitic'
        });
      } else if (daysUntilDue <= 7) {
        alerts.push({
          type: 'warning',
          title: t("petDossier.alerts.antiDueSoonTitle"),
          message: t("petDossier.alerts.daysUntil", { name: antiparasitic.productName, days: daysUntilDue }),
          action: t("petDossier.alerts.scheduleTreatment"),
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
      reason: t("petDossier.reason.newConsultation")
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
        reason = t("petDossier.reason.routineCheck");
        break;
      case 'vaccination':
        appointmentType = 'vaccination';
        reason = t("petDossier.reason.vaccinationDue");
        break;
      case 'antiparasitic':
        appointmentType = 'controle';
        reason = t("petDossier.reason.antiparasiticDue");
        break;
      default:
        appointmentType = 'consultation';
        reason = t("petDossier.reason.medicalAppointment");
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

    const e = escapeHtml;
    const u = safePrintUrl;
    const sexLabel = pet.gender === 'male' ? tc("male") : pet.gender === 'female' ? tc("female") : tc("notSpecified");
    const notSpec = tc("notSpecified");
    const notProvided = t("print.legacyDossier.notProvided");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${e(t("print.legacyDossier.docTitle", { name: pet.name }))}</title>
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
            <div class="clinic-name">${e("VetoCrm")}</div>
            <h2>${e(t("print.legacyDossier.fullTitle"))}</h2>
            <p><strong>${e(t("print.legacyDossier.animal"))}</strong> ${e(pet.name)} | <strong>${e(t("print.legacyDossier.generatedOn"))}</strong> ${e(new Date().toLocaleDateString(getBcp47Locale(i18n.language)))} ${e(new Date().toLocaleTimeString(getBcp47Locale(i18n.language)))}</p>
          </div>

          <div class="pet-info">
            <div class="info-section">
              <h3>${e(t("print.legacyDossier.animalInfo"))}</h3>
              <p><strong>${e(t("print.legacyDossier.name"))}</strong> ${e(pet.name)}</p>
              <p><strong>${e(t("print.legacyDossier.species"))}</strong> ${e(pet.type)}</p>
              <p><strong>${e(t("print.legacyDossier.breed"))}</strong> ${e(pet.breed || notSpec)}</p>
              <p><strong>${e(t("print.legacyDossier.sex"))}</strong> ${e(sexLabel)}</p>
              <p><strong>${e(t("print.legacyDossier.age"))}</strong> ${e(pet.birthDate ? calculateAge(pet.birthDate) : notSpec)}</p>
              <p><strong>${e(t("print.legacyDossier.currentWeight"))}</strong> ${e(currentWeight)}kg</p>
              <p><strong>${e(t("print.legacyDossier.currentTemp"))}</strong> ${e(formatTemperature(currentTemperature))}</p>
              <p><strong>${e(t("print.legacyDossier.color"))}</strong> ${e(pet.color || notSpec)}</p>
              <p><strong>${e(t("print.legacyDossier.microchip"))}</strong> ${e(pet.microchip || notSpec)}</p>
              ${pet.medicalNotes ? `<p><strong>${e(t("print.legacyDossier.medicalNotes"))}</strong> ${e(pet.medicalNotes)}</p>` : ''}
            </div>
            <div class="info-section">
              <h3>${e(t("print.legacyDossier.owner"))}</h3>
              <p><strong>${e(t("print.legacyDossier.name"))}</strong> ${e(owner?.name || notSpec)}</p>
              <p><strong>${e(t("print.legacyDossier.email"))}</strong> ${e(owner?.email || notSpec)}</p>
              <p><strong>${e(t("print.legacyDossier.phone"))}</strong> ${e(owner?.phone || notSpec)}</p>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${e(sortedConsultations.length)}</div>
              <div class="stat-label">${e(t("print.legacyDossier.kpiConsult"))}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${e(petVaccinations.length)}</div>
              <div class="stat-label">${e(t("print.legacyDossier.kpiVacc"))}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${e(petAntiparasitics.length)}</div>
              <div class="stat-label">${e(t("print.legacyDossier.kpiAnti"))}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${e(currentWeight)}kg</div>
              <div class="stat-label">${e(t("print.legacyDossier.kpiWeight"))}</div>
            </div>
          </div>

          <!-- Photo principale de l'animal -->
          ${pet.photo ? `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${u(pet.photo)}" alt="${e(pet.name)}" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;" />
              <p style="margin-top: 10px; font-weight: bold;">${e(t("print.legacyDossier.photoOf", { name: pet.name }))}</p>
            </div>
          ` : ''}

          <!-- Historique des Consultations -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">${e(t("print.legacyDossier.consultHistory", { count: sortedConsultations.length }))}</h3>
            ${sortedConsultations.length > 0 ? sortedConsultations.map(c => `
              <div style="margin: 15px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f9f9f9;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${e(t("print.legacyDossier.consultOf", { date: new Date(c.date).toLocaleDateString(getBcp47Locale(i18n.language)) }))}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p><strong>${e(t("print.legacyDossier.weight"))}</strong> ${e(c.weight || notProvided)}</p>
                    <p><strong>${e(t("print.legacyDossier.temperature"))}</strong> ${e(c.temperature ? formatTemperature(c.temperature) : notProvided)}</p>
                    ${c.symptoms ? `<p><strong>${e(t("print.legacyDossier.symptoms"))}</strong> ${e(c.symptoms)}</p>` : ''}
                  </div>
                  <div>
                    ${c.diagnosis ? `<p><strong>${e(t("print.legacyDossier.diagnosis"))}</strong> ${e(c.diagnosis)}</p>` : ''}
                    ${c.treatment ? `<p><strong>${e(t("print.legacyDossier.treatment"))}</strong> ${e(c.treatment)}</p>` : ''}
                    ${c.medications ? `<p><strong>${e(t("print.legacyDossier.medications"))}</strong> ${e(c.medications)}</p>` : ''}
                  </div>
                </div>
                ${c.notes ? `<p><strong>${e(t("print.legacyDossier.notes"))}</strong> ${e(c.notes)}</p>` : ''}
                ${c.photos && c.photos.length > 0 ? `
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 15px 0;">
                    ${c.photos.map((photo, idx) => `
                      <div style="text-align: center;">
                        <img src="${u(photo)}" alt="${e(t("print.legacyDossier.consultPhotoAlt", { n: idx + 1 }))}" style="max-width: 120px; max-height: 120px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                        <div style="font-size: 11px; color: #666; margin-top: 5px;">${e(t("print.legacyDossier.photoN", { n: idx + 1 }))}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('') : `<p style="text-align: center; color: #666; font-style: italic;">${e(t("print.legacyDossier.noConsultations"))}</p>`}
          </div>

          <!-- Historique des Vaccinations -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">${e(t("print.legacyDossier.vaccHistory", { count: petVaccinations.length }))}</h3>
            ${petVaccinations.length > 0 ? petVaccinations.map(v => `
              <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #4CAF50; background: #f0f8f0;">
                <h4 style="margin: 0 0 10px 0;">${e(v.vaccineName)} - ${e(new Date(v.dateGiven).toLocaleDateString(getBcp47Locale(i18n.language)))}</h4>
                <p><strong>${e(t("print.legacyDossier.type"))}</strong> ${e(v.vaccineType || notSpec)}</p>
                <p><strong>${e(t("print.legacyDossier.nextBooster"))}</strong> ${e(v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString(getBcp47Locale(i18n.language)) : notSpec)}</p>
                <p><strong>${e(t("print.legacyDossier.veterinarian"))}</strong> ${e(v.veterinarian || notSpec)}</p>
                ${v.notes ? `<p><strong>${e(t("print.legacyDossier.notes"))}</strong> ${e(v.notes)}</p>` : ''}
              </div>
            `).join('') : `<p style="text-align: center; color: #666; font-style: italic;">${e(t("print.legacyDossier.noVaccinations"))}</p>`}
          </div>

          <!-- Historique des Antiparasitaires -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">${e(t("print.legacyDossier.antiHistory", { count: petAntiparasitics.length }))}</h3>
            ${petAntiparasitics.length > 0 ? petAntiparasitics.map(a => `
              <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #9C27B0; background: #f3e5f5; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #7B1FA2;">${e(a.productName)} - ${e(new Date(a.dateGiven).toLocaleDateString(getBcp47Locale(i18n.language)))}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0;">
                  <div>
                    <p><strong>${e(t("print.legacyDossier.productType"))}</strong> ${e(a.productType || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.parasites"))}</strong> ${e(a.targetParasites || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.route"))}</strong> ${e(a.administrationRoute || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.dosage"))}</strong> ${e(a.dosage || notSpec)}</p>
                  </div>
                  <div>
                <p><strong>${e(t("print.legacyDossier.nextTreatment"))}</strong> ${e(a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString(getBcp47Locale(i18n.language)) : notSpec)}</p>
                <p><strong>${e(t("print.legacyDossier.veterinarian"))}</strong> ${e(a.veterinarian || notSpec)}</p>
                    <p><strong>${e(tc("status"))}:</strong> ${e(a.status === 'completed' ? t("print.legacyDossier.statusCompleted") : a.status === 'scheduled' ? t("print.legacyDossier.statusPlanned") : a.status === 'overdue' ? t("print.legacyDossier.statusOverdue") : t("print.legacyDossier.statusMissed"))}</p>
                    ${a.cost ? `<p><strong>${e(t("print.legacyDossier.cost"))}</strong> ${e(a.cost)} €</p>` : ''}
                  </div>
                </div>
                ${a.batchNumber ? `<p><strong>${e(t("print.legacyDossier.batchNumber"))}</strong> ${e(a.batchNumber)}</p>` : ''}
                ${a.manufacturer ? `<p><strong>${e(t("print.legacyDossier.manufacturer"))}</strong> ${e(a.manufacturer)}</p>` : ''}
                ${a.weight ? `<p><strong>${e(t("print.legacyDossier.animalWeight"))}</strong> ${e(a.weight)}</p>` : ''}
                ${a.notes ? `
                  <div style="margin: 10px 0; padding: 10px; background: rgba(156, 39, 176, 0.1); border-radius: 3px;">
                    <p><strong>${e(t("print.legacyDossier.notes"))}</strong> ${e(a.notes)}</p>
                  </div>
                ` : ''}
                ${a.sideEffects ? `
                  <div style="margin: 10px 0; padding: 10px; background: #ffebee; border: 1px solid #f44336; border-radius: 3px;">
                    <p style="color: #d32f2f;"><strong>⚠️ ${e(t("print.legacyDossier.sideEffects"))}</strong> ${e(a.sideEffects)}</p>
                  </div>
                ` : ''}
              </div>
            `).join('') : `<p style="text-align: center; color: #666; font-style: italic;">${e(t("print.legacyDossier.noTreatments"))}</p>`}
          </div>

          <!-- Section Pedigree -->
          ${pet.hasPedigree ? `
            <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">${e(t("print.legacyDossier.officialPedigree"))}</h3>
              
              <!-- Informations de l'animal -->
              <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${e(t("print.legacyDossier.animalDetails"))}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>
                    <p><strong>${e(t("print.legacyDossier.officialName"))}</strong> ${e(pet.officialName || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.pedigreeLof"))}</strong> ${e(pet.pedigreeNumber || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.chipTattoo"))}</strong> ${e(pet.microchip || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.breed"))}</strong> ${e(pet.breed || notSpec)}</p>
                  </div>
                  <div>
                    <p><strong>${e(t("print.legacyDossier.sex"))}</strong> ${e(sexLabel)}</p>
                    <p><strong>${e(t("print.legacyDossier.coatColor"))}</strong> ${e(pet.color || notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.birthDate"))}</strong> ${e(pet.birthDate ? new Date(pet.birthDate).toLocaleDateString(getBcp47Locale(i18n.language)) : notSpec)}</p>
                    <p><strong>${e(t("print.legacyDossier.breeder"))}</strong> ${e(pet.breeder || notSpec)}</p>
                  </div>
                </div>
              </div>

              <!-- Parents -->
              <div style="margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${e(t("print.legacyDossier.ancestry"))}</h4>
                
                <!-- Père -->
                <div style="margin: 15px 0; padding: 15px; border-left: 3px solid #007bff; background: #f0f8ff;">
                  <h5 style="margin: 0 0 8px 0; color: #007bff;">${e(t("print.legacyDossier.father"))}</h5>
                  <p><strong>${e(t("print.legacyDossier.name"))}</strong> ${e(pet.fatherName || notSpec)}</p>
                  <p><strong>${e(t("print.legacyDossier.pedigreeLof"))}</strong> ${e(pet.fatherPedigree || notSpec)}</p>
                  <p><strong>${e(t("print.legacyDossier.breed"))}</strong> ${e(pet.fatherBreed || notSpec)}</p>
                  ${pet.fatherTitles ? `<p><strong>${e(t("print.legacyDossier.titles"))}</strong> ${e(pet.fatherTitles)}</p>` : ''}
                </div>

                <!-- Mère -->
                <div style="margin: 15px 0; padding: 15px; border-left: 3px solid #e91e63; background: #fce4ec;">
                  <h5 style="margin: 0 0 8px 0; color: #e91e63;">${e(t("print.legacyDossier.mother"))}</h5>
                  <p><strong>${e(t("print.legacyDossier.name"))}</strong> ${e(pet.motherName || notSpec)}</p>
                  <p><strong>${e(t("print.legacyDossier.pedigreeLof"))}</strong> ${e(pet.motherPedigree || notSpec)}</p>
                  <p><strong>${e(t("print.legacyDossier.breed"))}</strong> ${e(pet.motherBreed || notSpec)}</p>
                  ${pet.motherTitles ? `<p><strong>${e(t("print.legacyDossier.titles"))}</strong> ${e(pet.motherTitles)}</p>` : ''}
                </div>
              </div>

              <!-- Certificat Pedigree -->
              ${pet.pedigreePhoto ? `
                <div style="margin: 20px 0; text-align: center;">
                  <h4 style="margin: 0 0 15px 0; color: #333;">${e(t("print.legacyDossier.pedigreeCert"))}</h4>
                  <img src="${u(pet.pedigreePhoto)}" alt="${e(t("print.legacyDossier.pedigreeCert"))}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px; border: 2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                  <p style="margin-top: 10px; font-size: 12px; color: #666;">${e(t("print.legacyDossier.pedigreeOfficialDoc"))}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Album Photo -->
          <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">${e(t("print.legacyDossier.photoAlbum"))}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0;">
              ${pet.photo ? `
                <div style="text-align: center;">
                  <img src="${u(pet.photo)}" alt="${e(t("print.legacyDossier.mainPhoto"))}" style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                  <div style="font-size: 11px; color: #666; margin-top: 5px;">${e(t("print.legacyDossier.mainPhoto"))}</div>
                </div>
              ` : ''}
              ${sortedConsultations.some(c => c.photos && c.photos.length > 0) ? 
                sortedConsultations.map(c => 
                  c.photos ? c.photos.map((photo, idx) => `
                    <div style="text-align: center;">
                      <img src="${u(photo)}" alt="${e(t("print.legacyDossier.consultPhoto", { date: new Date(c.date).toLocaleDateString(getBcp47Locale(i18n.language)) }))} - ${e(t("print.legacyDossier.photoN", { n: idx + 1 }))}" style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                      <div style="font-size: 11px; color: #666; margin-top: 5px;">${e(t("print.legacyDossier.consultPhoto", { date: new Date(c.date).toLocaleDateString(getBcp47Locale(i18n.language)) }))}</div>
                    </div>
                  `).join('') : ''
                ).join('') : ''
              }
            </div>
            ${!pet.photo && !sortedConsultations.some(c => c.photos && c.photos.length > 0) ? 
              `<p style="text-align: center; color: #666; font-style: italic;">${e(t("print.legacyDossier.noPhotos"))}</p>` : ''
            }
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>${e(t("print.legacyDossier.footerBrand"))}</p>
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
            {t("print.legacyDossier.docTitle", { name: pet.name })}
              {owner && (
                <span className="text-sm text-muted-foreground">
                  ({tc("owner")}: {owner.name})
                </span>
              )}
          </DialogTitle>
        </DialogHeader>
        
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                {t("petDossier.tabOverviewFull")}
              </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              {t("petDossier.tabHistory")}
            </TabsTrigger>
              <TabsTrigger value="prescriptions" className="gap-2">
              <Syringe className="h-4 w-4" />
                {t("petDossier.prescriptions")}
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="gap-2">
              <Syringe className="h-4 w-4" />
              {t("petDossier.vaccinations")}
              </TabsTrigger>
              <TabsTrigger value="antiparasites" className="gap-2">
                <Bug className="h-4 w-4" />
                {t("petDossier.antiparasitics")}
              </TabsTrigger>
              <TabsTrigger value="pedigree" className="gap-2">
                <Award className="h-4 w-4" />
                {t("petDossier.tabPedigree")}
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t("petDossier.tabCharts")}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              {t("petDossier.tabAlerts")}
            </TabsTrigger>
          </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Galerie photos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{t("petDossier.photoGallery")}</CardTitle>
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
                      {t("petDossier.addPhoto")}
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Photo officielle */}
                    {pet.photo && (
                      <div className="relative flex-shrink-0">
                        <img src={pet.photo} alt={t("petDossier.officialPhotoAlt")} className="h-32 w-32 object-cover rounded" />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          {t("petDossier.official")}
                        </div>
                      </div>
                    )}
                    
                    {/* Photos supplémentaires */}
                    {additionalPhotos.map((src, idx) => (
                      <div key={`additional-${idx}`} className="relative flex-shrink-0 group">
                        <img src={src} alt={t("petDossier.additionalPhotoAlt", { n: idx + 1 })} className="h-32 w-32 object-cover rounded" />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          {t("petDossier.photoN", { n: idx + 1 })}
                        </div>
                        {/* Bouton de suppression */}
                        <button
                          onClick={() => handleDeleteAdditionalPhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title={t("petDossier.deletePhoto")}
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
                            {new Date(consultation.date).toLocaleDateString(getBcp47Locale(i18n.language))}
                          </div>
                          {/* Bouton de suppression */}
                          <button
                            onClick={() => handleDeletePhoto(consultation.id, idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title={t("petDossier.deletePhoto")}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                    
                    {/* Message si aucune photo */}
                    {!pet.photo && additionalPhotos.length === 0 && sortedConsultations.every(c => !c.photos || c.photos.length === 0) && (
                      <div className="flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded text-gray-500">
                        {t("petDossier.noPhotosAvailable")}
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
                        <p className="text-sm text-muted-foreground">{t("petDossier.currentWeight")}</p>
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
                        <p className="text-sm text-muted-foreground">{t("petDossier.temperature")}</p>
                        <p className="text-2xl font-bold">{formatTemperature(currentTemperature)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("petDossier.avgTemp", { value: formatTemperatureValue(avgTemperature) ?? '—' })}
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
                        <p className="text-sm text-muted-foreground">{t("petDossier.consultations")}</p>
                        <p className="text-2xl font-bold">{sortedConsultations.length}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("petDossier.lastColon", {
                            date: lastConsultation
                              ? new Date(lastConsultation.date).toLocaleDateString(getBcp47Locale(i18n.language))
                              : t("petDossier.none"),
                          })}
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
                      <p className="text-sm text-muted-foreground">{t("petDossier.tabAlerts")}</p>
                      <p className="text-2xl font-bold">{alerts.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {alerts.length > 0 ? t("petDossier.toTreat") : t("petDossier.none")}
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
                      <p className="text-sm text-muted-foreground">{t("petDossier.prescriptions")}</p>
                      <p className="text-2xl font-bold">{getPrescriptionsByPetId(pet.id).length}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("petDossier.activeCount", { count: getActivePrescriptions().filter(p => p.petId === pet.id).length })}
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
                        <h4 className="font-semibold">{t("petDossier.nextFollowUp")}</h4>
                        <p className="text-sm text-muted-foreground">{nextConsultation.reason}</p>
                      </div>
                      <Button size="sm" onClick={handleNewConsultation}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("petDossier.schedule")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {alerts.length > 0 && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">{t("petDossier.importantAlerts")}</CardTitle>
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
                <h3 className="text-lg font-semibold">{t("petDossier.consultHistoryTitle")}</h3>
                <Button size="sm" onClick={handleNewConsultation} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("petDossier.scheduleConsultationBtn")}
                </Button>
              </div>

              {sortedConsultations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t("petDossier.noConsultationsRecorded")}</p>
                    <p className="text-sm">{t("petDossier.startFirstConsultation")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{t("petDossier.consultationN", { id: consultation.id })}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(consultation.date).toLocaleDateString(getBcp47Locale(i18n.language))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">{t("petDossier.weightLabel")}</span>
                            <span className="ml-2">{consultation.weight || t("petDossier.notProvided")}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t("petDossier.temperatureLabel")}</span>
                            <span className="ml-2">
                              {consultation.temperature
                                ? formatTemperature(consultation.temperature)
                                : t("petDossier.notProvided")}
                            </span>
                          </div>
                        </div>
                        
                        {consultation.symptoms && (
                          <div>
                            <span className="font-medium">{t("petDossier.symptoms")}</span>
                            <p className="text-sm mt-1">{consultation.symptoms}</p>
                          </div>
                        )}
                        
                        {consultation.diagnosis && (
                          <div>
                            <span className="font-medium">{t("petDossier.diagnosis")}</span>
                            <p className="text-sm mt-1">{consultation.diagnosis}</p>
                          </div>
                        )}
                        
                        {consultation.treatment && (
                          <div>
                            <span className="font-medium">{t("petDossier.treatment")}</span>
                            <p className="text-sm mt-1">{consultation.treatment}</p>
                          </div>
                        )}
                        
                        {consultation.medications && (
                          <div>
                            <span className="font-medium">{t("petDossier.medications")}</span>
                            <p className="text-sm mt-1">{consultation.medications}</p>
                          </div>
                        )}
                        
                        {consultation.notes && (
                          <div>
                            <span className="font-medium">{t("petDossier.notes")}</span>
                            <p className="text-sm mt-1 text-muted-foreground">{consultation.notes}</p>
                          </div>
                        )}
                        
                        {consultation.followUp && (
                          <div className="pt-2 border-t">
                            <span className="font-medium text-primary">{t("petDossier.followUpRecommended")}</span>
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
              <h3 className="text-lg font-semibold">{t("petDossier.weightTempEvolution")}</h3>
              
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Weight className="h-5 w-5" />
                        {t("petDossier.weightEvolution")}
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
                        {t("petDossier.tempEvolution")}
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
                    <p>{t("petDossier.noChartData")}</p>
                    <p className="text-sm">{t("petDossier.addWeightTempConsults")}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="vaccinations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("petDossier.vaccHistoryTitle")}</h3>
                <NewVaccinationModal selectedClientId={owner?.id} selectedPetId={pet.id}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("petDossier.newVaccination")}
                  </Button>
                </NewVaccinationModal>
              </div>
              
              {sortedVaccinations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t("petDossier.noVaccinationsRecorded")}</p>
                    <p className="text-sm">{t("petDossier.startFirstVaccination")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{tc("total")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.upToDate")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.overdue")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.scheduledPluralF")}</p>
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
                                    <span className="ml-2 text-sm text-orange-600 font-normal">{t("petDossier.reminderParen")}</span>
                                  )}
                                </h4>
                                <Badge 
                                  variant={vaccination.vaccineType === 'core' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {vaccineTypeLabel(vaccination.vaccineType)}
                                </Badge>
                                {vaccination.vaccinationCategory === 'reminder' && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    {t("petDossier.boosterBadge")}
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
                                        <SelectItem value="completed">{t("petDossier.status.completedF")}</SelectItem>
                                        <SelectItem value="scheduled">{t("petDossier.status.scheduledF")}</SelectItem>
                                        <SelectItem value="overdue">{t("petDossier.status.overdue")}</SelectItem>
                                        <SelectItem value="missed">{t("petDossier.status.missedF")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingVaccinationStatus(null)}
                                    >
                                      {tc("cancel")}
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
                                  {vaccStatusLabel(vaccination.status)}
                                </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">
                                    {vaccination.vaccinationCategory === 'reminder' ? t("petDossier.dateReminder") : t("petDossier.dateAdministered")}
                                  </p>
                                  <p className="font-medium">{formatDate(vaccination.dateGiven)}</p>
                                </div>
                                {vaccination.vaccinationCategory === 'new' && (
                                <div>
                                  <p className="text-gray-600">{t("petDossier.nextBooster")}</p>
                                  <p className="font-medium">{formatDate(vaccination.nextDueDate)}</p>
                                </div>
                                )}
                                {vaccination.vaccinationCategory === 'reminder' && vaccination.originalVaccinationId && (
                                  <div>
                                    <p className="text-gray-600">{t("petDossier.originalVaccination")}</p>
                                    <p className="font-medium text-sm text-gray-500">ID: {vaccination.originalVaccinationId}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-600">{t("petDossier.veterinarian")}</p>
                                  <p className="font-medium">{vaccination.veterinarian}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">{t("petDossier.cost")}</p>
                                  <p className="font-medium">
                                    {vaccination.cost ? `${vaccination.cost} €` : t("petDossier.costNotSpecified")}
                                  </p>
                                </div>
                              </div>

                              {vaccination.batchNumber && (
                                <div className="mt-3 text-sm">
                                  <p className="text-gray-600">{t("petDossier.batchNumber")} <span className="font-medium">{vaccination.batchNumber}</span></p>
                                </div>
                              )}

                              {vaccination.manufacturer && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">{t("petDossier.manufacturer")} <span className="font-medium">{vaccination.manufacturer}</span></p>
                                </div>
                              )}

                              {vaccination.location && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">{t("petDossier.injectionSite")} <span className="font-medium">
                                    {injectionSiteLabel(vaccination.location)}
                                  </span></p>
                                </div>
                              )}

                              {vaccination.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>{t("petDossier.notes")}</strong> {vaccination.notes}
                                  </p>
                                </div>
                              )}

                              {vaccination.adverseReactions && (
                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm text-red-700">
                                    <strong>{t("petDossier.adverseReactions")}</strong> {vaccination.adverseReactions}
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
                                  {t("petDossier.reminder")}
                                </Button>
                              )}
                              {vaccination.reminderAppointmentId && (
                                <Badge variant="outline" className="text-xs">
                                  {t("petDossier.reminderScheduled")}
                                </Badge>
                              )}
                              {vaccination.status === 'overdue' && (
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleConfirmReminder(vaccination)}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                  {t("petDossier.confirm")}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Historique des rappels */}
                          {vaccination.reminderHistory && vaccination.reminderHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="text-sm font-medium text-muted-foreground mb-2">{t("petDossier.reminderHistory")}</h5>
                              <div className="space-y-2">
                                {vaccination.reminderHistory.map((reminder) => (
                                  <div key={reminder.id} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(reminder.scheduledDate).toLocaleDateString(getBcp47Locale(i18n.language))}</span>
                                    </div>
                                    <Badge 
                                      variant={reminder.status === 'completed' ? 'default' : 
                                              reminder.status === 'missed' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {reminderStatusLabel(reminder.status)}
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
                <h3 className="text-lg font-semibold">{t("petDossier.antiHistoryTitle")}</h3>
                <NewAntiparasiticModalDynamic selectedClientId={owner?.id} selectedPetId={pet.id}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("petDossier.newTreatment")}
                  </Button>
                </NewAntiparasiticModalDynamic>
              </div>
              {sortedAntiparasitics.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t("petDossier.noAntiRecorded")}</p>
                    <p className="text-sm">{t("petDossier.addFromAntiTab")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{tc("total")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.completedPlural")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.overdue")}</p>
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
                            <p className="text-sm font-medium text-gray-600">{t("petDossier.scheduledPluralM")}</p>
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
                                  {antiStatusLabel(treatment.status)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">{t("petDossier.dateAdministered")}</p>
                                  <p className="font-medium">{new Date(treatment.dateGiven).toLocaleDateString(getBcp47Locale(i18n.language))}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">{t("petDossier.nextTreatment")}</p>
                                  <p className="font-medium">{treatment.nextDueDate ? new Date(treatment.nextDueDate).toLocaleDateString(getBcp47Locale(i18n.language)) : t("petDossier.costNotSpecified")}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">{t("petDossier.productType")}</p>
                                  <p className="font-medium">{treatment.productType}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">{t("petDossier.veterinarian")}</p>
                                  <p className="font-medium">{treatment.veterinarian}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <p className="text-gray-600">{t("petDossier.targetParasites")}</p>
                                  <p className="font-medium">{treatment.targetParasites}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">{t("petDossier.dosage")}</p>
                                  <p className="font-medium">{treatment.dosage || t("petDossier.costNotSpecified")}</p>
                                </div>
                              </div>

                              {treatment.batchNumber && (
                                <div className="mt-3 text-sm">
                                  <p className="text-gray-600">{t("petDossier.batchNumber")} <span className="font-medium">{treatment.batchNumber}</span></p>
                                </div>
                              )}

                              {treatment.manufacturer && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">{t("petDossier.manufacturer")} <span className="font-medium">{treatment.manufacturer}</span></p>
                                </div>
                              )}

                              {treatment.weight && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">{t("petDossier.animalWeight")} <span className="font-medium">{treatment.weight}</span></p>
                                </div>
                              )}

                              {treatment.cost && (
                                <div className="mt-1 text-sm">
                                  <p className="text-gray-600">{t("petDossier.costColon")} <span className="font-medium">{treatment.cost} €</span></p>
                                </div>
                              )}

                              {treatment.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>{t("petDossier.notes")}</strong> {treatment.notes}
                                  </p>
                                </div>
                              )}

                              {treatment.sideEffects && (
                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm text-red-700">
                                    <strong>{t("petDossier.sideEffects")}</strong> {treatment.sideEffects}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {treatment.nextDueDate && new Date(treatment.nextDueDate) <= new Date() && treatment.status !== 'completed' && (
                                <Button size="sm" className="gap-2">
                                  <Plus className="h-4 w-4" />
                                  {t("petDossier.reminder")}
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
                <h3 className="text-lg font-semibold">{t("petDossier.officialPedigreeTitle")}</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingPedigree(!editingPedigree)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingPedigree ? tc("cancel") : tc("edit")}
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
                    <Label htmlFor="hasPedigree" className="text-lg">{t("petDossier.hasOfficialPedigree")}</Label>
                  </CardTitle>
                </CardHeader>
              </Card>

              {pedigreeData.hasPedigree && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Informations sur l'animal */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t("petDossier.animalInfo")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="officialName">{t("petDossier.officialName")}</Label>
                            <Input
                              id="officialName"
                              value={pedigreeData.officialName}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, officialName: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder={t("petDossier.officialNamePlaceholder")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pedigreeNumber">{t("petDossier.pedigreeNumber")}</Label>
                            <Input
                              id="pedigreeNumber"
                              value={pedigreeData.pedigreeNumber}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, pedigreeNumber: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder={t("petDossier.pedigreeNumberPlaceholder")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="breeder">{t("petDossier.breeder")}</Label>
                            <Input
                              id="breeder"
                              value={pedigreeData.breeder}
                              onChange={(e) => setPedigreeData(prev => ({ ...prev, breeder: e.target.value }))}
                              disabled={!editingPedigree}
                              placeholder={t("petDossier.breederPlaceholder")}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Parents */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t("petDossier.parents")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">{t("petDossier.father")}</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder={t("petDossier.fatherNamePh")}
                                value={pedigreeData.fatherName}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherName: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder={t("petDossier.fatherPedigreePh")}
                                value={pedigreeData.fatherPedigree}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherPedigree: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder={t("petDossier.fatherBreedPh")}
                                value={pedigreeData.fatherBreed}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherBreed: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Textarea
                                placeholder={t("petDossier.fatherTitlesPh")}
                                value={pedigreeData.fatherTitles}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, fatherTitles: e.target.value }))}
                                disabled={!editingPedigree}
                                rows={2}
                              />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{t("petDossier.mother")}</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder={t("petDossier.motherNamePh")}
                                value={pedigreeData.motherName}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherName: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder={t("petDossier.motherPedigreePh")}
                                value={pedigreeData.motherPedigree}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherPedigree: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Input
                                placeholder={t("petDossier.motherBreedPh")}
                                value={pedigreeData.motherBreed}
                                onChange={(e) => setPedigreeData(prev => ({ ...prev, motherBreed: e.target.value }))}
                                disabled={!editingPedigree}
                              />
                              <Textarea
                                placeholder={t("petDossier.motherTitlesPh")}
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
                      <CardTitle className="text-lg">{t("petDossier.officialDocument")}</CardTitle>
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
                          <img src={pedigreeData.pedigreePhoto} alt={t("petDossier.pedigreeDocAlt")} className="h-48 w-auto object-contain rounded border" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Boutons de sauvegarde */}
                  {editingPedigree && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handlePedigreeCancel}>
                        {tc("cancel")}
                      </Button>
                      <Button onClick={handlePedigreeSave}>
                        {tc("save")}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!pedigreeData.hasPedigree && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t("petDossier.noOfficialPedigree")}</p>
                    <p className="text-sm">{t("petDossier.checkToAddPedigree")}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <h3 className="text-lg font-semibold">{t("petDossier.alertsAndReminders")}</h3>
              
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t("petDossier.noActiveAlerts")}</p>
                    <p className="text-sm">{t("petDossier.allGood")}</p>
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
            {tc("close")}
          </Button>
            <Button onClick={handlePrintDossier} className="gap-2">
              <Printer className="h-4 w-4" />
            {t("petDossier.printDossier")}
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
          <Button onClick={() => setShowNewVaccination(false)}>{tc("close")}</Button>
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
          <Button onClick={() => setShowNewAntiparasitic(false)}>{tc("close")}</Button>
        </NewAntiparasiticModalDynamic>
      )}

    </>
  );
}