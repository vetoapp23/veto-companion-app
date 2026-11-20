import type { BlogArticle } from "./types";

export const ARTICLE_09: BlogArticle = {
  slug: "veterinary-inventory-management-guide",
  cover: "/monde-veto/screen-dashboard.png",
  coverAlt: {
    fr: "Tableau de bord VetoCrm — gestion des stocks vétérinaires",
    en: "VetoCrm dashboard — veterinary inventory management",
    es: "Panel VetoCrm — gestión de inventario veterinario",
  },
  publishedAt: "2027-03-12",
  readingMinutes: 12,
  locales: {
    en: {
      title:
        "Veterinary Inventory Management: A Complete Guide for Clinics",
      excerpt:
        "Stock discipline for veterinary clinics: receiving, expiry, thresholds, consult tie-in, counts, and a printable checklist—aligned with plan-based inventory in VetoCrm and links to profitability and pricing.",
      metaDescription:
        "Veterinary inventory management guide: stock, expiry, reorder thresholds, PIMS workflows, checklist. VetoCrm inventory by plan; links to profitability and pricing.",
      category: "Inventory",
      sections: [
        {
          heading: "Inventory is margin protection—not a back-room chore",
          paragraphs: [
            "Veterinary inventory management sits at the intersection of patient safety, regulatory care, and clinic margin. When stock records drift from reality, clinicians improvise from emergency cupboards, accountants discover shrinkage months late, and owners receive estimates that do not match what was actually dispensed.",
            "Owners rarely see your stockroom—but they feel inventory failure in delayed care, surprise substitutions, and invoices that do not match what went home.",
            "This guide walks receiving to reorder with PIMS-centric habits—not a generic retail tutorial. For how dispense automation fits broader efficiency, see /monde-veto/veterinary-clinic-efficiency-strategies and /monde-veto/veterinary-practice-automation-tasks. For profitability depth, see /monde-veto/veterinary-practice-profitability in this blog series; compare module access on /pricing and rehearse counts on /register.",
            "VetoCrm inventory and accounting capabilities depend on the selected plan—we do not claim every alert, export, or accounting integration exists on the free starter tier. Confirmed platform context: clients, patients, appointments, consults, vaccines, antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, storage add-ons, read-only demo, cloud FR/EN/ES. No invented lab connectors or SMS.",
            "Good inventory management feels boring: same receiving desk, same count window, same variance meeting. That boredom is what keeps clinicians from improvising when a shelf is empty.",
          ],
        },
        {
          heading: "Foundation — one item master, one unit of measure",
          paragraphs: [
            "Duplicate SKUs with slightly different names destroy reporting. Before tuning thresholds, normalize product names, units (tablet versus strip), and tax categories with your accountant.",
            "Assign an inventory owner—often lead nurse plus practice manager—who approves new products and retires obsolete lines. Clinicians request additions; they do not freestyle barcodes at reception.",
            "Farm and companion stock lines may share a warehouse but need clear labels in mixed practices so field kits do not drain companion shelves unnoticed.",
            "Align naming with how clinicians speak at the table—“Rimadyl 100 mg chew” versus invoice shorthand—so dispense screens match what nurses actually pick.",
          ],
        },
        {
          heading: "Receiving and put-away",
          paragraphs: [
            "Manual failure mode: boxes signed on the dock but never entered until a stockout. SOP: match delivery note to purchase order, enter batch and expiry, shelve with FIFO discipline, flag discrepancies same day.",
            "Photo or note damaged goods before accepting partial deliveries—dispute windows close fast with wholesalers.",
            "Progressive automation: barcode scanning where hardware exists; otherwise disciplined keyboard entry tied to purchase orders inside the PIMS.",
            "Split responsibilities: dock receives boxes; nurse verifies clinical relevance (expiry, temperature-sensitive lines); manager reconciles invoice to purchase order. Blurring roles invites “someone else entered it” excuses.",
          ],
        },
        {
          heading: "Expiry and FEFO discipline",
          paragraphs: [
            "Veterinary inventory management must foreground expiry—especially vaccines, biologics, and regulated antiparasitics. FEFO (first-expiry-first-out) is not optional when cold-chain items approach end of life.",
            "Weekly expiry report: items inside thirty and ninety days; nurse pulls forward on shelves; manager decides return, transfer, or promo use only when clinically appropriate—never push near-expiry preventives on the wrong patient cohort.",
            "Document wasted units with reason codes (breakage, expired, recall) so profitability analysis later is honest.",
            "Cold-chain vaccines deserve a visible calendar reminder independent of software—automation should echo physical fridge checks, not replace them.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption:
            "Accounting and stock — expiry discipline shows up in margin, not just on shelves.",
        },
        {
          heading: "Consult-to-invoice stock truth",
          paragraphs: [
            "The highest-leverage workflow ties dispense to consult completion and invoice generation. Silent dispense—treating outside the PIMS on busy afternoons—is how shrinkage hides.",
            "Train: no checkout until dispensed lines match what left the building; overrides require manager code and note. Surgery packs should map to bill-of-materials templates where your formulary allows bundling.",
            "VetoCrm: validate consult, inventory, and accounting linkage on your plan during demo—features vary by tier.",
            "Run a monthly “dispense without invoice” report even if manual at first—those rows are where margin leaks before anyone notices on the P&L.",
          ],
        },
        {
          heading: "Reorder thresholds without panic buying",
          paragraphs: [
            "Thresholds should reflect lead time and seasonal demand—not fear after one stockout. Start with critical twenty SKUs: core vaccines, commonly dispensed analgesics, emergency fluids, and top revenue preventives.",
            "Formula sketch: threshold equals average weekly usage multiplied by supplier lead time weeks plus safety buffer; review quarterly after winter wellness or parasite season spikes.",
            "Low-stock alerts in software assist managers; they do not replace relationship with distributors when global shortages hit.",
            "Document substitute products clinician-approved for shortages—otherwise reception improvises sales that do not match medical intent.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption:
            "Dashboard — use summaries to spot variance before month-end panic counts.",
        },
        {
          heading: "Physical counts and variance hygiene",
          paragraphs: [
            "Full wall-to-wall counts quarterly; cycle counts monthly on high-value or high-shrink lines. Freeze receiving during count windows or reconcile deltas explicitly.",
            "Variances above agreed tolerance trigger consult audit—are clinicians dispensing off-record? Are reception duplicate-scanning invoices?",
            "Multi-organization groups isolate stock per entity when farm and companion businesses share software but not balance sheets—test in VetoCrm demo when relevant.",
            "Celebrate small variance wins publicly—teams that only hear about inventory when something is wrong hide problems until audit week.",
          ],
        },
        {
          heading: "Controlled and high-risk products",
          paragraphs: [
            "Even without publishing jurisdiction-specific legal advice, clinics should maintain access logs for products their regulators treat as controlled or high-risk. Pair PIMS movement with physical lock-and-key reality.",
            "Two-person verify on waste destruction where policy requires; note in inventory with witness initials equivalent in electronic audit trail.",
            "Map controlled workflows to who can adjust stock after the fact—retroactive edits without notes destroy trust in every other automated report.",
          ],
        },
        {
          heading: "Reporting tied to profitability (not vanity SKUs)",
          paragraphs: [
            "Useful reports: cost of goods sold trend, shrinkage percent, days of stock on hand for critical lines, expired waste value, and dispense-without-invoice exceptions.",
            "Article /monde-veto/veterinary-practice-profitability connects these metrics to pricing and staffing—this inventory guide feeds numerators, not the full P&L story.",
            "Avoid thousand-row SKU dumps in monthly meetings; five variances discussed beat fifty ignored.",
            "Involve lead clinicians in interpreting shrinkage—if surgery packs consistently over-allocate suture material, fix the template instead of blaming the nurse counting pills.",
          ],
        },
        {
          heading: "Common inventory failure modes",
          paragraphs: [
            "Failure mode one — optimistic stock after partial dispense during emergencies. Failure mode two — duplicate SKUs after a rebrand. Failure mode three — farm kits replenished from companion wholesale accounts without transfer notes. Failure mode four — ignoring expired preventives because writing off feels painful.",
            "Each mode has a PIMS habit fix before a capital spend fix. Run a yearly tabletop: which failure would embarrass you on inspection Monday?",
            "Mixed practices should rehearse farm field-kit returns the same day—companion stock counts lie when truck inventory lives in a clipboard until Friday.",
          ],
        },
        {
          heading: "Purchasing and vendor discipline",
          paragraphs: [
            "Centralize who may create purchase orders. Ad-hoc weekend orders bypass thresholds and hide true consumption. Match invoice price to contracted catalog quarterly—silent creep shows up first in inventory value, not on the supplier PDF headline.",
            "Negotiate delivery windows with two wholesalers only when your receiving SOP can handle split deliveries; otherwise dual vendors increase receiving errors without reducing stockouts.",
            "Tie purchasing meetings to dashboard variance: if a SKU triggers low-stock weekly, discuss consumption trends before increasing the threshold—sometimes the fix is clinical protocol, not bigger orders.",
          ],
        },
        {
          heading: "Farm and mobile inventory notes",
          paragraphs: [
            "Field kits should list maximum quantities per SKU; replenishment from the central store happens on return, not from memory. Confirmed farm modules in VetoCrm help when visit consumption is logged at the herd level—companion stock still needs separate kit rules.",
            "Mobile vets should carry a paper fallback list for controlled lines when cloud access drops; sync stock movements the same day connectivity returns so retention and accounting narratives stay aligned.",
          ],
        },
        {
          heading: "Clinic inventory checklist",
          paragraphs: [
            "Use this checklist quarterly; mark owners and dates in your quality folder.",
            "Score each line red, amber, or green; publish the summary in the staff room so inventory is visible operational work, not a hidden manager obsession.",
            "Archive completed checklists with date and signature—even a PDF export beats trusting memory when a partner asks how stock was governed last quarter.",
          ],
          bullets: [
            "Item master reviewed; duplicates merged.",
            "Receiving SOP posted; dock-to-shelf under 24 hours.",
            "Expiry report run weekly; FEFO on shelves verified.",
            "Consult dispense tied to invoice on pilot products—then full formulary.",
            "Thresholds set for critical 20 SKUs; lead times updated with suppliers.",
            "Cycle count schedule published; variances investigated.",
            "Controlled product log reconciled with physical stock.",
            "Manager reviews shrinkage and waste reasons monthly.",
            "Plan-tier inventory features validated on /pricing before upgrades.",
            "Staff trained on overrides and note requirements.",
            "Annual supplier contract review with inventory lead present.",
          ],
        },
        {
          heading: "Where VetoCrm fits",
          paragraphs: [
            "VetoCrm offers inventory and accounting modules scoped by plan, within an integrated cloud app for clients, patients, scheduling, consults, preventives, and optional farm workflows. It suits teams that want stock movement visible near clinical and billing events—not a standalone spreadsheet beside a legacy desktop PIMS.",
            "Start on read-only demo; map your critical SKU list; trial free starter on /register with fictitious products before migrating live wholesale files. Pair operational fixes from /monde-veto/veterinary-practice-automation-tasks Task 4 and Task 8 when rolling out.",
            "Storage add-ons on VetoCrm matter when attachment-heavy suppliers flood invoices—know your tier before stock migrations include PDF archives.",
            "Inventory excellence makes pricing conversations honest: in /monde-veto/veterinary-practice-profitability, your COGS numerators should already be trustworthy.",
          ],
        },
      ],
      faq: [
        {
          q: "Does VetoCrm include inventory on every plan?",
          a: "Inventory and accounting depth varies by plan tier—confirm alerts, exports, and consult linkage in demo and on /pricing.",
        },
        {
          q: "What is the first inventory fix most clinics need?",
          a: "Tie dispense to invoice for top dispensed products; silent off-PIMS dispensing is the usual shrinkage source.",
        },
        {
          q: "How often should we count stock?",
          a: "Cycle high-value lines monthly; full counts quarterly or when variance spikes.",
        },
        {
          q: "How does inventory connect to profitability?",
          a: "Honest COGS and waste numbers feed margin analysis—see /monde-veto/veterinary-practice-profitability.",
        },
        {
          q: "Farm and companion stock together?",
          a: "Mixed practices can share software with multi-organization isolation; validate farm consumption workflows in demo.",
        },
        {
          q: "Do we need barcode scanners?",
          a: "Helpful at scale but not mandatory; disciplined keyboard entry beats scanners with sloppy receiving.",
        },
      ],
      ctaTitle: "Manage stock inside VetoCrm",
      ctaBody:
        "Validate inventory modules on /pricing, explore the demo, and test workflows on /register.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Gestion des stocks vétérinaires : guide complet pour la clinique",
      excerpt:
        "Réception, péremption, seuils, lien consult-facture, inventaires — checklist. Stock VetoCrm selon formule ; lien rentabilité (à venir) et tarifs.",
      metaDescription:
        "Gestion stock vétérinaire : péremption, seuils, workflows PIMS, checklist. Inventaire VetoCrm par formule ; /pricing et guide rentabilité.",
      category: "Stock",
      sections: [
        {
          heading: "Le stock protège la marge et la sécurité",
          paragraphs: [
            "Voir /monde-veto/veterinary-clinic-efficiency-strategies et /monde-veto/veterinary-practice-automation-tasks. Rentabilité : /monde-veto/veterinary-practice-profitability. /pricing, /register.",
            "Stock et compta VetoCrm selon formule — pas de fonctions inventées.",
          ],
        },
        {
          heading: "Base — nomenclature unique",
          paragraphs: [
            "Responsable stock ; unités cohérentes ; lignes ferme/compagnon étiquetées.",
          ],
        },
        {
          heading: "Réception",
          paragraphs: [
            "Bon de livraison, lot, péremption, FIFO, écarts le jour même.",
          ],
        },
        {
          heading: "Péremption FEFO",
          paragraphs: [
            "Rapport hebdo 30/90 j ; gaspillage codé.",
          ],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Stock et compta.",
        },
        {
          heading: "Consult → facture",
          paragraphs: [
            "Dispensation liée ; pas de sortie hors PIMS.",
          ],
        },
        {
          heading: "Seuils de réappro",
          paragraphs: [
            "20 SKU critiques ; formule consommation × délai fournisseur.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Pilotage dashboard.",
        },
        {
          heading: "Inventaires et écarts",
          paragraphs: [
            "Comptage tournant mensuel ; inventaire complet trimestriel.",
          ],
        },
        {
          heading: "Produits sensibles",
          paragraphs: [
            "Journal d’accès ; destruction à deux si requis.",
          ],
        },
        {
          heading: "Reporting rentabilité",
          paragraphs: [
            "COGS, shrinkage, jours de stock — lien article rentabilité.",
          ],
        },
        {
          heading: "Checklist",
          paragraphs: ["Revue trimestrielle."],
          bullets: [
            "Nomenclature sans doublons.",
            "Réception < 24 h.",
            "Péremption hebdo.",
            "Dispense = facture.",
            "Seuils 20 SKU.",
            "Comptages planifiés.",
            "Produits contrôlés.",
            "Revue shrinkage mensuelle.",
            "Formule validée sur /pricing.",
            "Formation overrides.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: [
            "Stock intégré au PIMS cloud ; valider en démo selon formule.",
          ],
        },
      ],
      faq: [
        {
          q: "Stock sur toutes les formules ?",
          a: "Profondeur variable — vérifier /pricing et démo.",
        },
        {
          q: "Premier correctif ?",
          a: "Lier dispense et facture sur produits les plus sortis.",
        },
        {
          q: "Fréquence inventaire ?",
          a: "Tournant mensuel lignes à risque ; complet trimestriel.",
        },
        {
          q: "Lien rentabilité ?",
          a: "Voir /monde-veto/veterinary-practice-profitability.",
        },
        {
          q: "Fermes ?",
          a: "Multi-organisation en démo si besoin.",
        },
        {
          q: "Codes-barres ?",
          a: "Utiles mais pas obligatoires si SOP réception est solide.",
        },
      ],
      ctaTitle: "Gérez le stock dans VetoCrm",
      ctaBody: "Démo, /pricing, /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Gestión de inventario veterinario: guía completa para clínicas",
      excerpt:
        "Recepción, caducidad, umbrales, consulta-factura, conteos — checklist. Inventario VetoCrm por plan; rentabilidad (próxima) y precios.",
      metaDescription:
        "Inventario veterinario: caducidad, umbrales, flujos PIMS, checklist. VetoCrm por plan; /pricing y guía rentabilidad.",
      category: "Inventario",
      sections: [
        {
          heading: "El inventario protege margen y seguridad",
          paragraphs: [
            "Ver eficiencia y automatización en el blog. Rentabilidad: /monde-veto/veterinary-practice-profitability. /pricing, /register.",
          ],
        },
        {
          heading: "Base — catálogo único",
          paragraphs: ["Responsable; unidades coherentes."],
        },
        {
          heading: "Recepción",
          paragraphs: ["Lote, caducidad, FIFO."],
        },
        {
          heading: "Caducidad FEFO",
          paragraphs: ["Informe semanal."],
          image: "/monde-veto/screen-accounting.png",
          imageCaption: "Stock y contabilidad.",
        },
        {
          heading: "Consulta → factura",
          paragraphs: ["Dispensación vinculada."],
        },
        {
          heading: "Umbrales de pedido",
          paragraphs: ["20 SKU críticos."],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Panel.",
        },
        {
          heading: "Conteos",
          paragraphs: ["Cíclico mensual; completo trimestral."],
        },
        {
          heading: "Productos sensibles",
          paragraphs: ["Registro de acceso."],
        },
        {
          heading: "Informes",
          paragraphs: ["COGS, mermas — guía rentabilidad."],
        },
        {
          heading: "Checklist",
          paragraphs: ["Revisión trimestral."],
          bullets: [
            "Catálogo sin duplicados.",
            "Recepción < 24 h.",
            "Caducidad semanal.",
            "Dispensa = factura.",
            "Umbrales definidos.",
            "Conteos programados.",
            "Controlados reconciliados.",
            "Revisión mensual mermas.",
            "Plan en /pricing.",
            "Formación overrides.",
          ],
        },
        {
          heading: "VetoCrm",
          paragraphs: ["Inventario según plan en PIMS cloud."],
        },
      ],
      faq: [
        {
          q: "¿Inventario en todos los planes?",
          a: "Varía — confirmar en /pricing y demo.",
        },
        {
          q: "¿Primer arreglo?",
          a: "Vincular dispensación y factura.",
        },
        {
          q: "¿Frecuencia de conteo?",
          a: "Cíclico mensual; completo trimestral.",
        },
        {
          q: "¿Rentabilidad?",
          a: "Ver /monde-veto/veterinary-practice-profitability.",
        },
        {
          q: "¿Granjas?",
          a: "Probar multiorganización en demo.",
        },
        {
          q: "¿Escáneres?",
          a: "Opcionales con buena recepción manual.",
        },
      ],
      ctaTitle: "Gestione inventario en VetoCrm",
      ctaBody: "Demo, /pricing, /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};