import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RELOAD_KEY = "vetocrm:stale-chunk-reload";

/** Vite/CDN deploy left the tab on an old bundle that references missing hashed chunks. */
export function isStaleChunkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Loading CSS chunk [\d]+ failed/i.test(msg)
  );
}

/** Reload once; returns true if a reload was triggered. */
export function reloadOnceForStaleChunk(error: unknown): boolean {
  if (!isStaleChunkError(error) || typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (last && Date.now() - last < 15_000) {
      sessionStorage.removeItem(RELOAD_KEY);
      return false;
    }
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/** Like React.lazy, but recovers from stale hashed chunks after a deploy. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((error) => {
      if (reloadOnceForStaleChunk(error)) {
        return new Promise(() => {});
      }
      throw error;
    }),
  );
}
