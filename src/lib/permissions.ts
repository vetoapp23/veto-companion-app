/**
 * Droits assistants (RBAC applicatif).
 * Les vétérinaires (role=admin) et super_admin ont toujours accès complet.
 *
 * Stockage dans user_profiles.permissions (jsonb) :
 * - "none" | "view" | "edit" par module
 * - rétrocompat : true → "edit", false → "none"
 */

import i18n from "@/i18n";

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

export type PermissionGroup = "clinique" | "elevage" | "admin";

export interface PermissionCatalogEntry {
  key: PermissionKey;
  group: PermissionGroup;
  /** Modules lecture seule (pas de niveau « modifier ») */
  viewOnly?: boolean;
}

export interface PermissionDefinition extends PermissionCatalogEntry {
  label: string;
  description: string;
}

const PERMISSION_KEY_TO_MODULE: Record<PermissionKey, string> = {
  can_manage_clients: "clients",
  can_manage_animals: "animals",
  can_manage_appointments: "appointments",
  can_manage_visits: "visits",
  can_create_consultations: "consultations",
  can_manage_vaccinations: "vaccinations",
  can_manage_antiparasites: "antiparasitics",
  can_view_history: "history",
  can_view_reports: "history",
  can_manage_farms: "farms",
  can_manage_stock: "stock",
  can_manage_accounting: "accounting",
  can_manage_settings: "settings",
};

const PRESET_ID_TO_I18N: Record<string, string> = {
  clinique: "clinical",
  lecture: "readonly",
  secretariat: "frontDesk",
  etendu: "extended",
};

const GROUP_TO_I18N: Record<PermissionGroup, string> = {
  clinique: "clinical",
  elevage: "farm",
  admin: "admin",
};

const ACCESS_LEVEL_TO_I18N: Record<AccessLevel, "none" | "read" | "write"> = {
  none: "none",
  view: "read",
  edit: "write",
};

function tSettings(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, { ns: "settings", ...options });
}

export function getPermissionModuleLabel(moduleId: string): string {
  return tSettings(`permissions.modules.${moduleId}.label`);
}

export function getPermissionModuleDescription(moduleId: string): string {
  return tSettings(`permissions.modules.${moduleId}.description`);
}

export function getPermissionDefinitionLabel(key: PermissionKey): string {
  return getPermissionModuleLabel(PERMISSION_KEY_TO_MODULE[key]);
}

export function getPermissionDefinitionDescription(key: PermissionKey): string {
  return getPermissionModuleDescription(PERMISSION_KEY_TO_MODULE[key]);
}

export function getAccessLevelOptions(): {
  value: AccessLevel;
  label: string;
  hint: string;
}[] {
  return (["none", "view", "edit"] as const).map((value) => {
    const levelKey = ACCESS_LEVEL_TO_I18N[value];
    return {
      value,
      label: tSettings(`permissions.levels.${levelKey}`),
      hint: tSettings(`permissions.levels.${levelKey}Hint`),
    };
  });
}

/** @deprecated Use getAccessLevelOptions() for UI labels */
export const ACCESS_LEVEL_OPTIONS = getAccessLevelOptions();

/** Catalogue structurel (sans libellés i18n) */
export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  { key: "can_manage_clients", group: "clinique" },
  { key: "can_manage_animals", group: "clinique" },
  { key: "can_manage_appointments", group: "clinique" },
  { key: "can_manage_visits", group: "clinique" },
  { key: "can_create_consultations", group: "clinique" },
  { key: "can_manage_vaccinations", group: "clinique" },
  { key: "can_manage_antiparasites", group: "clinique" },
  { key: "can_view_history", group: "clinique", viewOnly: true },
  { key: "can_manage_farms", group: "elevage" },
  { key: "can_manage_stock", group: "admin" },
  { key: "can_manage_accounting", group: "admin" },
  { key: "can_manage_settings", group: "admin" },
];

export function getPermissionCatalog(): PermissionDefinition[] {
  return PERMISSION_CATALOG.map((entry) => ({
    ...entry,
    label: getPermissionDefinitionLabel(entry.key),
    description: getPermissionDefinitionDescription(entry.key),
  }));
}

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

const PERMISSION_PRESET_DEFS: {
  id: string;
  permissions: AssistantPermissions;
}[] = [
  { id: "clinique", permissions: DEFAULT_ASSISTANT_PERMISSIONS },
  { id: "lecture", permissions: PRESET_VIEW_ONLY },
  { id: "secretariat", permissions: PRESET_SECRETARIAT },
  { id: "etendu", permissions: PRESET_EXTENDED },
];

export function getPermissionPresets(): {
  id: string;
  label: string;
  description: string;
  permissions: AssistantPermissions;
}[] {
  return PERMISSION_PRESET_DEFS.map((preset) => {
    const key = PRESET_ID_TO_I18N[preset.id];
    return {
      ...preset,
      label: tSettings(`permissions.presets.${key}`),
      description: tSettings(`permissions.presetDescriptions.${key}`),
    };
  });
}

/** @deprecated Use getPermissionPresets() for UI labels */
export const PERMISSION_PRESETS = getPermissionPresets();

export function getGroupLabel(group: PermissionGroup): string {
  return tSettings(`permissions.groups.${GROUP_TO_I18N[group]}`);
}

/** @deprecated Use getGroupLabel() for UI labels */
export const GROUP_LABELS: Record<PermissionGroup, string> = {
  clinique: getGroupLabel("clinique"),
  elevage: getGroupLabel("elevage"),
  admin: getGroupLabel("admin"),
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
  const levelKey = ACCESS_LEVEL_TO_I18N[level];
  return tSettings(`permissions.levels.${levelKey}`);
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
