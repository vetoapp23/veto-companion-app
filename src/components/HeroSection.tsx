import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Calendar, Stethoscope, Plus } from "lucide-react";
import heroImage from "@/assets/vet-hero.jpg";
import { useState } from "react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { useClients, useAnimals, useConsultations, useVaccinations, useAntiparasitics } from "@/hooks/useDatabase";
import { useSettings } from "@/contexts/SettingsContext";
import { AdminOnly } from "./RoleGuard";

export function HeroSection() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { settings } = useSettings();
  const vets: any[] = JSON.parse(localStorage.getItem('vetpro-veterinarians') || '[]');
  const clinicName = settings.clinicName?.trim();
  const greeting = vets.length === 1
    ? `Bienvenue ${vets[0].title} ${vets[0].name}`
    : clinicName
      ? `Bienvenue à ${clinicName}`
      : "Bienvenue";
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // Calculer les statistiques en temps réel
  const totalClients = clients.length;
  const totalPets = pets.length;
  const totalVaccinations = vaccinations.length;
  const totalAntiparasitics = antiparasitics.length;
  const today = new Date().toISOString().split('T')[0];
  const consultationsToday = consultations.filter(c => {
    const consultationDate = c.consultation_date.split('T')[0];
    return consultationDate === today;
  }).length;

  const accountingSummary = {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    revenueBreakdown: { consultations: 0, vaccinations: 0, antiparasitics: 0, prescriptions: 0, manualEntries: 0 },
    expenseBreakdown: { stockPurchases: 0, salaries: 0, rent: 0, taxes: 0, other: 0 }
  };

  const stats = [
    { value: totalClients, label: "Clients", color: "text-primary" },
    { value: totalPets, label: "Animaux", color: "text-secondary" },
    { value: consultationsToday, label: "Consult. aujourd'hui", color: "text-accent" },
    { value: totalVaccinations, label: "Vaccinations", color: "text-blue-600" },
    { value: totalAntiparasitics, label: "Antiparasit.", color: "text-purple-600" },
  ];

  return (
    <>
      <div className="relative overflow-hidden gradient-hero rounded-2xl p-4 md:p-8 mb-4 md:mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-8">
          {/* Texte de bienvenue */}
          <div className="flex-1 w-full space-y-3 md:space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 md:h-8 md:w-8 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Gestion Vétérinaire Complète</span>
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold leading-tight">
                {greeting}
              </h1>
              <p className="text-lg md:text-3xl font-bold gradient-primary bg-clip-text text-transparent mt-1">
                Dashboard VetPro
              </p>
            </div>
            <p className="hidden md:block text-base md:text-lg text-muted-foreground max-w-3xl">
              Gérez efficacement vos clients, leurs animaux, les rendez-vous et consultations.
            </p>

            {/* Actions rapides — grille 2 colonnes en mobile */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-1 md:pt-4">
              <Button size="sm" className="gap-1.5 medical-glow col-span-2 sm:col-span-1 sm:size-lg" onClick={() => setShowClientModal(true)}>
                <Users className="h-4 w-4" />Nouveau Client
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 sm:size-lg" onClick={() => setShowPetModal(true)}>
                <Heart className="h-4 w-4" />Animal
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 sm:size-lg" onClick={() => setShowAppointmentModal(true)}>
                <Calendar className="h-4 w-4" />RDV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 sm:size-lg col-span-2 sm:col-span-1" onClick={() => setShowConsultationModal(true)}>
                <Stethoscope className="h-4 w-4" />Consultation
              </Button>
            </div>

            {/* Statistiques — grille compacte en mobile */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-6 pt-3 md:pt-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center bg-background/40 md:bg-transparent rounded-lg p-2 md:p-0">
                  <div className={`text-lg md:text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] md:text-sm text-muted-foreground leading-tight">{s.label}</div>
                </div>
              ))}
              <AdminOnly>
                <div className="text-center bg-background/40 md:bg-transparent rounded-lg p-2 md:p-0 col-span-3 md:col-span-1">
                  <div className="text-lg md:text-2xl font-bold text-emerald-600">
                    {accountingSummary.totalRevenue.toFixed(2)} {settings.currency || '€'}
                  </div>
                  <div className="text-[10px] md:text-sm text-muted-foreground">Revenus mois</div>
                </div>
              </AdminOnly>
            </div>
          </div>
          {/* Illustration */}
          <div className="hidden lg:block">
            <img src={heroImage} alt="Vétérinaire professionnel examinant un chien" className="w-96 h-64 object-cover rounded-xl shadow-medical" />
          </div>
        </div>
      </div>
      
      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      <NewAppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal} 
      />
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
    </>
  );
}