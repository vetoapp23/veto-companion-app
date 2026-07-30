import {
  createConsultation,
  updateConsultation,
  type Consultation,
  type CreateConsultationData,
} from "@/lib/database";
import { getServiceDef } from "@/lib/visitCatalog";
import type { Visit, VisitService } from "@/lib/visits";

/** Examens cliniques (imagerie / labo) → dossier via table consultations. */
export function shouldSyncServiceToMedicalRecord(serviceCode: string): boolean {
  const panel = getServiceDef(serviceCode)?.panel;
  return panel === "imaging" || panel === "lab";
}

function str(details: Record<string, unknown>, key: string): string {
  const v = details[key];
  return v == null ? "" : String(v).trim();
}

/**
 * Map visit imaging/lab fields onto a consultation row for the medical record.
 * Surgery / clinical already use the consultation modal; grooming stays visit-only.
 */
export function buildConsultationPayloadFromVisitService(
  service: VisitService,
  visit: Pick<Visit, "id" | "client_id" | "animal_id" | "visit_date">
): CreateConsultationData | null {
  if (!visit.animal_id) return null;
  if (!shouldSyncServiceToMedicalRecord(service.service_code)) return null;

  const def = getServiceDef(service.service_code);
  const panel = def?.panel;
  const details = service.details || {};
  const label = def?.label || service.service_label;
  const photos =
    service.attachments?.length > 0 ? service.attachments : undefined;

  if (panel === "imaging") {
    const region = str(details, "region");
    const technique = str(details, "technique");
    const findings = str(details, "findings") || (service.notes || "").trim();
    const symptoms = [region && `Région : ${region}`, technique && `Technique : ${technique}`]
      .filter(Boolean)
      .join(" · ");

    return {
      animal_id: visit.animal_id,
      client_id: visit.client_id,
      visit_id: visit.id,
      consultation_date: visit.visit_date || new Date().toISOString(),
      consultation_type: label,
      symptoms: symptoms || undefined,
      diagnosis: findings || undefined,
      notes: `Visite · ${label}`,
      photos,
      status: "completed",
      cost: service.amount ?? undefined,
    };
  }

  if (panel === "lab") {
    const tests = str(details, "tests");
    const results = str(details, "results") || (service.notes || "").trim();
    const labRef = str(details, "lab_ref");

    return {
      animal_id: visit.animal_id,
      client_id: visit.client_id,
      visit_id: visit.id,
      consultation_date: visit.visit_date || new Date().toISOString(),
      consultation_type: label,
      symptoms: tests ? `Analyses : ${tests}` : undefined,
      diagnosis: results || undefined,
      notes: [labRef && `Réf. labo : ${labRef}`, `Visite · ${label}`]
        .filter(Boolean)
        .join("\n"),
      photos,
      status: "completed",
      cost: service.amount ?? undefined,
    };
  }

  return null;
}

/**
 * Create or update the consultation linked to an imaging/lab visit service.
 */
export async function syncVisitExamToMedicalRecord(input: {
  service: VisitService;
  visit: Pick<Visit, "id" | "client_id" | "animal_id" | "visit_date">;
  /** Latest notes/details/attachments (may not be flushed on service yet) */
  notes?: string | null;
  details?: Record<string, unknown>;
  attachments?: string[];
}): Promise<Consultation | null> {
  const service: VisitService = {
    ...input.service,
    notes: input.notes ?? input.service.notes,
    details: input.details ?? input.service.details ?? {},
    attachments: input.attachments ?? input.service.attachments ?? [],
  };

  const payload = buildConsultationPayloadFromVisitService(service, input.visit);
  if (!payload) return null;

  // Skip empty shell (no clinical content)
  const hasContent =
    !!(payload.symptoms || payload.diagnosis || payload.notes || payload.photos?.length);
  if (!hasContent) return null;

  if (
    service.reference_type === "consultation" &&
    service.reference_id
  ) {
    return updateConsultation(service.reference_id, payload);
  }

  return createConsultation(payload);
}
