import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, Calendar, FileText, BarChart3, Shield, PawPrint } from "lucide-react";
import heroImage from "@/assets/vet-hero.jpg";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";

type FaqItem = { q: string; a: string };

export default function Landing() {
  const { t } = useTranslation("marketing");
  const faq = t("landing.faq", { returnObjects: true }) as FaqItem[];
  const faqItems = Array.isArray(faq) ? faq : [];

  return (
    <div className="marketing-shell">
      <SeoHead
        title={t("landing.seoTitle")}
        description={t("landing.seoDescription")}
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home"), item: siteUrl("/") },
            ],
          },
        ]}
      />

      <section className="mk-hero">
        <div className="mk-hero-media">
          <img
            src={heroImage}
            alt={t("landing.heroAlt")}
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="mk-hero-veil" aria-hidden />
          <div className="mk-hero-mesh" aria-hidden />
        </div>

        <MarketingNav variant="hero" />

        <div className="mk-hero-body">
          <h1 className="mk-hero-title">
            Veto<span style={{ color: "var(--mk-mint)" }}>Crm</span>
          </h1>
          <p
            className="mk-display"
            style={{
              fontSize: "clamp(1.35rem, 3.5vw, 2rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0.5rem 0 0",
              color: "rgba(244, 251, 249, 0.95)",
              animation: "mk-fade-up 0.8s ease 0.08s both",
            }}
          >
            {t("landing.tagline")}
          </p>
          <p className="mk-hero-sub">{t("landing.heroSub")}</p>
          <div className="mk-hero-ctas">
            <Link to="/register" className="mk-btn mk-btn-primary">
              {t("landing.ctaTrial")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/login" className="mk-btn mk-btn-ghost">
              {t("landing.ctaAccess")}
            </Link>
          </div>
        </div>

        <div className="mk-scroll-hint" aria-hidden />
      </section>

      <section className="mk-section" aria-labelledby="parcours-title">
        <p className="mk-section-label">{t("landing.journeyLabel")}</p>
        <h2 id="parcours-title" className="mk-section-title">
          {t("landing.journeyTitle")}
        </h2>
        <p className="mk-section-copy">{t("landing.journeyCopy")}</p>

        <div className="mk-flow">
          <div className="mk-flow-step">
            <div>
              <h3>{t("landing.step1Title")}</h3>
              <p>{t("landing.step1Body")}</p>
            </div>
          </div>
          <div className="mk-flow-step">
            <div>
              <h3>{t("landing.step2Title")}</h3>
              <p>{t("landing.step2Body")}</p>
            </div>
          </div>
          <div className="mk-flow-step">
            <div>
              <h3>{t("landing.step3Title")}</h3>
              <p>{t("landing.step3Body")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }} aria-labelledby="capacites-title">
        <p className="mk-section-label">{t("landing.capabilitiesLabel")}</p>
        <h2 id="capacites-title" className="mk-section-title">
          {t("landing.capabilitiesTitle")}
        </h2>
        <p className="mk-section-copy">{t("landing.capabilitiesCopy")}</p>

        <div className="mk-capabilities">
          <article className="mk-cap">
            <h3>
              <Users className="h-5 w-5" aria-hidden /> {t("landing.featClients")}
            </h3>
            <p>{t("landing.featClientsBody")}</p>
          </article>
          <article className="mk-cap">
            <h3>
              <Calendar className="h-5 w-5" aria-hidden /> {t("landing.featAgenda")}
            </h3>
            <p>{t("landing.featAgendaBody")}</p>
          </article>
          <article className="mk-cap">
            <h3>
              <FileText className="h-5 w-5" aria-hidden /> {t("landing.featConsult")}
            </h3>
            <p>{t("landing.featConsultBody")}</p>
          </article>
          <article className="mk-cap">
            <h3>
              <PawPrint className="h-5 w-5" aria-hidden /> {t("landing.featVax")}
            </h3>
            <p>{t("landing.featVaxBody")}</p>
          </article>
          <article className="mk-cap">
            <h3>
              <BarChart3 className="h-5 w-5" aria-hidden /> {t("landing.featStock")}
            </h3>
            <p>{t("landing.featStockBody")}</p>
          </article>
          <article className="mk-cap">
            <h3>
              <Shield className="h-5 w-5" aria-hidden /> {t("landing.featSecurity")}
            </h3>
            <p>{t("landing.featSecurityBody")}</p>
          </article>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }} aria-labelledby="faq-title">
        <p className="mk-section-label">{t("landing.faqLabel")}</p>
        <h2 id="faq-title" className="mk-section-title">
          {t("landing.faqTitle")}
        </h2>
        <div className="mk-faq" style={{ maxWidth: "42rem", margin: "1.5rem auto 0", textAlign: "left" }}>
          {faqItems.map((item) => (
            <details
              key={item.q}
              style={{
                borderBottom: "1px solid var(--mk-line)",
                padding: "1rem 0",
              }}
            >
              <summary
                className="mk-display"
                style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.05rem" }}
              >
                {item.q}
              </summary>
              <p style={{ marginTop: "0.65rem", color: "var(--mk-muted)", lineHeight: 1.55 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mk-cta-band">
        <h2>{t("landing.ctaBandTitle")}</h2>
        <p>{t("landing.ctaBandBody")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          <Link to="/register" className="mk-btn mk-btn-primary">
            {t("landing.ctaCreateAccount")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/pricing" className="mk-btn mk-btn-ghost">
            {t("landing.ctaSeePricing")}
          </Link>
        </div>
      </div>

      <MarketingLegalFooter />
    </div>
  );
}
