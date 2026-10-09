import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SeoHead, siteUrl } from "@/components/SeoHead";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingLegalFooter } from "@/components/MarketingLegalFooter";
import {
  TUTORIAL_VIDEOS,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/content/videos";

export default function VideosPage() {
  const { t } = useTranslation(["marketing", "common"]);

  return (
    <div className="marketing-shell min-h-dvh flex flex-col">
      <SeoHead
        title={t("marketing:videos.seoTitle")}
        description={t("marketing:videos.seoDescription")}
        keywords={t("marketing:videos.seoKeywords")}
        path="/videos"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("marketing:videos.title"),
            description: t("marketing:videos.seoDescription"),
            url: siteUrl("/videos"),
            hasPart: TUTORIAL_VIDEOS.map((video) => ({
              "@type": "VideoObject",
              name: t(`marketing:videos.items.${video.id}.title`),
              description: t(`marketing:videos.items.${video.id}.description`),
              embedUrl: youtubeEmbedUrl(video.youtubeId),
              contentUrl: youtubeWatchUrl(video.youtubeId),
              thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
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
                name: t("marketing:nav.videos"),
                item: siteUrl("/videos"),
              },
            ],
          },
        ]}
      />

      <MarketingNav variant="sticky" />

      <main className="mk-blog flex-1">
        <div className="mk-blog-inner">
          <p className="mk-blog-eyebrow">{t("marketing:videos.eyebrow")}</p>
          <h1>{t("marketing:videos.title")}</h1>
          <p className="mk-blog-lead">{t("marketing:videos.lead")}</p>

          <div className="mk-videos-grid">
            {TUTORIAL_VIDEOS.map((video) => (
              <article key={video.id} className="mk-video-card">
                <div className="mk-video-embed">
                  <iframe
                    src={youtubeEmbedUrl(video.youtubeId)}
                    title={t(`marketing:videos.items.${video.id}.title`)}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="mk-video-body">
                  <h2>{t(`marketing:videos.items.${video.id}.title`)}</h2>
                  <p>{t(`marketing:videos.items.${video.id}.description`)}</p>
                  <a
                    href={youtubeWatchUrl(video.youtubeId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mk-blog-read"
                  >
                    {t("marketing:videos.watchOnYoutube")}
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <MarketingLegalFooter />
    </div>
  );
}
