import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AccessProvider, AccessGate, ReadOnlyBanner } from "@/contexts/AccessContext";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isAuthenticated && user) {
    return (
      <AccessProvider>
        <ImpersonationBanner />
        <ReadOnlyBanner />
        <AccessGate>{children}</AccessGate>
      </AccessProvider>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AccessProvider>
      <AccessGate>{children}</AccessGate>
    </AccessProvider>
  );
}
