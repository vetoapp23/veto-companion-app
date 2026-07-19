import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AccessKind = "ok" | "pending" | "denied" | "maintenance";

export interface AccessStatus {
  access: AccessKind;
  reason?: string | null;
  read_only?: boolean;
  user_status?: string;
  role?: string;
  organization_id?: string | null;
  is_super_admin?: boolean;
  subscription_status?: string | null;
  plan_code?: string | null;
  message?: string;
  maintenance?: { enabled?: boolean; message?: string };
  feature_flags?: Record<string, boolean>;
}

export function useAccessStatus() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ["access-status", user?.id],
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<AccessStatus> => {
      const { data, error } = await supabase.rpc("get_access_status" as any);
      if (error) {
        console.warn("[access] get_access_status failed", error.message);
        // Fail open for super_admin profile, fail closed otherwise if we know status
        const status = (user?.profile as any)?.status;
        if (status === "suspended" || status === "rejected") {
          return { access: "denied", reason: `account_${status}` };
        }
        if (status === "pending") {
          return { access: "pending", reason: "account_pending" };
        }
        return { access: "ok", reason: "fallback" };
      }
      return (data ?? { access: "ok" }) as AccessStatus;
    },
  });
}

export function accessMessage(status?: AccessStatus | null): string {
  if (!status) return "Vérification de l'accès…";
  if (status.access === "maintenance") {
    return status.message || status.maintenance?.message || "Maintenance en cours.";
  }
  switch (status.reason) {
    case "account_pending":
      return "Votre compte est en attente d'approbation par un administrateur.";
    case "account_rejected":
      return "Votre compte a été refusé. Contactez le support si besoin.";
    case "account_suspended":
      return "Votre compte est suspendu. Contactez le support VetoCrm.";
    case "subscription_suspended":
      return "L'abonnement de votre clinique est suspendu.";
    case "subscription_canceled":
      return "L'abonnement de votre clinique est annulé.";
    case "subscription_past_due":
      return "Paiement en retard — accès en lecture seule jusqu'à régularisation.";
    case "force_read_only":
      return "La plateforme est temporairement en lecture seule.";
    default:
      return status.message || "Accès restreint.";
  }
}
