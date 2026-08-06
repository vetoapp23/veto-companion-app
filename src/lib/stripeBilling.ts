import { supabase } from "@/integrations/supabase/client";

export type BillingCycle = "monthly" | "yearly";
export type BillingCurrency = "MAD" | "EUR" | "USD";

export async function startCheckoutSession(params: {
  planCode: string;
  cycle?: BillingCycle;
  currency?: BillingCurrency;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      plan_code: params.planCode,
      cycle: params.cycle ?? "monthly",
      currency: params.currency ?? "MAD",
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.url) throw new Error("checkout_url_missing");
  return data.url as string;
}

export async function openBillingPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    body: {},
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.url) throw new Error("portal_url_missing");
  return data.url as string;
}
