import type { BlogArticle } from "./types";

export const ARTICLE_14: BlogArticle = {
  slug: "digitize-veterinary-clinic-step-by-step",
  cover: "/monde-veto/digitalisation.jpg",
  coverAlt: {
    fr: "Équipe clinique numérique — transformation digitale vétérinaire",
    en: "Digital clinical team — veterinary digital transformation",
    es: "Equipo clínico digital — transformación digital veterinaria",
  },
  publishedAt: "2027-04-16",
  readingMinutes: 12,
  locales: {
    en: {
      title:
        "How to Digitize a Veterinary Clinic: A Step-by-Step Guide",
      excerpt:
        "A phased digital transformation veterinary practice roadmap: governance, records, scheduling, training, KPIs, and common failure modes—operational depth beyond a why-digitize overview.",
      metaDescription:
        "Digitize a veterinary clinic step by step: roadmap, training, KPIs, challenges. Digital transformation veterinary practice guide. Links records, automation, digitization overview. VetoCrm.",
      category: "Digital transformation",
      sections: [
        {
          heading:
            "Digital transformation veterinary practice: from slogan to weekly rhythm",
          paragraphs: [
            "Digitizing a veterinary clinic is not buying software on a Tuesday and declaring victory on Friday. Digital transformation veterinary practice change is a sequence of governance decisions, record standards, scheduling discipline, stock truth, and staff habits measured in months—not a marketing pillar list read once at an away day.",
            "This article is a step-by-step implementation guide: phases, owners, training blocks, KPIs, and realistic challenges. For the shorter why-digitize narrative and four foundational pillars, see /monde-veto/digitalisation-clinique-veterinaire—that page orients leadership; this one is the project plan your practice manager can execute.",
            "Clinical record depth lives in /monde-veto/digital-veterinary-patient-records (paper versus digital object, confidentiality, migration). Operational automation sequencing sits in /monde-veto/veterinary-practice-automation-tasks. We cite VetoCrm only with confirmed capabilities: clients and patients, appointments with reminders, consults and prescriptions, vaccines and antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, free starter tier, storage add-ons, read-only demo, cloud FR/EN/ES. No invented online booking portals, SMS bundles, or customer transformation statistics.",
            "Read end-to-end once, then assign phase owners before any vendor invoice.",
          ],
        },
        {
          heading: "Phase 0 — Charter and scope (weeks 1–2)",
          paragraphs: [
            "Phase 0 prevents scope creep. Partner memo should answer: which sites migrate, which species (companion, farm, both), whether multi-organization legal entities need isolation, and what stays paper for ninety days (e.g., consent forms awaiting scan workflow).",
            "Name a transformation lead (vet or practice manager) plus a clinical records captain (often lead nurse). Define non-negotiables: every closed consult must carry vaccine due dates where applicable; no shadow Excel for live clients after Phase 2 go-live.",
            "Stakeholder map includes locums, weekend staff, and external accountants who receive exports—not only full-time vets. Budget training hours as seriously as subscription cost.",
            "Write explicit out-of-scope items: rebranding the website, buying hardware you defer, or integrating tools not confirmed on vendor sites. Digital transformation veterinary practice projects fail when marketing tags along.",
            "Set a single source for project updates—a weekly email, not hallway rumors. Owners who hear contradictory messages lose patience before go-live.",
          ],
          bullets: [
            "Written scope and success definition at 90 days.",
            "Entity and farm module requirements validated.",
            "Role list drafted (reception, nurse, vet, manager, read-only accountant).",
            "Risk register: connectivity, attachment volume, legacy desktop exports.",
            "Communication plan to pet owners (what changes for them, if anything).",
          ],
        },
        {
          heading: "Phase 1 — Client and patient digital foundation",
          paragraphs: [
            "Digital transformation veterinary practice fails when teams jump to dashboards before master data is trustworthy. Phase 1 builds owner–patient graph in the PIMS: deduplicated contacts, species and identifiers, active versus archived patients.",
            "Reception owns data quality: merge duplicates, standardize phone order, document who may edit clinical fields. Clinicians resist digitization if search returns three versions of Mrs. Chen's labrador.",
            "Run a two-week daily stand-up: count of new registrations entered same-day, count of unresolved duplicates, percent patients with microchip or ID field populated where policy requires.",
            "VetoCrm confirms integrated client and patient modules; rehearse search and household linking on read-only demo before production import.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Client–patient foundation—first stable layer of clinic digitization.",
        },
        {
          heading: "Phase 2 — Digital veterinary patient records in daily use",
          paragraphs: [
            "Phase 2 shifts consult closure from paper-first to record-first. Align with /monde-veto/digital-veterinary-patient-records: consult templates, prescription linkage, attachment naming, retention policy, role permissions.",
            "Minimum consult habit: sign-out includes next vaccine or antiparasitic due date on the patient record—not a sticky note. Checkout cannot complete if your policy flags blank preventives (validate whether your plan enforces hard stops or soft warnings in demo).",
            "Scan legacy paper into attachments with storage add-ons where needed; do not block go-live waiting for every 1998 PDF. Priority active patients and legal retention windows.",
            "Mixed practices: keep farm visit narratives in the correct organizational context so companion reception does not open herd files by mistake—exercise multi-organization roles in sandbox.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient records—consult context and preventives on one timeline.",
        },
        {
          heading: "Phase 3 — Appointments, reminders, and front-desk digitization",
          paragraphs: [
            "Scheduling digitization means one authoritative agenda: appointments with reminders configured to what your plan actually includes—do not promise owners omnichannel SMS if the contract does not substantiate it.",
            "Train reception on appointment-linked patient selection, no-show notes, and reschedule reasons for later KPI review (/monde-veto/reduce-veterinary-appointment-no-shows if deployed in your blog stack).",
            "Bridge paper wall calendars only for week one; remove wall authority by day ten. Locums receive shared cloud logins with scoped permissions, not photographed rosters.",
            "Farm modules: field visits should appear on the same scheduling discipline where your workflow uses centralized booking—avoid parallel WhatsApp chains that never enter the system.",
          ],
        },
        {
          heading: "Phase 4 — Inventory and plan-based accounting",
          paragraphs: [
            "Inventory and accounting digitization belong after consult discipline—otherwise COGS lies. Phase 4 activates stock consumption tied to checkout and accounting views available on your plan tier (confirm on /pricing; free starter may not match full margin reporting).",
            "Cross-read /monde-veto/veterinary-inventory-management-guide for receiving and count rhythms; profitability numerators in /monde-veto/veterinary-practice-profitability when accounting go-live approaches.",
            "Do not digitize accounting while stock still lives in Excel except as exports—split-brain destroys digital transformation veterinary practice credibility with partners.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption:
            "Accounting and stock—Phase 4 after clinical records stabilize.",
        },
        {
          heading: "Training plan that sticks (not one Friday lecture)",
          paragraphs: [
            "One-shot training yields one-shot compliance. Schedule role-based micro-sessions: reception 45 minutes on search and booking, nurses 45 on vitals and vaccine due dates, vets 30 on consult templates, managers 60 on permissions and exports.",
            "Week 2: shadowing pairs (experienced reception + new hire) scoring consult close quality. Week 4: locum pack with screenshots in FR or EN as your team prefers—VetoCrm UI supports FR/EN/ES but SOPs must match the language each shift uses.",
            "Record short internal Loom-style clips if your culture allows; otherwise one-page PDF SOPs stored in the staff handbook, not orphaned in chat threads.",
            "Measure training by behavior: due-date completion rate, not attendance signatures.",
            "Repeat micro-sessions after day thirty when regressions appear—usually checkout shortcuts skipping due dates. Punish the template gap, not the individual, if half the team makes the same error.",
            "Include accountants in one thirty-minute export tour so month-end does not become an anti-software rebellion.",
          ],
        },
        {
          heading:
            "Change communications for owners and referring colleagues",
          paragraphs: [
            "Pet owners rarely care which PIMS you use; they care whether recall calls arrive and discharge instructions match what the vet said. External communication during digitization should promise continuity, not software brands.",
            "Referring practices may need reassurances about record transfer if you change how summaries are faxed or emailed. Document interim process before flipping consult templates.",
            "Internal celebration should highlight patient safety wins—found microchip on merged duplicate—not IT milestones alone.",
          ],
        },
        {
          heading: "KPIs for digital transformation veterinary practice (90-day set)",
          paragraphs: [
            "Pick six KPIs at Phase 0; review monthly. Full definitions and formulas: /monde-veto/veterinary-practice-kpis. Starter set for digitization programs:",
            "Digitization KPIs differ from mature-practice KPIs: early emphasis is data integrity, not margin optimization. Month one tracks consult closure; month three adds stock match; month six adds contribution margin only if Phase 4 is live.",
            "Publish KPIs on one wall—not thirty. Green amber red thresholds should be defined in Phase 0 so debate happens once.",
            "When a KPI stays red six weeks, switch tactic before switching vendors. Most redness is training, not missing features.",
          ],
          bullets: [
            "Percent consults closed same day with structured record.",
            "Percent closed consults with vaccine/antiparasitic due date when applicable.",
            "Duplicate client records open longer than seven days.",
            "Appointments booked without linked patient (error rate).",
            "No-show rate once digital agenda is sole authority.",
            "Stock lines dispensed with matching invoice line (after Phase 4).",
          ],
        },
        {
          heading: "Common challenges and how to respond",
          paragraphs: [
            "Challenge — partner vet bypasses software for \"speed\": restrict bypass to true emergencies with post-hoc entry SLA of 24 hours; chronic bypass kills transformation.",
            "Challenge — staff nostalgia for paper cards: allow paper backup week one only; manager removes cards from pockets week two.",
            "Challenge — internet outages: document offline fallback (paper consult sheet batch entry same day); cloud access returns—do not maintain parallel live paper forever.",
            "Challenge — owner confusion: communicate only what changes (faster recall, same phone number); avoid tech jargon in waiting room posters.",
            "Challenge — unrealistic automation: see /monde-veto/veterinary-practice-automation-tasks for what to automate after records work—not before.",
            "Challenge — multi-site politics: use multi-organization roles and entity-specific KPIs so one site cannot blame another's chaos.",
            "Challenge — vendor enthusiasm outpacing adoption: freeze new modules until prior phase KPI plateaus two consecutive weeks.",
            "Challenge — data migration shame: teams hide dirty data; managers normalize cleansing sprints as success, not failure.",
            "Challenge — accountant surprise: pre-share export samples weekly during Phase 4 pilot so month-end does not ambush partners.",
          ],
        },
        {
          heading: "Automation and efficiency after the foundation",
          paragraphs: [
            "Automation amplifies good data and amplifies garbage. Sequence Task 1–4 style work from /monde-veto/veterinary-practice-automation-tasks only after Phases 1–3 KPIs plateau: due queues, appointment reminder configuration, consult templates, permission hygiene.",
            "Efficiency strategy without digitization is wishful—link /monde-veto/veterinary-clinic-efficiency-strategies once baseline KPIs exist. Retention loops need accurate due dates from /monde-veto/veterinary-client-retention-strategies.",
            "Reject shiny integrations not confirmed on vetocrm.com; depth varies by plan.",
          ],
        },
        {
          heading: "Governance, security, and cloud access",
          paragraphs: [
            "Digitization raises access questions: who exported client list last, who edited consult after sign-out, which devices use shared logins. Ban shared passwords; use role accounts per your policy.",
            "Storage add-ons matter when attachment volume jumps during paper scan projects. Review retention with counsel where regulations apply—this article is operations, not legal advice.",
            "Annual refresh: permissions audit, retired staff deactivated, segment retired spreadsheets on file servers.",
          ],
        },
        {
          heading: "90-day roadmap summary",
          paragraphs: [
            "Days 1–14: Phase 0 charter, vendor sandbox, role config. Days 15–35: Phase 1 client/patient graph, dedup project. Days 36–55: Phase 2 consult-first records. Days 56–70: Phase 3 agenda authority. Days 71–90: Phase 4 inventory/accounting if plan ready; KPI retrospective.",
            "Celebrate one visible win at day 45—e.g., vaccine due queue entirely in software—before announcing \"we are digital.\"",
            "Continue narrative context at /monde-veto/digitalisation-clinique-veterinaire; execute with this step-by-step plan and record-specific depth at /monde-veto/digital-veterinary-patient-records.",
            "Buffer days 91–100 for retrospective documentation: update SOPs, archive shadow tools, schedule day-120 KPI review. Teams that stop at day ninety without retrospective slide back to hybrid chaos.",
            "If Phase 4 must wait for plan upgrade, keep days 71–90 focused on agenda and record KPI perfection rather than premature accounting promises to partners.",
          ],
        },
        {
          heading: "Budget and resource realism",
          paragraphs: [
            "Budget lines should include subscription, storage add-ons if scanning archives, training payroll (not only software invoices), and temporary parallel data cleansing overtime.",
            "Do not assume digitization is IT-only spend. Reception hours spent merging duplicates are transformation cost—account for them or burn goodwill.",
            "Free starter tiers like VetoCrm's confirmed offering reduce cash risk but not labor risk; plan labor first.",
          ],
        },
        {
          heading: "Where VetoCrm fits the digitization roadmap",
          paragraphs: [
            "VetoCrm is an integrated cloud platform for digital transformation veterinary practice at clinic scale: clients, patients, appointments with reminders, consults, vaccines, antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, free starter, storage add-ons, read-only demo, FR/EN/ES.",
            "It suits teams executing phased change—not seeking a single-switch miracle. Explore demo, map phases to confirmed modules, trial /register before migrating owner-facing workflows.",
          ],
        },
      ],
      faq: [
        {
          q: "How is this different from the digitization overview article?",
          a: "/monde-veto/digitalisation-clinique-veterinaire explains why and four pillars. This guide is phased execution, training, and KPIs.",
        },
        {
          q: "Which phase should farm practices prioritize?",
          a: "Phase 0 entity mapping, then client/patient graph with farm modules and multi-organization roles validated in sandbox—not companion-only shortcuts.",
        },
        {
          q: "Can we digitize scheduling before records?",
          a: "You can book digitally early, but consult-first records should follow within weeks or you recreate double entry and weak clinical history.",
        },
        {
          q: "What if our plan lacks full accounting on day one?",
          a: "Defer Phase 4 until upgrade; still digitize consults and agenda. Confirm module depth on /pricing.",
        },
        {
          q: "Where do automation tasks fit?",
          a: "After Phases 1–3 stabilize; follow /monde-veto/veterinary-practice-automation-tasks order.",
        },
        {
          q: "Does VetoCrm include unlimited SMS?",
          a: "Do not assume bundled SMS; use confirmed appointment reminders and phone discipline per your contract.",
        },
      ],
      ctaTitle: "Run your digitization roadmap",
      ctaBody:
        "Pair /monde-veto/digitalisation-clinique-veterinaire vision with this plan, rehearse on demo, review /pricing, and open /register for phased rollout.",
      ctaButton: "Start with VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Comment digitaliser une clinique vétérinaire : guide pas à pas",
      excerpt:
        "Feuille de route de transformation digitale : gouvernance, dossiers, agenda, formation, KPI et écueils—au-delà de l’article « par où commencer ».",
      metaDescription:
        "Digitaliser une clinique vétérinaire pas à pas : feuille de route, formation, KPI, défis. Transformation digitale. Liens dossiers numériques, automatisation. VetoCrm.",
      category: "Transformation digitale",
      sections: [
        {
          heading:
            "Transformation digitale vétérinaire : du slogan au rythme hebdo",
          paragraphs: [
            "Digitaliser n’est pas acheter un logiciel en une semaine. C’est gouvernance, dossiers, agenda, stock et habitudes sur des mois.",
            "Vue d’ensemble : /monde-veto/digitalisation-clinique-veterinaire. Dossiers : /monde-veto/digital-veterinary-patient-records. Automatisation : /monde-veto/veterinary-practice-automation-tasks.",
            "VetoCrm confirmé : clients/patients, RDV/rappels, consultations, vaccins/antiparasitaires, stock/compta selon formule, fermes, multi-organisation, formule découverte, stockage, démo, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "Phase 0 — Charte et périmètre",
          paragraphs: [
            "Mémo associés : sites, espèces, entités, ce qui reste papier 90 jours. Responsables transformation et dossiers nommés.",
          ],
          bullets: [
            "Définition succès à 90 jours.",
            "Besoins fermes et entités.",
            "Liste des rôles.",
            "Registre des risques.",
            "Communication propriétaires.",
          ],
        },
        {
          heading: "Phase 1 — Fondation clients/patients",
          paragraphs: [
            "Données maîtres : dédoublonnage, recherche fiable, patients actifs. Stand-up quotidien sur qualité saisie.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption: "Base client-patient — première couche digitale.",
        },
        {
          heading: "Phase 2 — Dossiers patients au quotidien",
          paragraphs: [
            "Clôture consult d’abord dans le système. Échéances vaccins sur fiche animal. Scans d’archives avec stockage optionnel.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Dossier patient — consultes et préventifs.",
        },
        {
          heading: "Phase 3 — Agenda et accueil",
          paragraphs: [
            "Agenda unique avec rappels selon contrat réel. Fin du papier au mur dès la semaine 2. Modules fermes dans la même discipline si centralisé.",
          ],
        },
        {
          heading: "Phase 4 — Stock et compta",
          paragraphs: [
            "Après discipline consult. Voir guides stock et rentabilité. Pas d’Excel stock vivant en parallèle.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Compta — phase 4.",
        },
        {
          heading: "Formation par rôles",
          paragraphs: [
            "Micro-sessions répétées, binômes, SOP une page. Mesurer les échéances vaccins saisies, pas la présence.",
          ],
        },
        {
          heading: "KPI à 90 jours",
          paragraphs: ["Jeux de six indicateurs ; détails : /monde-veto/veterinary-practice-kpis."],
          bullets: [
            "% consults clôturées même jour.",
            "% consults avec échéance préventive.",
            "Doublons clients ouverts > 7 jours.",
            "RDV sans patient lié.",
            "No-shows avec agenda numérique.",
            "Dispensation alignée facture (phase 4).",
          ],
        },
        {
          heading: "Défis fréquents",
          paragraphs: [
            "Contournement vétérinaire, nostalgie papier, coupures réseau, promesses SMS irréalistes, jalousie multi-sites — réponses structurées dans le guide EN.",
          ],
        },
        {
          heading: "Automatisation après la base",
          paragraphs: [
            "Tâches /monde-veto/veterinary-practice-automation-tasks après KPI stables. Efficacité et fidélisation une fois données propres.",
          ],
        },
        {
          heading: "Gouvernance et cloud",
          paragraphs: [
            "Pas de mots de passe partagés. Audit permissions annuel. Stockage si volume de scans.",
          ],
        },
        {
          heading: "Synthèse 90 jours",
          paragraphs: [
            "0–14 charte ; 15–35 clients ; 36–55 dossiers ; 56–70 agenda ; 71–90 stock/compta si formule prête.",
          ],
        },
        {
          heading: "VetoCrm dans la feuille de route",
          paragraphs: [
            "Plateforme cloud intégrée pour exécution par phases. Démo, /pricing, /register.",
          ],
        },
      ],
      faq: [
        {
          q: "Différence avec l’article digitalisation ?",
          a: "L’autre = pourquoi et piliers ; celui-ci = exécution pas à pas.",
        },
        {
          q: "Priorité pratique mixte ?",
          a: "Cartographie entités et modules fermes en phase 0.",
        },
        {
          q: "Agenda avant dossiers ?",
          a: "Possible brièvement ; dossiers doivent suivre vite.",
        },
        {
          q: "Compta jour 1 ?",
          a: "Phase 4 selon formule /pricing.",
        },
        {
          q: "Automatisation quand ?",
          a: "Après phases 1–3 stables.",
        },
        {
          q: "SMS illimités ?",
          a: "Ne pas supposer ; rappels confirmés + téléphone.",
        },
      ],
      ctaTitle: "Pilotez votre digitalisation",
      ctaBody: "Vision + ce plan, démo, /pricing, /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Cómo digitalizar una clínica veterinaria: guía paso a paso",
      excerpt:
        "Hoja de ruta de transformación digital veterinaria: gobierno, historiales, agenda, formación, KPI y retos—más allá del artículo general.",
      metaDescription:
        "Digitalizar clínica veterinaria paso a paso: hoja de ruta, formación, KPI, desafíos. Transformación digital. Enlaces historiales digitales, automatización. VetoCrm.",
      category: "Transformación digital",
      sections: [
        {
          heading:
            "Transformación digital veterinaria: del eslogan al ritmo semanal",
          paragraphs: [
            "Digitalizar no es comprar software en una semana. Son meses de gobierno, historiales, agenda, stock y hábitos.",
            "Visión: /monde-veto/digitalisation-clinique-veterinaire. Historiales: /monde-veto/digital-veterinary-patient-records. Automatización: /monde-veto/veterinary-practice-automation-tasks.",
            "VetoCrm confirmado: clientes/pacientes, citas/recordatorios, consultas, vacunas/antiparasitarios, inventario/contabilidad por plan, granjas, multiorganización, plan inicial, almacenamiento, demo, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "Fase 0 — Carta y alcance",
          paragraphs: [
            "Memo de socios: sedes, especies, entidades, papel temporal 90 días. Líder de transformación y capitán de historiales.",
          ],
          bullets: [
            "Éxito a 90 días definido.",
            "Requisitos granja/entidades.",
            "Lista de roles.",
            "Registro de riesgos.",
            "Comunicación a propietarios.",
          ],
        },
        {
          heading: "Fase 1 — Base clientes/pacientes",
          paragraphs: [
            "Datos maestros limpios antes de dashboards. Deduplicación y búsqueda fiable.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption: "Base cliente-paciente.",
        },
        {
          heading: "Fase 2 — Historiales en uso diario",
          paragraphs: [
            "Cierre de consulta en el sistema. Fechas de vacuna en ficha. Escaneos con almacenamiento opcional.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Historial con preventivos.",
        },
        {
          heading: "Fase 3 — Citas y recepción",
          paragraphs: [
            "Agenda única con recordatorios reales del contrato. Sin calendario de pared autoritativo después de la semana 2.",
          ],
        },
        {
          heading: "Fase 4 — Inventario y contabilidad",
          paragraphs: [
            "Tras disciplina clínica. Sin Excel vivo de stock en paralelo.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Contabilidad — fase 4.",
        },
        {
          heading: "Plan de formación",
          paragraphs: [
            "Microsesiones por rol, mentoría, SOP de una página. Medir fechas de vacuna, no asistencia.",
          ],
        },
        {
          heading: "KPI a 90 días",
          paragraphs: ["Seis indicadores; detalle en /monde-veto/veterinary-practice-kpis."],
          bullets: [
            "% consultas cerradas el mismo día.",
            "% con fecha preventiva.",
            "Duplicados > 7 días.",
            "Citas sin paciente.",
            "No-shows con agenda digital.",
            "Dispensación = línea factura (fase 4).",
          ],
        },
        {
          heading: "Desafíos habituales",
          paragraphs: [
            "Veterinarios que saltan el sistema, nostalgia del papel, caídas de red, SMS prometidos sin contrato, política multi-sede.",
          ],
        },
        {
          heading: "Automatización después",
          paragraphs: [
            "/monde-veto/veterinary-practice-automation-tasks tras KPI estables.",
          ],
        },
        {
          heading: "Gobernanza",
          paragraphs: [
            "Sin contraseñas compartidas. Auditoría anual. Almacenamiento para adjuntos.",
          ],
        },
        {
          heading: "Resumen 90 días",
          paragraphs: [
            "Fases 0–4 en bloques de dos semanas según plantilla del artículo EN.",
          ],
        },
        {
          heading: "VetoCrm en la hoja de ruta",
          paragraphs: [
            "Plataforma cloud integrada. Demo, /pricing, /register.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Diferencia con artículo digitalización?",
          a: "Aquí ejecución paso a paso; el otro es visión y pilares.",
        },
        {
          q: "¿Prioridad práctica mixta?",
          a: "Fase 0: entidades y módulos granja.",
        },
        {
          q: "¿Agenda antes de historiales?",
          a: "Brevemente; historiales deben seguir en semanas.",
        },
        {
          q: "¿Contabilidad día 1?",
          a: "Fase 4 según plan /pricing.",
        },
        {
          q: "¿Cuándo automatizar?",
          a: "Tras fases 1–3 estables.",
        },
        {
          q: "¿SMS ilimitados?",
          a: "No asumir; recordatorios confirmados + llamadas.",
        },
      ],
      ctaTitle: "Ejecute su hoja de ruta",
      ctaBody: "Visión + plan, demo, /pricing, /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};