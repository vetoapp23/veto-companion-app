import { ScheduleSettings } from '@/contexts/SettingsContext';
import { Appointment } from '@/contexts/ClientContext';
import { toLocalDateKey } from '@/lib/dateLocal';

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
 */
export function generateTimeSlots(
  date: string,
  scheduleSettings: ScheduleSettings,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { openingTime, closingTime, slotDuration, lunchBreakStart, lunchBreakEnd } = scheduleSettings;
  
  // Convertir les heures en minutes pour faciliter les calculs
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);
  const lunchStartMinutes = lunchBreakStart ? timeToMinutes(lunchBreakStart) : null;
  const lunchEndMinutes = lunchBreakEnd ? timeToMinutes(lunchBreakEnd) : null;
  
  // Générer les créneaux
  for (let minutes = openingMinutes; minutes < closingMinutes; minutes += slotDuration) {
    const time = minutesToTime(minutes);
    const isLunchBreak = lunchStartMinutes && lunchEndMinutes && 
                         minutes >= lunchStartMinutes && minutes < lunchEndMinutes;
    
    // Vérifier si le créneau est déjà pris
    const isBooked = existingAppointments.some(appointment => 
      appointment.date === date && appointment.time === time
    );
    
    slots.push({
      time,
      isAvailable: !isBooked && !isLunchBreak,
      isLunchBreak: !!isLunchBreak
    });
  }
  
  return slots;
}

/**
 * Génère les créneaux pour une plage de dates
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
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    
    // Vérifier si c'est un jour de travail
    if (scheduleSettings.workingDays.includes(dayName)) {
      const appointmentsForDate = existingAppointments.filter(app => app.date === dateStr);
      const slots = generateTimeSlots(dateStr, scheduleSettings, appointmentsForDate);
      
      days.push({
        date: dateStr,
        slots
      });
    }
  }
  
  return days;
}

/**
 * Vérifie si un créneau est disponible
 */
export function isSlotAvailable(
  date: string,
  time: string,
  scheduleSettings: ScheduleSettings,
  existingAppointments: Appointment[]
): boolean {
  const slots = generateTimeSlots(date, scheduleSettings, existingAppointments);
  const slot = slots.find(s => s.time === time);
  return slot ? slot.isAvailable : false;
}

/**
 * Convertit une heure (HH:MM) en minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convertit des minutes en heure (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Formate une date pour l'affichage
 */
export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formate une heure pour l'affichage
 */
export function formatTimeForDisplay(time: string): string {
  return time;
}

/**
 * Obtient le nom du jour en français
 */
export function getDayName(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
}

/**
 * Vérifie si une date est un jour de travail
 */
export function isWorkingDay(date: string, scheduleSettings: ScheduleSettings): boolean {
  const dayName = getDayName(date).toLowerCase();
  return scheduleSettings.workingDays.includes(dayName);
}
