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

/**
 * Ensure the plan includes at least one future reminder after the first dose.
 * Uses protocol duration_days (ex. rappel annuel) when the booster schedule
 * only contains J0 / 1ère dose.
 */
export function ensureFutureReminders(
  baseDate: string,
  plan: ReminderDose[],
  durationDays?: number | null
): ReminderDose[] {
  const sorted = [...plan].sort((a, b) => a.date.localeCompare(b.date));
  const hasFuture = sorted.some((d) => d.date > baseDate);

  if (hasFuture) return sorted;

  const withToday =
    sorted.length > 0
      ? sorted
      : [{ label: "1ère dose", date: baseDate }];

  if (durationDays && durationDays > 0) {
    const rappelDate = format(
      addDays(parseLocalDay(baseDate), durationDays),
      "yyyy-MM-dd"
    );
    if (rappelDate > baseDate && !withToday.some((d) => d.date === rappelDate)) {
      return [
        ...withToday,
        {
          label: durationDays >= 300 ? "Rappel annuel" : `Rappel (+${durationDays} j)`,
          date: rappelDate,
        },
      ];
    }
  }

  // Default clinical gap if protocol has no duration: +28 days
  if (!withToday.some((d) => d.date > baseDate)) {
    return [
      ...withToday,
      {
        label: "Rappel 1",
        date: format(addDays(parseLocalDay(baseDate), 28), "yyyy-MM-dd"),
      },
    ];
  }

  return withToday;
}
