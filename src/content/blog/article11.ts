import type { BlogArticle } from "./types";

export const ARTICLE_11: BlogArticle = {
  slug: "digital-veterinary-patient-records",
  cover: "/monde-veto/screen-patients.png",
  coverAlt: {
    fr: "Dossiers patients VetoCrm — gestion des historiques vétérinaires",
    en: "VetoCrm patient records — veterinary medical record management",
    es: "Historiales de pacientes VetoCrm — gestión de fichas veterinarias",
  },
  publishedAt: "2027-03-26",
  readingMinutes: 11,
  locales: {
    en: {
      title:
        "How to Manage Veterinary Patient Records: Digital vs Paper Records",
      excerpt:
        "Digital veterinary patient records versus paper: confidentiality, access control, continuity of care, and a migration checklist—focused on records, not broad clinic digitization.",
      metaDescription:
        "Digital veterinary patient records vs paper: confidentiality, retention, migration checklist. Differs from digitization overview. VetoCrm patients, consults, storage add-ons.",
      category: "Medical records",
      sections: [
        {
          heading: "This is a records guide—not a full digitization manifesto",
          paragraphs: [
            "Teams searching for digital veterinary patient records often land on transformation articles about online booking, marketing automations, or SMS bundles. Those topics matter, but they do not answer the records manager's question: how do we store, retrieve, and protect clinical history for each patient when paper cupboards, USB sticks, and a new PIMS coexist?",
            "This page compares paper versus digital veterinary patient records for daily clinical governance: who may read what, how consults link to vaccines and prescriptions, how attachments move, and how mixed practices keep farm and companion narratives separated. For the broader why-digitize narrative, see /monde-veto/digitalisation-clinique-veterinaire—that article is about clinic-wide change; this one is about the medical record object and its migration.",
            "Clinical workflow depth lives in /monde-veto/veterinary-crm-clients-pets-relationships and efficiency in /monde-veto/veterinary-clinic-efficiency-strategies. Financial record truth connects to /monde-veto/veterinary-practice-profitability when billing lines must match dispensed care.",
            "VetoCrm references use only confirmed modules: clients and patients, appointments with reminders, consults and prescriptions, vaccines and antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, free starter tier, storage add-ons, read-only demo, cloud FR/EN/ES. No invented lab interfaces or unsupported archival certifications.",
          ],
        },
        {
          heading: "What counts as a veterinary patient record",
          paragraphs: [
            "A patient record is more than a PDF stack. Minimum scope: identity (species, identifiers, weight history), clinical events (consults, diagnoses, prescriptions), preventives with next due dates, imaging or referral letters if kept, anesthesia and surgery notes where applicable, and owner communication relevant to care.",
            "Paper traditions split this across envelopes, nursing cards, and lab fax trays. Digital veterinary patient records unify events in chronological order with author, timestamp, and role permissions—whether or not every attachment is digitized day one.",
            "Define internally whether invoices live inside the clinical record or adjacent ledger. Finance needs billing lines; clinicians need medical narrative. Integrated PIMS tools keep them linked without forcing accountants to scroll nursing vitals.",
            "Farm patients add location, herd or batch context, and visit routes. Multi-organization setups should isolate legal entities while sharing templates—validate that pattern in demo when companion and production animals share software.",
            "Prescriptions and refill requests belong in the record trail when they affect ongoing care—not on sticky notes that never enter the PIMS.",
            "Controlled substance rules may still require parallel paper logs in some jurisdictions; mark in the migration checklist which ledger stays authoritative until regulators accept full electronic capture.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient record hub — consult history, preventives, and identifiers in one digital file.",
        },
        {
          heading: "Paper records: strengths and failure modes",
          paragraphs: [
            "Paper still wins when power fails, when a locum needs a physical envelope fast, or when legacy archives never received budget to scan. Marked margins, clinician handwriting, and sticky tab rituals carry tacit knowledge.",
            "Failure modes are predictable. Duplication: two envelopes for one microchip. Opacity: night shift cannot read locked cupboard consults from yesterday. Loss: wet floors, misfiled radiographs, fire. Medico-legal gaps: undated additive notes, unclear authorship.",
            "Paper is not free. Physical storage, retrieval labor, and double entry into accounting burn margin. If you keep paper parallel to digital longer than a transition window, assign an explicit sunset date or you will maintain two truths indefinitely.",
            "Confidentiality on paper requires physical access control: locked rooms, sign-out logs for sensitive files, shredding contracts. Training beats policy posters—reception must know which envelopes cannot sit on the counter.",
          ],
        },
        {
          heading: "Digital records: strengths and honest limits",
          paragraphs: [
            "Digital veterinary patient records shine in search, handoffs, preventives tied to due dates, and permissioned edits. A nurse opening night duty sees vaccine reactions logged last visit; a partner approves prescription renewals without re-interviewing the owner.",
            "Cloud access fits multi-site groups if governance is clear: same record standards, not same password sharing. French, English, and Spanish UI options help mixed teams—VetoCrm confirms trilingual cloud access without claiming every locale has dedicated legal templates.",
            "Limits are real. Scan quality may be illegible without standards. Attachment volume hits storage tiers—budget VetoCrm storage add-ons before bulk imaging imports. Cloud dependency demands offline playbooks for emergencies.",
            "Digital does not auto-cure privacy. Screens left unlocked, exported spreadsheets on USB, and over-broad admin roles recreate paper risks in pixels.",
          ],
        },
        {
          heading: "Confidentiality, retention, and access roles",
          paragraphs: [
            "Map roles to least privilege: reception updates contacts; nurses add vitals; veterinarians sign consults; managers run aggregates without browsing every clinical note unless policy requires.",
            "Retention rules depend on jurisdiction—this article does not substitute legal counsel. Operationally, know what you will export if a client requests history, how backups run, and who approves deletion of duplicates versus archival suppression.",
            "Client communication belongs in the record when it affects care; marketing memos belong elsewhere. Separate internal coordination notes from owner-facing discharge instructions to reduce contradiction risk.",
            "Multi-organization clinics must test that user A in entity 1 cannot open entity 2 patients—a common demo checkpoint for VetoCrm farm/companion separation.",
          ],
        },
        {
          heading: "Paper versus digital: decision matrix",
          paragraphs: [
            "Use this matrix in a partner meeting—not to declare winner, but to choose hybrid duration.",
          ],
          bullets: [
            "Search speed: digital wins for microchip, surname variants, vaccine due filters.",
            "Transition cost: paper wins short-term if scanning backlog is years deep—unless risk of loss exceeds scan budget.",
            "Preventive recall: digital wins when due dates live on patient records and feed appointment queues.",
            "Audit trail: digital wins when consult signatures, timestamps, and amendment logs are enforced.",
            "Field work: paper or offline checklists may persist for farm visits until mobile capture is disciplined.",
            "Custody chain: tie on controlled substances if both paper logs and electronic dispense exist—pick one source of truth.",
          ],
        },
        {
          heading: "Migration checklist (paper → digital)",
          paragraphs: [
            "Move in waves, not a big-bang weekend. Assign a records captain and publish a dated checklist visible to the whole clinic.",
          ],
          bullets: [
            "Phase 0 — Policy: retention, roles, attachment naming, what stays paper temporarily.",
            "Phase 1 — Master data: clients and patients with identifiers; dedupe before scan marathon.",
            "Phase 2 — Live consults digital-first: no new paper consult sheets except statutory exceptions.",
            "Phase 3 — Preventives: enter next due dates on every active patient; validate vaccine/antiparasitic history accuracy on high-risk cohort.",
            "Phase 4 — Scan backlog: prioritize active patients 24 months, surgical cases, chronic meds; QA 5% sample legibility weekly.",
            "Phase 5 — Attachments: imaging and referrals with storage tier confirmed; purchase add-ons before bulk upload.",
            "Phase 6 — Parallel run: define stop date for paper checkout; audit five random patients weekly for split records.",
            "Phase 7 — Export drill: practice client history export and backup restore before decommissioning cupboards.",
            "Phase 8 — Train handoffs: locum playbook for digital search + one-page emergency paper fallback list.",
            "Phase 9 — Review: manager signs checklist; archive paper with access log or shred per policy.",
          ],
        },
        {
          heading: "Daily habits that keep digital records trustworthy",
          paragraphs: [
            "Close consults before checkout so invoices and stock see the same narrative clinicians promise owners. Template consults reduce missing vitals that break continuity when a different vet reads the file Thursday.",
            "Vaccine and antiparasitic administration must write next due dates—not optional fields. Digital veterinary patient records without due dates become fancy PDF storage; retention loops stall.",
            "Nightly hygiene: log out shared stations, clear exported CSV drafts, and spot-check two records for unsigned consults. Weekly: five-patient sample for orphan attachments (files uploaded without patient link).",
            "Storage growth is a clinical metric. If imaging doubles record size, revisit compression standards and plan tier before performance degrades.",
          ],
        },
        {
          heading: "Imaging, referrals, and attachment standards",
          paragraphs: [
            "Attachments turn digital veterinary patient records from text into medico-legal assets. Standardize file naming: YYYY-MM-DD_species_owner_summary.pdf—not camera roll IMG_4042.jpg buried in uploads.",
            "Define maximum sensible resolution for radiograph exports; clinic teams often scan at excessive DPI, swelling storage without clinical benefit. Confirm compression in your imaging vendor workflow before blaming the PIMS.",
            "Referral letters should link to the consult that triggered them so a locum understands why an external specialist was involved. If your plan limits storage, prioritize cardiology, oncology, and chronic renal cohorts over inactive ten-year wellness PDFs in phase 4 scanning.",
            "When owners email photos, ingest through controlled channels—ad hoc WhatsApp photos rarely land in the formal record unless staff discipline copies them same day.",
          ],
        },
        {
          heading: "Owner requests, exports, and continuity",
          paragraphs: [
            "Owners increasingly ask for history portability when moving cities. Rehearse export steps before a Friday-afternoon rush: who approves, what format leaves the building, which attachments are excluded if third-party copyright applies.",
            "Transfers to another clinic should transmit continuity essentials—current meds, allergies, last surgery, vaccine proof—not every internal nursing note if policy separates clinical handoff from full legal archive.",
            "Digital veterinary patient records make duplicate care less likely when inbound clinics can read structured preventives. Outbound quality still depends on your outbound clerk reading the checklist, not on software magic.",
          ],
        },
        {
          heading: "How records tie to KPIs and margin",
          paragraphs: [
            "Incomplete records harm KPI 9 preventive compliance and inflate dispute time on invoices. Every missing due date is tomorrow's lapsed client phone pile.",
            "Record closure discipline supports profitability (/monde-veto/veterinary-practice-profitability) because billable narrative and stock consumption share the same consult object. Split records—paper nursing card plus digital invoice—are where margin arguments begin.",
            "Patient record quality is a leading indicator; revenue KPIs are lagging. Fix the record before chasing ATV.",
          ],
        },
        {
          heading: "Where VetoCrm fits",
          paragraphs: [
            "VetoCrm provides integrated digital veterinary patient records in cloud: client and patient files, consults and prescriptions, vaccines and antiparasitics with history, appointments and reminders, optional farm modules, and multi-organization roles. Accounting and inventory tie to plans—not every export exists on the free starter tier.",
            "Start read-only demo to validate search, consult templates, and attachment workflow. Use /register free starter with fictional patients to rehearse migration checklist phases 1–3 before importing scans. Confirm storage add-ons on /pricing before phase 5 imaging.",
            "Read-only demo helps owners see UI in FR/EN/ES without risking live data during policy workshops.",
          ],
        },
      ],
      faq: [
        {
          q: "How is this different from the digitization article?",
          a: "/monde-veto/digitalisation-clinique-veterinaire covers clinic-wide digital transformation; this page focuses on patient record format, confidentiality, and migration.",
        },
        {
          q: "Must we destroy all paper immediately?",
          a: "No—use a phased checklist with a published stop date for new paper consults and a scan priority for active patients.",
        },
        {
          q: "Does VetoCrm include unlimited record storage?",
          a: "Storage depends on plan and add-ons—confirm on /pricing before bulk scans.",
        },
        {
          q: "Who should own the migration checklist?",
          a: "A records captain—often lead nurse plus practice manager—with partner sign-off on retention policy.",
        },
        {
          q: "Can farm and companion records share one database?",
          a: "Yes with governance; use multi-organization isolation where legal entities differ—validate in demo.",
        },
        {
          q: "Are digital records more legally safe than paper?",
          a: "Neither is automatic; audit trails and access control make digital easier to defend when used consistently.",
        },
      ],
      ctaTitle: "Manage patient records in VetoCrm",
      ctaBody:
        "Explore the demo, confirm storage on /pricing, and rehearse migration on /register.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Gérer le dossier patient vétérinaire : numérique ou papier",
      excerpt:
        "Dossier patient vétérinaire numérique vs papier : confidentialité, continuité des soins, checklist de migration — pas un guide de digitalisation globale.",
      metaDescription:
        "Historique patient vétérinaire numérique vs papier : confidentialité, conservation, migration. Différent de la digitalisation clinique. VetoCrm patients, stockage.",
      category: "Dossier médical",
      sections: [
        {
          heading: "Guide dossier — pas manifeste digital",
          paragraphs: [
            "Les recherches sur les dossiers patients vétérinaires numériques ne doivent pas se confondre avec la transformation digitale globale : /monde-veto/digitalisation-clinique-veterinaire traite le parcours clinique ; cette page le contenu médical, la confidentialité et la migration.",
            "Voir aussi CRM /monde-veto/veterinary-crm-clients-pets-relationships et efficacité. VetoCrm confirmé : clients/patients, RDV/rappels, consultations, vaccins, stock/compta selon formule, fermes, multi-organisation, formule gratuite, stockage optionnel, démo, FR/EN/ES.",
          ],
        },
        {
          heading: "Contenu du dossier patient",
          paragraphs: [
            "Identité, événements cliniques, préventifs avec échéances, pièces jointes soignées, communication utile au soin. Facturation liée mais narrative médicale distincte.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Hub patient — historique et préventifs.",
        },
        {
          heading: "Papier : atouts et limites",
          paragraphs: [
            "Résilience coupures ; risque de doublons, pertes, passations floues. Coût stockage et double saisie. Contrôle physique et formation accueil.",
          ],
        },
        {
          heading: "Numérique : atouts et limites",
          paragraphs: [
            "Recherche, permissions, échéances préventives. Dépendance cloud, qualité scan, stockage — options VetoCrm sur /pricing.",
          ],
        },
        {
          heading: "Confidentialité et rôles",
          paragraphs: [
            "Moindre privilège ; conservation selon juridiction ; notes internes vs consignes client ; test multi-organisation en démo.",
          ],
        },
        {
          heading: "Matrice papier / numérique",
          paragraphs: ["Comparaison pour durée hybride."],
          bullets: [
            "Recherche : numérique.",
            "Coût transition : papier court terme si arriéré scan énorme.",
            "Rappels : numérique si échéances sur fiche animal.",
            "Traçabilité : numérique si signatures horodatées.",
            "Terrain ferme : papier temporaire possible.",
            "Stupéfiants : une seule source de vérité.",
          ],
        },
        {
          heading: "Checklist migration",
          paragraphs: ["Migration par vagues avec responsable dossier."],
          bullets: [
            "Phase 0 politique et rôles.",
            "Phase 1 données maîtres clients/patients.",
            "Phase 2 consultations d'abord en numérique.",
            "Phase 3 préventifs et échéances.",
            "Phase 4 scan priorité actifs 24 mois.",
            "Phase 5 pièces jointes et stockage.",
            "Phase 6 double run avec date d'arrêt papier.",
            "Phase 7 test export sauvegarde.",
            "Phase 8 formation locums.",
            "Phase 9 archivage ou destruction papier.",
          ],
        },
        {
          heading: "Habitudes quotidiennes",
          paragraphs: [
            "Clôturer consult avant caisse ; échéances vaccins obligatoires ; hygiène sessions partagées ; surveiller croissance stockage.",
          ],
        },
        {
          heading: "Pièces jointes et imagerie",
          paragraphs: [
            "Nommage standard, résolution raisonnable, lettres de référence liées à la consult.",
          ],
        },
        {
          heading: "Exports propriétaires",
          paragraphs: [
            "Réussir les demandes d'historique avant l'urgence du vendredi ; transfert structuré entre cliniques.",
          ],
        },
        {
          heading: "Lien KPI et marge",
          paragraphs: [
            "Dossier incomplet nuit aux préventifs et à la facturation — voir KPI et rentabilité.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "Dossiers cloud intégrés ; démo lecture seule ; /register pour bacs à sable ; stockage sur /pricing avant scans masse.",
          ],
        },
      ],
      faq: [
        {
          q: "Différence avec article digitalisation ?",
          a: "Digitalisation = transformation globale ; ici = dossier patient et migration.",
        },
        {
          q: "Détruire tout le papier tout de suite ?",
          a: "Non — phases avec date d'arrêt des nouvelles fiches papier.",
        },
        {
          q: "Stockage illimité ?",
          a: "Selon formule et options — /pricing.",
        },
        {
          q: "Qui pilote la migration ?",
          a: "Responsable dossier (souvent ASV référente + manager).",
        },
        {
          q: "Fermes et compagnons ?",
          a: "Possible ; isoler entités juridiques si besoin.",
        },
        {
          q: "Numérique plus sûr juridiquement ?",
          a: "Seulement avec traçabilité et accès maîtrisés.",
        },
      ],
      ctaTitle: "Centralisez les dossiers dans VetoCrm",
      ctaBody: "Démo, /pricing, /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Cómo gestionar historiales veterinarios: registros digitales vs papel",
      excerpt:
        "Historial de pacientes veterinarios digital vs papel: confidencialidad, continuidad asistencial, checklist de migración — no digitalización genérica.",
      metaDescription:
        "Fichas veterinarias digitales vs papel: confidencialidad, retención, migración. Distinto de digitalización clínica. VetoCrm pacientes, almacenamiento.",
      category: "Historial médico",
      sections: [
        {
          heading: "Guía del historial, no manifiesto digital",
          paragraphs: [
            "Las búsquedas sobre fichas veterinarias digitales no deben confundirse con transformación global: /monde-veto/digitalisation-clinique-veterinaire es cambio de clínica; aquí el objeto historial, confidencialidad y migración.",
            "VetoCrm confirmado: clientes/pacientes, citas/recordatorios, consultas, vacunas, inventario/contabilidad por plan, granjas, multiorganización, plan gratis, almacenamiento, demo FR/EN/ES.",
          ],
        },
        {
          heading: "Qué entra en el historial",
          paragraphs: [
            "Identidad, eventos clínicos, preventivos con vencimiento, adjuntos, comunicación clínica. Facturación vinculada pero narrativa médica separada.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Paciente — historial y preventivos.",
        },
        {
          heading: "Papel: ventajas y fallos",
          paragraphs: [
            "Útil en cortes de luz ; riesgo duplicados, pérdidas, relevos opacos. Coste físico y doble entrada.",
          ],
        },
        {
          heading: "Digital: ventajas y límites",
          paragraphs: [
            "Búsqueda, permisos, recordatorios preventivos. Cloud, calidad de escaneo, almacenamiento en /pricing.",
          ],
        },
        {
          heading: "Confidencialidad",
          paragraphs: [
            "Mínimo privilegio ; retención según ley local ; notas internas vs alta al cliente ; aislamiento multiorganización.",
          ],
        },
        {
          heading: "Matriz papel vs digital",
          paragraphs: ["Para decidir híbrido temporal."],
          bullets: [
            "Búsqueda: digital.",
            "Coste migración: papel a corto plazo si backlog enorme.",
            "Recall preventivo: digital con fechas en ficha.",
            "Auditoría: digital con firmas.",
            "Campo granjas: papel provisional posible.",
            "Controlados: una fuente de verdad.",
          ],
        },
        {
          heading: "Checklist de migración",
          paragraphs: ["Por fases con responsable."],
          bullets: [
            "Fase 0 política.",
            "Fase 1 datos maestros.",
            "Fase 2 consultas solo digital.",
            "Fase 3 preventivos.",
            "Fase 4 escaneo pacientes activos.",
            "Fase 5 adjuntos y almacenamiento.",
            "Fase 6 doble registro con fecha fin papel.",
            "Fase 7 exportación y copia.",
            "Fase 8 formación relevos.",
            "Fase 9 archivo o destrucción papel.",
          ],
        },
        {
          heading: "Hábitos diarios",
          paragraphs: [
            "Cerrar consulta antes de caja ; vencimientos obligatorios ; higiene de pantallas ; vigilar almacenamiento.",
          ],
        },
        {
          heading: "Adjuntos e imagen",
          paragraphs: [
            "Nombres estándar, resolución razonable, referencias ligadas a la consulta.",
          ],
        },
        {
          heading: "Exportaciones al propietario",
          paragraphs: [
            "Ensayar extracción de historial antes de urgencias ; traspaso estructurado.",
          ],
        },
        {
          heading: "KPI y margen",
          paragraphs: [
            "Historial incompleto afecta preventivos y facturación.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "Historiales integrados en cloud ; demo ; /register prueba ; almacenamiento en /pricing.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Distinto del artículo de digitalización?",
          a: "Digitalización = clínica entera ; esto = historial y migración.",
        },
        {
          q: "¿Eliminar todo el papel ya?",
          a: "No — fases con fecha de cese de papel nuevo.",
        },
        {
          q: "¿Almacenamiento ilimitado?",
          a: "Según plan — /pricing.",
        },
        {
          q: "¿Quién lidera?",
          a: "Responsable de historiales (enfermería + gestión).",
        },
        {
          q: "¿Granjas y compañía?",
          a: "Sí con gobernanza y multiorganización.",
        },
        {
          q: "¿Digital más legal?",
          a: "Solo con trazabilidad constante.",
        },
      ],
      ctaTitle: "Gestione historiales en VetoCrm",
      ctaBody: "Demo, /pricing, /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};