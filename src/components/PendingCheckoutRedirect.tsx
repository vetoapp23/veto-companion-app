import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { startCheckoutSession, type BillingCycle, type BillingCurrency } from "@/lib/stripeBilling";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

export const PENDING_PLAN_KEY = "pending_plan_upgrade";

export type PendingPlanPayload = {
  planCode: string;
  cycle?: BillingCycle;
  currency?: BillingCurrency;
};

function normalizePending(raw: unknown): PendingPlanPayload | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    if (!raw || raw === "free") return null;
    if (raw.startsWith("{")) {
      try {
        return normalizePending(JSON.parse(raw));
      } catch {
        return null;
      }
    }
    return { planCode: raw, cycle: "monthly", currency: "MAD" };
  }
  if (typeof raw === "object") {
    const o = raw as PendingPlanPayload;
    if (!o.planCode || o.planCode === "free") return null;
    return {
      planCode: o.planCode,
      cycle: o.cycle === "yearly" ? "yearly" : "monthly",
      currency: (["MAD", "EUR", "USD"].includes(String(o.currency || ""))
        ? o.currency
        : "MAD") as BillingCurrency,
    };
  }
  return null;
}

export function readPendingPlan(): PendingPlanPayload | null {
  try {
    return normalizePending(localStorage.getItem(PENDING_PLAN_KEY));
  } catch {
    return null;
  }
}

export function writePendingPlan(payload: PendingPlanPayload) {
  localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(payload));
}

export function clearPendingPlan() {
  localStorage.removeItem(PENDING_PLAN_KEY);
}

function readPendingFromSearch(params: URLSearchParams): PendingPlanPayload | null {
  const billing = params.get("billing");
  const plan = params.get("plan");
  if (billing !== "checkout" && !plan) return null;
  if (!plan || plan === "free") {
    // billing=checkout alone → fall through to metadata / localStorage
    return null;
  }
  const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly";
  const currencyRaw = (params.get("currency") || "MAD").toUpperCase();
  const currency = (["MAD", "EUR", "USD"].includes(currencyRaw) ? currencyRaw : "MAD") as BillingCurrency;
  return { planCode: plan, cycle, currency };
}

/**
 * After signup / email verify / login, if the clinic admin chose a paid plan,
 * redirect them to Stripe Checkout instead of leaving them on the free dashboard.
 */
export function PendingCheckoutRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const started = useRef(false);
  const [busy, setBusy] = useState(false);

  const wantsCheckout =
    searchParams.get("billing") === "checkout" ||
    !!searchParams.get("plan") ||
    !!readPendingPlan();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user || started.current) return;

    const role = (user.profile?.role as string) || "";
    if (role !== "admin" && role !== "super_admin") return;

    const fromUrl = readPendingFromSearch(searchParams);
    const fromLocal = readPendingPlan();
    const metaAlreadyChecked = sessionStorage.getItem("pending_plan_meta_checked") === "1";

    // Rien côté URL/local et metadata déjà lue → stop
    if (!fromUrl && !fromLocal && !wantsCheckout && metaAlreadyChecked) {
      return;
    }

    started.current = true;
    if (fromUrl || fromLocal || wantsCheckout) setBusy(true);

    (async () => {
      try {
        let pending = fromUrl || fromLocal;

        if (!pending?.planCode) {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data } = await supabase.auth.getUser();
          pending = normalizePending(data.user?.user_metadata?.pending_plan);
          sessionStorage.setItem("pending_plan_meta_checked", "1");
          if (pending?.planCode) setBusy(true);
        }

        if (!pending?.planCode) {
          started.current = false;
          setBusy(false);
          if (searchParams.get("billing") === "checkout") {
            const next = new URLSearchParams(searchParams);
            next.delete("billing");
            next.delete("plan");
            next.delete("cycle");
            next.delete("currency");
            setSearchParams(next, { replace: true });
          }
          return;
        }

        writePendingPlan(pending);

        toast({
          title: t("billing.redirectTitle", { defaultValue: "Paiement" }),
          description: t("billing.redirectBody", {
            defaultValue: "Redirection vers Stripe Checkout pour finaliser votre abonnement…",
          }),
        });
        const url = await startCheckoutSession({
          planCode: pending.planCode,
          cycle: pending.cycle ?? "monthly",
          currency: pending.currency ?? "MAD",
        });
        clearPendingPlan();
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.auth.updateUser({ data: { pending_plan: null } });
        } catch {
          /* non-blocking */
        }
        window.location.assign(url);
      } catch (e: any) {
        started.current = false;
        setBusy(false);
        const errCode = e?.message || String(e);
        toast({
          title: tc("error"),
          description:
            errCode === "stripe_not_configured" || String(errCode).includes("stripe_not_configured")
              ? t("billing.notConfigured", {
                  defaultValue:
                    "Stripe n’est pas configuré sur le serveur (secrets Edge Functions manquants). Ajoutez STRIPE_SECRET_KEY dans Supabase → Edge Functions → Secrets, puis réessayez depuis Tarifs.",
                })
              : t("billing.checkoutFailed", {
                  defaultValue: `Impossible d’ouvrir le paiement (${errCode}). Vous pouvez réessayer depuis Tarifs.`,
                }),
          variant: "destructive",
        });
        if (errCode === "invalid_plan" || errCode === "price_not_found") clearPendingPlan();
      }
    })();
  }, [isAuthenticated, isLoading, user, toast, t, tc, searchParams, setSearchParams, wantsCheckout]);

  if (!busy) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {t("billing.redirectBody", {
          defaultValue: "Redirection vers Stripe Checkout…",
        })}
      </p>
    </div>
  );
}
