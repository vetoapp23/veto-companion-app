import { supabase } from "@/integrations/supabase/client";
import {
  addVisitService,
  createVisit,
  getVisit,
  updateVisitService,
  type Visit,
  type VisitService,
} from "@/lib/visits";
import {
  getServiceDef,
  resolveServiceAmount,
  type VisitServiceCode,
} from "@/lib/visitCatalog";

export type FarmInterventionSyncInput = {
  id: string;
  farm_id: string;
  intervention_date?: string | null;
  intervention_type?: string | null;
  protocol_type?: string | null;
  cost?: number | null;
  animal_count?: number | null;
  affected_count?: number | null;
  description?: string | null;
  notes?: string | null;
  /** Visite workspace déjà ouverte */
  preferVisitId?: string | null;
  /** Prestation ferme déjà sélectionnée dans le workspace */
  preferServiceId?: string | null;
};

function dayKey(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

function isFarmServiceCode(code?: string | null): boolean {
  return getServiceDef(code || "")?.action === "farm_intervention";
}

/** Mappe le type d'intervention ferme vers un code catalogue visite. */
export function resolveFarmInterventionServiceCode(
  interventionType?: string | null,
  protocolType?: string | null
): VisitServiceCode {
  const raw = `${interventionType || ""} ${protocolType || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (raw.includes("vaccin")) return "herd_vaccination";
  if (raw.includes("prophyl") || raw.includes("prevent") || raw.includes("prévent")) {
    return "prophylaxis";
  }
  return "farm_visit";
}

function pickLinkableFarmService(
  services: VisitService[],
  preferredCode: string,
  preferServiceId?: string | null
): VisitService | undefined {
  if (preferServiceId) {
    const preferred = services.find((s) => s.id === preferServiceId);
    if (preferred && preferred.status !== "skipped") return preferred;
  }

  const open = services.filter(
    (s) =>
      s.status !== "skipped" &&
      !s.reference_id &&
      isFarmServiceCode(s.service_code)
  );

  return (
    open.find(
      (s) =>
        !s.reference_id &&
        s.service_code === preferredCode &&
        s.status === "in_progress"
    ) ||
    open.find((s) => !s.reference_id && s.status === "in_progress") ||
    open.find((s) => !s.reference_id && s.service_code === preferredCode) ||
    open.find((s) => !s.reference_id) ||
    open[0]
  );
}

async function findLinkedService(
  interventionId: string
): Promise<VisitService | null> {
  const { data, error } = await supabase
    .from("visit_services")
    .select("*")
    .eq("reference_type", "farm_intervention")
    .eq("reference_id", interventionId)
    .maybeSingle();

  if (error || !data) return null;
  return data as VisitService;
}

async function findOpenFarmVisit(opts: {
  farmId: string;
  clientId: string;
  day: string;
}): Promise<Visit | null> {
  const nextDay = new Date(`${opts.day}T00:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextKey = nextDay.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("visits")
    .select("id")
    .eq("farm_id", opts.farmId)
    .eq("client_id", opts.clientId)
    .eq("context", "farm")
    .eq("status", "in_progress")
    .gte("visit_date", `${opts.day}T00:00:00`)
    .lt("visit_date", `${nextKey}T00:00:00`)
    .order("visit_date", { ascending: false })
    .limit(1);

  if (error || !data?.[0]?.id) return null;
  return getVisit(data[0].id);
}

async function getFarmClientId(farmId: string): Promise<{
  clientId: string;
  farmName?: string;
  herdSize?: number | null;
} | null> {
  const { data, error } = await supabase
    .from("farms")
    .select("client_id, farm_name, herd_size")
    .eq("id", farmId)
    .maybeSingle();

  if (error || !data?.client_id) return null;
  return {
    clientId: data.client_id as string,
    farmName: data.farm_name as string | undefined,
    herdSize: data.herd_size as number | null | undefined,
  };
}

/**
 * Relie une intervention ferme à une visite d'élevage + prestation.
 * - Depuis le workspace visite : rattache la prestation ouverte
 * - Depuis Fermes : réutilise une visite du jour (même exploitation) ou en crée une
 * Comptabilité : status done → syncVisitServiceToAccounting
 */
export async function ensureVisitServiceForFarmIntervention(
  intervention: FarmInterventionSyncInput
): Promise<{ visitId: string; serviceId: string } | null> {
  if (!intervention?.id || !intervention.farm_id) return null;

  const farm = await getFarmClientId(intervention.farm_id);
  if (!farm) {
    console.warn("Farm intervention sync: farm/client introuvable", intervention.farm_id);
    return null;
  }

  const code = resolveFarmInterventionServiceCode(
    intervention.intervention_type,
    intervention.protocol_type
  );
  const def = getServiceDef(code);
  const label =
    intervention.intervention_type?.trim() ||
    def?.label ||
    "Visite d'élevage";

  const resolveAmount = (fallback?: number | null) => {
    if (intervention.cost != null && Number(intervention.cost) > 0) {
      return Number(intervention.cost);
    }
    if (fallback != null && Number(fallback) > 0) return Number(fallback);
    return resolveServiceAmount(code);
  };

  const headCount =
    intervention.affected_count ??
    intervention.animal_count ??
    farm.herdSize ??
    null;

  // Déjà liée
  const existing = await findLinkedService(intervention.id);
  if (existing) {
    const amount = resolveAmount(existing.amount);
    await updateVisitService(existing.id, {
      status: "done",
      amount,
      service_label: existing.service_label || label,
      details: {
        ...(typeof existing.details === "object" && existing.details
          ? existing.details
          : {}),
        intervention_type: intervention.intervention_type || null,
        protocol_type: intervention.protocol_type || null,
      },
    });
    return { visitId: existing.visit_id, serviceId: existing.id };
  }

  let visit: Visit | null = null;

  if (intervention.preferVisitId) {
    try {
      visit = await getVisit(intervention.preferVisitId);
      if (visit.farm_id && visit.farm_id !== intervention.farm_id) {
        visit = null;
      }
    } catch {
      visit = null;
    }
  }

  const day = dayKey(intervention.intervention_date);

  if (!visit) {
    visit = await findOpenFarmVisit({
      farmId: intervention.farm_id,
      clientId: farm.clientId,
      day,
    });
  }

  if (!visit) {
    const seedAmount = resolveAmount(null);
    visit = await createVisit({
      client_id: farm.clientId,
      farm_id: intervention.farm_id,
      context: "farm",
      billing_mode: "forfait",
      head_count: headCount,
      visit_date: `${day}T12:00:00`,
      reason:
        intervention.description ||
        intervention.notes ||
        `${label}${farm.farmName ? ` · ${farm.farmName}` : ""}`,
      initial_service: {
        service_code: code,
        service_label: label,
        amount: seedAmount,
      },
    });
  }

  let service = pickLinkableFarmService(
    visit.services || [],
    code,
    intervention.preferServiceId
  );

  if (!service) {
    visit = await getVisit(visit.id);
    service = pickLinkableFarmService(
      visit.services || [],
      code,
      intervention.preferServiceId
    );
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
    status: "done",
    reference_type: "farm_intervention",
    reference_id: intervention.id,
    amount,
    service_label: service.service_label || label,
    details: {
      ...(typeof service.details === "object" && service.details
        ? service.details
        : {}),
      intervention_type: intervention.intervention_type || null,
      protocol_type: intervention.protocol_type || null,
      farm_id: intervention.farm_id,
    },
  });

  // Aligner l'effectif visite si vide
  if (headCount != null && !(visit.head_count > 0)) {
    await supabase
      .from("visits")
      .update({ head_count: headCount, updated_at: new Date().toISOString() })
      .eq("id", visit.id);
  }

  return { visitId: visit.id, serviceId: service.id };
}
