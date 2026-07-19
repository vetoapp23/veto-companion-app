import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface ImpersonationState {
  active: boolean;
  session_id?: string;
  organization_id?: string;
  organization_name?: string;
  organization_code?: string;
  reason?: string;
  expires_at?: string;
  started_at?: string;
}

export function useImpersonation() {
  const { user } = useAuth();
  const isSuper = (user?.profile?.role as string) === "super_admin";
  const qc = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["impersonation", user?.id],
    enabled: isSuper && !!user?.id,
    staleTime: 15_000,
    queryFn: async (): Promise<ImpersonationState> => {
      const { data, error } = await supabase.rpc("get_active_impersonation" as any);
      if (error) {
        console.warn("[impersonation]", error.message);
        return { active: false };
      }
      return (data ?? { active: false }) as ImpersonationState;
    },
  });

  const start = useMutation({
    mutationFn: async ({ orgId, reason }: { orgId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("start_impersonation" as any, {
        p_org_id: orgId,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impersonation"] });
      qc.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey[0];
          return k !== "auth" && k !== "impersonation";
        },
      });
      toast({ title: "Mode support activé", description: "Vous voyez les données de la clinique cible." });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const stop = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("end_impersonation" as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impersonation"] });
      qc.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey[0];
          return k !== "auth" && k !== "impersonation";
        },
      });
      toast({ title: "Mode support terminé" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return {
    state: query.data,
    isLoading: query.isLoading,
    start,
    stop,
    isSuper,
  };
}

export function ImpersonationBanner() {
  const { state, stop, isSuper } = useImpersonation();
  if (!isSuper || !state?.active) return null;

  return (
    <div className="bg-[#0b3d3a] text-[#5eead4] px-4 py-2.5 flex flex-wrap items-center justify-center gap-3 text-sm z-50">
      <Eye className="h-4 w-4 shrink-0" />
      <span>
        Mode support —{" "}
        <strong className="text-white">{state.organization_name}</strong>
        {state.organization_code ? (
          <span className="opacity-80"> ({state.organization_code})</span>
        ) : null}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
        onClick={() => stop.mutate()}
        disabled={stop.isPending}
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Quitter
      </Button>
    </div>
  );
}
