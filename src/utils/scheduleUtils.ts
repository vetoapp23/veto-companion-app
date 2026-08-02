import { ScheduleSettings } from "@/contexts/SettingsContext";
import { Appointment } from "@/contexts/ClientContext";
import { toLocalDateKey } from "@/lib/dateLocal";
import { getWeekdayKey } from "@/lib/scheduleSettings";

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isLunchBreak: boolean;
}

export interface DaySlots {
  date: string;
  slots: TimeSlot[];
}

/**
 * Génère tous les créneaux horaires pour une date donnée
 * (respecte ouverture / fermeture / durée / pause déjeuner)
 */
export function generateTimeSlots(
  date: string,
  scheduleSettings: ScheduleSettings,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { openingTime, closingTime, slotDuration, lunchBreakStart, lunchBreakEnd } =
    scheduleSettings;

  const duration = Math.max(5, Number(slotDuration) || 30);
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);
  const lunchStartMinutes = lunchBreakStart ? timeToMinutes(lunchBreakStart) : null;
  const lunchEndMinutes = lunchBreakEnd ? timeToMinutes(lunchBreakEnd) : null;

  if (!(closingMinutes > openingMinutes)) return slots;

  for (let minutes = openingMinutes; minutes < closingMinutes; minutes += duration) {
    const time = minutesToTime(minutes);
    const isLunchBreak =
      lunchStartMinutes != null &&
      lunchEndMinutes != null &&
      minutes >= lunchStartMinutes &&
      minutes < lunchEndMinutes;

    const isBooked = existingAppointments.some(
      (appointment) => appointment.date === date && appointment.time === time
    );

    slots.push({
      time,
      isAvailable: !isBooked && !isLunchBreak,
      isLunchBreak: !!isLunchBreak,
    });
  }

  return slots;
}

/**
 * Génère les créneaux pour une plage de dates (jours ouvrés uniquement)
 */
export function generateDateRangeSlots(
  startDate: string,
  endDate: string,
  scheduleSettings: ScheduleSettings,
  existingAppointments: Appointment[]
): DaySlots[] {
  const days: DaySlots[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = toLocalDateKey(date);
    if (!isWorkingDay(dateStr, scheduleSettings)) continue;

    const appointmentsForDate = existingAppointments.filter((app) => app.date === dateStr);
    days.push({
      date: dateStr,
      slots: generateTimeSlots(dateStr, scheduleSettings, appointmentsForDate),
    });
  }

  return days;
}

export function isSlotAvailable(
  date: string,
  time: string,
  scheduleSettings: ScheduleSettings,
  existingAppointments: Appointment[]
): boolean {
  if (!isWorkingDay(date, scheduleSettings)) return false;
  const slots = generateTimeSlots(date, scheduleSettings, existingAppointments);
  const slot = slots.find((s) => s.time === time);
  return slot ? slot.isAvailable : false;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function formatDateForDisplay(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTimeForDisplay(time: string): string {
  return time;
}

export function getDayName(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" });
}

/** Jour ouvré selon workingDays (clés monday…sunday) */
export function isWorkingDay(date: string, scheduleSettings: ScheduleSettings): boolean {
  const key = getWeekdayKey(date);
  return (scheduleSettings.workingDays || []).includes(key);
}
