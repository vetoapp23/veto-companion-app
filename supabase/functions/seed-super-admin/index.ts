// One-shot: ensure vetoapp23@gmail.com exists as super_admin with known password.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL = "vetoapp23@gmail.com";
const PASSWORD = "M@roc2025";
const FULL_NAME = "Super Admin";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key, { auth: { persistSession: false } });

  try {
    // Find or create auth user
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
    let userId: string;

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password: PASSWORD,
        email_confirm: true,
      });
      if (updErr) throw new Error("updateUserById: " + updErr.message);
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      });
      if (error) throw error;
      userId = created.user!.id;
    }

    // Ensure organization
    const { data: profile } = await admin
      .from("user_profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();

    let orgId = profile?.organization_id;
    if (!orgId) {
      const code = "SADM" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const { data: org, error: oErr } = await admin
        .from("organizations")
        .insert({ name: "Super Admin HQ", code, address: "—", phone: "—" })
        .select("id")
        .single();
      if (oErr) throw oErr;
      orgId = org.id;
    }

    // Upsert profile as super_admin / approved
    const payload = {
      id: userId,
      email: EMAIL,
      username: EMAIL.split("@")[0],
      full_name: FULL_NAME,
      role: "super_admin",
      status: "approved",
      organization_id: orgId,
    };

    if (profile) {
      await admin.from("user_profiles").update(payload).eq("id", userId);
    } else {
      await admin.from("user_profiles").insert(payload);
    }

    return new Response(
      JSON.stringify({ ok: true, userId, email: EMAIL, password: PASSWORD }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
