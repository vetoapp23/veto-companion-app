import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FarmBatch {
  id: string;
  organization_id: string;
  farm_id: string;
  name: string;
  species: string | null;
  category: string | null;
  animal_count: number;
  birth_period: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FarmHealthEvent {
  id: string;
  organization_id: string;
  farm_id: string;
  batch_id: string | null;
  intervention_id: string | null;
  event_type: string; // vaccination | treatment | mortality | birth | transfer | other
  event_date: string;
  product: string | null;
  dose: string | null;
  affected_count: number | null;
  cost: number | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

async function getOrgId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("not_authenticated");
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", userData.user.id)
    .single();
  if (!profile?.organization_id) throw new Error("no_organization");
  return profile.organization_id;
}

// ====== BATCHES ======

export const useFarmBatches = (farmId?: string) => {
  return useQuery({
    queryKey: ["farm_batches", farmId ?? "all"],
    queryFn: async () => {
      let q = (supabase.from("farm_batches" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (farmId) q = q.eq("farm_id", farmId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FarmBatch[];
    },
    enabled: farmId !== undefined,
    staleTime: 60_000,
  });
};

export const useCreateFarmBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FarmBatch> & { farm_id: string; name: string }) => {
      const organization_id = await getOrgId();
      const { data, error } = await (supabase.from("farm_batches" as any) as any)
        .insert({ ...input, organization_id })
        .select("*")
        .single();
      if (error) throw error;
      return data as FarmBatch;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["farm_batches", b.farm_id] });
      qc.invalidateQueries({ queryKey: ["farm_batches", "all"] });
    },
  });
};

export const useUpdateFarmBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FarmBatch> }) => {
      const { data: updated, error } = await (supabase.from("farm_batches" as any) as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return updated as FarmBatch;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["farm_batches", b.farm_id] });
      qc.invalidateQueries({ queryKey: ["farm_batches", "all"] });
    },
  });
};

export const useDeleteFarmBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("farm_batches" as any) as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm_batches"] });
    },
  });
};

// ====== HEALTH EVENTS ======

export const useFarmHealthEvents = (farmId?: string, batchId?: string) => {
  return useQuery({
    queryKey: ["farm_health_events", farmId ?? "all", batchId ?? "all"],
    queryFn: async () => {
      let q = (supabase.from("farm_batch_health_events" as any) as any)
        .select("*")
        .order("event_date", { ascending: false });
      if (farmId) q = q.eq("farm_id", farmId);
      if (batchId) q = q.eq("batch_id", batchId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FarmHealthEvent[];
    },
    enabled: farmId !== undefined || batchId !== undefined,
    staleTime: 60_000,
  });
};

export const useCreateFarmHealthEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FarmHealthEvent> & { farm_id: string; event_type: string }) => {
      const organization_id = await getOrgId();
      const { data, error } = await (supabase.from("farm_batch_health_events" as any) as any)
        .insert({ ...input, organization_id })
        .select("*")
        .single();
      if (error) throw error;
      return data as FarmHealthEvent;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["farm_health_events"] });
    },
  });
};

export const useDeleteFarmHealthEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("farm_batch_health_events" as any) as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm_health_events"] }),
  });
};
