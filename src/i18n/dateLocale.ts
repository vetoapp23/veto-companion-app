import { fr, enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";
import type { AppLanguage } from "./index";

const map: Record<AppLanguage, Locale> = {
  fr,
  en: enUS,
  es,
};

export function getDateFnsLocale(lang?: string): Locale {
  const code = (lang?.split("-")[0] || "fr") as AppLanguage;
  return map[code] ?? fr;
}
