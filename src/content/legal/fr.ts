import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "11 août 2026";

export const legalFr: LegalBundle = {
  privacy: {
    title: "Politique de confidentialité",
    metaDescription:
      "Politique de confidentialité VetoCrm — traitement des données personnelles (RGPD), paiements Stripe, sous-traitance et droits des utilisateurs.",
    lastUpdated: UPDATED,
    intro: `La présente politique décrit comment ${E.brand} (« nous », « notre ») collecte, utilise, conserve et protège les données personnelles dans le cadre de la fourniture de son logiciel SaaS de gestion pour cliniques vétérinaires, accessible via ${E.website} et applications associées. Elle est conçue pour répondre aux exigences du Règlement (UE) 2016/679 (RGPD), de la réglementation marocaine applicable, ainsi qu’aux attentes de Stripe et des plateformes de distribution d’applications (App Store / Google Play).`,
    sections: [
      {
        id: "roles",
        title: "1. Rôles : responsable de traitement et sous-traitant",
        paragraphs: [
          `${E.brand} agit selon deux rôles distincts :`,
        ],
        bullets: [
          "Responsable de traitement pour les données de compte, d’abonnement, de facturation, de support et d’usage de la plateforme (administrateurs, assistants, super-admins).",
          `Sous-traitant pour les données de clients, animaux, dossiers médicaux, rendez-vous et documents saisis par une clinique dans son espace : la clinique (organisation) est responsable de traitement de ces données ; ${E.brand} les traite uniquement pour fournir le service, selon les instructions de la clinique.`,
        ],
      },
      {
        id: "controller",
        title: "2. Identité du responsable / éditeur",
        paragraphs: [
          `Éditeur du service : ${E.companyFormalName} (marque ${E.brand}).`,
          `Site : ${E.website}`,
          `Contact général : ${E.contactEmail}`,
          `Délégué / contact privacy : ${E.privacyEmail}`,
          `Adresse de correspondance : ${E.address}`,
          `LinkedIn : ${E.linkedin}`,
          `Instagram : ${E.instagram}`,
          `Les mentions d’identification de l’éditeur sont publiées sur la page Mentions légales.`,
        ],
      },
      {
        id: "data",
        title: "3. Catégories de données traitées",
        paragraphs: ["Selon votre usage, nous pouvons traiter :"],
        bullets: [
          "Données d’identité et de compte : nom, e-mail, mot de passe (hashé), téléphone, rôle, langue.",
          "Données de clinique / organisation : nom, adresse, paramètres, code d’invitation, membres de l’équipe.",
          "Données professionnelles de la clinique (en tant que sous-traitant) : clients propriétaires, animaux, consultations, vaccinations, antiparasites, prescriptions, fermes, stock, comptabilité interne, fichiers et pièces jointes.",
          "Données de paiement et d’abonnement : identifiants client Stripe, plan, statut, historique de facturation (nous ne stockons pas les numéros complets de carte bancaire).",
          "Données techniques : journaux d’accès, adresse IP, type d’appareil / navigateur, cookies et identifiants similaires, métriques d’usage pour la sécurité et l’amélioration du service.",
          "Communications : e-mails transactionnels (confirmation, reset mot de passe, invitations) et échanges support.",
        ],
      },
      {
        id: "purposes",
        title: "4. Finalités et bases légales (RGPD)",
        paragraphs: ["Nous traitons les données pour les finalités suivantes :"],
        bullets: [
          "Exécution du contrat : création et gestion du compte, fourniture du CRM, authentification, synchronisation multi-appareils, support (art. 6.1.b RGPD).",
          "Intérêt légitime : sécurité, prévention de la fraude, amélioration du produit, statistiques agrégées (art. 6.1.f), sous réserve de vos droits.",
          "Obligation légale : facturation, conservation comptable, réponses aux autorités compétentes (art. 6.1.c).",
          "Consentement : cookies non essentiels, communications marketing le cas échéant (art. 6.1.a) — retirables à tout moment.",
        ],
      },
      {
        id: "payments",
        title: "5. Paiements (Stripe)",
        paragraphs: [
          "Les paiements d’abonnement sont traités par Stripe, Inc. / Stripe Payments Europe (selon votre localisation). Les données de carte sont collectées directement par Stripe via des pages ou composants sécurisés ; VetoCrm ne reçoit et ne conserve pas les données complètes de carte (PAN/CVC).",
          "Stripe agit en qualité de prestataire de paiement indépendant ; sa politique de confidentialité s’applique au traitement des données de paiement : https://stripe.com/privacy",
          "Nous conservons les métadonnées nécessaires à la gestion de l’abonnement (customer ID, subscription ID, statut, montants, devises MAD/EUR/USD).",
        ],
      },
      {
        id: "processors",
        title: "6. Destinataires et sous-traitants",
        paragraphs: [
          "Accès limité aux personnels autorisés de VetoCrm (support, opérations, super-admin) sous obligation de confidentialité.",
          "Sous-traitants techniques typiques :",
        ],
        bullets: [
          "Supabase — hébergement base de données, authentification, stockage de fichiers.",
          "Stripe — paiements et facturation d’abonnement.",
          "Prestataires d’envoi d’e-mails / connecteurs (ex. envoi transactionnel Gmail / passerelles) pour les e-mails d’authentification et de service.",
          "Fournisseurs d’infrastructure cloud sous-jacents aux services ci-dessus.",
        ],
      },
      {
        id: "transfers",
        title: "7. Transferts internationaux",
        paragraphs: [
          "Selon la configuration d’hébergement et des prestataires, des données peuvent être traitées hors de votre pays (y compris hors EEE). Dans ce cas, nous nous appuyons sur des garanties appropriées (clauses contractuelles types de la Commission européenne, décisions d’adéquation, ou mesures équivalentes) et des mesures de sécurité techniques.",
          "Pour les cliniques situées dans l’UE/EEE, un accord de sous-traitance (DPA) peut être fourni sur demande via privacy@vetocrm.com.",
        ],
      },
      {
        id: "retention",
        title: "8. Durées de conservation",
        bullets: [
          "Compte et données d’organisation : pendant la durée du contrat, puis suppression ou anonymisation dans un délai raisonnable après clôture (sauf obligation légale).",
          "Données de facturation : durée légale de conservation comptable applicable.",
          "Journaux de sécurité : durée limitée nécessaire à la détection d’incidents.",
          "Cookies : selon leur type (voir Politique cookies).",
        ],
      },
      {
        id: "security",
        title: "9. Sécurité",
        paragraphs: [
          "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement TLS en transit, contrôle d’accès par rôle, isolation multi-tenant (organisation), hachage des mots de passe, sauvegardes gérées par l’infrastructure, journalisation des accès sensibles.",
          "Aucun système n’étant infaillible, en cas de violation de données susceptible d’engendrer un risque élevé, nous informerons les personnes et autorités concernées conformément au RGPD.",
        ],
      },
      {
        id: "rights",
        title: "10. Vos droits",
        paragraphs: [
          "Selon le RGPD (et droits locaux applicables), vous disposez notamment des droits d’accès, de rectification, d’effacement, de limitation, d’opposition, de portabilité, et du droit d’introduire une réclamation auprès d’une autorité de contrôle (ex. CNIL en France, ou autorité compétente de votre État membre).",
          `Pour exercer vos droits relatifs au compte VetoCrm : ${E.privacyEmail} ou ${E.supportEmail}.`,
          "Pour les données de patients / clients d’une clinique saisies dans le CRM : adressez-vous d’abord à la clinique concernée (responsable de traitement). Nous l’assisterons en tant que sous-traitant.",
        ],
      },
      {
        id: "deletion",
        title: "11. Suppression de compte (App Store / plateformes)",
        paragraphs: [
          "Vous pouvez demander la suppression de votre compte et des données associées depuis les paramètres de l’application / du profil, ou par e-mail à support@vetocrm.com. La suppression entraîne la perte d’accès au service ; certaines données peuvent être conservées temporairement pour obligations légales ou résolution de litiges.",
          "Les administrateurs de clinique peuvent également demander l’export puis la suppression des données de leur organisation.",
        ],
      },
      {
        id: "children",
        title: "12. Mineurs",
        paragraphs: [
          "Le service s’adresse aux professionnels (cliniques vétérinaires). Il n’est pas destiné aux enfants de moins de 16 ans (ou âge de consentement numérique local). Nous ne collectons pas sciemment de données de mineurs à des fins de compte utilisateur.",
        ],
      },
      {
        id: "cookies",
        title: "13. Cookies",
        paragraphs: [
          "Nous utilisons des cookies et technologies similaires pour l’authentification, les préférences (ex. langue), la sécurité et, le cas échéant, la mesure d’audience. Détails : page Cookies.",
        ],
      },
      {
        id: "changes",
        title: "14. Modifications",
        paragraphs: [
          "Nous pouvons mettre à jour cette politique. La date de « Dernière mise à jour » sera révisée. En cas de changement matériel, nous pourrons vous en informer via le service ou par e-mail.",
        ],
      },
      {
        id: "contact",
        title: "15. Contact",
        paragraphs: [
          `Questions privacy : ${E.privacyEmail}`,
          `Support : ${E.supportEmail}`,
          `Site : ${E.website}`,
          `LinkedIn : ${E.linkedin}`,
          `Instagram : ${E.instagram}`,
        ],
      },
    ],
  },

  terms: {
    title: "Conditions générales d’utilisation",
    metaDescription:
      "Conditions d’utilisation VetoCrm — abonnements, paiements Stripe, responsabilités, résiliation et règles d’usage du CRM vétérinaire.",
    lastUpdated: UPDATED,
    intro: `Les présentes Conditions générales d’utilisation (« CGU ») régissent l’accès et l’usage de ${E.brand}, logiciel SaaS destiné aux cliniques et cabinets vétérinaires. En créant un compte ou en utilisant le service, vous acceptez ces CGU.`,
    sections: [
      {
        id: "service",
        title: "1. Objet du service",
        paragraphs: [
          `${E.brand} fournit un outil de gestion (clients, animaux, agenda, consultations, vaccins, stock, fermes, comptabilité selon le plan) en mode cloud multi-utilisateur.`,
          "Le service est fourni « en l’état » dans le cadre d’une obligation de moyens, avec un objectif de disponibilité raisonnable, hors maintenance planifiée ou incidents indépendants de notre contrôle.",
        ],
      },
      {
        id: "eligibility",
        title: "2. Éligibilité et comptes",
        bullets: [
          "Vous déclarez être majeur et habilité à engager la clinique ou organisation pour laquelle le compte est créé.",
          "Vous êtes responsable de l’exactitude des informations fournies et de la confidentialité des identifiants.",
          "L’administrateur d’organisation gère les invitations, rôles et accès de son équipe.",
          "Les comptes démo / test sont fournis à des fins d’évaluation et peuvent être réinitialisés ou limités.",
        ],
      },
      {
        id: "plans",
        title: "3. Abonnements, prix et taxes",
        paragraphs: [
          "Des plans gratuits et payants sont proposés (quotas utilisateurs, stockage, fonctionnalités). Les prix affichés hors taxes peuvent varier selon la devise (MAD, EUR, USD) et le cycle (mensuel / annuel).",
          "Les taxes applicables (TVA ou équivalent) peuvent s’ajouter selon votre localisation et statut fiscal.",
          "Nous pouvons modifier les tarifs avec un préavis raisonnable ; les changements s’appliquent à la période de renouvellement suivante sauf disposition contraire.",
        ],
      },
      {
        id: "stripe",
        title: "4. Paiement via Stripe",
        paragraphs: [
          "Les paiements sont traités par Stripe. En souscrivant un plan payant, vous autorisez le prélèvement des montants dus selon le cycle choisi.",
          "En cas d’échec de paiement, nous pouvons suspendre l’accès aux fonctionnalités payantes après notification.",
          "Les factures / reçus sont accessibles via le portail de facturation ou sur demande support.",
        ],
      },
      {
        id: "cancel",
        title: "5. Résiliation et remboursement",
        paragraphs: [
          "Vous pouvez résilier ou rétrograder votre abonnement à tout moment ; l’effet intervient en fin de période déjà payée, sauf mention contraire sur la page Remboursements.",
          "Voir la Politique de remboursement et d’annulation pour le détail (Stripe, App Store, périodes d’essai).",
        ],
      },
      {
        id: "acceptable",
        title: "6. Usage acceptable",
        paragraphs: ["Il est interdit notamment de :"],
        bullets: [
          "Utiliser le service de façon illégale, frauduleuse ou attentatoire aux droits de tiers.",
          "Tenter d’accéder sans autorisation aux données d’autres organisations.",
          "Surcharger, perturber ou contourner les mesures de sécurité.",
          "Revendre le service sans accord écrit, ou scraper massivement les contenus.",
          "Stocker des contenus illicites (malware, contenus illégaux).",
        ],
      },
      {
        id: "customer-data",
        title: "7. Données de la clinique",
        paragraphs: [
          "Vous conservez tous les droits sur les données que vous saisissez (clients, animaux, dossiers). Vous nous concédez une licence limitée pour les héberger et les traiter afin de fournir le service.",
          "Vous garantissez disposer des bases légales nécessaires (information des personnes, consentements si requis) pour les données de propriétaires d’animaux et dossiers associés.",
          "Nous agissons comme sous-traitant pour ces données ; un DPA peut être conclu sur demande.",
        ],
      },
      {
        id: "ip",
        title: "8. Propriété intellectuelle",
        paragraphs: [
          "Le logiciel, la marque VetoCrm, le design et la documentation restent notre propriété ou celle de nos concédants. Aucune cession de droits n’est consentie hors licence d’usage du service.",
        ],
      },
      {
        id: "liability",
        title: "9. Responsabilité",
        paragraphs: [
          "VetoCrm est un outil d’aide à la gestion : il ne remplace pas le jugement clinique du vétérinaire. Vous restez responsable des décisions médicales, prescriptions et obligations réglementaires de votre profession.",
          "Dans les limites autorisées par la loi, notre responsabilité globale pour un sinistre lié au service est plafonnée aux montants que vous nous avez effectivement payés au cours des 12 mois précédant le fait générateur (ou 100 € / équivalent si plan gratuit).",
          "Nous ne sommes pas responsables des dommages indirects (perte de chiffre d’affaires, perte de données due à un usage incorrect, force majeure, panne d’un tiers).",
        ],
      },
      {
        id: "apps",
        title: "10. Applications mobiles / stores",
        paragraphs: [
          "Si vous téléchargez l’application via Apple App Store ou Google Play, des conditions supplémentaires du store s’appliquent (achats intégrés, gestion des abonnements). En cas de conflit sur la facturation store, les règles du store peuvent prévaloir pour le paiement.",
        ],
      },
      {
        id: "law",
        title: "11. Droit applicable",
        paragraphs: [
          "Sous réserve de dispositions impératives de protection des consommateurs / professionnels de votre pays, les présentes CGU sont régies par le droit marocain. Les tribunaux compétents du ressort de Rabat seront saisis, sauf compétence impérative contraire (notamment UE pour certains litiges B2C).",
        ],
      },
      {
        id: "contact",
        title: "12. Contact",
        paragraphs: [`${E.contactEmail} — ${E.website}`],
      },
    ],
  },

  legal: {
    title: "Mentions légales",
    metaDescription: "Mentions légales VetoCrm — éditeur, hébergeur, contact et informations d’identification.",
    lastUpdated: UPDATED,
    intro: "Informations d’identification de l’éditeur du service VetoCrm, conformément aux obligations d’information des services en ligne.",
    sections: [
      {
        id: "publisher",
        title: "1. Éditeur",
        paragraphs: [
          `Marque / service : ${E.brand}`,
          `Dénomination : ${E.companyFormalName}`,
          `Site : ${E.website}`,
          `Contact : ${E.contactEmail}`,
          `Adresse de correspondance : ${E.address}`,
          `LinkedIn : ${E.linkedin}`,
          `Instagram : ${E.instagram}`,
          `Les coordonnées ci-dessus identifient l’éditeur du service. Toute demande légale ou administrative doit être adressée à ${E.contactEmail}.`,
        ],
      },
      {
        id: "director",
        title: "2. Direction de la publication",
        paragraphs: [
          `Directeur de la publication : ${E.publicationDirector}, joignable via ${E.contactEmail}.`,
        ],
      },
      {
        id: "hosting",
        title: "3. Hébergement",
        paragraphs: [
          `Application (front) : ${E.hostingApp}.`,
          `Données et backend : ${E.hostingData}.`,
          `Pour toute question relative à l’hébergement ou à la localisation des données : ${E.supportEmail}.`,
        ],
      },
      {
        id: "ip",
        title: "4. Propriété intellectuelle",
        paragraphs: [
          "L’ensemble des éléments du site et de l’application (textes, graphismes, logo, logiciels) est protégé. Toute reproduction non autorisée est interdite.",
        ],
      },
      {
        id: "med",
        title: "5. Avertissement professionnel",
        paragraphs: [
          "VetoCrm est un logiciel de gestion destiné aux professionnels vétérinaires. Il ne constitue pas un dispositif médical au sens réglementaire et ne se substitue pas à l’expertise clinique.",
        ],
      },
    ],
  },

  cookies: {
    title: "Politique cookies",
    metaDescription: "Politique cookies VetoCrm — cookies essentiels, préférences, mesure d’audience et gestion du consentement.",
    lastUpdated: UPDATED,
    intro: `Cette page explique comment ${E.brand} utilise des cookies et technologies similaires lorsque vous visitez ${E.website} ou utilisez l’application.`,
    sections: [
      {
        id: "what",
        title: "1. Qu’est-ce qu’un cookie ?",
        paragraphs: [
          "Un cookie est un petit fichier déposé sur votre terminal. Des technologies similaires (local storage, pixels) peuvent être utilisées pour les mêmes finalités.",
        ],
      },
      {
        id: "types",
        title: "2. Types de cookies utilisés",
        bullets: [
          "Essentiels / techniques : session d’authentification, sécurité CSRF, équilibre de charge — nécessaires au service (pas de consentement requis au sens ePrivacy pour le strictement nécessaire).",
          "Préférences : langue d’interface (ex. vetocrm-lang), état d’UI (ex. barre latérale).",
          "Analytiques (si activés) : mesure d’audience agrégée pour améliorer le produit — soumis à consentement lorsqu’ils ne sont pas strictement nécessaires.",
          "Marketing (si activés ultérieurement) : uniquement avec consentement préalable.",
        ],
      },
      {
        id: "manage",
        title: "3. Gérer vos choix",
        paragraphs: [
          "Vous pouvez supprimer ou bloquer les cookies via les paramètres de votre navigateur. Le refus des cookies essentiels peut empêcher la connexion au service.",
          "Lorsque un bandeau de consentement est affiché, vous pouvez accepter, refuser ou personnaliser les cookies non essentiels.",
        ],
      },
      {
        id: "duration",
        title: "4. Durée",
        paragraphs: [
          "Les cookies de session expirent à la fermeture du navigateur. Les cookies persistants ont une durée limitée (par ex. préférences langue jusqu’à 1 an, cookies sidebar jusqu’à 7 jours), sauf renouvellement.",
        ],
      },
      {
        id: "third",
        title: "5. Tiers",
        paragraphs: [
          "Stripe peut déposer des cookies sur les pages de paiement. Consultez https://stripe.com/cookies",
          "Les prestataires d’auth / hébergement peuvent utiliser des cookies techniques pour sécuriser l’accès.",
        ],
      },
      {
        id: "contact",
        title: "6. Contact",
        paragraphs: [`${E.privacyEmail}`],
      },
    ],
  },

  refund: {
    title: "Politique de remboursement et d’annulation",
    metaDescription:
      "Annulation d’abonnement, remboursements Stripe et App Store pour VetoCrm — essais, renouvellements et rétrogradations.",
    lastUpdated: UPDATED,
    intro: `Cette politique complète les CGU et précise les règles d’annulation et de remboursement des abonnements ${E.brand}, y compris via Stripe et les magasins d’applications.`,
    sections: [
      {
        id: "cancel",
        title: "1. Annulation",
        paragraphs: [
          "Vous pouvez annuler un abonnement payant à tout moment depuis l’espace facturation / paramètres, ou en contactant support@vetocrm.com.",
          "Sauf disposition contraire, l’annulation prend effet à la fin de la période de facturation en cours : vous conservez l’accès payant jusqu’à cette date.",
          "Le plan gratuit ou les fonctionnalités réduites peuvent s’appliquer ensuite selon les quotas.",
        ],
      },
      {
        id: "refunds",
        title: "2. Remboursements (Stripe / web)",
        paragraphs: [
          "En principe, les périodes déjà entamées ne sont pas remboursables au prorata.",
          "À titre commercial, un remboursement intégral peut être accordé dans les 14 jours suivant le premier paiement d’un abonnement annuel si le compte n’a pas fait un usage substantiel du service (évaluation au cas par cas).",
          "Les demandes : support@vetocrm.com avec l’e-mail du compte et la preuve de paiement. Les remboursements Stripe apparaissent selon les délais de votre banque (généralement 5–10 jours ouvrés).",
        ],
      },
      {
        id: "stores",
        title: "3. Achats App Store / Google Play",
        paragraphs: [
          "Si l’abonnement a été souscrit via Apple ou Google, la gestion de l’annulation et des remboursements relève principalement du store (Réglages → Abonnements sur iOS ; Google Play → Abonnements).",
          "VetoCrm ne peut pas toujours rembourser directement un achat in-app ; nous pouvons vous orienter vers la procédure Apple/Google.",
        ],
      },
      {
        id: "trials",
        title: "4. Essais et plans gratuits",
        paragraphs: [
          "Les essais gratuits, s’ils sont proposés, se convertissent en abonnement payant sauf annulation avant la fin de l’essai. Les plans gratuits n’ouvrent pas droit à remboursement.",
        ],
      },
      {
        id: "chargebacks",
        title: "5. Contestation de paiement",
        paragraphs: [
          "Avant un chargeback bancaire, contactez le support : nous chercherons une résolution amiable. Les abus de contestation peuvent entraîner la suspension du compte.",
        ],
      },
      {
        id: "contact",
        title: "6. Contact facturation",
        paragraphs: [`${E.supportEmail} — ${E.website}`],
      },
    ],
  },
};
