import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      {user?.profile?.role === "super_admin" ? <>{children}</> : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}
