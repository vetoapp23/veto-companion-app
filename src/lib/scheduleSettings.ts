import type { ScheduleSettings as DbScheduleSettings } from "@/lib/database";
import type { ScheduleSettings as UiScheduleSettings } from "@/contexts/SettingsContext";
import { parseLocalDateKey } from "@/lib/dateLocal";

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

/** Clé anglaise du jour (monday…sunday) — alignée sur working_days en DB */
export function getWeekdayKey(date: string | Date): WeekdayKey {
  const d = typeof date === "string" ? parseLocalDateKey(date) : date;
  return WEEKDAY_KEYS[d.getDay()];
}

export const DEFAULT_DB_SCHEDULE: DbScheduleSettings = {
  opening_time: "08:00",
  closing_time: "18:00",
  slot_duration: 30,
  lunch_break_start: "12:00",
  lunch_break_end: "14:00",
  working_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  appointment_duration: 30,
  buffer_time: 10,
  max_appointments_per_day: 20,
};

/** Convertit les horaires stockés (snake_case) vers le format utilisé par scheduleUtils */
export function dbScheduleToUi(
  db?: Partial<DbScheduleSettings> | null
): UiScheduleSettings {
  const src = { ...DEFAULT_DB_SCHEDULE, ...(db || {}) };
  const duration = Number(src.slot_duration) || Number(src.appointment_duration) || 30;
  return {
    openingTime: src.opening_time || "08:00",
    closingTime: src.closing_time || "18:00",
    slotDuration: duration > 0 ? duration : 30,
    lunchBreakStart: src.lunch_break_start || undefined,
    lunchBreakEnd: src.lunch_break_end || undefined,
    workingDays: Array.isArray(src.working_days) && src.working_days.length > 0
      ? src.working_days
      : DEFAULT_DB_SCHEDULE.working_days,
  };
}
