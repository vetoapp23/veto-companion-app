import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase, getCurrentUserProfile } from "@/lib/supabase";
import { authKeys } from "@/hooks/useAuth";
import { readPendingPlan } from "@/components/PendingCheckoutRedirect";

/**
 * OAuth / magic-link landing: establish session, then route to
 * onboarding (no clinic) or dashboard (+ checkout if pending plan).
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("Connexion en cours…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          let { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session && window.location.hash.includes("access_token")) {
            await new Promise((r) => setTimeout(r, 300));
            ({ data, error } = await supabase.auth.getSession());
            if (error) throw error;
            if (!data.session) throw new Error("session_missing");
          }
          if (!data.session) throw new Error("session_missing");
        }

        window.history.replaceState({}, document.title, `${window.location.origin}/auth/callback`);

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) throw userErr || new Error("unauthorized");

        setMessage("Préparation de votre espace…");

        // Returning Google users whose profile was lost (auth recreated): reclaim orphan clinic
        try {
          await supabase.rpc("ensure_returning_user_org" as any);
        } catch (e) {
          console.warn("[AuthCallback] ensure_returning_user_org", e);
        }

        let profile = null as Awaited<ReturnType<typeof getCurrentUserProfile>>;
        try {
          profile = await getCurrentUserProfile();
        } catch {
          profile = null;
        }

        if (cancelled) return;

        await queryClient.invalidateQueries({ queryKey: authKeys.session() });
        await queryClient.refetchQueries({ queryKey: authKeys.session() }).catch(() => undefined);

        const needsOnboarding = !profile?.organization_id;
        if (needsOnboarding) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const pending = readPendingPlan();
        const fromQueryPlan = searchParams.get("plan");
        const planCode =
          pending?.planCode ||
          (fromQueryPlan && fromQueryPlan !== "free" ? fromQueryPlan : null);

        if (planCode) {
          const cycle =
            pending?.cycle || (searchParams.get("cycle") === "yearly" ? "yearly" : "monthly");
          const currency = pending?.currency || searchParams.get("currency") || "MAD";
          navigate(
            `/dashboard?billing=checkout&plan=${encodeURIComponent(planCode)}&cycle=${cycle}&currency=${currency}`,
            { replace: true },
          );
          return;
        }

        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error("[AuthCallback]", e);
        if (!cancelled) navigate("/login?error=oauth", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link to="/login" className="text-xs text-muted-foreground underline">
        Retour connexion
      </Link>
    </div>
  );
}
