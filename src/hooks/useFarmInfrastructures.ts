import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FarmInfrastructure {
  id: string;
  organization_id: string;
  farm_id: string;
  infra_type: string;
  name: string;
  capacity: number | null;
  surface_sqm: number | null;
  location: string | null;
  notes: string | null;
  photos: string[] | null;
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

export const useFarmInfrastructures = (farmId?: string) => {
  return useQuery({
    queryKey: ["farm_infrastructures", farmId ?? "all"],
    queryFn: async () => {
      let q = (supabase.from("farm_infrastructures" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (farmId) q = q.eq("farm_id", farmId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FarmInfrastructure[];
    },
    enabled: farmId !== undefined,
  });
};

export const useCreateFarmInfrastructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FarmInfrastructure> & { farm_id: string; name: string; infra_type: string }) => {
      const organization_id = await getOrgId();
      const { data, error } = await (supabase.from("farm_infrastructures" as any) as any)
        .insert({ ...input, organization_id })
        .select("*")
        .single();
      if (error) throw error;
      return data as FarmInfrastructure;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm_infrastructures"] }),
  });
};

export const useUpdateFarmInfrastructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FarmInfrastructure> }) => {
      const { data: updated, error } = await (supabase.from("farm_infrastructures" as any) as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return updated as FarmInfrastructure;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm_infrastructures"] }),
  });
};

export const useDeleteFarmInfrastructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("farm_infrastructures" as any) as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm_infrastructures"] }),
  });
};

export const INFRA_TYPE_DEFAULTS = [
  "Étable", "Bergerie", "Chèvrerie", "Poulailler", "Porcherie",
  "Écurie", "Rucher", "Bassin", "Hangar", "Silo", "Salle de traite",
  "Quarantaine", "Maternité", "Stockage aliments",
];
