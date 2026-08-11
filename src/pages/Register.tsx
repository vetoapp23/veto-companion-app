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
import {
  buildPlanMarketingBullets,
  resolvePlanDisplayName,
  resolvePlanTagline,
} from "@/lib/planMarketing";

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
  features: unknown;
  limits: Record<string, boolean> | null;
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
  const { t: tm, i18n } = useTranslation("marketing");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const urlPlan = searchParams.get("plan") ?? "free";
  const urlMode = searchParams.get("mode");
  const urlCode = searchParams.get("code") ?? "";
  const urlCycle = (searchParams.get("cycle") === "yearly" ? "yearly" : "monthly") as Cycle;
  const urlCurrency = (["MAD", "EUR", "USD"].includes(searchParams.get("currency") ?? "")
    ? searchParams.get("currency")
    : null) as Currency | null;

  const isJoinMode = urlMode === "assistant" || urlMode === "vet" || urlMode === "join";
  const initialJoinRole: "admin" | "assistant" =
    urlMode === "vet" || searchParams.get("role") === "admin" ? "admin" : "assistant";

  const [step, setStep] = useState<Step>(isJoinMode ? "account" : "plan");
  const [selectedPlan, setSelectedPlan] = useState<string>(urlPlan);
  const [currency, setCurrency] = useState<Currency>(urlCurrency ?? detectCurrency());
  const [cycle] = useState<Cycle>(urlCycle);
  const [isJoiningOrganization, setIsJoiningOrganization] = useState(isJoinMode);
  const [joinRole, setJoinRole] = useState<"admin" | "assistant">(initialJoinRole);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    organizationCode: urlCode.toUpperCase(),
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
          features: p.features ?? null,
          limits: p.limits && typeof p.limits === "object" ? p.limits : {},
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
      const appOrigin = (await import("@/lib/appUrl")).getAppOrigin();
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
        p_role: isJoiningOrganization ? joinRole : "admin",
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
            onValueChange={(code) => {
              setSelectedPlan(code);
              // Keep Continue visible after tap on long plan lists (mobile)
              requestAnimationFrame(() => {
                document.getElementById("register-plan-cta")?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              });
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-28 md:pb-4"
          >
            {plans.map((plan) => {
              const price = plan.prices?.[cycle]?.[currency] ?? 0;
              const selected = selectedPlan === plan.code;
              const displayName = resolvePlanDisplayName(plan, i18n.language);
              const displayTagline = resolvePlanTagline(plan, i18n.language);
              const bullets = buildPlanMarketingBullets(plan, i18n.language, tm);
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
                      <CardTitle className="text-lg">{displayName}</CardTitle>
                      {displayTagline && (
                        <CardDescription className="text-xs">{displayTagline}</CardDescription>
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
                        {bullets.map((f, i) => (
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

          <div className="hidden md:flex items-center justify-between mt-8 max-w-2xl mx-auto">
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
            <Button onClick={() => setStep("account")} size="lg" disabled={!selectedPlan}>
              {t("register.continue")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 mb-4 md:mb-0">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("register.signIn")}
            </Link>
          </p>
          <p className="md:hidden text-center">
            <Button
              variant="link"
              className="text-muted-foreground"
              onClick={() => {
                setIsJoiningOrganization(true);
                setStep("account");
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("register.joinExistingClinic")}
            </Button>
          </p>
        </div>

        {/* Sticky Continue — always visible on mobile once a plan is selected */}
        {selectedPlan ? (
          <div
            id="register-plan-cta"
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          >
            <div className="mx-auto flex max-w-lg items-center gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">
                  {currentPlan
                    ? resolvePlanDisplayName(currentPlan, i18n.language)
                    : selectedPlan}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("register.continue")}
                </p>
              </div>
              <Button
                className="shrink-0"
                size="lg"
                onClick={() => setStep("account")}
              >
                {t("register.continue")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
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
                ? joinRole === "admin"
                  ? t("register.joinAsVet")
                  : t("register.joinAsAssistant")
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
                  <div className="space-y-2">
                    <Label>{t("register.joinRoleLabel")}</Label>
                    <RadioGroup
                      value={joinRole}
                      onValueChange={(v) => setJoinRole(v as "admin" | "assistant")}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      <label
                        htmlFor="join-role-admin"
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          joinRole === "admin" ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <RadioGroupItem value="admin" id="join-role-admin" className="mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium">{t("register.joinRoleVet")}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t("register.joinRoleVetHint")}
                          </span>
                        </span>
                      </label>
                      <label
                        htmlFor="join-role-assistant"
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          joinRole === "assistant" ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <RadioGroupItem value="assistant" id="join-role-assistant" className="mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium">{t("register.joinRoleAssistant")}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t("register.joinRoleAssistantHint")}
                          </span>
                        </span>
                      </label>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="organizationCode">
                      {t("register.orgCodeLabel")}
                    </Label>
                    <Input
                      id="organizationCode"
                      value={formData.organizationCode}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationCode: e.target.value.toUpperCase() })
                      }
                      placeholder="ABC123"
                      className="font-mono tracking-wider uppercase"
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

              {!isJoiningOrganization && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t("login.or")}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    disabled={isLoading || !acceptedTerms || googleLoading}
                    onClick={async () => {
                      if (!acceptedTerms) return;
                      setGoogleLoading(true);
                      try {
                        if (selectedPlan !== "free") {
                          const { writePendingPlan } = await import(
                            "@/components/PendingCheckoutRedirect"
                          );
                          writePendingPlan({ planCode: selectedPlan, cycle, currency });
                        }
                        const { signInWithGoogle } = await import("@/lib/supabase");
                        await signInWithGoogle({ next: "/auth/callback" });
                      } catch (e) {
                        console.error(e);
                        toast({
                          title: t("register.errorTitle"),
                          description: t("login.googleError"),
                          variant: "destructive",
                        });
                        setGoogleLoading(false);
                      }
                    }}
                  >
                    {googleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {t("login.continueGoogle")}
                  </Button>
                </>
              )}
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
