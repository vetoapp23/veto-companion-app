import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "paused":
      return "suspended";
    default:
      return "active";
  }
}

async function resolvePlanCode(stripe: Stripe, subscription: Stripe.Subscription): Promise<string> {
  const fromMeta = subscription.metadata?.plan_code;
  if (fromMeta) return fromMeta;
  const price = subscription.items.data[0]?.price;
  if (price?.metadata?.plan_code) return price.metadata.plan_code;
  if (typeof price?.product === "string") {
    const product = await stripe.products.retrieve(price.product);
    if (product.metadata?.plan_code) return product.metadata.plan_code;
  } else if (price?.product && typeof price.product !== "string" && "metadata" in price.product) {
    const code = (price.product as Stripe.Product).metadata?.plan_code;
    if (code) return code;
  }
  return "pro";
}

async function upsertOrgSubscription(
  service: ReturnType<typeof createClient>,
  params: {
    organizationId: string;
    customerId: string;
    subscriptionId: string;
    planCode: string;
    status: string;
    cycle: string;
    currency: string;
    periodStart?: number | null;
    periodEnd?: number | null;
    cancelAtPeriodEnd?: boolean;
  },
) {
  const { data: existing } = await service
    .from("organization_subscriptions")
    .select("id")
    .eq("organization_id", params.organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const patch: Record<string, unknown> = {
    plan_code: params.planCode,
    status: params.status,
    stripe_customer_id: params.customerId,
    stripe_subscription_id: params.subscriptionId,
    billing_cycle: params.cycle,
    currency: params.currency.toUpperCase(),
    cancel_at_period_end: !!params.cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  };
  if (params.periodStart) {
    patch.current_period_start = new Date(params.periodStart * 1000).toISOString();
  }
  if (params.periodEnd) {
    patch.current_period_end = new Date(params.periodEnd * 1000).toISOString();
  }

  // Sync storage quota from catalog when plan changes via Stripe
  const { data: plan } = await service
    .from("subscription_plans")
    .select("storage_mb")
    .eq("code", params.planCode)
    .maybeSingle();
  if (plan?.storage_mb != null) patch.storage_quota_mb = plan.storage_mb;

  if (existing?.id) {
    await service.from("organization_subscriptions").update(patch).eq("id", existing.id);
  } else {
    await service.from("organization_subscriptions").insert({
      organization_id: params.organizationId,
      ...patch,
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405, headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("stripe_not_configured", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing_signature", { status: 400, headers: corsHeaders });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] signature", err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400, headers: corsHeaders });
  }

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const organizationId =
          session.metadata?.organization_id || session.client_reference_id || "";
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (!organizationId || !subscriptionId || !customerId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planCode = await resolvePlanCode(stripe, subscription);
        const cycle =
          subscription.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
        await upsertOrgSubscription(service, {
          organizationId,
          customerId,
          subscriptionId,
          planCode,
          status: mapStripeStatus(subscription.status),
          cycle,
          currency: subscription.currency || session.currency || "mad",
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        let orgId = organizationId;
        if (!orgId) {
          const { data: row } = await service
            .from("organization_subscriptions")
            .select("organization_id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
            .maybeSingle();
          orgId = row?.organization_id;
        }
        if (!orgId) break;

        const planCode =
          event.type === "customer.subscription.deleted"
            ? "free"
            : await resolvePlanCode(stripe, subscription);
        const cycle =
          subscription.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
        await upsertOrgSubscription(service, {
          organizationId: orgId,
          customerId,
          subscriptionId: subscription.id,
          planCode,
          status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : mapStripeStatus(subscription.status),
          cycle,
          currency: subscription.currency || "mad",
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        await service
          .from("organization_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }
      default:
        break;
    }
  } catch (e: any) {
    console.error("[stripe-webhook] handler", event.type, e);
    return new Response("handler_error", { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
