import type { TFunction } from "i18next";
import { PLATFORM_FEATURE_KEYS, type PlatformFeatureKey } from "@/lib/superAdmin";

export type AppLang = "fr" | "en" | "es";

export type PlanNotesI18n = {
  fr: string[];
  en: string[];
  es: string[];
};

export type PlanTaglinesI18n = {
  fr: string;
  en: string;
  es: string;
};

/** Stored in subscription_plans.features (legacy string[] or structured object). */
export type PlanFeaturesPayload =
  | string[]
  | {
      notes?: Partial<PlanNotesI18n> | string[];
      tagline?: Partial<PlanTaglinesI18n> | string;
      name?: Partial<Record<AppLang, string>> | string;
    };

export type PlanMarketingInput = {
  name?: string | null;
  tagline?: string | null;
  features?: PlanFeaturesPayload | null;
  limits?: Record<string, boolean> | null;
  max_users?: number | null;
  max_clients?: number | null;
  max_animals?: number | null;
  storage_mb?: number | null;
};

const CORE_ON: PlatformFeatureKey[] = [
  "consultations",
  "visits",
  "appointments",
  "vaccinations",
  "antiparasites",
  "clients",
  "animals",
];

export function normalizeLang(lang?: string | null): AppLang {
  const base = (lang || "fr").split("-")[0].toLowerCase();
  if (base === "en" || base === "es") return base;
  return "fr";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x).trim()).filter(Boolean);
}

export function emptyNotes(): PlanNotesI18n {
  return { fr: [], en: [], es: [] };
}

/** Parse DB `features` into per-language custom notes (+ optional i18n tagline/name). */
export function parsePlanFeatures(raw: unknown): {
  notes: PlanNotesI18n;
  tagline: PlanTaglinesI18n;
  name: Partial<Record<AppLang, string>>;
} {
  const notes = emptyNotes();
  const tagline: PlanTaglinesI18n = { fr: "", en: "", es: "" };
  const name: Partial<Record<AppLang, string>> = {};

  if (Array.isArray(raw)) {
    notes.fr = asStringArray(raw);
    return { notes, tagline, name };
  }

  if (!raw || typeof raw !== "object") {
    return { notes, tagline, name };
  }

  const obj = raw as Record<string, unknown>;

  // Shape A: { fr: [], en: [], es: [] } directly as notes
  if (Array.isArray(obj.fr) || Array.isArray(obj.en) || Array.isArray(obj.es)) {
    notes.fr = asStringArray(obj.fr);
    notes.en = asStringArray(obj.en);
    notes.es = asStringArray(obj.es);
  }

  if (obj.notes != null) {
    if (Array.isArray(obj.notes)) {
      notes.fr = asStringArray(obj.notes);
    } else if (typeof obj.notes === "object") {
      const n = obj.notes as Record<string, unknown>;
      notes.fr = asStringArray(n.fr);
      notes.en = asStringArray(n.en);
      notes.es = asStringArray(n.es);
    }
  }

  if (typeof obj.tagline === "string") {
    tagline.fr = obj.tagline;
  } else if (obj.tagline && typeof obj.tagline === "object") {
    const tg = obj.tagline as Record<string, unknown>;
    tagline.fr = String(tg.fr ?? "");
    tagline.en = String(tg.en ?? "");
    tagline.es = String(tg.es ?? "");
  }

  if (obj.name && typeof obj.name === "object" && !Array.isArray(obj.name)) {
    const nm = obj.name as Record<string, unknown>;
    for (const lang of ["fr", "en", "es"] as AppLang[]) {
      if (nm[lang]) name[lang] = String(nm[lang]);
    }
  }

  return { notes, tagline, name };
}

export function serializePlanFeatures(input: {
  notes: PlanNotesI18n;
  tagline?: Partial<PlanTaglinesI18n>;
  name?: Partial<Record<AppLang, string>>;
}): Record<string, unknown> {
  const out: Record<string, unknown> = {
    notes: {
      fr: asStringArray(input.notes.fr),
      en: asStringArray(input.notes.en),
      es: asStringArray(input.notes.es),
    },
  };
  const tg = input.tagline || {};
  if (tg.fr || tg.en || tg.es) {
    out.tagline = {
      fr: String(tg.fr || ""),
      en: String(tg.en || ""),
      es: String(tg.es || ""),
    };
  }
  if (input.name && (input.name.fr || input.name.en || input.name.es)) {
    out.name = {
      fr: String(input.name.fr || ""),
      en: String(input.name.en || ""),
      es: String(input.name.es || ""),
    };
  }
  return out;
}

export function resolveLimitFlags(limits?: Record<string, boolean> | null): Record<PlatformFeatureKey, boolean> {
  const flags = {} as Record<PlatformFeatureKey, boolean>;
  PLATFORM_FEATURE_KEYS.forEach((k) => {
    if (limits && Object.prototype.hasOwnProperty.call(limits, k)) flags[k] = !!limits[k];
    else flags[k] = CORE_ON.includes(k);
  });
  return flags;
}

function formatStorage(mb: number, t: TFunction): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    const label = Number.isInteger(gb) ? String(gb) : gb.toFixed(1);
    return `${label} ${t("planBullets.unitGb")}`;
  }
  return `${mb} ${t("planBullets.unitMb")}`;
}

/**
 * Auto-generate marketing bullets from quotas + module limits,
 * then append custom notes for the active language (fallback FR → EN → ES).
 */
export function buildPlanMarketingBullets(
  plan: PlanMarketingInput,
  lang: string | undefined,
  t: TFunction,
): string[] {
  const locale = normalizeLang(lang);
  const flags = resolveLimitFlags(plan.limits);
  const parsed = parsePlanFeatures(plan.features);
  const bullets: string[] = [];

  const users = plan.max_users ?? 1;
  bullets.push(t("planBullets.users", { count: users }));

  if (plan.max_clients == null) {
    bullets.push(t("planBullets.clientsUnlimited"));
  } else {
    bullets.push(t("planBullets.clientsMax", { count: plan.max_clients }));
  }

  if (plan.max_animals == null) {
    bullets.push(t("planBullets.animalsUnlimited"));
  } else {
    bullets.push(t("planBullets.animalsMax", { count: plan.max_animals }));
  }

  if (plan.storage_mb != null && plan.storage_mb > 0) {
    bullets.push(t("planBullets.storage", { size: formatStorage(plan.storage_mb, t) }));
  }

  // Quotas already cover clients/animals counts — list clinical & premium modules individually.
  const MODULES_FOR_MARKETING = PLATFORM_FEATURE_KEYS.filter(
    (k) => k !== "clients" && k !== "animals",
  );

  const enabledModules = MODULES_FOR_MARKETING.filter((k) => flags[k]);
  for (const key of enabledModules) {
    bullets.push(t(`planBullets.modules.${key}`));
  }

  const notesForLang =
    parsed.notes[locale]?.length
      ? parsed.notes[locale]
      : parsed.notes.fr?.length
        ? parsed.notes.fr
        : parsed.notes.en?.length
          ? parsed.notes.en
          : parsed.notes.es || [];

  for (const note of notesForLang) {
    if (!bullets.includes(note)) bullets.push(note);
  }

  return bullets;
}

export function resolvePlanDisplayName(plan: PlanMarketingInput, lang?: string): string {
  const locale = normalizeLang(lang);
  const parsed = parsePlanFeatures(plan.features);
  return parsed.name[locale] || parsed.name.fr || plan.name || "";
}

export function resolvePlanTagline(plan: PlanMarketingInput, lang?: string): string {
  const locale = normalizeLang(lang);
  const parsed = parsePlanFeatures(plan.features);
  return (
    parsed.tagline[locale] ||
    parsed.tagline.fr ||
    parsed.tagline.en ||
    parsed.tagline.es ||
    plan.tagline ||
    ""
  );
}

/** Short auto description for SEO / cards. */
export function buildPlanAutoDescription(
  plan: PlanMarketingInput,
  lang: string | undefined,
  t: TFunction,
): string {
  const bullets = buildPlanMarketingBullets(plan, lang, t).slice(0, 4);
  return bullets.join(" · ");
}
