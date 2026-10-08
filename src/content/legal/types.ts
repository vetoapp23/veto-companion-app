export type LegalDocId = "privacy" | "terms" | "legal" | "cookies" | "refund";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  metaDescription: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalBundle = Record<LegalDocId, LegalDoc>;

/** Publisher identity used across legal pages and contact. */
export const LEGAL_ENTITY = {
  brand: "VetoCrm",
  website: "https://www.vetocrm.com",
  contactEmail: "contact@vetocrm.com",
  /** Same public inbox (ImprovMX → Gmail); keep one brand address everywhere */
  privacyEmail: "contact@vetocrm.com",
  supportEmail: "contact@vetocrm.com",
  /** Public contact email shown on /contact, footer, schema */
  publicEmail: "contact@vetocrm.com",
  address: "Rabat, Royaume du Maroc",
  companyFormalName: "VetoCrm",
  country: "Maroc",
  publicationDirector: "Le représentant légal de VetoCrm",
  hostingApp: "Vercel Inc. (hébergement front / CDN)",
  hostingData: "Supabase Inc. (base de données, authentification, stockage fichiers)",
  linkedin: "https://www.linkedin.com/company/vetocrm/",
  instagram: "https://www.instagram.com/vetocrm/",
} as const;
