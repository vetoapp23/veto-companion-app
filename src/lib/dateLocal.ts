/** Local-timezone date helpers — avoid UTC off-by-one from toISOString().split('T')[0] */

export function toLocalDateKey(input: Date | string | null | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) {
    // Already a plain YYYY-MM-DD?
    if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}/.test(input)) {
      return input.slice(0, 10);
    }
    return "";
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toLocalTimeKey(input: Date | string | null | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function todayLocalKey(): string {
  return toLocalDateKey(new Date());
}

/** Parse YYYY-MM-DD as local midnight (not UTC). */
export function parseLocalDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Combine local date + time into an ISO timestamptz for storage. */
export function localDateTimeToISO(dateKey: string, timeKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = (timeKey || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0).toISOString();
}

export function formatLocalDate(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("fr-FR");
}

export function formatLocalTime(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Filtres de période pour listes (visites, RDV, consultations…) ─────────

export type ListDatePeriod =
  | "all"
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "range";

export interface ListDateFilterState {
  period: ListDatePeriod;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_LIST_DATE_FILTER: ListDateFilterState = {
  period: "all",
  dateFrom: "",
  dateTo: "",
};

export const LIST_DATE_PERIOD_OPTIONS: { value: ListDatePeriod; label: string }[] = [
  { value: "all", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
  { value: "range", label: "Plage personnalisée" },
];

/** Plage par défaut (30 derniers jours) pour le mode « range ». */
export function defaultRangeForPeriod(): { dateFrom: string; dateTo: string } {
  const to = todayLocalKey();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { dateFrom: toLocalDateKey(from), dateTo: to };
}

/** Bornes inclusives pour une période prédéfinie (sans « all » / « range »). */
export function getBoundsForPeriod(
  period: "today" | "week" | "month" | "quarter" | "year"
): { from: string; to: string } {
  const now = new Date();
  const today = todayLocalKey();

  if (period === "today") return { from: today, to: today };

  if (period === "week") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toLocalDateKey(monday), to: toLocalDateKey(sunday) };
  }

  if (period === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toLocalDateKey(from), to: toLocalDateKey(to) };
  }

  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1);
    const to = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { from: toLocalDateKey(from), to: toLocalDateKey(to) };
  }

  // year
  return {
    from: `${now.getFullYear()}-01-01`,
    to: `${now.getFullYear()}-12-31`,
  };
}

/** Bornes inclusives YYYY-MM-DD, ou null si aucune restriction. */
export function resolveListDateBounds(
  filter: ListDateFilterState
): { from: string; to: string } | null {
  if (!filter || filter.period === "all") return null;

  if (filter.period === "range") {
    const from = filter.dateFrom || "0000-01-01";
    const to = filter.dateTo || "9999-12-31";
    if (from > to) return { from: to, to: from };
    return { from, to };
  }

  if (
    filter.period === "today" ||
    filter.period === "week" ||
    filter.period === "month" ||
    filter.period === "quarter" ||
    filter.period === "year"
  ) {
    return getBoundsForPeriod(filter.period);
  }

  return null;
}

/** true si la date tombe dans le filtre (période ou plage). */
export function matchesListDateFilter(
  dateInput: Date | string | null | undefined,
  filter: ListDateFilterState
): boolean {
  const bounds = resolveListDateBounds(filter);
  if (!bounds) return true;
  const key = toLocalDateKey(dateInput);
  if (!key) return false;
  return key >= bounds.from && key <= bounds.to;
}

