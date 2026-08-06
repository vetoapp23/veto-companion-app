import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Check,
  Sparkles,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { StorageUsageCard } from "@/components/StorageUsageCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { openBillingPortal, startCheckoutSession, type BillingCurrency, type BillingCycle } from "@/lib/stripeBilling";
import { SeoHead } from "@/components/SeoHead";

type Currency = BillingCurrency;
type Cycle = BillingCycle;

interface PlanRow {
  code: string;
  name: string;
  tagline: string | null;
  prices: Record<Cycle, Record<Currency, number>>;
  storage_mb: number;
  max_users: number;
  is_highlighted: boolean;
  display_order: number;
  is_active: boolean;
}

interface SubRow {
  plan_code: string;
  status: string;
  billing_cycle: string | null;
  currency: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  custom_price: number | null;
}

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  method: string | null;
  reference: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  plan_code: string | null;
  notes: string | null;
}

const CURRENCY_SYMBOL: Record<Currency, string> = { MAD: "MAD", EUR: "€", USD: "$" };

function formatMoney(amount: number, currency: string) {
  const cur = (["MAD", "EUR", "USD"].includes(currency) ? currency : "MAD") as Currency;
  const s = CURRENCY_SYMBOL[cur];
  return cur === "MAD" ? `${amount} ${s}` : `${s}${amount}`;
}

function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function BillingSettings() {
  const { t, i18n } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { user } = useAuth();
  const { quota, refetch } = usePlanLimits();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [currency, setCurrency] = useState<Currency>("MAD");
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const orgId = user?.organization_id || user?.profile?.organization_id;
  const isAdmin =
    user?.profile?.role === "admin" || user?.profile?.role === "super_admin";
  const locale = i18n.language?.startsWith("fr")
    ? "fr-FR"
    : i18n.language?.startsWith("es")
      ? "es-ES"
      : "en-GB";

  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      toast({
        title: t("billingPage.successTitle", { defaultValue: "Paiement reçu" }),
        description: t("billingPage.successBody", {
          defaultValue:
            "Votre abonnement est en cours d’activation. Les quotas se mettent à jour sous peu.",
        }),
      });
      void refetch();
      searchParams.delete("billing");
      searchParams.delete("session_id");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast, t, refetch]);

  const subQuery = useQuery({
    queryKey: ["org-subscription", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<SubRow | null> => {
      const { data, error } = await supabase
        .from("organization_subscriptions")
        .select(
          "plan_code,status,billing_cycle,currency,current_period_start,current_period_end,cancel_at_period_end,stripe_customer_id,stripe_subscription_id,custom_price",
        )
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SubRow | null;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["org-payments", orgId],
    enabled: !!orgId && isAdmin,
    queryFn: async (): Promise<PaymentRow[]> => {
      const { data, error } = await supabase
        .from("platform_subscription_payments")
        .select(
          "id,amount,currency,method,reference,paid_at,period_start,period_end,status,plan_code,notes",
        )
        .eq("organization_id", orgId!)
        .order("paid_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as PaymentRow[];
    },
  });

  const plansQuery = useQuery({
    queryKey: ["billing-plans"],
    queryFn: async (): Promise<PlanRow[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select(
          "code,name,tagline,prices,storage_mb,max_users,is_highlighted,display_order,is_active",
        )
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as PlanRow[];
    },
  });

  const currentPlan = quota?.plan_code || subQuery.data?.plan_code || "free";
  const sub = subQuery.data;

  useEffect(() => {
    if (sub?.billing_cycle === "yearly" || sub?.billing_cycle === "monthly") {
      setCycle(sub.billing_cycle);
    }
    if (sub?.currency && ["MAD", "EUR", "USD"].includes(sub.currency)) {
      setCurrency(sub.currency as Currency);
    }
  }, [sub?.billing_cycle, sub?.currency]);

  const plans = useMemo(
    () => (plansQuery.data || []).filter((p) => p.code !== "free" || currentPlan === "free"),
    [plansQuery.data, currentPlan],
  );

  const handleCheckout = async (planCode: string) => {
    if (!isAdmin) {
      toast({
        title: tc("error"),
        description: t("billingPage.adminOnly", {
          defaultValue: "Seul l’administrateur peut changer d’abonnement.",
        }),
        variant: "destructive",
      });
      return;
    }
    if (planCode === "free") {
      toast({
        title: t("billingPage.freeTitle", { defaultValue: "Pack gratuit" }),
        description: t("billingPage.freeBody", {
          defaultValue: "Pour repasser en gratuit, gérez l’abonnement via le portail Stripe (annulation).",
        }),
      });
      return;
    }
    setCheckoutPlan(planCode);
    try {
      const url = await startCheckoutSession({ planCode, cycle, currency });
      window.location.href = url;
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message || t("billingPage.checkoutFailed"),
        variant: "destructive",
      });
      setCheckoutPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (e: any) {
      toast({
        title: tc("error"),
        description:
          e?.message === "no_stripe_customer"
            ? t("billingPage.noStripeCustomer")
            : e?.message,
        variant: "destructive",
      });
      setPortalLoading(false);
    }
  };

  const statusLabel = (status: string) =>
    t(`billingPage.status.${status}`, { defaultValue: status });

  return (
    <>
      <SeoHead
        title={t("billingPage.seoTitle", { defaultValue: "Abonnement et paiements — VetoCrm" })}
        noIndex
      />
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/settings">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("billingPage.backSettings", { defaultValue: "Paramètres" })}
            </Link>
          </Button>
        </div>

        <AppPageHeader
          icon={CreditCard}
          title={t("billingPage.title", { defaultValue: "Abonnement et paiements" })}
          description={t("billingPage.description", {
            defaultValue: "Gérez votre pack, vos paiements et l’historique de facturation.",
          })}
          actions={
            isAdmin ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePortal} disabled={portalLoading || !sub?.stripe_customer_id}>
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  {t("billingPage.managePortal", { defaultValue: "Portail Stripe" })}
                </Button>
              </div>
            ) : null
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("billingPage.currentTitle", { defaultValue: "Abonnement actuel" })}
              </CardTitle>
              <CardDescription>
                {quota?.plan_name || currentPlan}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("billingPage.plan")}</span>
                <Badge>{quota?.plan_name || currentPlan}</Badge>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("billingPage.statusLabel")}</span>
                <span className="font-medium">{statusLabel(sub?.status || "active")}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("billingPage.cycle")}</span>
                <span className="font-medium">
                  {sub?.billing_cycle === "yearly"
                    ? t("billingPage.yearly")
                    : t("billingPage.monthly")}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("billingPage.period")}</span>
                <span className="font-medium text-right">
                  {formatDate(sub?.current_period_start, locale)} →{" "}
                  {formatDate(sub?.current_period_end, locale)}
                </span>
              </div>
              {sub?.cancel_at_period_end ? (
                <p className="text-amber-600 dark:text-amber-400 text-xs">
                  {t("billingPage.cancelAtPeriodEnd")}
                </p>
              ) : null}
              {sub?.custom_price != null ? (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("billingPage.customPrice")}</span>
                  <span className="font-medium">
                    {formatMoney(Number(sub.custom_price), sub.currency || "MAD")}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <StorageUsageCard />
          </div>
        </div>

        {/* Change plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("billingPage.changePlanTitle")}
            </CardTitle>
            <CardDescription>{t("billingPage.changePlanBody")}</CardDescription>
            <div className="flex flex-wrap gap-3 pt-2">
              <Tabs value={cycle} onValueChange={(v) => setCycle(v as Cycle)}>
                <TabsList>
                  <TabsTrigger value="monthly">{t("billingPage.monthly")}</TabsTrigger>
                  <TabsTrigger value="yearly">{t("billingPage.yearly")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <TabsList>
                  <TabsTrigger value="MAD">MAD</TabsTrigger>
                  <TabsTrigger value="EUR">EUR</TabsTrigger>
                  <TabsTrigger value="USD">USD</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {plansQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const price = plan.prices?.[cycle]?.[currency] ?? 0;
                  const isCurrent = plan.code === currentPlan;
                  return (
                    <div
                      key={plan.code}
                      className={`rounded-xl border p-4 flex flex-col gap-3 ${
                        plan.is_highlighted ? "border-primary/60 shadow-sm" : ""
                      } ${isCurrent ? "bg-muted/40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{plan.name}</p>
                          {plan.tagline ? (
                            <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                          ) : null}
                        </div>
                        {isCurrent ? (
                          <Badge variant="secondary">{t("billingPage.current")}</Badge>
                        ) : null}
                      </div>
                      <p className="text-2xl font-bold">
                        {price === 0
                          ? t("billingPage.free")
                          : formatMoney(price, currency)}
                        {price > 0 ? (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{cycle === "yearly" ? t("billingPage.year") : t("billingPage.month")}
                          </span>
                        ) : null}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 flex-1">
                        <li className="flex gap-1">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {plan.storage_mb} Mo
                        </li>
                        <li className="flex gap-1">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {plan.max_users}{" "}
                          {t("billingPage.seats", { count: plan.max_users })}
                        </li>
                      </ul>
                      <Button
                        disabled={!isAdmin || isCurrent || checkoutPlan === plan.code}
                        onClick={() => void handleCheckout(plan.code)}
                      >
                        {checkoutPlan === plan.code ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isCurrent
                          ? t("billingPage.current")
                          : t("billingPage.subscribe")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              {t("billingPage.changePlanHint")}
            </p>
          </CardContent>
        </Card>

        {/* Payment history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t("billingPage.historyTitle")}
            </CardTitle>
            <CardDescription>{t("billingPage.historyBody")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isAdmin ? (
              <p className="text-sm text-muted-foreground">{t("billingPage.adminOnly")}</p>
            ) : paymentsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (paymentsQuery.data?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                {t("billingPage.historyEmpty")}
              </p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("billingPage.colDate")}</TableHead>
                      <TableHead>{t("billingPage.colPlan")}</TableHead>
                      <TableHead>{t("billingPage.colAmount")}</TableHead>
                      <TableHead>{t("billingPage.colMethod")}</TableHead>
                      <TableHead>{t("billingPage.colStatus")}</TableHead>
                      <TableHead>{t("billingPage.colRef")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data!.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.paid_at, locale)}</TableCell>
                        <TableCell>{p.plan_code || "—"}</TableCell>
                        <TableCell>
                          {formatMoney(Number(p.amount), p.currency || "MAD")}
                        </TableCell>
                        <TableCell>{p.method || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{statusLabel(p.status)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {p.reference || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {isAdmin && sub?.stripe_customer_id ? (
              <p className="text-xs text-muted-foreground mt-3">
                {t("billingPage.stripeInvoicesHint")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/** Compact entry point shown on the main Settings page */
export function BillingSettingsLinkCard() {
  const { t } = useTranslation("settings");
  const { quota, isFree } = usePlanLimits();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t("billingPage.title")}
        </CardTitle>
        <CardDescription>
          {t("billingPage.linkCardBody", {
            plan: quota?.plan_name || "—",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/settings/billing">
            {t("billingPage.openPage")}
          </Link>
        </Button>
        {isFree ? (
          <Button asChild variant="outline">
            <Link to="/settings/billing#plans">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("storageUsage.upgrade")}
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
