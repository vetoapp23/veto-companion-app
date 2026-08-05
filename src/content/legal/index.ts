import type { AppLanguage } from "@/i18n";
import type { LegalBundle, LegalDoc, LegalDocId } from "./types";
import { legalFr } from "./fr";
import { legalEn } from "./en";
import { legalEs } from "./es";

const BUNDLES: Record<AppLanguage, LegalBundle> = {
  fr: legalFr,
  en: legalEn,
  es: legalEs,
};

export function getLegalDoc(lang: string, docId: LegalDocId): LegalDoc {
  const code = (lang?.split("-")[0] || "fr") as AppLanguage;
  const bundle = BUNDLES[code] || BUNDLES.fr;
  return bundle[docId];
}

export type { LegalDocId, LegalDoc };
export { LEGAL_ENTITY } from "./types";
