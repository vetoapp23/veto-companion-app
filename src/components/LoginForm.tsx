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
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin, useResetPassword, useLogin } from "@/hooks/useAuth";
import { DemoLoginPanel } from "@/components/DemoLoginPanel";
import heroImage from "@/assets/vet-hero.jpg";
import { SeoHead } from "@/components/SeoHead";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "assistant">("admin");
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/dashboard", { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await googleLoginMutation.mutateAsync();
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Erreur lors de la connexion avec Google");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Veuillez saisir votre email");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(email);
      setResetEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
      ? "Vérifiez votre email"
      : "Mot de passe oublié"
    : "Connexion";

  const description = isForgotPassword
    ? resetEmailSent
      ? "Un lien vient de partir dans votre boîte mail."
      : "Indiquez l’email associé à votre compte."
    : loginType === "admin"
      ? "Espace administrateur de clinique"
      : "Espace assistant — rejoignez votre clinique";

  return (
    <div className="marketing-shell mk-login">
      <SeoHead
        title="Connexion — VetoCrm"
        description="Connectez-vous à votre espace clinique VetoCrm pour gérer rendez-vous, dossiers et équipe."
        path="/login"
      />
      <aside className="mk-login-visual">
        <div className="mk-hero-media">
          <img
            src={heroImage}
            alt="Connexion à l'espace clinique VetoCrm"
            width={1200}
            height={1600}
          />
          <div className="mk-hero-veil" aria-hidden />
          <div className="mk-hero-mesh" aria-hidden />
        </div>
        <div className="mk-login-visual-content">
          <Link to="/" className="mk-brand" style={{ display: "inline-block", marginBottom: "1.5rem" }}>
            Veto<span>Crm</span>
          </Link>
          <h1>Votre clinique, à portée de clic.</h1>
          <p>
            Connectez-vous pour retrouver clients, agenda et dossiers médicaux — synchronisés et
            sécurisés.
          </p>
        </div>
      </aside>

      <main className="mk-login-panel">
        <div className="mk-login-mobile-brand lg:hidden">
          <Link to="/" className="mk-brand" style={{ color: "var(--mk-ink)" }}>
            Veto<span>Crm</span>
          </Link>
          <Link to="/" className="mk-link" style={{ color: "var(--mk-muted)" }}>
            Accueil
          </Link>
        </div>

        <div className="mk-login-card">
          <h2>{title}</h2>
          <p className="mk-desc">{description}</p>

          {resetEmailSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Lien envoyé à <strong>{email}</strong>. Pensez à vérifier les spams.
              </p>
              <button type="button" className="mk-btn mk-btn-solid w-full" onClick={handleBackToLogin}>
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
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
                <label htmlFor="reset-email">Email</label>
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
                    Envoi…
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
              <button
                type="button"
                className="mk-btn mk-btn-outline-dark w-full mt-2"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            </form>
          ) : (
            <>
              <div className="mk-segment" role="tablist" aria-label="Type de compte">
                <button
                  type="button"
                  role="tab"
                  data-active={loginType === "admin"}
                  aria-selected={loginType === "admin"}
                  onClick={() => setLoginType("admin")}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Admin
                </button>
                <button
                  type="button"
                  role="tab"
                  data-active={loginType === "assistant"}
                  aria-selected={loginType === "assistant"}
                  onClick={() => setLoginType("assistant")}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Assistant
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
                  Vous rejoignez une clinique existante avec vos identifiants.
                </p>
              )}

              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mk-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={loginType === "admin" ? "admin@clinique.com" : "assistant@clinique.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loginMutation.isPending}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mk-field">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password">Mot de passe</label>
                    <button
                      type="button"
                      className="text-xs font-medium"
                      style={{ color: "var(--mk-teal)", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Oublié ?
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
                      Connexion…
                    </>
                  ) : (
                    <>
                      {loginType === "admin" ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Se connecter
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
                        ou
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
                        Google…
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
                        Continuer avec Google
                      </>
                    )}
                  </button>
                </>
              )}

              <p className="text-sm text-center mt-5" style={{ color: "var(--mk-muted)" }}>
                {loginType === "admin" ? (
                  <>
                    Pas encore de compte ?{" "}
                    <Link to="/register?mode=admin" style={{ color: "var(--mk-teal)", fontWeight: 600 }}>
                      Créer une clinique
                    </Link>
                  </>
                ) : (
                  <>
                    Nouveau dans l’équipe ?{" "}
                    <Link
                      to="/register?mode=assistant"
                      style={{ color: "var(--mk-teal)", fontWeight: 600 }}
                    >
                      Rejoindre avec un code
                    </Link>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <DemoLoginPanel />
      </main>
    </div>
  );
}
