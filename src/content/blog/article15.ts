import type { BlogArticle } from "./types";

export const ARTICLE_15: BlogArticle = {
  slug: "veterinary-clinic-management-checklist",
  cover: "/monde-veto/screen-dashboard.png",
  coverAlt: {
    fr: "Tableau de bord VetoCrm — checklist gestion de clinique",
    en: "VetoCrm dashboard — veterinary clinic management checklist",
    es: "Panel VetoCrm — lista de gestión de clínica veterinaria",
  },
  publishedAt: "2027-04-23",
  readingMinutes: 10,
  locales: {
    en: {
      title:
        "Veterinary Clinic Management Checklist: Daily, Weekly and Monthly Tasks",
      excerpt:
        "A veterinary clinic management checklist by cadence—daily, weekly, monthly—with role owners and how integrated software supports each line. Copy sections as your printable checklist (no separate PDF file).",
      metaDescription:
        "Veterinary clinic management checklist: daily, weekly, monthly tasks, roles, software support. Printable checklist below. Links KPIs, retention, inventory, efficiency. VetoCrm.",
      category: "Practice operations",
      sections: [
        {
          heading:
            "Why a veterinary clinic management checklist beats heroic memory",
          paragraphs: [
            "Clinics that run on individual heroism—reception who remembers every vaccine, vet who alone knows stock quirks—fragile when that person holidays or burns out. A veterinary clinic management checklist distributes operational truth across roles and cadences so managers steer instead of firefight.",
            "This page is a link-ready operational reference: daily, weekly, and monthly tasks, who owns each line, and how veterinary management software reinforces the habit when configured honestly. There is no separate PDF download—use the printable checklist below by copying the bullet sections into your handbook or printing this page.",
            "Deep dives: KPI definitions in /monde-veto/veterinary-practice-kpis, retention loops in /monde-veto/veterinary-client-retention-strategies, stock discipline in /monde-veto/veterinary-inventory-management-guide, efficiency levers in /monde-veto/veterinary-clinic-efficiency-strategies. VetoCrm references stay within confirmed modules: clients and patients, appointments with reminders, consults, vaccines and antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, free starter, storage add-ons, read-only demo, cloud FR/EN/ES.",
            "Customize owners to your org chart; do not adopt every line day one—stabilize daily clinical lines before monthly finance depth.",
          ],
        },
        {
          heading: "Roles and accountability (assign before the checklists)",
          paragraphs: [
            "Every checklist line needs one accountable role, not \"the team.\" Suggested mapping for a three-vet companion clinic; farm or multi-site practices add a farm coordinator and entity-specific managers.",
            "Publish a RACI-style one-pager if partners argue about who owns stock versus who owns client calls. Ambiguity shows up first on weekly lines nobody completes.",
            "When a role is vacant, acting owner must be named weekly—not \"whoever is free.\" Vacant reception still needs a checklist dictator for that fortnight.",
          ],
          bullets: [
            "Practice manager — weekly P&L skim, monthly KPI review, permissions audits.",
            "Lead reception — daily agenda integrity, due preventive queue, open invoices.",
            "Lead nurse — daily controlled stock spot check, weekly expiry sweep.",
            "Duty veterinarian — daily open consult closure, clinical incident escalation.",
            "Inventory owner — weekly count window, reorder thresholds.",
            "Partners (vet owners) — monthly pricing and margin conversation.",
            "Farm lead (if applicable) — weekly field visit prep and herd note quality.",
          ],
        },
        {
          heading: "Daily veterinary clinic management checklist",
          paragraphs: [
            "Daily work protects patients and cash flow today. Block thirty minutes at open and fifteen before close for reception-led review; clinicians batch consult closure before lunch and again at end of session.",
            "Printable checklist below — copy to clipboard or staff room whiteboard.",
            "Morning block sequence matters: agenda integrity before outbound marketing, clinical safety before admin email. Teams that open inboxes first lose the vaccine queue to noon.",
            "Evening close should confirm tomorrow's hospitalized patients have notes visible to the opening vet—handoff is part of veterinary clinic management, not optional courtesy.",
          ],
          bullets: [
            "Open agenda: confirm locum access, note equipment downtime.",
            "Review same-day appointments — patient linked, reason coded.",
            "Preventive due queue (next 30 days): call or book top priority batch.",
            "Close all consults from prior session — due dates on patient records.",
            "Match dispensed goods to invoices for day's consults.",
            "Deposit or reconcile payments per clinic policy.",
            "Log equipment or fridge temperature checks if protocol requires.",
            "Handoff note for next shift — hospitalized patients, angry callbacks.",
            "Sanitize high-traffic workflow: refill requests logged, not sticky notes.",
            "Scan or attach critical paper received today (storage plan if heavy).",
          ],
        },
        {
          heading: "How software supports daily tasks",
          paragraphs: [
            "Without integrated software, daily checklist becomes theater—ticks on paper while Excel holds truth. Cloud veterinary clinic management software should surface appointment lists with reminders, patient preventive due dates, and consult checkout tying stock to invoices where your plan includes inventory.",
            "VetoCrm confirms appointments with reminders, patient vaccine and antiparasitic fields, consult and prescription workflows, and plan-based inventory/accounting—validate dispense-to-invoice behavior on demo for your tier.",
            "Do not assume SMS or email automation completes daily preventive calling; staff still execute the queue unless your contract confirms automated channels.",
            "Dashboards support daily orientation when filtered to today's risk: open consults, arrivals without linked patients, tasks left from yesterday's handoff note. Avoid vanity counts that reception cannot act on before first coffee.",
            "Mobile cloud access helps field vets close consults same day when they return to wifi—batching only at month-end revives paper-era backlog.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption:
            "Dashboard — daily orientation for managers without vanity metrics.",
        },
        {
          heading: "Weekly veterinary clinic management checklist",
          paragraphs: [
            "Weekly rhythm catches drift before month-end shock. Schedule a fixed managers' huddle (45 minutes, same weekday). Printable checklist below.",
            "Agenda the huddle: ten minutes KPI snapshot, twenty minutes problem list with owners, ten minutes wins to reinforce, five minutes next-week risk. Unstructured complaining consumes veterinary clinic management time without tickets closed.",
            "Rotate who presents the client-file sample audit—nurses catch consult gaps reception misses.",
          ],
          bullets: [
            "Complete preventive queue for rolling 30-day window — zero orphaned rows.",
            "No-show review and reschedule attempts (/monde-veto/reduce-veterinary-appointment-no-shows patterns).",
            "Open consults older than 48 hours — assign closer.",
            "Accounts receivable aging skim — call top five balances.",
            "Controlled drug log reconciliation (if paper, digitize entry same week).",
            "Expiring stock within 60 days — FEFO plan.",
            "Staffing vs appointment load — adjust templates.",
            "Sample five client files for handoff quality (retention SOP).",
            "Marketing or community tasks only if documented owner (avoid vague \"post on social\").",
            "Farm visits next week prepared — kits, invoices, records (mixed practices).",
          ],
        },
        {
          heading: "How software supports weekly tasks",
          paragraphs: [
            "Weekly checks need filterable lists: due preventives, open consults, invoice aging exports where accounting module permits. Retention metrics from /monde-veto/veterinary-client-retention-strategies depend on due dates living in patient records all week—not a Friday spreadsheet import.",
            "Multi-organization roles let weekly reviews stay entity-pure so farm revenue does not contaminate companion KPI denominators.",
            "Inventory weekly expiry sweeps align with /monde-veto/veterinary-inventory-management-guide count windows.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient lists — weekly preventive and handoff audits.",
        },
        {
          heading: "Monthly veterinary clinic management checklist",
          paragraphs: [
            "Monthly work connects operations to steering. Partners attend; managers bring one page of KPIs, not thirty. Printable checklist below.",
            "Close the month before negotiating next month's promotions—clinics that plan marketing before margin review often subsidize Instagram with stock write-offs.",
            "Document decisions in meeting minutes tied to checklist lines so locums next month inherit context, not gossip.",
          ],
          bullets: [
            "Refresh core KPIs — /monde-veto/veterinary-practice-kpis set (pick six).",
            "Margin conversation: revenue, COGS, labor % (/monde-veto/veterinary-practice-profitability).",
            "Full or cycle stock count per inventory policy.",
            "Supplier invoice match to purchase orders.",
            "Permission audit — leavers deactivated, locum access reviewed.",
            "Template review — consult, estimate, discharge wording.",
            "Retention loop health — preventive booking rate, lapsed client batch.",
            "Equipment maintenance and calibration due.",
            "Continuing education hours and compliance files.",
            "Storage usage and attachment growth — storage add-ons if needed.",
            "Partner pricing decisions on top five SKUs by revenue.",
            "Retire one redundant manual report if software export replaces it.",
          ],
        },
        {
          heading: "How software supports monthly tasks",
          paragraphs: [
            "Monthly KPI review needs consistent numerators: consult counts, preventive bookings, stock variance from system counts, accounting exports by plan. Free starter tiers may limit reporting depth—confirm before building monthly partner rituals around unavailable charts.",
            "Efficiency initiatives from /monde-veto/veterinary-clinic-efficiency-strategies should tie one monthly experiment to a KPI on this checklist (e.g., consult same-day close rate).",
            "Archive completed monthly checklist PDFs in a management folder for associate disputes—software audit trails complement, not replace, management discipline.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption:
            "Accounting — monthly margin and export discipline.",
        },
        {
          heading: "Printable checklist below: copy sections to your handbook",
          paragraphs: [
            "No standalone PDF asset ships with this article. Treat the three bullet sections above as your master veterinary clinic management checklist. Copy into Google Docs or Notion, add clinic name and initials column, pin in the treatment prep area.",
            "Optional one-page condensed version: Daily = agenda + due queue + close consults + dispense match. Weekly = preventive zero + no-shows + AR skim + file sample. Monthly = KPI page + stock count + permissions + margin talk.",
            "Review quarterly: delete lines your clinic never completes; add lines when inspectors or insurers require proof.",
          ],
        },
        {
          heading: "Farm and mixed-practice additions",
          paragraphs: [
            "Add daily farm kit return check and weekly herd visit note audit when farm modules are live. Multi-organization clinics duplicate weekly AR skim per entity.",
            "Confirmed VetoCrm farm modules and multi-organization roles support separated checklists—exercise in demo before printing one generic list that hides entity risk.",
          ],
        },
        {
          heading: "Onboarding new staff with the checklist",
          paragraphs: [
            "Week one: daily list only. Week three: add weekly huddle participation. Month two: shadow monthly KPI meeting.",
            "Software training maps one checklist line per session—search client, book appointment, close consult with due date, dispense line—rather than abstract \"software day.\"",
            "Read-only demo helps hires practice ticks without live data risk before /register sandbox.",
            "Competency test: new reception explains preventive queue from patient record screenshot; new nurse demonstrates expiry shelf walk. Checklist mastery precedes unsupervised Saturday shifts.",
            "Cross-link onboarding to /monde-veto/veterinary-client-retention-strategies so hires understand why Monday queue matters beyond admin nagging.",
          ],
        },
        {
          heading: "When checklists fail—and how to fix",
          paragraphs: [
            "Failure mode: checklist completed but software empty—enforce \"no tick without system record\" for clinical lines.",
            "Failure mode: thirty-line daily list ignored—cut to ten non-negotiables until compliance hits eighty percent.",
            "Failure mode: monthly KPI meeting without decisions—each red metric gets owner and date.",
            "Link chronic failure to efficiency guide rather than buying new modules immediately.",
            "Failure mode: only manager reads the checklist—rotate facilitation so nurses and reception own sections. Shared ownership increases honesty about skipped lines.",
            "Failure mode: checklist never updated after software upgrade—re-map lines when new modules (inventory, farm) go live or ticks become meaningless.",
          ],
        },
        {
          heading:
            "Seasonal and compliance overlays on the veterinary clinic management checklist",
          paragraphs: [
            "Add quarterly lines when regulators expect proof: controlled drug audits, radiation safety logs, waste contracts. Do not paste them into daily lists—monthly or quarterly annex keeps daily load bearable.",
            "Summer vacation season warrants a weekly locum checklist annex: temporary credentials, emergency drug location, after-hours phone tree.",
            "Year-end adds accountant prep lines: stock valuation snapshot, depreciation conversations, charitably discounted service review if partners track community care.",
          ],
        },
        {
          heading: "Sample week: how lines connect across cadences",
          paragraphs: [
            "Monday daily: aggressive preventive queue after weekend messages. Monday weekly if monthly boundary: preview KPI deltas for partner huddle.",
            "Wednesday weekly: no-show sweep before Thursday surgery prep. Friday daily: handoff emphasis for weekend locum.",
            "Month-end Friday: complete stock cycle count annex before social plans—clinics that postpone counts to next week reopen with invented COGS.",
            "This rhythm links operational checklist to /monde-veto/veterinary-inventory-management-guide count windows and /monde-veto/veterinary-client-retention-strategies Monday preventive habit without duplicating their full SOP text here.",
          ],
        },
        {
          heading: "VetoCrm as checklist backbone",
          paragraphs: [
            "VetoCrm integrates the data daily and weekly lines depend on: clients, patients, appointments with reminders, consults, vaccines, antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, cloud FR/EN/ES.",
            "Start free on /register, validate reporting on /pricing, use demo to rehearse checklist mapping before cultural rollout.",
            "Map each checklist bullet to a screen in sandbox during implementation week—checkbox in handbook should show a thumbnail arrow to the module screen so locums do not guess navigation.",
            "Storage add-ons matter when monthly checklist includes attachment and archive hygiene; plan tier limits should appear on the same one-page ops memo as subscription price.",
          ],
        },
      ],
      faq: [
        {
          q: "Is there a PDF download?",
          a: "No separate PDF—use the printable checklist below by copying the daily, weekly, and monthly bullet sections from this page.",
        },
        {
          q: "How does this relate to KPI article?",
          a: "/monde-veto/veterinary-practice-kpis defines metrics; this checklist schedules when to review them.",
        },
        {
          q: "Smallest clinic viable checklist?",
          a: "Six daily lines (agenda, due queue, close consults, dispense match, handoff, payments) plus weekly preventive zero.",
        },
        {
          q: "Who should own the monthly meeting?",
          a: "Practice manager facilitates; partners decide pricing and staffing actions.",
        },
        {
          q: "Can VetoCrm automate the whole checklist?",
          a: "Software supports data and queues; humans still perform calls, counts, and partner conversations.",
        },
        {
          q: "Farm tasks on same list?",
          a: "Add explicit farm lines when farm modules are in scope; do not bury herd work inside generic bullets.",
        },
      ],
      ctaTitle: "Run the clinic on rails",
      ctaBody:
        "Copy the printable checklist below into your ops handbook, align KPIs and retention guides, explore demo, and trial /register with your cadence owners named.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Checklist gestion de clinique vétérinaire : tâches jour, semaine, mois",
      excerpt:
        "Checklist gestion clinique vétérinaire par fréquence, rôles et soutien logiciel. Copiez les sections comme checklist imprimable (pas de PDF séparé).",
      metaDescription:
        "Checklist gestion clinique vétérinaire : quotidien, hebdo, mensuel, rôles, logiciel. Checklist imprimable ci-dessous. Liens KPI, fidélisation, stock, efficacité. VetoCrm.",
      category: "Opérations",
      sections: [
        {
          heading:
            "Pourquoi une checklist gestion de clinique vétérinaire bat la mémoire",
          paragraphs: [
            "Répartir les tâches par cadence et rôle évite l’effondrement quand une personne clé part. Pas de PDF séparé : copiez les listes ci-dessous.",
            "Approfondissements : /monde-veto/veterinary-practice-kpis, /monde-veto/veterinary-client-retention-strategies, /monde-veto/veterinary-inventory-management-guide, /monde-veto/veterinary-clinic-efficiency-strategies.",
            "VetoCrm : modules confirmés vetocrm.com (clients/patients, RDV/rappels, consultations, vaccins, stock/compta selon formule, fermes, multi-organisation, démo, cloud FR/EN/ES).",
          ],
        },
        {
          heading: "Rôles et responsabilités",
          paragraphs: ["Une ligne = un rôle accountable."],
          bullets: [
            "Gestionnaire — KPI mensuels, permissions.",
            "Accueil référent — agenda, file préventifs, factures.",
            "ASV référent — stock contrôlé, péremptions.",
            "Vétérinaire de garde — clôture consults.",
            "Référent stock — comptages hebdo.",
            "Associés — prix et marge mensuels.",
            "Référent fermes si mixte.",
          ],
        },
        {
          heading: "Checklist quotidienne",
          paragraphs: ["Copier pour affichage salle de soins :"],
          bullets: [
            "Agenda du jour et accès remplaçants.",
            "RDV liés au bon patient.",
            "File vaccins/antiparasitaires 30 jours.",
            "Clôture consults + échéances sur fiche.",
            "Dispensation = facture.",
            "Encaissements / rapprochement.",
            "Contrôles frigo/protocol si requis.",
            "Note de passation.",
            "Demandes officines tracées.",
            "Scan des papiers critiques (stockage si besoin).",
          ],
        },
        {
          heading: "Soutien logiciel au quotidien",
          paragraphs: [
            "Agenda, échéances patient, checkout stock selon formule VetoCrm validée en démo.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Dashboard — orientation quotidienne.",
        },
        {
          heading: "Checklist hebdomadaire",
          paragraphs: ["Réunion gestion 45 min :"],
          bullets: [
            "File préventifs 30 jours à zéro.",
            "No-shows et reports.",
            "Consults ouverts > 48 h.",
            "Top créances clients.",
            "Médicaments contrôlés.",
            "Stock périmant sous 60 jours.",
            "Charge agenda vs effectifs.",
            "Échantillon 5 dossiers passation.",
            "Visites fermes préparées.",
          ],
        },
        {
          heading: "Soutien logiciel hebdo",
          paragraphs: [
            "Filtres échéances, consults ouverts, exports créances. Fidélisation : /monde-veto/veterinary-client-retention-strategies.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Patients — audits hebdo.",
        },
        {
          heading: "Checklist mensuelle",
          paragraphs: ["Partenaires présents, une page KPI :"],
          bullets: [
            "KPI cœur (/monde-veto/veterinary-practice-kpis).",
            "Marge et masse salariale.",
            "Inventaire physique ou tournant.",
            "Factures fournisseurs.",
            "Audit droits utilisateurs.",
            "Modèles consult/sortie.",
            "Boucles fidélisation.",
            "Maintenance équipement.",
            "Formation continue.",
            "Volume stockage / options.",
            "Prix top SKU.",
            "Retirer un rapport manuel redondant.",
          ],
        },
        {
          heading: "Soutien logiciel mensuel",
          paragraphs: [
            "Profondeur reporting selon formule /pricing. Efficacité : /monde-veto/veterinary-clinic-efficiency-strategies.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Compta — rythme mensuel.",
        },
        {
          heading: "Checklist imprimable ci-dessous",
          paragraphs: [
            "Copiez les trois listes en un document interne. Version courte : jour = agenda + préventifs + clôture ; semaine = zéro file + no-shows ; mois = KPI + stock + permissions.",
          ],
        },
        {
          heading: "Pratique mixte / fermes",
          paragraphs: [
            "Lignes retour kits et notes troupeau. Checklist par entité si multi-organisation.",
          ],
        },
        {
          heading: "Intégrer les nouveaux",
          paragraphs: [
            "Semaine 1 quotidien seul ; démo lecture seule avant données réelles.",
          ],
        },
        {
          heading: "Quand la checklist échoue",
          paragraphs: [
            "Pas de coche sans trace système. Réduire la liste si > 30 % ignorée. Décision par KPI rouge.",
          ],
        },
        {
          heading: "VetoCrm comme colonne vertébrale",
          paragraphs: [
            "Données intégrées pour chaque ligne. /register, /pricing, démo.",
          ],
        },
      ],
      faq: [
        {
          q: "PDF disponible ?",
          a: "Non — copiez les sections bullet de cette page.",
        },
        {
          q: "Lien avec article KPI ?",
          a: "KPI = indicateurs ; checklist = quand les revoir.",
        },
        {
          q: "Minimum viable ?",
          a: "Six lignes quotidiennes + préventifs hebdo à zéro.",
        },
        {
          q: "Qui anime le mensuel ?",
          a: "Gestionnaire facilite ; associés décident.",
        },
        {
          q: "Automatisation totale ?",
          a: "Non — appels et comptages restent humains.",
        },
        {
          q: "Fermes sur la même liste ?",
          a: "Lignes dédiées si modules fermes actifs.",
        },
      ],
      ctaTitle: "Cadrez le quotidien",
      ctaBody: "Copiez la checklist, liez les guides KPI/fidélisation, démo, /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Checklist de gestión de clínica veterinaria: tareas diarias, semanales y mensuales",
      excerpt:
        "Checklist de gestión de clínica veterinaria por frecuencia, roles y apoyo del software. Copie las secciones como lista imprimible (sin PDF aparte).",
      metaDescription:
        "Checklist gestión clínica veterinaria: diario, semanal, mensual, roles, software. Lista imprimible abajo. Enlaces KPI, retención, inventario, eficiencia. VetoCrm.",
      category: "Operaciones",
      sections: [
        {
          heading:
            "Por qué una checklist de gestión de clínica veterinaria vence a la memoria",
          paragraphs: [
            "Repartir tareas por cadencia y rol evita depender de héroes. Sin PDF separado: copie las listas de abajo.",
            "Profundidad: /monde-veto/veterinary-practice-kpis, /monde-veto/veterinary-client-retention-strategies, /monde-veto/veterinary-inventory-management-guide, /monde-veto/veterinary-clinic-efficiency-strategies.",
            "VetoCrm confirmado: clientes/pacientes, citas/recordatorios, consultas, vacunas, inventario/contabilidad por plan, granjas, multiorganización, demo, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "Roles y responsabilidad",
          paragraphs: ["Cada línea tiene un dueño."],
          bullets: [
            "Gerente — KPI mensuales.",
            "Recepción líder — agenda, preventivos, facturas.",
            "Enfermería líder — stock controlado, caducidades.",
            "Veterinario de turno — cierre de consultas.",
            "Dueño inventario — conteos semanales.",
            "Socios — precios y margen.",
            "Líder granjas si aplica.",
          ],
        },
        {
          heading: "Checklist diaria",
          paragraphs: ["Copiar al cuarto de tratamiento:"],
          bullets: [
            "Agenda y accesos.",
            "Citas con paciente vinculado.",
            "Cola preventiva 30 días.",
            "Cerrar consultas con fecha vacuna.",
            "Dispensación = factura.",
            "Cobros.",
            "Controles frío/protocolo.",
            "Nota de relevo.",
            "Recetas registradas.",
            "Escanear papel crítico.",
          ],
        },
        {
          heading: "Software en el día a día",
          paragraphs: [
            "Citas, vencimientos, checkout según plan VetoCrm en demo.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Panel — orientación diaria.",
        },
        {
          heading: "Checklist semanal",
          paragraphs: ["Reunión 45 min:"],
          bullets: [
            "Cola preventiva a cero.",
            "No-shows.",
            "Consultas abiertas > 48 h.",
            "Top deudas clientes.",
            "Medicamentos controlados.",
            "Caducidad < 60 días.",
            "Carga vs personal.",
            "Muestra 5 historiales.",
            "Visitas granja preparadas.",
          ],
        },
        {
          heading: "Software semanal",
          paragraphs: [
            "Filtros y exportes. Retención: /monde-veto/veterinary-client-retention-strategies.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Pacientes — auditoría semanal.",
        },
        {
          heading: "Checklist mensual",
          paragraphs: ["Socios + una página KPI:"],
          bullets: [
            "KPI (/monde-veto/veterinary-practice-kpis).",
            "Margen y nómina.",
            "Inventario físico.",
            "Facturas proveedores.",
            "Auditoría permisos.",
            "Plantillas clínicas.",
            "Bucles retención.",
            "Mantenimiento.",
            "Formación.",
            "Almacenamiento adjuntos.",
            "Precios top SKU.",
            "Retirar informe manual redundante.",
          ],
        },
        {
          heading: "Software mensual",
          paragraphs: [
            "Informes según /pricing. Eficiencia: /monde-veto/veterinary-clinic-efficiency-strategies.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Contabilidad mensual.",
        },
        {
          heading: "Lista imprimible abajo",
          paragraphs: [
            "Copie las tres listas a su manual. Versión corta: día = agenda + preventivos + cierre; semana = cero cola; mes = KPI + stock.",
          ],
        },
        {
          heading: "Granjas y mixto",
          paragraphs: [
            "Líneas de kits de campo y notas de hato. Checklist por entidad si multiorganización.",
          ],
        },
        {
          heading: "Incorporar personal",
          paragraphs: [
            "Semana 1 solo diario; demo antes de datos vivos.",
          ],
        },
        {
          heading: "Cuando falla la checklist",
          paragraphs: [
            "Sin marca sin registro en sistema. Acortar lista si se ignora. Acción por KPI rojo.",
          ],
        },
        {
          heading: "VetoCrm como columna",
          paragraphs: [
            "Datos integrados. /register, /pricing, demo.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Hay PDF?",
          a: "No — copie las secciones de viñetas de esta página.",
        },
        {
          q: "¿Relación con KPI?",
          a: "KPI define métricas; checklist define cuándo revisarlas.",
        },
        {
          q: "Mínimo viable?",
          a: "Seis líneas diarias + preventivos semanal a cero.",
        },
        {
          q: "¿Quién lidera el mensual?",
          a: "Gerente facilita; socios deciden.",
        },
        {
          q: "¿Automatización total?",
          a: "No — llamadas y conteos siguen siendo humanos.",
        },
        {
          q: "¿Granjas en la misma lista?",
          a: "Líneas dedicadas si hay módulos granja.",
        },
      ],
      ctaTitle: "Ordene la operación",
      ctaBody: "Copie la checklist, enlace guías KPI/retención, demo, /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};