import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type AppLanguage } from "@/i18n";

const SITE_URL = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || "https://vetocrm.com").replace(/\/$/, "");
const DEFAULT_OG = `${SITE_URL}/og-cover.jpg`;

const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
};

export type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function clearMetaProperty(property: string) {
  document.head.querySelectorAll(`meta[property="${property}"]`).forEach((el) => el.remove());
}

function localizedPageUrl(path: string, lang: AppLanguage) {
  const url = new URL(`${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("lng", lang);
  return url.href;
}

function upsertHreflang(hreflang: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "alternate";
    el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Updates document head for SPA routes (Googlebot exécute le JS). */
export function useSeo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG,
  keywords,
  noIndex = false,
  type = "website",
  jsonLd,
}: SeoProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    const url = localizedPageUrl(path, (i18n.language || "fr").split("-")[0] as AppLanguage);
    const lang = (i18n.language || "fr").split("-")[0] as AppLanguage;
    document.title = title;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", description);
    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:locale", OG_LOCALE[lang] || "fr_FR");
    upsertMeta("property", "og:site_name", "VetoCrm");
    clearMetaProperty("og:locale:alternate");
    SUPPORTED_LANGS.filter((lng) => lng !== lang).forEach((lng) => {
      upsertMeta("property", "og:locale:alternate", OG_LOCALE[lng]);
    });
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertLink("canonical", url);

    SUPPORTED_LANGS.forEach((lng) => {
      upsertHreflang(lng, localizedPageUrl(path, lng));
    });
    upsertHreflang("x-default", localizedPageUrl(path, "fr"));

    if (jsonLd) {
      upsertJsonLd("vetocrm-jsonld", Array.isArray(jsonLd) ? jsonLd : jsonLd);
    }
  }, [title, description, path, image, keywords, noIndex, type, jsonLd, i18n.language]);
}

export function siteUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export const SEO_DEFAULTS = {
  siteName: "VetoCrm",
  siteUrl: SITE_URL,
  ogImage: DEFAULT_OG,
} as const;

export function SeoHead(props: SeoProps) {
  useSeo(props);
  return null;
}
