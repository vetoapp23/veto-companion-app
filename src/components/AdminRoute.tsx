import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { type PermissionKey, userHasPermission } from "@/lib/permissions";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const role = user?.profile?.role as string | undefined;
  const allowed = role === "admin" || role === "super_admin";

  return (
    <ProtectedRoute>
      {allowed ? <>{children}</> : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

interface PermissionRouteProps {
  permission: PermissionKey;
  children: React.ReactNode;
  /** Si true, seuls admin/super_admin (ex. équipe) */
  adminOnly?: boolean;
}

/**
 * Protège une route par permission assistant.
 * Les vétérinaires (admin) et super_admin passent toujours.
 */
export function PermissionRoute({
  permission,
  children,
  adminOnly = false,
}: PermissionRouteProps) {
  const { user } = useAuth();
  const role = user?.profile?.role as string | undefined;

  if (adminOnly) {
    const ok = role === "admin" || role === "super_admin";
    return (
      <ProtectedRoute>
        {ok ? <>{children}</> : <Navigate to="/dashboard" replace />}
      </ProtectedRoute>
    );
  }

  const allowed = userHasPermission(user, permission);

  return (
    <ProtectedRoute>
      {allowed ? <>{children}</> : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}
