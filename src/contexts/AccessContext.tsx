import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessStatus, type AccessStatus } from "@/hooks/useAccessStatus";
import { AccessBlocked } from "@/components/AccessBlocked";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { clearDemoReadOnlySession, isDemoReadOnlyActive } from "@/lib/demoMode";
import { DEMO_TOUR_STORAGE_KEY } from "@/lib/demoTour/types";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useDemoTour } from "@/contexts/DemoTourContext";

interface AccessContextValue {
  status: AccessStatus | undefined;
  isLoading: boolean;
  readOnly: boolean;
  isDemoReadOnly: boolean;
  isSuperAdmin: boolean;
  refetch: () => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data: status, isLoading, refetch } = useAccessStatus();
  const { user } = useAuth();
  const demoReadOnly = isDemoReadOnlyActive(user?.email);
  const value = useMemo(
    () => ({
      status,
      isLoading,
      readOnly: !!status?.read_only || demoReadOnly,
      isDemoReadOnly: demoReadOnly || status?.reason === "demo_readonly",
      isSuperAdmin: !!status?.is_super_admin,
      refetch: () => {
        void refetch();
      },
    }),
    [status, isLoading, demoReadOnly, refetch]
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
  const { readOnly, status, isSuperAdmin, isDemoReadOnly } = useAccess();
  const { logout } = useAuth();
  const { endTour, active: tourActive } = useDemoTour();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { t: td } = useTranslation("demo");
  const [quitting, setQuitting] = useState(false);

  if (isSuperAdmin || !readOnly) return null;

  const handleQuitDemo = async () => {
    if (quitting) return;
    setQuitting(true);
    try {
      if (tourActive) endTour();
      clearDemoReadOnlySession();
      try {
        sessionStorage.removeItem(DEMO_TOUR_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      await logout();
      navigate("/", { replace: true });
    } catch {
      window.location.href = "/";
    }
  };

  if (isDemoReadOnly) {
    return (
      <div className="bg-teal-500/15 border-b border-teal-500/30 text-teal-950 dark:text-teal-100 text-sm px-3 sm:px-4 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="min-w-0 flex-1 text-left leading-snug sm:text-center">
            {td("readOnlyBanner")}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 h-8 gap-1.5 border-teal-700/40 bg-background/80 text-teal-950 hover:bg-background dark:text-teal-50"
            onClick={() => void handleQuitDemo()}
            disabled={quitting}
          >
            {quitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{td("quitDemo")}</span>
            <span className="sm:hidden">{td("quitDemoShort")}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-100 text-sm px-4 py-2 text-center">
      {t("protected.readOnly")}
      {status?.reason === "subscription_past_due"
        ? t("protected.readOnlyPastDue")
        : t("protected.readOnlyGeneric")}
    </div>
  );
}
