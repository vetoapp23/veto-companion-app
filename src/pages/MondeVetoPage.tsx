import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, ExternalLink } from "lucide-react";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import { MarketingYoutubeFacade } from "@/components/MarketingYoutubeFacade";
import { BLOG_ARTICLES, resolveBlogLang } from "@/content/blog/articles";
import {
  TUTORIAL_VIDEOS,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/content/videos";

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
        keywords={t("marketing:mondeVeto.seoKeywords")}
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
            hasPart: TUTORIAL_VIDEOS.map((video) => ({
              "@type": "VideoObject",
              name: t(`marketing:mondeVeto.videos.items.${video.id}.title`),
              description: t(`marketing:mondeVeto.videos.items.${video.id}.description`),
              embedUrl: youtubeEmbedUrl(video.youtubeId),
              contentUrl: youtubeWatchUrl(video.youtubeId),
              thumbnailUrl: youtubeThumbnailUrl(video.youtubeId),
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

      <a href="#mk-main" className="mk-skip-link">
        {t("marketing:nav.skipToContent")}
      </a>

      <MarketingNav variant="sticky" />

      <main id="mk-main" className="mk-blog flex-1" tabIndex={-1}>
        <div className="mk-blog-inner">
          <p className="mk-blog-eyebrow">{t("marketing:mondeVeto.eyebrow")}</p>
          <h1>{t("marketing:mondeVeto.title")}</h1>
          <p className="mk-blog-lead">{t("marketing:mondeVeto.lead")}</p>

          <div className="mk-blog-featured">
            <p className="mk-section-label">{t("marketing:landingResources.label")}</p>
            <div className="mk-resource-links">
              <Link to="/monde-veto/logiciel-gestion-clinique-veterinaire" className="mk-resource-link">
                {t("marketing:landingResources.guidePm")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/monde-veto/veterinary-crm-software" className="mk-resource-link">
                {t("marketing:landingResources.guideCrm")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/monde-veto/classement-meilleurs-crm-erp-veterinaire-2026"
                className="mk-resource-link"
              >
                {t("marketing:landingResources.guideRank")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/monde-veto/best-veterinary-practice-management-software-2027"
                className="mk-resource-link"
              >
                {t("marketing:landingResources.guideBest2027")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <section
            className="mk-videos-section mk-section-defer"
            aria-labelledby="monde-veto-videos"
          >
            <p className="mk-section-label">{t("marketing:mondeVeto.videos.label")}</p>
            <h2 id="monde-veto-videos" className="mk-videos-heading">
              {t("marketing:mondeVeto.videos.title")}
            </h2>
            <p className="mk-videos-lead">{t("marketing:mondeVeto.videos.lead")}</p>

            <div className="mk-videos-grid">
              {TUTORIAL_VIDEOS.map((video) => {
                const title = t(`marketing:mondeVeto.videos.items.${video.id}.title`);
                return (
                  <article key={video.id} className="mk-video-card">
                    <MarketingYoutubeFacade
                      youtubeId={video.youtubeId}
                      title={title}
                      playLabel={t("marketing:mondeVeto.videos.playVideo", {
                        title,
                        defaultValue: `Play: ${title}`,
                      })}
                    />
                    <div className="mk-video-body">
                      <h3>{title}</h3>
                      <p>{t(`marketing:mondeVeto.videos.items.${video.id}.description`)}</p>
                      <a
                        href={youtubeWatchUrl(video.youtubeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mk-blog-read"
                      >
                        {t("marketing:mondeVeto.videos.watchOnYoutube")}
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="mk-blog-grid">
            {articles.map((article) => {
              const loc = article.locales[lang];
              return (
                <article key={article.slug} className="mk-blog-card mk-card-defer">
                  <Link to={`/monde-veto/${article.slug}`} className="mk-blog-card-media">
                    <img
                      src={article.cover}
                      alt={article.coverAlt[lang]}
                      width={1200}
                      height={800}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
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
