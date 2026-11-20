import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "20 novembre 2026";

const ATTRIBUTION =
  "Adapté à partir de modèles rédigés par des avocats et publiés par General Legal, PC sous licence CC0 1.0. Ces modèles sont fournis à titre informatif uniquement et ne constituent pas un conseil juridique ni une relation avocat-client.";

export const legalFr: LegalBundle = {
  privacy: {
    title: "Politique de confidentialité",
    metaDescription:
      "Politique de confidentialité VetoCrm — traitement des données personnelles du SaaS de gestion clinique vétérinaire (RGPD, Stripe, sous-traitants, droits).",
    lastUpdated: UPDATED,
    intro: `${E.companyFormalName} (« ${E.brand} », « nous ») fournit un logiciel cloud de gestion pour cliniques vétérinaires (clients, animaux, rendez-vous, dossiers médicaux, vaccins, stock, fermes et modules associés) sur ${E.website} et applications liées (le « Service »). La présente politique décrit comment nous traitons les informations personnelles collectées via le Service, nos activités marketing et les autres activités décrites ici. Utilisateurs européens : voir la section RGPD ci-dessous.`,
    sections: [
      {
        id: "roles",
        title: "1. Rôles : responsable de traitement et sous-traitant",
        paragraphs: [`${E.brand} agit selon deux rôles distincts :`],
        bullets: [
          "Responsable de traitement pour les données de compte, d’abonnement, de facturation, de support, de marketing (le cas échéant avec consentement) et d’usage de la plateforme concernant le personnel de clinique (admins, assistants, super-admins).",
          `Sous-traitant pour les données de clients, animaux, dossiers médicaux, rendez-vous, prescriptions, fermes, stock et documents saisis par une clinique : la clinique (organisation) est responsable de traitement ; ${E.brand} traite ces données uniquement pour fournir le Service selon les instructions de la clinique.`,
        ],
      },
      {
        id: "controller",
        title: "2. Qui nous sommes",
        paragraphs: [
          `Éditeur / prestataire : ${E.companyFormalName} (marque ${E.brand}).`,
          `Site : ${E.website}`,
          `Contact / privacy : ${E.privacyEmail}`,
          `Correspondance : ${E.address}`,
          `LinkedIn : ${E.linkedin} · Instagram : ${E.instagram}`,
          "Les mentions d’identification figurent aussi sur la page Mentions légales.",
        ],
      },
      {
        id: "collect",
        title: "3. Informations personnelles collectées",
        paragraphs: ["Selon votre usage, nous pouvons traiter :"],
        bullets: [
          "Données de contact et de compte : nom, e-mail, téléphone, rôle, langue, mot de passe hashé.",
          "Données de clinique / organisation : nom, adresse, paramètres, codes d’invitation, membres.",
          "Contenu professionnel de la clinique (en tant que sous-traitant) : propriétaires, animaux, consultations, vaccinations, antiparasites, prescriptions, fermes, stock, comptabilité interne, photos et pièces jointes.",
          "Métadonnées de paiement : identifiants client/abonnement Stripe, plan, statut, historique (nous ne stockons pas les numéros complets de carte ni le CVC).",
          "Communications : messages support et e-mails transactionnels.",
          "Données d’appareil et d’activité : adresse IP, type de navigateur/appareil, pages vues, localisation approximative, journaux de sécurité et d’usage.",
          "Cookies et identifiants similaires : voir la Politique cookies.",
        ],
      },
      {
        id: "sources",
        title: "4. Sources",
        bullets: [
          "Vous et votre équipe (formulaires, saisie CRM, imports).",
          "Collecte automatique lors de l’usage (logs, cookies, analytics si consentis).",
          "Prestataires agissant pour notre compte (paiement, hébergement, e-mail).",
          "Partenaires d’opération corporate (fusion, financement, etc.) le cas échéant.",
        ],
      },
      {
        id: "use",
        title: "5. Finalités d’utilisation",
        bullets: [
          "Fournir, sécuriser et faire fonctionner le Service (comptes, isolation multi-tenant, sync, support).",
          "Traiter les abonnements et factures via Stripe.",
          "Personnaliser les préférences (langue, UI) et améliorer le produit via des analytics agrégées.",
          "Envoyer des annonces de service, alertes de sécurité et (avec consentement si requis) du marketing.",
          "Détecter fraude, abus et incidents ; respecter la loi.",
          "En tant que sous-traitant : héberger et traiter le contenu clinique uniquement pour livrer le Service à cette clinique.",
        ],
      },
      {
        id: "legal-bases",
        title: "6. Bases légales (RGPD / UK GDPR)",
        bullets: [
          "Exécution du contrat (art. 6(1)(b)) : compte, CRM, authentification, facturation.",
          "Intérêt légitime (art. 6(1)(f)) : sécurité, prévention de la fraude, amélioration produit, analytics agrégées — sous réserve de vos droits.",
          "Obligation légale (art. 6(1)(c)) : facturation et réponses aux autorités compétentes.",
          "Consentement (art. 6(1)(a)) : cookies/analytics non essentiels et marketing optionnel — révocable à tout moment.",
        ],
      },
      {
        id: "sharing",
        title: "7. Partage des informations",
        paragraphs: [
          "Nous ne vendons pas les informations personnelles. Nous les partageons uniquement pour faire fonctionner le Service :",
        ],
        bullets: [
          "Au sein de votre organisation (membres selon les rôles).",
          "Prestataires / sous-traitants sous contrat : Supabase (base, auth, fichiers) ; Vercel (hébergement, Analytics et Speed Insights si activés) ; Stripe (paiements) ; prestataires d’e-mail transactionnel.",
          "Conseillers professionnels (juridique, comptable) sous confidentialité.",
          "Autorités lorsque la loi l’exige ou pour protéger droits, sécurité ou sûreté.",
          "Successeurs dans le cadre d’une opération corporate (avec garanties appropriées).",
        ],
      },
      {
        id: "transfers",
        title: "8. Transferts internationaux",
        paragraphs: [
          "Selon les prestataires, des données peuvent être traitées hors de votre pays (y compris hors EEE/Royaume-Uni). Le cas échéant, nous nous appuyons sur des garanties appropriées (clauses contractuelles types de l’UE, décisions d’adéquation, etc.) et des mesures techniques.",
          `Les cliniques de l’UE/EEE peuvent demander un accord de sous-traitance (DPA) à ${E.contactEmail}.`,
        ],
      },
      {
        id: "retention",
        title: "9. Conservation",
        bullets: [
          "Compte et organisation : durée du contrat, puis suppression ou anonymisation dans un délai raisonnable après clôture (sauf obligation légale plus longue).",
          "Facturation : durées légales comptables.",
          "Journaux de sécurité : durée limitée nécessaire à la détection d’incidents.",
          "Cookies : selon le type (Politique cookies).",
        ],
      },
      {
        id: "security",
        title: "10. Sécurité",
        paragraphs: [
          "Nous appliquons des mesures techniques et organisationnelles adaptées au risque : TLS, contrôle d’accès par rôles, isolation des organisations, hachage des mots de passe, sauvegardes et journaux d’accès.",
          "Aucun système n’est parfait. En cas de violation de données personnelles susceptible d’engendrer un risque élevé, nous notifierons les personnes et autorités concernées conformément à la loi applicable (dont le RGPD).",
        ],
      },
      {
        id: "rights",
        title: "11. Vos droits",
        paragraphs: [
          "Selon votre lieu de résidence, vous pouvez disposer de droits d’accès, de rectification, d’effacement, de limitation, d’opposition, de portabilité, et du droit d’introduire une réclamation auprès d’une autorité (ex. CNIL).",
          `Données de compte / personnel : ${E.privacyEmail} ou ${E.supportEmail}.`,
          "Données propriétaires / patients dans un espace clinique : contactez d’abord la clinique (responsable). Nous assistons en tant que sous-traitant.",
        ],
      },
      {
        id: "us-state",
        title: "12. Avis relatifs aux États américains",
        paragraphs: [
          "Si vous résidez en Californie, Colorado, Connecticut, Virginie, Nevada ou dans un autre État américain disposant d’une loi privacy complète, vous pouvez avoir des droits de connaître, accéder, corriger, supprimer, obtenir une copie des informations, et de vous opposer à la vente/partage ou à la publicité ciblée, selon les cas.",
          `${E.brand} ne vend pas d’informations personnelles et n’utilise pas ces informations pour de la publicité comportementale cross-contexte au-delà des outils d’analytics consentis décrits dans la Politique cookies.`,
          `Pour exercer ces droits : ${E.privacyEmail}.`,
        ],
      },
      {
        id: "deletion",
        title: "13. Suppression de compte",
        paragraphs: [
          `Vous pouvez demander la suppression de votre compte depuis les paramètres ou par e-mail à ${E.supportEmail}. La suppression met fin à l’accès ; certains enregistrements peuvent être conservés temporairement pour des motifs légaux, de sécurité ou de litige.`,
          "Les admins de clinique peuvent demander l’export puis la suppression des données d’organisation.",
        ],
      },
      {
        id: "children",
        title: "14. Mineurs",
        paragraphs: [
          "Le Service s’adresse aux professionnels vétérinaires et au personnel de clinique. Il n’est pas destiné aux enfants de moins de 16 ans (ou de l’âge local de consentement numérique). Nous ne créons pas sciemment de comptes utilisateurs pour des mineurs.",
        ],
      },
      {
        id: "cookies",
        title: "15. Cookies et traceurs",
        paragraphs: [
          "Nous utilisons des cookies et technologies similaires pour l’authentification, les préférences, la sécurité et, avec consentement si requis, l’analytics (dont Vercel Analytics et Speed Insights). Détails : Politique cookies.",
        ],
      },
      {
        id: "changes",
        title: "16. Modifications",
        paragraphs: [
          "Nous pouvons mettre à jour cette politique. La date « Dernière mise à jour » sera modifiée. En cas de changement matériel, nous pourrons vous informer dans le produit ou par e-mail.",
        ],
      },
      {
        id: "contact",
        title: "17. Contact",
        paragraphs: [
          `Privacy : ${E.privacyEmail}`,
          `Support : ${E.supportEmail}`,
          `Site : ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "18. Attribution du modèle",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  terms: {
    title: "Conditions d’utilisation",
    metaDescription:
      "Conditions d’utilisation VetoCrm — accès, abonnements, usage acceptable, responsabilité et droit applicable.",
    lastUpdated: UPDATED,
    intro: `Les présentes Conditions d’utilisation (« Conditions ») régissent l’accès à ${E.website} et au Service ${E.brand} exploité par ${E.companyFormalName} (« ${E.brand} », « nous »). En créant un compte, en cliquant sur « J’accepte » ou en utilisant le Service, vous acceptez ces Conditions pour vous-même ou l’entité que vous représentez. Vous devez avoir au moins 18 ans et être habilité à engager la clinique/organisation. Sinon, n’utilisez pas le Service.`,
    sections: [
      {
        id: "service",
        title: "1. Le Service",
        paragraphs: [
          `${E.brand} fournit des outils cloud de gestion pour cliniques vétérinaires (clients, animaux, planning, consultations, vaccins, stock, fermes, comptabilité selon le plan) pour des équipes multi-utilisateurs.`,
          "Nous pouvons modifier, suspendre ou interrompre des fonctionnalités avec un préavis raisonnable lorsque cela est possible. Le Service est fourni selon une obligation de moyens commercialement raisonnable, hors maintenance planifiée et cas de force majeure.",
        ],
      },
      {
        id: "accounts",
        title: "2. Comptes et sécurité",
        bullets: [
          "Fournir des informations d’inscription exactes et les tenir à jour.",
          "Conserver la confidentialité des identifiants ; vous êtes responsable de l’activité sous votre compte.",
          "Les admins d’organisation gèrent invitations, rôles et accès.",
          "Nous notifier rapidement tout accès non autorisé. Les comptes démo sont limités et peuvent être réinitialisés.",
        ],
      },
      {
        id: "license",
        title: "3. Licence et restrictions",
        paragraphs: [
          "Sous réserve de ces Conditions et de votre plan, nous vous accordons une licence limitée, non exclusive, non transférable et révocable d’accès et d’usage du Service pour les besoins professionnels internes de votre clinique.",
        ],
        bullets: [
          "Ne pas vendre, louer, sous-licencier ou exploiter commercialement le Service sans accord écrit.",
          "Ne pas procéder à de l’ingénierie inverse, contourner la sécurité, scraper à grande échelle, ni créer un produit concurrent à partir de nos éléments.",
          "Ne pas accéder aux données d’une autre organisation sans autorisation.",
          "Conserver les mentions de propriété sur toute copie autorisée.",
        ],
      },
      {
        id: "plans",
        title: "4. Formules, prix et taxes",
        paragraphs: [
          "Des formules gratuites et payantes sont proposées avec quotas (utilisateurs, stockage, modules). Les prix affichés peuvent être hors taxes et varier selon la devise (MAD, EUR, USD) et la périodicité.",
          "Nous pouvons modifier les prix avec un préavis raisonnable ; les changements s’appliquent au prochain renouvellement sauf indication contraire.",
        ],
      },
      {
        id: "stripe",
        title: "5. Paiement via Stripe",
        paragraphs: [
          "Les formules payantes sont facturées via Stripe. En souscrivant, vous autorisez les prélèvements récurrents. Un échec de paiement peut entraîner la suspension des fonctionnalités payantes après notification.",
          "Factures/reçus via le portail de facturation ou sur demande. Les abonnements via stores mobiles suivent les règles du store.",
        ],
      },
      {
        id: "cancel",
        title: "6. Résiliation et remboursements",
        paragraphs: [
          "Vous pouvez résilier ou rétrograder à tout moment ; l’effet intervient en général à la fin de la période prépayée. Détails : Politique de remboursement.",
        ],
      },
      {
        id: "privacy",
        title: "7. Confidentialité et cookies",
        paragraphs: [
          `Votre usage est aussi régi par la Politique de confidentialité (${E.website}/privacy) et la Politique cookies (${E.website}/cookies), incorporées par référence. En cas de conflit sur le traitement des données personnelles, la Politique de confidentialité prévaut.`,
        ],
      },
      {
        id: "customer-data",
        title: "8. Données de clinique",
        paragraphs: [
          "Vous conservez vos droits sur les données saisies. Vous nous concédez une licence limitée pour les héberger et les traiter uniquement afin de fournir le Service.",
          "Vous garantissez disposer d’une base légale pour traiter les données des propriétaires et dossiers associés. Nous agissons comme sous-traitant ; un DPA est disponible sur demande.",
        ],
      },
      {
        id: "feedback",
        title: "9. Retours / suggestions",
        paragraphs: [
          "Si vous nous communiquez des suggestions, vous nous accordez une licence perpétuelle, irrévocable, mondiale et libre de redevance pour les utiliser sans attribution. Ne soumettez pas d’informations que vous considérez confidentielles.",
        ],
      },
      {
        id: "third-party",
        title: "10. Services tiers",
        paragraphs: [
          "Le Service peut renvoyer vers ou s’intégrer à des services tiers (ex. Stripe, hébergeurs). Nous ne les contrôlons pas ; leurs conditions s’appliquent. Vous les utilisez à vos risques.",
        ],
      },
      {
        id: "disclaimer",
        title: "11. Avertissement professionnel et « en l’état »",
        paragraphs: [
          `${E.brand} est un outil d’aide à la gestion pour professionnels vétérinaires. Ce n’est pas un dispositif médical et il ne remplace pas le jugement clinique, le diagnostic, la prescription ni les obligations réglementaires. Vous restez seul responsable des décisions professionnelles.`,
          "LE SERVICE EST FOURNI « EN L’ÉTAT » ET « SELON DISPONIBILITÉ ». DANS LES LIMITES AUTORISÉES PAR LA LOI, NOUS EXCLUONS LES GARANTIES DE QUALITÉ MARCHANDE, D’ADÉQUATION À UN USAGE PARTICULIER, DE TITRE ET DE NON-CONTREFAÇON. NOUS NE GARANTISSONS PAS UN FONCTIONNEMENT ININTERROMPU OU SANS ERREUR.",
        ],
      },
      {
        id: "liability",
        title: "12. Limitation de responsabilité",
        paragraphs: [
          "Dans les limites permises par la loi, nous ne sommes pas responsables des dommages indirects, consécutifs, accessoires, spéciaux ou punitifs, pertes de profits, ou pertes de données dues à un usage abusif ou à des pannes de tiers.",
          "Notre responsabilité globale liée au Service est plafonnée aux montants que vous nous avez effectivement payés au cours des 12 mois précédant la réclamation (ou l’équivalent de 100 EUR sur une formule gratuite).",
        ],
      },
      {
        id: "indemnity",
        title: "13. Indemnisation",
        paragraphs: [
          "Vous acceptez de nous défendre et indemniser contre les réclamations et frais raisonnables résultant de votre usage du Service, de vos données cliniques, de votre violation des présentes Conditions ou de la loi — dans la mesure permise par le droit applicable.",
        ],
      },
      {
        id: "termination",
        title: "14. Suspension et résiliation",
        paragraphs: [
          "Nous pouvons suspendre ou résilier l’accès en cas de manquement, de défaut de paiement ou de risque juridique/sécurité. À la résiliation, la licence prend fin ; les clauses survivantes (PI, responsabilité, indemnisation, droit applicable) demeurent.",
        ],
      },
      {
        id: "law",
        title: "15. Droit applicable et litiges",
        paragraphs: [
          `Sous réserve des protections impératives de votre pays, ces Conditions sont régies par le droit ${E.country === "Maroc" ? "marocain" : E.country}. Les tribunaux de Rabat sont compétents, sauf règles impératives contraires.`,
          `Avant toute procédure formelle, contactez ${E.contactEmail} pour tenter une résolution amiable.`,
        ],
      },
      {
        id: "general",
        title: "16. Dispositions générales",
        bullets: [
          "Nous pouvons mettre à jour ces Conditions ; les changements matériels peuvent être notifiés dans le produit ou par e-mail.",
          "Ces Conditions, avec les politiques Confidentialité, Cookies, Remboursement et Divulgation, constituent l’intégralité de l’accord relatif au Service.",
          "Si une clause est invalide, elle sera adaptée au minimum nécessaire ; le reste demeure.",
          "Vous ne pouvez pas céder ces Conditions sans notre accord ; nous pouvons les céder dans le cadre d’une opération corporate.",
          `Contact : ${E.contactEmail} — ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "17. Attribution du modèle",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  legal: {
    title: "Mentions légales",
    metaDescription: "Mentions légales VetoCrm — éditeur, hébergement, contact et identification.",
    lastUpdated: UPDATED,
    intro: "Identification de l’éditeur du service en ligne VetoCrm.",
    sections: [
      {
        id: "publisher",
        title: "1. Éditeur",
        paragraphs: [
          `Marque / service : ${E.brand}`,
          `Nom : ${E.companyFormalName}`,
          `Site : ${E.website}`,
          `Contact : ${E.contactEmail}`,
          `Correspondance : ${E.address}`,
          `LinkedIn : ${E.linkedin}`,
          `Instagram : ${E.instagram}`,
        ],
      },
      {
        id: "director",
        title: "2. Directeur de la publication",
        paragraphs: [`Directeur de la publication : ${E.publicationDirector}, joignable à ${E.contactEmail}.`],
      },
      {
        id: "hosting",
        title: "3. Hébergement",
        paragraphs: [
          `Application (front) : ${E.hostingApp}.`,
          `Données et backend : ${E.hostingData}.`,
          `Questions : ${E.supportEmail}.`,
        ],
      },
      {
        id: "ip",
        title: "4. Propriété intellectuelle",
        paragraphs: [
          "Les éléments du site et de l’application (textes, graphismes, logo, logiciel) sont protégés. Toute reproduction non autorisée est interdite.",
        ],
      },
      {
        id: "med",
        title: "5. Avertissement professionnel",
        paragraphs: [
          "VetoCrm est un logiciel de gestion pour professionnels vétérinaires. Ce n’est pas un dispositif médical et il ne remplace pas l’expertise clinique. Voir aussi la page Divulgation.",
        ],
      },
    ],
  },

  cookies: {
    title: "Politique cookies",
    metaDescription:
      "Politique cookies VetoCrm — cookies essentiels, préférences, Vercel Analytics / Speed Insights et gestion du consentement.",
    lastUpdated: UPDATED,
    intro: `La présente politique explique comment ${E.brand} (« nous ») utilise les cookies et technologies similaires sur ${E.website} et dans l’application, conformément à notre Politique de confidentialité. Elle est adaptée du modèle Cookie Notice de General Legal à notre stack réelle.`,
    sections: [
      {
        id: "what",
        title: "1. Qu’est-ce qu’un cookie ?",
        paragraphs: [
          "Un cookie est un petit fichier placé sur votre appareil lors de la visite d’un site. Nous pouvons aussi utiliser le stockage local du navigateur et des pixels. Nous utilisons des cookies de session et des cookies persistants.",
          "Les cookies first-party sont déposés par nous ; des cookies tiers peuvent l’être par des prestataires (ex. analytics après consentement).",
        ],
      },
      {
        id: "types",
        title: "2. Types utilisés",
        bullets: [
          "Essentiels / techniques : session d’authentification (ex. Supabase), sécurité, répartition de charge — nécessaires au Service. Pas de consentement requis.",
          "Préférences / fonctionnalité : langue (vetocrm-lang), choix cookies (vetocrm_cookie_consent), état d’UI.",
          "Analytics / performance (uniquement si vous acceptez les cookies non essentiels) : Vercel Analytics et Vercel Speed Insights — mesure d’audience agrégée et Core Web Vitals.",
          "Publicité / réseaux sociaux : non utilisés actuellement sur vetocrm.com. S’ils sont ajoutés, nous mettrons à jour cette politique et demanderons le consentement si requis.",
        ],
      },
      {
        id: "providers",
        title: "3. Qui les dépose",
        bullets: [
          `${E.brand} / first party — préférences et consentement.`,
          "Supabase — cookies/jetons d’auth essentiels pour les utilisateurs connectés.",
          "Vercel — hébergement ; scripts Analytics et Speed Insights uniquement après consentement via la bannière.",
          "Stripe — peut déposer des cookies sur les pages de paiement.",
        ],
      },
      {
        id: "choices",
        title: "4. Vos choix",
        paragraphs: [
          "À la première visite, une bannière permet d’accepter ou de refuser les cookies non essentiels. Les cookies essentiels restent actifs.",
          "Vous pouvez effacer les données du site ou bloquer les cookies dans le navigateur ; le blocage des essentiels peut empêcher la connexion.",
          "Pour revoir le consentement : effacez la clé vetocrm_cookie_consent dans le stockage local du site, puis rechargez la page — ou contactez-nous.",
        ],
      },
      {
        id: "other",
        title: "5. Autres technologies",
        paragraphs: [
          "Nous pouvons utiliser le stockage local pour la langue et le consentement. Nous n’utilisons pas de Flash LSO ni d’outils de session-replay (ex. FullStory) aujourd’hui.",
          "Les e-mails transactionnels peuvent inclure une mesure d’ouverture/clic pour la fiabilité d’envoi.",
        ],
      },
      {
        id: "duration",
        title: "6. Durée",
        paragraphs: [
          "Les cookies de session expirent à la fermeture du navigateur. Les cookies de préférence persistent en général jusqu’à 12 mois sauf renouvellement. Les identifiants analytics suivent la rétention du prestataire lorsqu’ils sont activés.",
        ],
      },
      {
        id: "changes",
        title: "7. Modifications",
        paragraphs: [
          "Nous pouvons mettre à jour cette politique. Consultez la date de mise à jour. Les changements matériels peuvent être signalés dans la bannière ou la Politique de confidentialité.",
        ],
      },
      {
        id: "contact",
        title: "8. Contact",
        paragraphs: [`Questions : ${E.privacyEmail}. Pour les usages des données : Politique de confidentialité.`],
      },
      {
        id: "attribution",
        title: "9. Attribution du modèle",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  refund: {
    title: "Politique de remboursement et d’annulation",
    metaDescription:
      "Annulation et remboursements des abonnements VetoCrm via Stripe et les stores — essais, renouvellements et rétrogradations.",
    lastUpdated: UPDATED,
    intro: `Cette politique complète les Conditions d’utilisation et explique l’annulation et les remboursements des abonnements ${E.brand}, y compris via Stripe et les stores.`,
    sections: [
      {
        id: "cancel",
        title: "1. Annulation",
        paragraphs: [
          `Vous pouvez annuler un abonnement payant à tout moment depuis la facturation/paramètres ou en contactant ${E.supportEmail}.`,
          "Sauf indication contraire, l’annulation prend effet à la fin de la période payée en cours ; vous conservez l’accès payant jusqu’à cette date.",
          "Une formule gratuite ou des fonctionnalités réduites peuvent s’appliquer ensuite selon les quotas.",
        ],
      },
      {
        id: "refunds",
        title: "2. Remboursements (Stripe / web)",
        paragraphs: [
          "En principe, les périodes de facturation commencées ne sont pas remboursables au prorata.",
          "À titre commercial, un remboursement intégral peut être accordé dans les 14 jours suivant le premier paiement d’un abonnement annuel si le compte n’a pas substantiellement utilisé le Service (au cas par cas).",
          `Demandes : ${E.contactEmail} avec e-mail du compte et preuve de paiement. Les remboursements Stripe apparaissent selon les délais bancaires (souvent 5–10 jours ouvrés).`,
        ],
      },
      {
        id: "stores",
        title: "3. App Store / Google Play",
        paragraphs: [
          "Si l’abonnement a été souscrit via Apple ou Google, l’annulation et les remboursements sont principalement gérés par le store. VetoCrm ne peut pas toujours rembourser un achat in-app directement.",
        ],
      },
      {
        id: "trials",
        title: "4. Essais et formules gratuites",
        paragraphs: [
          "Les essais gratuits, s’ils sont proposés, se convertissent en abonnement payant sauf annulation avant la fin de l’essai. Les formules gratuites ne sont pas remboursables.",
        ],
      },
      {
        id: "chargebacks",
        title: "5. Contestations de paiement",
        paragraphs: [
          "Avant un chargeback bancaire, contactez le support pour une résolution amiable. Les litiges abusifs peuvent entraîner une suspension de compte.",
        ],
      },
      {
        id: "contact",
        title: "6. Contact facturation",
        paragraphs: [`${E.supportEmail} — ${E.website}`],
      },
    ],
  },

  disclosure: {
    title: "Divulgation",
    metaDescription:
      "Divulgations VetoCrm — avertissement professionnel, transparence publicitaire, partenariats et liens d’affiliation.",
    lastUpdated: UPDATED,
    intro: `Cette page précise les limites importantes et les pratiques de transparence de ${E.brand}. Elle complète les Conditions d’utilisation, la Politique de confidentialité et les Mentions légales.`,
    sections: [
      {
        id: "professional",
        title: "1. Avertissement professionnel / médical",
        paragraphs: [
          `${E.brand} est un logiciel d’organisation de la pratique vétérinaire (CRM, planning, dossiers, stock, etc.). Ce n’est pas un dispositif médical, il ne fournit pas de conseil vétérinaire et ne diagnostique, ne traite ni ne prescrit.`,
          "Les vétérinaires et le personnel de clinique restent seuls responsables des décisions cliniques, prescriptions, bien-être animal et obligations réglementaires.",
          "Le contenu du site marketing et du blog (« Monde Veto ») est informatif et éducatif. Il ne remplace pas une consultation professionnelle.",
        ],
      },
      {
        id: "results",
        title: "2. Résultats et témoignages",
        paragraphs: [
          "Exemples, captures d’écran, études de cas ou témoignages décrivent des expériences individuelles. Les résultats varient selon la clinique et l’usage. Les performances passées ne garantissent pas les résultats futurs.",
        ],
      },
      {
        id: "advertising",
        title: "3. Publicité et marketing",
        paragraphs: [
          "Nous pouvons promouvoir VetoCrm via le site, e-mail, réseaux sociaux, Product Hunt, recherche ou publicités payantes (ex. Meta). Les publicités sont étiquetées lorsque les plateformes l’exigent.",
          "Si un contenu inclut un partenariat payant, un lien d’affiliation ou un placement sponsorisé, nous divulguerons clairement cette relation matérielle (ex. « Sponsorisé », « Partenaire », « Affiliation »).",
        ],
      },
      {
        id: "affiliates",
        title: "4. Affiliation et parrainage",
        paragraphs: [
          "Si nous proposons des programmes de parrainage ou d’affiliation, les participants peuvent percevoir une commission ou un crédit lorsqu’un abonnement est souscrit via leur lien. Le prix client final n’est pas augmenté pour cette seule raison, sauf mention contraire.",
        ],
      },
      {
        id: "third-party",
        title: "5. Outils et marques tiers",
        paragraphs: [
          "Les mentions de Stripe, Supabase, Vercel, Apple, Google ou autres marques sont uniquement descriptives. Nous ne sommes pas affiliés à ces sociétés sauf mention expresse. Leurs marques leur appartiennent.",
        ],
      },
      {
        id: "ai",
        title: "6. IA et contenu automatisé",
        paragraphs: [
          "Nous pouvons utiliser des outils logiciels (y compris de rédaction assistée par IA) pour des textes marketing ou d’interface. Les données cliniques que vous saisissez restent traitées selon la Politique de confidentialité et les instructions de votre clinique ; nous ne les vendons pas pour entraîner des modèles d’IA publics.",
        ],
      },
      {
        id: "contact",
        title: "7. Contact",
        paragraphs: [
          `Questions sur cette divulgation : ${E.contactEmail}`,
          `Privacy : ${E.privacyEmail}`,
          `Site : ${E.website}`,
        ],
      },
    ],
  },
};
