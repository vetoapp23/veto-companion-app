import {
  Stethoscope,
  Syringe,
  Scissors,
  AlertTriangle,
  ClipboardCheck,
  Scan,
  Sparkles,
  Bug,
  Pill,
  MoreHorizontal,
  FlaskConical,
  Tractor,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type VisitServiceCode =
  | "consultation"
  | "vaccination"
  | "surgery"
  | "emergency"
  | "checkup"
  | "radiography"
  | "ultrasound"
  | "lab"
  | "imaging"
  | "grooming"
  | "antiparasitic"
  | "prescription"
  | "farm_visit"
  | "herd_vaccination"
  | "prophylaxis"
  | "other";

export type VisitServiceAction =
  | "consultation"
  | "vaccination"
  | "antiparasitic"
  | "prescription"
  | "farm_intervention"
  | "notes"
  | "none";

/** Which detail panel to show in VisitWorkspace */
export type VisitServicePanel =
  | "clinical"
  | "vaccination"
  | "antiparasitic"
  | "prescription"
  | "farm"
  | "imaging"
  | "lab"
  | "grooming"
  | "generic";

export interface VisitServiceDef {
  code: VisitServiceCode;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Which clinical modal / flow to open */
  action: VisitServiceAction;
  /** Detail panel layout in workspace */
  panel: VisitServicePanel;
  /** Suggested default price (MAD) — editable per line */
  defaultAmount: number;
  /** Maps appointment_type slug → suggest this service */
  appointmentHints?: string[];
}

export const VISIT_SERVICE_CATALOG: VisitServiceDef[] = [
  {
    code: "consultation",
    label: "Consultation",
    description: "Examen clinique, diagnostic et traitement",
    icon: Stethoscope,
    action: "consultation",
    panel: "clinical",
    defaultAmount: 150,
    appointmentHints: ["consultation", "follow-up", "follow_up"],
  },
  {
    code: "emergency",
    label: "Urgence",
    description: "Prise en charge prioritaire",
    icon: AlertTriangle,
    action: "consultation",
    panel: "clinical",
    defaultAmount: 250,
    appointmentHints: ["urgence", "emergency"],
  },
  {
    code: "checkup",
    label: "Contrôle",
    description: "Suivi post-opératoire ou de contrôle",
    icon: ClipboardCheck,
    action: "consultation",
    panel: "clinical",
    defaultAmount: 100,
    appointmentHints: ["controle", "contrôle", "checkup"],
  },
  {
    code: "vaccination",
    label: "Vaccination",
    description: "Administration et protocole vaccinal",
    icon: Syringe,
    action: "vaccination",
    panel: "vaccination",
    defaultAmount: 120,
    appointmentHints: ["vaccination", "vaccin"],
  },
  {
    code: "antiparasitic",
    label: "Antiparasitaire",
    description: "Traitement antiparasitaire interne / externe",
    icon: Bug,
    action: "antiparasitic",
    panel: "antiparasitic",
    defaultAmount: 80,
    appointmentHints: ["antiparasitaire", "antiparasite"],
  },
  {
    code: "surgery",
    label: "Chirurgie",
    description: "Acte chirurgical (compte-rendu clinique)",
    icon: Scissors,
    action: "consultation",
    panel: "clinical",
    defaultAmount: 800,
    appointmentHints: ["chirurgie", "surgery", "sterilisation", "stérilisation"],
  },
  {
    code: "radiography",
    label: "Radiographie",
    description: "Examen radiographique",
    icon: Scan,
    action: "notes",
    panel: "imaging",
    defaultAmount: 300,
    appointmentHints: ["radiographie", "radio", "rx"],
  },
  {
    code: "ultrasound",
    label: "Échographie",
    description: "Examen échographique",
    icon: Scan,
    action: "notes",
    panel: "imaging",
    defaultAmount: 400,
    appointmentHints: ["echographie", "échographie", "echo", "ultrasound"],
  },
  {
    code: "lab",
    label: "Analyses",
    description: "Analyses de laboratoire",
    icon: FlaskConical,
    action: "notes",
    panel: "lab",
    defaultAmount: 200,
    appointmentHints: ["analyse", "analyses", "labo", "laboratoire", "blood"],
  },
  {
    code: "imaging",
    label: "Imagerie (autre)",
    description: "Autre examen d'imagerie",
    icon: Scan,
    action: "notes",
    panel: "imaging",
    defaultAmount: 350,
    appointmentHints: ["imagerie"],
  },
  {
    code: "grooming",
    label: "Toilettage",
    description: "Soins esthétiques / hygiène",
    icon: Sparkles,
    action: "notes",
    panel: "grooming",
    defaultAmount: 100,
    appointmentHints: ["toilettage", "grooming"],
  },
  {
    code: "prescription",
    label: "Ordonnance",
    description: "Prescription de médicaments (liée au stock)",
    icon: Pill,
    action: "prescription",
    panel: "prescription",
    defaultAmount: 0,
  },
  {
    code: "farm_visit",
    label: "Visite d'élevage",
    description: "Intervention sur exploitation / cheptel",
    icon: Tractor,
    action: "farm_intervention",
    panel: "farm",
    defaultAmount: 400,
    appointmentHints: ["elevage", "élevage", "ferme", "farm", "visite elevage"],
  },
  {
    code: "herd_vaccination",
    label: "Vaccination de lot",
    description: "Prophylaxie vaccinale de troupeau",
    icon: Syringe,
    action: "farm_intervention",
    panel: "farm",
    defaultAmount: 50,
    appointmentHints: ["vaccination lot", "herd", "troupeau"],
  },
  {
    code: "prophylaxis",
    label: "Prophylaxie",
    description: "Prophylaxie / traitement de lot",
    icon: Shield,
    action: "farm_intervention",
    panel: "farm",
    defaultAmount: 40,
    appointmentHints: ["prophylaxie", "prophylaxis"],
  },
  {
    code: "other",
    label: "Autre prestation",
    description: "Acte libre avec montant personnalisé",
    icon: MoreHorizontal,
    action: "notes",
    panel: "generic",
    defaultAmount: 0,
  },
];

export function isImagingService(code: string): boolean {
  const def = getServiceDef(code);
  return def?.panel === "imaging";
}

export function getServiceDef(code: string): VisitServiceDef | undefined {
  return VISIT_SERVICE_CATALOG.find((s) => s.code === code);
}

/** Suggest a service from an appointment type string */
export function suggestServiceFromAppointmentType(appointmentType?: string | null): VisitServiceCode {
  if (!appointmentType) return "consultation";
  const slug = appointmentType.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  for (const def of VISIT_SERVICE_CATALOG) {
    if (def.appointmentHints?.some((h) => slug.includes(h.normalize("NFD").replace(/\p{M}/gu, "")))) {
      return def.code;
    }
  }
  return "consultation";
}

export const VISIT_STATUS_LABELS: Record<string, string> = {
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const VISIT_SERVICE_STATUS_LABELS: Record<string, string> = {
  planned: "À faire",
  in_progress: "En cours",
  done: "Fait",
  skipped: "Ignoré",
};
