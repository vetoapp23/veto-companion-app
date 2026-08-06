import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import i18n from "@/i18n"
import { getBcp47Locale } from "@/i18n/useAppLocale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Escape untrusted text before interpolating into HTML (print/PDF templates). */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allow only safe URL schemes for print/PDF <img src> / href attributes. */
export function safePrintUrl(url: unknown): string {
  const s = String(url ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (
    lower.startsWith("https:") ||
    lower.startsWith("http:") ||
    lower.startsWith("data:image/") ||
    lower.startsWith("blob:") ||
    (lower.startsWith("/") && !lower.startsWith("//"))
  ) {
    return escapeHtml(s);
  }
  return "";
}

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate - Date de naissance au format YYYY-MM-DD
 * @returns L'âge en années et mois
 */
export function calculateAge(birthDate: string): string {
  const t = (key: string, opts?: Record<string, unknown>) =>
    i18n.t(key, { ns: "common", ...opts });

  if (!birthDate) return t("ageUnknown");
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return t("invalidDate");
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    if (months === 0) {
      const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return t("ageDays", { count: days });
    }
    return t("ageMonths", { count: months });
  } else if (months === 0) {
    return t("ageYears", { count: years });
  } else {
    return t("ageYearsAndMonths", { years, months });
  }
}

/**
 * Calcule l'âge en années seulement
 * @param birthDate - Date de naissance au format YYYY-MM-DD
 * @returns L'âge en années
 */
export function calculateAgeInYears(birthDate: string): number {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return 0;
  
  let years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  
  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}

/**
 * Formate une date pour l'affichage
 * @param dateString - Date au format YYYY-MM-DD
 * @returns Date formatée
 */
export function formatDate(dateString: string): string {
  if (!dateString) return i18n.t("notSpecified", { ns: "common" });
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return i18n.t("invalidDate", { ns: "common" });
  
  return date.toLocaleDateString(getBcp47Locale(i18n.language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/** Arrondit une température à 2 décimales (stockage / calculs). */
export function roundTemperature(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

/** Valeur affichable sans unité (ex. « 38.50 »). */
export function formatTemperatureValue(
  value: number | string | null | undefined
): string | null {
  const rounded = roundTemperature(value);
  return rounded === null ? null : rounded.toFixed(2);
}

/** Valeur affichable avec unité (ex. « 38.50°C »). */
export function formatTemperature(
  value: number | string | null | undefined,
  fallback = '—'
): string {
  const formatted = formatTemperatureValue(value);
  return formatted === null ? fallback : `${formatted}°C`;
}

/** Préremplissage des champs formulaire température. */
export function temperatureInputValue(
  value: number | string | null | undefined
): string {
  return formatTemperatureValue(value) ?? '';
}
