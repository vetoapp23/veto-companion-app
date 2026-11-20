import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "November 20, 2026";

const ATTRIBUTION =
  "Adapted from attorney-drafted templates released by General Legal, PC under CC0 1.0. Templates are for general reference only and do not constitute legal advice or create an attorney-client relationship.";

export const legalEn: LegalBundle = {
  privacy: {
    title: "Privacy Policy",
    metaDescription:
      "VetoCrm Privacy Policy — how we process personal data for veterinary practice management SaaS (GDPR, Stripe, subprocessors, your rights).",
    lastUpdated: UPDATED,
    intro: `${E.companyFormalName} (“${E.brand}”, “we”, “us” or “our”) provides cloud veterinary practice-management software (clients, pets, appointments, medical records, vaccines, inventory, farms and related modules) at ${E.website} and related apps (the “Service”). This Privacy Policy describes how we process personal information collected through the Service, our marketing activities, and other activities described here. European users: see the Europe / GDPR section below for additional information.`,
    sections: [
      {
        id: "roles",
        title: "1. Roles: controller and processor",
        paragraphs: [`${E.brand} acts in two distinct roles:`],
        bullets: [
          "Controller for account, subscription, billing, support, marketing (where consented) and platform-usage data about clinic staff (admins, assistants, super-admins).",
          `Processor for client, animal, medical-record, appointment, prescription, farm, stock and document data entered by a clinic: the clinic (organization) is the controller; ${E.brand} processes that data only to provide the Service under the clinic’s instructions.`,
        ],
      },
      {
        id: "controller",
        title: "2. Who we are",
        paragraphs: [
          `Publisher / service provider: ${E.companyFormalName} (brand ${E.brand}).`,
          `Website: ${E.website}`,
          `Contact / privacy: ${E.privacyEmail}`,
          `Correspondence: ${E.address}`,
          `LinkedIn: ${E.linkedin} · Instagram: ${E.instagram}`,
          "Publisher identification details are also on our Legal Notice page.",
        ],
      },
      {
        id: "collect",
        title: "3. Personal information we collect",
        paragraphs: ["Depending on how you use the Service, we may process:"],
        bullets: [
          "Contact and account data: name, email, phone, role, language, hashed password.",
          "Clinic / organization data: clinic name, address, settings, invite codes, team members.",
          "Clinic professional content (as processor): pet owners, animals, consultations, vaccinations, antiparasitics, prescriptions, farms, stock, internal accounting, photos and attachments.",
          "Transactional / payment metadata: Stripe customer and subscription IDs, plan, status, billing history (we do not store full card numbers or CVC).",
          "Communications: support messages and transactional emails (confirm, reset, invites).",
          "Device and online activity data: IP address, browser/device type, pages viewed, approximate location (city/region), security and usage logs.",
          "Cookie and similar IDs: see our Cookie Policy.",
        ],
      },
      {
        id: "sources",
        title: "4. Sources",
        bullets: [
          "You and your clinic team (account forms, CRM entries, uploads).",
          "Automatic collection when you use the Service (logs, cookies, analytics if consented).",
          "Service providers acting for us (e.g. payment, hosting, email delivery).",
          "Business transaction partners in connection with a merger, financing or similar event, if applicable.",
        ],
      },
      {
        id: "use",
        title: "5. How we use personal information",
        bullets: [
          "Provide, secure and operate the Service (accounts, multi-tenant isolation, sync, support).",
          "Process subscriptions and invoices via Stripe.",
          "Personalize preferences (language, UI) and improve the product with aggregated analytics.",
          "Send service announcements, security alerts and (only with consent where required) marketing.",
          "Detect fraud, abuse and security incidents; comply with law.",
          "As processor: host and process clinic content solely to deliver the Service to that clinic.",
        ],
      },
      {
        id: "legal-bases",
        title: "6. Legal bases (GDPR / UK GDPR)",
        bullets: [
          "Contract performance (Art. 6(1)(b)): account, CRM delivery, authentication, billing setup.",
          "Legitimate interests (Art. 6(1)(f)): security, fraud prevention, product improvement, aggregated analytics — balanced against your rights.",
          "Legal obligation (Art. 6(1)(c)): invoicing and responses to competent authorities.",
          "Consent (Art. 6(1)(a)): non-essential cookies/analytics and optional marketing — withdrawable anytime.",
        ],
      },
      {
        id: "sharing",
        title: "7. How we share information",
        paragraphs: [
          "We do not sell personal information. We share it only as needed to run the Service:",
        ],
        bullets: [
          "Within your organization (team members with assigned roles).",
          "Service providers / subprocessors under contracts: Supabase (database, auth, file storage); Vercel (app hosting, Analytics and Speed Insights when enabled); Stripe (payments); email delivery providers for transactional mail.",
          "Professional advisors (legal, accounting) under confidentiality.",
          "Authorities when required by law or to protect rights, safety or security.",
          "Successors in a corporate transaction (with appropriate safeguards).",
        ],
      },
      {
        id: "transfers",
        title: "8. International transfers",
        paragraphs: [
          "Depending on vendors, data may be processed outside your country (including outside the EEA/UK). Where required, we rely on appropriate safeguards such as EU Standard Contractual Clauses, adequacy decisions, or equivalent measures, plus technical security.",
          `EU/EEA clinics may request a Data Processing Agreement (DPA) at ${E.contactEmail}.`,
        ],
      },
      {
        id: "retention",
        title: "9. Retention",
        bullets: [
          "Account and organization data: for the contract term, then deletion or anonymization within a reasonable period after closure (unless law requires longer).",
          "Billing records: statutory accounting retention.",
          "Security logs: limited period needed for incident detection.",
          "Cookies: according to type (Cookie Policy).",
        ],
      },
      {
        id: "security",
        title: "10. Security",
        paragraphs: [
          "We apply technical and organizational measures appropriate to the risk: TLS in transit, role-based access, organization isolation, password hashing, backups and access logging.",
          "No system is perfect. If a personal-data breach is likely to result in a high risk to individuals, we will notify affected persons and authorities as required by applicable law (including the GDPR).",
        ],
      },
      {
        id: "rights",
        title: "11. Your rights",
        paragraphs: [
          "Depending on your location, you may have rights of access, rectification, erasure, restriction, objection, portability, and the right to lodge a complaint with a supervisory authority (e.g. CNIL or your local DPA).",
          `Account / staff data: ${E.privacyEmail} or ${E.supportEmail}.`,
          "Pet-owner / patient data inside a clinic workspace: contact the clinic first (controller). We assist as processor.",
        ],
      },
      {
        id: "us-state",
        title: "12. U.S. state privacy notices",
        paragraphs: [
          "If you are a resident of California, Colorado, Connecticut, Virginia, Nevada or another U.S. state with a comprehensive privacy law, you may have rights to know, access, correct, delete, obtain a copy of personal information, and to opt out of sale/sharing or targeted advertising, as applicable.",
          `${E.brand} does not sell personal information and does not use personal information for cross-context behavioral advertising beyond consented analytics tools described in the Cookie Policy.`,
          `To exercise state privacy rights: ${E.privacyEmail}. We will verify your request as required by law. You may use an authorized agent where the law allows.`,
        ],
      },
      {
        id: "deletion",
        title: "13. Account deletion",
        paragraphs: [
          `You may request deletion of your account from settings or by emailing ${E.supportEmail}. Deletion ends access; some records may be kept temporarily for legal, security or dispute-resolution purposes.`,
          "Clinic admins may request export then deletion of organization data.",
        ],
      },
      {
        id: "children",
        title: "14. Children",
        paragraphs: [
          "The Service is for veterinary professionals and clinic staff. It is not directed at children under 16 (or the local digital-consent age). We do not knowingly create user accounts for children.",
        ],
      },
      {
        id: "cookies",
        title: "15. Cookies and tracking",
        paragraphs: [
          "We use cookies and similar technologies for authentication, preferences, security and, with consent where required, analytics (including Vercel Analytics and Speed Insights). Details and choices: Cookie Policy.",
        ],
      },
      {
        id: "changes",
        title: "16. Changes",
        paragraphs: [
          "We may update this Policy. The “Last updated” date will change. For material changes we may notify you in-product or by email.",
        ],
      },
      {
        id: "contact",
        title: "17. Contact",
        paragraphs: [
          `Privacy: ${E.privacyEmail}`,
          `Support: ${E.supportEmail}`,
          `Website: ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "18. Template attribution",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  terms: {
    title: "Terms of Use",
    metaDescription:
      "VetoCrm Terms of Use — access rights, subscriptions, acceptable use, liability and governing law for veterinary practice management software.",
    lastUpdated: UPDATED,
    intro: `These Terms of Use (“Terms”) govern access to and use of ${E.website} and the ${E.brand} Service operated by ${E.companyFormalName} (“${E.brand}”, “we”, “us”). By creating an account, clicking “I agree”, or using the Service, you agree to these Terms on behalf of yourself or the entity you represent. You must be at least 18 and authorized to bind that clinic/organization. If you do not agree, do not use the Service.`,
    sections: [
      {
        id: "service",
        title: "1. The Service",
        paragraphs: [
          `${E.brand} provides cloud practice-management tools for veterinary clinics (clients, animals, scheduling, consultations, vaccines, stock, farms, accounting depending on plan) for multi-user teams.`,
          "We may modify, suspend or discontinue features with reasonable notice when practicable. The Service is provided on a commercially reasonable efforts basis, excluding planned maintenance and events beyond our reasonable control.",
        ],
      },
      {
        id: "accounts",
        title: "2. Accounts and security",
        bullets: [
          "Provide accurate registration information and keep it current.",
          "Keep credentials confidential; you are responsible for activity under your account.",
          "Organization admins manage invites, roles and team access.",
          "Notify us promptly of unauthorized access. Demo accounts are for evaluation and may be limited or reset.",
        ],
      },
      {
        id: "license",
        title: "3. License and restrictions",
        paragraphs: [
          "Subject to these Terms and your plan, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your clinic’s internal professional purposes.",
        ],
        bullets: [
          "Do not sell, rent, sublicense or commercially exploit the Service except as allowed in writing.",
          "Do not reverse-engineer, bypass security, scrape at scale, or build a competing product from our materials.",
          "Do not access another organization’s data without authorization.",
          "Keep proprietary notices intact on any permitted copies.",
        ],
      },
      {
        id: "plans",
        title: "4. Plans, pricing and taxes",
        paragraphs: [
          "Free and paid plans are offered with quotas (users, storage, features). Listed prices may exclude tax and may vary by currency (MAD, EUR, USD) and billing cycle.",
          "We may change pricing with reasonable notice; changes apply to the next renewal unless stated otherwise.",
        ],
      },
      {
        id: "stripe",
        title: "5. Payment via Stripe",
        paragraphs: [
          "Paid plans are billed through Stripe. By subscribing you authorize recurring charges for the selected cycle. Failed payment may lead to suspension of paid features after notice.",
          "Invoices/receipts are available via the billing portal or on request. Store-billed mobile subscriptions follow the store’s rules.",
        ],
      },
      {
        id: "cancel",
        title: "6. Cancellation and refunds",
        paragraphs: [
          "You may cancel or downgrade anytime; effect is generally at the end of the prepaid period. Details: Refund & Cancellation Policy.",
        ],
      },
      {
        id: "privacy",
        title: "7. Privacy and cookies",
        paragraphs: [
          `Your use is also governed by our Privacy Policy (${E.website}/privacy) and Cookie Policy (${E.website}/cookies), incorporated by reference. If there is a conflict about personal-data processing, the Privacy Policy controls.`,
        ],
      },
      {
        id: "customer-data",
        title: "8. Clinic data",
        paragraphs: [
          "You retain rights in data you enter. You grant us a limited license to host and process it solely to provide the Service.",
          "You warrant you have a lawful basis to process pet-owner and related records. We act as processor for that data; a DPA is available on request.",
        ],
      },
      {
        id: "feedback",
        title: "9. Feedback",
        paragraphs: [
          "If you share feedback or suggestions, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use that feedback without attribution. Do not submit feedback you consider proprietary or confidential.",
        ],
      },
      {
        id: "third-party",
        title: "10. Third-party services",
        paragraphs: [
          "The Service may link to or integrate third-party services (e.g. Stripe, hosting). We do not control those services; their terms and privacy practices apply. You use them at your own risk.",
        ],
      },
      {
        id: "disclaimer",
        title: "11. Professional disclaimer and “as is”",
        paragraphs: [
          `${E.brand} is a management aid for veterinary professionals. It is not a medical device and does not replace clinical judgment, diagnosis, prescription or regulatory duties. You remain solely responsible for professional decisions.`,
          'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION.',
        ],
      },
      {
        id: "liability",
        title: "12. Limitation of liability",
        paragraphs: [
          "To the maximum extent permitted by law, we are not liable for indirect, consequential, incidental, special or punitive damages, lost profits, or data loss from misuse or third-party outages.",
          "Our aggregate liability for claims relating to the Service is capped at the amounts you actually paid us in the 12 months before the claim (or the local-currency equivalent of EUR 100 on a free plan).",
        ],
      },
      {
        id: "indemnity",
        title: "13. Indemnification",
        paragraphs: [
          "You agree to defend and indemnify us against claims and reasonable costs arising from your use of the Service, your clinic data, your violation of these Terms, or your violation of law — to the extent permitted by applicable law.",
        ],
      },
      {
        id: "termination",
        title: "14. Suspension and termination",
        paragraphs: [
          "We may suspend or terminate access if you breach these Terms, fail to pay, or create security/legal risk. Upon termination, license rights end; surviving clauses (IP, liability, indemnity, law) continue.",
        ],
      },
      {
        id: "law",
        title: "15. Governing law and disputes",
        paragraphs: [
          `Subject to mandatory consumer or professional protections in your country, these Terms are governed by the laws of ${E.country}. Courts in the Rabat jurisdiction have competence, unless mandatory rules require otherwise.`,
          `Before formal proceedings, contact ${E.contactEmail} so we can try to resolve the issue amicably.`,
        ],
      },
      {
        id: "general",
        title: "16. General",
        bullets: [
          "We may update these Terms; material changes may be notified in-product or by email. Continued use after notice constitutes acceptance where permitted.",
          "These Terms, with the Privacy, Cookie, Refund and Disclosure policies, are the entire agreement regarding the Service.",
          "If a provision is invalid, it will be modified to the minimum extent necessary; the rest remains in effect.",
          "You may not assign these Terms without our consent; we may assign them in a corporate transaction.",
          `Contact: ${E.contactEmail} — ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "17. Template attribution",
        paragraphs: [ATTRIBUTION],
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
          `Correspondence: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
        ],
      },
      {
        id: "director",
        title: "2. Publication director",
        paragraphs: [`Publication director: ${E.publicationDirector}, reachable at ${E.contactEmail}.`],
      },
      {
        id: "hosting",
        title: "3. Hosting",
        paragraphs: [
          `Application (front end): ${E.hostingApp}.`,
          `Data and backend: ${E.hostingData}.`,
          `Questions: ${E.supportEmail}.`,
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
          "VetoCrm is practice-management software for veterinary professionals. It is not a medical device and does not replace clinical expertise. See also our Disclosure page.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    metaDescription:
      "VetoCrm Cookie Policy — essential cookies, preferences, Vercel Analytics / Speed Insights and how to manage consent.",
    lastUpdated: UPDATED,
    intro: `This Cookie Policy explains how ${E.brand} (“we”, “us”) uses cookies and similar technologies on ${E.website} and in the app, in line with our Privacy Policy. It is adapted from General Legal’s Cookie Notice template for our actual stack.`,
    sections: [
      {
        id: "what",
        title: "1. What are cookies?",
        paragraphs: [
          "Cookies are small data files placed on your device when you visit a site. We may also use similar technologies such as browser local storage and pixels. We use session cookies (expire when you close the browser) and persistent cookies (remain until deleted or expired).",
          "First-party cookies are set by us; third-party cookies may be set by providers that help us operate the Service (for example analytics when you consent).",
        ],
      },
      {
        id: "types",
        title: "2. Types we use",
        bullets: [
          "Essential / technical: authentication session (e.g. Supabase auth), security, load balancing — required for the Service to work. No consent required.",
          "Preferences / functionality: UI language (vetocrm-lang), cookie-consent choice (vetocrm_cookie_consent), UI state — remember your settings.",
          "Analytics / performance (only if you accept non-essential cookies): Vercel Analytics (usage) and Vercel Speed Insights (Core Web Vitals / performance). These help us understand aggregated traffic and improve speed.",
          "Advertising / social: not currently used on vetocrm.com. If we add them later, we will update this Policy and request consent where required.",
        ],
      },
      {
        id: "providers",
        title: "3. Who serves them",
        bullets: [
          `${E.brand} / first party — preferences and consent storage.`,
          "Supabase — essential auth session cookies/tokens for signed-in users (https://supabase.com/privacy).",
          "Vercel — hosting; Analytics and Speed Insights scripts only after consent via our banner (https://vercel.com/legal/privacy-policy).",
          "Stripe — may set cookies on payment pages when you subscribe (https://stripe.com/privacy).",
        ],
      },
      {
        id: "choices",
        title: "4. Your choices",
        paragraphs: [
          "On first visit we show a cookie banner: you can accept or reject non-essential cookies. Essential cookies remain active.",
          "You can clear site data or block cookies in your browser; blocking essential cookies may prevent sign-in.",
          "Changing consent: clear the vetocrm_cookie_consent value in local storage / site data for vetocrm.com, then reload to see the banner again — or contact us and we will guide you.",
        ],
      },
      {
        id: "other",
        title: "5. Other technologies",
        paragraphs: [
          "We may use browser local storage for language and consent preferences. We do not use Flash LSOs or session-replay tools (e.g. FullStory) on the Service today.",
          "Transactional emails may include standard open/click measurement for delivery reliability; marketing emails (if any) follow applicable consent rules.",
        ],
      },
      {
        id: "duration",
        title: "6. Duration",
        paragraphs: [
          "Session cookies expire when the browser closes. Persistent preference cookies typically last up to 12 months unless renewed. Analytics identifiers follow the provider’s retention when enabled.",
        ],
      },
      {
        id: "changes",
        title: "7. Changes",
        paragraphs: [
          "We may update this Cookie Policy. Check the “Last updated” date. Material changes may be highlighted in the banner or Privacy Policy.",
        ],
      },
      {
        id: "contact",
        title: "8. Contact",
        paragraphs: [`Questions: ${E.privacyEmail}. More on data uses: Privacy Policy.`],
      },
      {
        id: "attribution",
        title: "9. Template attribution",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  refund: {
    title: "Refund & Cancellation Policy",
    metaDescription:
      "VetoCrm subscription cancellation and refunds via Stripe and app stores — trials, renewals and downgrades.",
    lastUpdated: UPDATED,
    intro: `This Policy complements the Terms of Use and explains cancellation and refunds for ${E.brand} subscriptions, including Stripe and app stores.`,
    sections: [
      {
        id: "cancel",
        title: "1. Cancellation",
        paragraphs: [
          `You may cancel a paid subscription anytime from billing/settings or by contacting ${E.supportEmail}.`,
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
          `Requests: ${E.contactEmail} with account email and payment proof. Stripe refunds appear per your bank’s timeline (often 5–10 business days).`,
        ],
      },
      {
        id: "stores",
        title: "3. App Store / Google Play",
        paragraphs: [
          "If subscribed via Apple or Google, cancellation and refunds are primarily handled by the store. VetoCrm cannot always refund an in-app purchase directly; we can guide you to store procedures.",
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

  disclosure: {
    title: "Disclosure",
    metaDescription:
      "VetoCrm disclosures — professional / medical disclaimer, advertising transparency, partnerships and material connections.",
    lastUpdated: UPDATED,
    intro: `This Disclosure explains important limitations and transparency practices for ${E.brand}. It complements our Terms of Use, Privacy Policy and Legal Notice.`,
    sections: [
      {
        id: "professional",
        title: "1. Professional / medical disclaimer",
        paragraphs: [
          `${E.brand} is software for organizing veterinary practice operations (CRM, scheduling, records, inventory, etc.). It is not a medical device, does not provide veterinary advice, and does not diagnose, treat or prescribe.`,
          "Licensed veterinarians and clinic staff remain solely responsible for clinical decisions, prescriptions, animal welfare and compliance with professional and regulatory obligations in their jurisdiction.",
          "Content on our marketing site and blog (“Monde Veto”) is informational and educational. It is not a substitute for professional consultation.",
        ],
      },
      {
        id: "results",
        title: "2. Results and testimonials",
        paragraphs: [
          "Any examples, screenshots, case studies or testimonials describe individual experiences. Results vary by clinic size, workflows and usage. Past performance does not guarantee future results.",
        ],
      },
      {
        id: "advertising",
        title: "3. Advertising and marketing",
        paragraphs: [
          "We may promote VetoCrm through our website, email, social networks, Product Hunt, search or paid ads (e.g. Meta). Ads are labeled where platforms require it.",
          "If a post, email or page includes a paid partnership, affiliate link or sponsored placement, we will disclose that material connection in a clear manner (for example “Sponsored”, “Partner” or “Affiliate”).",
        ],
      },
      {
        id: "affiliates",
        title: "4. Affiliates and referrals",
        paragraphs: [
          "If we offer referral or affiliate programs, participants may earn a commission or credit when someone subscribes through their link. Prices for end customers are not increased solely because of such links unless we say otherwise.",
        ],
      },
      {
        id: "third-party",
        title: "5. Third-party tools and brands",
        paragraphs: [
          "Mentions of Stripe, Supabase, Vercel, Apple, Google or other brands are for identification only. We are not affiliated with or endorsed by those companies unless expressly stated. Their trademarks belong to their owners.",
        ],
      },
      {
        id: "ai",
        title: "6. AI and automated content",
        paragraphs: [
          "We may use software tools (including AI-assisted drafting) to help create marketing copy or product UI text. Operational clinic data you enter remains processed under our Privacy Policy and your clinic’s instructions; we do not sell that data to train public AI models.",
        ],
      },
      {
        id: "contact",
        title: "7. Contact",
        paragraphs: [
          `Questions about this Disclosure: ${E.contactEmail}`,
          `Privacy: ${E.privacyEmail}`,
          `Website: ${E.website}`,
        ],
      },
    ],
  },
};
