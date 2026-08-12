import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearDemoReadOnlySession } from "@/lib/demoMode";

const DEMO_ACCOUNTS = [
  { plan: "free", email: "demo-free@vetpro.test", labelKey: "demo.plans.free" },
  { plan: "pro", email: "demo-pro@vetpro.test", labelKey: "demo.plans.pro" },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", labelKey: "demo.plans.proPlus" },
  { plan: "duo", email: "demo-duo@vetpro.test", labelKey: "demo.plans.duo" },
  { plan: "clinic", email: "demo-clinic@vetpro.test", labelKey: "demo.plans.clinic" },
] as const;

/** Demo UI only in local/dev or when explicitly enabled (never enable in production). */
export const isDemoLoginEnabled =
  import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_DEMO === "true";

const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "DemoVetpro2026!";

export function DemoLoginPanel() {
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!isDemoLoginEnabled) return null;

  const loginAs = async (email: string, plan: string) => {
    setBusy(plan);
    // Internal QA logins are writable — clear public demo lock
    clearDemoReadOnlySession();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid")) {
          toast({
            title: t("demo.accountNotFound"),
            description: t("demo.accountNotFoundBody"),
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      navigate("/dashboard", { replace: true });
      window.location.reload();
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mk-demo">
      <h3 className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        {t("demo.title")}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((a) => (
          <Button
            key={a.plan}
            size="sm"
            variant="outline"
            className="mk-demo-btn"
            disabled={busy !== null}
            onClick={() => loginAs(a.email, a.plan)}
          >
            {busy === a.plan ? <Loader2 className="h-3 w-3 animate-spin" /> : t(a.labelKey)}
          </Button>
        ))}
      </div>
      <p className="text-[10px] text-center mt-2" style={{ color: "var(--mk-muted)" }}>
        {t("demo.passwordLabel")} <code>{DEMO_PASSWORD}</code>
      </p>
    </div>
  );
}
