import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoogleLogin, useResetPassword, useLogin } from "@/hooks/useAuth";
import { DemoLoginPanel } from "@/components/DemoLoginPanel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import heroImage from "@/assets/vet-hero.jpg";
import { SeoHead } from "@/components/SeoHead";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "assistant">("admin");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = (() => {
    const raw = searchParams.get("redirect") || "";
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/dashboard";
  })();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("login.fillAllFields"));
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate(redirectTo, { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.unexpectedError"));
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await googleLoginMutation.mutateAsync();
      // OAuth redirects away — no local navigate
    } catch {
      setError(t("login.googleError"));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("forgotPassword.enterEmailError"));
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(email);
      setResetEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forgotPassword.genericError"));
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError("");
    setPassword("");
  };

  const title = isForgotPassword
    ? resetEmailSent
      ? t("forgotPassword.checkEmailTitle")
      : t("forgotPassword.title")
    : t("login.title");

  const description = isForgotPassword
    ? resetEmailSent
      ? t("forgotPassword.linkSent")
      : t("forgotPassword.enterEmail")
    : loginType === "admin"
      ? t("login.adminSpace")
      : t("login.assistantSpace");

  return (
    <div className="marketing-shell mk-login">
      <SeoHead
        title={t("seo.loginTitle")}
        description={t("seo.loginDescription")}
        path="/login"
      />
      <aside className="mk-login-visual">
        <div className="mk-hero-media">
          <img
            src={heroImage}
            alt={t("login.heroAlt")}
            width={1200}
            height={1600}
          />
          <div className="mk-hero-veil" aria-hidden />
          <div className="mk-hero-mesh" aria-hidden />
        </div>
        <div className="mk-login-visual-top">
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher variant="marketingHero" />
            <Link
              to="/"
              className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("login.home")}
            </Link>
          </div>
        </div>
        <div className="mk-login-visual-content">
          <Link to="/" className="mk-brand" style={{ display: "inline-block", marginBottom: "1.5rem" }}>
            Veto<span>Crm</span>
          </Link>
          <h1>{t("login.heroHeadline")}</h1>
          <p>{t("login.heroSub")}</p>
        </div>
      </aside>

      <main className="mk-login-panel">
        <div className="mk-login-mobile-brand lg:hidden flex-wrap gap-2">
          <Link to="/" className="mk-brand" style={{ color: "var(--mk-ink)" }}>
            Veto<span>Crm</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="marketing" />
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[color:var(--mk-line)] bg-[color:var(--mk-surface)] px-2.5 text-sm font-semibold text-[color:var(--mk-ink)] hover:bg-[color:var(--mk-fog)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("login.home")}
            </Link>
          </div>
        </div>

        <div className="mk-login-card">
          <h2>{title}</h2>
          <p className="mk-desc">{description}</p>

          {resetEmailSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.linkSentTo", { email })}
              </p>
              <button type="button" className="mk-btn mk-btn-solid w-full" onClick={handleBackToLogin}>
                <ArrowLeft className="h-4 w-4" />
                {t("forgotPassword.backToLogin")}
              </button>
            </div>
          ) : isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-1">
              {error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mk-field">
                <label htmlFor="reset-email">{t("login.email")}</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="vous@clinique.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                className="mk-btn mk-btn-solid w-full mt-2"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("forgotPassword.sending")}
                  </>
                ) : (
                  t("forgotPassword.sendLink")
                )}
              </button>
              <button
                type="button"
                className="mk-btn mk-btn-outline-dark w-full mt-2"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgotPassword.back")}
              </button>
            </form>
          ) : (
            <>
              <div className="mk-segment" role="tablist" aria-label={t("login.accountType")}>
                <button
                  type="button"
                  role="tab"
                  data-active={loginType === "admin"}
                  aria-selected={loginType === "admin"}
                  onClick={() => setLoginType("admin")}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {t("login.admin")}
                </button>
                <button
                  type="button"
                  role="tab"
                  data-active={loginType === "assistant"}
                  aria-selected={loginType === "assistant"}
                  onClick={() => setLoginType("assistant")}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {t("login.assistant")}
                </button>
              </div>

              {loginType === "assistant" && (
                <p
                  className="text-sm mb-4 rounded-xl px-3 py-2"
                  style={{
                    background: "color-mix(in srgb, var(--mk-teal) 14%, transparent)",
                    color: "var(--mk-deep)",
                  }}
                >
                  {t("login.assistantHint")}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mk-field">
                  <label htmlFor="email">{t("login.email")}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={
                      loginType === "admin"
                        ? t("login.placeholderAdmin")
                        : t("login.placeholderAssistant")
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loginMutation.isPending}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mk-field">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password">{t("login.password")}</label>
                    <button
                      type="button"
                      className="text-xs font-medium"
                      style={{ color: "var(--mk-teal)", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => setIsForgotPassword(true)}
                    >
                      {t("login.forgot")}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loginMutation.isPending}
                      required
                      autoComplete="current-password"
                      style={{ width: "100%", paddingRight: "2.75rem" }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginMutation.isPending}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mk-btn mk-btn-solid w-full mt-1"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("login.submitting")}
                    </>
                  ) : (
                    <>
                      {loginType === "admin" ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      {t("login.submit")}
                    </>
                  )}
                </button>
              </form>

              {loginType === "admin" && (
                <>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" style={{ borderColor: "var(--mk-line)" }} />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span
                        className="px-2"
                        style={{ background: "var(--mk-surface)", color: "var(--mk-muted)" }}
                      >
                        {t("login.or")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mk-btn mk-btn-outline-dark w-full"
                    onClick={handleGoogleLogin}
                    disabled={loginMutation.isPending || googleLoginMutation.isPending}
                  >
                    {googleLoginMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("login.googlePending")}
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
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
                        {t("login.continueGoogle")}
                      </>
                    )}
                  </button>
                </>
              )}

              <p className="text-sm text-center mt-5" style={{ color: "var(--mk-muted)" }}>
                {loginType === "admin" ? (
                  <>
                    {t("login.noAccount")}{" "}
                    <Link to="/register?mode=admin" style={{ color: "var(--mk-teal)", fontWeight: 600 }}>
                      {t("login.createClinic")}
                    </Link>
                  </>
                ) : (
                  <>
                    {t("login.newToTeam")}{" "}
                    <Link
                      to="/register?mode=assistant"
                      style={{ color: "var(--mk-teal)", fontWeight: 600 }}
                    >
                      {t("login.joinWithCode")}
                    </Link>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        {import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === "true" ? (
          <DemoLoginPanel />
        ) : null}
      </main>
    </div>
  );
}
