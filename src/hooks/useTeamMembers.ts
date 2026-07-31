import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "assistant" | "super_admin";
  status: "pending" | "approved" | "rejected" | "suspended";
  organization_id: string;
  permissions?: Record<string, string | boolean> | null;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teamMembers", user?.organization_id],
    queryFn: async () => {
      if (!user?.organization_id) {
        throw new Error("Organization ID not found");
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []) as TeamMember[];
    },
    enabled: !!user?.organization_id,
  });
};
