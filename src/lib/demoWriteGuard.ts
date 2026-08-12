import { isDemoReadOnlyActive, isDemoReadOnlySession, isDemoViewerEmail } from "@/lib/demoMode";

export class DemoReadOnlyError extends Error {
  constructor(message = "DEMO_READONLY") {
    super(message);
    this.name = "DemoReadOnlyError";
  }
}

/** Throw if the current browser session must not mutate shared demo data. */
export function assertDemoCanWrite(email?: string | null): void {
  if (isDemoReadOnlyActive(email)) {
    throw new DemoReadOnlyError();
  }
}

export function isDemoWriteBlocked(email?: string | null): boolean {
  return isDemoReadOnlyActive(email) || isDemoReadOnlySession() || isDemoViewerEmail(email);
}
