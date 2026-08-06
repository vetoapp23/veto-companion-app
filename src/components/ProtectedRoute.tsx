import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AccessProvider, AccessGate, ReadOnlyBanner } from "@/contexts/AccessContext";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useSeo } from "@/components/SeoHead";
import { useTranslation } from "react-i18next";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function PrivateSeo() {
  const { t } = useTranslation("auth");
  useSeo({
    title: "VetoCrm",
    description: t("seo.privateSpaceDescription"),
    noIndex: true,
  });
  return null;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation("auth");
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">{t("protected.checkingAuth")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.profile?.role as string) || "";
  const hasOrg = !!(user.organization_id || user.profile?.organization_id);
  const isSuper = role === "super_admin";
  if (!hasOrg && !isSuper && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AccessProvider>
      <PrivateSeo />
      <ImpersonationBanner />
      <ReadOnlyBanner />
      <AccessGate>{children}</AccessGate>
    </AccessProvider>
  );
}
