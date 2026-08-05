import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SeoHead } from "@/components/SeoHead";
import { getLegalDoc, type LegalDocId } from "@/content/legal";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";

const DOC_PATH: Record<LegalDocId, string> = {
  privacy: "/privacy",
  terms: "/terms",
  legal: "/legal",
  cookies: "/cookies",
  refund: "/refund",
};

type Props = {
  docId: LegalDocId;
};

export function LegalPage({ docId }: Props) {
  const { t, i18n } = useTranslation("common");
  const doc = getLegalDoc(i18n.language, docId);
  const path = DOC_PATH[docId];

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead title={`${doc.title} — VetoCrm`} description={doc.metaDescription} path={path} />

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
            {t("home")}
          </Link>
        </div>
      </header>

      <main className="mk-legal flex-1">
        <article className="mk-legal-article">
          <p className="mk-legal-updated">
            {t("legalLastUpdated", { date: doc.lastUpdated })}
          </p>
          <h1>{doc.title}</h1>
          <p className="mk-legal-intro">{doc.intro}</p>

          <nav className="mk-legal-toc" aria-label={t("legalToc")}>
            <p className="mk-legal-toc-title">{t("legalToc")}</p>
            <ol>
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="mk-legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul>
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="mk-legal-disclaimer">{t("legalDisclaimer")}</p>
        </article>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
