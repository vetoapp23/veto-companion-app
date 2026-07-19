import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, Stethoscope } from "lucide-react";
import { useState } from "react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import {
  useClients,
  useAnimals,
  useConsultations,
  useVaccinations,
  useAntiparasitics,
} from "@/hooks/useDatabase";
import { useAccounting } from "@/hooks/useAccounting";
import { useSettings } from "@/contexts/SettingsContext";
import { AdminOnly } from "./RoleGuard";

export function HeroSection() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { revenues } = useAccounting();
  const { settings } = useSettings();
  const activeVets = (settings.veterinarians || []).filter((v) => v.isActive);
  const clinicName = settings.clinicName?.trim();
  const greeting =
    activeVets.length === 1
      ? `Bienvenue ${activeVets[0].name}`
      : clinicName
        ? `Bienvenue à ${clinicName}`
        : "Bienvenue";
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const totalClients = clients.length;
  const totalPets = pets.length;
  const totalVaccinations = vaccinations.length;
  const totalAntiparasitics = antiparasitics.length;
  const today = new Date().toISOString().split("T")[0];
  const consultationsToday = consultations.filter((c) => {
    const consultationDate = c.consultation_date.split("T")[0];
    return consultationDate === today;
  }).length;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthRevenue = revenues
    .filter((r) => {
      const d = new Date(r.revenue_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const stats = [
    { value: totalClients, label: "Clients" },
    { value: totalPets, label: "Animaux" },
    { value: consultationsToday, label: "Consult. aujourd'hui" },
    { value: totalVaccinations, label: "Vaccinations" },
    { value: totalAntiparasitics, label: "Antiparasit." },
  ];

  return (
    <>
      <div className="app-dash-hero mb-4 md:mb-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#5eead4" }}>
              <Heart className="h-4 w-4" />
              <span className="font-display tracking-wide uppercase text-[11px] md:text-xs opacity-90">
                Espace clinique
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold leading-tight text-white">{greeting}</h1>
              <p className="text-base md:text-xl font-semibold mt-1" style={{ color: "#5eead4" }}>
                Dashboard <span className="text-white/90">Veto</span>
                <span style={{ color: "#5eead4" }}>Crm</span>
              </p>
            </div>
            <p className="hidden md:block text-sm md:text-base max-w-2xl" style={{ color: "rgba(244,251,249,0.75)" }}>
              Clients, animaux, rendez-vous et consultations — tout synchronisé.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-1.5 rounded-full bg-[#5eead4] text-[#07131f] hover:bg-[#99f6e4] col-span-2 sm:col-span-1"
              onClick={() => setShowClientModal(true)}
            >
              <Users className="h-4 w-4" />
              Nouveau client
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setShowPetModal(true)}
            >
              <Heart className="h-4 w-4" />
              Animal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setShowAppointmentModal(true)}
            >
              <Calendar className="h-4 w-4" />
              RDV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white col-span-2 sm:col-span-1"
              onClick={() => setShowConsultationModal(true)}
            >
              <Stethoscope className="h-4 w-4" />
              Consultation
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="app-stat">
                <div className="app-stat-value text-lg md:text-xl">{s.value}</div>
                <div className="app-stat-label">{s.label}</div>
              </div>
            ))}
            <AdminOnly>
              <div className="app-stat col-span-3 md:col-span-1">
                <div className="app-stat-value text-lg md:text-xl">
                  {monthRevenue.toFixed(0)} {settings.currency || "MAD"}
                </div>
                <div className="app-stat-label">Revenus mois</div>
              </div>
            </AdminOnly>
          </div>
        </div>
      </div>

      <NewClientModal open={showClientModal} onOpenChange={setShowClientModal} />
      <NewAppointmentModal open={showAppointmentModal} onOpenChange={setShowAppointmentModal} />
      <NewPetModal open={showPetModal} onOpenChange={setShowPetModal} />
      <NewConsultationModal open={showConsultationModal} onOpenChange={setShowConsultationModal} />
    </>
  );
}
