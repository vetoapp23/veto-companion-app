import { supabase } from "@/integrations/supabase/client";

export const PLATFORM_FEATURE_KEYS = [
  "consultations",
  "visits",
  "appointments",
  "vaccinations",
  "antiparasites",
  "farm",
  "stock",
  "accounting",
  "clients",
  "animals",
] as const;

export type PlatformFeatureKey = (typeof PLATFORM_FEATURE_KEYS)[number];

export const PAYMENT_METHODS = ["virement", "especes", "cheque", "stripe", "autre"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export async function logAdminAction(params: {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  organizationId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.rpc("log_admin_action" as any, {
    p_action: params.action,
    p_resource_type: params.resourceType,
    p_resource_id: params.resourceId ?? null,
    p_organization_id: params.organizationId ?? null,
    p_before: params.before ?? null,
    p_after: params.after ?? null,
    p_metadata: params.metadata ?? {},
  });
  if (error) console.warn("[audit]", error.message);
}

export async function adminUpdateUser(userId: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase.rpc("admin_update_user_profile" as any, {
    p_user_id: userId,
    p_patch: patch,
  });
  if (error) throw error;
  return data;
}

export async function adminUpsertSubscription(orgId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.rpc("admin_upsert_subscription" as any, {
    p_organization_id: orgId,
    p_payload: payload,
  });
  if (error) throw error;
  return data;
}

export async function adminRecordSubscriptionPayment(params: {
  organizationId: string;
  amount: number;
  currency?: string;
  method?: PaymentMethod;
  reference?: string | null;
  paidAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  status?: "received" | "pending" | "refunded";
  notes?: string | null;
  planCode?: string | null;
  activate?: boolean;
}) {
  const { data, error } = await supabase.rpc("admin_record_subscription_payment" as any, {
    p_organization_id: params.organizationId,
    p_amount: params.amount,
    p_currency: params.currency ?? "MAD",
    p_method: params.method ?? "virement",
    p_reference: params.reference ?? null,
    p_paid_at: params.paidAt ?? new Date().toISOString(),
    p_period_start: params.periodStart ?? null,
    p_period_end: params.periodEnd ?? null,
    p_status: params.status ?? "received",
    p_notes: params.notes ?? null,
    p_plan_code: params.planCode ?? null,
    p_activate: params.activate ?? true,
  });
  if (error) throw error;
  return data;
}

export async function adminListSubscriptionPayments(orgId?: string | null, limit = 100) {
  const { data, error } = await supabase.rpc("admin_list_subscription_payments" as any, {
    p_organization_id: orgId ?? null,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function adminSetOrgUser(
  userId: string,
  patch: { role?: "admin" | "assistant" | null; status?: string | null },
) {
  const { data, error } = await supabase.rpc("admin_set_org_user" as any, {
    p_user_id: userId,
    p_role: patch.role ?? null,
    p_status: patch.status ?? null,
  });
  if (error) throw error;
  return data;
}

export async function fetchOrgDetail(orgId: string) {
  const { data, error } = await supabase.rpc("get_org_admin_detail" as any, {
    p_org_id: orgId,
  });
  if (error) throw error;
  return data as any;
}

export async function fetchBillingOverview() {
  const { data, error } = await supabase.rpc("get_super_admin_billing_overview" as any);
  if (error) throw error;
  return data as any;
}

export async function fetchAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from("admin_audit_logs" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlatformSettings() {
  const { data, error } = await supabase.from("platform_settings" as any).select("*");
  if (error) throw error;
  const map: Record<string, any> = {};
  (data ?? []).forEach((r: any) => {
    map[r.key] = r.value;
  });
  return map;
}

export async function upsertPlatformSetting(key: string, value: unknown) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("platform_settings" as any).upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userData.user?.id ?? null,
  });
  if (error) throw error;
  await logAdminAction({
    action: "platform_settings.update",
    resourceType: "platform_settings",
    resourceId: key,
    after: value,
  });
}

export async function addSupportNote(orgId: string, body: string) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("email")
    .eq("id", userData.user?.id ?? "")
    .maybeSingle();

  const { error } = await supabase.from("org_support_notes" as any).insert({
    organization_id: orgId,
    author_id: userData.user?.id,
    author_email: profile?.email ?? userData.user?.email,
    body,
  });
  if (error) throw error;
  await logAdminAction({
    action: "support_note.create",
    resourceType: "org_support_note",
    organizationId: orgId,
    after: { body },
  });
}

/** Approximate MRR helper for UI when RPC unavailable */
export function formatMad(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} MAD`;
}

export function formatMoney(n: number, currency = "MAD") {
  return `${Math.round(n).toLocaleString("fr-FR")} ${currency}`;
}
