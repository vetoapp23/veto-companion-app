import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Heart, AlertTriangle, CheckCircle, ClipboardList } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useSettings } from "@/contexts/SettingsContext";
import { generateTimeSlots } from "@/utils/scheduleUtils";
import { parseLocalDateKey, toLocalDateKey } from "@/lib/dateLocal";
import type { ClinicCalendarEvent } from "@/lib/clinicCalendar";

export type CalendarEvent = ClinicCalendarEvent;

interface UnifiedCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
  showTimeSlots?: boolean;
  title?: string;
  icon?: React.ReactNode;
  occupiedSlots?: { date: string; time: string }[];
}

const getEventColor = (type: string, status: string) => {
  switch (type) {
    case "appointment":
      switch (status) {
        case "confirmed":
          return "bg-green-100 text-green-800 border-green-200";
        case "completed":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "cancelled":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-blue-100 text-blue-800 border-blue-200";
      }
    case "visit":
      switch (status) {
        case "completed":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "in_progress":
          return "bg-teal-100 text-teal-900 border-teal-200";
        default:
          return "bg-cyan-100 text-cyan-800 border-cyan-200";
      }
    case "vaccination":
      return status === "overdue"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "antiparasitic":
      return status === "overdue"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "appointment":
      return <Clock className="h-3 w-3" />;
    case "visit":
      return <ClipboardList className="h-3 w-3" />;
    case "vaccination":
      return <CheckCircle className="h-3 w-3" />;
    case "antiparasitic":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  events,
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  showTimeSlots = false,
  title = "Calendrier",
  icon = <Calendar className="h-5 w-5" />,
  occupiedSlots = [],
}) => {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateKey(new Date()));

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= monthEnd || days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      if (!event.date) return;
      if (!grouped[event.date]) grouped[event.date] = [];
      grouped[event.date].push(event);
    });
    return grouped;
  }, [events]);

  const busyForSelected = useMemo(
    () => occupiedSlots.filter((s) => s.date === selectedDate).map((s) => s.time),
    [occupiedSlots, selectedDate]
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate || !showTimeSlots) return [];
    const slots = generateTimeSlots(selectedDate, settings.scheduleSettings, []);
    return slots.map((slot: any) => ({
      ...slot,
      available: !!slot.isAvailable && !busyForSelected.includes(slot.time),
    }));
  }, [selectedDate, showTimeSlots, settings.scheduleSettings, busyForSelected]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = toLocalDateKey(date);
    setSelectedDate(dateStr);
    onDateClick?.(dateStr);
  };

  const selectedDateObj = selectedDate ? parseLocalDateKey(selectedDate) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {icon}
              {title}
            </CardTitle>
            <div className="flex items-center justify-between sm:gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                ←
              </Button>
              <span className="font-medium text-sm sm:text-base px-2 sm:min-w-[140px] text-center capitalize">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                →
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs text-muted-foreground pt-2">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> RDV
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-teal-500" /> Visite
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500" /> Vaccin
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Antiparasitaire
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dateStr = toLocalDateKey(day);
              const dayEvents = eventsByDate[dateStr] || [];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[72px] sm:min-h-[90px] p-1 rounded-md border text-left transition-colors ${
                    isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"
                  } ${isToday ? "ring-2 ring-primary/40" : ""} ${
                    isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-border"
                  }`}
                >
                  <div className="text-xs font-medium mb-1">{day.getDate()}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded border truncate ${getEventColor(
                          event.type,
                          event.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={event.title}
                      >
                        <span className="inline-flex items-center gap-0.5">
                          {getEventIcon(event.type)}
                          <span className="truncate">
                            {event.time ? `${event.time} ` : ""}
                            {event.title}
                          </span>
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base capitalize">
              {selectedDateObj
                ? format(selectedDateObj, "EEEE d MMMM yyyy", { locale: fr })
                : selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(eventsByDate[selectedDate] || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun événement ce jour.</p>
            ) : (
              (eventsByDate[selectedDate] || []).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className={`w-full text-left rounded-lg border p-3 ${getEventColor(event.type, event.status)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      {getEventIcon(event.type)}
                      {event.title}
                    </div>
                    {event.time && <Badge variant="outline">{event.time}</Badge>}
                  </div>
                  {(event.clientName || event.petName) && (
                    <div className="text-xs mt-1 opacity-80 flex gap-3">
                      {event.clientName && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.clientName}
                        </span>
                      )}
                      {event.petName && (
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {event.petName}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}

            {showTimeSlots && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-sm font-medium">Créneaux</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot: any) => (
                    <Button
                      key={slot.time}
                      size="sm"
                      variant={slot.available ? "outline" : "ghost"}
                      disabled={!slot.available}
                      onClick={() => onTimeSlotClick?.(selectedDate, slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedCalendar;
