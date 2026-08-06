// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2, Building2, UserPlus, Check, Sparkles, HardDrive, Users, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SeoHead } from "@/components/SeoHead";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Currency = "MAD" | "EUR" | "USD";
type Cycle = "monthly" | "yearly";

interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
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
  if (lang.startsWith("en-us")) return "USD";
  return "EUR";
}

function formatStorage(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} Go` : `${mb} Mo`;
}

type Step = "plan" | "account";

const Register = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const urlPlan = searchParams.get("plan") ?? "free";
  const urlMode = searchParams.get("mode");
  const urlCycle = (searchParams.get("cycle") === "yearly" ? "yearly" : "monthly") as Cycle;
  const urlCurrency = (["MAD", "EUR", "USD"].includes(searchParams.get("currency") ?? "")
    ? searchParams.get("currency")
    : null) as Currency | null;

  const [step, setStep] = useState<Step>(urlMode === "assistant" ? "account" : "plan");
  const [selectedPlan, setSelectedPlan] = useState<string>(urlPlan);
  const [currency, setCurrency] = useState<Currency>(urlCurrency ?? detectCurrency());
  const [cycle] = useState<Cycle>(urlCycle);
  const [isJoiningOrganization, setIsJoiningOrganization] = useState(urlMode === "assistant");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    organizationCode: "",
  });

  const formatPrice = (amount: number, curr: Currency) => {
    if (amount === 0) return t("register.free");
    const s = CURRENCY_SYMBOL[curr];
    return curr === "MAD" ? `${amount} ${s}` : `${s}${amount}`;
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("subscription_plans" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) {
        console.error("Failed to load subscription plans:", error);
        setPlans([]);
        return;
      }
      setPlans(
        ((data as unknown as Plan[]) ?? []).map((p) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
          prices: p.prices && typeof p.prices === "object" ? p.prices : {},
        }))
      );
    })();
  }, []);

  const currentPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlan),
    [plans, selectedPlan]
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.fullName || !formData.email || !formData.password)
        throw new Error(t("register.errors.requiredFields"));
      if (formData.password !== formData.confirmPassword)
        throw new Error(t("register.errors.passwordMismatch"));
      if (formData.password.length < 8)
        throw new Error(t("register.errors.passwordMin"));
      if (isJoiningOrganization && !formData.organizationCode)
        throw new Error(t("register.errors.orgCodeRequired"));
      if (!isJoiningOrganization && !formData.clinicName)
        throw new Error(t("register.errors.clinicNameRequired"));
      if (!acceptedTerms)
        throw new Error(t("register.errors.acceptTerms"));

      const { data: flagRow } = await supabase
        .from("platform_settings" as any)
        .select("value")
        .eq("key", "feature_flags")
        .maybeSingle();
      if ((flagRow as any)?.value?.block_registrations) {
        throw new Error(t("register.errors.registrationsClosed"));
      }

      // Plan payant : stocké dans user_metadata dès le signUp (même sans session —
      // updateUser échoue si email non confirmé) + dans l’URL du lien de confirmation.
      const pending =
        !isJoiningOrganization && selectedPlan !== "free"
          ? { planCode: selectedPlan, cycle, currency }
          : null;
      const appOrigin = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
      const emailRedirectTo = pending
        ? `${appOrigin}/dashboard?billing=checkout&plan=${encodeURIComponent(pending.planCode)}&cycle=${pending.cycle}&currency=${pending.currency}`
        : `${appOrigin}/dashboard`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          data: pending ? { pending_plan: pending } : undefined,
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error(t("register.errors.accountCreate"));

      const { data: profileData, error: profileError } = await supabase.rpc("create_user_profile", {
        p_user_id: authData.user.id,
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_role: isJoiningOrganization ? "assistant" : "admin",
        p_organization_code: isJoiningOrganization ? formData.organizationCode : null,
        p_clinic_name: !isJoiningOrganization ? formData.clinicName : null,
        p_clinic_address: !isJoiningOrganization ? formData.clinicAddress : null,
        p_phone: !isJoiningOrganization ? formData.phone : null,
      });

      if (profileError) throw new Error(profileError.message);
      if (profileData && !(profileData as any).success)
        throw new Error((profileData as any).error || t("register.errors.profileCreate"));

      if (pending && (profileData as any)?.organization_id) {
        const { writePendingPlan } = await import("@/components/PendingCheckoutRedirect");
        writePendingPlan(pending);
        // Seulement si session déjà active (confirm email désactivé)
        if (authData.session) {
          await supabase.auth.updateUser({ data: { pending_plan: pending } }).catch(() => undefined);
        }
      }

      toast({
        title: t("register.successTitle"),
        description: isJoiningOrganization
          ? t("register.successJoin")
          : t("register.successCreate", { name: currentPlan?.name ?? selectedPlan }),
      });

      // Si session déjà active (confirm email désactivé), aller au dashboard → Checkout
      if (authData.session) {
        navigate(pending ? "/dashboard?billing=checkout" : "/dashboard");
      } else {
        const loginRedirect = pending
          ? `/dashboard?billing=checkout&plan=${encodeURIComponent(pending.planCode)}&cycle=${pending.cycle}&currency=${pending.currency}`
          : "/dashboard";
        navigate(`/login?redirect=${encodeURIComponent(loginRedirect)}&pending_plan=1`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: t("register.errorTitle"),
        description: error instanceof Error ? error.message : t("register.errors.accountCreate"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------- STEP 1 : choix du pack -------
  if (step === "plan" && !isJoiningOrganization) {
    return (
      <div className="marketing-shell min-h-screen px-4 py-10">
        <SeoHead
          title={t("seo.registerPlanTitle")}
          description={t("seo.registerPlanDescription")}
          path="/register"
        />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link to="/" className="mk-brand text-xl sm:text-2xl">
              Veto<span>Crm</span>
            </Link>
            <LanguageSwitcher variant="marketing" />
          </div>
          <div className="text-center mb-8">
            <h1 className="mk-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t("register.choosePlanTitle")}</h1>
            <p style={{ color: "var(--mk-muted)" }}>
              {t("register.choosePlanSub")}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {(["MAD", "EUR", "USD"] as Currency[]).map((c) => (
                <Button
                  key={c}
                  variant={currency === c ? "default" : "outline"}
                  size="sm"
                  className={currency === c ? undefined : "mk-currency-btn"}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {plans.map((plan) => {
              const price = plan.prices?.[cycle]?.[currency] ?? 0;
              const selected = selectedPlan === plan.code;
              return (
                <label key={plan.id} htmlFor={plan.code} className="cursor-pointer">
                  <RadioGroupItem id={plan.code} value={plan.code} className="sr-only" />
                  <Card
                    className={`h-full transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary shadow-lg"
                        : "hover:border-primary/50"
                    } ${plan.is_highlighted ? "relative" : ""}`}
                  >
                    {plan.is_highlighted && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t("register.popular")}
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.tagline && (
                        <CardDescription className="text-xs">{plan.tagline}</CardDescription>
                      )}
                      <div className="pt-2">
                        <span className="text-3xl font-bold">{formatPrice(price, currency)}</span>
                        {price > 0 && (
                          <span className="text-xs text-muted-foreground">{t("register.perMonth")}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>{t("register.storagePhotos", { size: formatStorage(plan.storage_mb) })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{t("register.users", { count: plan.max_users })}</span>
                      </div>
                      <ul className="space-y-1 pt-2 border-t">
                        {(plan.features || []).slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </label>
              );
            })}
          </RadioGroup>

          <div className="flex items-center justify-between mt-8 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => {
                setIsJoiningOrganization(true);
                setStep("account");
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("register.joinExistingClinic")}
            </Button>
            <Button onClick={() => setStep("account")} size="lg">
              {t("register.continue")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ------- STEP 2 : compte -------
  return (
    <div className="marketing-shell min-h-screen flex items-center justify-center px-4 py-8">
      <SeoHead
        title={t("seo.registerAccountTitle")}
        description={t("seo.registerAccountDescription")}
        path="/register"
      />
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="mk-brand text-lg">
            Veto<span>Crm</span>
          </Link>
          <LanguageSwitcher variant="marketing" />
        </div>
        <Card className="w-full rounded-2xl border shadow-[var(--shadow-card)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {isJoiningOrganization ? (
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserPlus className="h-10 w-10 text-primary" />
                </div>
              ) : (
                <div className="p-3 bg-primary/10 rounded-full">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="mk-display text-3xl font-bold">
              {isJoiningOrganization ? t("register.joinClinicTitle") : t("register.createAccountTitle")}
            </CardTitle>
            <CardDescription className="text-base">
              {isJoiningOrganization
                ? t("register.joinAsAssistant")
                : currentPlan
                ? t("register.selectedPlan", { name: currentPlan.name })
                : t("register.clinicSignup")}
            </CardDescription>
            {!isJoiningOrganization && (
              <Button
                variant="link"
                size="sm"
                className="mx-auto"
                onClick={() => setStep("plan")}
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                {t("register.changePlan")}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  {t("register.personalInfo")}
                </h3>
                <div>
                  <Label htmlFor="fullName">{t("register.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Dr. Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("register.emailRequired")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">{t("register.passwordRequired")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t("register.passwordMinHint")}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {isJoiningOrganization && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    {t("register.orgCodeSection")}
                  </h3>
                  <div>
                    <Label htmlFor="organizationCode">
                      {t("register.orgCodeLabel")}
                    </Label>
                    <Input
                      id="organizationCode"
                      value={formData.organizationCode}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationCode: e.target.value })
                      }
                      placeholder="ABC123"
                      required
                    />
                  </div>
                </div>
              )}

              {!isJoiningOrganization && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    {t("register.clinicInfo")}
                  </h3>
                  <div>
                    <Label htmlFor="clinicName">{t("register.clinicName")}</Label>
                    <Input
                      id="clinicName"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      placeholder="Clinique Vétérinaire Centrale"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicAddress">{t("register.address")}</Label>
                    <Input
                      id="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, clinicAddress: e.target.value })
                      }
                      placeholder="123 Rue Example, Ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("register.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+212 6 12 34 56 78"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed">
                  {t("register.acceptTermsPrefix")}{" "}
                  <Link to="/terms" className="text-primary underline font-medium" target="_blank" rel="noreferrer">
                    {t("register.termsLink")}
                  </Link>{" "}
                  {t("register.acceptAnd")}{" "}
                  <Link to="/privacy" className="text-primary underline font-medium" target="_blank" rel="noreferrer">
                    {t("register.privacyLink")}
                  </Link>
                  .{" "}
                  <Link to="/refund" className="text-primary underline font-medium" target="_blank" rel="noreferrer">
                    {t("register.refundLink")}
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || !acceptedTerms}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("register.registering")}
                  </>
                ) : (
                  <>
                    {isJoiningOrganization ? t("register.joinClinic") : t("register.createAccount")}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-2 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                {t("register.haveAccount")}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t("register.signIn")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
