import {
  createAppointment,
  getAppointmentsByAnimal,
  updateAppointment,
  type Appointment,
} from "@/lib/database";
import { localDateTimeToISO } from "@/lib/dateLocal";
import type { ReminderDose } from "@/lib/reminderSchedule";
import {
  findMatchingReminderAppointment,
  parseReminderAppointmentNotes,
  toDayKey,
} from "@/lib/vaccinationCertificate";

const DEFAULT_REMINDER_TIME = "09:00";

function normalizeProduct(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

/**
 * After a dose is administered: complete matching reminder RDVs,
 * cancel other open duplicates for the same animal + product + day.
 */
export async function syncRemindersAfterAdministered(input: {
  appointments: Appointment[];
  animalId: string;
  productName: string;
  date: string;
  kind: "vaccination" | "antiparasitic";
  /** Prefer completing this RDV first (e.g. visit.appointment_id) */
  primaryAppointmentId?: string | null;
  /** Optional mutator (React Query); falls back to direct DB update */
  updateFn?: (id: string, data: { status: "completed" | "cancelled" }) => Promise<unknown>;
}): Promise<{ completed: string[]; cancelled: string[] }> {
  const day = toDayKey(input.date);
  const update =
    input.updateFn ||
    ((id: string, data: { status: "completed" | "cancelled" }) =>
      updateAppointment(id, data));

  const completed = new Set<string>();
  const cancelled = new Set<string>();

  if (input.primaryAppointmentId) {
    completed.add(input.primaryAppointmentId);
  }

  const match = findMatchingReminderAppointment(input.appointments, {
    animalId: input.animalId,
    productName: input.productName,
    date: day,
    kind: input.kind,
  });
  if (match) completed.add(match.id);

  for (const id of completed) {
    await update(id, { status: "completed" });
  }

  for (const a of input.appointments) {
    if (completed.has(a.id) || cancelled.has(a.id)) continue;
    if (a.animal_id !== input.animalId) continue;
    if (a.status === "cancelled" || a.status === "completed" || a.status === "no-show") {
      continue;
    }
    const parsed = parseReminderAppointmentNotes(a.notes);
    if (!parsed || parsed.kind !== input.kind) continue;
    if (toDayKey(a.appointment_date) !== day) continue;
    if (normalizeProduct(parsed.productName) !== normalizeProduct(input.productName)) {
      continue;
    }
    await update(a.id, { status: "cancelled" });
    cancelled.add(a.id);
  }

  return { completed: [...completed], cancelled: [...cancelled] };
}

/**
 * Create or reuse reminder RDVs (idempotent by animal + product + day + kind).
 */
export async function upsertReminderAppointments(input: {
  clientId: string;
  animalId: string;
  administeredDate: string;
  plannedDoses: ReminderDose[];
  nextDueDate?: string | null;
  appointmentType: "vaccination" | "follow-up";
  titlePrefix: string;
  productName: string;
  includeBaseDate?: boolean;
  /** Prefetched appointments; loaded from DB if omitted */
  existingAppointments?: Appointment[];
}): Promise<{ created: number; reused: number; appointmentIds: string[] }> {
  const kind =
    input.appointmentType === "vaccination" ? "vaccination" : "antiparasitic";

  const future = input.plannedDoses
    .filter((d) =>
      input.includeBaseDate
        ? d.date >= input.administeredDate
        : d.date > input.administeredDate
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const toUpsert: ReminderDose[] =
    future.length > 0
      ? future
      : input.nextDueDate && input.nextDueDate > input.administeredDate
        ? [{ label: "Rappel", date: input.nextDueDate }]
        : [];

  const existing =
    input.existingAppointments ??
    (await getAppointmentsByAnimal(input.animalId));

  const appointmentIds: string[] = [];
  let created = 0;
  let reused = 0;

  for (const dose of toUpsert) {
    const day = dose.date.slice(0, 10);
    const notes = `${input.titlePrefix} — ${dose.label} · ${input.productName}`;
    const match = findMatchingReminderAppointment(existing, {
      animalId: input.animalId,
      productName: input.productName,
      date: day,
      kind,
    });

    if (match) {
      // Already administered → keep completed, do not recreate
      if (match.status === "completed") {
        appointmentIds.push(match.id);
        reused += 1;
        continue;
      }

      const patch: {
        appointment_date?: string;
        status?: "scheduled";
        notes?: string;
        appointment_type?: "vaccination" | "follow-up";
      } = {
        appointment_date: localDateTimeToISO(day, DEFAULT_REMINDER_TIME),
        appointment_type: input.appointmentType,
      };

      if (match.status === "cancelled" || match.status === "no-show") {
        patch.status = "scheduled";
        patch.notes = notes;
      }
      // scheduled / confirmed / in-progress: keep existing dose label in notes

      await updateAppointment(match.id, patch);
      appointmentIds.push(match.id);
      reused += 1;
      continue;
    }

    const apt = await createAppointment({
      client_id: input.clientId,
      animal_id: input.animalId,
      appointment_date: localDateTimeToISO(day, DEFAULT_REMINDER_TIME),
      appointment_type: input.appointmentType,
      duration_minutes: 20,
      notes,
    });
    appointmentIds.push(apt.id);
    existing.push(apt);
    created += 1;
  }

  return { created, reused, appointmentIds };
}
