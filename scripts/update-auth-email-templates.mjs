/**
 * Applique les templates e-mail Auth VetoCrm (FR) via Management API.
 *
 * Prérequis :
 * 1. Crée un access token : https://supabase.com/dashboard/account/tokens
 * 2. PowerShell :
 *    $env:SUPABASE_ACCESS_TOKEN="sbp_..."
 *    node scripts/update-auth-email-templates.mjs
 *
 * Optionnel — activer le Send Email Hook (Gmail VetoCrm) :
 *    $env:SEND_EMAIL_HOOK_SECRET="v1,whsec_..."
 *    $env:ENABLE_SEND_EMAIL_HOOK="1"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF = process.env.SUPABASE_PROJECT_REF || "yoskgnuoyjczxsdrgjwv";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Manque SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens).");
  process.exit(1);
}

function readTemplate(name) {
  return fs.readFileSync(path.join(ROOT, "supabase", "templates", name), "utf8");
}

const body = {
  mailer_subjects_confirmation: "Confirmez votre compte VetoCrm",
  mailer_templates_confirmation_content: readTemplate("confirm-signup.html"),
  mailer_subjects_recovery: "Réinitialisation du mot de passe — VetoCrm",
  mailer_templates_recovery_content: readTemplate("recovery.html"),
  mailer_subjects_magic_link: "Votre lien de connexion VetoCrm",
  mailer_templates_magic_link_content: readTemplate("magic-link.html"),
  mailer_subjects_invite: "Invitation à rejoindre une clinique — VetoCrm",
  mailer_templates_invite_content: readTemplate("invite.html"),
  mailer_subjects_email_change: "Confirmez votre nouvelle adresse e-mail — VetoCrm",
  mailer_templates_email_change_content: readTemplate("email-change.html"),
  mailer_subjects_reauthentication: "{{ .Token }} est votre code VetoCrm",
  mailer_templates_reauthentication_content: readTemplate("reauthentication.html"),
};

if (process.env.ENABLE_SEND_EMAIL_HOOK === "1") {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) {
    console.error("ENABLE_SEND_EMAIL_HOOK=1 mais SEND_EMAIL_HOOK_SECRET manquant.");
    process.exit(1);
  }
  body.hook_send_email_enabled = true;
  body.hook_send_email_uri = `https://${REF}.supabase.co/functions/v1/auth-email-hook`;
  body.hook_send_email_secrets = secret;
}

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error("Échec", res.status, text.slice(0, 800));
  process.exit(1);
}

console.log("Templates Auth mis à jour (FR / VetoCrm).");
if (process.env.ENABLE_SEND_EMAIL_HOOK === "1") {
  console.log("Send Email Hook activé → auth-email-hook");
} else {
  console.log("Astuce : pour envoyer depuis vetoapp23@gmail.com, relance avec ENABLE_SEND_EMAIL_HOOK=1 et SEND_EMAIL_HOOK_SECRET.");
}
