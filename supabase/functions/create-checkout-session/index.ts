import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "stripe_not_configured" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const { data: profile, error: profileErr } = await userClient
      .from("user_profiles")
      .select("id, email, full_name, role, organization_id, status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr || !profile?.organization_id) {
      return json({ error: "no_organization" }, 400);
    }
    if (profile.role !== "admin" && profile.role !== "super_admin") {
      return json({ error: "admin_only" }, 403);
    }
    if (profile.status && profile.status !== "approved") {
      return json({ error: "account_not_approved" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const planCode = String(body.plan_code || "").trim();
    const cycle = body.cycle === "yearly" ? "yearly" : "monthly";
    const currency = String(body.currency || "MAD").toUpperCase();
    if (!planCode || planCode === "free") {
      return json({ error: "invalid_plan" }, 400);
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const lookupKey = `vetocrm_${planCode}_${cycle}_${currency.toLowerCase()}`;
    const listed = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    });
    let price = listed.data[0];

    // Fallback: resolve from catalog JSON if lookup missing
    if (!price) {
      const { data: planRow } = await userClient
        .from("subscription_plans")
        .select("stripe_prices")
        .eq("code", planCode)
        .maybeSingle();
      const priceId =
        (planRow as any)?.stripe_prices?.[cycle]?.[currency] ||
        (planRow as any)?.stripe_prices?.[cycle]?.MAD;
      if (priceId) price = await stripe.prices.retrieve(priceId);
    }
    if (!price) return json({ error: "price_not_found", lookup_key: lookupKey }, 400);

    const service = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: sub } = await service
      .from("organization_subscriptions")
      .select("id, stripe_customer_id, plan_code, status")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || undefined,
        name: profile.full_name || undefined,
        metadata: {
          organization_id: profile.organization_id,
          user_id: user.id,
        },
      });
      customerId = customer.id;
      if (sub?.id) {
        await service
          .from("organization_subscriptions")
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq("id", sub.id);
      } else {
        await service.from("organization_subscriptions").insert({
          organization_id: profile.organization_id,
          plan_code: "free",
          status: "active",
          stripe_customer_id: customerId,
        });
      }
    }

    const appUrl = (Deno.env.get("APP_URL") || Deno.env.get("SITE_URL") || "https://vetocrm.com").replace(
      /\/$/,
      "",
    );
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: profile.organization_id,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings/billing?billing=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        organization_id: profile.organization_id,
        plan_code: planCode,
        billing_cycle: cycle,
        currency,
      },
      subscription_data: {
        metadata: {
          organization_id: profile.organization_id,
          plan_code: planCode,
          billing_cycle: cycle,
        },
      },
    });

    return json({ url: session.url, session_id: session.id });
  } catch (e: any) {
    console.error("[create-checkout-session]", e);
    return json({ error: e?.message || "checkout_failed" }, 500);
  }
});
