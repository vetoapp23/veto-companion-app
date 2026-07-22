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
