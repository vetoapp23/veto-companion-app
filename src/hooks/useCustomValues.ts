import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CustomValueCategory =
  | "species"
  | "breed_dog"
  | "breed_cat"
  | "breed_other"
  | "color"
  | "vaccine_type"
  | "parasite_type"
  | "administration_route"
  | "appointment_type";

export interface CustomDropdownValue {
  id: string;
  category: CustomValueCategory | string;
  value: string;
  usage_count: number;
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

export const useCustomValues = (category: string) => {
  return useQuery({
    queryKey: ["custom_dropdown_values", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_dropdown_values" as any)
        .select("id, category, value, usage_count")
        .eq("category", category)
        .order("usage_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CustomDropdownValue[];
    },
    staleTime: 60_000,
  });
};

export const useAddCustomValue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, value }: { category: string; value: string }) => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const orgId = await getOrgId();
      if (!orgId) throw new Error("no_org");
      const { data: userData } = await supabase.auth.getUser();

      // try insert; on conflict, increment usage_count
      const { data: existing } = await supabase
        .from("custom_dropdown_values" as any)
        .select("id, usage_count")
        .eq("organization_id", orgId)
        .eq("category", category)
        .ilike("value", trimmed)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("custom_dropdown_values" as any)
          .update({ usage_count: (existing as any).usage_count + 1 })
          .eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("custom_dropdown_values" as any).insert({
          organization_id: orgId,
          category,
          value: trimmed,
          created_by: userData?.user?.id ?? null,
        });
        if (error) throw error;
      }
      return trimmed;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["custom_dropdown_values", vars.category] });
    },
  });
};
