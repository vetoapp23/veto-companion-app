// Bootstraps a super_admin account. Requires header x-bootstrap-secret matching env BOOTSTRAP_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL = Deno.env.get("SUPER_ADMIN_EMAIL") ?? "vetoapp23@gmail.com";
const FULL_NAME = "Super Admin";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const expected = Deno.env.get("BOOTSTRAP_SECRET");
  const provided = req.headers.get("x-bootstrap-secret");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const password = Deno.env.get("SUPER_ADMIN_PASSWORD");
  if (!password) {
    return new Response(JSON.stringify({ ok: false, error: "SUPER_ADMIN_PASSWORD not configured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  try {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());
    let userId: string;

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updErr) throw new Error("updateUserById: " + updErr.message);
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: EMAIL,
        password,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      });
      if (error) throw error;
      userId = created.user!.id;
    }

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
      JSON.stringify({ ok: true, userId, email: EMAIL, passwordSet: true }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
