import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PedigreeDepth = "parents" | "grandparents";

export interface OrgSettings {
  id?: string;
  organization_id: string;
  pedigree_depth: PedigreeDepth;
}

async function getOrgId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", userData.user.id)
    .maybeSingle();
  return profile?.organization_id ?? null;
}

export const useOrgSettings = () => {
  return useQuery({
    queryKey: ["organization_settings"],
    queryFn: async (): Promise<OrgSettings | null> => {
      const orgId = await getOrgId();
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organization_settings" as any)
        .select("*")
        .eq("organization_id", orgId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return { organization_id: orgId, pedigree_depth: "parents" };
      }
      return data as unknown as OrgSettings;
    },
    staleTime: 5 * 60_000,
  });
};

export const useUpdateOrgSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<OrgSettings, "organization_id" | "id">>) => {
      const orgId = await getOrgId();
      if (!orgId) throw new Error("no_org");
      const { data: existing } = await supabase
        .from("organization_settings" as any)
        .select("id")
        .eq("organization_id", orgId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("organization_settings" as any)
          .update(patch)
          .eq("organization_id", orgId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("organization_settings" as any)
          .insert({ organization_id: orgId, ...patch });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organization_settings"] }),
  });
};
