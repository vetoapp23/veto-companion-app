import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/hooks/useAuth";
import { readPendingPlan, writePendingPlan } from "@/components/PendingCheckoutRedirect";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SeoHead } from "@/components/SeoHead";

/**
 * First-time Google (or auth without clinic): collect clinic info then create org.
 */
export default function Onboarding() {
  const { t } = useTranslation("auth");
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.organization_id || user.profile?.organization_id) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const metaName =
      (user as any)?.profile?.full_name ||
      user.email?.split("@")[0] ||
      "";
    setForm((f) => ({
      ...f,
      fullName: f.fullName || metaName || "",
    }));
  }, [isAuthenticated, isLoading, user, navigate]);

  // Prefill name from auth user metadata
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata || {};
      const name = meta.full_name || meta.name || "";
      if (name) setForm((f) => ({ ...f, fullName: f.fullName || name }));
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.clinicName.trim()) {
      toast({
        title: t("register.errorTitle"),
        description: t("register.errors.clinicNameRequired"),
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      // Always use the live Auth user — cached context can reference a deleted account
      const {
        data: { user: authUser },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !authUser?.id || !authUser.email) {
        toast({
          title: t("register.errorTitle"),
          description: t("onboarding.sessionExpired", {
            defaultValue:
              "Session expirée. Déconnectez-vous puis reconnectez-vous avec Google.",
          }),
          variant: "destructive",
        });
        await logout();
        navigate("/login", { replace: true });
        return;
      }

      const { data, error } = await supabase.rpc("create_user_profile", {
        p_user_id: authUser.id,
        p_full_name: form.fullName.trim(),
        p_email: authUser.email,
        p_role: "admin",
        p_organization_code: null,
        p_clinic_name: form.clinicName.trim(),
        p_clinic_address: form.clinicAddress.trim() || null,
        p_phone: form.phone.trim() || null,
      });
      if (error) throw error;
      if (data && !(data as any).success) {
        throw new Error((data as any).error || t("register.errors.profileCreate"));
      }

      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
      await queryClient.refetchQueries({ queryKey: authKeys.session() });

      const pending = readPendingPlan();
      toast({
        title: t("onboarding.successTitle", { defaultValue: "Clinique créée" }),
        description: t("onboarding.successBody", {
          defaultValue: "Votre espace est prêt.",
        }),
      });

      if (pending?.planCode && pending.planCode !== "free") {
        writePendingPlan(pending);
        navigate(
          `/dashboard?billing=checkout&plan=${encodeURIComponent(pending.planCode)}&cycle=${pending.cycle ?? "monthly"}&currency=${pending.currency ?? "MAD"}`,
          { replace: true },
        );
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[Onboarding]", err);
      const msg = err instanceof Error ? err.message : t("register.errors.profileCreate");
      toast({
        title: t("register.errorTitle"),
        description: msg,
        variant: "destructive",
      });
      if (
        /session expirée|Compte introuvable|foreign key|owner_id/i.test(msg)
      ) {
        // Stale JWT after auth.users deletion — force clean re-login
      }
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={t("onboarding.seoTitle", { defaultValue: "Créer votre clinique — VetoCrm" })}
        description={t("onboarding.seoDescription", {
          defaultValue: "Finalisez votre inscription VetoCrm",
        })}
        noIndex
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="mk-brand text-lg">
              Veto<span>Crm</span>
            </Link>
            <LanguageSwitcher variant="marketing" />
          </div>
          <Card className="rounded-2xl border shadow-[var(--shadow-card)]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {t("onboarding.title", { defaultValue: "Votre clinique" })}
              </CardTitle>
              <CardDescription>
                {t("onboarding.subtitle", {
                  defaultValue:
                    "Une dernière étape : indiquez les infos de votre clinique pour activer votre espace.",
                })}
              </CardDescription>
              <p className="text-xs text-muted-foreground pt-1">{user.email}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t("register.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clinicName">{t("register.clinicName")}</Label>
                  <Input
                    id="clinicName"
                    value={form.clinicName}
                    onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress">{t("register.address")}</Label>
                  <Input
                    id="clinicAddress"
                    value={form.clinicAddress}
                    onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("register.phone")}</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("onboarding.saving", { defaultValue: "Création…" })}
                    </>
                  ) : (
                    t("onboarding.submit", { defaultValue: "Continuer" })
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => void logout()}
                >
                  {t("onboarding.signOut", { defaultValue: "Se déconnecter" })}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
