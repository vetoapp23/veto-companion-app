// @ts-nocheck
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrgRow {
  id: string;
  name: string;
  clinic_name?: string | null;
  invitation_code?: string | null;
  phone: string | null;
  clinic_address?: string | null;
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
  clients_count: number;
  animals_count: number;
  plan_limits?: {
    max_clients: number | null;
    max_animals: number | null;
    max_users: number | null;
  };
}

interface OrgUsageStatsRow {
  organization_id: string;
  clients_count: number;
  animals_count: number;
  users_count: number;
}

function countByOrg(rows: any[] | null | undefined, key = "organization_id") {
  const m = new Map<string, number>();
  (rows ?? []).forEach((r) => {
    const id = r[key];
    if (id) m.set(id, (m.get(id) ?? 0) + 1);
  });
  return m;
}

async function fetchOrgUsageStats(): Promise<Map<string, OrgUsageStatsRow>> {
  const map = new Map<string, OrgUsageStatsRow>();

  const { data, error } = await supabase.rpc("get_all_orgs_usage_stats" as any);
  if (!error && Array.isArray(data)) {
    (data as OrgUsageStatsRow[]).forEach((row) => {
      map.set(row.organization_id, {
        organization_id: row.organization_id,
        clients_count: Number(row.clients_count ?? 0),
        animals_count: Number(row.animals_count ?? 0),
        users_count: Number(row.users_count ?? 0),
      });
    });
    return map;
  }

  if (error) {
    console.warn("[super-admin] get_all_orgs_usage_stats unavailable, fallback RLS queries", error.message);
  }

  // Fallback si migration pas encore appliquée (souvent vide à cause du RLS)
  const [clientsRes, animalsRes, usersRes] = await Promise.all([
    supabase.from("clients").select("organization_id"),
    supabase.from("animals").select("organization_id"),
    supabase.from("user_profiles").select("organization_id,status"),
  ]);

  const clientsByOrg = countByOrg(clientsRes.data);
  const animalsByOrg = countByOrg(animalsRes.data);
  const usersByOrg = countByOrg(usersRes.data?.filter((u: any) => u.status === "approved"));

  const orgIds = new Set([
    ...clientsByOrg.keys(),
    ...animalsByOrg.keys(),
    ...usersByOrg.keys(),
  ]);

  orgIds.forEach((id) => {
    map.set(id, {
      organization_id: id,
      clients_count: clientsByOrg.get(id) ?? 0,
      animals_count: animalsByOrg.get(id) ?? 0,
      users_count: usersByOrg.get(id) ?? 0,
    });
  });

  return map;
}

export function useAllOrganizations() {
  return useQuery({
    queryKey: ["super-admin", "orgs"],
    staleTime: 30_000,
    queryFn: async (): Promise<OrgRow[]> => {
      const [orgsRes, subsRes, usageRes, liveRes, usageStatsByOrg, plansRes] =
        await Promise.all([
          supabase.from("organizations").select("*").order("created_at", { ascending: false }),
          supabase.from("organization_subscriptions").select("*"),
          supabase.from("storage_usage").select("organization_id,bytes_used"),
          supabase.rpc("get_all_orgs_storage" as any),
          fetchOrgUsageStats(),
          supabase.from("subscription_plans").select("code,max_clients,max_animals,max_users"),
        ]);
      if (orgsRes.error) throw orgsRes.error;

      const subsByOrg = new Map<string, any>();
      (subsRes.data ?? []).forEach((s: any) => subsByOrg.set(s.organization_id, s));

      const plansByCode = new Map<string, any>();
      (plansRes.data ?? []).forEach((p: any) => plansByCode.set(p.code, p));

      const usageByOrg = new Map<string, number>();
      (usageRes.data ?? []).forEach((u: any) => {
        usageByOrg.set(u.organization_id, (usageByOrg.get(u.organization_id) ?? 0) + Number(u.bytes_used ?? 0));
      });
      if (Array.isArray((liveRes as any)?.data)) {
        ((liveRes as any).data as any[]).forEach((u: any) => {
          usageByOrg.set(u.organization_id, Number(u.bytes_used ?? 0));
        });
      }

      return (orgsRes.data ?? []).map((o: any) => {
        const sub = subsByOrg.get(o.id) ?? null;
        const planCode = sub?.plan_code ?? "free";
        const plan = plansByCode.get(planCode);
        const stats = usageStatsByOrg.get(o.id);
        return {
          ...o,
          subscription: sub,
          storage_used_mb: Math.round(((usageByOrg.get(o.id) ?? 0) / (1024 * 1024)) * 10) / 10,
          users_count: stats?.users_count ?? 0,
          clients_count: stats?.clients_count ?? 0,
          animals_count: stats?.animals_count ?? 0,
          plan_limits: plan
            ? {
                max_clients: plan.max_clients,
                max_animals: plan.max_animals,
                max_users: (plan.max_users ?? 1) + (sub?.extra_users ?? 0),
              }
            : undefined,
        };
      });
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
        supabase.from("organizations").select("id,name,clinic_name,invitation_code"),
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

export function useSuperAdminStats() {
  const { data: orgs = [] } = useAllOrganizations();
  const { data: users = [] } = useAllUsers();
  const { data: plans = [] } = useAllPlans();

  return useMemo(() => {
    const totalClients = orgs.reduce((s, o) => s + o.clients_count, 0);
    const totalAnimals = orgs.reduce((s, o) => s + o.animals_count, 0);
    const totalStorage = orgs.reduce((s, o) => s + o.storage_used_mb, 0);
    const paidOrgs = orgs.filter((o) => (o.subscription?.plan_code ?? "free") !== "free");
    const atClientLimit = orgs.filter((o) => {
      const max = o.plan_limits?.max_clients;
      return max != null && o.clients_count >= max;
    }).length;

    const byPlan = plans.map((p: any) => ({
      code: p.code,
      name: p.name,
      orgs: orgs.filter((o) => (o.subscription?.plan_code ?? "free") === p.code).length,
      max_clients: p.max_clients,
      max_animals: p.max_animals,
      max_users: p.max_users,
    }));

    return {
      totalOrgs: orgs.length,
      paidOrgs: paidOrgs.length,
      freeOrgs: orgs.length - paidOrgs.length,
      totalUsers: users.length,
      pendingUsers: users.filter((u: any) => u.status === "pending").length,
      suspendedUsers: users.filter((u: any) => u.status === "suspended").length,
      totalClients,
      totalAnimals,
      totalStorageMb: Math.round(totalStorage * 10) / 10,
      orgsAtClientLimit: atClientLimit,
      byPlan,
    };
  }, [orgs, users, plans]);
}

export function formatLimitUsage(current: number, max?: number | null) {
  if (max == null) return `${current} / ∞`;
  return `${current} / ${max}`;
}

export function limitPercent(current: number, max?: number | null) {
  if (!max) return 0;
  return Math.min(100, Math.round((current / max) * 100));
}
