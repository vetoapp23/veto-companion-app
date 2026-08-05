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

/** Shared publisher facts — update when the legal entity is finalized. */
export const LEGAL_ENTITY = {
  brand: "VetoCrm",
  website: "https://vetocrm.com",
  contactEmail: "contact@vetocrm.com",
  privacyEmail: "privacy@vetocrm.com",
  supportEmail: "support@vetocrm.com",
  /** Public contact email shown on /contact */
  publicEmail: "vetoapp23@gmail.com",
  /** Operating / correspondence address — replace with registered seat when available */
  address: "Rabat, Maroc",
  /** Replace with registered company name when available */
  companyFormalName: "VetoCrm",
  linkedin: "https://www.linkedin.com/company/vetocrm/",
  instagram: "https://www.instagram.com/vetocrm/",
} as const;
