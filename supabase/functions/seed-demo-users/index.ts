// Seed demo users for each subscription plan (idempotent).
// Public endpoint used only during the testing phase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_PASSWORD = "DemoVetpro2026!";

const DEMOS: Array<{
  plan: "free" | "pro" | "pro_plus" | "duo" | "clinic";
  email: string;
  fullName: string;
  clinic: string;
  storageMb: number;
}> = [
  { plan: "free",     email: "demo-free@vetpro.test",     fullName: "Démo Découverte", clinic: "Clinique Démo Découverte", storageMb: 200 },
  { plan: "pro",      email: "demo-pro@vetpro.test",      fullName: "Démo Pro",        clinic: "Clinique Démo Pro",        storageMb: 2048 },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", fullName: "Démo Pro Plus",   clinic: "Clinique Démo Pro Plus",   storageMb: 3072 },
  { plan: "duo",      email: "demo-duo@vetpro.test",      fullName: "Démo Duo",        clinic: "Clinique Démo Duo",        storageMb: 5120 },
  { plan: "clinic",   email: "demo-clinic@vetpro.test",   fullName: "Démo Clinique",   clinic: "Clinique Démo Clinique",   storageMb: 15360 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const results: any[] = [];

  for (const d of DEMOS) {
    try {
      // 1. Ensure auth user exists
      let userId: string | null = null;
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
      if (existing) {
        userId = existing.id;
        // reset password to known value
        await admin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD, email_confirm: true });
      } else {
        const { data: created, error: cErr } = await admin.auth.admin.createUser({
          email: d.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: d.fullName },
        });
        if (cErr) throw cErr;
        userId = created.user!.id;
      }

      // 2. Ensure organization + profile
      const { data: profile } = await admin.from("user_profiles").select("organization_id").eq("id", userId).maybeSingle();
      let orgId: string | null = profile?.organization_id ?? null;

      if (!orgId) {
        const code = "DEMO" + d.plan.toUpperCase().slice(0, 4);
        const { data: org, error: oErr } = await admin
          .from("organizations")
          .insert({ name: d.clinic, code, address: "Demo", phone: "+212600000000" })
          .select("id")
          .single();
        if (oErr) throw oErr;
        orgId = org.id;

        const { error: pErr } = await admin.from("user_profiles").insert({
          id: userId,
          email: d.email,
          username: d.email.split("@")[0],
          full_name: d.fullName,
          role: "admin",
          status: "approved",
          organization_id: orgId,
        });
        if (pErr) throw pErr;
      } else {
        await admin.from("user_profiles").update({ status: "approved", role: "admin" }).eq("id", userId);
      }

      // 3. Upsert subscription
      const { data: sub } = await admin
        .from("organization_subscriptions")
        .select("id")
        .eq("organization_id", orgId)
        .maybeSingle();

      const subPayload = {
        organization_id: orgId,
        plan_code: d.plan,
        storage_quota_mb: d.storageMb,
        status: "active",
        current_period_start: new Date().toISOString(),
      };

      if (sub) {
        await admin.from("organization_subscriptions").update(subPayload).eq("id", sub.id);
      } else {
        await admin.from("organization_subscriptions").insert(subPayload);
      }

      results.push({ plan: d.plan, email: d.email, userId, orgId, ok: true });
    } catch (e: any) {
      results.push({ plan: d.plan, email: d.email, ok: false, error: e?.message ?? String(e) });
    }
  }

  return new Response(JSON.stringify({ password: DEMO_PASSWORD, results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
