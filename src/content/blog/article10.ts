import type { BlogArticle } from "./types";

export const ARTICLE_10: BlogArticle = {
  slug: "veterinary-practice-kpis",
  cover: "/monde-veto/screen-dashboard.png",
  coverAlt: {
    fr: "Tableau de bord VetoCrm — KPI d'une clinique vétérinaire",
    en: "VetoCrm dashboard — veterinary practice KPIs",
    es: "Panel VetoCrm — KPI de una clínica veterinaria",
  },
  publishedAt: "2027-03-19",
  readingMinutes: 13,
  locales: {
    en: {
      title:
        "Veterinary Practice KPIs: 12 Metrics Every Clinic Owner Should Track",
      excerpt:
        "Twelve veterinary practice KPIs with formulas, illustrative clinic math, and a sample owner dashboard—linked to efficiency, inventory discipline, and profitability without vanity metrics.",
      metaDescription:
        "Veterinary practice KPIs: 12 metrics, formulas, example numbers, dashboard layout. Links to clinic efficiency, inventory guide, profitability. VetoCrm reporting by plan.",
      category: "Practice management",
      sections: [
        {
          heading: "KPIs worth tracking versus numbers that just look busy",
          paragraphs: [
            "Veterinary practice KPIs should change a decision—not fill a slide deck. Owners who track thirty metrics monthly usually review none; teams that track twelve well-chosen indicators can tie each one to staffing, pricing, stock, or scheduling within a single managers' meeting.",
            "This article defines twelve primary veterinary practice KPIs with plain formulas and illustrative example numbers (labeled as a hypothetical three-vet companion clinic, not VetoCrm customer data). We connect clinical operations to finance where the metric demands it. For workflow levers behind the numerators, cross-read /monde-veto/veterinary-clinic-efficiency-strategies, /monde-veto/veterinary-inventory-management-guide, and /monde-veto/veterinary-practice-profitability.",
            "Where software appears, we cite only confirmed VetoCrm capabilities: clients and patients, appointments with reminders, consults and prescriptions, vaccines and antiparasitics, inventory and accounting by plan tier, farm modules, multi-organization roles, free starter tier, storage add-ons, read-only demo, and cloud UI in French, English, and Spanish. We do not invent customer statistics or undocumented integrations.",
            "Start with a monthly rhythm: close books, refresh KPIs, post a one-page dashboard, assign one owner per red metric. Quarterly, retire metrics nobody acted on.",
          ],
        },
        {
          heading: "Illustrative clinic baseline (hypothetical)",
          paragraphs: [
            "The formulas below use a fictional month for clarity—not benchmarks you must hit. Clinic A: three FTE veterinarians, 1.5 FTE nurses, 2 reception FTE; 920 invoices; gross revenue €285,000; COGS (stock consumed at cost) €68,400; operating expenses €198,000; 4,100 appointment slots offered; 3,485 completed consults; 412 no-shows.",
            "Label every internal spreadsheet the same way: Illustration = teaching math; Live = your ERP/PIMS export. Mixing them in board conversations causes false urgency.",
            "If your PIMS lacks a metric natively, calculate in a controlled workbook fed by exports—then automate only after two months of manual sanity checks.",
          ],
        },
        {
          heading: "Revenue and margin KPIs (1–4)",
          paragraphs: [
            "These four answer whether pricing, stock, and discipline survive contact with reality.",
          ],
          bullets: [
            "KPI 1 — Gross revenue (period): Sum of taxable clinical revenue plus ancillary lines per your chart. Illustration: €285,000 for month M.",
            "KPI 2 — Gross margin %: (Revenue − COGS) ÷ Revenue × 100. Illustration: (285,000 − 68,400) ÷ 285,000 = 76.0%. COGS must come from inventory truth—see /monde-veto/veterinary-inventory-management-guide.",
            "KPI 3 — Revenue per vet FTE: Revenue ÷ veterinarian FTE count. Illustration: 285,000 ÷ 3 = €95,000 per vet FTE-month. Seasonality demands trailing three-month averages.",
            "KPI 4 — Operating margin % (before owner discretionary): (Revenue − COGS − operating expenses) ÷ Revenue × 100. Illustration: (285,000 − 68,400 − 198,000) ÷ 285,000 = 6.5%. Dive deeper in /monde-veto/veterinary-practice-profitability.",
          ],
        },
        {
          heading: "Utilization and throughput KPIs (5–7)",
          paragraphs: [
            "Throughput KPIs expose scheduling fiction: full diaries that still bleed no-shows, or templates that force duplicate documentation.",
          ],
          bullets: [
            "KPI 5 — Consult utilization rate: Completed consults ÷ appointments offered × 100. Illustration: 3,485 ÷ 4,100 = 85.0%. Pair with /monde-veto/veterinary-clinic-efficiency-strategies for template and triage fixes.",
            "KPI 6 — No-show rate: No-shows ÷ (Completed + no-shows) × 100. Illustration: 412 ÷ (3,485 + 412) = 10.6%. Reminders from your PIMS help numerators when staff honor booking hygiene.",
            "KPI 7 — Average transaction value (ATV): Revenue ÷ invoice count. Illustration: 285,000 ÷ 920 = €309.78. Segment by species or service line before repricing; blended ATV hides loss leaders.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption:
            "Sample dashboard tile set — utilization, revenue, and preventive compliance in one weekly glance.",
        },
        {
          heading: "Client and preventive KPIs (8–10)",
          paragraphs: [
            "Relationship KPIs belong in veterinary practice KPIs because retention and preventives fund fixed costs. Define numerators once—debating definitions monthly destroys trust.",
          ],
          bullets: [
            "KPI 8 — Active client households: Owners with ≥1 live patient and a visit in trailing 12 months ÷ total owner records × 100. Illustration: 2,140 active ÷ 2,650 records = 80.8%.",
            "KPI 9 — Preventive compliance (due window): Patients with vaccine/antiparasitic administered within policy window ÷ patients due × 100. Illustration: 88 ÷ 112 = 78.6% in a 30-day recall cohort. Requires due dates on patient records—not a marketing list.",
            "KPI 10 — New client conversion: New households with second paid visit within 60 days ÷ new households × 100. Illustration: 54 ÷ 72 = 75.0%. Reception workflow matters as much as clinical quality.",
          ],
        },
        {
          heading: "Stock and cash KPIs (11–12)",
          paragraphs: [
            "Inventory and accounts receivable are lagging indicators of daily habits. Track them monthly; investigate weekly when red.",
          ],
          bullets: [
            "KPI 11 — Inventory shrinkage %: (Book stock − counted stock) ÷ book stock × 100 on sampled SKUs, annualized. Illustration: 2.1% on a monthly cycle count of critical lines—acceptable only with investigated root causes.",
            "KPI 12 — Days sales outstanding (DSO): (Accounts receivable ÷ credit revenue) × days in period. Illustration: (€24,200 ÷ €31,000) × 30 ≈ 23.4 days on tracked client credit. Cash clinics may track quote-to-paid latency instead.",
          ],
        },
        {
          heading: "Sample owner dashboard (monthly one-pager)",
          paragraphs: [
            "A useful veterinary practice KPI dashboard fits one printed page or a single screen tile group. Row A — financial: gross revenue, gross margin %, operating margin %, DSO. Row B — throughput: utilization, no-show %, ATV. Row C — clinical relationship: active households %, preventive compliance, new client conversion. Row D — stock: shrinkage on critical SKUs, days of cover on top vaccines (from inventory module or export).",
            "Color rules: green within agreed band, amber one period out of band, red two consecutive periods or any patient-safety adjacency (e.g., expired preventives dispensed—if you track incidentally). Red metrics require a named owner and a dated corrective action, not a group shrug.",
            "VetoCrm: accounting and reporting depth varies by plan—validate which revenue, stock, and appointment extracts you can feed this dashboard on /pricing and in demo. Do not assume the free starter tier exposes every export.",
            "Publish the dashboard with narrative: one sentence on what improved, one on what slipped, one decision for next month. Numbers without narrative become wallpaper.",
          ],
        },
        {
          heading: "Cadence, targets, and anti-patterns",
          paragraphs: [
            "Set targets from your own trailing twelve months, not industry forum bravado. Illustration targets for Clinic A might include: cut no-shows below 8.5%, raise preventive compliance above 82%, hold shrinkage under 2.5% with documented waste codes.",
            "Anti-pattern 1 — ATV worship without case mix: surgeons inflate ATV while wellness stagnates. Anti-pattern 2 — utilization without duration: packed diaries with 8-minute work squeezed into 15-minute slots destroy quality. Anti-pattern 3 — revenue per vet as a beating stick without locum and triage context.",
            "When a KPI conflicts with clinical ethics (upselling unnecessary diagnostics to lift ATV), discard the KPI language and fix governance—not the pet.",
            "Tie weekly front-desk habits to monthly numerators: due queues for KPI 9, deposit policy for KPI 6, dispense-to-invoice for KPI 2. That is how veterinary practice KPIs stay honest.",
          ],
        },
        {
          heading: "Assign an owner to each KPI",
          paragraphs: [
            "A metric without a named owner becomes gossip. Reception owns no-show rate and deposit adherence; lead nurse owns preventive compliance sampling; inventory captain owns shrinkage on the critical SKU list; practice manager owns dashboard assembly and DSO follow-up; clinical director owns consult utilization review with vets—not alone in a spreadsheet.",
            "Document escalation: amber two months triggers a 20-minute root-cause huddle; red triggers a dated corrective action in the quality file. Avoid punishment culture; the goal is to fix intake templates, thresholds, or phone scripts.",
            "In multi-organization groups, do not blend entities on one dashboard without footnotes. Revenue per vet FTE that mixes a quiet companion site with a busy farm hub humiliates the wrong people.",
          ],
        },
        {
          heading: "How KPIs chain across the blog series",
          paragraphs: [
            "Think of the series as a funnel. Efficiency (/monde-veto/veterinary-clinic-efficiency-strategies) improves numerators for utilization and documentation time. Inventory (/monde-veto/veterinary-inventory-management-guide) protects gross margin and shrinkage KPIs. Profitability (/monde-veto/veterinary-practice-profitability) explains what operating margin means after payroll and rent.",
            "Automation (/monde-veto/veterinary-practice-automation-tasks) can feed KPI 9 and KPI 6 when due dates and reminders live in the PIMS—provided staff still complete queues. CRM relationship work (/monde-veto/veterinary-crm-clients-pets-relationships) lifts KPI 8 and KPI 10 when handoffs and welcome paths exist.",
            "If you import KPI 2 from an accountant while KPI 11 stays fiction, partners argue in circles. Sequence matters: stock truth before margin targets.",
          ],
        },
        {
          heading: "Data hygiene before you brag about trends",
          paragraphs: [
            "KPI trends lie when master data rots. Deduplicate clients quarterly, merge orphan patients, and close consults without open dispense lines. One bad month of lazy checkout poisons ATV and margin comparisons for a quarter.",
            "Agree fiscal period cut-off with finance: accrual vs cash should not swap mid-year on the owner dashboard. Illustration months use accrual revenue for teaching; your live board must pick one definition and stick to it.",
            "When migrating software, run parallel KPI math one month on old and new exports before switching the official dashboard—enthusiasm for a new PIMS should not erase baseline history.",
            "Seasonal clinics should annotate dashboards—parasite season, holiday closures, hunting dog trauma weeks—so amber metrics are not misread as staff failure.",
          ],
        },
        {
          heading: "Where VetoCrm fits",
          paragraphs: [
            "VetoCrm is an integrated cloud PIMS: clients, patients, appointments with reminders, consults, vaccines, antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, storage add-ons, read-only demo, FR/EN/ES UI. It supports KPI numerators when teams enter data once and export or review plan-appropriate reporting.",
            "Trial path: read-only demo → map which of the twelve KPIs your tier can source natively → free starter on /register for sandbox clients and fictitious month-close → upgrade only when inventory and accounting exports justify it.",
            "KPIs do not replace the profitability guide—they prioritize which line on the P&L to discuss first. Continue with /monde-veto/veterinary-practice-profitability after your dashboard stabilizes.",
            "Appointment reminders support KPI 6 numerators only when booking data is clean—garbage slots inflate denominators.",
          ],
        },
      ],
      faq: [
        {
          q: "How many veterinary practice KPIs should a small clinic track?",
          a: "Twelve monthly maximum on one dashboard; fewer until data entry is reliable. Add metrics only when you act on reds.",
        },
        {
          q: "Are the example numbers VetoCrm customer results?",
          a: "No. Illustrations are hypothetical clinic math for teaching formulas—not published customer statistics.",
        },
        {
          q: "What is the first KPI to fix when overwhelmed?",
          a: "Usually no-show rate or preventive compliance—they need habit changes, not new software.",
        },
        {
          q: "Does VetoCrm ship a ready-made KPI dashboard?",
          a: "Reporting depends on plan tier. Validate dashboards and exports on /pricing and in demo.",
        },
        {
          q: "How do KPIs connect to inventory and profitability articles?",
          a: "Gross margin and shrinkage need stock truth (/monde-veto/veterinary-inventory-management-guide); operating margin detail lives in /monde-veto/veterinary-practice-profitability.",
        },
        {
          q: "Should veterinarians see financial KPIs?",
          a: "Many clinics share throughput and preventive metrics broadly; reserve margin detail to partners or a clinical director with finance duty.",
        },
      ],
      ctaTitle: "Track practice KPIs in VetoCrm",
      ctaBody:
        "Confirm reporting on your plan via /pricing, explore the read-only demo, and rehearse monthly close on /register.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "KPI clinique vétérinaire : 12 indicateurs à suivre pour le dirigeant",
      excerpt:
        "Douze KPI de gestion vétérinaire, formules, exemples chiffrés illustratifs et modèle de tableau de bord — liens efficacité, stock et rentabilité.",
      metaDescription:
        "KPI clinique vétérinaire : 12 métriques, formules, exemples fictifs, dashboard. Liens efficacité, stocks, rentabilité. Reporting VetoCrm selon formule.",
      category: "Pilotage",
      sections: [
        {
          heading: "KPI utiles ou vanity metrics",
          paragraphs: [
            "Un KPI clinique vétérinaire doit déclencher une action. Douze indicateurs mensuels suffisent si chacun a un responsable. Voir /monde-veto/veterinary-clinic-efficiency-strategies, /monde-veto/veterinary-inventory-management-guide et /monde-veto/veterinary-practice-profitability.",
            "VetoCrm : clients/patients, RDV/rappels, consultations, vaccins/antiparasitaires, stock et compta selon formule, fermes, multi-organisation, formule découverte, stockage optionnel, démo lecture seule, cloud FR/EN/ES — sans stats clients inventées.",
          ],
        },
        {
          heading: "Base illustrative (fictive)",
          paragraphs: [
            "Clinique A fictive : 3 vet ETP, 920 factures, CA €285 000, COGS €68 400, 4 100 créneaux, 3 485 consults, 412 absences. Marquez « Illustration » vs « Live » dans vos exports.",
          ],
        },
        {
          heading: "CA et marges (1–4)",
          paragraphs: ["Quatre KPI financiers racine."],
          bullets: [
            "1 — CA période : somme facturation clinique.",
            "2 — Marge brute % : (CA − COGS) ÷ CA × 100. Ex. 76,0 %.",
            "3 — CA par vet ETP : CA ÷ vet ETP. Ex. €95 000.",
            "4 — Marge opérationnelle % : après charges exploitations. Ex. 6,5 %. Détail : article rentabilité.",
          ],
        },
        {
          heading: "Occupation et flux (5–7)",
          paragraphs: ["La vérité planning."],
          bullets: [
            "5 — Taux d'utilisation : consults réalisées ÷ créneaux × 100. Ex. 85 %.",
            "6 — Taux no-show : absences ÷ (consults + absences) × 100. Ex. 10,6 %.",
            "7 — Panier moyen : CA ÷ nombre de factures. Ex. €309,78.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Exemple de tuiles dashboard — occupation, CA, préventifs.",
        },
        {
          heading: "Clients et préventifs (8–10)",
          paragraphs: ["FIDélisation mesurable."],
          bullets: [
            "8 — Foyers actifs 12 mois : actifs ÷ fiches propriétaires. Ex. 80,8 %.",
            "9 — Conformité préventive : traités dans la fenêtre ÷ dus. Ex. 78,6 %.",
            "10 — Conversion nouveau client : 2e visite payée 60 j ÷ nouveaux. Ex. 75 %.",
          ],
        },
        {
          heading: "Stock et trésorerie (11–12)",
          paragraphs: ["Indicateurs retard révélant habitudes quotidiennes."],
          bullets: [
            "11 — Shrinkage % : (stock théorique − compté) ÷ théorique. Ex. 2,1 %.",
            "12 — DSO jours : (créances ÷ CA crédit) × jours. Ex. ≈23,4 j.",
          ],
        },
        {
          heading: "Dashboard dirigeant (one-pager)",
          paragraphs: [
            "Ligne A finance, B occupation, C relation client, D stock. Code couleur vert/ambre/rouge ; rouge = action datée.",
            "Profondeur reporting VetoCrm selon formule — valider sur /pricing.",
          ],
        },
        {
          heading: "Cadence et pièges",
          paragraphs: [
            "Cibles depuis vos 12 mois glissants. Éviter culte du panier moyen sans typologie d'actes.",
            "Relier files vaccins, acomptes no-show, dispense-facture aux KPI hebdo.",
          ],
        },
        {
          heading: "Responsable par KPI",
          paragraphs: [
            "Accueil : no-show ; ASV référente : préventifs ; stock : shrinkage ; manager : dashboard et DSO. Escalade ambre/rouge documentée.",
          ],
        },
        {
          heading: "Chaîne avec les autres articles",
          paragraphs: [
            "Efficacité, stocks, rentabilité, automatisation, CRM — lire dans cet ordre si la marge est fantaisiste.",
          ],
        },
        {
          heading: "Hygiène des données",
          paragraphs: [
            "Dédoublonnage clients, consults clôturées, même définition comptable mois après mois.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "PIMS cloud intégré ; KPIs fiables si saisie unique et exports validés en démo. /register pour bacs à sable.",
          ],
        },
      ],
      faq: [
        {
          q: "Combien de KPI pour un petit cabinet ?",
          a: "Douze max sur un dashboard ; moins tant que la saisie est fragile.",
        },
        {
          q: "Les exemples sont-ils des clients VetoCrm ?",
          a: "Non — mathématiques illustratives fictives.",
        },
        {
          q: "Premier KPI à attaquer ?",
          a: "Souvent no-show ou conformité préventive — habitudes avant logiciel.",
        },
        {
          q: "Dashboard natif VetoCrm ?",
          a: "Selon formule ; vérifier /pricing et démo.",
        },
        {
          q: "Lien stock et rentabilité ?",
          a: "Marge et shrinkage : guide stocks ; marge opérationnelle : article rentabilité.",
        },
        {
          q: "KPI financiers visibles des vétérinaires ?",
          a: "Souvent occupation/préventifs pour tous ; marges réservées à la direction.",
        },
      ],
      ctaTitle: "Pilotez vos KPI avec VetoCrm",
      ctaBody: "Reporting sur /pricing, démo, essai /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "KPI de clínica veterinaria: 12 métricas que todo propietario debe seguir",
      excerpt:
        "Doce KPI veterinarios con fórmulas, números ilustrativos y modelo de panel — enlaces a eficiencia, inventario y rentabilidad.",
      metaDescription:
        "KPI clínica veterinaria: 12 métricas, fórmulas, ejemplos hipotéticos, panel. Eficiencia, inventario, rentabilidad. Informes VetoCrm por plan.",
      category: "Gestión",
      sections: [
        {
          heading: "KPI que deciden vs métricas de vanidad",
          paragraphs: [
            "Un KPI veterinario debe provocar acción. Doce indicadores mensuales bastan con responsable cada uno. Ver /monde-veto/veterinary-clinic-efficiency-strategies, /monde-veto/veterinary-inventory-management-guide y /monde-veto/veterinary-practice-profitability.",
            "VetoCrm: clientes/pacientes, citas/recordatorios, consultas, vacunas/antiparasitarios, inventario y contabilidad por plan, granjas, multiorganización, plan gratuito, almacenamiento opcional, demo lectura, cloud FR/EN/ES — sin estadísticas de clientes inventadas.",
          ],
        },
        {
          heading: "Base ilustrativa (hipotética)",
          paragraphs: [
            "Clínica A ficticia: 3 vet ETC, 920 facturas, ingresos €285.000, COGS €68.400, 4.100 huecos, 3.485 consultas, 412 ausencias. Etiquete Ilustración vs En vivo.",
          ],
        },
        {
          heading: "Ingresos y margen (1–4)",
          paragraphs: ["Cuatro KPI financieros raíz."],
          bullets: [
            "1 — Ingresos del período.",
            "2 — Margen bruto %: (Ingresos − COGS) ÷ Ingresos × 100. Ej. 76,0 %.",
            "3 — Ingresos por vet ETC: Ej. €95.000.",
            "4 — Margen operativo %: Ej. 6,5 %. Ver guía rentabilidad.",
          ],
        },
        {
          heading: "Utilización y flujo (5–7)",
          paragraphs: ["La verdad del agenda."],
          bullets: [
            "5 — Tasa de utilización: consultas ÷ huecos × 100. Ej. 85 %.",
            "6 — Tasa de no-show: Ej. 10,6 %.",
            "7 — Ticket medio: ingresos ÷ facturas. Ej. €309,78.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Panel de ejemplo — utilización, ingresos, preventivos.",
        },
        {
          heading: "Clientes y preventivos (8–10)",
          paragraphs: ["Retención medible."],
          bullets: [
            "8 — Hogares activos 12 meses: Ej. 80,8 %.",
            "9 — Cumplimiento preventivo: Ej. 78,6 %.",
            "10 — Conversión nuevo cliente 60 días: Ej. 75 %.",
          ],
        },
        {
          heading: "Inventario y caja (11–12)",
          paragraphs: ["Indicadores rezagados de hábitos diarios."],
          bullets: [
            "11 — Merma % en SKU críticos: Ej. 2,1 %.",
            "12 — DSO días: Ej. ≈23,4 d.",
          ],
        },
        {
          heading: "Panel del propietario (una página)",
          paragraphs: [
            "Fila A finanzas, B flujo, C relación, D stock. Verde/ámbar/rojo ; rojo exige acción fechada.",
            "Informes VetoCrm según plan — validar en /pricing.",
          ],
        },
        {
          heading: "Cadencia y trampas",
          paragraphs: [
            "Objetivos desde 12 meses propios. Evitar obsesión del ticket medio sin mix de casos.",
            "Colas de vacunas, depósitos anti no-show, dispensación-factura alimentan KPI semanal.",
          ],
        },
        {
          heading: "Responsable por KPI",
          paragraphs: [
            "Recepción: no-show; enfermería: preventivos; inventario: mermas; gestión: panel y DSO.",
          ],
        },
        {
          heading: "Enlaces entre artículos",
          paragraphs: [
            "Eficiencia, inventario, rentabilidad, automatización y CRM en secuencia lógica.",
          ],
        },
        {
          heading: "Calidad de datos",
          paragraphs: [
            "Sin duplicados, consultas cerradas, misma definición contable cada mes.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "PIMS cloud integrado ; KPIs honestos con una sola captura de datos y exportaciones validadas en demo.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Cuántos KPI en clínica pequeña?",
          a: "Doce máximo en un panel ; menos si la captura es irregular.",
        },
        {
          q: "¿Los ejemplos son clientes VetoCrm?",
          a: "No — matemática ilustrativa ficticia.",
        },
        {
          q: "¿Primer KPI a corregir?",
          a: "Suele ser no-show o cumplimiento preventivo.",
        },
        {
          q: "¿Panel KPI nativo en VetoCrm?",
          a: "Depende del plan ; confirmar en /pricing y demo.",
        },
        {
          q: "¿Enlace inventario y rentabilidad?",
          a: "Margen y mermas: guía inventario ; detalle P&L: rentabilidad.",
        },
        {
          q: "¿KPI financieros para veterinarios?",
          a: "A menudo flujo/preventivos para todos ; márgenes para dirección.",
        },
      ],
      ctaTitle: "Siga KPI en VetoCrm",
      ctaBody: "Informes en /pricing, demo, prueba /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};