// Auth Email Hook: emails d'authentification VetoCrm via Gmail connector.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const FROM_NAME = "VetoCrm";
const FROM_EMAIL = "vetoapp23@gmail.com";
const BRAND = {
  teal: "#0f766e",
  mint: "#5eead4",
  deep: "#0b3d3a",
  ink: "#07131f",
  fog: "#eef7f5",
  muted: "#5a6b73",
  line: "#d1e5e1",
  white: "#ffffff",
};

function b64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRawMessage(to: string, subject: string, html: string): string {
  const headers = [
    `From: ${FROM_NAME} <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
  ];
  return headers.join("\r\n") + "\r\n\r\n" + html;
}

type EmailAction =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change"
  | "email_change_current"
  | "email_change_new"
  | "reauthentication"
  | string;

function copyFor(action: EmailAction): {
  subject: string;
  eyebrow: string;
  title: string;
  intro: string;
  detail: string;
  cta: string;
} {
  switch (action) {
    case "signup":
      return {
        subject: "Confirmez votre compte VetoCrm",
        eyebrow: "Bienvenue",
        title: "Activez votre espace clinique",
        intro:
          "Merci de rejoindre VetoCrm, le CRM pensé pour les vétérinaires. Une dernière étape : confirmez votre adresse e-mail pour sécuriser votre clinique.",
        detail:
          "Après confirmation, vous pourrez gérer clients, patients, rendez-vous, consultations, vaccins et plus encore.",
        cta: "Confirmer mon e-mail",
      };
    case "recovery":
      return {
        subject: "Réinitialisation du mot de passe — VetoCrm",
        eyebrow: "Sécurité",
        title: "Réinitialisez votre mot de passe",
        intro:
          "Vous avez demandé à réinitialiser le mot de passe de votre compte VetoCrm. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
        detail: "Ce lien est temporaire et à usage unique pour protéger votre clinique.",
        cta: "Choisir un nouveau mot de passe",
      };
    case "invite":
      return {
        subject: "Invitation à rejoindre une clinique — VetoCrm",
        eyebrow: "Invitation",
        title: "Vous êtes invité(e) sur VetoCrm",
        intro:
          "Une clinique vous invite à rejoindre son équipe sur VetoCrm. Acceptez l’invitation pour accéder à l’espace partagé.",
        detail: "Vous pourrez ensuite vous connecter avec vos identifiants.",
        cta: "Accepter l’invitation",
      };
    case "magiclink":
      return {
        subject: "Votre lien de connexion VetoCrm",
        eyebrow: "Connexion",
        title: "Connectez-vous en un clic",
        intro: "Voici votre lien magique pour accéder à votre espace clinique VetoCrm.",
        detail: "Si vous n’avez pas demandé ce lien, ignorez cet e-mail.",
        cta: "Accéder à mon espace",
      };
    case "email_change":
    case "email_change_current":
    case "email_change_new":
      return {
        subject: "Confirmez votre nouvelle adresse e-mail — VetoCrm",
        eyebrow: "Compte",
        title: "Confirmez le changement d’e-mail",
        intro:
          "Une demande de changement d’adresse e-mail a été initiée sur votre compte VetoCrm. Confirmez pour finaliser la modification.",
        detail: "Sans confirmation, votre adresse actuelle reste inchangée.",
        cta: "Confirmer mon e-mail",
      };
    case "reauthentication":
      return {
        subject: "Code de vérification VetoCrm",
        eyebrow: "Vérification",
        title: "Votre code de sécurité",
        intro: "Utilisez le code ci-dessous pour confirmer cette action sensible sur VetoCrm.",
        detail: "Ne partagez jamais ce code. Il expire rapidement.",
        cta: "Code de vérification",
      };
    default:
      return {
        subject: "Notification VetoCrm",
        eyebrow: "VetoCrm",
        title: "Action requise",
        intro: "Cliquez sur le bouton ci-dessous pour continuer.",
        detail: "",
        cta: "Continuer",
      };
  }
}

function renderEmail(opts: {
  user_email: string;
  confirmation_url: string;
  token?: string;
  email_action_type: EmailAction;
}): { subject: string; html: string } {
  const { confirmation_url, token, email_action_type, user_email } = opts;
  const copy = copyFor(email_action_type);
  const year = new Date().getFullYear();

  const actionBlock =
    email_action_type === "reauthentication"
      ? `
        <div style="margin:28px 0;padding:20px 16px;background:${BRAND.fog};border:1px solid ${BRAND.line};border-radius:14px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.teal};font-weight:700;">Code</p>
          <p style="margin:0;font-size:32px;letter-spacing:0.35em;font-weight:800;color:${BRAND.ink};font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${token || ""}</p>
        </div>`
      : `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
          <tr>
            <td align="center" style="border-radius:999px;background:${BRAND.teal};">
              <a href="${confirmation_url}"
                 style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:${BRAND.white};text-decoration:none;border-radius:999px;letter-spacing:-0.01em;">
                ${copy.cta}
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:${BRAND.muted};">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        </p>
        <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;">
          <a href="${confirmation_url}" style="color:${BRAND.teal};text-decoration:underline;">${confirmation_url}</a>
        </p>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.subject}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.fog};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.fog};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.white};border-radius:20px;overflow:hidden;border:1px solid ${BRAND.line};box-shadow:0 12px 40px rgba(15,118,110,0.08);">
          <!-- Header brand -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.deep} 0%,${BRAND.teal} 100%);padding:28px 28px 24px;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:${BRAND.white};">
                Veto<span style="color:${BRAND.mint};">Crm</span>
              </p>
              <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(244,251,249,0.75);font-weight:600;">
                ${copy.eyebrow}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;letter-spacing:-0.03em;font-weight:800;color:${BRAND.ink};">
                ${copy.title}
              </h1>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${BRAND.muted};">
                Bonjour${user_email ? ` <strong style="color:${BRAND.ink};">${user_email}</strong>` : ""},
              </p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${BRAND.muted};">
                ${copy.intro}
              </p>
              ${
                copy.detail
                  ? `<p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};">${copy.detail}</p>`
                  : ""
              }
              ${actionBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:8px 28px 28px;">
              <hr style="border:none;border-top:1px solid ${BRAND.line};margin:24px 0;" />
              <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:${BRAND.muted};">
                Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.55;color:${BRAND.muted};">
                © ${year} VetoCrm — CRM vétérinaire pour cliniques et cabinets<br />
                <a href="https://vetocrm.com" style="color:${BRAND.teal};text-decoration:none;font-weight:600;">vetocrm.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: copy.subject, html };
}

Deno.serve(async (req) => {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
    const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!GOOGLE_MAIL_API_KEY) throw new Error("GOOGLE_MAIL_API_KEY missing — Gmail not connected");
    if (!HOOK_SECRET) throw new Error("SEND_EMAIL_HOOK_SECRET missing");

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers as unknown as Iterable<[string, string]>);

    const secret = HOOK_SECRET.replace(/^v1,whsec_/, "");
    const wh = new Webhook(secret);
    const data = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new?: string;
        token_hash_new?: string;
      };
    };

    const { user, email_data } = data;

    const PUBLIC_APP_URL = Deno.env.get("PUBLIC_APP_URL") || "https://vetocrm.com";
    const incoming_redirect = email_data.redirect_to || "";
    const safe_redirect =
      incoming_redirect && !/lovable\.(dev|app)\/(login|auth-bridge)/.test(incoming_redirect)
        ? incoming_redirect
        : PUBLIC_APP_URL;

    const confirmation_url = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(safe_redirect)}`;

    const { subject, html } = renderEmail({
      user_email: user.email,
      confirmation_url,
      token: email_data.token,
      email_action_type: email_data.email_action_type,
    });

    const raw = b64url(buildRawMessage(user.email, subject, html));

    const resp = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
      },
      body: JSON.stringify({ raw }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Gmail send failed", resp.status, errText);
      return new Response(
        JSON.stringify({ error: { http_code: 502, message: `Gmail send failed: ${errText}` } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auth-email-hook error", e);
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: String((e as Error).message || e) } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
});
