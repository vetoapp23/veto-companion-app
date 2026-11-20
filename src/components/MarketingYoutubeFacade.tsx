import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/content/videos";

type Props = {
  youtubeId: string;
  title: string;
  playLabel: string;
};

export function MarketingYoutubeFacade({ youtubeId, title, playLabel }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="mk-video-embed">
        <iframe
          src={`${youtubeEmbedUrl(youtubeId)}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className="mk-video-embed">
      <button
        type="button"
        className="mk-video-facade"
        onClick={() => setActive(true)}
        aria-label={playLabel}
      >
        <img
          src={youtubeThumbnailUrl(youtubeId)}
          alt=""
          width={480}
          height={360}
          loading="lazy"
          decoding="async"
        />
        <span className="mk-video-facade-play" aria-hidden>
          <Play className="h-7 w-7" fill="currentColor" />
        </span>
      </button>
    </div>
  );
}
