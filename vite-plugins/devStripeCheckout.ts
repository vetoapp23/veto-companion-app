import type { Plugin } from "vite";
import { createClient } from "@supabase/supabase-js";

/**
 * Dev-only Checkout proxy so local E2E works before Edge Function secrets are set.
 * Production must use create-checkout-session + STRIPE_SECRET_KEY in Supabase secrets.
 */
export function devStripeCheckoutPlugin(env: Record<string, string>): Plugin {
  return {
    name: "dev-stripe-checkout",
    configureServer(server) {
      server.middlewares.use("/__dev/create-checkout-session", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "method_not_allowed" }));
          return;
        }

        try {
          const stripeKey = env.STRIPE_SECRET_KEY?.trim();
          if (!stripeKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "stripe_not_configured" }));
            return;
          }

          const auth = req.headers.authorization;
          if (!auth?.startsWith("Bearer ")) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "unauthorized" }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");

          const supabaseUrl = env.VITE_SUPABASE_URL!.trim();
          const anon =
            (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "").trim();
          const userClient = createClient(supabaseUrl, anon, {
            global: { headers: { Authorization: auth } },
          });
          const {
            data: { user },
            error: userErr,
          } = await userClient.auth.getUser();
          if (userErr || !user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "unauthorized" }));
            return;
          }

          const { data: profile } = await userClient
            .from("user_profiles")
            .select("id, email, full_name, role, organization_id, status")
            .eq("id", user.id)
            .maybeSingle();
          if (!profile?.organization_id) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "no_organization" }));
            return;
          }
          if (profile.role !== "admin" && profile.role !== "super_admin") {
            res.statusCode = 403;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "admin_only" }));
            return;
          }

          const planCode = String(body.plan_code || "").trim();
          const cycle = body.cycle === "yearly" ? "yearly" : "monthly";
          const currency = String(body.currency || "MAD").toUpperCase();
          if (!planCode || planCode === "free") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "invalid_plan" }));
            return;
          }

          const lookupKey = `vetocrm_${planCode}_${cycle}_${currency.toLowerCase()}`;
          const priceRes = await fetch(
            `https://api.stripe.com/v1/prices?lookup_keys[]=${encodeURIComponent(lookupKey)}&active=true&limit=1`,
            {
              headers: { Authorization: `Bearer ${stripeKey}` },
            },
          );
          const priceJson = (await priceRes.json()) as { data?: Array<{ id: string }> };
          let priceId = priceJson.data?.[0]?.id;

          if (!priceId) {
            const { data: planRow } = await userClient
              .from("subscription_plans")
              .select("stripe_prices")
              .eq("code", planCode)
              .maybeSingle();
            priceId =
              (planRow as any)?.stripe_prices?.[cycle]?.[currency] ||
              (planRow as any)?.stripe_prices?.[cycle]?.MAD;
          }
          if (!priceId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "price_not_found", lookup_key: lookupKey }));
            return;
          }

          const appUrl = (
            env.VITE_APP_URL ||
            env.APP_URL ||
            "http://localhost:8080"
          ).replace(/\/$/, "");

          const form = new URLSearchParams();
          form.set("mode", "subscription");
          form.set("client_reference_id", profile.organization_id);
          form.set("line_items[0][price]", priceId);
          form.set("line_items[0][quantity]", "1");
          form.set(
            "success_url",
            `${appUrl}/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
          );
          form.set("cancel_url", `${appUrl}/pricing?billing=cancel`);
          form.set("allow_promotion_codes", "true");
          form.set("billing_address_collection", "auto");
          form.set("customer_email", profile.email || user.email || "");
          form.set("metadata[organization_id]", profile.organization_id);
          form.set("metadata[plan_code]", planCode);
          form.set("metadata[billing_cycle]", cycle);
          form.set("metadata[currency]", currency);
          form.set("subscription_data[metadata][organization_id]", profile.organization_id);
          form.set("subscription_data[metadata][plan_code]", planCode);
          form.set("subscription_data[metadata][billing_cycle]", cycle);

          const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form,
          });
          const session = (await sessionRes.json()) as { url?: string; id?: string; error?: any };
          if (!sessionRes.ok || !session.url) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: session.error?.message || "checkout_failed",
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: session.url, session_id: session.id, via: "dev_proxy" }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e?.message || "checkout_failed" }));
        }
      });
    },
  };
}
