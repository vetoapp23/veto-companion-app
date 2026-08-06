// Edge function: send email via Gmail connector.
// Requires authenticated approved staff (admin/assistant/super_admin) + basic rate limit.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 5;
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 50_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

interface SendEmailBody {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from_name?: string;
}

const rateBucket = new Map<string, { count: number; resetAt: number }>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateBucket.get(userId);
  if (!entry || now >= entry.resetAt) {
    rateBucket.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

function normalizeEmails(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

function validateEmails(emails: string[], label: string): string | null {
  if (emails.length > MAX_RECIPIENTS) {
    return `${label}: maximum ${MAX_RECIPIENTS} recipients`;
  }
  for (const email of emails) {
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return `${label}: invalid email`;
    }
  }
  return null;
}

function b64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRaw(opts: SendEmailBody): string {
  const toList = normalizeEmails(opts.to).join(", ");
  const ccList = normalizeEmails(opts.cc).join(", ");
  const bccList = normalizeEmails(opts.bcc).join(", ");
  const fromName = (opts.from_name || "VetoCrm").replace(/[\r\n<>]/g, "").slice(0, 80);
  const from = `${fromName} <vetoapp23@gmail.com>`;

  const headers = [
    `From: ${from}`,
    `To: ${toList}`,
    ccList ? `Cc: ${ccList}` : "",
    bccList ? `Bcc: ${bccList}` : "",
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`,
    "MIME-Version: 1.0",
    opts.html
      ? 'Content-Type: text/html; charset="UTF-8"'
      : 'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
  ].filter(Boolean);

  const body = opts.html || opts.text || "";
  return headers.join("\r\n") + "\r\n\r\n" + body;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Optional shared secret for extra hardening when set
    const requiredSecret = Deno.env.get("SEND_EMAIL_SECRET") ?? "";
    if (requiredSecret) {
      const provided = req.headers.get("x-send-email-secret") ?? "";
      if (!timingSafeEqual(provided, requiredSecret)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role, status, organization_id")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role as string | undefined;
    const status = profile?.status as string | undefined;
    const allowedRoles = new Set(["admin", "super_admin"]);
    if (!profile || status !== "approved" || !role || !allowedRoles.has(role)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    if (!checkRateLimit(user.id)) {
      return jsonResponse({ error: "Too many requests" }, 429);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!GOOGLE_MAIL_API_KEY) throw new Error("GOOGLE_MAIL_API_KEY missing (Gmail not connected)");

    const body = (await req.json()) as SendEmailBody;
    if (!body?.to || !body?.subject || (!body.html && !body.text)) {
      return jsonResponse({ error: "Champs requis: to, subject, et html ou text" }, 400);
    }

    if (typeof body.subject !== "string" || body.subject.length > MAX_SUBJECT_LEN) {
      return jsonResponse({ error: `subject max ${MAX_SUBJECT_LEN} chars` }, 400);
    }

    const payloadBody = body.html || body.text || "";
    if (payloadBody.length > MAX_BODY_LEN) {
      return jsonResponse({ error: `body max ${MAX_BODY_LEN} chars` }, 400);
    }

    const to = normalizeEmails(body.to);
    const cc = normalizeEmails(body.cc);
    const bcc = normalizeEmails(body.bcc);
    if (to.length === 0) {
      return jsonResponse({ error: "At least one recipient required" }, 400);
    }

    for (const [label, emails] of [
      ["to", to],
      ["cc", cc],
      ["bcc", bcc],
    ] as const) {
      const err = validateEmails(emails, label);
      if (err) return jsonResponse({ error: err }, 400);
    }

    const raw = b64url(buildRaw({ ...body, to, cc, bcc }));

    const resp = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
      },
      body: JSON.stringify({ raw }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Gmail send error", resp.status);
      return jsonResponse({ error: "Gmail send failed" }, 502);
    }

    console.log(
      JSON.stringify({
        event: "send-email",
        userId: user.id,
        orgId: profile.organization_id,
        toCount: to.length,
      }),
    );

    return jsonResponse({ success: true, id: data.id }, 200);
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
