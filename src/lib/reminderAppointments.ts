import type { ReminderDose } from "@/lib/reminderSchedule";
import { upsertReminderAppointments } from "@/lib/medicalDoseSync";

export type { ReminderDose } from "@/lib/reminderSchedule";
export {
  buildPlanFromSchedule,
  resolveMaintenanceDueDate,
  ensureFutureReminders,
} from "@/lib/reminderSchedule";

/**
 * Create real appointments for reminder doses (idempotent upsert).
 * By default skips the dose matching administeredDate (already done today).
 * With includeBaseDate, also creates a RDV for the base date (plan-only mode).
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
  /** If true, also create RDV for administeredDate (schedule without dose done). */
  includeBaseDate?: boolean;
}): Promise<{ created: number; appointmentIds: string[] }> {
  const result = await upsertReminderAppointments(input);
  return {
    created: result.created + result.reused,
    appointmentIds: result.appointmentIds,
  };
}
