// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Sparkles, ArrowRight, HardDrive, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Currency = "MAD" | "EUR" | "USD";
type Cycle = "monthly" | "yearly";

interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  description: string | null;
  prices: Record<Cycle, Record<Currency, number>>;
  storage_mb: number;
  max_users: number;
  max_clients: number | null;
  max_animals: number | null;
  features: string[];
  is_highlighted: boolean;
  display_order: number;
}

const CURRENCY_SYMBOL: Record<Currency, string> = { MAD: "MAD", EUR: "€", USD: "$" };

function detectCurrency(): Currency {
  if (typeof navigator === "undefined") return "EUR";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.includes("ar") || lang.includes("-ma")) return "MAD";
  if (lang.startsWith("fr") || lang.startsWith("de") || lang.startsWith("es") || lang.startsWith("it")) return "EUR";
  if (lang.startsWith("en-us")) return "USD";
  return "EUR";
}

export default function Pricing() {
  const { t } = useTranslation("marketing");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>(detectCurrency());
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const formatStorage = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} ${t("pricing.unitGb")}`;
    }
    return `${mb} ${t("pricing.unitMb")}`;
  };

  const formatPrice = (amount: number, cur: Currency): string => {
    if (amount === 0) return t("pricing.free");
    const symbol = CURRENCY_SYMBOL[cur];
    return cur === "MAD" ? `${amount} ${symbol}` : `${symbol}${amount}`;
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) {
        console.error("Failed to load subscription plans:", error);
      } else if (data) {
        setPlans(
          (data as unknown as Plan[]).map((p) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : [],
            prices: p.prices && typeof p.prices === "object" ? p.prices : {},
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const yearlyDiscount = useMemo(() => "20%", []);

  return (
    <div className="marketing-shell min-h-screen">
      <SeoHead
        title={t("pricing.seoTitle")}
        description={t("pricing.seoDescription")}
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("nav.home"), item: siteUrl("/") },
            { "@type": "ListItem", position: 2, name: t("nav.pricing"), item: siteUrl("/pricing") },
          ],
        }}
      />
      <header
        className="mk-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--mk-mist)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--mk-line)",
        }}
      >
        <Link to="/" className="mk-brand" aria-label={t("nav.homeAria")}>
          Veto<span>Crm</span>
        </Link>
        <nav className="mk-nav-links" aria-label={t("nav.mainNavAria")}>
          <Link to="/login" className="mk-link">
            {t("nav.signIn")}
          </Link>
          <LanguageSwitcher variant="marketing" />
          <Link to="/register" className="mk-btn mk-btn-primary">
            {t("nav.getStarted")}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16 text-center">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-4">
          <Badge variant="secondary" className="gap-1 rounded-full">
            <Sparkles className="h-3 w-3" /> {t("pricing.badge")}
          </Badge>
          <h1 className="mk-display text-3xl md:text-5xl font-bold tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-base md:text-lg" style={{ color: "var(--mk-muted)" }}>
            {t("pricing.subtitle")}
          </p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Tabs value={cycle} onValueChange={(v) => setCycle(v as Cycle)}>
              <TabsList>
                <TabsTrigger value="monthly">{t("pricing.monthly")}</TabsTrigger>
                <TabsTrigger value="yearly">
                  {t("pricing.yearly")}
                  <Badge variant="secondary" className="ml-2">
                    −{yearlyDiscount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAD">{t("pricing.currencyMad")}</SelectItem>
                <SelectItem value="EUR">{t("pricing.currencyEur")}</SelectItem>
                <SelectItem value="USD">{t("pricing.currencyUsd")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">{t("pricing.loading")}</div>
          ) : plans.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">{t("pricing.empty")}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const price = plan.prices?.[cycle]?.[currency] ?? 0;
                const isFree = plan.code === "free";
                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col ${
                      plan.is_highlighted ? "border-primary shadow-lg ring-2 ring-primary/20" : ""
                    }`}
                  >
                    {plan.is_highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {t("pricing.mostPopular")}
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.tagline}</CardDescription>
                      <div className="pt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{formatPrice(price, currency)}</span>
                          {!isFree && (
                            <span className="text-sm text-muted-foreground">
                              /{cycle === "monthly" ? t("pricing.perMonth") : t("pricing.perYear")}
                            </span>
                          )}
                        </div>
                        {!isFree && cycle === "yearly" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("pricing.equivalentMonthly", {
                              price: formatPrice(Math.round(price / 12), currency),
                            })}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {t("pricing.usersShort", { count: plan.max_users })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {formatStorage(plan.storage_mb)}
                        </span>
                      </div>
                      <ul className="space-y-2 text-sm flex-1">
                        {(plan.features ?? []).map((feat, i) => (
                          <li key={i} className="flex gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-6 w-full gap-2"
                        variant={plan.is_highlighted ? "default" : "outline"}
                        asChild
                      >
                        <Link to={`/register?plan=${plan.code}`}>
                          {isFree ? t("pricing.startFree") : t("pricing.choosePlan")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Storage info */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("pricing.storageTitle")}</h2>
            <p className="text-muted-foreground">{t("pricing.storageBody")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("pricing.compressionTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("pricing.compressionBody")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("pricing.quotasTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("pricing.quotasBody")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("pricing.paygTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("pricing.paygBody", {
                  price: formatPrice(currency === "MAD" ? 50 : 5, currency),
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t py-6" style={{ borderColor: "var(--mk-line)" }}>
        <div
          className="container mx-auto px-4 md:px-6 text-center text-sm"
          style={{ color: "var(--mk-muted)" }}
        >
          {t("pricing.footerNote")}
        </div>
      </footer>
    </div>
  );
}
