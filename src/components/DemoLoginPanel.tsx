import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DEMO_ACCOUNTS = [
  { plan: "free", email: "demo-free@vetpro.test", label: "Découverte" },
  { plan: "pro", email: "demo-pro@vetpro.test", label: "Pro" },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", label: "Pro Plus" },
  { plan: "duo", email: "demo-duo@vetpro.test", label: "Duo" },
  { plan: "clinic", email: "demo-clinic@vetpro.test", label: "Clinique" },
];

const DEMO_PASSWORD = "DemoVetpro2026!";

export function DemoLoginPanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginAs = async (email: string, plan: string) => {
    setBusy(plan);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid")) {
          toast({
            title: "Compte démo introuvable",
            description: "Cliquez d'abord sur « Initialiser les comptes démo ».",
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
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const seed = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-users", { body: {} });
      if (error) throw error;
      const okCount = (data?.results ?? []).filter((r: any) => r.ok).length;
      toast({
        title: "Comptes démo prêts",
        description: `${okCount}/${DEMO_ACCOUNTS.length} comptes initialisés. Mot de passe : ${DEMO_PASSWORD}`,
      });
    } catch (e: any) {
      toast({ title: "Échec initialisation", description: e.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mk-demo">
      <h3 className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        Mode test — accès rapide
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
            {busy === a.plan ? <Loader2 className="h-3 w-3 animate-spin" /> : a.label}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 text-[var(--mk-teal)] hover:bg-[rgba(15,118,110,0.08)] hover:text-[var(--mk-teal)]"
        onClick={seed}
        disabled={seeding}
      >
        {seeding ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Initialisation…
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-3 w-3" /> Initialiser les comptes démo
          </>
        )}
      </Button>
      <p className="text-[10px] text-center mt-2" style={{ color: "var(--mk-muted)" }}>
        Mdp : <code>{DEMO_PASSWORD}</code>
      </p>
    </div>
  );
}
