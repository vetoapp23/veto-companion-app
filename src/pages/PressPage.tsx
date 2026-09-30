import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import { PRESS_KIT } from "@/content/pressKit";
import { resolveBlogLang } from "@/content/blog/articles";

export default function PressPage() {
  const { t, i18n } = useTranslation(["marketing", "common"]);
  const lang = resolveBlogLang(i18n.language);
  const oneLiner = PRESS_KIT.oneLiner[lang];
  const short = PRESS_KIT.short[lang];
  const long = PRESS_KIT.long[lang];

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead
        title={t("marketing:press.seoTitle")}
        description={t("marketing:press.seoDescription")}
        keywords={t("marketing:press.seoKeywords")}
        path="/press"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("marketing:press.seoTitle"),
          description: t("marketing:press.seoDescription"),
          url: siteUrl("/press"),
          about: {
            "@type": "SoftwareApplication",
            name: PRESS_KIT.brand,
            url: PRESS_KIT.website,
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Veterinary Practice Management Software",
          },
        }}
      />

      <header className="mk-nav" style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--mk-fog)" }}>
        <Link to="/" className="mk-brand">
          Veto<span>Crm</span>
        </Link>
        <div className="mk-nav-links">
          <LanguageSwitcher variant="marketing" />
          <Link
            to="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[color:var(--mk-line)] bg-[color:var(--mk-surface)] px-2.5 text-sm font-semibold text-[color:var(--mk-ink)] hover:bg-[color:var(--mk-fog)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("marketing:nav.home")}
          </Link>
        </div>
      </header>

      <main className="mk-blog flex-1">
        <div className="mk-blog-inner" style={{ maxWidth: "48rem" }}>
          <p className="mk-blog-eyebrow">{t("marketing:press.eyebrow")}</p>
          <h1>{t("marketing:press.title")}</h1>
          <p className="mk-blog-lead">{t("marketing:press.lead")}</p>

          <section className="mk-press-block">
            <h2>{t("marketing:press.brandTitle")}</h2>
            <p>
              <strong>{PRESS_KIT.brand}</strong> — {t("marketing:press.brandSpell")}
            </p>
            <ul className="mk-press-list">
              <li>
                Web:{" "}
                <a href={PRESS_KIT.website} target="_blank" rel="noopener noreferrer">
                  {PRESS_KIT.website}
                </a>
              </li>
              <li>
                Email:{" "}
                <a href={`mailto:${PRESS_KIT.email}`}>{PRESS_KIT.email}</a>
              </li>
              <li>
                LinkedIn:{" "}
                <a href={PRESS_KIT.linkedin} target="_blank" rel="noopener noreferrer">
                  {PRESS_KIT.linkedin}
                </a>
              </li>
              <li>
                Instagram:{" "}
                <a href={PRESS_KIT.instagram} target="_blank" rel="noopener noreferrer">
                  {PRESS_KIT.instagram}
                </a>
              </li>
            </ul>
          </section>

          <section className="mk-press-block">
            <h2>{t("marketing:press.blurbsTitle")}</h2>
            <h3>{t("marketing:press.oneLiner")}</h3>
            <p className="mk-press-copy">{oneLiner}</p>
            <h3>{t("marketing:press.shortBlurb")}</h3>
            <p className="mk-press-copy">{short}</p>
            <h3>{t("marketing:press.longBlurb")}</h3>
            <p className="mk-press-copy">{long}</p>
            <h3>{t("marketing:press.categories")}</h3>
            <p className="mk-press-copy">{PRESS_KIT.categories.join(" · ")}</p>
          </section>

          <section className="mk-press-block">
            <h2>{t("marketing:press.directoriesTitle")}</h2>
            <p>{t("marketing:press.directoriesLead")}</p>
            <ul className="mk-press-dirs">
              {PRESS_KIT.directories.map((d) => (
                <li key={d.name}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="mk-link">
                    {d.name}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  <span>{d.note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mk-press-block">
            <h2>{t("marketing:press.screensTitle")}</h2>
            <p>{t("marketing:press.screensLead")}</p>
            <div className="mk-press-shots">
              {PRESS_KIT.screenshots.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                  <img src={src} alt={`VetoCrm ${src.split("/").pop()}`} width={480} height={300} loading="lazy" />
                </a>
              ))}
            </div>
          </section>

          <aside className="mk-article-cta">
            <h2>{t("marketing:press.ctaTitle")}</h2>
            <p>{t("marketing:press.ctaBody")}</p>
            <div className="mk-article-cta-actions">
              <Link to="/register" className="mk-btn mk-btn-primary">
                {t("marketing:landing.ctaCreateAccount")}
              </Link>
              <Link to="/monde-veto/classement-meilleurs-crm-erp-veterinaire-2026" className="mk-btn mk-btn-outline-dark">
                {t("marketing:press.ctaRanking")}
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
