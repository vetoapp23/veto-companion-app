// Adaptive configuration per farm/breeding type.
// Used to dynamically render relevant fields and dropdowns.

export interface FarmTypeConfig {
  key: string;
  label: string;
  productionTypes: string[];
  housingTypes: string[];
  batchCategories: string[];
  herdLabel: string; // e.g. "Cheptel total" vs "Nombre de sujets"
  interventionTypes: string[];
}

const COMMON_INTERVENTIONS = [
  "Vaccination collective",
  "Prophylaxie",
  "Traitement curatif",
  "Diagnostic / examen",
  "Suivi reproduction",
  "Visite sanitaire",
  "Urgence",
];

export const FARM_TYPE_CONFIGS: Record<string, FarmTypeConfig> = {
  bovin: {
    key: "bovin",
    label: "Élevage bovin",
    productionTypes: ["Lait", "Viande", "Mixte", "Reproducteur", "Engraissement"],
    housingTypes: ["Stabulation libre", "Stabulation entravée", "Plein air", "Mixte"],
    batchCategories: [
      "Vaches laitières",
      "Vaches allaitantes",
      "Génisses",
      "Veaux",
      "Taurillons",
      "Taureaux reproducteurs",
    ],
    herdLabel: "Cheptel total (têtes)",
    interventionTypes: [...COMMON_INTERVENTIONS, "Insémination artificielle", "Mise bas / vêlage", "Détartrage onglon"],
  },
  ovin: {
    key: "ovin",
    label: "Élevage ovin",
    productionTypes: ["Viande", "Lait", "Laine", "Mixte"],
    housingTypes: ["Bergerie", "Plein air", "Transhumance", "Mixte"],
    batchCategories: ["Brebis", "Béliers", "Agneaux", "Antenais", "Agnelles de renouvellement"],
    herdLabel: "Effectif (têtes)",
    interventionTypes: [...COMMON_INTERVENTIONS, "Tonte sanitaire", "Échographie de gestation"],
  },
  caprin: {
    key: "caprin",
    label: "Élevage caprin",
    productionTypes: ["Lait", "Viande", "Mixte"],
    housingTypes: ["Chèvrerie", "Plein air", "Mixte"],
    batchCategories: ["Chèvres laitières", "Boucs", "Chevreaux", "Chevrettes"],
    herdLabel: "Effectif (têtes)",
    interventionTypes: [...COMMON_INTERVENTIONS, "Échographie", "Tarissement"],
  },
  avicole: {
    key: "avicole",
    label: "Élevage avicole",
    productionTypes: ["Pondeuses", "Chair", "Reproducteur", "Mixte"],
    housingTypes: ["Bâtiment fermé", "Plein air", "Label", "Bio"],
    batchCategories: ["Poussins", "Poulettes", "Pondeuses", "Poulets de chair", "Reproducteurs"],
    herdLabel: "Nombre de sujets",
    interventionTypes: [...COMMON_INTERVENTIONS, "Désinfection bâtiment", "Vide sanitaire", "Autopsie"],
  },
  porcin: {
    key: "porcin",
    label: "Élevage porcin",
    productionTypes: ["Naissage", "Engraissement", "Naisseur-engraisseur", "Reproducteur"],
    housingTypes: ["Bâtiment", "Plein air", "Mixte"],
    batchCategories: ["Truies", "Verrats", "Porcelets", "Porcs charcutiers", "Cochettes"],
    herdLabel: "Effectif (têtes)",
    interventionTypes: [...COMMON_INTERVENTIONS, "Castration", "Insémination", "Sevrage"],
  },
  equin: {
    key: "equin",
    label: "Élevage équin",
    productionTypes: ["Sport", "Loisir", "Course", "Reproducteur", "Viande"],
    housingTypes: ["Box", "Paddock", "Pré", "Mixte"],
    batchCategories: ["Juments poulinières", "Étalons", "Poulains", "Chevaux à l'entraînement"],
    herdLabel: "Effectif (têtes)",
    interventionTypes: [...COMMON_INTERVENTIONS, "Dentisterie", "Maréchalerie sanitaire", "Échographie reproduction"],
  },
  apicole: {
    key: "apicole",
    label: "Apiculture",
    productionTypes: ["Miel", "Pollen", "Gelée royale", "Reine", "Mixte"],
    housingTypes: ["Rucher sédentaire", "Transhumance"],
    batchCategories: ["Ruches de production", "Ruchettes", "Essaims", "Reines"],
    herdLabel: "Nombre de ruches",
    interventionTypes: ["Traitement varroa", "Visite sanitaire", "Nourrissement", "Marquage de reine"],
  },
  aquacole: {
    key: "aquacole",
    label: "Aquaculture",
    productionTypes: ["Poissons", "Crustacés", "Coquillages", "Mixte"],
    housingTypes: ["Bassins", "Cages en mer", "Étangs", "Recirculation"],
    batchCategories: ["Alevins", "Juvéniles", "Adultes", "Reproducteurs"],
    herdLabel: "Biomasse (kg) / effectif",
    interventionTypes: ["Traitement antiparasitaire", "Contrôle sanitaire", "Vaccination par bain", "Mortalité"],
  },
  mixte: {
    key: "mixte",
    label: "Exploitation mixte",
    productionTypes: ["Polyculture-élevage", "Mixte"],
    housingTypes: ["Mixte"],
    batchCategories: ["Lot mixte"],
    herdLabel: "Cheptel total",
    interventionTypes: COMMON_INTERVENTIONS,
  },
};

export const DEFAULT_FARM_TYPE_KEYS = Object.keys(FARM_TYPE_CONFIGS);

export function normalizeFarmTypeKey(input?: string | null): string {
  if (!input) return "mixte";
  const v = input.toLowerCase();
  if (v.includes("bov")) return "bovin";
  if (v.includes("ovi")) return "ovin";
  if (v.includes("capr") || v.includes("chèvr") || v.includes("chevr")) return "caprin";
  if (v.includes("avic") || v.includes("vola") || v.includes("poul")) return "avicole";
  if (v.includes("porc")) return "porcin";
  if (v.includes("equ") || v.includes("équ") || v.includes("chev")) return "equin";
  if (v.includes("api") || v.includes("abeil") || v.includes("ruch")) return "apicole";
  if (v.includes("aqua") || v.includes("pisc") || v.includes("poiss")) return "aquacole";
  return "mixte";
}

export function getFarmTypeConfig(input?: string | null): FarmTypeConfig {
  return FARM_TYPE_CONFIGS[normalizeFarmTypeKey(input)];
}
