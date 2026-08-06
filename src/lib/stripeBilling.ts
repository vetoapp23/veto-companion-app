import { supabase } from "@/integrations/supabase/client";

export type BillingCycle = "monthly" | "yearly";
export type BillingCurrency = "MAD" | "EUR" | "USD";

function throwInvokeError(data: any, error: any, fallback: string): never {
  const code =
    data?.error ||
    (typeof data === "string" ? data : null) ||
    error?.message ||
    fallback;
  throw new Error(typeof code === "string" ? code : fallback);
}

async function createCheckoutViaDevProxy(params: {
  planCode: string;
  cycle: BillingCycle;
  currency: BillingCurrency;
}): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("unauthorized");

  const res = await fetch("/__dev/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      plan_code: params.planCode,
      cycle: params.cycle,
      currency: params.currency,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(String(data?.error || "checkout_failed"));
  if (!data?.url) throw new Error("checkout_url_missing");
  return data.url as string;
}

export async function startCheckoutSession(params: {
  planCode: string;
  cycle?: BillingCycle;
  currency?: BillingCurrency;
}): Promise<string> {
  const cycle = params.cycle ?? "monthly";
  const currency = params.currency ?? "MAD";

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      plan_code: params.planCode,
      cycle,
      currency,
    },
  });

  const code = data?.error ? String(data.error) : null;
  if (code === "stripe_not_configured" && import.meta.env.DEV) {
    return createCheckoutViaDevProxy({ planCode: params.planCode, cycle, currency });
  }
  if (code) throw new Error(code);

  if (error) {
    const msg = String(error.message || "");
    if (
      (msg.includes("stripe_not_configured") || code === "stripe_not_configured") &&
      import.meta.env.DEV
    ) {
      return createCheckoutViaDevProxy({ planCode: params.planCode, cycle, currency });
    }
    // Edge often returns opaque FunctionsHttpError when secrets missing — try local proxy in DEV
    if (import.meta.env.DEV) {
      try {
        return await createCheckoutViaDevProxy({
          planCode: params.planCode,
          cycle,
          currency,
        });
      } catch {
        throwInvokeError(data, error, "checkout_failed");
      }
    }
    throwInvokeError(data, error, "checkout_failed");
  }
  if (!data?.url) throw new Error("checkout_url_missing");
  return data.url as string;
}

export async function openBillingPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    body: {},
  });
  if (data?.error) throw new Error(String(data.error));
  if (error) throwInvokeError(data, error, "portal_failed");
  if (!data?.url) throw new Error("portal_url_missing");
  return data.url as string;
}
