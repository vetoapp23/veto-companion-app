import { toLocalDateKey, todayLocalKey } from "@/lib/dateLocal";

export type ClinicCalendarEventType = "appointment" | "visit" | "vaccination" | "antiparasitic";

export interface ClinicCalendarEvent {
  id: string;
  type: ClinicCalendarEventType;
  title: string;
  time?: string;
  status: string;
  clientName?: string;
  petName?: string;
  date: string;
  /** Optional deep-link target */
  href?: string;
  sourceId?: string;
}

function dueStatus(dueDate: string | null | undefined): string {
  if (!dueDate) return "scheduled";
  const due = toLocalDateKey(dueDate);
  const today = todayLocalKey();
  if (due < today) return "overdue";
  if (due === today) return "scheduled";
  return "scheduled";
}

export function buildClinicCalendarEvents(input: {
  appointments?: any[];
  visits?: any[];
  vaccinations?: any[];
  antiparasitics?: any[];
}): ClinicCalendarEvent[] {
  const events: ClinicCalendarEvent[] = [];

  for (const apt of input.appointments || []) {
    if (apt.status === "cancelled") continue;
    const clientName = apt.client
      ? `${apt.client.first_name} ${apt.client.last_name}`
      : "Client";
    const petName = apt.animal?.name || "Sans animal";
    const d = new Date(apt.appointment_date);
    events.push({
      id: `apt-${apt.id}`,
      sourceId: apt.id,
      type: "appointment",
      title: `RDV · ${clientName}`,
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      date: toLocalDateKey(apt.appointment_date),
      status: apt.status || "scheduled",
      clientName,
      petName,
      href: "/appointments",
    });
  }

  for (const visit of input.visits || []) {
    // Skip cancelled; walk-ins without RDV only (linked visits already shown as RDV)
    if (visit.status === "cancelled") continue;
    if (visit.appointment_id) continue;
    const clientName = visit.client
      ? `${visit.client.first_name} ${visit.client.last_name}`
      : "Client";
    const petName = visit.animal?.name || "Sans animal";
    const d = new Date(visit.visit_date);
    events.push({
      id: `visit-${visit.id}`,
      sourceId: visit.id,
      type: "visit",
      title: `Visite · ${clientName}`,
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      date: toLocalDateKey(visit.visit_date),
      status: visit.status || "in_progress",
      clientName,
      petName,
      href: `/visites/${visit.id}`,
    });
  }

  for (const v of input.vaccinations || []) {
    if (!v.next_due_date) continue;
    const petName = v.animal?.name || "Animal";
    events.push({
      id: `vacc-${v.id}`,
      sourceId: v.id,
      type: "vaccination",
      title: `Vaccin · ${v.vaccine_name || "Rappel"}`,
      date: toLocalDateKey(v.next_due_date),
      status: dueStatus(v.next_due_date),
      petName,
      href: "/vaccinations",
    });
  }

  for (const a of input.antiparasitics || []) {
    if (!a.next_treatment_date) continue;
    const petName = a.animal?.name || "Animal";
    events.push({
      id: `anti-${a.id}`,
      sourceId: a.id,
      type: "antiparasitic",
      title: `Antiparasitaire · ${a.product_name || "Rappel"}`,
      date: toLocalDateKey(a.next_treatment_date),
      status: dueStatus(a.next_treatment_date),
      petName,
      href: "/antiparasites",
    });
  }

  return events;
}
