export function reportLovableError(error: unknown, context?: Record<string, unknown>) {
  console.error("[lovable-error]", error, context);
}
