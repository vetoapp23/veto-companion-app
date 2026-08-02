import { useTranslation } from "react-i18next";
import { getDateFnsLocale } from "./dateLocale";
import type { Locale } from "date-fns";

const BCP47: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
};

/** Hook: date-fns locale + Intl locale from current i18n language */
export function useAppLocale(): { lang: string; dateFns: Locale; bcp47: string } {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "fr";
  return {
    lang,
    dateFns: getDateFnsLocale(lang),
    bcp47: BCP47[lang] || "fr-FR",
  };
}

export function getBcp47Locale(lang?: string): string {
  const code = lang?.split("-")[0] || "fr";
  return BCP47[code] || "fr-FR";
}
