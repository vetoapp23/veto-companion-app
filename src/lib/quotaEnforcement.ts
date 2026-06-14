import { supabase } from "@/integrations/supabase/client";

export type QuotaKind = "clients" | "animals" | "users";

export interface QuotaCheckResult {
  allowed: boolean;
  current?: number;
  max?: number | null;
  plan_code?: string;
  plan_name?: string;
  message?: string;
  bypass?: boolean;
}

export class QuotaLimitError extends Error {
  kind: QuotaKind;
  max: number | null;
  current: number;
  planName?: string;

  constructor(kind: QuotaKind, result: QuotaCheckResult) {
    super(
      result.message ||
        `Limite ${kind} atteinte (${result.current ?? "?"}/${result.max ?? "∞"}). Passez à un pack payant.`
    );
    this.name = "QuotaLimitError";
    this.kind = kind;
    this.max = result.max ?? null;
    this.current = result.current ?? 0;
    this.planName = result.plan_name;
  }
}

export async function checkQuotaLimit(kind: QuotaKind): Promise<QuotaCheckResult | null> {
  const { data, error } = await supabase.rpc("check_quota_limit" as any, { p_kind: kind });
  if (error) {
    console.warn("[quota] check_quota_limit failed", error);
    return null;
  }
  return (data ?? null) as QuotaCheckResult | null;
}

export async function assertQuotaAvailable(kind: QuotaKind): Promise<void> {
  const result = await checkQuotaLimit(kind);
  if (result.bypass || result.allowed) return;
  throw new QuotaLimitError(kind, result);
}

export function quotaKindLabel(kind: QuotaKind): string {
  return { clients: "clients", animals: "animaux", users: "utilisateurs" }[kind];
}
