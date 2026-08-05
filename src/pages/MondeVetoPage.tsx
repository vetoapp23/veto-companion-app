import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock } from "lucide-react";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import { BLOG_ARTICLES, resolveBlogLang } from "@/content/blog/articles";

function formatDate(iso: string, lang: string) {
  try {
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default function MondeVetoPage() {
  const { t, i18n } = useTranslation(["marketing", "common"]);
  const lang = resolveBlogLang(i18n.language);
  const articles = [...BLOG_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead
        title={t("marketing:mondeVeto.seoTitle")}
        description={t("marketing:mondeVeto.seoDescription")}
        path="/monde-veto"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t("marketing:nav.mondeVeto") + " — VetoCrm",
            description: t("marketing:mondeVeto.seoDescription"),
            url: siteUrl("/monde-veto"),
            blogPost: articles.map((a) => ({
              "@type": "BlogPosting",
              headline: a.locales[lang].title,
              datePublished: a.publishedAt,
              image: siteUrl(a.cover),
              url: siteUrl(`/monde-veto/${a.slug}`),
              description: a.locales[lang].excerpt,
            })),
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
            ],
          },
        ]}
      />

      <MarketingNav variant="sticky" />

      <main className="mk-blog flex-1">
        <div className="mk-blog-inner">
          <p className="mk-blog-eyebrow">{t("marketing:mondeVeto.eyebrow")}</p>
          <h1>{t("marketing:mondeVeto.title")}</h1>
          <p className="mk-blog-lead">{t("marketing:mondeVeto.lead")}</p>

          <div className="mk-blog-grid">
            {articles.map((article) => {
              const loc = article.locales[lang];
              return (
                <article key={article.slug} className="mk-blog-card">
                  <Link to={`/monde-veto/${article.slug}`} className="mk-blog-card-media">
                    <img
                      src={article.cover}
                      alt={article.coverAlt[lang]}
                      width={1200}
                      height={800}
                      loading="lazy"
                    />
                  </Link>
                  <div className="mk-blog-card-body">
                    <div className="mk-blog-meta">
                      <span className="mk-blog-chip">{loc.category}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {t("marketing:mondeVeto.readTime", { minutes: article.readingMinutes })}
                      </span>
                      <time dateTime={article.publishedAt}>
                        {formatDate(article.publishedAt, lang)}
                      </time>
                    </div>
                    <h2>
                      <Link to={`/monde-veto/${article.slug}`}>{loc.title}</Link>
                    </h2>
                    <p>{loc.excerpt}</p>
                    <Link to={`/monde-veto/${article.slug}`} className="mk-blog-read">
                      {t("marketing:mondeVeto.readArticle")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
