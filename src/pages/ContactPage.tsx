import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SeoHead } from "@/components/SeoHead";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import { LEGAL_ENTITY } from "@/content/legal";

export default function ContactPage() {
  const { t } = useTranslation(["marketing", "common"]);

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead
        title={t("marketing:contact.seoTitle")}
        description={t("marketing:contact.seoDescription")}
        keywords={t("marketing:contact.seoKeywords")}
        path="/contact"
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
            {t("common:home")}
          </Link>
        </div>
      </header>

      <main className="mk-contact flex-1">
        <div className="mk-contact-inner">
          <p className="mk-contact-eyebrow">{t("marketing:contact.eyebrow")}</p>
          <h1>{t("marketing:contact.title")}</h1>
          <p className="mk-contact-lead">{t("marketing:contact.lead")}</p>

          <div className="mk-contact-grid">
            <a href={`mailto:${LEGAL_ENTITY.publicEmail}`} className="mk-contact-card">
              <span className="mk-contact-icon" aria-hidden>
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2>{t("marketing:contact.emailTitle")}</h2>
                <p>{t("marketing:contact.emailBody")}</p>
                <span className="mk-contact-value">{LEGAL_ENTITY.publicEmail}</span>
              </div>
            </a>

            <a
              href={LEGAL_ENTITY.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-contact-card"
            >
              <span className="mk-contact-icon" aria-hidden>
                <Linkedin className="h-5 w-5" />
              </span>
              <div>
                <h2>LinkedIn</h2>
                <p>{t("marketing:contact.linkedinBody")}</p>
                <span className="mk-contact-value">{t("marketing:contact.openProfile")}</span>
              </div>
            </a>

            <a
              href={LEGAL_ENTITY.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-contact-card"
            >
              <span className="mk-contact-icon" aria-hidden>
                <Instagram className="h-5 w-5" />
              </span>
              <div>
                <h2>Instagram</h2>
                <p>{t("marketing:contact.instagramBody")}</p>
                <span className="mk-contact-value">@vetocrm</span>
              </div>
            </a>

            <div className="mk-contact-card mk-contact-card-static">
              <span className="mk-contact-icon" aria-hidden>
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h2>{t("marketing:contact.supportTitle")}</h2>
                <p>{t("marketing:contact.supportBody")}</p>
                <span className="mk-contact-value">{t("marketing:contact.responseTime")}</span>
              </div>
            </div>
          </div>

          <div className="mk-contact-cta">
            <a href={`mailto:${LEGAL_ENTITY.publicEmail}`} className="mk-btn mk-btn-primary">
              <Mail className="h-4 w-4" aria-hidden />
              {t("marketing:contact.writeUs")}
            </a>
            <Link to="/pricing" className="mk-btn mk-btn-ghost">
              {t("marketing:nav.pricing")}
            </Link>
          </div>
        </div>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
