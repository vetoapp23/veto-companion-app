import type { BlogArticle } from "./types";

export const ARTICLE_02: BlogArticle = {
  slug: "veterinary-crm-clients-pets-relationships",
  cover: "/monde-veto/screen-patients.png",
  coverAlt: {
    fr: "Dossiers patients VetoCrm — CRM et relation client vétérinaire",
    en: "VetoCrm patient records — veterinary CRM and client relationships",
    es: "Historiales de pacientes VetoCrm — CRM veterinario y relación con clientes",
  },
  publishedAt: "2027-01-22",
  readingMinutes: 12,
  locales: {
    en: {
      title:
        "Veterinary CRM Software: How to Manage Clients, Pets and Clinic Relationships",
      excerpt:
        "A workflow guide to veterinary CRM software: segmentation, communication history, retention loops, vaccine follow-up SOPs, and how CRM differs from PIMS and PMS—with practical clinic examples.",
      metaDescription:
        "Veterinary CRM software workflows for clinics: manage clients and pets, retention loops, vaccine follow-up SOPs, CRM vs PIMS vs PMS, and examples using confirmed practice tools.",
      category: "CRM workflows",
      sections: [
        {
          heading: "Veterinary CRM software is about daily workflows—not a feature brochure",
          paragraphs: [
            "When teams search for veterinary CRM software, they often land on buyer guides that compare logos and pricing tiers. Those pages matter early in the journey, but they rarely answer the question clinic managers ask once a shortlist exists: how will our front desk, nurses, and veterinarians actually run client and pet relationships inside the system every Monday morning?",
            "This article focuses on operational workflows: linking owners to multiple pets, keeping communication history auditable, designing simple retention loops, and standardizing vaccine and antiparasitic follow-up without bolting on generic marketing automation. If you need a concise product comparison first, see /monde-veto/veterinary-crm-software; for broader PIMS context, see /monde-veto/best-veterinary-practice-management-software-2027.",
            "Throughout, we reference only capabilities confirmed on vetocrm.com—client and patient files, appointments with reminders, consults and prescriptions, vaccine and antiparasitic tracking, inventory and plan-based accounting, farm modules, multi-organization roles, a free starter tier, storage add-ons, read-only demo, and cloud access in French, English, and Spanish. We do not describe lab connectors, SMS bundles, or customer testimonials that are not substantiated on the product site.",
            "The goal is practical: you should finish reading with SOPs you can paste into a staff handbook, not a buzzword checklist.",
          ],
        },
        {
          heading: "CRM vs PIMS vs PMS: definitions your team can share",
          paragraphs: [
            "Confusion between CRM, PIMS, and PMS wastes demo time. Use plain definitions in onboarding so new hires know where to click for client history versus clinical documentation.",
            "Veterinary CRM software centers the relationship layer: who the owner is, how to reach them, which pets they hold, preference notes, outstanding balances, and the timeline of visits and reminders. It overlaps with clinical data but should never duplicate the entire medical record.",
            "A PIMS (Practice Information Management System) is the clinical and operational backbone: consultations, diagnoses, prescriptions, vaccination protocols, stock consumption, invoicing, and permissions. Most modern cloud PIMS include CRM-like client views because fragmented databases create duplicate owners and missed follow-ups.",
            "PMS often means practice management software in vendor marketing—essentially the same category as PIMS in veterinary contexts. Some US buyers say PMS when they mean scheduling plus billing; Europeans may say “logiciel de gestion” for the full stack. Align internally on one vocabulary before you score vendors.",
          ],
          bullets: [
            "CRM → owner relationship, communication context, retention tasks, household pet grouping.",
            "PIMS/PMS → medical record, inventory, billing, reporting, multi-site governance.",
            "Integrated suite → one login; CRM screens read data that clinicians capture during consults.",
            "Standalone CRM → usually requires sync to a separate clinical system (higher error risk).",
          ],
        },
        {
          heading: "Clients and pets: the relationship hub in veterinary CRM software",
          paragraphs: [
            "Strong veterinary CRM software treats the owner record and each patient record as a single graph, not parallel spreadsheets. Reception should open one client and immediately see active pets, overdue preventive items, last consult summary, and open invoices—without opening five modules.",
            "Search must tolerate real-world mess: maiden names, two phone numbers, bilingual spellings, and clients who board pets under a partner’s name. Role-based permissions let reception update contact fields while restricting clinical note edits to veterinarians.",
            "In VetoCrm, confirmed modules cover clients, patients, appointments, consults, vaccines, antiparasitics, and history suitable for handoffs between shifts. That is the minimum viable relationship hub; anything else (farm clients, multi-entity groups) layers on top without breaking the same navigation pattern.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Client view — link owners to multiple pets and quick actions from one veterinary CRM screen.",
        },
        {
          heading: "Segmentation that helps clinics—not spreadsheet vanity",
          paragraphs: [
            "Marketing blogs urge hyper-segmentation: “dachshund owners who bought premium food in Q3.” Veterinary clinics need simpler, ethical buckets that match staffing reality. Segment only if you have a defined action for each group this month.",
            "Useful segments in veterinary CRM software include: new registrations in the last 90 days, pets with vaccines due in 30 days, clients with no visit in 12 months but living pets, farm accounts with scheduled herd visits, and households with three or more active patients (higher call volume risk).",
            "Avoid segments you cannot service. If your team cannot place outbound calls daily, do not build a “lapsed 6-month” list with thousands of rows. Start with vaccine due dates already tracked in the PIMS layer—those are high-intent, medically justified touchpoints.",
            "Document segment definitions in a one-page SOP: name, filter logic, owner of the list, channel (call, email if your stack supports it, front-desk SMS only if your contract truly includes it), and stop rules when the client books.",
          ],
        },
        {
          heading: "Communication history and shift handoffs",
          paragraphs: [
            "Missed handoffs cause most “CRM failures.” A owner explains post-op feeding restrictions to reception; the night locum sees none of that context and repeats conflicting advice. Veterinary CRM software should make visit context and recent consult outcomes visible to authorized roles—not buried in PDF exports.",
            "Minimum viable communication history in an integrated system includes: appointment timestamps, consult summaries, prescription changes, vaccine administrations, invoice status, and internal notes with author and time. Train staff to write short factual notes (“owner requests afternoon calls only”) instead of essays.",
            "For medico-legal clarity, separate client-facing instructions (printed discharge) from internal coordination notes. Permissions should block casual editing of signed consult records while allowing additive clarifications where your workflow permits.",
            "Weekly managers’ huddle: sample five random client files and score whether a stranger could continue care without phoning yesterday’s nurse. If not, fix templates—not headcount alone.",
          ],
        },
        {
          heading: "Retention loops you can run without a growth team",
          paragraphs: [
            "Retention in veterinary CRM software is not drip campaigns; it is reliable loops that connect clinical events to the next booked touchpoint. Design three loops maximum until adoption stabilizes.",
            "Loop A — preventive calendar: vaccines and antiparasitics due in the system trigger front-desk review each Monday. Staff book the next slot or document refusal with reason code. Loop B — post-consult check: 48 hours after surgery or dental, reception logs a welfare call outcome in the client record. Loop C — welcome path: new client + first pet receives appointment for nurse weigh-in within 14 days (where clinically appropriate).",
            "Each loop needs a metric: percent of due preventives booked within seven days, percent of welfare calls completed, percent of new clients with second visit within 60 days. Review monthly; abandon loops staff routinely skip.",
            "VetoCrm’s confirmed appointment and reminder capabilities support Loop A when due dates live in patient files; pair with your clinic’s phone discipline rather than assuming automation alone fixes adherence.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient history — preventive due dates and consult context feed retention workflows.",
        },
        {
          heading: "Vaccine and antiparasitic follow-up SOP (template)",
          paragraphs: [
            "Standardize follow-up so locums and part-time receptionists behave the same. Paste this template into your handbook and adjust time windows to local regulations.",
            "Step 1 — Data entry: within the consult, clinician records product, batch if required, next due date, and patient weight. No checkout before due dates exist. Step 2 — Daily queue: reception filters patients with vaccines or antiparasitics due within 30 days; sort by due date ascending. Step 3 — Contact: attempt two contacts per owner (call primary phone, then secondary or email on file); log outcome in client notes. Step 4 — Booking: offer at least two appointment slots; link booking to the correct patient. Step 5 — Escalation: if medical risk (e.g., overdue rabies per local law), flag veterinarian review before closing the task.",
            "Step 6 — Monthly audit: manager samples 20 preventive tasks; checks due date accuracy, note quality, and booking rate. Correct templates in the PIMS rather than blaming individuals.",
            "This SOP assumes your veterinary CRM software shares the same database as clinical vaccine modules—another reason standalone CRMs often break preventive compliance.",
          ],
          bullets: [
            "Single source of truth for due dates on the patient record.",
            "Outcome codes: booked, declined, unreachable, deferred with vet approval.",
            "No marketing promises in medical recall messages—stick to facts and dates.",
            "Reception targets: clear queue to zero each Friday for the next 30-day window.",
          ],
        },
        {
          heading: "Practical examples: urban wellness clinic and mixed practice",
          paragraphs: [
            "Urban companion clinic (three vets, two receptionists): segmentation focuses on vaccine queues and lapsed wellness plans stored as notes or recurring appointments. Communication history prevents duplicate reminders when both partners own one dog. Retention loop = Monday due-list plus Thursday “lapsed 12-month” call batch capped at 15 owners.",
            "Mixed practice with farm modules: CRM graph includes professional farm accounts with multiple sites. Segmentation splits companion clients from herd visit schedules. Handoffs document which vet holds the relationship for each farm entity—critical when multi-organization roles isolate data between business units in tools like VetoCrm.",
            "Solo mobile vet: lightweight veterinary CRM software matters more than enterprise analytics. Priority workflows: fast client search, offline-friendly planning (know your cloud limits), and simple invoice linkage after field consults using confirmed inventory and accounting features on the chosen plan.",
            "In all three cases, success is measured by booked preventives and repeat visits—not email open rates.",
          ],
        },
        {
          heading: "Where VetoCrm fits—and how to trial without a big-bang migration",
          paragraphs: [
            "VetoCrm is positioned as an integrated cloud application: CRM-like client and patient management plus consults, vaccines, antiparasitics, appointments with reminders, inventory, plan-based accounting, farm modules, and multi-organization roles. It suits teams that want relationship workflows and clinical documentation in one web app with French, English, and Spanish UI options.",
            "Trial path: explore the read-only demo, review plan structure on /pricing, then open a free starter account via /register for low-risk testing with a sanitized subset of owners and pets. Migrate in waves—new clients first, then historical summaries—rather than switching every module on day one.",
            "Compare against your current stack using the same SOPs in this article; if vaccine queues remain faster in your legacy tool, keep parallel running until parity is proven.",
            "Continue research with /monde-veto/veterinary-crm-software for a shorter buyer lens and /monde-veto/best-veterinary-practice-management-software-2027 for wider market context.",
          ],
        },
        {
          heading: "Governance: permissions, exports, and multi-organization clinics",
          paragraphs: [
            "Relationship data is sensitive. Veterinary CRM software should enforce least privilege: reception edits contacts; nurses add vitals; veterinarians sign consults; managers run reports without raw clinical edit rights unless required.",
            "Groups operating multiple legal entities need data isolation between organizations while allowing shared templates. Confirmed multi-organization roles in VetoCrm address that pattern—validate during demo with two test entities, not just one shiny dashboard.",
            "Before any vendor switch, document export steps and retention policy: what archive format you will receive, how attachments move, and who owns the client communication notes after termination.",
            "Annual review: revisit segment definitions, retire unused loops, and retrain on note quality. CRM value compounds when workflows stay boring and consistent.",
          ],
        },
      ],
      faq: [
        {
          q: "Is veterinary CRM software separate from a PIMS?",
          a: "It can be, but most clinics prefer an integrated PIMS with strong client and patient views. Standalone CRMs often duplicate owners and miss vaccine due dates that live in clinical modules.",
        },
        {
          q: "What is the first workflow to fix after adopting veterinary CRM software?",
          a: "Start with the preventive due queue: accurate next vaccine and antiparasitic dates on each patient, then a weekly reception habit to book or document outcomes.",
        },
        {
          q: "How is this article different from a veterinary CRM buyer guide?",
          a: "Buyer guides compare products and pricing. This page covers operational SOPs—segmentation, handoffs, retention loops, and follow-up—that run inside whichever system you choose.",
        },
        {
          q: "Can VetoCrm handle farm clients and companion pets together?",
          a: "Confirmed VetoCrm modules include farm-oriented capabilities alongside companion client and patient management, with multi-organization roles for separated entities. Validate your specific herd workflows in demo.",
        },
        {
          q: "Do I need automated SMS for vaccine reminders?",
          a: "Not necessarily. Many clinics succeed with due-date queues in the PIMS, appointment reminders where available, and disciplined phone follow-up. Match channels to what your contract actually includes—do not assume SMS is bundled.",
        },
        {
          q: "How long until retention loops show results?",
          a: "Expect measurable booking improvements on preventives within one to two recall cycles (often 60–90 days) if staff complete the weekly queue consistently.",
        },
      ],
      ctaTitle: "Run client workflows in VetoCrm",
      ctaBody:
        "Test client and patient relationship workflows with the read-only demo, compare plans on /pricing, and start a free starter account on /register when your SOPs are ready.",
      ctaButton: "Start with VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Logiciel CRM vétérinaire : gérer clients, animaux et relations clinique",
      excerpt:
        "Guide opérationnel du CRM vétérinaire : segmentation, historique de communication, boucles de fidélisation, SOP rappels vaccinaux, CRM vs PIMS vs PMS et exemples concrets.",
      metaDescription:
        "CRM vétérinaire : workflows clients et animaux, rétention, SOP vaccins, différences CRM/PIMS/PMS. Exemples avec fonctionnalités VetoCrm confirmées.",
      category: "Workflows CRM",
      sections: [
        {
          heading: "Le CRM vétérinaire, c’est le quotidien—notre le comparatif fonctionnalités",
          paragraphs: [
            "Les recherches sur un logiciel CRM vétérinaire mènent souvent à des grilles tarifaires. Une fois la shortlist faite, la vraie question est : comment l’accueil, les ASV et les vétérinaires gèrent-ils propriétaires et animaux chaque lundi matin ?",
            "Cet article traite les workflows : fiches liées, historique communicable, boucles de rétention simples et SOP vaccins/antiparasitaires. Comparatif produit court : /monde-veto/veterinary-crm-software ; contexte PIMS : /monde-veto/best-veterinary-practice-management-software-2027.",
            "Nous citons uniquement les fonctions confirmées sur vetocrm.com : clients/patients, RDV et rappels, consultations/prescriptions, vaccins/antiparasitaires, stock et compta selon formule, modules fermes, rôles multi-organisation, formule découverte gratuite, stockage en option, démo lecture seule, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "CRM, PIMS et PMS : définitions partagées",
          paragraphs: [
            "CRM vétérinaire = couche relation : coordonnées, animaux du foyer, historique visites et relances, soldes.",
            "PIMS = dossier médical, stock, facturation, permissions—souvent avec vues CRM intégrées.",
            "PMS est souvent synonyme de PIMS dans le marketing éditeur ; alignez le vocabulaire en interne.",
          ],
          bullets: [
            "CRM → relation, segmentation actionnable, tâches de fidélisation.",
            "PIMS/PMS → clinique, facturation, reporting multi-sites.",
            "Suite intégrée → une connexion, données consultables par tous les rôles autorisés.",
          ],
        },
        {
          heading: "Clients et patients : le hub relationnel",
          paragraphs: [
            "Un bon CRM relie propriétaire et plusieurs animaux : préventifs en retard, dernière consultation, factures ouvertes.",
            "Recherche tolérante aux doublons et permissions : accueil modifie les contacts, cliniciens les notes médicales.",
            "VetoCrm couvre clients, patients, agenda, consultations, vaccins, antiparasitaires et historique pour les relais entre équipes.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Vue clients — propriétaires, animaux liés et actions depuis le CRM vétérinaire.",
        },
        {
          heading: "Segmentation utile, pas vanity metrics",
          paragraphs: [
            "Segmentez seulement si vous avez une action ce mois-ci : nouveaux clients 90 jours, vaccins dus à 30 jours, inactifs 12 mois, fermes avec visites programmées, foyers multi-animaux.",
            "Documentez chaque segment : filtre, responsable, canal, critère d’arrêt après réservation.",
          ],
        },
        {
          heading: "Historique et passation entre équipes",
          paragraphs: [
            "Les ratés de passation tuent la valeur CRM. Affichez contexte de visite, ordonnances, vaccins et statut facture aux rôles autorisés.",
            "Notes internes courtes et factuelles ; consignes client via documents de sortie imprimés.",
            "Revu hebdo : cinq dossiers au hasard—un inconnu peut-il poursuivre le suivi sans rappeler l’ASV d’hier ?",
          ],
        },
        {
          heading: "Boucles de rétention sans équipe growth",
          paragraphs: [
            "Boucle A — préventif lundi : file vaccins/antiparasitaires 30 jours, prise de RDV ou refus codé.",
            "Boucle B — appel post-acte à J+2 pour chirurgie/dentisterie, trace dans la fiche.",
            "Boucle C — accueil nouveau client : deuxième visite ASV sous 14 jours si pertinent.",
            "Mesurez taux de RDV sous 7 jours et abandonnez les boucles non tenues.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Historique patient — échéances préventives et contexte clinique pour la rétention.",
        },
        {
          heading: "SOP rappel vaccin et antiparasitaire (modèle)",
          paragraphs: [
            "Saisie consult : produit, lot si requis, prochaine échéance. File quotidienne 30 jours. Deux tentatives de contact, note d’issue, deux créneaux proposés. Escalade vétérinaire si risque légal (ex. rage en retard).",
            "Audit mensuel : 20 dossiers échantillon ; corriger les modèles PIMS, pas seulement les individus.",
          ],
          bullets: [
            "Échéances sur la fiche animal, seule source de vérité.",
            "Codes : RDV pris, refus, injoignable, report validé vétérinaire.",
            "Pas de promesses marketing dans les rappels médicaux.",
          ],
        },
        {
          heading: "Exemples : clinique urbaine et structure mixte",
          paragraphs: [
            "Urbain 3 vet : file préventif + lot limité d’appels « 12 mois sans visite ».",
            "Mixte avec fermes : segments compagnon vs troupeaux ; rôles multi-organisation pour isoler les entités.",
            "Mobile solo : recherche rapide, facturation liée au stock selon formule confirmée.",
          ],
        },
        {
          heading: "VetoCrm : essai progressif",
          paragraphs: [
            "Application cloud intégrée : clients, patients, consults, vaccins, RDV/rappels, stock, compta, fermes, rôles multi-organisation, UI FR/EN/ES.",
            "Démo lecture seule, /pricing, /register pour formule découverte ; migration par vagues.",
            "Voir aussi /monde-veto/veterinary-crm-software et le comparatif 2027.",
          ],
        },
        {
          heading: "Gouvernance et multi-entités",
          paragraphs: [
            "Moindre privilège par rôle ; valider l’isolation multi-organisation en démo avec deux entités test.",
            "Documenter export et conservation des notes avant tout changement d’éditeur.",
          ],
        },
      ],
      faq: [
        {
          q: "CRM vétérinaire séparé du PIMS ?",
          a: "Possible, mais la plupart des cabinets préfèrent une suite intégrée pour éviter doublons et rappels vaccinaux perdus.",
        },
        {
          q: "Premier workflow à corriger ?",
          a: "La file des préventifs : échéances exactes puis habitude hebdomadaire de l’accueil.",
        },
        {
          q: "Différence avec un guide d’achat CRM ?",
          a: "Ce guide = SOP et flux ; le guide court compare produits et tarifs.",
        },
        {
          q: "VetoCrm et clients fermes ?",
          a: "Modules fermes confirmés avec gestion clients/patients ; validez vos flux troupeau en démo.",
        },
        {
          q: "SMS obligatoire pour les rappels ?",
          a: "Non : file dans le PIMS, rappels RDV si disponibles, appels disciplinés. Vérifiez ce que votre contrat inclut réellement.",
        },
        {
          q: "Délai pour voir des résultats ?",
          a: "Souvent 60–90 jours sur les préventifs si la file hebdo est tenue.",
        },
      ],
      ctaTitle: "Pilotez la relation client avec VetoCrm",
      ctaBody:
        "Démo, tarifs sur /pricing, formule découverte via /register — testez ces workflows sur vos propres SOP.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Software CRM veterinario: gestionar clientes, mascotas y relaciones en la clínica",
      excerpt:
        "Guía operativa de CRM veterinario: segmentación, historial de comunicación, bucles de retención, SOP de vacunas, CRM vs PIMS vs PMS y ejemplos prácticos.",
      metaDescription:
        "Software CRM veterinario: flujos de clientes y mascotas, retención, SOP vacunas, CRM frente a PIMS/PMS. Ejemplos con funciones VetoCrm confirmadas.",
      category: "Flujos CRM",
      sections: [
        {
          heading: "El CRM veterinario son flujos diarios, no solo funciones",
          paragraphs: [
            "Tras acortar la lista de software CRM veterinario, la pregunta es cómo recepción y clínicos gestionan propietarios y pacientes cada semana.",
            "Este artículo cubre segmentación, historial, bucles de retención y SOP de vacunas/antiparasitarios. Guía breve de compra: /monde-veto/veterinary-crm-software; contexto PIMS: /monde-veto/best-veterinary-practice-management-software-2027.",
            "Solo funciones confirmadas en vetocrm.com: clientes/pacientes, citas y recordatorios, consultas/recetas, vacunas/antiparasitarios, inventario y contabilidad por plan, granjas, roles multiorganización, plan inicial gratuito, almacenamiento opcional, demo lectura, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "CRM, PIMS y PMS: definiciones",
          paragraphs: [
            "CRM veterinario = capa relación: contacto, mascotas del hogar, visitas y seguimiento.",
            "PIMS = historia clínica, stock, facturación; suele incluir vistas CRM.",
            "PMS suele equivaler a PIMS en marketing; unificad vocabulario interno.",
          ],
          bullets: [
            "CRM → relación y tareas de retención.",
            "PIMS/PMS → clínica, facturación, informes.",
            "Suite integrada → un inicio de sesión y datos compartidos.",
          ],
        },
        {
          heading: "Clientes y pacientes: núcleo relacional",
          paragraphs: [
            "Un CRM sólido enlaza propietario y varias mascotas con preventivos pendientes y facturas.",
            "Búsqueda flexible y permisos por rol.",
            "VetoCrm cubre clientes, pacientes, agenda, consultas, vacunas y antiparasitarios confirmados.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Vista clientes — propietarios, mascotas vinculadas y acciones en el CRM veterinario.",
        },
        {
          heading: "Segmentación accionable",
          paragraphs: [
            "Segmentos útiles: nuevos 90 días, vacunas a 30 días, inactivos 12 meses, granjas con visitas, hogares multi-mascota.",
            "Documente filtro, responsable, canal y cierre al reservar cita.",
          ],
        },
        {
          heading: "Historial y relevos de turno",
          paragraphs: [
            "Muestre contexto de visita, recetas, vacunas y factura a roles autorizados.",
            "Notas internas breves; instrucciones al cliente en documentos impresos.",
          ],
        },
        {
          heading: "Bucles de retención sin equipo de marketing",
          paragraphs: [
            "Bucle A: cola preventiva semanal. Bucle B: llamada bienestar post-cirugía a 48 h. Bucle C: segunda visita para clientes nuevos.",
            "Mida reservas en 7 días y elimine bucles ignorados.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Historial del paciente — vencimientos preventivos para flujos de retención.",
        },
        {
          heading: "SOP de seguimiento vacunal (plantilla)",
          paragraphs: [
            "Registrar producto y próxima fecha en consulta. Cola diaria 30 días. Dos contactos, códigos de resultado, dos huecos de cita. Escalada veterinaria si hay riesgo legal.",
            "Auditoría mensual de 20 casos.",
          ],
          bullets: [
            "Fechas en la ficha del paciente.",
            "Códigos: cita, rechazo, sin respuesta, aplazamiento.",
            "Sin promesas comerciales en recordatorios médicos.",
          ],
        },
        {
          heading: "Ejemplos: clínica urbana y práctica mixta",
          paragraphs: [
            "Urbana: cola preventiva y lote limitado de llamadas a inactivos.",
            "Mixta: segmentar compañía y granjas; roles multiorganización.",
            "Móvil: búsqueda rápida y facturación según plan confirmado.",
          ],
        },
        {
          heading: "VetoCrm: prueba gradual",
          paragraphs: [
            "App cloud integrada con módulos confirmados y UI FR/EN/ES.",
            "Demo, /pricing, /register; migración por fases.",
            "Ver /monde-veto/veterinary-crm-software y comparativo 2027.",
          ],
        },
        {
          heading: "Gobernanza",
          paragraphs: [
            "Mínimo privilegio; probar aislamiento multiorganización en demo.",
            "Documentar exportación antes de cambiar de proveedor.",
          ],
        },
      ],
      faq: [
        {
          q: "¿CRM veterinario separado del PIMS?",
          a: "A veces, pero lo habitual es una suite integrada para evitar duplicados y perder vencimientos.",
        },
        {
          q: "¿Primer flujo a arreglar?",
          a: "La cola de preventivos con fechas correctas y revisión semanal de recepción.",
        },
        {
          q: "¿Diferencia con una guía de compra?",
          a: "Aquí son SOP; la guía corta compara productos.",
        },
        {
          q: "¿VetoCrm y clientes de granja?",
          a: "Módulos de granja confirmados; valide flujos en demo.",
        },
        {
          q: "¿SMS obligatorio?",
          a: "No necesariamente; cola en PIMS, recordatorios de cita si existen y llamadas.",
        },
        {
          q: "¿Cuándo se ven resultados?",
          a: "A menudo 60–90 días en preventivos con disciplina semanal.",
        },
      ],
      ctaTitle: "Gestione relaciones en VetoCrm",
      ctaBody:
        "Demo de solo lectura, planes en /pricing y cuenta inicial en /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};