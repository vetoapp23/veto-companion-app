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
  website: "https://vetocrm.com",
  contactEmail: "contact@vetocrm.com",
  privacyEmail: "privacy@vetocrm.com",
  supportEmail: "support@vetocrm.com",
  /** Public contact email shown on /contact */
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
