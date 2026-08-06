import React, { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

function safeRedirect(path: string | null, fallback: string) {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return fallback;
}

export function AuthRedirect({ children, redirectTo = "/dashboard" }: AuthRedirectProps) {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const target = safeRedirect(searchParams.get("redirect"), redirectTo);

  useEffect(() => {
    console.log("🔍 AuthRedirect state:", { isAuthenticated, hasUser: !!user });
  }, [isAuthenticated, user]);

  if (isAuthenticated && user) {
    const hasOrg = !!(user.organization_id || user.profile?.organization_id);
    const dest = hasOrg ? target : "/onboarding";
    console.log("✅ User authenticated, redirecting to:", dest);
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}
