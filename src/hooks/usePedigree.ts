import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Pedigree {
  id?: string;
  animal_id: string;
  organization_id?: string;
  father_animal_id?: string | null;
  mother_animal_id?: string | null;
  father_name?: string | null;
  father_breed?: string | null;
  father_registration?: string | null;
  mother_name?: string | null;
  mother_breed?: string | null;
  mother_registration?: string | null;
  paternal_grandfather_name?: string | null;
  paternal_grandfather_breed?: string | null;
  paternal_grandmother_name?: string | null;
  paternal_grandmother_breed?: string | null;
  maternal_grandfather_name?: string | null;
  maternal_grandfather_breed?: string | null;
  maternal_grandmother_name?: string | null;
  maternal_grandmother_breed?: string | null;
  registration_number?: string | null;
  pedigree_origin?: string | null;
  titles?: string | null;
  notes?: string | null;
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

export const usePedigree = (animalId?: string) => {
  return useQuery({
    queryKey: ["animal_pedigree", animalId],
    enabled: !!animalId,
    queryFn: async (): Promise<Pedigree | null> => {
      const { data, error } = await supabase
        .from("animal_pedigree" as any)
        .select("*")
        .eq("animal_id", animalId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Pedigree) ?? null;
    },
  });
};

export const useUpsertPedigree = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pedigree: Pedigree) => {
      const orgId = await getOrgId();
      if (!orgId) throw new Error("no_org");
      const payload = { ...pedigree, organization_id: orgId };
      const { data: existing } = await supabase
        .from("animal_pedigree" as any)
        .select("id")
        .eq("animal_id", pedigree.animal_id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("animal_pedigree" as any)
          .update(payload)
          .eq("animal_id", pedigree.animal_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("animal_pedigree" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["animal_pedigree", vars.animal_id] });
    },
  });
};
