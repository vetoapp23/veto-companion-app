/**
 * Droits assistants (RBAC applicatif).
 * Les vétérinaires (role=admin) et super_admin ont toujours accès complet.
 *
 * Stockage dans user_profiles.permissions (jsonb) :
 * - "none" | "view" | "edit" par module
 * - rétrocompat : true → "edit", false → "none"
 */

export type PermissionKey =
  | "can_manage_clients"
  | "can_manage_animals"
  | "can_manage_appointments"
  | "can_manage_visits"
  | "can_create_consultations"
  | "can_manage_vaccinations"
  | "can_manage_antiparasites"
  | "can_view_history"
  | "can_view_reports"
  | "can_manage_farms"
  | "can_manage_stock"
  | "can_manage_accounting"
  | "can_manage_settings";

/** none = pas d'accès · view = consultation seule · edit = consulter + créer/modifier/supprimer */
export type AccessLevel = "none" | "view" | "edit";

export type AssistantPermissions = Record<PermissionKey, AccessLevel>;

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  group: "clinique" | "elevage" | "admin";
  /** Modules lecture seule (pas de niveau « modifier ») */
  viewOnly?: boolean;
}

export const ACCESS_LEVEL_OPTIONS: {
  value: AccessLevel;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "Aucun", hint: "Module masqué" },
  { value: "view", label: "Consulter", hint: "Lecture seule" },
  { value: "edit", label: "Modifier", hint: "Créer, éditer, supprimer" },
];

/** Catalogue affiché dans Équipe → droits assistant */
export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    key: "can_manage_clients",
    label: "Clients",
    description: "Fiches clients",
    group: "clinique",
  },
  {
    key: "can_manage_animals",
    label: "Animaux",
    description: "Dossiers animaux / patients",
    group: "clinique",
  },
  {
    key: "can_manage_appointments",
    label: "Rendez-vous",
    description: "Agenda et prise de RDV",
    group: "clinique",
  },
  {
    key: "can_manage_visits",
    label: "Visites",
    description: "Journal des visites et workspace",
    group: "clinique",
  },
  {
    key: "can_create_consultations",
    label: "Consultations",
    description: "Consultations médicales",
    group: "clinique",
  },
  {
    key: "can_manage_vaccinations",
    label: "Vaccinations",
    description: "Protocoles et certificats",
    group: "clinique",
  },
  {
    key: "can_manage_antiparasites",
    label: "Antiparasites",
    description: "Traitements et rappels",
    group: "clinique",
  },
  {
    key: "can_view_history",
    label: "Historiques",
    description: "Historique médical consolidé",
    group: "clinique",
    viewOnly: true,
  },
  {
    key: "can_manage_farms",
    label: "Élevages / Fermes",
    description: "Exploitations, lots et interventions",
    group: "elevage",
  },
  {
    key: "can_manage_stock",
    label: "Stock",
    description: "Inventaire médicaments et produits",
    group: "admin",
  },
  {
    key: "can_manage_accounting",
    label: "Comptabilité",
    description: "Revenus, dépenses et journal",
    group: "admin",
  },
  {
    key: "can_manage_settings",
    label: "Paramètres clinique",
    description: "Configuration de la clinique",
    group: "admin",
  },
];

/** Accès clinique standard (édition) — à l'approbation */
export const DEFAULT_ASSISTANT_PERMISSIONS: AssistantPermissions = {
  can_manage_clients: "edit",
  can_manage_animals: "edit",
  can_manage_appointments: "edit",
  can_manage_visits: "edit",
  can_create_consultations: "edit",
  can_manage_vaccinations: "edit",
  can_manage_antiparasites: "edit",
  can_view_history: "view",
  can_view_reports: "view",
  can_manage_farms: "none",
  can_manage_stock: "none",
  can_manage_accounting: "none",
  can_manage_settings: "none",
};

/** Secrétariat : fiches + agenda en édition, actes en lecture / fermés */
export const PRESET_SECRETARIAT: AssistantPermissions = {
  ...DEFAULT_ASSISTANT_PERMISSIONS,
  can_manage_visits: "view",
  can_create_consultations: "view",
  can_manage_vaccinations: "view",
  can_manage_antiparasites: "view",
  can_view_history: "view",
  can_view_reports: "view",
  can_manage_farms: "none",
  can_manage_stock: "none",
  can_manage_accounting: "none",
  can_manage_settings: "none",
};

/** Étendu : clinique + élevages + stock (édition), sans finance ni paramètres */
export const PRESET_EXTENDED: AssistantPermissions = {
  ...DEFAULT_ASSISTANT_PERMISSIONS,
  can_manage_farms: "edit",
  can_manage_stock: "edit",
  can_manage_accounting: "none",
  can_manage_settings: "none",
};

/** Lecture seule clinique (consultation sans modification) */
export const PRESET_VIEW_ONLY: AssistantPermissions = {
  can_manage_clients: "view",
  can_manage_animals: "view",
  can_manage_appointments: "view",
  can_manage_visits: "view",
  can_create_consultations: "view",
  can_manage_vaccinations: "view",
  can_manage_antiparasites: "view",
  can_view_history: "view",
  can_view_reports: "view",
  can_manage_farms: "none",
  can_manage_stock: "none",
  can_manage_accounting: "none",
  can_manage_settings: "none",
};

export const PERMISSION_PRESETS: {
  id: string;
  label: string;
  description: string;
  permissions: AssistantPermissions;
}[] = [
  {
    id: "clinique",
    label: "Accès clinique",
    description: "Modules cliniques en modification",
    permissions: DEFAULT_ASSISTANT_PERMISSIONS,
  },
  {
    id: "lecture",
    label: "Lecture seule",
    description: "Consulter sans créer ni modifier",
    permissions: PRESET_VIEW_ONLY,
  },
  {
    id: "secretariat",
    label: "Secrétariat",
    description: "Clients / animaux / RDV en modification, actes en lecture",
    permissions: PRESET_SECRETARIAT,
  },
  {
    id: "etendu",
    label: "Étendu",
    description: "Clinique + élevages + stock (sans compta ni paramètres)",
    permissions: PRESET_EXTENDED,
  },
];

export const GROUP_LABELS: Record<PermissionDefinition["group"], string> = {
  clinique: "Soins & dossiers",
  elevage: "Élevage",
  admin: "Administration (sensible)",
};

export function parseAccessLevel(raw: unknown): AccessLevel {
  if (raw === "view" || raw === "edit" || raw === "none") return raw;
  if (raw === true) return "edit";
  if (raw === false || raw == null) return "none";
  if (raw === "true") return "edit";
  if (raw === "false") return "none";
  return "none";
}

/** Normalise jsonb stocké (booléens legacy + niveaux). */
export function normalizePermissions(
  raw?: Record<string, unknown> | null
): AssistantPermissions {
  const base = { ...DEFAULT_ASSISTANT_PERMISSIONS };
  if (!raw || typeof raw !== "object") return base;

  for (const def of PERMISSION_CATALOG) {
    if (def.key in raw) {
      let level = parseAccessLevel(raw[def.key]);
      if (def.viewOnly && level === "edit") level = "view";
      base[def.key] = level;
    }
  }

  // Rétrocompat can_view_reports ↔ can_view_history
  if ("can_view_reports" in raw && !("can_view_history" in raw)) {
    base.can_view_history = parseAccessLevel(raw.can_view_reports);
    if (base.can_view_history === "edit") base.can_view_history = "view";
  }
  base.can_view_reports = base.can_view_history;

  return base;
}

type AuthLike = {
  profile?: {
    role?: string;
    permissions?: Record<string, unknown> | null;
  } | null;
} | null;

export function getAccessLevel(
  user: AuthLike,
  permission: PermissionKey | null | undefined
): AccessLevel {
  if (!permission) return "edit";
  const role = user?.profile?.role;
  if (role === "super_admin" || role === "admin") return "edit";
  if (role !== "assistant") return "none";

  const perms = normalizePermissions(user?.profile?.permissions as any);
  if (permission === "can_view_reports" || permission === "can_view_history") {
    const level = perms.can_view_history;
    return level === "none" && perms.can_view_reports !== "none"
      ? perms.can_view_reports
      : level;
  }
  return perms[permission] ?? "none";
}

/** Accès au module (consulter ou modifier) — pour nav / routes */
export function userHasPermission(
  user: AuthLike,
  permission: PermissionKey | null | undefined
): boolean {
  if (!permission) return true;
  return getAccessLevel(user, permission) !== "none";
}

/** Peut consulter (view ou edit) */
export function userCanView(
  user: AuthLike,
  permission: PermissionKey | null | undefined
): boolean {
  const level = getAccessLevel(user, permission);
  return level === "view" || level === "edit";
}

/** Peut créer / modifier / supprimer */
export function userCanEdit(
  user: AuthLike,
  permission: PermissionKey | null | undefined
): boolean {
  return getAccessLevel(user, permission) === "edit";
}

export function accessLevelLabel(level: AccessLevel): string {
  return ACCESS_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;
}

/** Mappe un chemin d'app vers la permission requise (null = ouvert à tout user authentifié). */
export const ROUTE_PERMISSIONS: Record<string, PermissionKey | null> = {
  "/dashboard": null,
  "/clients": "can_manage_clients",
  "/pets": "can_manage_animals",
  "/appointments": "can_manage_appointments",
  "/visites": "can_manage_visits",
  "/consultations": "can_create_consultations",
  "/vaccinations": "can_manage_vaccinations",
  "/antiparasites": "can_manage_antiparasites",
  "/history": "can_view_history",
  "/farm": "can_manage_farms",
  "/farms": "can_manage_farms",
  "/stock": "can_manage_stock",
  "/accounting": "can_manage_accounting",
  "/settings": "can_manage_settings",
  "/admin/team": null,
  "/profile": null,
  "/auth-settings": null,
};
