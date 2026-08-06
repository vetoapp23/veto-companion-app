import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase, createUserProfileIfNotExists } from "@/lib/supabase";
import { authKeys } from "@/hooks/useAuth";
import { readPendingPlan } from "@/components/PendingCheckoutRedirect";

/**
 * Landing page for Google / email OAuth redirects.
 * Parses hash (?code= or #access_token=), creates a clinic profile if needed,
 * strips tokens from the URL, then sends the user to the dashboard (or Checkout).
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
          // Implicit grant: client parses #access_token on init
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session && window.location.hash.includes("access_token")) {
            // Force a second pass after hash is available
            await new Promise((r) => setTimeout(r, 200));
            const again = await supabase.auth.getSession();
            if (!again.data.session) {
              throw new Error("session_missing");
            }
          }
        }

        // Remove tokens from the address bar ASAP
        const clean = `${window.location.origin}/auth/callback`;
        window.history.replaceState({}, document.title, clean);

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) throw userErr || new Error("unauthorized");

        setMessage("Préparation de votre espace…");
        await createUserProfileIfNotExists(user);

        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: authKeys.session() });
        // Wait for react-query to refetch so ProtectedRoute sees the user
        await queryClient.fetchQuery({
          queryKey: authKeys.session(),
          queryFn: async () => {
            const { fetchAuthSession } = await import("@/hooks/useAuth");
            // fallback: re-invalidate is enough; navigate after short tick
            return null;
          },
        }).catch(() => undefined);

        const pending = readPendingPlan();
        const fromQueryPlan = searchParams.get("plan");
        const planCode = pending?.planCode || (fromQueryPlan && fromQueryPlan !== "free" ? fromQueryPlan : null);

        if (cancelled) return;

        if (planCode) {
          const cycle = pending?.cycle || (searchParams.get("cycle") === "yearly" ? "yearly" : "monthly");
          const currency = pending?.currency || searchParams.get("currency") || "MAD";
          navigate(
            `/dashboard?billing=checkout&plan=${encodeURIComponent(planCode)}&cycle=${cycle}&currency=${currency}`,
            { replace: true },
          );
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (e) {
        console.error("[AuthCallback]", e);
        if (!cancelled) {
          navigate("/login?error=oauth", { replace: true });
        }
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
    </div>
  );
}
