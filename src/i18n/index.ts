import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import frCommon from "./locales/fr/common.json";
import frNav from "./locales/fr/nav.json";
import frAuth from "./locales/fr/auth.json";
import frMarketing from "./locales/fr/marketing.json";
import frApp from "./locales/fr/app.json";
import frMedical from "./locales/fr/medical.json";
import frSettings from "./locales/fr/settings.json";

import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enAuth from "./locales/en/auth.json";
import enMarketing from "./locales/en/marketing.json";
import enApp from "./locales/en/app.json";
import enMedical from "./locales/en/medical.json";
import enSettings from "./locales/en/settings.json";

import esCommon from "./locales/es/common.json";
import esNav from "./locales/es/nav.json";
import esAuth from "./locales/es/auth.json";
import esMarketing from "./locales/es/marketing.json";
import esApp from "./locales/es/app.json";
import esMedical from "./locales/es/medical.json";
import esSettings from "./locales/es/settings.json";

export const SUPPORTED_LANGS = ["fr", "en", "es"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGS)[number];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
};

export const LANGUAGE_STORAGE_KEY = "vetocrm-lang";

const resources = {
  fr: {
    common: frCommon,
    nav: frNav,
    auth: frAuth,
    marketing: frMarketing,
    app: frApp,
    medical: frMedical,
    settings: frSettings,
  },
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    marketing: enMarketing,
    app: enApp,
    medical: enMedical,
    settings: enSettings,
  },
  es: {
    common: esCommon,
    nav: esNav,
    auth: esAuth,
    marketing: esMarketing,
    app: esApp,
    medical: esMedical,
    settings: esSettings,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    supportedLngs: [...SUPPORTED_LANGS],
    defaultNS: "common",
    ns: ["common", "nav", "auth", "marketing", "app", "medical", "settings"],
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
  });

export function setAppLanguage(lang: AppLanguage) {
  void i18n.changeLanguage(lang);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language?.split("-")[0] || "fr";
}

export default i18n;
