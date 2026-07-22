import { supabase } from "@/integrations/supabase/client";
import type { VisitServiceCode } from "@/lib/visitCatalog";

export type VisitStatus = "in_progress" | "completed" | "cancelled";
export type VisitServiceStatus = "planned" | "in_progress" | "done" | "skipped";
export type VisitContext = "companion" | "farm";
export type VisitBillingMode = "forfait" | "per_head";

export interface VisitService {
  id: string;
  visit_id: string;
  organization_id: string;
  service_code: VisitServiceCode | string;
  service_label: string;
  status: VisitServiceStatus;
  reference_type: string | null;
  reference_id: string | null;
  amount: number | null;
  notes: string | null;
  /** Image data URLs or storage paths */
  attachments: string[];
  /** Type-specific form fields (region, findings, lab results, …) */
  details: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  organization_id: string;
  client_id: string;
  animal_id: string | null;
  appointment_id: string | null;
  veterinarian_id: string | null;
  visit_date: string;
  status: VisitStatus;
  reason: string | null;
  notes: string | null;
  total_amount: number | null;
  invoiced: boolean;
  context: VisitContext;
  farm_id: string | null;
  billing_mode: VisitBillingMode | null;
  head_count: number | null;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    email?: string | null;
    client_type?: string | null;
  } | null;
  animal?: {
    id: string;
    name: string;
    species?: string | null;
    breed?: string | null;
  } | null;
  farm?: {
    id: string;
    farm_name: string;
    farm_type?: string | null;
    herd_size?: number | null;
  } | null;
  appointment?: {
    id: string;
    appointment_date: string;
    appointment_type: string;
    status: string;
  } | null;
  services?: VisitService[];
}

export interface CreateVisitInput {
  client_id: string;
  animal_id?: string | null;
  appointment_id?: string | null;
  reason?: string | null;
  notes?: string | null;
  visit_date?: string;
  context?: VisitContext;
  farm_id?: string | null;
  billing_mode?: VisitBillingMode | null;
  head_count?: number | null;
  /** Seed first service when creating from RDV */
  initial_service?: {
    service_code: string;
    service_label: string;
    amount?: number;
  };
}

async function getOrgAndUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.organization_id) {
    throw new Error("Organisation introuvable");
  }

  return { user, organizationId: profile.organization_id as string };
}

const VISIT_SELECT = `
  *,
  client:clients(id, first_name, last_name, phone, email, client_type),
  animal:animals(id, name, species, breed),
  farm:farms(id, farm_name, farm_type, herd_size),
  appointment:appointments(id, appointment_date, appointment_type, status),
  services:visit_services(*)
`;

export async function listVisits(status?: VisitStatus): Promise<Visit[]> {
  let query = supabase
    .from("visits")
    .select(VISIT_SELECT)
    .order("visit_date", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeVisit);
}

export async function getVisit(id: string): Promise<Visit> {
  const { data, error } = await supabase
    .from("visits")
    .select(VISIT_SELECT)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return normalizeVisit(data);
}

export async function findActiveVisitByAppointment(appointmentId: string): Promise<Visit | null> {
  const { data, error } = await supabase
    .from("visits")
    .select(VISIT_SELECT)
    .eq("appointment_id", appointmentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeVisit(data) : null;
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  const { user, organizationId } = await getOrgAndUser();

  if (input.appointment_id) {
    const existing = await findActiveVisitByAppointment(input.appointment_id);
    if (existing) return existing;
  }

  const context = input.context || (input.farm_id ? "farm" : "companion");
  if (context === "farm" && !input.farm_id) {
    throw new Error("Une exploitation est requise pour une visite ferme");
  }

  const { data: visit, error } = await supabase
    .from("visits")
    .insert({
      organization_id: organizationId,
      client_id: input.client_id,
      animal_id: input.animal_id || null,
      appointment_id: input.appointment_id || null,
      veterinarian_id: user.id,
      visit_date: input.visit_date || new Date().toISOString(),
      status: "in_progress",
      reason: input.reason || null,
      notes: input.notes || null,
      total_amount: input.initial_service?.amount ?? 0,
      context,
      farm_id: input.farm_id || null,
      billing_mode: context === "farm" ? input.billing_mode || "forfait" : null,
      head_count: context === "farm" ? input.head_count ?? null : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (input.initial_service) {
    await supabase.from("visit_services").insert({
      visit_id: visit.id,
      organization_id: organizationId,
      service_code: input.initial_service.service_code,
      service_label: input.initial_service.service_label,
      amount: input.initial_service.amount ?? 0,
      status: "planned",
      sort_order: 0,
    });
  }

  if (input.appointment_id) {
    await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", input.appointment_id)
      .in("status", ["scheduled"]);
  }

  return getVisit(visit.id);
}

export async function updateVisit(
  id: string,
  patch: Partial<
    Pick<
      Visit,
      | "status"
      | "reason"
      | "notes"
      | "animal_id"
      | "invoiced"
      | "total_amount"
      | "farm_id"
      | "billing_mode"
      | "head_count"
      | "invoice_id"
      | "context"
    >
  >
): Promise<Visit> {
  const { error } = await supabase
    .from("visits")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Keep linked appointment animal in sync when set from the visit
  if (patch.animal_id !== undefined) {
    const { data: visitRow } = await supabase
      .from("visits")
      .select("appointment_id")
      .eq("id", id)
      .single();
    if (visitRow?.appointment_id) {
      await supabase
        .from("appointments")
        .update({ animal_id: patch.animal_id || null })
        .eq("id", visitRow.appointment_id);
    }
  }

  return getVisit(id);
}

export async function addVisitService(
  visitId: string,
  service: {
    service_code: string;
    service_label: string;
    amount?: number;
    notes?: string;
  }
): Promise<VisitService> {
  const { organizationId } = await getOrgAndUser();
  const visit = await getVisit(visitId);
  const sortOrder = (visit.services?.length || 0);

  const { data, error } = await supabase
    .from("visit_services")
    .insert({
      visit_id: visitId,
      organization_id: organizationId,
      service_code: service.service_code,
      service_label: service.service_label,
      amount: service.amount ?? 0,
      notes: service.notes || null,
      status: "planned",
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await recalculateVisitTotal(visitId);
  return data as VisitService;
}

export async function updateVisitService(
  serviceId: string,
  patch: Partial<
    Pick<
      VisitService,
      | "status"
      | "amount"
      | "notes"
      | "reference_type"
      | "reference_id"
      | "service_label"
      | "attachments"
      | "details"
    >
  >
): Promise<void> {
  const { data, error } = await supabase
    .from("visit_services")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", serviceId)
    .select("visit_id")
    .single();

  if (error) throw new Error(error.message);
  if (data?.visit_id) await recalculateVisitTotal(data.visit_id);
}

export async function removeVisitService(serviceId: string): Promise<void> {
  const { data, error } = await supabase
    .from("visit_services")
    .delete()
    .eq("id", serviceId)
    .select("visit_id")
    .single();

  if (error) throw new Error(error.message);
  if (data?.visit_id) await recalculateVisitTotal(data.visit_id);
}

async function recalculateVisitTotal(visitId: string) {
  const { data: visitRow } = await supabase
    .from("visits")
    .select("billing_mode, head_count")
    .eq("id", visitId)
    .single();

  const { data: services } = await supabase
    .from("visit_services")
    .select("amount, status")
    .eq("visit_id", visitId);

  const qty =
    visitRow?.billing_mode === "per_head" && Number(visitRow.head_count) > 0
      ? Number(visitRow.head_count)
      : 1;

  const total = (services || [])
    .filter((s) => s.status !== "skipped")
    .reduce((sum, s) => sum + (Number(s.amount) || 0) * qty, 0);

  await supabase
    .from("visits")
    .update({ total_amount: total, updated_at: new Date().toISOString() })
    .eq("id", visitId);
}

export async function completeVisit(visitId: string): Promise<Visit> {
  const visit = await updateVisit(visitId, { status: "completed" });
  if (visit.appointment_id) {
    await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", visit.appointment_id);
  }
  return visit;
}

function normalizeVisit(row: any): Visit {
  const services = Array.isArray(row.services)
    ? [...row.services].sort((a: VisitService, b: VisitService) => a.sort_order - b.sort_order)
    : [];
  return {
    ...row,
    context: row.context || "companion",
    farm_id: row.farm_id || null,
    billing_mode: row.billing_mode || null,
    head_count: row.head_count ?? null,
    invoice_id: row.invoice_id || null,
    client: Array.isArray(row.client) ? row.client[0] : row.client,
    animal: Array.isArray(row.animal) ? row.animal[0] : row.animal,
    farm: Array.isArray(row.farm) ? row.farm[0] : row.farm,
    appointment: Array.isArray(row.appointment) ? row.appointment[0] : row.appointment,
    services: services.map((s: any) => ({
      ...s,
      attachments: Array.isArray(s.attachments) ? s.attachments : [],
      details: s.details && typeof s.details === "object" ? s.details : {},
    })),
  };
}
