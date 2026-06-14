// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrgRow {
  id: string;
  name: string;
  code: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  subscription?: {
    id: string;
    plan_code: string;
    status: string;
    storage_quota_mb: number;
    storage_addon_mb: number;
    extra_users: number;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    currency: string;
    billing_cycle: string;
  } | null;
  storage_used_mb: number;
  users_count: number;
}

export function useAllOrganizations() {
  return useQuery({
    queryKey: ["super-admin", "orgs"],
    staleTime: 30_000,
    queryFn: async (): Promise<OrgRow[]> => {
      const [orgsRes, subsRes, usageRes, usersRes, liveRes] = await Promise.all([
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
        supabase.from("organization_subscriptions").select("*"),
        supabase.from("storage_usage").select("organization_id,bytes_used"),
        supabase.from("user_profiles").select("organization_id,status"),
        supabase.rpc("get_all_orgs_storage" as any),
      ]);
      if (orgsRes.error) throw orgsRes.error;

      const subsByOrg = new Map<string, any>();
      (subsRes.data ?? []).forEach((s: any) => subsByOrg.set(s.organization_id, s));

      // Live photo-based bytes (server-computed) take priority over the cached counters.
      const usageByOrg = new Map<string, number>();
      (usageRes.data ?? []).forEach((u: any) => {
        usageByOrg.set(u.organization_id, (usageByOrg.get(u.organization_id) ?? 0) + Number(u.bytes_used ?? 0));
      });
      if (Array.isArray((liveRes as any)?.data)) {
        ((liveRes as any).data as any[]).forEach((u: any) => {
          usageByOrg.set(u.organization_id, Number(u.bytes_used ?? 0));
        });
      }

      const usersByOrg = new Map<string, number>();
      (usersRes.data ?? []).forEach((u: any) => {
        if (u.status === "approved") {
          usersByOrg.set(u.organization_id, (usersByOrg.get(u.organization_id) ?? 0) + 1);
        }
      });

      return (orgsRes.data ?? []).map((o: any) => ({
        ...o,
        subscription: subsByOrg.get(o.id) ?? null,
        storage_used_mb: Math.round(((usageByOrg.get(o.id) ?? 0) / (1024 * 1024)) * 10) / 10,
        users_count: usersByOrg.get(o.id) ?? 0,
      }));
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["super-admin", "users"],
    staleTime: 30_000,
    queryFn: async () => {
      const [profilesRes, orgsRes] = await Promise.all([
        supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("organizations").select("id,name,code"),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      const orgsMap = new Map<string, any>();
      (orgsRes.data ?? []).forEach((o: any) => orgsMap.set(o.id, o));
      return (profilesRes.data ?? []).map((p: any) => ({
        ...p,
        organization: orgsMap.get(p.organization_id) ?? null,
      }));
    },
  });
}

export function useAllPlans() {
  return useQuery({
    queryKey: ["super-admin", "plans"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}