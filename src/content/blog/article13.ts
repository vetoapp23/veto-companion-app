import type { BlogArticle } from "./types";

export const ARTICLE_13: BlogArticle = {
  slug: "from-excel-to-veterinary-management-software",
  cover: "/monde-veto/screen-dashboard.png",
  coverAlt: {
    fr: "Tableau de bord VetoCrm — passage d’Excel au logiciel de gestion",
    en: "VetoCrm dashboard — moving from Excel to practice software",
    es: "Panel VetoCrm — de Excel al software de gestión veterinaria",
  },
  publishedAt: "2027-04-09",
  readingMinutes: 11,
  locales: {
    en: {
      title:
        "From Excel to Veterinary Management Software: When Should Your Clinic Make the Switch?",
      excerpt:
        "Warning signs spreadsheets are failing, limits of Excel for clinical operations, a migration readiness checklist, and when veterinary management software beats DIY—without repeating a generic buyer brochure.",
      metaDescription:
        "From Excel to veterinary management software: warning signs, spreadsheet limits, migration checklist, timing. Links to how-to-choose, best 2027, Excel alternative. VetoCrm confirmed modules.",
      category: "Migration",
      sections: [
        {
          heading:
            "Veterinary management software decisions start with honest spreadsheet pain",
          paragraphs: [
            "Clinics rarely plan to run on Excel forever. A founding vet builds a client list, a nurse adds vaccine dates, reception copies an appointment tab from a colleague's template—and within eighteen months three files disagree on the same microchip number. The question is not whether veterinary management software exists; it is whether your clinic has crossed the threshold where spreadsheet gymnastics cost more than a disciplined migration.",
            "This article is a switch-timing guide: warning signs, structural limits of Excel for clinical work, a migration readiness checklist, and stakeholder conversations before you shortlist products. For a concise French-market narrative on quitting spreadsheets, see /monde-veto/alternative-excel-clinique-veterinaire—that page sells the why-quit story; this one helps owners and managers decide when and how without duplicating its four-step migration shorthand.",
            "When you evaluate vendors, pair this read with /monde-veto/how-to-choose-veterinary-practice-management-software and /monde-veto/best-veterinary-practice-management-software-2027. Throughout we reference only VetoCrm capabilities confirmed on vetocrm.com: clients and patients, appointments with reminders, consults and prescriptions, vaccines and antiparasitics, inventory and accounting by plan, farm modules, multi-organization roles, free starter tier, storage add-ons, read-only demo, and cloud UI in French, English, and Spanish. We do not claim bundled SMS, lab connectors, or customer migration statistics the product site does not substantiate.",
            "If you already know you will switch this quarter, skim to the checklist and budget section; if partners disagree, start with warning signs and the cost-of-delay worksheet.",
          ],
        },
        {
          heading: "Seven warning signs Excel is no longer your friend",
          paragraphs: [
            "Warning signs cluster around concurrency, traceability, and clinical risk—not aesthetics. The moment two roles need the same live data during peak hours, Excel becomes a bottleneck even if nobody admits it.",
            "Sign 1 — version roulette: filenames like clients_v3_FINAL_REALLY.xlsx circulate and staff distrust every export. Sign 2 — duplicate owners: the same person appears with variant spellings across tabs because there is no master client key. Sign 3 — vaccine recall drift: due dates live in a column someone forgot to sort, and rabies recalls rely on a reception hero's memory.",
            "Sign 4 — stock fiction: theoretical inventory on a sheet never matches shelves after weekend emergencies. Sign 5 — permission gaps: interns edit formulas they do not understand. Sign 6 — partner blind spots: one veterinarian maintains a private macro workbook the practice does not own. Sign 7 — recovery anxiety: backup means a USB in a drawer nobody has tested.",
            "Two or more signs persisting for ninety days usually justify a formal switch project—not another tab redesign.",
          ],
          bullets: [
            "Concurrent editors during morning rush.",
            "Preventive due dates not visible at checkout.",
            "Consult notes in Word while billing lives in Excel.",
            "Farm visit notes isolated from companion records.",
            "No audit trail when a cell changes.",
            "Month-end takes days reconciling sheets.",
            "New hires need oral lore instead of documented workflows.",
          ],
        },
        {
          heading: "Structural limits of spreadsheets for veterinary management",
          paragraphs: [
            "Excel is excellent for analysis after data is clean; it is a weak system of record for medico-legal clinical history, appointment concurrency, and inventory consumption tied to invoices. Veterinary management software exists because relational data—owner, patient, consult, dispensed line, next vaccine—needs stable links, not VLOOKUP bridges maintained by one power user.",
            "Spreadsheets lack role-based permissions suited to clinical governance: reception should not overwrite signed consult narratives; locums should not download the entire client base to a laptop. Cloud veterinary management software enforces least privilege if you configure it; Excel enforces hope.",
            "Appointments with reminders, consult checkout, and vaccine due dates are events, not cells. When those events live in separate tabs, retention loops break. Integrated platforms keep due dates on the patient record and surface them in queues—capabilities confirmed in VetoCrm's patient and appointment modules when you validate your plan tier.",
            "Mixed practices with farm modules amplify the problem: herd visit schedules and companion wellness lists diverge when each species has its own rogue workbook. Multi-organization roles in veterinary management software isolate legal entities; Excel isolates blame.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Client and patient links—what relational veterinary management software enforces natively.",
        },
        {
          heading:
            "When staying on Excel is still rational (short window only)",
          paragraphs: [
            "Honesty helps partner conversations. Temporary Excel can suffice when you are a single-vet mobile practice with under two hundred active patients, no employees editing concurrently, and a firm exit date for software selection. It is also rational during a ten-week overlap while legacy desktop software exports are cleaned—provided Excel is read-only archive, not live operations.",
            "Staying on Excel is not rational when you hire reception number two, add evening appointments, carry controlled inventory, or face insurer or farm-audit requests for coherent history. Those triggers overlap the warning signs above.",
            "Free veterinary management software tiers—such as VetoCrm's confirmed starter offering—lower the cash argument for postponement. The real cost becomes change management, not subscription: training, migration, and sixty days of parallel discipline.",
          ],
        },
        {
          heading: "Build the business case without fantasy ROI",
          paragraphs: [
            "CFO-friendly cases avoid magic percentages. Track four quantifiable wastes for thirty days: hours spent reconciling sheets, missed preventive bookings you can document, stock write-offs from untracked dispense, and billing leakage (items charged on paper but not invoiced). Even conservative hour logging often exceeds a modest subscription once staff costs are included.",
            "Qualitative risks belong in the same memo: wrong patient file opened during phone triage, GDPR-style access confusion when a former employee keeps a copy at home, inability to produce consult history during a complaint. Veterinary management software does not erase risk; it centralizes accountability.",
            "Compare subscription and storage add-ons on /pricing against logged waste—never against an imaginary feature list you will not implement in year one.",
          ],
        },
        {
          heading: "Migration readiness checklist before you sign",
          paragraphs: [
            "Use this checklist in a partner meeting; green majority means schedule vendor demos. Red items mean fix data hygiene first or accept a longer parallel run.",
          ],
          bullets: [
            "Named project owner (vet + practice manager) with weekly checkpoint.",
            "Active patient list definition (e.g., visit in last 24 months).",
            "Duplicate owner merge rules documented.",
            "Vaccine and antiparasitic due-date column audited for blanks.",
            "Product catalog shortlist for inventory migration.",
            "Role map: reception, nurse, vet, locum, accountant read access.",
            "Legacy Excel moved to read-only archive date set.",
            "Staff training dates blocked before go-live week.",
            "Parallel-run KPI: consults closed in new system daily.",
            "Export and contract terms understood if switching vendors later.",
            "Farm or multi-site entities mapped (if applicable).",
            "Budget includes storage add-ons if scanning archives.",
          ],
        },
        {
          heading:
            "Phased migration: veterinary management software without big-bang panic",
          paragraphs: [
            "Big-bang cutovers exaggerate downtime stories. Progressive migration reduces fear: Phase A — new clients and patients only in the new system for two weeks. Phase B — active preventives and appointments. Phase C — historical summaries (not every PDF) for top twenty percent of revenue clients. Phase D — inventory and accounting where your plan includes them.",
            "Keep Excel read-only during Phases A–C so reception can verify phone numbers once, not edit live. Retire the live sheet only when parallel KPI shows ninety percent of consults close in the veterinary management software for fourteen consecutive days.",
            "Data you cannot clean quickly—old farm paper—can remain scanned attachments with storage add-ons rather than blocking go-live. Validate attachment workflow on demo before assuming unlimited scans on the free tier.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient history—target state after Excel rows become structured records.",
        },
        {
          heading: "People risks: the real reason switches stall",
          paragraphs: [
            "Technology is the easy part. Switches stall when the senior vet who built the Excel empire feels criticized, or when reception fears double entry forever. Address psychology explicitly: credit the spreadsheet as a heroic bootstrap, then assign that person migration ownership or a training ambassador role.",
            "Document one screen-minute SOPs: create client, attach patient, book appointment, close consult with vaccine due date. Veterinary management software adoption metrics should be behavioral—percent consults with due dates—not login counts.",
            "Locums and weekend staff need read-only demo rehearsal before go-live; cloud access in FR/EN/ES helps multilingual teams but does not replace printed quick-reference cards for week one.",
          ],
        },
        {
          heading: "How to shortlist veterinary management software after Excel",
          paragraphs: [
            "After the checklist greens, score three to five candidates against the same scripted demo: household with two pets, preventive overdue, dispense and invoice, farm client if relevant, multi-organization view if you operate separate companies.",
            "Use /monde-veto/how-to-choose-veterinary-practice-management-software for weighting criteria—clinical depth, permissions, inventory accounting by plan, migration support, not logo count. Use /monde-veto/best-veterinary-practice-management-software-2027 for market context; neither replaces your demo notes.",
            "VetoCrm fits clinics seeking an integrated cloud app with the confirmed module set above. Explore read-only demo, rehearse on /register with fictitious data, and only then import production subsets.",
          ],
        },
        {
          heading: "Timeline template: twelve weeks from decision to Excel retired",
          paragraphs: [
            "Weeks 1–2: warning sign audit and checklist; partner vote. Weeks 3–4: demos and scorecard. Weeks 5–6: sandbox setup, role configuration, SOP draft. Weeks 7–8: Phase A new clients only; daily parallel KPI. Weeks 9–10: Phase B preventives and agenda. Weeks 11–12: Phase C history; Excel read-only; retrospective on missed bookings and stock accuracy.",
            "Adjust if you lack a practice manager—add two weeks for nurse-led data cleaning. Rush only if regulatory or contract deadline forces it; rushed migrations recreate Excel chaos inside expensive software.",
          ],
        },
        {
          heading: "Post-switch habits that prevent Excel relapse",
          paragraphs: [
            "Clinics relapse when managers export everything monthly to sheets for custom charts instead of using plan-based accounting views. Allow exports for accountants; forbid parallel live editing.",
            "Quarterly audit: search desktops for client_v*.xlsx. Retrain when vaccine due dates exist on fewer than ninety-five percent of closed consults. Link operational reviews to /monde-veto/veterinary-practice-kpis when you graduate from survival metrics to steering metrics.",
            "Storage and attachment discipline matters: scanned legacy rows belong in patient files, not resurrected columns.",
            "Partner review once per quarter should ask a blunt question: if we lost software access for forty-eight hours, would anyone re-open a live workbook? If yes, you still depend on Excel as system of record somewhere. Name that process and migrate it or accept documented risk.",
            "New hires must never hear \"we keep the real file on the shared drive.\" Onboarding should open only the veterinary management software for client lookup drills on day one.",
          ],
        },
        {
          heading:
            "Veterinary management software scoring after an Excel-era mindset",
          paragraphs: [
            "Teams coming from spreadsheets overweight export flexibility and underweight permissions. Flip the demo script: ask vendors to show what a receptionist cannot see, how consult history locks, and how vaccine due dates propagate to appointment views—not how fast they can dump CSV to Excel.",
            "Weight client–patient linking higher than chart count. Weight reminder configuration honestly against your phone culture. Weight farm and multi-organization only if your legal structure needs them this year.",
            "Document demo scores in the same workbook… ironically, a read-only decision matrix is fine until purchase; live client data never belongs there.",
          ],
        },
        {
          heading: "Where VetoCrm fits the Excel exit path",
          paragraphs: [
            "VetoCrm is a cloud veterinary management software covering clients, patients, appointments with reminders, consults, vaccines, antiparasitics, inventory and accounting scoped by plan, farm modules, and multi-organization roles—with free starter, storage add-ons, read-only demo, and FR/EN/ES UI.",
            "It suits teams exiting Excel who want one relational database rather than tab gymnastics, and who will respect phased migration. It does not replace partner agreement, data cleaning, or honest role design.",
            "Next steps: read /monde-veto/alternative-excel-clinique-veterinaire for motivational context, complete the checklist in this article, then /pricing and /register when demos confirm module fit.",
          ],
        },
      ],
      faq: [
        {
          q: "How is this different from the Excel alternative article?",
          a: "/monde-veto/alternative-excel-clinique-veterinaire focuses on why clinics leave spreadsheets and a short migration plan. This article focuses on timing, warning signs, limits, and a readiness checklist before vendor selection.",
        },
        {
          q: "Can we keep Excel for reporting after adopting software?",
          a: "Yes for exports to accountants or one-off analysis. No for live client, patient, or stock edits—that recreates split-brain data.",
        },
        {
          q: "Does VetoCrm import our Excel automatically?",
          a: "Validate import and attachment options on demo and your plan. Budget manual cleaning time; no migration is truly one-click for messy sheets.",
        },
        {
          q: "Is the free starter tier enough to leave Excel?",
          a: "Often enough to prove workflows for a small team. Inventory, accounting depth, and storage may require paid plans—confirm on /pricing.",
        },
        {
          q: "What is the first module to turn on after clients?",
          a: "Appointments with reminders plus vaccine due dates on patient records—those fix the highest-risk Excel failures fastest.",
        },
        {
          q: "When should mixed or farm practices switch earlier?",
          a: "When companion and herd data diverge across files or legal entities need isolation—multi-organization and farm modules exist to address that pattern in integrated veterinary management software.",
        },
      ],
      ctaTitle: "Leave spreadsheet chaos behind",
      ctaBody:
        "Walk the checklist, compare /monde-veto/how-to-choose-veterinary-practice-management-software, explore the read-only demo, and open a free starter account on /register when partners align.",
      ctaButton: "Start with VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "D’Excel au logiciel de gestion vétérinaire : quand faire basculer la clinique ?",
      excerpt:
        "Signaux d’alerte, limites des tableurs, checklist de migration et calendrier—pour décider du passage au logiciel de gestion sans doublonner le guide « alternative Excel ».",
      metaDescription:
        "Passage d’Excel au logiciel de gestion vétérinaire : signaux, limites, checklist, calendrier. Liens choix logiciel, meilleur 2027, alternative Excel. Modules VetoCrm confirmés.",
      category: "Migration",
      sections: [
        {
          heading:
            "La décision logiciel de gestion vétérinaire commence par l’honnêteté sur Excel",
          paragraphs: [
            "Peu de cliniques prévoient de rester sur Excel. Rapidement, plusieurs fichiers divergent sur le même animal. La question est le seuil où le bricolage tableur coûte plus qu’une migration structurée.",
            "Ce guide traite le quand et le comment : signaux, limites, checklist, parties prenantes. Pour le récit court « quitter Excel », voir /monde-veto/alternative-excel-clinique-veterinaire. Pour le choix éditeur : /monde-veto/how-to-choose-veterinary-practice-management-software et /monde-veto/best-veterinary-practice-management-software-2027.",
            "Fonctions VetoCrm confirmées : clients/patients, RDV/rappels, consultations/prescriptions, vaccins/antiparasitaires, stock/compta selon formule, fermes, rôles multi-organisation, formule découverte, stockage optionnel, démo lecture seule, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "Sept signaux qu’Excel ne suffit plus",
          paragraphs: [
            "Versions multiples, doublons propriétaires, rappels vaccins oubliés, stock irréel, formules cassées par des stagiaires, classeurs privés, sauvegardes non testées : deux signes pendant 90 jours justifient un projet formel.",
          ],
          bullets: [
            "Édition simultanée au rush matinal.",
            "Échéances préventives invisibles à la caisse.",
            "Notes consult hors système de facturation.",
            "Données fermes isolées des compagnons.",
            "Pas de piste d’audit sur les cellules.",
            "Clôture mensuelle interminable.",
            "SOP orales au lieu de procédures documentées.",
          ],
        },
        {
          heading: "Limites structurelles des tableurs",
          paragraphs: [
            "Excel analyse ; il ne tient pas dossier médical, agenda concurrentiel et stock lié aux factures. Le logiciel de gestion vétérinaire relie propriétaire, animal, acte et prochain vaccin avec permissions par rôle.",
            "Pratiques mixtes : rôles multi-organisation vs onglets éparpillés.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Lien client-patient — ce qu’un logiciel de gestion impose nativement.",
        },
        {
          heading: "Quand Excel reste acceptable (fenêtre courte)",
          paragraphs: [
            "Mobile solo, faible volume, pas de concurrence d’édition, date de sortie fixée. Irrationnel dès deuxième accueil, stock sensible, audits fermes ou assureurs exigeants.",
            "La formule découverte gratuite VetoCrm réduit l’argument cash ; le vrai coût est la conduite du changement.",
          ],
        },
        {
          heading: "Business case sans ROI fantaisie",
          paragraphs: [
            "Mesurez 30 jours : heures de rapprochement, RDV préventifs manqués documentés, casse stock, fuites facturation. Comparez à /pricing avec les heures staff incluses.",
          ],
        },
        {
          heading: "Checklist de préparation migration",
          paragraphs: ["Validez en réunion associés :"],
          bullets: [
            "Chef de projet nommé.",
            "Définition patients actifs.",
            "Règles fusion doublons.",
            "Audit colonnes échéances vaccins.",
            "Liste produits stock.",
            "Cartographie des rôles.",
            "Date archive Excel lecture seule.",
            "Créneaux formation bloqués.",
            "KPI parallèle : consults clôturées dans le nouveau système.",
            "Conditions export futures comprises.",
            "Entités fermes / multi-sites cartographiées.",
            "Budget stockage si scans d’archives.",
          ],
        },
        {
          heading: "Migration progressive sans big-bang",
          paragraphs: [
            "Phases : nouveaux clients → préventifs et agenda → historiques résumés → stock/compta selon formule. Excel en lecture seule jusqu’à 90 % des consults dans le logiciel pendant 14 jours.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Historique patient — cible après migration des lignes Excel.",
        },
        {
          heading: "Risques humains",
          paragraphs: [
            "Créditez le tableur fondateur ; nommez un ambassadeur formation. SOP d’une minute par écran. Métrique = % consults avec échéance vaccinale.",
          ],
        },
        {
          heading: "Shortlist après Excel",
          paragraphs: [
            "Démo scriptée : foyer multi-animaux, préventif en retard, dispensation, ferme si pertinent. Critères : /monde-veto/how-to-choose-veterinary-practice-management-software. Marché : /monde-veto/best-veterinary-practice-management-software-2027.",
          ],
        },
        {
          heading: "Modèle 12 semaines",
          paragraphs: [
            "S1–2 audit ; S3–4 démos ; S5–6 bac à sable ; S7–12 phases A–C et retrait Excel actif.",
          ],
        },
        {
          heading: "Éviter la rechute Excel",
          paragraphs: [
            "Exports comptables oui ; édition live non. Audit trimestriel fichiers client_v*.xlsx. KPI : /monde-veto/veterinary-practice-kpis.",
          ],
        },
        {
          heading: "VetoCrm sur la sortie Excel",
          paragraphs: [
            "Suite cloud intégrée avec modules confirmés. Démo, /pricing, /register après checklist verte.",
          ],
        },
      ],
      faq: [
        {
          q: "Différence avec alternative Excel ?",
          a: "L’article alternative motive et résume 4 étapes ; celui-ci cible timing, signaux et checklist avant achat.",
        },
        {
          q: "Garder Excel pour reporting ?",
          a: "Oui en export ; non comme base clients/stock vivante.",
        },
        {
          q: "Import automatique depuis Excel ?",
          a: "À valider en démo ; prévoir nettoyage manuel.",
        },
        {
          q: "Formule gratuite suffisante ?",
          a: "Souvent pour prouver les flux ; stock/compta/stockage selon /pricing.",
        },
        {
          q: "Premier module après clients ?",
          a: "Agenda + échéances vaccins sur fiche animal.",
        },
        {
          q: "Pratique mixte : basculer plus tôt ?",
          a: "Oui si compagnon/ferme divergent ou entités juridiques séparées.",
        },
      ],
      ctaTitle: "Sortez du chaos tableur",
      ctaBody:
        "Checklist, guide choix, démo lecture seule, /register quand les associés sont alignés.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "De Excel al software de gestión veterinaria: ¿cuándo debe cambiar la clínica?",
      excerpt:
        "Señales de alerta, límites de hojas de cálculo, checklist de migración y calendario para decidir el cambio al software de gestión veterinaria.",
      metaDescription:
        "De Excel a software de gestión veterinaria: señales, límites, checklist, calendario. Enlaces elegir software, mejor 2027, alternativa Excel. Módulos VetoCrm confirmados.",
      category: "Migración",
      sections: [
        {
          heading:
            "La decisión de software de gestión veterinaria empieza con el dolor real de Excel",
          paragraphs: [
            "Pocos consultorios planean quedarse en Excel. Varios archivos discrepan en el mismo microchip. La pregunta es el umbral en que el tableur cuesta más que una migración ordenada.",
            "Guía de cuándo y cómo: señales, límites, checklist. Motivación corta: /monde-veto/alternative-excel-clinique-veterinaire. Elección de producto: /monde-veto/how-to-choose-veterinary-practice-management-software y /monde-veto/best-veterinary-practice-management-software-2027.",
            "VetoCrm confirmado: clientes/pacientes, citas/recordatorios, consultas/recetas, vacunas/antiparasitarios, inventario/contabilidad por plan, granjas, roles multiorganización, plan inicial gratuito, almacenamiento opcional, demo lectura, cloud FR/EN/ES.",
          ],
        },
        {
          heading: "Siete señales de que Excel ya no basta",
          paragraphs: [
            "Versiones duplicadas, propietarios repetidos, vacunas olvidadas, stock ficticio, permisos débiles, copias privadas, copias de seguridad sin probar: dos señales durante 90 días justifican proyecto formal.",
          ],
          bullets: [
            "Edición concurrente en hora punta.",
            "Preventivos invisibles al cobrar.",
            "Notas clínicas fuera del sistema de factura.",
            "Datos de granja aislados.",
            "Sin auditoría de cambios.",
            "Cierre mensual eterno.",
            "Conocimiento oral sin SOP.",
          ],
        },
        {
          heading: "Límites estructurales de las hojas de cálculo",
          paragraphs: [
            "Excel analiza; no es historial médico, agenda concurrente ni stock vinculado a facturas. El software de gestión veterinaria enlaza propietario, paciente, acto y próxima vacuna con permisos.",
          ],
          image: "/monde-veto/screen-clients.png",
          imageCaption:
            "Enlace cliente-paciente — lo que el software relacional impone.",
        },
        {
          heading: "Cuándo Excel sigue siendo racional (breve)",
          paragraphs: [
            "Móvil solo, bajo volumen, sin edición concurrente, fecha de salida clara. Irracional con segundo recepcionista, stock regulado o auditorías de granja.",
          ],
        },
        {
          heading: "Caso de negocio sin ROI inventado",
          paragraphs: [
            "Mida 30 días: horas de conciliación, citas preventivas perdidas, mermas, fugas de facturación. Compare con /pricing incluyendo coste de personal.",
          ],
        },
        {
          heading: "Checklist de preparación",
          paragraphs: ["Valide en reunión de socios:"],
          bullets: [
            "Responsable de proyecto.",
            "Definición de pacientes activos.",
            "Reglas de fusión de duplicados.",
            "Auditoría de fechas de vacunas.",
            "Catálogo de productos.",
            "Mapa de roles.",
            "Fecha de archivo Excel solo lectura.",
            "Formación bloqueada en calendario.",
            "KPI paralelo: consultas cerradas en sistema nuevo.",
            "Términos de exportación futuros.",
            "Entidades granja/multi-sede.",
            "Presupuesto de almacenamiento para escaneos.",
          ],
        },
        {
          heading: "Migración por fases",
          paragraphs: [
            "Fases: clientes nuevos → preventivos y agenda → resúmenes históricos → inventario/contabilidad. Excel solo lectura hasta 90 % de consultas en software 14 días seguidos.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Historial del paciente — estado objetivo tras migrar filas Excel.",
        },
        {
          heading: "Riesgos humanos",
          paragraphs: [
            "Reconozca la hoja fundacional; embajador de formación. SOP de un minuto. Métrica: % consultas con fecha de vacuna.",
          ],
        },
        {
          heading: "Shortlist tras Excel",
          paragraphs: [
            "Demo con hogar multi-mascota, preventivo vencido, dispensación. Criterios: /monde-veto/how-to-choose-veterinary-practice-management-software. Mercado: /monde-veto/best-veterinary-practice-management-software-2027.",
          ],
        },
        {
          heading: "Plantilla 12 semanas",
          paragraphs: [
            "S1–2 auditoría; S3–4 demos; S5–6 sandbox; S7–12 fases y retirada de Excel vivo.",
          ],
        },
        {
          heading: "Evitar recaída en Excel",
          paragraphs: [
            "Exportes contables sí; edición viva no. Auditoría trimestral de client_v*.xlsx. KPI: /monde-veto/veterinary-practice-kpis.",
          ],
        },
        {
          heading: "VetoCrm en la salida de Excel",
          paragraphs: [
            "App cloud integrada con módulos confirmados. Demo, /pricing, /register tras checklist verde.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Diferencia con alternativa Excel?",
          a: "Aquí timing y checklist; el otro artículo motiva y resume pasos cortos.",
        },
        {
          q: "¿Excel solo para informes?",
          a: "Sí exportando; no como base viva de clientes/stock.",
        },
        {
          q: "¿Importación automática?",
          a: "Validar en demo; limpieza manual inevitable.",
        },
        {
          q: "¿Plan gratis basta?",
          a: "A menudo para probar flujos; profundidad según /pricing.",
        },
        {
          q: "¿Primer módulo tras clientes?",
          a: "Citas + fechas de vacuna en ficha paciente.",
        },
        {
          q: "¿Práctica mixta cambia antes?",
          a: "Sí si compañía/granja divergen o hay varias entidades legales.",
        },
      ],
      ctaTitle: "Deje el caos de hojas de cálculo",
      ctaBody:
        "Checklist, guía de elección, demo lectura, /register cuando los socios estén alineados.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};