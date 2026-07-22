import { createAppointment } from "@/lib/database";
import { localDateTimeToISO } from "@/lib/dateLocal";
import type { ReminderDose } from "@/lib/reminderSchedule";

export type { ReminderDose } from "@/lib/reminderSchedule";
export { buildPlanFromSchedule, resolveMaintenanceDueDate } from "@/lib/reminderSchedule";

const DEFAULT_REMINDER_TIME = "09:00";

/**
 * Create real appointments for future reminder doses.
 * Skips the dose matching administeredDate (already done today).
 */
export async function createReminderAppointments(input: {
  clientId: string;
  animalId: string;
  administeredDate: string;
  plannedDoses: ReminderDose[];
  /** Fallback single next date if no multi-dose plan */
  nextDueDate?: string | null;
  appointmentType: "vaccination" | "follow-up";
  titlePrefix: string;
  productName: string;
}): Promise<{ created: number; appointmentIds: string[] }> {
  const future = input.plannedDoses
    .filter((d) => d.date > input.administeredDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const toCreate: ReminderDose[] =
    future.length > 0
      ? future
      : input.nextDueDate && input.nextDueDate > input.administeredDate
        ? [{ label: "Rappel", date: input.nextDueDate }]
        : [];

  const appointmentIds: string[] = [];

  for (const dose of toCreate) {
    const apt = await createAppointment({
      client_id: input.clientId,
      animal_id: input.animalId,
      appointment_date: localDateTimeToISO(dose.date, DEFAULT_REMINDER_TIME),
      appointment_type: input.appointmentType,
      duration_minutes: 20,
      notes: `${input.titlePrefix} — ${dose.label} · ${input.productName}`,
    });
    appointmentIds.push(apt.id);
  }

  return { created: appointmentIds.length, appointmentIds };
}
