import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAccessStatus, type AccessStatus } from "@/hooks/useAccessStatus";
import { AccessBlocked } from "@/components/AccessBlocked";
import { useAuth } from "@/contexts/AuthContext";

interface AccessContextValue {
  status: AccessStatus | undefined;
  isLoading: boolean;
  readOnly: boolean;
  isSuperAdmin: boolean;
  refetch: () => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data: status, isLoading, refetch } = useAccessStatus();
  const value = useMemo(
    () => ({
      status,
      isLoading,
      readOnly: !!status?.read_only,
      isSuperAdmin: !!status?.is_super_admin,
      refetch: () => {
        void refetch();
      },
    }),
    [status, isLoading, refetch]
  );
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}

/** Blocks pending/denied/maintenance; allows read_only through with banner handled elsewhere */
export function AccessGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { status, isLoading, isSuperAdmin } = useAccess();

  // Super admin always passes (except we still show children)
  if (isSuperAdmin) return <>{children}</>;

  if (isLoading && !status) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <>{children}</>;

  if (status && (status.access === "denied" || status.access === "pending" || status.access === "maintenance")) {
    return <AccessBlocked status={status} />;
  }

  return <>{children}</>;
}

export function ReadOnlyBanner() {
  const { readOnly, status, isSuperAdmin } = useAccess();
  if (isSuperAdmin || !readOnly) return null;
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-100 text-sm px-4 py-2 text-center">
      Mode lecture seule
      {status?.reason === "subscription_past_due"
        ? " — paiement en retard. Mettez à jour votre abonnement pour retrouver l'écriture."
        : " — certaines actions sont temporairement désactivées."}
    </div>
  );
}
