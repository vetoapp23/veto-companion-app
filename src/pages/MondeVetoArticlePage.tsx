import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock } from "lucide-react";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import { BLOG_ARTICLES, getBlogArticle, resolveBlogLang } from "@/content/blog/articles";

function formatDate(iso: string, lang: string) {
  try {
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default function MondeVetoArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation(["marketing", "common"]);
  const lang = resolveBlogLang(i18n.language);
  const article = slug ? getBlogArticle(slug) : undefined;

  if (!article) {
    return <Navigate to="/monde-veto" replace />;
  }

  const loc = article.locales[lang];
  const related = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead
        title={`${loc.title} — VetoCrm`}
        description={loc.metaDescription}
        path={`/monde-veto/${article.slug}`}
        image={siteUrl(article.cover)}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: loc.title,
            description: loc.metaDescription,
            image: siteUrl(article.cover),
            datePublished: article.publishedAt,
            dateModified: article.publishedAt,
            author: { "@type": "Organization", name: "VetoCrm" },
            publisher: {
              "@type": "Organization",
              name: "VetoCrm",
              url: siteUrl("/"),
            },
            mainEntityOfPage: siteUrl(`/monde-veto/${article.slug}`),
            articleSection: loc.category,
            inLanguage: lang,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("marketing:nav.home"), item: siteUrl("/") },
              {
                "@type": "ListItem",
                position: 2,
                name: t("marketing:nav.mondeVeto"),
                item: siteUrl("/monde-veto"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: loc.title,
                item: siteUrl(`/monde-veto/${article.slug}`),
              },
            ],
          },
        ]}
      />

      <MarketingNav variant="sticky" />

      <main className="mk-article flex-1">
        <article className="mk-article-inner">
          <div className="mk-blog-meta mk-article-meta">
            <span className="mk-blog-chip">{loc.category}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t("marketing:mondeVeto.readTime", { minutes: article.readingMinutes })}
            </span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
          </div>

          <h1>{loc.title}</h1>
          <p className="mk-article-lead">{loc.excerpt}</p>

          <figure className="mk-article-cover">
            <img
              src={article.cover}
              alt={article.coverAlt[lang]}
              width={1200}
              height={800}
              fetchPriority="high"
            />
          </figure>

          <div className="mk-article-body">
            {loc.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul>
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.image && (
                  <figure className="mk-article-inline-figure">
                    <img
                      src={section.image}
                      alt={section.imageCaption || section.heading}
                      width={1200}
                      height={750}
                      loading="lazy"
                    />
                    {section.imageCaption && <figcaption>{section.imageCaption}</figcaption>}
                  </figure>
                )}
              </section>
            ))}
          </div>

          <aside className="mk-article-cta">
            <h2>{loc.ctaTitle}</h2>
            <p>{loc.ctaBody}</p>
            <div className="mk-article-cta-actions">
              <Link to="/register" className="mk-btn mk-btn-primary">
                {loc.ctaButton}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/pricing" className="mk-btn mk-btn-outline-dark">
                {t("marketing:nav.pricing")}
              </Link>
            </div>
          </aside>

          {related.length > 0 && (
            <section className="mk-article-related">
              <h2>{t("marketing:mondeVeto.related")}</h2>
              <div className="mk-article-related-grid">
                {related.map((r) => (
                  <Link key={r.slug} to={`/monde-veto/${r.slug}`} className="mk-article-related-card">
                    <img src={r.cover} alt={r.coverAlt[lang]} width={400} height={260} loading="lazy" />
                    <span>{r.locales[lang].title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
