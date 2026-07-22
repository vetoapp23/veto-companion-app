import { addDays, format } from "date-fns";
import type { BoosterScheduleEntry } from "@/lib/database";

export interface ReminderDose {
  label: string;
  date: string; // yyyy-MM-dd
}

function parseLocalDay(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/** Build planned doses from a protocol schedule relative to a base date (J0). */
export function buildPlanFromSchedule(
  baseDate: string,
  schedule: BoosterScheduleEntry[]
): ReminderDose[] {
  const sorted = [...schedule].sort((a, b) => a.offset_days - b.offset_days);
  return sorted.map((entry) => ({
    label: entry.label,
    date: format(addDays(parseLocalDay(baseDate), entry.offset_days), "yyyy-MM-dd"),
  }));
}

/** Next due: first future planned dose, else protocol duration_days from administered date. */
export function resolveMaintenanceDueDate(
  administeredDate: string,
  plannedDoses: ReminderDose[],
  durationDays?: number | null
): string | undefined {
  const future = plannedDoses
    .filter((d) => d.date > administeredDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (future[0]) return future[0].date;

  if (durationDays && durationDays > 0) {
    return format(addDays(parseLocalDay(administeredDate), durationDays), "yyyy-MM-dd");
  }
  return undefined;
}
