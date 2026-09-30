/** Copy blocks for directory listings & press (P2 authority). Brand spelling: VetoCrm (not VettoCRM). */
export const PRESS_KIT = {
  brand: "VetoCrm",
  website: "https://www.vetocrm.com",
  email: "contact@vetocrm.com",
  linkedin: "https://www.linkedin.com/company/vetocrm/",
  instagram: "https://www.instagram.com/vetocrm/",
  categories: [
    "Veterinary Practice Management Software",
    "Veterinary CRM",
    "Clinic Management Software",
    "SaaS",
  ],
  oneLiner: {
    fr: "VetoCrm — logiciel de gestion clinique vétérinaire & CRM (cloud).",
    en: "VetoCrm — veterinary practice management software & CRM (cloud).",
    es: "VetoCrm — software de gestión clínica veterinaria y CRM (cloud).",
  },
  short: {
    fr: "VetoCrm est un logiciel cloud de gestion pour cliniques et cabinets vétérinaires : clients, animaux, rendez-vous, dossiers médicaux, vaccins, stock et comptabilité. Essai et démo gratuits.",
    en: "VetoCrm is cloud practice management software for veterinary clinics: clients, patients, appointments, medical records, vaccines, inventory and accounting. Free trial and demo.",
    es: "VetoCrm es un software cloud de gestión para clínicas veterinarias: clientes, pacientes, citas, historiales, vacunas, inventario y contabilidad. Prueba y demo gratis.",
  },
  long: {
    fr: "VetoCrm aide les cabinets solo et les cliniques multi-praticiens à remplacer tableurs et outils dispersés. La plateforme combine CRM (propriétaires & animaux) et practice management (agenda, consultations, vaccins, stock, compta), avec modules élevage selon la formule. Interface moderne, données isolées par clinique, disponible en français, anglais et espagnol. Démo interactive et formule découverte pour démarrer sans friction.",
    en: "VetoCrm helps solo practices and multi-vet clinics replace spreadsheets and fragmented tools. It combines CRM (owners & pets) with practice management (scheduling, consults, vaccines, inventory, accounting), plus livestock modules by plan. Modern UI, per-clinic data isolation, available in French, English and Spanish. Interactive demo and free discovery plan to start fast.",
    es: "VetoCrm ayuda a consultorios y clínicas multipráctica a dejar hojas de cálculo y herramientas dispersas. Combina CRM (tutores y animales) con gestión clínica (agenda, consultas, vacunas, stock, contabilidad) y módulos de ganadería según el plan. Interfaz moderna, datos aislados por clínica, en francés, inglés y español. Demo interactiva y plan de descubrimiento para empezar sin fricción.",
  },
  directories: [
    { name: "Product Hunt", url: "https://www.producthunt.com/", note: "Launch / upcoming — use EN short blurb + screenshots" },
    { name: "Capterra", url: "https://www.capterra.com/", note: "Category: Veterinary / Practice Management" },
    { name: "G2", url: "https://www.g2.com/", note: "Category: Veterinary Practice Management" },
    { name: "VetSoftwareHub", url: "https://www.vetsoftwarehub.com/", note: "Claim / correct VetoCrm listing (avoid VettoCRM confusion)" },
    { name: "AlternativeTo", url: "https://alternativeto.net/", note: "Alternatives to Excel / Shepherd / generic CRM" },
    { name: "SaaSHub", url: "https://www.saashub.com/", note: "Tag: veterinary, CRM, practice management" },
  ],
  screenshots: [
    "/monde-veto/screen-dashboard.png",
    "/monde-veto/screen-clients.png",
    "/monde-veto/screen-patients.png",
    "/monde-veto/screen-accounting.png",
  ],
} as const;
