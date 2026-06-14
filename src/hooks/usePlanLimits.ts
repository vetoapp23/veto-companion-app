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
}

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
  const FARM_PLANS = ["pro_plus", "duo", "clinic"];
  const ACCOUNTING_PLANS = ["pro_plus", "duo", "clinic"];
  const STOCK_PLANS = ["pro", "pro_plus", "duo", "clinic"];

  // Admins (and super-admins) of an organization bypass plan feature gates
  // and storage hard-blocks so they can manage every module of the app.
  const role = (user?.profile?.role as string) || "";
  const isPrivileged = role === "admin" || role === "super_admin";

  return {
    quota,
    planCode,
    isLoading: query.isLoading,
    refetch: query.refetch,
    canUpload: (additionalBytes: number) => {
      if (isPrivileged) return true;
      if (!quota) return true;
      const projectedMb = quota.storage_used_mb + additionalBytes / (1024 * 1024);
      return projectedMb <= quota.storage_total_mb;
    },
    isFree: planCode === "free",
    isPaid: planCode !== "free",
    hasFarmManagement: isPrivileged || FARM_PLANS.includes(planCode),
    hasAccounting: isPrivileged || ACCOUNTING_PLANS.includes(planCode),
    hasStock: isPrivileged || STOCK_PLANS.includes(planCode),
    storageWarning: quota ? quota.percent_used >= 80 : false,
    storageBlocked: isPrivileged ? false : (quota ? quota.percent_used >= 100 : false),
    isPrivileged,
  };
}