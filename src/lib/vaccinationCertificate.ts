import { format, parseISO, isValid } from "date-fns";
import type { Locale } from "date-fns";
import type { Antiparasitic, Appointment, Vaccination } from "@/lib/database";
import i18n from "@/i18n";
import { getDateFnsLocale } from "@/i18n/dateLocale";

export type CertificateDoseStatus = "administered" | "planned";

export interface CertificateDoseRow {
  vaccineName: string;
  vaccineType?: string;
  doseLabel: string;
  /** yyyy-MM-dd */
  date: string;
  status: CertificateDoseStatus;
  batchNumber?: string;
  manufacturer?: string;
  administeredBy?: string;
  /** Extra free-text (without dose/schedule markers) */
  notes?: string;
  /** Source for debugging / dedupe */
  source?: "vaccination" | "appointment" | "schedule";
  vaccinationId?: string;
  appointmentId?: string;
}

const SCHEDULE_MARKER = "Calendrier:";

/** Format a day key for print (avoids UTC shift). */
export function formatCertDate(dateKey?: string | null, locale?: Locale): string {
  if (!dateKey) return "N/A";
  const day = dateKey.slice(0, 10);
  try {
    const d = parseISO(day);
    if (!isValid(d)) return day;
    return format(d, "dd/MM/yyyy", {
      locale: locale ?? getDateFnsLocale(i18n.language),
    });
  } catch {
    return day;
  }
}

/** Jour calendaire local yyyy-MM-dd (évite le décalage UTC sur les ISO). */
export function toDayKey(isoOrDay: string): string {
  // Prefer local date from ISO timestamps (appointment_date is often full ISO)
  if (isoOrDay.includes("T")) {
    const d = new Date(isoOrDay);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  return isoOrDay.slice(0, 10);
}

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function rowKey(vaccineName: string, date: string, doseLabel?: string): string {
  return `${normalizeKey(vaccineName)}|${date}|${normalizeKey(doseLabel || "")}`;
}

function productDateKey(vaccineName: string, date: string): string {
  return `${normalizeKey(vaccineName)}|${date}`;
}

/** Collapse accidental duplicated note text. */
function dedupeRepeatedText(text: string): string {
  const t = text.trim();
  if (t.length < 24) return t;
  const mid = Math.floor(t.length / 2);
  const a = t.slice(0, mid).trim();
  const b = t.slice(mid).trim();
  if (a && a === b) return a;
  // Also handle "foo foo" with a space join
  if (t.length % 2 === 1) {
    const mid2 = Math.floor(t.length / 2);
    const a2 = t.slice(0, mid2).trim();
    const b2 = t.slice(mid2 + 1).trim();
    if (a2 && a2 === b2) return a2;
  }
  return t;
}

/**
 * Parse dose label + free notes from vaccination.notes.
 * Saved as: `1ère dose — Calendrier: … — user notes` or `1ère dose — user notes`
 */
export function parseVaccinationNotes(notes?: string | null): {
  doseLabel: string;
  scheduleText?: string;
  freeNotes?: string;
} {
  if (!notes?.trim()) return { doseLabel: "Dose" };

  const parts = notes.split(/\s*[—–]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { doseLabel: "Dose" };

  const first = parts[0];
  const looksLikeDose =
    /dose|rappel|primo|booster|vaccin|traitement/i.test(first) ||
    /^\d/.test(first) ||
    /ère|eme|ème/i.test(first);

  const doseLabel = looksLikeDose ? first : "Dose";
  const rest = looksLikeDose ? parts.slice(1) : parts;

  let scheduleText: string | undefined;
  const free: string[] = [];
  for (const p of rest) {
    if (p.toLowerCase().startsWith(SCHEDULE_MARKER.toLowerCase())) {
      scheduleText = p.slice(SCHEDULE_MARKER.length).trim();
    } else {
      free.push(p);
    }
  }

  return {
    doseLabel,
    scheduleText,
    freeNotes: free.length ? free.join(" — ") : undefined,
  };
}

/** Build notes string that keeps dose label + planned calendar synced for the certificate. */
export function buildVaccinationNotes(input: {
  doseLabel: string;
  plannedReminders: { label: string; date: string }[];
  userNotes?: string;
}): string | undefined {
  const parts: string[] = [input.doseLabel.trim() || "1ère dose"];
  if (input.plannedReminders.length > 0) {
    const cal = input.plannedReminders
      .map((d) => `${d.label} (${formatCertDate(d.date)})`)
      .join("; ");
    parts.push(`${SCHEDULE_MARKER} ${cal}`);
  }
  if (input.userNotes?.trim()) parts.push(input.userNotes.trim());
  return parts.join(" — ") || undefined;
}

/** Alias for antiparasitic treatments (same note structure). */
export function buildAntiparasiticNotes(input: {
  doseLabel: string;
  plannedReminders: { label: string; date: string }[];
  userNotes?: string;
}): string | undefined {
  return buildVaccinationNotes({
    ...input,
    doseLabel: input.doseLabel.trim() || "1er traitement",
  });
}

export const parseAntiparasiticNotes = parseVaccinationNotes;

/**
 * Parse reminder appointment notes:
 * `Rappel vaccin — Rappel 1 · ProductName`
 * `Rappel antiparasitaire — Rappel 1 · ProductName`
 */
export function parseReminderAppointmentNotes(notes?: string | null): {
  doseLabel: string;
  productName: string;
  kind: "vaccination" | "antiparasitic";
} | null {
  if (!notes?.trim()) return null;
  const text = dedupeRepeatedText(notes);

  const kindMatch = text.match(/rappel\s+(vaccin|antiparasitaire)/i);
  if (!kindMatch) return null;
  const kind = /antiparasitaire/i.test(kindMatch[1])
    ? ("antiparasitic" as const)
    : ("vaccination" as const);

  const afterPrefix = text
    .replace(/^.*?rappel\s+(?:vaccin|antiparasitaire)\s*[—–-]\s*/i, "")
    .trim();
  if (!afterPrefix) {
    return {
      doseLabel: "Rappel",
      productName: kind === "antiparasitic" ? "Antiparasitaire" : "Vaccin",
      kind,
    };
  }

  const byDot = afterPrefix.split(/\s*[·•|]\s*/).map((s) => s.trim()).filter(Boolean);
  if (byDot.length >= 2) {
    return { doseLabel: byDot[0], productName: byDot.slice(1).join(" · "), kind };
  }

  const hy = afterPrefix.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (hy) {
    return { doseLabel: hy[1].trim(), productName: hy[2].trim(), kind };
  }

  return { doseLabel: afterPrefix, productName: afterPrefix, kind };
}

/** Resolve dose + product from visit reason / linked appointment notes. */
export function resolveVisitVaccinationReminder(input: {
  reason?: string | null;
  appointmentNotes?: string | null;
}): { doseLabel: string; productName: string } | null {
  const fromApt = parseReminderAppointmentNotes(input.appointmentNotes);
  if (fromApt?.kind === "vaccination") {
    return { doseLabel: fromApt.doseLabel, productName: fromApt.productName };
  }
  const fromReason = parseReminderAppointmentNotes(input.reason);
  if (fromReason?.kind === "vaccination") {
    return { doseLabel: fromReason.doseLabel, productName: fromReason.productName };
  }
  // Legacy: untyped "Rappel vaccin" already filtered by kind; also accept generic vaccin notes
  if (fromApt && /vaccin/i.test(input.appointmentNotes || "")) {
    return { doseLabel: fromApt.doseLabel, productName: fromApt.productName };
  }
  if (fromReason && /vaccin/i.test(input.reason || "")) {
    return { doseLabel: fromReason.doseLabel, productName: fromReason.productName };
  }
  return null;
}

export function resolveVisitAntiparasiticReminder(input: {
  reason?: string | null;
  appointmentNotes?: string | null;
}): { doseLabel: string; productName: string } | null {
  const fromApt = parseReminderAppointmentNotes(input.appointmentNotes);
  if (fromApt?.kind === "antiparasitic") {
    return { doseLabel: fromApt.doseLabel, productName: fromApt.productName };
  }
  const fromReason = parseReminderAppointmentNotes(input.reason);
  if (fromReason?.kind === "antiparasitic") {
    return { doseLabel: fromReason.doseLabel, productName: fromReason.productName };
  }
  return null;
}

function hasRowFor(
  rows: CertificateDoseRow[],
  vaccineName: string,
  date: string,
  _doseLabel?: string
): boolean {
  const pk = productDateKey(vaccineName, date);
  return rows.some((r) => productDateKey(r.vaccineName, r.date) === pk);
}

/**
 * One visible row per product + date: prefer administered, merge IDs.
 */
function mergeRowsByProductDate(rows: CertificateDoseRow[]): CertificateDoseRow[] {
  const map = new Map<string, CertificateDoseRow>();
  for (const r of rows) {
    const key = productDateKey(r.vaccineName, r.date);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...r });
      continue;
    }

    const preferNew =
      (r.status === "administered" && existing.status !== "administered") ||
      (r.status === existing.status &&
        r.source === "vaccination" &&
        existing.source !== "vaccination");

    const primary = preferNew ? r : existing;
    const secondary = preferNew ? existing : r;

    map.set(key, {
      ...primary,
      vaccinationId: primary.vaccinationId || secondary.vaccinationId,
      appointmentId: primary.appointmentId || secondary.appointmentId,
      // Always keep the preferred row's dose label (don't invent from the other)
      doseLabel: primary.doseLabel || secondary.doseLabel,
      vaccineType: primary.vaccineType || secondary.vaccineType,
      batchNumber: primary.batchNumber || secondary.batchNumber,
      manufacturer: primary.manufacturer || secondary.manufacturer,
      administeredBy: primary.administeredBy || secondary.administeredBy,
      notes: primary.notes || secondary.notes,
    });
  }
  return Array.from(map.values());
}

/**
 * Build certificate rows: vaccinations + RDV rappels (prévus ET terminés),
 * plus calendrier embarqué dans les notes.
 */
export function buildCertificateDoseRows(
  vaccinations: Vaccination[],
  appointments: Appointment[] = []
): CertificateDoseRow[] {
  const rows: CertificateDoseRow[] = [];

  for (const v of vaccinations) {
    const parsed = parseVaccinationNotes(v.notes);
    rows.push({
      vaccineName: v.vaccine_name,
      vaccineType: v.vaccine_type || undefined,
      doseLabel: parsed.doseLabel,
      date: toDayKey(v.vaccination_date),
      status: "administered",
      batchNumber: v.batch_number || undefined,
      manufacturer: v.manufacturer || undefined,
      administeredBy: v.administered_by || undefined,
      notes: parsed.freeNotes,
      source: "vaccination",
      vaccinationId: v.id,
    });
  }

  const reminderApts = appointments.filter((a) => {
    if (a.status === "cancelled" || a.status === "no-show") return false;
    const parsed = parseReminderAppointmentNotes(a.notes);
    return (
      !!parsed &&
      parsed.kind === "vaccination" &&
      (a.appointment_type === "vaccination" || a.appointment_type === "follow-up")
    );
  });

  for (const apt of reminderApts) {
    const parsed = parseReminderAppointmentNotes(apt.notes);
    if (!parsed) continue;

    const day = toDayKey(apt.appointment_date);
    const isDone = apt.status === "completed";

    // Skip if we already have this product+date from a vaccination record
    if (hasRowFor(rows, parsed.productName, day, parsed.doseLabel)) {
      // Attach appointment id only — keep the existing dose label as-is
      const idx = rows.findIndex(
        (r) =>
          productDateKey(r.vaccineName, r.date) ===
          productDateKey(parsed.productName, day)
      );
      if (idx >= 0) {
        rows[idx] = {
          ...rows[idx],
          appointmentId: rows[idx].appointmentId || apt.id,
        };
      }
      continue;
    }

    rows.push({
      vaccineName: parsed.productName,
      doseLabel: parsed.doseLabel,
      date: day,
      status: isDone ? "administered" : "planned",
      source: "appointment",
      appointmentId: apt.id,
    });
  }

  // Schedule embedded in vaccination notes (future / not yet covered by RDV)
  for (const v of vaccinations) {
    const parsed = parseVaccinationNotes(v.notes);
    if (!parsed.scheduleText) continue;
    const entries = parsed.scheduleText.split(";").map((s) => s.trim()).filter(Boolean);
    for (const entry of entries) {
      const m = entry.match(/^(.+?)\s*\((\d{2}\/\d{2}\/\d{4})\)$/);
      if (!m) continue;
      const label = m[1].trim();
      const [dd, mm, yyyy] = m[2].split("/");
      const day = `${yyyy}-${mm}-${dd}`;
      if (hasRowFor(rows, v.vaccine_name, day, label)) continue;
      rows.push({
        vaccineName: v.vaccine_name,
        vaccineType: v.vaccine_type || undefined,
        doseLabel: label,
        date: day,
        status: "planned",
        source: "schedule",
        vaccinationId: v.id,
      });
    }
  }

  return mergeRowsByProductDate(rows).sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    if (a.status !== b.status) return a.status === "administered" ? -1 : 1;
    return a.vaccineName.localeCompare(b.vaccineName);
  });
}

/** Jour calendaire local (yyyy-MM-dd). */
export function todayDayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Find an existing reminder RDV for the same animal + product + day. */
export function findMatchingReminderAppointment(
  appointments: Appointment[],
  opts: {
    animalId: string;
    productName: string;
    date: string;
    kind: "vaccination" | "antiparasitic";
  }
): Appointment | undefined {
  const day = opts.date.slice(0, 10);
  const pk = productDateKey(opts.productName, day);
  return appointments.find((a) => {
    if (a.animal_id !== opts.animalId) return false;
    if (a.status === "cancelled" || a.status === "no-show") return false;
    const parsed = parseReminderAppointmentNotes(a.notes);
    if (!parsed || parsed.kind !== opts.kind) return false;
    return productDateKey(parsed.productName, toDayKey(a.appointment_date)) === pk;
  });
}

/** Dose réalisée : date renseignée et non future. */
export function isRealizedDoseDate(dateKey?: string | null): boolean {
  if (!dateKey) return false;
  return dateKey.slice(0, 10) <= todayDayKey();
}

/** Doses vaccinales administrées uniquement (dossier médical, pas les rappels prévus). */
export function buildAdministeredDoseRows(
  vaccinations: Vaccination[],
  appointments: Appointment[] = []
): CertificateDoseRow[] {
  return buildCertificateDoseRows(vaccinations, appointments).filter(
    (r) => r.status === "administered" && isRealizedDoseDate(r.date)
  );
}

/**
 * Build antiparasitic certificate rows (treatments + follow-up RDV rappels).
 */
export function buildAntiparasiticCertificateRows(
  treatments: Antiparasitic[],
  appointments: Appointment[] = []
): CertificateDoseRow[] {
  const rows: CertificateDoseRow[] = [];

  for (const t of treatments) {
    const parsed = parseAntiparasiticNotes(t.notes);
    rows.push({
      vaccineName: t.product_name,
      vaccineType: t.parasite_type || undefined,
      doseLabel: parsed.doseLabel,
      date: toDayKey(t.treatment_date),
      status: "administered",
      batchNumber: undefined,
      manufacturer: t.active_ingredient || undefined,
      administeredBy: t.administered_by || undefined,
      notes: parsed.freeNotes,
      source: "vaccination",
      vaccinationId: t.id,
    });
  }

  const reminderApts = appointments.filter((a) => {
    if (a.status === "cancelled" || a.status === "no-show") return false;
    const parsed = parseReminderAppointmentNotes(a.notes);
    return (
      !!parsed &&
      parsed.kind === "antiparasitic" &&
      (a.appointment_type === "follow-up" || a.appointment_type === "vaccination")
    );
  });

  for (const apt of reminderApts) {
    const parsed = parseReminderAppointmentNotes(apt.notes);
    if (!parsed) continue;
    const day = toDayKey(apt.appointment_date);
    const isDone = apt.status === "completed";
    if (hasRowFor(rows, parsed.productName, day, parsed.doseLabel)) {
      const idx = rows.findIndex(
        (r) =>
          productDateKey(r.vaccineName, r.date) ===
          productDateKey(parsed.productName, day)
      );
      if (idx >= 0) {
        rows[idx] = {
          ...rows[idx],
          appointmentId: rows[idx].appointmentId || apt.id,
        };
      }
      continue;
    }
    rows.push({
      vaccineName: parsed.productName,
      doseLabel: parsed.doseLabel,
      date: day,
      status: isDone ? "administered" : "planned",
      source: "appointment",
      appointmentId: apt.id,
    });
  }

  for (const t of treatments) {
    const parsed = parseAntiparasiticNotes(t.notes);
    if (!parsed.scheduleText) continue;
    const entries = parsed.scheduleText.split(";").map((s) => s.trim()).filter(Boolean);
    for (const entry of entries) {
      const m = entry.match(/^(.+?)\s*\((\d{2}\/\d{2}\/\d{4})\)$/);
      if (!m) continue;
      const label = m[1].trim();
      const [dd, mm, yyyy] = m[2].split("/");
      const day = `${yyyy}-${mm}-${dd}`;
      if (hasRowFor(rows, t.product_name, day, label)) continue;
      rows.push({
        vaccineName: t.product_name,
        vaccineType: t.parasite_type || undefined,
        doseLabel: label,
        date: day,
        status: "planned",
        source: "schedule",
        vaccinationId: t.id,
      });
    }
  }

  return mergeRowsByProductDate(rows).sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    if (a.status !== b.status) return a.status === "administered" ? -1 : 1;
    return a.vaccineName.localeCompare(b.vaccineName);
  });
}

/** Traitements antiparasitaires réalisés uniquement. */
export function buildAdministeredAntiparasiticRows(
  treatments: Antiparasitic[],
  appointments: Appointment[] = []
): CertificateDoseRow[] {
  return buildAntiparasiticCertificateRows(treatments, appointments).filter(
    (r) => r.status === "administered" && isRealizedDoseDate(r.date)
  );
}
