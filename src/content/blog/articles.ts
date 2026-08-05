import type { BlogArticle, BlogLang } from "./types";
import { BLOG_SEO_ARTICLES } from "./seoArticles";

export type {
  BlogLang,
  BlogSection,
  BlogArticleLocalized,
  BlogArticle,
} from "./types";

export const BLOG_STATIC_ARTICLES: BlogArticle[] = [
  {
    slug: "digitalisation-clinique-veterinaire",
    cover: "/monde-veto/digitalisation.jpg",
    coverAlt: {
      fr: "Équipe soignante utilisant des outils numériques en clinique",
      en: "Clinical team using digital tools in a clinic",
      es: "Equipo clínico usando herramientas digitales",
    },
    publishedAt: "2026-07-15",
    readingMinutes: 7,
    locales: {
      fr: {
        title: "Digitalisation des cliniques vétérinaires : par où commencer ?",
        excerpt:
          "RDV en ligne, rappels SMS, dossier patient cloud : comment digitaliser une clinique sans perdre de temps ni de patients.",
        metaDescription:
          "Guide pratique de digitalisation vétérinaire : logiciels métier, rappels automatiques, relation client et CRM. Pourquoi VetoCrm accélère la transformation digitale.",
        category: "Digitalisation",
        sections: [
          {
            heading: "Pourquoi digitaliser une clinique vétérinaire ?",
            paragraphs: [
              "Les cliniques font face à une charge administrative croissante, une pénurie de temps médical et des propriétaires qui attendent des réponses rapides — y compris hors horaires d’ouverture. La digitalisation n’est plus un « plus » marketing : c’est un levier de fluidité opérationnelle.",
              "Les baromètres et retours terrain convergent : prise de rendez-vous en ligne, rappels SMS/e-mail, logiciels cloud et suivi post-consultation réduisent les no-shows et libèrent le secrétariat pour l’accueil et les soins.",
            ],
          },
          {
            heading: "Les 4 piliers d’une clinique digitale",
            paragraphs: [
              "Une digitalisation réussie repose rarement sur un seul outil. Elle s’organise autour de quatre briques complémentaires :",
            ],
            bullets: [
              "Logiciel métier / CRM : clients, animaux, dossiers médicaux, vaccins, stock.",
              "Agenda & RDV : prise de rendez-vous (idéalement 24h/24) synchronisée avec l’équipe.",
              "Communication : rappels automatiques, suivis post-acte, messages structurés.",
              "Pilotage : vision claire de l’activité, des rappels à faire et des priorités du jour.",
            ],
          },
          {
            heading: "Par où commencer sans se disperser ?",
            paragraphs: [
              "Commencez par centraliser la donnée patient (propriétaire + animal + historique). Ensuite activez les rappels de vaccination et antiparasitaires : c’est souvent le ROI le plus rapide. Enfin, ouvrez ou simplifiez la prise de rendez-vous pour diminuer la pression téléphonique.",
              "Évitez d’empiler 5 outils non connectés. Un CRM vétérinaire unifié limite les doubles saisies, les erreurs et la perte d’informations entre l’accueil et la salle de consultation.",
            ],
          },
          {
            heading: "Comment VetoCrm accompagne cette transition",
            paragraphs: [
              "VetoCrm est conçu comme le cœur digital de la clinique : clients, animaux, rendez-vous, consultations, vaccinations, antiparasitaires, stock et suivi. Vous digitalisez le parcours sans multiplier les logiciels.",
              "Résultat : moins de papier, moins d’oublis, une équipe plus sereine — et des propriétaires mieux informés.",
            ],
          },
        ],
        ctaTitle: "Passez au digital avec VetoCrm",
        ctaBody:
          "Centralisez dossiers, RDV et rappels dans un CRM pensé pour les vétérinaires. Essai simple, sans complexité inutile.",
        ctaButton: "Essayer VetoCrm gratuitement",
      },
      en: {
        title: "Digitizing veterinary clinics: where to start?",
        excerpt:
          "Online booking, SMS reminders, cloud records: how to digitize a clinic without losing time or patients.",
        metaDescription:
          "Practical guide to veterinary digitization: practice software, automated reminders, client relations and CRM. Why VetoCrm accelerates digital transformation.",
        category: "Digitization",
        sections: [
          {
            heading: "Why digitize a veterinary clinic?",
            paragraphs: [
              "Clinics face rising admin load, limited clinical time, and owners who expect fast answers — including outside opening hours. Digitization is no longer a marketing extra: it is an operational necessity.",
              "Industry feedback is consistent: online booking, SMS/email reminders, cloud software and post-visit follow-up reduce no-shows and free the front desk for care.",
            ],
          },
          {
            heading: "Four pillars of a digital clinic",
            paragraphs: ["A successful digital setup rarely relies on a single tool. It usually combines:"],
            bullets: [
              "Practice CRM: clients, patients, medical records, vaccines, inventory.",
              "Scheduling: booking synced with the care team.",
              "Communication: reminders and structured post-care messages.",
              "Operations: a clear view of daily priorities and follow-ups.",
            ],
          },
          {
            heading: "Where to start without spreading too thin?",
            paragraphs: [
              "First centralize patient data (owner + animal + history). Then enable vaccine and antiparasitic reminders — often the fastest ROI. Finally simplify booking to reduce phone pressure.",
              "Avoid stacking five disconnected tools. A unified veterinary CRM cuts duplicate entry and lost information between reception and consult rooms.",
            ],
          },
          {
            heading: "How VetoCrm supports the transition",
            paragraphs: [
              "VetoCrm is built as the digital core of the clinic: clients, pets, appointments, consultations, vaccinations, antiparasitics, stock and follow-up — without tool sprawl.",
              "Less paper, fewer missed follow-ups, a calmer team — and better-informed pet owners.",
            ],
          },
        ],
        ctaTitle: "Go digital with VetoCrm",
        ctaBody: "Centralize records, appointments and reminders in a CRM built for vets.",
        ctaButton: "Try VetoCrm free",
      },
      es: {
        title: "Digitalización de clínicas veterinarias: ¿por dónde empezar?",
        excerpt:
          "Citas online, recordatorios SMS y historiales en la nube: cómo digitalizar sin perder tiempo ni pacientes.",
        metaDescription:
          "Guía práctica de digitalización veterinaria: software, recordatorios, relación con clientes y CRM. Por qué VetoCrm acelera la transformación digital.",
        category: "Digitalización",
        sections: [
          {
            heading: "¿Por qué digitalizar una clínica veterinaria?",
            paragraphs: [
              "Las clínicas afrontan más carga administrativa, poco tiempo clínico y propietarios que esperan respuestas rápidas. La digitalización ya no es un extra: es operativa.",
              "La evidencia de campo apunta a citas online, recordatorios SMS/email y software en la nube para reducir ausencias y liberar la recepción.",
            ],
          },
          {
            heading: "Cuatro pilares de una clínica digital",
            paragraphs: ["Una digitalización sólida suele combinar:"],
            bullets: [
              "CRM veterinario: clientes, pacientes, historiales, vacunas, stock.",
              "Agenda sincronizada con el equipo.",
              "Comunicación: recordatorios y seguimiento post-consulta.",
              "Gestión: visión clara de prioridades del día.",
            ],
          },
          {
            heading: "¿Por dónde empezar?",
            paragraphs: [
              "Centralice primero los datos del paciente. Luego active recordatorios de vacunas y antiparasitarios. Después simplifique la reserva de citas.",
              "Evite acumular herramientas desconectadas. Un CRM unificado reduce dobles entradas y pérdida de información.",
            ],
          },
          {
            heading: "Cómo VetoCrm acompaña la transición",
            paragraphs: [
              "VetoCrm es el núcleo digital de la clínica: clientes, animales, citas, consultas, vacunas, antiparasitarios y stock.",
              "Menos papel, menos olvidos y propietarios mejor informados.",
            ],
          },
        ],
        ctaTitle: "Digitalice con VetoCrm",
        ctaBody: "Centralice historiales, citas y recordatorios en un CRM pensado para veterinarios.",
        ctaButton: "Probar VetoCrm gratis",
      },
    },
  },
  {
    slug: "intelligence-artificielle-veterinaire",
    cover: "/monde-veto/ia-veterinaire.jpg",
    coverAlt: {
      fr: "Technologie et médecine — illustration de l’IA au service du soin",
      en: "Technology and medicine — AI supporting care",
      es: "Tecnología y medicina — IA al servicio del cuidado",
    },
    publishedAt: "2026-07-22",
    readingMinutes: 8,
    locales: {
      fr: {
        title: "Vétérinaire et intelligence artificielle : usages concrets en clinique",
        excerpt:
          "Imagerie assistée, aide à la rédaction, agents d’accueil : ce que l’IA change vraiment — et ce qu’elle ne remplace pas.",
        metaDescription:
          "IA en médecine vétérinaire : radiologie assistée, comptes rendus, accueil téléphonique. Comment VetoCrm prépare une clinique data-ready pour l’IA.",
        category: "Innovation",
        sections: [
          {
            heading: "L’IA n’est plus théorique en médecine vétérinaire",
            paragraphs: [
              "Depuis quelques années, l’IA entre concrètement dans les cliniques : analyse d’imagerie en quelques minutes, aide au différentiel, rédaction de comptes rendus, agents conversationnels pour filtrer les appels hors horaires.",
              "Le consensus des praticiens et associations tech (colloques e-santé animale) est clair : l’IA augmente le clinicien, elle ne le remplace pas. Le jugement médical, la relation de confiance et la responsabilité restent humains.",
            ],
          },
          {
            heading: "Trois familles d’usages à connaître",
            paragraphs: ["Pour prioriser vos investissements, regroupez les outils en trois catégories :"],
            bullets: [
              "Aide diagnostique : lecture assistée de radios, cytologie, imagerie (second avis rapide).",
              "Productivité clinique : brouillons de comptes rendus, fiches client, recherche documentaire.",
              "Opérations : triage téléphonique, prise de RDV, réduction des appels manqués.",
            ],
          },
          {
            heading: "Le prérequis oublié : des données propres",
            paragraphs: [
              "Sans historique patient structuré (motif, examen, traitements, vaccins, poids, suivis), l’IA reste limitée. Une clinique qui saisit encore sur papier ou dans des fichiers dispersés ne pourra pas tirer parti des prochains outils.",
              "La meilleure préparation à l’IA, c’est donc un CRM avec dossiers médicaux complets, traçables et accessibles à toute l’équipe.",
            ],
          },
          {
            heading: "VetoCrm : la base data pour une clinique augmentée",
            paragraphs: [
              "VetoCrm structure vos consultations, vaccinations, antiparasitaires et historiques animal/client. Vous créez le socle de données propre dont l’IA a besoin — tout en améliorant dès aujourd’hui le quotidien de l’équipe.",
              "Quand vous branchez un outil d’imagerie ou d’aide à la rédaction, vos dossiers sont déjà prêts à accueillir et contextualiser l’information.",
            ],
          },
        ],
        ctaTitle: "Préparez votre clinique à l’IA avec VetoCrm",
        ctaBody:
          "Des dossiers structurés aujourd’hui, une clinique prête pour les outils de demain. Commencez avec un CRM vétérinaire clair.",
        ctaButton: "Découvrir VetoCrm",
      },
      en: {
        title: "Veterinary practice and AI: real clinic use cases",
        excerpt:
          "Assisted imaging, report drafting, front-desk agents: what AI really changes — and what it does not replace.",
        metaDescription:
          "AI in veterinary medicine: assisted radiology, clinical notes, phone triage. How VetoCrm makes your clinic data-ready for AI.",
        category: "Innovation",
        sections: [
          {
            heading: "AI is already in veterinary clinics",
            paragraphs: [
              "AI now shows up as faster imaging reads, differential support, draft clinical notes, and after-hours call agents.",
              "The shared view across the profession: AI augments clinicians; it does not replace medical judgment, trust, or responsibility.",
            ],
          },
          {
            heading: "Three practical use-case families",
            paragraphs: ["Group tools into three buckets when prioritizing investment:"],
            bullets: [
              "Diagnostic support: assisted X-ray/cytology reads.",
              "Clinical productivity: draft reports and client explainers.",
              "Operations: call triage and booking support.",
            ],
          },
          {
            heading: "The forgotten prerequisite: clean data",
            paragraphs: [
              "Without structured patient history, AI remains limited. Paper or scattered files block tomorrow’s tools.",
              "The best AI prep is a CRM with complete, shareable medical records.",
            ],
          },
          {
            heading: "VetoCrm: the data foundation for an augmented clinic",
            paragraphs: [
              "VetoCrm structures consultations, vaccines, antiparasitics and histories — the clean base AI needs — while improving daily work now.",
            ],
          },
        ],
        ctaTitle: "Get AI-ready with VetoCrm",
        ctaBody: "Structured records today, a clinic ready for tomorrow’s tools.",
        ctaButton: "Explore VetoCrm",
      },
      es: {
        title: "Veterinaria e inteligencia artificial: usos reales en clínica",
        excerpt:
          "Imagen asistida, redacción de informes y agentes de recepción: lo que la IA cambia — y lo que no sustituye.",
        metaDescription:
          "IA en medicina veterinaria: radiología asistida, notas clínicas y triaje. Cómo VetoCrm prepara una clínica data-ready.",
        category: "Innovación",
        sections: [
          {
            heading: "La IA ya está en las clínicas",
            paragraphs: [
              "Lectura de imagen más rápida, apoyo al diferencial, borradores de informes y agentes telefónicos fuera de horario son usos reales.",
              "Consenso profesional: la IA aumenta al clínico; no sustituye el juicio médico ni la responsabilidad.",
            ],
          },
          {
            heading: "Tres familias de usos",
            paragraphs: ["Priorice las herramientas en tres grupos:"],
            bullets: [
              "Apoyo diagnóstico: lectura asistida de imagen.",
              "Productividad clínica: borradores de informes.",
              "Operaciones: triaje de llamadas y citas.",
            ],
          },
          {
            heading: "El requisito olvidado: datos limpios",
            paragraphs: [
              "Sin historial estructurado, la IA queda limitada. El mejor preparativo es un CRM con historiales completos.",
            ],
          },
          {
            heading: "VetoCrm: base de datos para la clínica aumentada",
            paragraphs: [
              "VetoCrm estructura consultas, vacunas e historiales — la base que la IA necesita — mejorando el día a día desde ya.",
            ],
          },
        ],
        ctaTitle: "Prepárese para la IA con VetoCrm",
        ctaBody: "Historiales estructurados hoy, clínica lista para las herramientas de mañana.",
        ctaButton: "Descubrir VetoCrm",
      },
    },
  },
  {
    slug: "comptabilite-clinique-veterinaire",
    cover: "/monde-veto/comptabilite.jpg",
    coverAlt: {
      fr: "Documents financiers et calculatrice — gestion comptable",
      en: "Financial documents and calculator — accounting management",
      es: "Documentos financieros y calculadora — gestión contable",
    },
    publishedAt: "2026-07-29",
    readingMinutes: 7,
    locales: {
      fr: {
        title: "Comptabilité vétérinaire : piloter trésorerie, facturation et marge",
        excerpt:
          "Facturer vite, suivre les impayés, maîtriser stocks et TVA : les bases d’une clinique financièrement saine.",
        metaDescription:
          "Comptabilité de clinique vétérinaire : trésorerie, facturation, stocks, TVA. Comment VetoCrm structure l’activité pour un meilleur pilotage financier.",
        category: "Gestion",
        sections: [
          {
            heading: "Une clinique est aussi une entreprise",
            paragraphs: [
              "Soigner reste le cœur du métier — mais une clinique combine actes, ventes de produits réglementés, stock, paie et trésorerie. Une comptabilité floue masque la marge réelle et met la structure sous tension.",
              "Les experts métiers insistent : facturer rapidement (idéalement en temps réel), relancer dès l’échéance, et disposer d’un prévisionnel de trésorerie sur plusieurs mois.",
            ],
          },
          {
            heading: "Les points de vigilance spécifiques au vétérinaire",
            paragraphs: ["Quelques spécificités reviennent souvent chez les cabinets et cliniques :"],
            bullets: [
              "Facturation immédiate après l’acte pour limiter le crédit client.",
              "Suivi des impayés avec procédure claire (responsable, délais, relances).",
              "Valorisation des stocks médicaments / consommables (péremptions, inventaires).",
              "Paramétrage correct des familles d’actes et produits pour la TVA applicable.",
            ],
          },
          {
            heading: "Lier le médical et le financier",
            paragraphs: [
              "Si consultations, vaccins et ventes ne sont pas saisis dans le même système que le suivi client, vous perdez la trace de ce qui génère réellement le chiffre d’affaires — et vous retardez la facturation.",
              "Un CRM avec module d’activité et de stock donne à votre expert-comptable (et à vous) des données propres : moins de ressaisie, moins d’écarts en fin de mois.",
            ],
          },
          {
            heading: "VetoCrm pour une activité mieux chiffrée",
            paragraphs: [
              "Avec VetoCrm, vous centralisez clients, actes, stock et suivi de l’activité. Vous posez les bases d’une facturation et d’un pilotage plus fiables — sans attendre la clôture pour découvrir un trou de trésorerie.",
              "Objectif : que l’équipe soigne, pendant que les flux restent visibles et actionnables.",
            ],
          },
        ],
        ctaTitle: "Clarifiez la gestion avec VetoCrm",
        ctaBody:
          "Centralisez l’activité clinique et le stock pour mieux facturer et mieux piloter. VetoCrm vous y aide au quotidien.",
        ctaButton: "Voir les offres VetoCrm",
      },
      en: {
        title: "Veterinary accounting: cash flow, billing and margin",
        excerpt:
          "Bill fast, track unpaid invoices, control stock and tax settings: the basics of a financially healthy clinic.",
        metaDescription:
          "Veterinary clinic accounting: cash flow, billing, inventory, VAT. How VetoCrm structures activity for better financial control.",
        category: "Management",
        sections: [
          {
            heading: "A clinic is also a business",
            paragraphs: [
              "Care is the core — but clinics combine procedures, regulated product sales, stock, payroll and cash. Fuzzy accounting hides true margin.",
              "Best practice: bill quickly, chase dues on time, and keep a multi-month cash forecast.",
            ],
          },
          {
            heading: "Veterinary-specific watchpoints",
            paragraphs: ["Common pressure points include:"],
            bullets: [
              "Immediate billing after the visit.",
              "Clear unpaid-invoice process.",
              "Drug/consumable stock valuation and expiry.",
              "Correct tax setup by service/product family.",
            ],
          },
          {
            heading: "Connect clinical and financial data",
            paragraphs: [
              "If consults and sales live outside your client system, billing slows and visibility drops.",
              "A CRM with activity and stock modules gives cleaner numbers for you and your accountant.",
            ],
          },
          {
            heading: "VetoCrm for clearer financial control",
            paragraphs: [
              "VetoCrm centralizes clients, procedures, stock and activity tracking — so cash issues show up early, not at month-end.",
            ],
          },
        ],
        ctaTitle: "Clarify management with VetoCrm",
        ctaBody: "Centralize clinical activity and stock to bill and steer with confidence.",
        ctaButton: "See VetoCrm plans",
      },
      es: {
        title: "Contabilidad veterinaria: tesorería, facturación y margen",
        excerpt:
          "Facturar rápido, seguir impagos y controlar stock: bases de una clínica financieramente sana.",
        metaDescription:
          "Contabilidad de clínica veterinaria: tesorería, facturación, stock e impuestos. Cómo VetoCrm estructura la actividad para mejor control.",
        category: "Gestión",
        sections: [
          {
            heading: "Una clínica también es una empresa",
            paragraphs: [
              "Cuidar es el núcleo, pero la clínica combina actos, ventas, stock, nómina y tesorería. Una contabilidad difusa oculta el margen real.",
              "Buena práctica: facturar rápido, reclamar a tiempo y prever la tesorería a varios meses.",
            ],
          },
          {
            heading: "Puntos de vigilancia veterinarios",
            paragraphs: ["Los puntos habituales incluyen:"],
            bullets: [
              "Facturación inmediata tras el acto.",
              "Proceso claro de impagos.",
              "Valoración de stock y caducidades.",
              "Parametrización fiscal correcta por familia.",
            ],
          },
          {
            heading: "Unir lo clínico y lo financiero",
            paragraphs: [
              "Si consultas y ventas viven fuera del sistema de clientes, la facturación se retrasa.",
              "Un CRM con actividad y stock da datos más limpios para usted y su contable.",
            ],
          },
          {
            heading: "VetoCrm para un control más claro",
            paragraphs: [
              "VetoCrm centraliza clientes, actos, stock y seguimiento de actividad para detectar problemas de caja a tiempo.",
            ],
          },
        ],
        ctaTitle: "Aclare la gestión con VetoCrm",
        ctaBody: "Centralice actividad clínica y stock para facturar y pilotar con confianza.",
        ctaButton: "Ver planes VetoCrm",
      },
    },
  },
  {
    slug: "assurance-animale-veterinaire",
    cover: "/monde-veto/assurance.jpg",
    coverAlt: {
      fr: "Chiens heureux en extérieur — santé et protection animale",
      en: "Happy dogs outdoors — pet health and protection",
      es: "Perros felices al aire libre — salud y protección animal",
    },
    publishedAt: "2026-08-01",
    readingMinutes: 6,
    locales: {
      fr: {
        title: "Assurance animale et clinique vétérinaire : mieux accompagner les propriétaires",
        excerpt:
          "Couverture accident/maladie, soins préventifs, devis : comment l’assurance change la relation de soins — et l’organisation de la clinique.",
        metaDescription:
          "Assurance chien/chat et clinique vétérinaire : remboursements, devis, traçabilité. Comment VetoCrm aide à documenter les soins pour les propriétaires assurés.",
        category: "Relation client",
        sections: [
          {
            heading: "L’assurance animale change la conversation sur les soins",
            paragraphs: [
              "Avec la hausse des coûts de santé animale, les assurances chien/chat se développent (consultations, hospitalisation, analyses, chirurgie, parfois préventif). Pour le propriétaire, c’est une sécurité financière. Pour la clinique, c’est une opportunité d’accepter des plans de soins plus complets — à condition d’être organisée.",
              "Les propriétaires posent plus de questions sur devis, justificatifs et délais de remboursement. Une clinique claire sur ses documents gagne en confiance.",
            ],
          },
          {
            heading: "Ce que la clinique doit maîtriser",
            paragraphs: ["Quelques bonnes pratiques opérationnelles :"],
            bullets: [
              "Devis et factures lisibles, avec actes et produits détaillés.",
              "Historique médical accessible pour justifier examens et traitements.",
              "Communication transparente sur ce qui est remboursable vs. hors contrat.",
              "Suivi des dossiers (pièces manquantes, relances) sans saturer l’accueil.",
            ],
          },
          {
            heading: "La traçabilité, alliée du remboursement",
            paragraphs: [
              "Un dossier incomplet (dates floues, motifs absents, traitements non listés) complique le parcours assureur et frustre le client. Un CRM avec consultations structurées, vaccins et prescriptions facilite la production de preuves.",
              "Vous ne devenez pas assureur : vous devenez le partenaire fiable qui documente correctement les soins.",
            ],
          },
          {
            heading: "VetoCrm pour des dossiers prêts à justifier les soins",
            paragraphs: [
              "VetoCrm centralise le parcours patient : consultations, vaccinations, antiparasitaires, notes et historique. Vous répondez plus vite aux demandes de justificatifs et vous professionalisez l’expérience propriétaire.",
              "Mieux documenter, c’est aussi mieux soigner dans la durée — avec moins de friction administrative.",
            ],
          },
        ],
        ctaTitle: "Documentez mieux avec VetoCrm",
        ctaBody:
          "Des dossiers clairs pour vos équipes et vos clients — y compris lorsqu’une assurance entre en jeu. Essayez VetoCrm.",
        ctaButton: "Créer mon compte VetoCrm",
      },
      en: {
        title: "Pet insurance and veterinary clinics: supporting owners better",
        excerpt:
          "Accident/illness cover, preventive care, estimates: how insurance changes care conversations — and clinic ops.",
        metaDescription:
          "Pet insurance and veterinary clinics: reimbursements, estimates, traceability. How VetoCrm helps document care for insured owners.",
        category: "Client relations",
        sections: [
          {
            heading: "Insurance changes the care conversation",
            paragraphs: [
              "As pet healthcare costs rise, insurance expands. For owners it is financial safety; for clinics it enables fuller care plans — if documentation is solid.",
              "Owners ask more about estimates and paperwork. Clear documents build trust.",
            ],
          },
          {
            heading: "What clinics should master",
            paragraphs: ["Operational best practices:"],
            bullets: [
              "Readable estimates and invoices.",
              "Accessible medical history.",
              "Transparent communication on covered vs out-of-policy items.",
              "Follow-up on missing documents without overloading reception.",
            ],
          },
          {
            heading: "Traceability helps reimbursement",
            paragraphs: [
              "Incomplete records slow insurance journeys. A CRM with structured consults and treatments makes proof easier.",
            ],
          },
          {
            heading: "VetoCrm for documentation-ready records",
            paragraphs: [
              "VetoCrm centralizes the patient journey so you answer paperwork requests faster and professionalize the owner experience.",
            ],
          },
        ],
        ctaTitle: "Document better with VetoCrm",
        ctaBody: "Clear records for your team and clients — including when insurance is involved.",
        ctaButton: "Create my VetoCrm account",
      },
      es: {
        title: "Seguro de mascotas y clínica veterinaria: acompañar mejor al propietario",
        excerpt:
          "Cobertura, preventivo y presupuestos: cómo el seguro cambia la relación de cuidados y la organización.",
        metaDescription:
          "Seguro de mascotas y clínica veterinaria: reembolsos, presupuestos y trazabilidad. Cómo VetoCrm ayuda a documentar los cuidados.",
        category: "Relación con el cliente",
        sections: [
          {
            heading: "El seguro cambia la conversación sobre cuidados",
            paragraphs: [
              "Con el alza de costes, el seguro aporta seguridad al propietario y permite planes de cuidado más completos si la clínica documenta bien.",
              "Presupuestos y justificantes claros generan confianza.",
            ],
          },
          {
            heading: "Lo que la clínica debe dominar",
            paragraphs: ["Buenas prácticas:"],
            bullets: [
              "Presupuestos y facturas legibles.",
              "Historial médico accesible.",
              "Comunicación transparente sobre coberturas.",
              "Seguimiento de documentos sin saturar la recepción.",
            ],
          },
          {
            heading: "La trazabilidad ayuda al reembolso",
            paragraphs: [
              "Historiales incompletos frenan el proceso. Un CRM con consultas estructuradas facilita las pruebas.",
            ],
          },
          {
            heading: "VetoCrm para historiales listos",
            paragraphs: [
              "VetoCrm centraliza el recorrido del paciente para responder más rápido a justificantes y profesionalizar la experiencia.",
            ],
          },
        ],
        ctaTitle: "Documente mejor con VetoCrm",
        ctaBody: "Historiales claros para su equipo y sus clientes — también cuando hay seguro.",
        ctaButton: "Crear mi cuenta VetoCrm",
      },
    },
  },
  {
    slug: "crm-gestion-clinique-veterinaire",
    cover: "/monde-veto/crm-gestion.jpg",
    coverAlt: {
      fr: "Chien et chat proches — relation de soin et suivi patient",
      en: "Dog and cat together — care relationship and patient follow-up",
      es: "Perro y gato juntos — relación de cuidado y seguimiento",
    },
    publishedAt: "2026-08-05",
    readingMinutes: 7,
    locales: {
      fr: {
        title: "Pourquoi un CRM est indispensable à une bonne gestion vétérinaire",
        excerpt:
          "Au-delà de l’agenda : clients, animaux, rappels, stock et équipe — le CRM comme système nerveux de la clinique.",
        metaDescription:
          "CRM vétérinaire : bénéfices pour la gestion de clinique, rappels, dossiers et stock. Pourquoi choisir VetoCrm pour piloter votre activité.",
        category: "CRM",
        sections: [
          {
            heading: "Le tableur et le carnet ne suffisent plus",
            paragraphs: [
              "Quand la clinique grandit (plus de patients, plus d’ASV, plus de sites ou de services), l’information se disperse : qui a rappelé ce vaccin ? Quel lot a été utilisé ? Quel propriétaire a un animal en suivi post-op ?",
              "Un CRM vétérinaire répond à une question simple : toute l’équipe voit la même vérité, au même endroit, au bon moment.",
            ],
          },
          {
            heading: "Ce qu’un bon CRM vétérinaire doit couvrir",
            paragraphs: ["Les fonctions qui changent réellement le quotidien :"],
            bullets: [
              "Fiches clients & animaux avec historique médical.",
              "Agenda et rendez-vous liés au dossier.",
              "Consultations, vaccinations, antiparasitaires et rappels.",
              "Stock et traçabilité des produits utilisés.",
              "Droits d’accès selon les rôles de l’équipe.",
            ],
          },
          {
            heading: "Impact mesurable sur la clinique",
            paragraphs: [
              "Moins de no-shows grâce aux rappels, moins d’oublis de suivi, moins de temps perdu à chercher une info, meilleure continuité des soins entre praticiens. Le CRM n’est pas « de la paperasse digitale » : c’est du temps médical récupéré.",
              "C’est aussi un outil de fidélisation : le propriétaire ressent une clinique organisée, qui anticipe les prochaines étapes de santé de son animal.",
            ],
          },
          {
            heading: "VetoCrm : le CRM pensé pour les vétérinaires",
            paragraphs: [
              "VetoCrm regroupe clients, animaux, RDV, consultations, vaccins, antiparasitaires, stock et fermes dans une expérience claire. Vous évitez le patchwork d’outils et vous standardisez les bonnes pratiques dans l’équipe.",
              "Que vous soyez cabinet solo ou clinique multi-praticiens, VetoCrm s’adapte pour devenir votre référentiel unique de gestion.",
            ],
          },
        ],
        ctaTitle: "Équipez votre clinique avec VetoCrm",
        ctaBody:
          "Un CRM vétérinaire complet pour une gestion sereine au quotidien. Démarrez et centralisez enfin vos dossiers.",
        ctaButton: "Démarrer avec VetoCrm",
      },
      en: {
        title: "Why a CRM is essential for strong veterinary management",
        excerpt:
          "Beyond the calendar: clients, patients, reminders, stock and team — CRM as the clinic’s nervous system.",
        metaDescription:
          "Veterinary CRM: benefits for clinic management, reminders, records and stock. Why choose VetoCrm to run your practice.",
        category: "CRM",
        sections: [
          {
            heading: "Spreadsheets and notebooks are not enough",
            paragraphs: [
              "As clinics grow, information scatters. A veterinary CRM answers one question: the whole team sees the same truth, in one place, at the right time.",
            ],
          },
          {
            heading: "What a good veterinary CRM must cover",
            paragraphs: ["Features that change daily work:"],
            bullets: [
              "Client & patient files with medical history.",
              "Appointments linked to the record.",
              "Consults, vaccines, antiparasitics and reminders.",
              "Stock and product traceability.",
              "Role-based access for the team.",
            ],
          },
          {
            heading: "Measurable clinic impact",
            paragraphs: [
              "Fewer no-shows, fewer missed follow-ups, less time hunting for info, better continuity of care. CRM recovers clinical time — and builds owner trust.",
            ],
          },
          {
            heading: "VetoCrm: CRM built for veterinarians",
            paragraphs: [
              "VetoCrm unifies clients, pets, appointments, consults, vaccines, antiparasitics, stock and farms — one reference system for solo practices and multi-vet clinics.",
            ],
          },
        ],
        ctaTitle: "Equip your clinic with VetoCrm",
        ctaBody: "A complete veterinary CRM for calmer daily management.",
        ctaButton: "Start with VetoCrm",
      },
      es: {
        title: "Por qué un CRM es indispensable para una buena gestión veterinaria",
        excerpt:
          "Más allá de la agenda: clientes, pacientes, recordatorios y stock — el CRM como sistema nervioso de la clínica.",
        metaDescription:
          "CRM veterinario: beneficios para gestión, recordatorios, historiales y stock. Por qué elegir VetoCrm.",
        category: "CRM",
        sections: [
          {
            heading: "Hojas de cálculo y libretas ya no bastan",
            paragraphs: [
              "Al crecer la clínica, la información se dispersa. Un CRM responde: todo el equipo ve la misma verdad, en un solo lugar.",
            ],
          },
          {
            heading: "Qué debe cubrir un buen CRM veterinario",
            paragraphs: ["Funciones que cambian el día a día:"],
            bullets: [
              "Fichas de cliente y paciente con historial.",
              "Citas ligadas al expediente.",
              "Consultas, vacunas, antiparasitarios y recordatorios.",
              "Stock y trazabilidad.",
              "Permisos por rol.",
            ],
          },
          {
            heading: "Impacto medible",
            paragraphs: [
              "Menos ausencias, menos olvidos de seguimiento y mejor continuidad asistencial. El CRM recupera tiempo clínico.",
            ],
          },
          {
            heading: "VetoCrm: CRM pensado para veterinarios",
            paragraphs: [
              "VetoCrm unifica clientes, animales, citas, consultas, vacunas, stock y granjas — un único referente para gabinetes y clínicas multi-veterinario.",
            ],
          },
        ],
        ctaTitle: "Equipe su clínica con VetoCrm",
        ctaBody: "Un CRM veterinario completo para una gestión diaria más serena.",
        ctaButton: "Empezar con VetoCrm",
      },
    },
  },
  {
    slug: "nouvelles-pratiques-veterinaires",
    cover: "/monde-veto/nouvelles-pratiques.jpg",
    coverAlt: {
      fr: "Chien en consultation — nouvelles pratiques de soins",
      en: "Dog in consultation — modern care practices",
      es: "Perro en consulta — nuevas prácticas de cuidado",
    },
    publishedAt: "2026-08-08",
    readingMinutes: 6,
    locales: {
      fr: {
        title: "Nouvelles pratiques vétérinaires : ce qui transforme les cliniques aujourd’hui",
        excerpt:
          "Parcours patient digital, médecine préventive, multi-sites et expérience propriétaire : les tendances à intégrer.",
        metaDescription:
          "Nouvelles pratiques en clinique vétérinaire : prévention, digital, expérience client. Comment VetoCrm soutient la modernisation du cabinet.",
        category: "Pratiques",
        sections: [
          {
            heading: "La clinique moderne ne se limite plus à la consultation",
            paragraphs: [
              "Les attentes évoluent : prévention proactive (vaccins, antiparasitaires, bilans), communication claire, suivi entre deux visites, et une organisation capable d’absorber les pics d’activité sans épuiser l’équipe.",
              "Les structures qui progressent standardisent leurs protocoles, mesurent leur activité et digitalisent le parcours — sans déshumaniser le soin.",
            ],
          },
          {
            heading: "Cinq pratiques qui gagnent du terrain",
            paragraphs: ["Voici les mouvements les plus visibles sur le terrain :"],
            bullets: [
              "Médecine préventive industrialisée : protocoles + rappels automatiques.",
              "Parcours digital du propriétaire : RDV, infos, historique accessible à l’équipe.",
              "Travail d’équipe formalisé : rôles ASV / vétérinaire, checklists, transmission.",
              "Multi-services : consultations, vaccins, stock, parfois rural / fermes.",
              "Expérience client : devis compris, suivi post-acte, moins d’attente administrative.",
            ],
          },
          {
            heading: "Standardiser sans rigidifier",
            paragraphs: [
              "La modernisation réussit quand les process sont simples et tenus dans l’outil du quotidien. Si le protocole vit dans un PDF oublié et que le dossier est ailleurs, rien ne change vraiment.",
              "Un CRM devient alors le support de la nouvelle pratique : chaque consultation, chaque rappel, chaque produit sorti du stock laisse une trace utile.",
            ],
          },
          {
            heading: "VetoCrm, partenaire des cliniques qui se modernisent",
            paragraphs: [
              "VetoCrm aide à ancrer ces nouvelles pratiques : dossiers complets, rappels, stock, rendez-vous et vision d’ensemble pour l’équipe. Vous modernisez l’organisation pour mieux soigner — pas pour ajouter de la complexité.",
              "C’est le moment d’équiper votre clinique d’un outil à la hauteur de vos ambitions cliniques.",
            ],
          },
        ],
        ctaTitle: "Modernisez votre pratique avec VetoCrm",
        ctaBody:
          "Adoptez un CRM qui soutient prévention, suivi et organisation d’équipe. Rejoignez les cliniques qui avancent avec VetoCrm.",
        ctaButton: "Essayer VetoCrm",
      },
      en: {
        title: "New veterinary practices: what is reshaping clinics today",
        excerpt:
          "Digital patient journeys, preventive medicine, multi-site ops and owner experience: trends to adopt.",
        metaDescription:
          "New veterinary clinic practices: prevention, digital journeys, client experience. How VetoCrm supports practice modernization.",
        category: "Practices",
        sections: [
          {
            heading: "The modern clinic is more than the consult",
            paragraphs: [
              "Expectations now include proactive prevention, clear communication, between-visit follow-up, and ops that absorb peaks without burning out the team.",
            ],
          },
          {
            heading: "Five practices gaining ground",
            paragraphs: ["Visible shifts in the field:"],
            bullets: [
              "Industrialized preventive care with automated reminders.",
              "Digital owner journey.",
              "Formalized team workflows.",
              "Multi-service delivery including farms where relevant.",
              "Stronger client experience with clearer estimates and follow-up.",
            ],
          },
          {
            heading: "Standardize without freezing creativity",
            paragraphs: [
              "Modernization works when processes live in the daily tool. A CRM becomes the backbone of new practice habits.",
            ],
          },
          {
            heading: "VetoCrm for clinics that modernize",
            paragraphs: [
              "VetoCrm anchors records, reminders, stock and appointments so you modernize organization to care better — not to add complexity.",
            ],
          },
        ],
        ctaTitle: "Modernize with VetoCrm",
        ctaBody: "A CRM that supports prevention, follow-up and team organization.",
        ctaButton: "Try VetoCrm",
      },
      es: {
        title: "Nuevas prácticas veterinarias: lo que transforma las clínicas hoy",
        excerpt:
          "Recorrido digital, medicina preventiva y experiencia del propietario: tendencias a integrar.",
        metaDescription:
          "Nuevas prácticas en clínica veterinaria: prevención, digital y experiencia cliente. Cómo VetoCrm apoya la modernización.",
        category: "Prácticas",
        sections: [
          {
            heading: "La clínica moderna va más allá de la consulta",
            paragraphs: [
              "Las expectativas incluyen prevención proactiva, comunicación clara, seguimiento entre visitas y una organización que aguante picos sin agotar al equipo.",
            ],
          },
          {
            heading: "Cinco prácticas en auge",
            paragraphs: ["Movimientos visibles:"],
            bullets: [
              "Prevención con recordatorios automáticos.",
              "Recorrido digital del propietario.",
              "Flujos de equipo formalizados.",
              "Multi-servicios (consultas, vacunas, stock, granjas).",
              "Mejor experiencia cliente.",
            ],
          },
          {
            heading: "Estandarizar sin rigidizar",
            paragraphs: [
              "La modernización funciona cuando el proceso vive en la herramienta diaria. Un CRM sostiene el nuevo hábito.",
            ],
          },
          {
            heading: "VetoCrm, aliado de clínicas que se modernizan",
            paragraphs: [
              "VetoCrm ancla historiales, recordatorios, stock y citas para modernizar la organización y cuidar mejor.",
            ],
          },
        ],
        ctaTitle: "Modernice con VetoCrm",
        ctaBody: "Un CRM que apoya prevención, seguimiento y organización del equipo.",
        ctaButton: "Probar VetoCrm",
      },
    },
  },
];

/** All Monde Veto articles (guides + SEO comparatifs). */
export const BLOG_ARTICLES: BlogArticle[] = [...BLOG_STATIC_ARTICLES, ...BLOG_SEO_ARTICLES];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function resolveBlogLang(lang?: string): BlogLang {
  const base = (lang || "fr").split("-")[0] as BlogLang;
  return base === "en" || base === "es" || base === "fr" ? base : "fr";
}
