import { supabase } from "@/integrations/supabase/client";

export type RecurringFrequency = "monthly" | "annual" | "occasional";

export type RecurringTemplate = {
  id: string;
  type: "revenue" | "expense";
  frequency: RecurringFrequency;
  description: string;
  amount: number;
  source: string;
  day_of_month?: number | null;
  recurrence_month?: number | null;
  is_active?: boolean;
  /** Activé = pris en compte dans la compta (génération journal) */
  auto_generate?: boolean;
  start_date?: string | null;
  end_date?: string | null;
};

function clampDay(year: number, monthIndex0: number, day: number): number {
  const last = new Date(year, monthIndex0 + 1, 0).getDate();
  return Math.min(Math.max(1, day || 1), last);
}

function ymd(year: number, monthIndex0: number, day: number): string {
  const d = clampDay(year, monthIndex0, day);
  const mm = String(monthIndex0 + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function addMonthsYmd(isoDate: string, months: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Clamp day if month shorter
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return ymd(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Fenêtre de génération du modèle :
 * - start = start_date ou aujourd'hui
 * - end = end_date, sinon mensuel = start + 11 mois (12 mois inclus), annuel = même année (1 fois)
 */
export function resolveTemplateValidityWindow(tpl: RecurringTemplate): {
  start: string;
  end: string;
} | null {
  if (tpl.frequency !== "monthly" && tpl.frequency !== "annual") return null;

  const today = new Date();
  const start =
    (tpl.start_date && tpl.start_date.slice(0, 10)) ||
    ymd(today.getFullYear(), today.getMonth(), today.getDate());

  if (tpl.end_date) {
    const end = tpl.end_date.slice(0, 10);
    if (end < start) return null;
    return { start, end };
  }

  if (tpl.frequency === "monthly") {
    // 12 mois inclusifs : du mois de start jusqu'à +11 mois
    return { start, end: addMonthsYmd(start, 11) };
  }

  // Annuel sans fin : une seule occurrence sur l'année de début
  const startD = new Date(`${start}T00:00:00`);
  return {
    start,
    end: ymd(startD.getFullYear(), 11, 31),
  };
}

function intersectRanges(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): { start: string; end: string } | null {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (start > end) return null;
  return { start, end };
}

/** Clés de période couvertes par [startDate, endDate] selon la fréquence. */
export function periodsInRange(
  frequency: "monthly" | "annual",
  startDate: string,
  endDate: string
): Array<{ key: string; date: string; year: number; monthIndex0: number }> {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const out: Array<{ key: string; date: string; year: number; monthIndex0: number }> = [];

  if (frequency === "monthly") {
    let y = start.getFullYear();
    let m = start.getMonth();
    const endY = end.getFullYear();
    const endM = end.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      out.push({
        key: `${y}-${String(m + 1).padStart(2, "0")}`,
        date: ymd(y, m, 1),
        year: y,
        monthIndex0: m,
      });
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
  } else {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      out.push({
        key: String(y),
        date: ymd(y, 0, 1),
        year: y,
        monthIndex0: 0,
      });
    }
  }

  return out;
}

export function resolveRecurringEntryDate(
  frequency: "monthly" | "annual",
  period: { year: number; monthIndex0: number },
  dayOfMonth?: number | null,
  recurrenceMonth?: number | null
): string {
  const day = dayOfMonth && dayOfMonth >= 1 ? dayOfMonth : 1;
  if (frequency === "annual") {
    const monthIndex0 = Math.min(11, Math.max(0, (recurrenceMonth || 1) - 1));
    return ymd(period.year, monthIndex0, day);
  }
  return ymd(period.year, period.monthIndex0, day);
}

export function recurringReceiptKey(templateId: string, periodKey: string): string {
  return `REC-TPL-${templateId}-${periodKey}`;
}

export function recurringNotesMarker(templateId: string, periodKey: string): string {
  return `__recurring__:${templateId}:${periodKey}`;
}

/**
 * Crée les écritures manquantes (mensuel / annuel) pour la période affichée.
 * Respecte start_date / end_date du modèle (défaut 12 mois / 1 an).
 * Idempotent via receipt_number (charges) ou notes (recettes).
 */
export async function materializeRecurringTemplates(opts: {
  templates: RecurringTemplate[];
  startDate: string;
  endDate: string;
  userId: string;
  organizationId: string;
}): Promise<number> {
  const active = (opts.templates || []).filter(
    (t) =>
      t.auto_generate === true &&
      (t.frequency === "monthly" || t.frequency === "annual") &&
      Number(t.amount) > 0
  );
  if (!active.length || !opts.startDate || !opts.endDate) return 0;

  let created = 0;

  for (const tpl of active) {
    const freq = tpl.frequency as "monthly" | "annual";
    const validity = resolveTemplateValidityWindow(tpl);
    if (!validity) continue;

    const window = intersectRanges(
      validity.start,
      validity.end,
      opts.startDate,
      opts.endDate
    );
    if (!window) continue;

    const periods = periodsInRange(freq, window.start, window.end);

    for (const period of periods) {
      const entryDate = resolveRecurringEntryDate(
        freq,
        period,
        tpl.day_of_month,
        tpl.recurrence_month
      );
      // Doit être dans la fenêtre modèle ET la période affichée
      if (entryDate < window.start || entryDate > window.end) continue;
      if (entryDate < opts.startDate || entryDate > opts.endDate) continue;
      if (entryDate < validity.start || entryDate > validity.end) continue;

      const receipt = recurringReceiptKey(tpl.id, period.key);
      const notes = recurringNotesMarker(tpl.id, period.key);

      if (tpl.type === "expense") {
        const { data: existing } = await supabase
          .from("expenses")
          .select("id")
          .eq("organization_id", opts.organizationId)
          .eq("receipt_number", receipt)
          .maybeSingle();
        if (existing) continue;

        const { error } = await supabase.from("expenses").insert({
          user_id: opts.userId,
          organization_id: opts.organizationId,
          expense_date: entryDate,
          category: tpl.source || "other",
          description: tpl.description,
          amount: Number(tpl.amount),
          status: "approved",
          is_deductible: true,
          receipt_number: receipt,
          notes,
          frequency: freq,
        });
        if (!error) created += 1;
        else console.warn("Recurring expense insert failed", tpl.id, period.key, error);
      } else {
        const { data: existing } = await supabase
          .from("revenue")
          .select("id")
          .eq("organization_id", opts.organizationId)
          .eq("notes", notes)
          .maybeSingle();
        if (existing) continue;

        const { error } = await supabase.from("revenue").insert({
          user_id: opts.userId,
          organization_id: opts.organizationId,
          revenue_date: entryDate,
          source: tpl.source || "other",
          category: tpl.source || "other",
          description: tpl.description,
          amount: Number(tpl.amount),
          notes,
          frequency: freq,
        });
        if (!error) created += 1;
        else console.warn("Recurring revenue insert failed", tpl.id, period.key, error);
      }
    }
  }

  return created;
}

/** Date concrète pour une saisie manuelle récurrente (jour optionnel). */
export function buildDateFromDay(
  dayOfMonth: number | string | null | undefined,
  frequency: RecurringFrequency,
  recurrenceMonth?: number | null,
  base = new Date()
): string {
  const day = Number(dayOfMonth);
  const d = Number.isFinite(day) && day >= 1 ? day : base.getDate();
  if (frequency === "annual") {
    const monthIndex0 = Math.min(11, Math.max(0, (recurrenceMonth || base.getMonth() + 1) - 1));
    return ymd(base.getFullYear(), monthIndex0, d);
  }
  if (frequency === "monthly") {
    return ymd(base.getFullYear(), base.getMonth(), d);
  }
  return ymd(base.getFullYear(), base.getMonth(), base.getDate());
}
