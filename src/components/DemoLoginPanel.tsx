import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DEMO_ACCOUNTS = [
  { plan: "free",     email: "demo-free@vetpro.test",     label: "Découverte", color: "bg-slate-500 hover:bg-slate-600" },
  { plan: "pro",      email: "demo-pro@vetpro.test",      label: "Pro",        color: "bg-blue-600 hover:bg-blue-700" },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", label: "Pro Plus",   color: "bg-indigo-600 hover:bg-indigo-700" },
  { plan: "duo",      email: "demo-duo@vetpro.test",      label: "Duo",        color: "bg-emerald-600 hover:bg-emerald-700" },
  { plan: "clinic",   email: "demo-clinic@vetpro.test",   label: "Clinique",   color: "bg-purple-600 hover:bg-purple-700" },
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
      const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
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
    <Card className="w-full max-w-md mt-4 border-dashed border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Sparkles className="h-4 w-4" />
          Mode test — connexion rapide démo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <Button
              key={a.plan}
              size="sm"
              className={`text-white ${a.color}`}
              disabled={busy !== null}
              onClick={() => loginAs(a.email, a.plan)}
            >
              {busy === a.plan ? <Loader2 className="h-3 w-3 animate-spin" /> : a.label}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={seed}
          disabled={seeding}
        >
          {seeding ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Initialisation…</>
          ) : (
            <><RefreshCw className="mr-2 h-3 w-3" /> Initialiser / réinitialiser les comptes démo</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Bloc à retirer après validation. Mdp : <code>{DEMO_PASSWORD}</code>
        </p>
      </CardContent>
    </Card>
  );
}
