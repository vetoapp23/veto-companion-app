// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlanQuota {
  organization_id: string;
  plan_code: string;
  plan_name: string;
  storage_total_mb: number;
  storage_used_mb: number;
  storage_used_bytes: number;
  percent_used: number;
  over_quota: boolean;
  max_clients: number | null;
  max_animals: number | null;
  max_users: number | null;
  features: string[];
  limits?: Record<string, boolean>;
}

/** Modules included by default when catalog has no explicit key */
const CORE_DEFAULT_ON = new Set([
  "consultations",
  "visits",
  "appointments",
  "vaccinations",
  "antiparasites",
  "clients",
  "animals",
]);

/** Premium modules: off unless catalog / override says true */
const PREMIUM_DEFAULT_OFF = new Set(["farm", "stock", "accounting"]);

export function usePlanLimits() {
  const { user, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ["plan-quota", user?.organization_id],
    enabled: isAuthenticated && !!user?.organization_id,
    staleTime: 60_000,
    queryFn: async (): Promise<PlanQuota | null> => {
      const { data, error } = await supabase.rpc("get_organization_quota" as any);
      if (error) {
        console.warn("[plan] get_organization_quota failed", error);
        return null;
      }
      if (!data || (data as any).error) return null;
      return data as unknown as PlanQuota;
    },
  });

  const quota = query.data;
  const planCode = quota?.plan_code ?? "free";
  const limits = (quota?.limits ?? {}) as Record<string, boolean>;

  const role = (user?.profile?.role as string) || "";
  const isSuper = role === "super_admin";
  const isPrivileged = role === "admin" || isSuper;

  /**
   * Catalog `limits` (+ org feature_overrides merged server-side) is source of truth.
   * Only super_admin bypasses module gates (e.g. impersonation).
   */
  const moduleEnabled = (key: string): boolean => {
    if (isSuper) return true;
    if (Object.prototype.hasOwnProperty.call(limits, key)) {
      return limits[key] === true;
    }
    if (PREMIUM_DEFAULT_OFF.has(key)) return false;
    if (CORE_DEFAULT_ON.has(key)) return true;
    return true;
  };

  const storageTotalMb = quota?.storage_total_mb ?? 0;
  const storageUsedMb = quota?.storage_used_mb ?? 0;
  const percentUsed = quota?.percent_used ?? 0;

  return {
    quota,
    planCode,
    limits,
    isLoading: query.isLoading,
    refetch: query.refetch,
    canUpload: (additionalBytes: number) => {
      if (isSuper) return true;
      if (query.isLoading) return false;
      if (!quota) return false;
      const projectedMb = storageUsedMb + additionalBytes / (1024 * 1024);
      return projectedMb <= storageTotalMb;
    },
    isFree: planCode === "free",
    isPaid: planCode !== "free",
    hasFarmManagement: moduleEnabled("farm"),
    hasAccounting: moduleEnabled("accounting"),
    hasStock: moduleEnabled("stock"),
    hasConsultations: moduleEnabled("consultations"),
    hasVisits: moduleEnabled("visits"),
    hasAppointments: moduleEnabled("appointments"),
    hasVaccinations: moduleEnabled("vaccinations"),
    hasAntiparasites: moduleEnabled("antiparasites"),
    hasClients: moduleEnabled("clients"),
    hasAnimals: moduleEnabled("animals"),
    storageWarning: quota ? percentUsed >= 80 : false,
    // Fail-closed if quota unknown; avoid blocked flash while loading
    storageBlocked: isSuper
      ? false
      : query.isLoading
        ? false
        : !quota
          ? true
          : percentUsed >= 100 || !!quota.over_quota,
    isPrivileged,
    isSuper,
    moduleEnabled,
  };
}
