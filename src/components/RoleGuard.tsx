import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  type PermissionKey,
  userHasPermission,
  userCanEdit,
  userCanView,
  getAccessLevel,
} from "@/lib/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "assistant" | "super_admin")[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user } = useAuth();
  const role = user?.profile?.role as string | undefined;

  if (!user || !role || !allowedRoles.includes(role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/** Affiche les enfants si le module est accessible (view ou edit) */
export const PermissionGuard: React.FC<{
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  if (!userHasPermission(user, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

/** Affiche les enfants seulement si l'utilisateur peut modifier (créer / éditer / supprimer) */
export const WriteGuard: React.FC<{
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  if (!userCanEdit(user, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard allowedRoles={["admin", "super_admin"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const useRoleCheck = () => {
  const { user } = useAuth();
  const role = user?.profile?.role as string | undefined;

  return {
    isAdmin: role === "admin",
    isAssistant: role === "assistant",
    isSuperAdmin: role === "super_admin",
    hasRole: (r: "admin" | "assistant" | "super_admin") => role === r,
    hasAnyRole: (roles: ("admin" | "assistant" | "super_admin")[]) =>
      role ? roles.includes(role as any) : false,
    hasPermission: (permission: PermissionKey | null | undefined) =>
      userHasPermission(user, permission),
    canView: (permission: PermissionKey | null | undefined) =>
      userCanView(user, permission),
    canEdit: (permission: PermissionKey | null | undefined) =>
      userCanEdit(user, permission),
    accessLevel: (permission: PermissionKey | null | undefined) =>
      getAccessLevel(user, permission),
  };
};

/**
 * Accès écriture strict pour un module.
 * canWrite = false → masquer les boutons ; guardWrite() bloque aussi les handlers.
 */
export const useWriteAccess = (permission: PermissionKey) => {
  const { canEdit } = useRoleCheck();
  const { toast } = useToast();
  const canWrite = canEdit(permission);

  const guardWrite = (): boolean => {
    if (canWrite) return true;
    toast({
      title: "Modification interdite",
      description: "Votre compte est en consultation seule sur ce module. Demandez au vétérinaire d'élargir vos droits.",
      variant: "destructive",
    });
    return false;
  };

  return { canWrite, guardWrite };
};
