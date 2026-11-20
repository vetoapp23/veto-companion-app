import type { BlogArticle } from "./types";

export const ARTICLE_12: BlogArticle = {
  slug: "veterinary-practice-profitability",
  cover: "/monde-veto/screen-accounting.png",
  coverAlt: {
    fr: "Comptabilité VetoCrm — gestion financière de clinique vétérinaire",
    en: "VetoCrm accounting — veterinary clinic financial management",
    es: "Contabilidad VetoCrm — gestión financiera de clínica veterinaria",
  },
  publishedAt: "2027-04-02",
  readingMinutes: 12,
  locales: {
    en: {
      title:
        "Veterinary Clinic Financial Management: How to Improve Profitability",
      excerpt:
        "Revenue, COGS, operating expenses, margins, billing hygiene, and financial KPIs for veterinary clinics—with honest reporting habits and VetoCrm accounting scoped by plan.",
      metaDescription:
        "Veterinary practice profitability: revenue, expenses, margins, billing, financial KPIs, reporting. VetoCrm accounting by plan. Links to KPI and inventory guides.",
      category: "Finance",
      sections: [
        {
          heading: "Profitability is a habit—not a consultant slide",
          paragraphs: [
            "Veterinary practice profitability conversations stall when owners only see a year-end accountant PDF. Month-close discipline inside the clinic—aligned invoices, stock truth, labor visible—turns margin from mystery into something managers can steer before Q4 panic.",
            "This article covers revenue structure, COGS from inventory, operating expenses, margin definitions, billing workflows, financial KPIs, and reporting rhythms. Pair with /monde-veto/veterinary-practice-kpis for dashboard definitions and /monde-veto/veterinary-inventory-management-guide for COGS numerators. Efficiency levers live in /monde-veto/veterinary-clinic-efficiency-strategies.",
            "VetoCrm accounting and inventory depth depend on the selected plan—we never claim full export suites or integrations exist on the free starter tier. Confirmed platform: clients, patients, appointments with reminders, consults, vaccines, antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, storage add-ons, read-only demo, cloud FR/EN/ES. No invented customer profit benchmarks.",
            "Illustrative numbers below are labeled hypothetical teaching math, not VetoCrm client results.",
          ],
        },
        {
          heading: "Revenue you can defend",
          paragraphs: [
            "Revenue quality beats revenue vanity. Split mentally (or in exports) between clinical fees, goods dispensed, lab or referral pass-through if you mark them separately, and farm visit bundles in mixed practices.",
            "Hypothetical month: €285,000 gross with 72% from consults and procedures, 24% from dispensed goods, 4% farm field fees—each line should map to consult or invoice rows in the PIMS, not a shadow spreadsheet.",
            "Leakage sources: items dispensed but not invoiced, discounts without reason code, estimates never converted, credit notes without inventory return. Weekly spot audit of ten random invoices catches casual leakage faster than annual tax prep.",
            "Deposit and prepayment policy stabilizes cash; it is not profitability by itself, but DSO improvements fund stock purchases without overdraft.",
            "Quotes and treatment plans should expire with version notes. When owners accept days later, clinicians re-open inventory assumptions—silent acceptance without revalidation causes COGS shocks on specialty diets and long courses.",
            "Third-party payers or insurers, where relevant, need their own reconciliation lane so clinical revenue is not double-counted when remittance lag crosses month-end.",
          ],
        },
        {
          heading: "COGS and inventory truth",
          paragraphs: [
            "Gross margin dies when COGS is fiction. COGS should follow consumption at cost from inventory movements tied to consult checkout—not retail list guesses.",
            "Illustration: revenue €285,000; COGS €68,400 → gross margin 76.0%. A 1.5 point COGS error on that revenue moves €4,275—enough to fund a part-time nurse hour block misallocated all year.",
            "Waste, expiry, and shrinkage belong in COGS narrative with reason codes. Denying them flatters margin until a physical count embarrasses partners.",
            "Farm trucks and companion shelves sharing one ledger need consumption discipline the same day—mixed practices bleed margin when field kits stay off books until month-end.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption:
            "Accounting view — revenue, expenses, and stock-linked margin in the PIMS.",
        },
        {
          heading: "Operating expenses and labor",
          paragraphs: [
            "Operating expenses include payroll and employer costs, rent, utilities, insurance, marketing you actually measure, continuing education, equipment leases, and software subscriptions. Illustration operating expenses €198,000 on the same hypothetical month yields operating margin ~6.5% after COGS.",
            "Labor is the dominant lever: track clinical versus admin hours honestly. Part-time reception labeled volunteer distorts profitability and burnout alike.",
            "Benchmark against your own trailing averages, not forum bravado. A city clinic with MRI carries different expense skeleton than a suburban wellness practice.",
            "Multi-organization groups allocate shared costs explicitly—otherwise one entity looks star while another subsidizes silently.",
          ],
        },
        {
          heading: "Margin definitions partners should align on",
          paragraphs: [
            "Define terms once in a partner memo to end arguments.",
          ],
          bullets: [
            "Gross margin % = (Revenue − COGS) ÷ Revenue.",
            "Contribution margin per service line = revenue line − variable COGS and direct labor if measured.",
            "Operating margin % = (Revenue − COGS − operating expenses) ÷ Revenue before owner discretionary draws.",
            "EBITDA is optional for small clinics; do not adopt jargon without accountant alignment.",
            "Cash flow ≠ accrual profit—track both monthly if you carry client credit.",
          ],
        },
        {
          heading: "Billing hygiene that protects margin",
          paragraphs: [
            "Close consult before checkout; dispensed lines match invoice; overrides need manager code and short note. Estimate templates should carry likely product bundles to reduce surprise write-offs.",
            "Train reception to collect deposits on surgery blocks—reduces no-show economic damage paired with /monde-veto/veterinary-practice-kpis KPI 6.",
            "Review discount reason codes monthly; compassion discounts deserve policy, not ad hoc guilt.",
            "Credit invoices must trigger stock return or waste documentation—otherwise COGS and margin lie in opposite directions.",
          ],
        },
        {
          heading: "Financial KPIs for monthly review",
          paragraphs: [
            "Pull these from /monde-veto/veterinary-practice-kpis definitions; focus financial subset here.",
          ],
          bullets: [
            "Gross margin % and trend (3-month).",
            "Operating margin % and variance vs budget.",
            "Revenue per vet FTE and per nurse FTE if payroll granular enough.",
            "ATV with service mix notes—not alone.",
            "DSO or quote-to-paid days.",
            "Inventory shrinkage on critical SKUs feeding COGS.",
            "Payroll % of revenue—watch overtime spikes.",
            "Preventive revenue % of total—indicator of recall health, not moral score.",
          ],
        },
        {
          heading: "Reporting rhythm: weekly, monthly, quarterly",
          paragraphs: [
            "Weekly (15 minutes): AR outliers, discount flags, open consults not invoiced, low-stock emergencies affecting revenue capture.",
            "Monthly: P&L summary, gross margin, payroll %, KPI dashboard one-pager, narrative paragraph for staff.",
            "Quarterly: service line contribution discussion, price list review informed by COGS, capex plan, supplier contract renewals with inventory lead present.",
            "Annual: tax alignment, not the only moment partners see margin—if annual is the first review, profitability is already lottery.",
            "Send your accountant consistent PIMS exports plus a short variance note—not a shoebox of PDFs assembled in panic. Veterinary practice profitability improves when external advisors trust internal numbers.",
          ],
        },
        {
          heading: "Break-even thinking without drama",
          paragraphs: [
            "Break-even is not magic; it is fixed costs divided by contribution per consult once you know variable COGS per average case. Illustration only: if monthly fixed costs are €120,000 and average contribution per consult after variable COGS is €95, you need roughly 1,263 consult-equivalents before marketing yourself as 'on target'—adjust for your real service mix.",
            "Use break-even as a planning lens, not a morale weapon. Seasonal clinics expect months below break-even if summer reserves were budgeted honestly.",
            "When break-even drifts upward, scan payroll %, rent renegotiation, and supplier terms before blaming veterinarians for 'low revenue per hour' without case mix context.",
          ],
        },
        {
          heading: "Pricing and profitability—without upsell ethics traps",
          paragraphs: [
            "Raise prices when data supports it: COGS creep on chronic meds, labor minutes underestimated in surgery packs, farm visit travel undercharged.",
            "Model a 3% fee adjustment on top quartile SKUs and measure conversion for 60 days—illustration only, not prescriptive.",
            "Transparency with owners beats hidden margin in line items they cannot understand.",
            "Profitability enables care: reinvest in nurse training, imaging, welfare facilities—not only partner draws.",
          ],
        },
        {
          heading: "Cash versus accrual: what owners actually feel",
          paragraphs: [
            "Accrual profit can look healthy while the bank account squeaks—especially with client credit and supplier terms mismatched. Track cash collections weekly even if your official KPI board is accrual-based.",
            "Illustration: €24,200 receivables on €31,000 credit revenue in a month means some of last month’s heroic surgery revenue has not landed in cash yet. Pair DSO with supplier payment discipline so you do not fund clients with goodwill.",
            "Farm accounts often run quarterly settlement; companion same-day card. Blended dashboards without segmentation hide pleasant fiction.",
          ],
        },
        {
          heading: "Common P&L mistakes in veterinary practices",
          paragraphs: [
            "Mistake 1 — treating distributor retail list as COGS instead of weighted average cost. Mistake 2 — capital purchases expensed emotionally in one month without depreciation talk with accountant. Mistake 3 — partner draws labeled vaguely so operating margin looks worse than lifestyle reality.",
            "Mistake 4 — ignoring locum and overtime spikes in payroll %. Mistake 5 — marketing spend untagged so partners cannot see ROI on community events versus Google ads.",
            "Mistake 6 — separate inventory spreadsheet that never reconciles to the PIMS—this one kills trust between clinicians and finance fastest.",
            "Monthly honesty beats annual surprise. If the PIMS export disagrees with the spreadsheet, the spreadsheet dies—not the clinical record.",
          ],
        },
        {
          heading: "Mixed practice and multi-organization reporting",
          paragraphs: [
            "Companion wellness margin and farm visit economics should not share one undifferentiated operating margin target. Field mileage, herd product volumes, and weekend emergency blocks pull cost structures apart.",
            "Use entity isolation where legal structures require it; allocate shared rent and software explicitly each quarter rather than vaguely splitting by gut feel.",
            "VetoCrm multi-organization roles help data separation—validate consult and invoice routing in demo with two test entities before go-live.",
          ],
        },
        {
          heading: "From financial KPIs to staff conversations",
          paragraphs: [
            "Staff do not need partner draws on the wall—but they do need to know that dispense discipline and closed consults protect jobs. Translate /monde-veto/veterinary-practice-kpis into one visible throughput metric and one preventive metric for the team each month.",
            "Celebrate shrinkage wins and no-show reductions, not only gross revenue highs after price hikes. Morale sustains profitability when busy seasons tempt corner-cutting on records.",
            "After profitability stabilizes, revisit inventory thresholds and automation tasks so margin gains do not erode in the next parasite season.",
          ],
        },
        {
          heading: "Where VetoCrm fits",
          paragraphs: [
            "VetoCrm integrates plan-based accounting and inventory with clinical workflows—clients, patients, consults, preventives, appointments, optional farm modules, multi-organization roles. It suits clinics wanting revenue and stock near the same events clinicians record.",
            "Validate which P&L exports, tax categories, and consult-invoice links your tier includes on /pricing and in demo before migrating live books. Use free starter on /register to rehearse month-close with fictitious clients; upgrade when exports replace manual glue.",
            "Storage add-ons matter when profitability analysis includes attachment-heavy supplier invoices—budget before scan-heavy stock migrations.",
            "Read-only demo helps finance and clinical leads agree on margin definitions before touching live data.",
            "When upgrading plans for accounting depth, replay one closed month in sandbox before trusting automated margin tiles on the live dashboard.",
          ],
        },
      ],
      faq: [
        {
          q: "Does VetoCrm replace my accountant?",
          a: "No—it operationalizes clinic billing and plan-based accounting exports; fiscal filing stays with your professional advisor.",
        },
        {
          q: "Is accounting on the free starter plan?",
          a: "Depth varies by tier—confirm modules on /pricing and demo.",
        },
        {
          q: "What is the fastest profitability fix?",
          a: "Usually dispense-to-invoice linkage and COGS truth—see inventory guide.",
        },
        {
          q: "How does this relate to the KPI article?",
          a: "/monde-veto/veterinary-practice-kpis defines twelve metrics; this page explains margin and month-close context.",
        },
        {
          q: "Are illustration numbers customer benchmarks?",
          a: "No—hypothetical teaching math only.",
        },
        {
          q: "Farm and companion profitability together?",
          a: "Use multi-organization reporting where entities differ; validate allocations in demo.",
        },
      ],
      ctaTitle: "Improve margins with VetoCrm",
      ctaBody:
        "Compare accounting tiers on /pricing, explore the demo, and test month-close on /register.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Gestion financière de la clinique vétérinaire : améliorer la rentabilité",
      excerpt:
        "Recettes, COGS, charges, marges, facturation et KPI financiers — reporting mensuel et compta VetoCrm selon formule.",
      metaDescription:
        "Rentabilité clinique vétérinaire : CA, dépenses, marges, facturation, KPI. Compta VetoCrm par formule. Liens KPI et stocks.",
      category: "Finance",
      sections: [
        {
          heading: "La rentabilité est une habitude",
          paragraphs: [
            "Clôture mensuelle, factures alignées, stock sincère. Voir /monde-veto/veterinary-practice-kpis et /monde-veto/veterinary-inventory-management-guide. VetoCrm : compta/stock selon formule — pas d'exemples clients inventés.",
          ],
        },
        {
          heading: "Chiffre d'affaires défendable",
          paragraphs: [
            "Honoraires, dispensation, actes ferme. Illustration €285 000 fictive. Fuites : dispense non facturée, remises sans code.",
          ],
        },
        {
          heading: "COGS et stock",
          paragraphs: [
            "Marge brute 76 % illustrative si COGS €68 400. Perte 1,5 point COGS = milliers d'euros. Codes gaspillage et shrinkage.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Compta et marge liée au stock.",
        },
        {
          heading: "Charges et masse salariale",
          paragraphs: [
            "Charges opérationnelles €198 000 fictives → marge opérationnelle ~6,5 %. Heures clinique vs admin honnêtes.",
          ],
        },
        {
          heading: "Définitions de marges",
          paragraphs: ["Alignement associés."],
          bullets: [
            "Marge brute %.",
            "Marge opérationnelle %.",
            "Marge contribution par ligne d'actes si mesurée.",
            "Trésorerie ≠ résultat.",
          ],
        },
        {
          heading: "Hygiène de facturation",
          paragraphs: [
            "Consult clôturée avant caisse ; overrides tracés ; acomptes chirurgie ; avoirs = retour stock.",
          ],
        },
        {
          heading: "KPI financiers mensuels",
          paragraphs: ["Sous-ensemble du guide KPI."],
          bullets: [
            "Marge brute et tendance.",
            "Marge opérationnelle.",
            "CA par vet ETP.",
            "DSO.",
            "Shrinkage.",
            "Masse salariale % CA.",
          ],
        },
        {
          heading: "Rythme de reporting",
          paragraphs: [
            "Hebdo : impayés, consults ouvertes. Mensuel : P&L et dashboard. Trimestriel : tarifs et fournisseurs.",
            "Exports PIMS cohérents pour l'expert-comptable avec note d'écart.",
          ],
        },
        {
          heading: "Seuil de rentabilité",
          paragraphs: [
            "Coûts fixes ÷ contribution moyenne par acte — illustration pédagogique, pas objectif punitif.",
          ],
        },
        {
          heading: "Tarifs et éthique",
          paragraphs: [
            "Revoir prix quand COGS grimpe ; transparence client ; réinvestir dans les soins.",
          ],
        },
        {
          heading: "Trésorerie vs comptabilité",
          paragraphs: [
            "Encaissements hebdo même si P&L en engagement ; DSO et délais fournisseurs.",
          ],
        },
        {
          heading: "Erreurs de P&L fréquentes",
          paragraphs: [
            "COGS fantaisiste, Excel stock parallèle, heures sup non suivies.",
          ],
        },
        {
          heading: "Mixte et multi-entités",
          paragraphs: [
            "Marges séparées compagnon/ferme ; allocations explicites.",
          ],
        },
        {
          heading: "Dialogue avec l'équipe",
          paragraphs: [
            "Un KPI débit et un KPI préventif visibles par mois pour l'effectif.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "Compta intégrée par formule ; valider exports sur /pricing ; /register pour fictif ; stockage si factures scannées.",
          ],
        },
      ],
      faq: [
        {
          q: "VetoCrm remplace l'expert-comptable ?",
          a: "Non — outil clinique ; fiscalité chez le professionnel.",
        },
        {
          q: "Compta sur formule gratuite ?",
          a: "Variable — /pricing et démo.",
        },
        {
          q: "Correctif le plus rapide ?",
          a: "Lien dispense-facture et COGS.",
        },
        {
          q: "Lien article KPI ?",
          a: "KPI = métriques ; ici contexte marge et clôture.",
        },
        {
          q: "Exemples chiffrés clients ?",
          a: "Non — illustrations fictives.",
        },
        {
          q: "Fermes et compagnons ?",
          a: "Multi-organisation et allocations en démo.",
        },
      ],
      ctaTitle: "Améliorez la marge avec VetoCrm",
      ctaBody: "/pricing, démo, /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Gestión financiera de la clínica veterinaria: mejorar la rentabilidad",
      excerpt:
        "Ingresos, COGS, gastos, márgenes, facturación y KPI financieros — informes mensuales y contabilidad VetoCrm por plan.",
      metaDescription:
        "Rentabilidad clínica veterinaria: ingresos, gastos, márgenes, facturación, KPI. Contabilidad VetoCrm por plan. Enlaces KPI e inventario.",
      category: "Finanzas",
      sections: [
        {
          heading: "La rentabilidad es hábito",
          paragraphs: [
            "Cierre mensual, facturas alineadas, stock veraz. Ver /monde-veto/veterinary-practice-kpis y guía de inventario. VetoCrm contabilidad por plan — sin benchmarks de clientes inventados.",
          ],
        },
        {
          heading: "Ingresos defendibles",
          paragraphs: [
            "Honorarios, dispensación, granjas. Ilustración €285.000 ficticia. Fugas: dispensar sin facturar.",
          ],
        },
        {
          heading: "COGS e inventario",
          paragraphs: [
            "Margen bruto 76 % ilustrativo. Error COGS mueve miles. Códigos de merma.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Contabilidad y margen ligado a stock.",
        },
        {
          heading: "Gastos operativos y personal",
          paragraphs: [
            "Gastos €198.000 ficticios → margen operativo ~6,5 %.",
          ],
        },
        {
          heading: "Definiciones de margen",
          paragraphs: ["Acuerdo entre socios."],
          bullets: [
            "Margen bruto %.",
            "Margen operativo %.",
            "Caja ≠ resultado.",
          ],
        },
        {
          heading: "Higiene de facturación",
          paragraphs: [
            "Cerrar consulta antes de caja ; depósitos ; notas de crédito con devolución de stock.",
          ],
        },
        {
          heading: "KPI financieros",
          paragraphs: ["Subconjunto del artículo KPI."],
          bullets: [
            "Margen bruto.",
            "Margen operativo.",
            "Ingresos por veterinario.",
            "DSO.",
            "Merma.",
            "Nómina % ingresos.",
          ],
        },
        {
          heading: "Ritmo de informes",
          paragraphs: [
            "Semanal: deudas y consultas abiertas. Mensual: P&L. Trimestral: precios.",
            "Exportaciones PIMS fiables para el asesor fiscal.",
          ],
        },
        {
          heading: "Punto de equilibrio",
          paragraphs: [
            "Costes fijos ÷ contribución media por consulta — enfoque de planificación.",
          ],
        },
        {
          heading: "Precios y ética",
          paragraphs: [
            "Subir cuando COGS sube ; transparencia ; reinvertir en cuidado.",
          ],
        },
        {
          heading: "Caja vs devengo",
          paragraphs: [
            "Cobros semanales aunque el P&L sea devengado ; DSO y proveedores.",
          ],
        },
        {
          heading: "Errores habituales en P&L",
          paragraphs: [
            "COGS irreales, Excel paralelo de stock, horas extra ocultas.",
          ],
        },
        {
          heading: "Mixto y multiorganización",
          paragraphs: [
            "Márgenes separados compañía/granja ; asignaciones claras.",
          ],
        },
        {
          heading: "Conversación con el equipo",
          paragraphs: [
            "Un KPI de flujo y uno preventivo visibles al personal cada mes.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "Contabilidad integrada por plan ; validar en /pricing ; /register prueba.",
          ],
        },
      ],
      faq: [
        {
          q: "¿VetoCrm sustituye al contable?",
          a: "No — operación clínica ; fiscalidad con asesor.",
        },
        {
          q: "¿Contabilidad en plan gratis?",
          a: "Varía — /pricing y demo.",
        },
        {
          q: "¿Arreglo más rápido?",
          a: "Dispensación-factura y COGS.",
        },
        {
          q: "¿Relación con KPI?",
          a: "KPI define métricas ; aquí margen y cierre.",
        },
        {
          q: "¿Números de clientes?",
          a: "No — ilustraciones ficticias.",
        },
        {
          q: "¿Granjas y compañía?",
          a: "Multiorganización en demo.",
        },
      ],
      ctaTitle: "Mejore márgenes con VetoCrm",
      ctaBody: "/pricing, demo, /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};