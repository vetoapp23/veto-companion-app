import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";

export type QuotaKind = "clients" | "animals" | "users";

interface Counts {
  clients: number;
  animals: number;
  users: number;
}

/**
 * Surveille les compteurs (clients / animaux / utilisateurs) vs les limites du plan.
 * Utilisez `enforce(kind)` dans les handlers de création : affiche un toast et
 * retourne `false` si la limite est atteinte.
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

  const enforce = (kind: QuotaKind): boolean => {
    if (!reached(kind)) return true;
    const max = limitFor(kind);
    const labels: Record<QuotaKind, string> = {
      clients: "clients",
      animals: "animaux",
      users: "utilisateurs",
    };
    toast({
      title: "Limite du plan atteinte",
      description: `Votre pack ${quota?.plan_name ?? ""} est limité à ${max} ${labels[kind]}. Passez à un pack supérieur pour en ajouter davantage.`,
      variant: "destructive",
    });
    return false;
  };

  return {
    counts,
    isLoading: countsQuery.isLoading,
    refetch: countsQuery.refetch,
    reached,
    enforce,
    limitFor,
  };
}
