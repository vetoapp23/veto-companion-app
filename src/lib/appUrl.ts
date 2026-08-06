/**
 * Origin used for auth redirects (OAuth, email confirm, password reset).
 * Prefer the current browser origin so prod (vetocrm.com) never redirects to
 * a baked-in VITE_APP_URL=localhost from a bad build / shared .env.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    // Guard: never treat file:// or empty as valid
    if (origin.startsWith("http://") || origin.startsWith("https://")) {
      return origin;
    }
  }
  const fromEnv = (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL ||
    "https://vetocrm.com"
  )
    .toString()
    .replace(/\/$/, "");
  return fromEnv;
}

export function appPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getAppOrigin()}${p}`;
}
