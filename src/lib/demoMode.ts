/** Public product demo: explore real data without mutating it. */

export const DEMO_READONLY_STORAGE_KEY = "vetocrm-demo-readonly";
export const DEMO_VIEWER_EMAIL = "demo-viewer@vetpro.test";
export const DEMO_CLINIC_EMAIL = "demo-clinic@vetpro.test";

/** All modules readable for the public clinic demo visitor. */
export const DEMO_VIEWER_PERMISSIONS = {
  can_manage_clients: "view",
  can_manage_animals: "view",
  can_manage_appointments: "view",
  can_manage_visits: "view",
  can_create_consultations: "view",
  can_manage_vaccinations: "view",
  can_manage_antiparasites: "view",
  can_view_history: "view",
  can_view_reports: "view",
  can_manage_farms: "view",
  can_manage_stock: "view",
  can_manage_accounting: "view",
  can_manage_settings: "view",
} as const;

export function enableDemoReadOnlySession() {
  try {
    sessionStorage.setItem(DEMO_READONLY_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearDemoReadOnlySession() {
  try {
    sessionStorage.removeItem(DEMO_READONLY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isDemoReadOnlySession(): boolean {
  try {
    return sessionStorage.getItem(DEMO_READONLY_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isDemoViewerEmail(email?: string | null): boolean {
  return (email ?? "").toLowerCase() === DEMO_VIEWER_EMAIL.toLowerCase();
}

/** True when the current browser session must not mutate demo data. */
export function isDemoReadOnlyActive(email?: string | null): boolean {
  return isDemoReadOnlySession() || isDemoViewerEmail(email);
}
