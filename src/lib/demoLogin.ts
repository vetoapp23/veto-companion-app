import { supabase } from "@/integrations/supabase/client";
import { DEMO_TOUR_STORAGE_KEY } from "@/lib/demoTour/types";
import {
  clearDemoReadOnlySession,
  DEMO_CLINIC_EMAIL,
  DEMO_VIEWER_EMAIL,
  enableDemoReadOnlySession,
  isDemoViewerEmail,
} from "@/lib/demoMode";

export { DEMO_CLINIC_EMAIL, DEMO_VIEWER_EMAIL };

export const isDemoLoginEnabled =
  import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_DEMO === "true";

export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "DemoVetpro2026!";

async function signInDemo(email: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  });
  if (error) throw error;
}

/** Writable clinic admin — for internal QA via login panel only. */
export async function loginDemoClinic() {
  clearDemoReadOnlySession();
  await signInDemo(DEMO_CLINIC_EMAIL);
}

export type LaunchClinicDemoResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "auth_failed"; message?: string };

/**
 * Public marketing demo: guided tour on real clinic data, always read-only.
 * Always signs in as demo-viewer@ (never the writable clinic admin).
 */
export async function launchClinicDemo(): Promise<LaunchClinicDemoResult> {
  try {
    sessionStorage.setItem(DEMO_TOUR_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  enableDemoReadOnlySession();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const email = session?.user?.email?.toLowerCase() ?? "";

  if (isDemoViewerEmail(email)) {
    window.location.href = "/dashboard";
    return { ok: true };
  }

  // If already on clinic admin (e.g. leftover QA session), switch to viewer
  if (email === DEMO_CLINIC_EMAIL.toLowerCase()) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
  }

  if (!isDemoLoginEnabled) {
    try {
      sessionStorage.removeItem(DEMO_TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    clearDemoReadOnlySession();
    return { ok: false, reason: "unavailable" };
  }

  try {
    await signInDemo(DEMO_VIEWER_EMAIL);
    window.location.href = "/dashboard";
    return { ok: true };
  } catch (e: unknown) {
    try {
      sessionStorage.removeItem(DEMO_TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    clearDemoReadOnlySession();
    const message = e instanceof Error ? e.message : undefined;
    return { ok: false, reason: "auth_failed", message };
  }
}
