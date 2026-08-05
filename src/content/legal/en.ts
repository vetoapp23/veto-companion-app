import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "August 5, 2026";

export const legalEn: LegalBundle = {
  privacy: {
    title: "Privacy Policy",
    metaDescription:
      "VetoCrm Privacy Policy — personal data processing (GDPR), Stripe payments, subprocessors and user rights.",
    lastUpdated: UPDATED,
    intro: `This Policy explains how ${E.brand} (“we”, “us”) collects, uses, stores and protects personal data when providing our veterinary practice management SaaS at ${E.website} and related apps. It is designed to meet Regulation (EU) 2016/679 (GDPR), applicable Moroccan law, and the expectations of Stripe and app stores (App Store / Google Play).`,
    sections: [
      {
        id: "roles",
        title: "1. Roles: controller and processor",
        paragraphs: [`${E.brand} acts in two distinct roles:`],
        bullets: [
          "Controller for account, subscription, billing, support and platform-usage data (admins, assistants, super-admins).",
          `Processor for client, animal, medical-record, appointment and document data entered by a clinic: the clinic (organization) is the controller; ${E.brand} processes that data only to provide the Service under the clinic’s instructions.`,
        ],
      },
      {
        id: "controller",
        title: "2. Publisher / controller identity",
        paragraphs: [
          `Service publisher: ${E.companyFormalName} (brand ${E.brand}).`,
          `Website: ${E.website}`,
          `General contact: ${E.contactEmail}`,
          `Privacy contact: ${E.privacyEmail}`,
          `Correspondence address: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
          "Full legal notice details (legal form, registration number, registered office) appear on the Legal Notice page and will be updated once the commercial entity is finalized.",
        ],
      },
      {
        id: "data",
        title: "3. Categories of data",
        paragraphs: ["Depending on your use, we may process:"],
        bullets: [
          "Identity and account data: name, email, password (hashed), phone, role, language.",
          "Clinic / organization data: name, address, settings, invite codes, team members.",
          "Clinic professional data (as processor): pet owners, animals, consultations, vaccinations, antiparasitics, prescriptions, farms, stock, internal accounting, files and attachments.",
          "Payment and subscription data: Stripe customer IDs, plan, status, billing history (we do not store full card numbers).",
          "Technical data: access logs, IP address, device/browser type, cookies and similar IDs, usage metrics for security and product improvement.",
          "Communications: transactional emails (confirm, reset, invites) and support threads.",
        ],
      },
      {
        id: "purposes",
        title: "4. Purposes and legal bases (GDPR)",
        bullets: [
          "Contract performance: account creation, CRM delivery, authentication, multi-device sync, support (Art. 6(1)(b)).",
          "Legitimate interests: security, fraud prevention, product improvement, aggregated analytics (Art. 6(1)(f)), subject to your rights.",
          "Legal obligation: invoicing, accounting retention, responses to competent authorities (Art. 6(1)(c)).",
          "Consent: non-essential cookies and marketing (if any) (Art. 6(1)(a)) — withdrawable at any time.",
        ],
      },
      {
        id: "payments",
        title: "5. Payments (Stripe)",
        paragraphs: [
          "Subscription payments are processed by Stripe. Card data is collected directly by Stripe through secure pages/components; VetoCrm does not receive or store full PAN/CVC.",
          "Stripe’s privacy policy applies to payment data: https://stripe.com/privacy",
          "We keep subscription metadata needed to run billing (customer ID, subscription ID, status, amounts, MAD/EUR/USD).",
        ],
      },
      {
        id: "processors",
        title: "6. Recipients and subprocessors",
        paragraphs: [
          "Access is limited to authorized VetoCrm staff (support, operations, super-admin) under confidentiality duties.",
          "Typical technical subprocessors:",
        ],
        bullets: [
          "Supabase — database, authentication, file storage.",
          "Stripe — payments and subscription billing.",
          "Email delivery providers / connectors for transactional auth and service emails.",
          "Underlying cloud infrastructure providers used by the above.",
        ],
      },
      {
        id: "transfers",
        title: "7. International transfers",
        paragraphs: [
          "Depending on hosting and vendors, data may be processed outside your country (including outside the EEA). We rely on appropriate safeguards (EU Standard Contractual Clauses, adequacy decisions, or equivalent) plus technical security measures.",
          "For clinics in the EU/EEA, a Data Processing Agreement (DPA) is available on request at privacy@vetocrm.com.",
        ],
      },
      {
        id: "retention",
        title: "8. Retention",
        bullets: [
          "Account and organization data: for the contract term, then deletion or anonymization within a reasonable period after closure (unless legally required longer).",
          "Billing data: applicable statutory accounting retention.",
          "Security logs: limited period needed for incident detection.",
          "Cookies: according to type (see Cookie Policy).",
        ],
      },
      {
        id: "security",
        title: "9. Security",
        paragraphs: [
          "We apply appropriate technical and organizational measures: TLS in transit, role-based access, multi-tenant organization isolation, password hashing, infrastructure backups, logging of sensitive access.",
          "No system is perfect; if a personal-data breach is likely to result in a high risk, we will notify individuals and authorities as required by the GDPR.",
        ],
      },
      {
        id: "rights",
        title: "10. Your rights",
        paragraphs: [
          "Under the GDPR (and local law), you may have rights of access, rectification, erasure, restriction, objection, portability, and the right to lodge a complaint with a supervisory authority (e.g. CNIL in France or your local DPA).",
          `To exercise rights about your VetoCrm account: ${E.privacyEmail} or ${E.supportEmail}.`,
          "For pet-owner / patient data entered in a clinic workspace: contact the clinic first (controller). We will assist as processor.",
        ],
      },
      {
        id: "deletion",
        title: "11. Account deletion (App Store / platforms)",
        paragraphs: [
          "You may request deletion of your account and related data from app/profile settings or by emailing support@vetocrm.com. Deletion ends access to the Service; some data may be kept temporarily for legal obligations or dispute resolution.",
          "Clinic admins may also request export then deletion of their organization data.",
        ],
      },
      {
        id: "children",
        title: "12. Children",
        paragraphs: [
          "The Service is for veterinary professionals. It is not directed at children under 16 (or the local digital-consent age). We do not knowingly collect children’s data for user accounts.",
        ],
      },
      {
        id: "cookies",
        title: "13. Cookies",
        paragraphs: [
          "We use cookies and similar technologies for authentication, preferences (e.g. language), security and, where enabled, analytics. Details: Cookie Policy.",
        ],
      },
      {
        id: "changes",
        title: "14. Changes",
        paragraphs: [
          "We may update this Policy. The “Last updated” date will change. For material changes we may notify you in-product or by email.",
        ],
      },
      {
        id: "contact",
        title: "15. Contact",
        paragraphs: [
          `Privacy: ${E.privacyEmail}`,
          `Support: ${E.supportEmail}`,
          `Website: ${E.website}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
        ],
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    metaDescription:
      "VetoCrm Terms of Service — subscriptions, Stripe payments, liability, termination and acceptable use.",
    lastUpdated: UPDATED,
    intro: `These Terms of Service (“Terms”) govern access to and use of ${E.brand}, a SaaS product for veterinary clinics. By creating an account or using the Service, you agree to these Terms.`,
    sections: [
      {
        id: "service",
        title: "1. The Service",
        paragraphs: [
          `${E.brand} provides cloud practice-management tools (clients, animals, scheduling, consultations, vaccines, stock, farms, accounting depending on plan) for multi-user teams.`,
          "The Service is provided on a commercially reasonable efforts basis, excluding planned maintenance or incidents beyond our reasonable control.",
        ],
      },
      {
        id: "eligibility",
        title: "2. Eligibility and accounts",
        bullets: [
          "You confirm you are of legal age and authorized to bind the clinic/organization for which the account is created.",
          "You are responsible for accurate information and for keeping credentials confidential.",
          "Organization admins manage invites, roles and team access.",
          "Demo/test accounts are for evaluation and may be reset or limited.",
        ],
      },
      {
        id: "plans",
        title: "3. Plans, pricing and taxes",
        paragraphs: [
          "Free and paid plans are offered (user quotas, storage, features). Listed prices may be exclusive of tax and vary by currency (MAD, EUR, USD) and billing cycle.",
          "Applicable taxes (VAT or equivalent) may be added based on your location and tax status.",
          "We may change pricing with reasonable notice; changes apply to the next renewal period unless stated otherwise.",
        ],
      },
      {
        id: "stripe",
        title: "4. Payment via Stripe",
        paragraphs: [
          "Payments are processed by Stripe. By subscribing to a paid plan you authorize recurring charges for the selected cycle.",
          "If payment fails, we may suspend paid features after notice.",
          "Invoices/receipts are available via the billing portal or on support request.",
        ],
      },
      {
        id: "cancel",
        title: "5. Cancellation and refunds",
        paragraphs: [
          "You may cancel or downgrade anytime; effect is generally at the end of the prepaid period, subject to the Refund Policy.",
          "See the Refund & Cancellation Policy for Stripe, App Store and trial details.",
        ],
      },
      {
        id: "acceptable",
        title: "6. Acceptable use",
        paragraphs: ["You must not:"],
        bullets: [
          "Use the Service unlawfully or in violation of third-party rights.",
          "Access other organizations’ data without authorization.",
          "Disrupt, overload or bypass security controls.",
          "Resell the Service without written consent, or mass-scrape content.",
          "Store illegal content (malware, unlawful material).",
        ],
      },
      {
        id: "customer-data",
        title: "7. Clinic data",
        paragraphs: [
          "You retain all rights in data you enter. You grant us a limited license to host and process it to provide the Service.",
          "You warrant you have a lawful basis to process pet-owner and related records.",
          "We act as processor for that data; a DPA is available on request.",
        ],
      },
      {
        id: "ip",
        title: "8. Intellectual property",
        paragraphs: [
          "The software, VetoCrm brand, design and documentation remain our property or that of our licensors. No IP assignment is granted beyond the license to use the Service.",
        ],
      },
      {
        id: "liability",
        title: "9. Liability",
        paragraphs: [
          "VetoCrm is a management aid and does not replace veterinary clinical judgment. You remain responsible for medical decisions, prescriptions and professional regulatory duties.",
          "To the fullest extent permitted by law, our aggregate liability for claims relating to the Service is capped at the amounts you actually paid us in the 12 months before the claim (or EUR 100 / equivalent on a free plan).",
          "We are not liable for indirect damages (lost profits, data loss from misuse, force majeure, third-party outages).",
        ],
      },
      {
        id: "apps",
        title: "10. Mobile apps / stores",
        paragraphs: [
          "If you download via Apple App Store or Google Play, additional store terms apply. For store-billed subscriptions, the store’s billing/refund rules may prevail for payment disputes.",
        ],
      },
      {
        id: "law",
        title: "11. Governing law",
        paragraphs: [
          "Subject to mandatory consumer/professional protections in your country, these Terms are governed by Moroccan law. Courts in the Rabat jurisdiction shall have competence, unless mandatory rules (including certain EU B2C rules) require otherwise.",
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
    title: "Legal Notice",
    metaDescription: "VetoCrm legal notice — publisher, hosting, contact and identification details.",
    lastUpdated: UPDATED,
    intro: "Publisher identification for the VetoCrm online service.",
    sections: [
      {
        id: "publisher",
        title: "1. Publisher",
        paragraphs: [
          `Brand / service: ${E.brand}`,
          `Name: ${E.companyFormalName}`,
          `Website: ${E.website}`,
          `Contact: ${E.contactEmail}`,
          `Correspondence address: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
          "Legal form, share capital, company registration (RCS/ICE/SIRET): to be completed once the publishing company is fully registered. Until then, the contact above applies for legal requests.",
        ],
      },
      {
        id: "director",
        title: "2. Publication director",
        paragraphs: [
          "Publication director: the legal representative of the publisher, reachable at contact@vetocrm.com.",
        ],
      },
      {
        id: "hosting",
        title: "3. Hosting",
        paragraphs: [
          "Application and data: cloud infrastructure including Supabase (database, auth, storage) and front-end hosting/CDN associated with vetocrm.com.",
          "For hosting region details, contact support@vetocrm.com.",
        ],
      },
      {
        id: "ip",
        title: "4. Intellectual property",
        paragraphs: [
          "Site and app materials (text, graphics, logo, software) are protected. Unauthorized reproduction is prohibited.",
        ],
      },
      {
        id: "med",
        title: "5. Professional disclaimer",
        paragraphs: [
          "VetoCrm is practice-management software for veterinary professionals. It is not a medical device and does not replace clinical expertise.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    metaDescription: "VetoCrm Cookie Policy — essential cookies, preferences, analytics and consent.",
    lastUpdated: UPDATED,
    intro: `This page explains how ${E.brand} uses cookies and similar technologies on ${E.website} and in the app.`,
    sections: [
      {
        id: "what",
        title: "1. What is a cookie?",
        paragraphs: [
          "A cookie is a small file stored on your device. Similar technologies (local storage, pixels) may be used for the same purposes.",
        ],
      },
      {
        id: "types",
        title: "2. Cookie types we use",
        bullets: [
          "Essential / technical: auth session, CSRF security, load balancing — required for the Service.",
          "Preferences: UI language (e.g. vetocrm-lang), UI state (e.g. sidebar).",
          "Analytics (if enabled): aggregated audience measurement — consent where not strictly necessary.",
          "Marketing (if enabled later): only with prior consent.",
        ],
      },
      {
        id: "manage",
        title: "3. Managing choices",
        paragraphs: [
          "You can delete or block cookies in your browser. Blocking essential cookies may prevent sign-in.",
          "Where a consent banner is shown, you may accept, refuse or customize non-essential cookies.",
        ],
      },
      {
        id: "duration",
        title: "4. Duration",
        paragraphs: [
          "Session cookies expire when the browser closes. Persistent cookies have limited lifetimes (e.g. language preference up to 1 year; sidebar cookie up to 7 days) unless renewed.",
        ],
      },
      {
        id: "third",
        title: "5. Third parties",
        paragraphs: [
          "Stripe may set cookies on payment pages: https://stripe.com/cookies",
          "Auth/hosting providers may use technical cookies to secure access.",
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
    title: "Refund & Cancellation Policy",
    metaDescription:
      "VetoCrm subscription cancellation and refunds via Stripe and App Store — trials, renewals and downgrades.",
    lastUpdated: UPDATED,
    intro: `This Policy complements the Terms and explains cancellation and refunds for ${E.brand} subscriptions, including Stripe and app stores.`,
    sections: [
      {
        id: "cancel",
        title: "1. Cancellation",
        paragraphs: [
          "You may cancel a paid subscription anytime from billing/settings or by contacting support@vetocrm.com.",
          "Unless stated otherwise, cancellation takes effect at the end of the current paid period; you keep paid access until then.",
          "A free plan or reduced features may apply afterwards according to quotas.",
        ],
      },
      {
        id: "refunds",
        title: "2. Refunds (Stripe / web)",
        paragraphs: [
          "As a rule, started billing periods are non-refundable on a pro-rata basis.",
          "As a goodwill gesture, a full refund may be granted within 14 days of the first payment on an annual plan if the account has not substantially used the Service (case-by-case).",
          "Requests: support@vetocrm.com with account email and payment proof. Stripe refunds appear per your bank’s timeline (often 5–10 business days).",
        ],
      },
      {
        id: "stores",
        title: "3. App Store / Google Play purchases",
        paragraphs: [
          "If subscribed via Apple or Google, cancellation and refunds are primarily handled by the store (iOS Settings → Subscriptions; Google Play → Subscriptions).",
          "VetoCrm cannot always refund an in-app purchase directly; we can guide you to Apple/Google procedures.",
        ],
      },
      {
        id: "trials",
        title: "4. Trials and free plans",
        paragraphs: [
          "Free trials, if offered, convert to paid subscriptions unless cancelled before the trial ends. Free plans are not refundable.",
        ],
      },
      {
        id: "chargebacks",
        title: "5. Payment disputes",
        paragraphs: [
          "Before filing a bank chargeback, contact support so we can resolve amicably. Abusive disputes may lead to account suspension.",
        ],
      },
      {
        id: "contact",
        title: "6. Billing contact",
        paragraphs: [`${E.supportEmail} — ${E.website}`],
      },
    ],
  },
};
