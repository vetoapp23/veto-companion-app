import type { BlogArticle } from "./types";

export const ARTICLE_04: BlogArticle = {
  slug: "how-to-choose-veterinary-practice-management-software",
  cover: "/monde-veto/screen-dashboard.png",
  coverAlt: {
    fr: "Tableau de bord VetoCrm — choisir un logiciel de gestion vétérinaire",
    en: "VetoCrm dashboard — choosing veterinary practice management software",
    es: "Panel VetoCrm — elegir software de gestión veterinaria",
  },
  publishedAt: "2027-02-05",
  readingMinutes: 12,
  locales: {
    en: {
      title: "How to Choose the Right Veterinary Practice Management Software",
      excerpt:
        "A buyer framework for veterinary practice management software: ten selection criteria, usability and adoption, total cost of ownership, migration planning, vendor questions, common mistakes, and a printable checklist—with honest VetoCrm context.",
      metaDescription:
        "How to choose veterinary practice management software: 10 criteria, TCO, migration, demo questions, mistakes to avoid, and a checklist. Links to 2027 comparisons and CRM workflows.",
      category: "Buyer's guide",
      sections: [
        {
          heading: "Start with constraints, not feature brochures",
          paragraphs: [
            "Choosing veterinary practice management software is a multi-year infrastructure decision. Marketing pages optimize for emotion—beautiful dashboards, AI badges, integration logos—but your team will live inside appointment grids, consult templates, inventory deductions, and end-of-day cash reconciliation. If those flows fight your habits, even a cheap license becomes expensive in overtime and duplicate entry.",
            "This guide helps clinic owners, practice managers, and lead veterinarians shortlist PIMS (Practice Information Management System) options without treating selection as a vanity feature count. We organize around ten criteria you can score consistently across demos, then add depth on usability, total cost of ownership (TCO), migration, and vendor due diligence.",
            "For a market map of named products, see /monde-veto/best-veterinary-practice-management-software-2027. For relationship workflows once the backbone is chosen, see /monde-veto/veterinary-crm-clients-pets-relationships. When you evaluate VetoCrm specifically, we reference only confirmed capabilities: clients and patients, appointments with reminders, consults and prescriptions, vaccines and antiparasitics, inventory and accounting by plan tier, farm modules, multi-organization roles, free starter tier, storage add-ons, read-only demo, and cloud UI in French, English, and Spanish. We do not claim lab connectors, bundled SMS gateways, or user statistics that vetocrm.com does not substantiate.",
            "Budget transparency lives on /pricing; hands-on exploration starts at /register after you run the checklist below.",
          ],
        },
        {
          heading: "Ten selection criteria you can score on a spreadsheet",
          paragraphs: [
            "Before scheduling demos, build a one-page scorecard. Rate each candidate 1–5 with written evidence from trials—not from sales slides. Weight criteria by how your clinic earns revenue: a surgery-heavy hospital cares more about perioperative documentation than a vaccine-forward wellness clinic.",
          ],
          bullets: [
            "Clinical documentation — consult structure, prescriptions, attachments, read-only integrity after signing.",
            "Scheduling — shared calendar, appointment types, provider views, conflict rules, reminders you can actually configure.",
            "Client and patient records — household linking, search tolerance, permissions by role.",
            "Preventive care — vaccine and antiparasitic due dates, batch capture where regulations require it.",
            "Inventory and dispensing — stock decrement at invoice, reorder visibility, plan-level accounting if you need ledgers inside the PIMS.",
            "Billing and payments — estimates, invoices, refunds, multi-pet checkout, export to external accounting if required.",
            "Reporting — production, open balances, stock valuation without weekly Excel archaeology.",
            "Multi-site and governance — separate entities, role isolation, manager oversight (critical for groups and farm/companion splits).",
            "Language, region, and support — UI languages, timezone handling, support hours that match your shifts.",
            "Data portability — export formats, attachment retrieval, contract exit terms before you sign.",
          ],
        },
        {
          heading: "Usability and adoption beat feature depth on day one",
          paragraphs: [
            "The best veterinary practice management software on paper fails if reception cannot book a recheck in under ninety seconds or if associates abandon consult templates mid-visit. Usability is operational: speed of search, number of clicks from client lookup to invoice, clarity of error messages when stock is insufficient, and whether nurses can complete lawful tasks without borrowing a veterinarian password.",
            "Measure adoption during trial with scripted scenarios, not free exploration. Ask two receptionists and two clinicians each to complete the same five tasks—book urgent slot, convert estimate to invoice, record vaccine with next due date, locate yesterday’s surgery notes, and add a farm visit to a professional account if you run mixed practice. Time them. Count workarounds. If everyone invents sticky notes, the PIMS is not ready.",
            "Training burden matters in TCO. Cloud PIMS that update frequently can improve security but shift UI slightly; confirm release notes and whether vendor provides short video refreshers. Prefer vendors who let you rehearse in a sandbox or starter tier before migrating ten years of history.",
            "VetoCrm offers a read-only demo plus a free starter path suitable for low-risk workflow rehearsal; pair that with your scorecard rather than migrating everything on week one.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption:
            "Practice dashboard — navigation speed and role-relevant shortcuts drive adoption more than passive feature lists.",
        },
        {
          heading: "Clinical workflow fit: consult, stock, and preventives as one chain",
          paragraphs: [
            "Fragmented tools create silent failure: vaccines recorded in consult but inventory not decremented, or due dates typed on a sticky note instead of the patient record. Your PIMS should chain events—consult completed, products dispensed, invoice raised, preventive dates updated—without retyping patient identifiers.",
            "Validate surgery and dental workflows if they represent material revenue. Can you link perioperative instructions to the client record? Can locums see allergy notes without admin keys? If farm modules matter, confirm professional accounts, visit scheduling, and data isolation between legal entities when you operate companion and production lines under one brand.",
            "Confirmed VetoCrm modules cover consults, prescriptions, vaccines, antiparasitics, appointments with reminders, inventory, and plan-based accounting—enough for many companion and mixed practices when trialed against your scorecard. Gaps you discover in trial should be documented as explicit risks, not waived because the dashboard looks modern.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption:
            "Patient record — preventive due dates and consult context should live in the same database reception and clinicians share.",
        },
        {
          heading: "Total cost of ownership beyond the monthly subscription",
          paragraphs: [
            "TCO for veterinary practice management software includes subscription or license fees, implementation time, data migration services, training hours, payment terminal fees, third-party reminder channels, storage growth, and productivity dip during switchover. A lower per-seat price with mandatory implementation packages can exceed a higher SaaS tier with self-serve onboarding.",
            "Ask vendors for a written Year-1 estimate: licenses, onboarding, add-ons, expected storage, and any per-message reminder costs. Compare scenarios at your actual headcount in three years, not just today—hiring two associates changes seat math quickly.",
            "Hidden costs often sit in integrations you assume are included: accounting exports, client portal, imaging bridges, or SMS bundles. If a feature is not in your contract, budget staff time for manual alternatives. VetoCrm publishes plan structure on /pricing; treat storage add-ons as part of long-term TCO if you scan heavy imaging or archive years of attachments.",
            "Opportunity cost belongs in TCO too. Weeks spent fighting duplicate client records are weeks not spent on nurse-led wellness clinics or farm contract renewals.",
          ],
        },
        {
          heading: "Migration planning: waves, not big-bang weekends",
          paragraphs: [
            "Switching PIMS is rarely a forty-eight-hour cutover. Successful clinics migrate in waves: parallel run scheduling for new clients first, migrate active patient summaries, then historical attachments by priority. Define who owns data cleansing—duplicate owners and deceased pets are emotionally charged if mishandled.",
            "Request a migration checklist from each finalist: accepted import formats, downtime expectations, rollback plan, and how reminders behave during parallel running. Verify export rights in your current contract before you announce a switch internally.",
            "Staff communication prevents sabotage-by-inertia. Publish a one-page “why we change” note tied to measurable pains—slow search, missing vaccine due lists, inventory mismatch—and celebrate early wins when Monday’s preventive queue is faster in the new system.",
            "If VetoCrm is a finalist, use the free starter tier and read-only demo to rehearse SOPs before historical import decisions. Compare against workflows in /monde-veto/veterinary-crm-clients-pets-relationships so relationship habits migrate with clinical data.",
          ],
        },
        {
          heading: "Vendor questions to ask in every demo",
          paragraphs: [
            "Demos reward prepared skepticism. Send questions forty-eight hours ahead so engineers attend—not only sales. Record answers; vendors contradict themselves across calls more often than buyers expect.",
          ],
          bullets: [
            "Show the exact click path from new client registration to paid invoice including stock decrement.",
            "How are consult records locked or amended after signing? Who can see audit history?",
            "What appointment reminders ship in base product versus paid add-ons? Which channels (email, SMS, app) are actually available in our region?",
            "Demonstrate multi-organization roles with two test entities and a user who should not cross-see data.",
            "Provide sample export files for clients, patients, invoices, and attachments.",
            "What is average support response time for billing-blocking incidents on a Saturday?",
            "How do updates roll out, and can we pin training materials to a specific UI version during onboarding?",
            "What happens to our data if we terminate—format, timeframe, fees?",
          ],
        },
        {
          heading: "Common mistakes when buying PIMS",
          paragraphs: [
            "Mistake one — buying for the veterinarian only. Reception and nurses execute most clicks; excluding them from trials guarantees slow adoption. Mistake two — treating CRM marketing as a substitute for clinical PIMS. Relationship modules matter, but they cannot replace consult integrity and inventory truth.",
            "Mistake three — ignoring permissions until go-live. Role design should be rehearsed in trial: who edits contacts, who signs consults, who refunds, who exports. Mistake four — assuming integrations exist because a logo appeared on a slide. Ask for live API or file samples your bookkeeper accepts.",
            "Mistake five — signing before data export is tested from the incumbent. Mistake six — choosing purely on price per seat while underestimating migration and training. Mistake seven — parallel systems without rules: staff will revert to the old PIMS for “just this once” until two databases diverge permanently.",
            "Mistake eight — skipping reference calls with practices of similar size and species mix. Generic testimonials on websites are not substitutes for structured peer conversations.",
          ],
        },
        {
          heading: "Selection checklist you can print",
          paragraphs: [
            "Use this checklist after trials. Require sign-off from lead vet, practice manager, and at least one reception supervisor before contract signature.",
          ],
          bullets: [
            "Scorecard completed with evidence notes for all ten criteria.",
            "Timed workflow scripts passed by front desk and clinical staff without unauthorized workarounds.",
            "Year-1 TCO documented including training, storage, and reminder channels.",
            "Migration wave plan approved with owner for data cleansing.",
            "Export sample received and opened successfully from finalist.",
            "Support windows align with clinic hours; escalation path documented.",
            "Permissions matrix drafted and tested in sandbox.",
            "Farm or multi-entity scenarios tested if applicable.",
            "Executive summary shared with team explaining why change happens now.",
            "Fallback plan if go-live slips—including how client care continuity is protected.",
          ],
        },
        {
          heading: "Align stakeholders before you sign",
          paragraphs: [
            "Procurement fails when the veterinarian selects software alone and reception learns the calendar layout on go-live Monday. Schedule a sixty-minute internal workshop: list top ten weekly pain points, map each to a module, and mark which pains are contractual must-fix versus nice-to-have. Share the scorecard with associates even if they do not vote—buy-in reduces passive resistance.",
            "Include your external bookkeeper or accountant early if exports matter. Fifteen minutes reviewing a sample general-ledger extract prevents year-end surprises. Farm clients with entity separation should involve the practice owner who understands legal boundaries between companies.",
            "If you operate across French, English, and Spanish client populations, test UI language switching and staff training materials in each language you employ. Multilingual interface availability is not the same as multilingual support from the vendor—confirm both.",
          ],
        },
        {
          heading: "Where VetoCrm fits and sensible next steps",
          paragraphs: [
            "VetoCrm targets teams wanting an integrated cloud PIMS with companion and farm-oriented modules, multi-organization roles, French/English/Spanish UI, and a low-friction entry via read-only demo and free starter tier. It suits buyers who prioritize one web application for clients, patients, scheduling with reminders, clinical documentation, preventives, inventory, and plan-based accounting rather than stitching multiple point solutions.",
            "It is not automatically the best fit for every hospital group or every regulated integration scenario—your scorecard and reference calls decide that, not this article. Continue research with /monde-veto/best-veterinary-practice-management-software-2027, deepen relationship SOPs at /monde-veto/veterinary-crm-clients-pets-relationships, review /pricing, and open /register when your checklist is green for a controlled trial.",
            "Revisit the scorecard annually even if you stay put: vendor roadmaps, staff turnover, and new service lines (mobile surgery, tele-triage) change requirements faster than contracts expire.",
          ],
        },
      ],
      faq: [
        {
          q: "What is the difference between PIMS and veterinary CRM?",
          a: "PIMS is the clinical and operational backbone—records, scheduling, inventory, billing. CRM emphasizes client relationships and retention. Most clinics want integrated client/patient views inside the PIMS rather than two disconnected databases.",
        },
        {
          q: "How long should a PIMS selection process take?",
          a: "Many independent clinics need six to twelve weeks from scorecard to signed contract when trials are serious. Enterprise groups with integrations often need longer; rushing guarantees expensive rework.",
        },
        {
          q: "Is cloud veterinary software always better than desktop?",
          a: "Not always. Cloud wins on access, updates, and multi-site coordination when connectivity is reliable. Desktop or hybrid can persist where offline documentation, legacy hardware, or specific retention rules dominate. See /monde-veto/cloud-vs-desktop-veterinary-software for an architecture lens.",
        },
        {
          q: "Can we trial VetoCrm without migrating all historical data?",
          a: "Yes. Confirmed paths include a read-only demo and a free starter tier for rehearsing workflows before bulk import decisions. Use /register and /pricing for current structure.",
        },
        {
          q: "What is the most underrated selection criterion?",
          a: "Data portability at exit. Clinics that skip export testing often regret it at renewal negotiations years later.",
        },
        {
          q: "Should SMS reminders be mandatory in our RFP?",
          a: "Only if you will budget and govern SMS as a channel. Many clinics succeed with email and phone discipline where the PIMS supports appointment reminders. Verify what your contract actually includes—do not assume SMS is bundled.",
        },
      ],
      ctaTitle: "Score VetoCrm against your checklist",
      ctaBody:
        "Compare plans on /pricing, explore the read-only demo, and start a free starter account on /register when your team completes the workflow scripts.",
      ctaButton: "Try VetoCrm",
      ctaHref: "/register",
    },
    fr: {
      title:
        "Comment choisir le bon logiciel de gestion de cabinet vétérinaire",
      excerpt:
        "Cadre d’achat PIMS : dix critères, ergonomie et adoption, coût total, migration, questions éditeur, erreurs fréquentes et checklist imprimable.",
      metaDescription:
        "Choisir un logiciel de gestion vétérinaire : 10 critères, TCO, migration, questions démo, pièges à éviter. Liens comparatif 2027 et workflows CRM.",
      category: "Guide d'achat",
      sections: [
        {
          heading: "Partir des contraintes, pas de la brochure",
          paragraphs: [
            "Le choix d’un PIMS engage la clinique sur plusieurs années. Ce guide structure la shortlist avec dix critères, l’ergonomie, le TCO, la migration et la due diligence éditeur.",
            "Comparatif marché : /monde-veto/best-veterinary-practice-management-software-2027. Workflows relationnels : /monde-veto/veterinary-crm-clients-pets-relationships. VetoCrm : fonctions confirmées sur vetocrm.com uniquement (clients/patients, RDV/rappels, consultations/prescriptions, vaccins/antiparasitaires, stock/compta selon formule, fermes, rôles multi-organisation, formule découverte, stockage optionnel, démo lecture seule, cloud FR/EN/ES). Tarifs : /pricing ; essai : /register.",
          ],
        },
        {
          heading: "Dix critères à noter sur un tableau",
          paragraphs: ["Notez chaque éditeur 1 à 5 avec preuves issues des essais."],
          bullets: [
            "Dossier clinique et traçabilité après signature.",
            "Agenda partagé, types de RDV, rappels configurables.",
            "Fiches clients/patients, recherche, permissions.",
            "Préventifs : vaccins et antiparasitaires.",
            "Stock et délivrance liés à la facturation.",
            "Facturation, avoirs, export comptable si besoin.",
            "Reporting production et encours.",
            "Multi-sites et gouvernance multi-entités.",
            "Langues, fuseaux, support aux heures d’ouverture.",
            "Portabilité des données et conditions de sortie.",
          ],
        },
        {
          heading: "Ergonomie et adoption",
          paragraphs: [
            "Mesurez des scénarios chronométrés : RDV urgent, devis vers facture, vaccin avec prochaine échéance, notes de chirurgie, visite ferme. Si l’équipe contourne le logiciel, abandonnez ou reformez l’implémentation.",
            "VetoCrm : démo lecture seule et formule découverte pour répéter les SOP avant migration massive.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Dashboard — la vitesse de navigation prime sur la liste de fonctionnalités.",
        },
        {
          heading: "Chaîne consult → stock → préventifs",
          paragraphs: [
            "Un bon PIMS évite la double saisie entre consultation, délivrance et échéances préventives.",
            "Validez la chirurgie, la dentisterie et les modules fermes si votre mix de revenus l’exige.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Fiche patient — contexte clinique et préventifs au même endroit.",
        },
        {
          heading: "Coût total de possession",
          paragraphs: [
            "Abonnement, mise en service, migration, formation, stockage, canaux de rappel, perte de productivité au basculement. Demandez une estimation année 1 écrite.",
            "Structure des formules VetoCrm : /pricing.",
          ],
        },
        {
          heading: "Migration par vagues",
          paragraphs: [
            "Nouveaux clients d’abord, résumés actifs, puis archives. Propriétaire désigné pour le nettoyage des doublons. Vérifiez les droits d’export du logiciel actuel.",
          ],
        },
        {
          heading: "Questions à poser en démo",
          paragraphs: ["Envoyez la liste 48 h avant pour avoir des réponses techniques."],
          bullets: [
            "Parcours clic complet jusqu’à facture payée.",
            "Rôles, verrouillage des consultations, journal d’audit.",
            "Rappels inclus vs options ; canaux réellement disponibles.",
            "Multi-organisation avec deux entités test.",
            "Exports clients, patients, pièces jointes.",
            "SLA support le samedi.",
            "Données à la résiliation.",
          ],
        },
        {
          heading: "Erreurs fréquentes",
          paragraphs: [
            "Acheter sans l’accueil et les ASV ; confondre CRM marketing et PIMS clinique ; ignorer les permissions ; croire aux logos d’intégration ; signer sans tester l’export ; deux bases en parallèle sans règles.",
          ],
        },
        {
          heading: "Checklist avant signature",
          paragraphs: ["Validation vet référent, manager et responsable accueil."],
          bullets: [
            "Grille des dix critères complétée.",
            "Scénarios chronométrés réussis.",
            "TCO année 1 documenté.",
            "Plan de migration par vagues.",
            "Échantillon d’export validé.",
            "Matrice de permissions testée.",
            "Scénarios fermes/multi-entités si pertinent.",
            "Plan de continuité si retard de mise en production.",
          ],
        },
        {
          heading: "Place de VetoCrm et prochaines étapes",
          paragraphs: [
            "PIMS cloud intégré pour cliniques compagnon et mixtes souhaitant clients, patients, agenda, clinique, préventifs, stock et compta selon formule, avec UI FR/EN/ES.",
            "Poursuivre : comparatif 2027, guide CRM clients, /pricing, /register.",
          ],
        },
      ],
      faq: [
        {
          q: "PIMS vs CRM vétérinaire ?",
          a: "Le PIMS couvre clinique, stock et facturation. Le CRM la relation client. L’intégration dans une suite unique limite les doublons.",
        },
        {
          q: "Durée typique de sélection ?",
          a: "Souvent six à douze semaines pour une structure indépendante avec essais sérieux.",
        },
        {
          q: "Cloud toujours meilleur ?",
          a: "Non : voir /monde-veto/cloud-vs-desktop-veterinary-software selon connectivité et contraintes locales.",
        },
        {
          q: "Essayer VetoCrm sans tout migrer ?",
          a: "Oui : démo et formule découverte confirmées.",
        },
        {
          q: "Critère sous-estimé ?",
          a: "La portabilité des données à la sortie du contrat.",
        },
        {
          q: "SMS obligatoire dans le cahier des charges ?",
          a: "Seulement si budget et gouvernance SMS ; vérifier le contrat, le SMS n’est pas toujours inclus.",
        },
      ],
      ctaTitle: "Notez VetoCrm sur votre grille",
      ctaBody: "Tarifs /pricing, démo lecture seule, formule découverte /register.",
      ctaButton: "Essayer VetoCrm",
      ctaHref: "/register",
    },
    es: {
      title:
        "Cómo elegir el software de gestión adecuado para clínica veterinaria",
      excerpt:
        "Marco de compra PIMS: diez criterios, usabilidad, coste total, migración, preguntas al proveedor, errores comunes y checklist.",
      metaDescription:
        "Elegir software de gestión veterinaria: 10 criterios, TCO, migración, preguntas en demo y checklist. Enlaces al comparativo 2027 y CRM.",
      category: "Guía de compra",
      sections: [
        {
          heading: "Empiece por restricciones, no por folletos",
          paragraphs: [
            "Elegir PIMS es una decisión de infraestructura plurianual. Este artículo estructura diez criterios, usabilidad, TCO, migración y due diligence.",
            "Comparativa: /monde-veto/best-veterinary-practice-management-software-2027. Flujos CRM: /monde-veto/veterinary-crm-clients-pets-relationships. VetoCrm solo con funciones confirmadas en vetocrm.com. Planes: /pricing; prueba: /register.",
          ],
        },
        {
          heading: "Diez criterios puntuables",
          paragraphs: ["Puntuación 1–5 con evidencia de las pruebas."],
          bullets: [
            "Documentación clínica y trazabilidad.",
            "Agenda, tipos de cita, recordatorios.",
            "Clientes/pacientes, búsqueda, permisos.",
            "Vacunas y antiparasitarios.",
            "Inventario ligado a facturación.",
            "Facturación y exportación contable.",
            "Informes de producción.",
            "Multisede y multiorganización.",
            "Idiomas y soporte en su horario.",
            "Portabilidad de datos.",
          ],
        },
        {
          heading: "Usabilidad y adopción",
          paragraphs: [
            "Pruebe escenarios cronometrados con recepción y clínicos. VetoCrm ofrece demo de solo lectura y plan inicial gratuito.",
          ],
          image: "/monde-veto/screen-dashboard.png",
          imageCaption: "Panel — la velocidad de navegación impulsa la adopción.",
        },
        {
          heading: "Flujo clínico integrado",
          paragraphs: [
            "Consulta, dispensación y fechas preventivas deben compartir la misma base de datos.",
          ],
          image: "/monde-veto/screen-patients.png",
          imageCaption: "Ficha del paciente — preventivos y contexto clínico unidos.",
        },
        {
          heading: "Coste total de propiedad",
          paragraphs: [
            "Licencias, implantación, formación, almacenamiento y canales de recordatorio. Pedir presupuesto año 1 por escrito.",
          ],
        },
        {
          heading: "Migración por fases",
          paragraphs: [
            "Clientes nuevos primero; limpieza de duplicados; verificar exportación del sistema actual.",
          ],
        },
        {
          heading: "Preguntas en cada demo",
          bullets: [
            "Recorrido hasta factura pagada.",
            "Permisos y bloqueo de consultas.",
            "Recordatorios incluidos y canales.",
            "Roles multiorganización.",
            "Exportaciones de prueba.",
            "Soporte en fin de semana.",
            "Datos al cancelar.",
          ],
          paragraphs: [],
        },
        {
          heading: "Errores habituales",
          paragraphs: [
            "Excluir a recepción; confundir CRM con PIMS; ignorar permisos; confiar en logos; firmar sin exportar; dos sistemas sin reglas.",
          ],
        },
        {
          heading: "Checklist imprimible",
          bullets: [
            "Grilla de diez criterios.",
            "Escenarios superados.",
            "TCO año 1.",
            "Plan de migración.",
            "Exportación validada.",
            "Matriz de permisos.",
            "Granjas/multiorganización si aplica.",
            "Plan de continuidad.",
          ],
          paragraphs: [],
        },
        {
          heading: "VetoCrm y siguientes pasos",
          paragraphs: [
            "PIMS cloud integrado con módulos confirmados y UI FR/EN/ES. Siga con comparativo 2027, guía CRM, /pricing y /register.",
          ],
        },
      ],
      faq: [
        {
          q: "¿PIMS o CRM veterinario?",
          a: "PIMS es columna clínica y operativa; CRM es relación. La suite integrada reduce duplicados.",
        },
        {
          q: "¿Cuánto dura la selección?",
          a: "A menudo seis a doce semanas con pruebas serias.",
        },
        {
          q: "¿Cloud siempre mejor?",
          a: "No; ver /monde-veto/cloud-vs-desktop-veterinary-software.",
        },
        {
          q: "¿Probar VetoCrm sin migrar todo?",
          a: "Sí: demo y plan inicial confirmados.",
        },
        {
          q: "¿Criterio infravalorado?",
          a: "Portabilidad de datos al salir.",
        },
        {
          q: "¿SMS obligatorio?",
          a: "Solo si lo presupuesta; no asuma SMS incluido.",
        },
      ],
      ctaTitle: "Puntúe VetoCrm con su checklist",
      ctaBody: "Planes en /pricing y cuenta inicial en /register.",
      ctaButton: "Probar VetoCrm",
      ctaHref: "/register",
    },
  },
};