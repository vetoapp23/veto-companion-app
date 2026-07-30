import { supabase } from "@/integrations/supabase/client";
import {
  addVisitService,
  createVisit,
  getVisit,
  removeVisitService,
  updateVisitService,
  type Visit,
  type VisitService,
} from "@/lib/visits";
import {
  getServiceDef,
  resolveServiceAmount,
  type VisitServiceCode,
} from "@/lib/visitCatalog";

export type ConsultationSyncInput = {
  id: string;
  client_id: string;
  animal_id: string;
  visit_id?: string | null;
  consultation_date?: string | null;
  consultation_type?: string | null;
  status?: string | null;
  cost?: number | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
};

function isClinicalServiceCode(code?: string | null): boolean {
  return getServiceDef(code || "")?.action === "consultation";
}

/** Mappe le type de consultation vers un code catalogue visite. */
export function resolveConsultationServiceCode(
  consultationType?: string | null
): VisitServiceCode {
  const raw = (consultationType || "consultation").trim();
  const def = getServiceDef(raw);
  if (def?.action === "consultation") return def.code;

  const t = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (t.includes("urgence") || t.includes("emergency")) return "emergency";
  if (
    t.includes("controle") ||
    t.includes("checkup") ||
    t.includes("follow") ||
    t.includes("suivi")
  ) {
    return "checkup";
  }
  if (t.includes("chirur") || t.includes("surgery") || t.includes("steril")) {
    return "surgery";
  }
  return "consultation";
}

function consultationIsBillableDone(status?: string | null): boolean {
  const s = (status || "completed").toLowerCase();
  return s === "completed" || s === "in-progress" || s === "in_progress" || s === "done";
}

function dayKey(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

function pickLinkableClinicalService(
  services: VisitService[],
  preferredCode: string
): VisitService | undefined {
  const open = services.filter(
    (s) =>
      s.status !== "skipped" &&
      !s.reference_id &&
      isClinicalServiceCode(s.service_code)
  );
  return (
    open.find((s) => s.service_code === preferredCode && s.status === "in_progress") ||
    open.find((s) => s.status === "in_progress") ||
    open.find((s) => s.service_code === preferredCode) ||
    open[0]
  );
}

async function findOpenVisitForAnimal(opts: {
  clientId: string;
  animalId: string;
  day: string;
}): Promise<Visit | null> {
  const nextDay = new Date(`${opts.day}T00:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextKey = nextDay.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("visits")
    .select("id")
    .eq("client_id", opts.clientId)
    .eq("animal_id", opts.animalId)
    .eq("status", "in_progress")
    .gte("visit_date", `${opts.day}T00:00:00`)
    .lt("visit_date", `${nextKey}T00:00:00`)
    .order("visit_date", { ascending: false })
    .limit(1);

  if (error || !data?.[0]?.id) return null;
  return getVisit(data[0].id);
}

async function findLinkedService(
  consultationId: string
): Promise<VisitService | null> {
  const { data, error } = await supabase
    .from("visit_services")
    .select("*")
    .eq("reference_type", "consultation")
    .eq("reference_id", consultationId)
    .maybeSingle();

  if (error || !data) return null;
  return data as VisitService;
}

/**
 * Assure qu'une consultation a une visite + prestation liées.
 * - Depuis la page Consultations : crée / réutilise une visite du jour
 * - Depuis le workspace visite : rattache la prestation clinique ouverte
 * Comptabilité : status done → syncVisitServiceToAccounting (via updateVisitService)
 */
export async function ensureVisitServiceForConsultation(
  consultation: ConsultationSyncInput
): Promise<{ visitId: string; serviceId: string } | null> {
  if (!consultation?.id || !consultation.client_id || !consultation.animal_id) {
    return null;
  }

  const code = resolveConsultationServiceCode(consultation.consultation_type);
  const def = getServiceDef(code);
  const label = def?.label || "Consultation";
  const markDone = consultationIsBillableDone(consultation.status);
  const serviceStatus = markDone
    ? ("done" as const)
    : consultation.status === "cancelled"
      ? ("skipped" as const)
      : ("planned" as const);

  const resolveAmount = (fallback?: number | null) => {
    if (consultation.cost != null && Number(consultation.cost) > 0) {
      return Number(consultation.cost);
    }
    if (fallback != null && Number(fallback) > 0) return Number(fallback);
    return resolveServiceAmount(code);
  };

  // Déjà liée
  const existing = await findLinkedService(consultation.id);
  if (existing) {
    const amount = resolveAmount(existing.amount);
    await updateVisitService(existing.id, {
      status: serviceStatus === "skipped" ? "skipped" : markDone ? "done" : existing.status,
      amount,
      service_label: existing.service_label || label,
    });
    if (!consultation.visit_id && existing.visit_id) {
      await supabase
        .from("consultations")
        .update({
          visit_id: existing.visit_id,
          cost: amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultation.id);
    }
    return { visitId: existing.visit_id, serviceId: existing.id };
  }

  let visit: Visit | null = null;
  if (consultation.visit_id) {
    try {
      visit = await getVisit(consultation.visit_id);
    } catch {
      visit = null;
    }
  }

  if (!visit) {
    visit = await findOpenVisitForAnimal({
      clientId: consultation.client_id,
      animalId: consultation.animal_id,
      day: dayKey(consultation.consultation_date),
    });
  }

  if (!visit) {
    const seedAmount = resolveAmount(null);
    visit = await createVisit({
      client_id: consultation.client_id,
      animal_id: consultation.animal_id,
      visit_date: consultation.consultation_date || new Date().toISOString(),
      reason:
        consultation.diagnosis ||
        consultation.symptoms ||
        consultation.notes ||
        label,
      initial_service: {
        service_code: code,
        service_label: label,
        amount: seedAmount,
      },
    });
  }

  let service = pickLinkableClinicalService(visit.services || [], code);

  if (!service) {
    // Visite créée avec initial_service : recharger
    visit = await getVisit(visit.id);
    service = pickLinkableClinicalService(visit.services || [], code);
  }

  if (!service) {
    service = await addVisitService(visit.id, {
      service_code: code,
      service_label: label,
      amount: resolveAmount(null),
    });
  }

  const amount = resolveAmount(service.amount);

  await updateVisitService(service.id, {
    status: serviceStatus === "skipped" ? "skipped" : markDone ? "done" : "planned",
    reference_type: "consultation",
    reference_id: consultation.id,
    amount,
    service_label: service.service_label || label,
  });

  await supabase
    .from("consultations")
    .update({
      visit_id: visit.id,
      cost: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", consultation.id);

  return { visitId: visit.id, serviceId: service.id };
}

/** Supprime la prestation visite liée (et sa recette) quand on efface une consultation. */
export async function removeVisitLinkForConsultation(
  consultationId: string
): Promise<void> {
  if (!consultationId) return;

  const { data: services, error } = await supabase
    .from("visit_services")
    .select("id")
    .eq("reference_type", "consultation")
    .eq("reference_id", consultationId);

  if (error) {
    console.warn("Could not find visit_services for consultation", consultationId, error);
    return;
  }

  for (const row of services || []) {
    try {
      await removeVisitService(row.id);
    } catch (err) {
      console.warn("Could not remove linked visit_service", row.id, err);
      // Fallback : au moins détacher + annuler le statut
      try {
        await updateVisitService(row.id, {
          status: "skipped",
          reference_type: null as any,
          reference_id: null as any,
        });
      } catch {
        /* ignore */
      }
    }
  }
}
