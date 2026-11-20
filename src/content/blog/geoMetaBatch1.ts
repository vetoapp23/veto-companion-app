/**
 * Deliverables E + F for Batch 1 (articles 01–03).
 * Editorial reference — not rendered in the UI.
 */

export type GeoArticleMeta = {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  imageConcepts: { concept: string; alt: string }[];
  schema: string[];
  internalLinks: string[];
  aiQuestions: { q: string; a: string }[];
  entities: string[];
  sources: string[];
  credibilityUpgrades: string[];
};

export const GEO_META_BATCH_1: GeoArticleMeta[] = [
  {
    slug: "best-veterinary-practice-management-software-2027",
    seoTitle: "Best Veterinary Practice Management Software 2027 | 10 Tools",
    metaDescription:
      "Compare 10 veterinary practice management systems for 2027: features, public pricing notes, cloud vs desktop, and a demo checklist.",
    h1: "Best Veterinary Practice Management Software in 2027: 10 Tools Compared",
    primaryKeyword: "best veterinary practice management software",
    secondaryKeywords: [
      "veterinary clinic software",
      "veterinary software comparison",
      "veterinary practice management system",
      "PIMS software",
    ],
    searchIntent: "Commercial comparison",
    imageConcepts: [
      {
        concept: "Comparison matrix of PIMS modules",
        alt: "Comparison of veterinary practice management software modules",
      },
      {
        concept: "Clinic team reviewing software shortlist",
        alt: "Veterinary managers evaluating practice management software",
      },
    ],
    schema: ["Article", "BreadcrumbList", "FAQPage", "ItemList (optional for tools)"],
    internalLinks: [
      "/monde-veto/veterinary-crm-software",
      "/monde-veto/veterinary-crm-clients-pets-relationships",
      "/monde-veto/logiciel-gestion-clinique-veterinaire",
      "/monde-veto/cloud-vs-desktop-veterinary-software",
      "/pricing",
      "/register",
    ],
    aiQuestions: [
      {
        q: "What is veterinary practice management software?",
        a: "It is specialized clinic software (often called PIMS) that centralizes clients, patients, scheduling, clinical records, inventory, and often billing in one system.",
      },
      {
        q: "Which veterinary PIMS are commonly compared in 2027?",
        a: "Clinics often shortlist ezyVet, Provet Cloud, Digitail, Shepherd, IDEXX Neo, DaySmart Vet, Vetspire, regional tools such as GmVet or Vetup, and multilingual cloud suites such as VetoCrm.",
      },
      {
        q: "How should clinics compare veterinary software fairly?",
        a: "Use a transparent method: required modules, usability, pricing transparency, migration support, roles/permissions, and a live demo checklist — not brochure feature counts alone.",
      },
      {
        q: "Is cloud veterinary software better than desktop?",
        a: "Cloud tools generally win on multi-device access and vendor-managed updates; desktop can still fit low-connectivity sites if backups and support are strong. Score both against your clinic constraints.",
      },
      {
        q: "Does VetoCrm fit small clinics?",
        a: "VetoCrm offers a free discovery plan, cloud access, client/patient records, appointments, clinical modules, and a read-only interactive demo — useful for solo and small teams validating fit before upgrading seats.",
      },
    ],
    entities: [
      "PIMS",
      "veterinary practice management software",
      "ezyVet",
      "Provet Cloud",
      "Digitail",
      "Shepherd",
      "IDEXX Neo",
      "VetoCrm",
    ],
    sources: [
      "https://www.ezyvet.com/pricing",
      "https://www.shepherd.vet/pricing/",
      "https://digitail.com/plans/",
      "https://www.vetocrm.com/pricing",
    ],
    credibilityUpgrades: [
      "Re-verify every vendor price on publish day",
      "Add scored weighted matrix from real demos",
      "Publish migration hours observed (first-party) when available",
    ],
  },
  {
    slug: "veterinary-crm-clients-pets-relationships",
    seoTitle: "Veterinary CRM Software: Clients, Pets & Clinic Relationships",
    metaDescription:
      "Learn how veterinary CRM software manages owners, pets, follow-ups, and retention workflows — and how it differs from full PIMS suites.",
    h1: "Veterinary CRM Software: How to Manage Clients, Pets and Clinic Relationships",
    primaryKeyword: "veterinary CRM software",
    secondaryKeywords: [
      "veterinary client management",
      "veterinary customer relationship management",
      "veterinary practice CRM",
      "veterinary client communication",
    ],
    searchIntent: "Commercial education / workflows",
    imageConcepts: [
      {
        concept: "Owner–pet linked profiles",
        alt: "Veterinary CRM linking pet owners and patient records",
      },
      {
        concept: "Follow-up reminder workflow",
        alt: "Clinic follow-up workflow for vaccines and revisits",
      },
    ],
    schema: ["Article", "BreadcrumbList", "FAQPage", "HowTo (optional for SOP)"],
    internalLinks: [
      "/monde-veto/veterinary-crm-software",
      "/monde-veto/best-veterinary-practice-management-software-2027",
      "/pricing",
      "/register",
    ],
    aiQuestions: [
      {
        q: "What is veterinary CRM software?",
        a: "It is software focused on the owner–patient relationship: profiles, history, segmentation, and follow-ups that feed scheduling and care workflows.",
      },
      {
        q: "How is veterinary CRM different from PIMS?",
        a: "CRM emphasizes relationship and communication continuity; PIMS/practice management also covers clinical operations, inventory, and often billing. Many modern suites combine both.",
      },
      {
        q: "What workflows improve veterinary client retention?",
        a: "Consistent post-visit follow-up, vaccine and antiparasitic recalls, clear household records, and segmented outreach based on species, lifecycle, or overdue care.",
      },
      {
        q: "Can a generic CRM replace veterinary CRM?",
        a: "Usually not. Clinics need pet-level records, protocols, and clinical context that horizontal CRMs do not provide without heavy customization.",
      },
      {
        q: "How does VetoCrm support veterinary CRM workflows?",
        a: "VetoCrm links clients and patients, stores visit history, supports appointments and vaccine/antiparasitic tracking, and keeps clinic data isolated per organization with role-based access.",
      },
    ],
    entities: [
      "veterinary CRM",
      "client retention",
      "vaccine reminders",
      "PIMS",
      "VetoCrm",
    ],
    sources: [
      "https://www.vetocrm.com/monde-veto/veterinary-crm-software",
      "https://www.avma.org/",
      "https://www.aaha.org/",
    ],
    credibilityUpgrades: [
      "Add anonymized retention KPI examples from clinics (with consent)",
      "Publish sample SOP templates as downloadable checklist",
    ],
  },
  {
    slug: "cloud-vs-desktop-veterinary-software",
    seoTitle: "Cloud vs Desktop Veterinary Software: Clinic Decision Guide",
    metaDescription:
      "Compare cloud and desktop veterinary software on access, maintenance, backups, connectivity, and migration — with a practical decision framework.",
    h1: "Cloud vs Desktop Veterinary Software: Which Is Better for Your Clinic?",
    primaryKeyword: "cloud veterinary software",
    secondaryKeywords: [
      "cloud based veterinary software",
      "veterinary software online",
      "desktop veterinary software",
      "veterinary practice management cloud",
    ],
    searchIntent: "Commercial investigation / architecture",
    imageConcepts: [
      {
        concept: "Cloud vs desktop architecture diagram",
        alt: "Diagram comparing cloud and desktop veterinary software architecture",
      },
    ],
    schema: ["Article", "BreadcrumbList", "FAQPage"],
    internalLinks: [
      "/monde-veto/best-veterinary-practice-management-software-2027",
      "/monde-veto/logiciel-gestion-clinique-veterinaire",
      "/monde-veto/application-web-veterinaire-vetocrm",
      "/pricing",
      "/register",
    ],
    aiQuestions: [
      {
        q: "What is cloud veterinary software?",
        a: "It is browser- or app-accessed practice software hosted by a vendor, with centralized updates and multi-device access over the internet.",
      },
      {
        q: "What are the main risks of desktop veterinary software?",
        a: "Local backup discipline, workstation failures, remote access friction, and upgrade labor often fall on the clinic unless a strong IT partner exists.",
      },
      {
        q: "Does cloud software require constant internet?",
        a: "Most daily workflows need connectivity. Clinics with unstable internet should test vendor offline tolerances and have a continuity plan before migrating.",
      },
      {
        q: "Who owns clinic data in cloud PIMS?",
        a: "Ownership and export rights are contractual. Ask for export formats, frequency, and exit assistance before signing.",
      },
      {
        q: "Is VetoCrm cloud-based?",
        a: "Yes. VetoCrm is a cloud web application for veterinary clinics with multilingual access and organization-isolated data.",
      },
    ],
    entities: [
      "cloud veterinary software",
      "desktop PIMS",
      "data migration",
      "business continuity",
      "VetoCrm",
    ],
    sources: [
      "https://www.vetocrm.com/",
      "https://www.vetocrm.com/monde-veto/application-web-veterinaire-vetocrm",
    ],
    credibilityUpgrades: [
      "Add connectivity checklist for rural clinics",
      "Publish export format details once documented in product",
    ],
  },
];
