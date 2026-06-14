// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { checkQuotaLimit, quotaKindLabel, type QuotaKind } from "@/lib/quotaEnforcement";

interface Counts {
  clients: number;
  animals: number;
  users: number;
}

/**
 * Surveille les compteurs vs limites du plan (configurables par le Super Admin).
 * `enforce(kind)` bloque la création et propose de passer à un pack payant.
 */
export function useQuotaCheck() {
  const { user, isAuthenticated } = useAuth();
  const { quota } = usePlanLimits();
  const { toast } = useToast();

  const countsQuery = useQuery({
    queryKey: ["org-counts", user?.organization_id],
    enabled: isAuthenticated && !!user?.organization_id,
    staleTime: 30_000,
    queryFn: async (): Promise<Counts> => {
      const [c, a, u] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("animals").select("id", { count: "exact", head: true }),
        supabase
          .from("user_profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
      ]);
      return {
        clients: c.count ?? 0,
        animals: a.count ?? 0,
        users: u.count ?? 0,
      };
    },
  });

  const counts: Counts = countsQuery.data ?? { clients: 0, animals: 0, users: 0 };

  const limitFor = (kind: QuotaKind): number | null => {
    if (!quota) return null;
    if (kind === "clients") return quota.max_clients;
    if (kind === "animals") return quota.max_animals;
    if (kind === "users") return quota.max_users;
    return null;
  };

  const reached = (kind: QuotaKind): boolean => {
    const max = limitFor(kind);
    if (max === null || max === undefined) return false;
    return counts[kind] >= max;
  };

  const remaining = (kind: QuotaKind): number | null => {
    const max = limitFor(kind);
    if (max === null || max === undefined) return null;
    return Math.max(0, max - counts[kind]);
  };

  const usagePercent = (kind: QuotaKind): number | null => {
    const max = limitFor(kind);
    if (!max) return null;
    return Math.min(100, Math.round((counts[kind] / max) * 100));
  };

  const role = (user?.profile?.role as string) || "";
  const isSuperAdmin = role === "super_admin";

  const enforce = async (kind: QuotaKind): Promise<boolean> => {
    if (isSuperAdmin) return true;

    const result = await checkQuotaLimit(kind);
    if (result?.bypass) return true;

    const blocked =
      (result && result.allowed === false) ||
      (!result && reached(kind));

    if (!blocked) return true;

    const max = result?.max ?? limitFor(kind);
    toast({
      title: "Limite du plan atteinte",
      description:
        (result?.message ||
          `Votre pack ${result?.plan_name ?? quota?.plan_name ?? ""} est limité à ${max} ${quotaKindLabel(kind)}.`) +
        " Rendez-vous sur la page Tarifs pour passer à un pack payant.",
      variant: "destructive",
    });
    return false;
  };

  return {
    counts,
    isLoading: countsQuery.isLoading,
    refetch: countsQuery.refetch,
    reached,
    remaining,
    usagePercent,
    enforce,
    limitFor,
  };
}
