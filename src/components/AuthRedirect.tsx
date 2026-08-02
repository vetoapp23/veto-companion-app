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
    console.log("✅ User authenticated, redirecting to:", target);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
