export type TutorialVideoId = "presentation" | "inscription" | "client";

export type TutorialVideo = {
  id: TutorialVideoId;
  youtubeId: string;
};

/** Tutorials published on the VetoCrm YouTube channel. */
export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  { id: "presentation", youtubeId: "OuO6SCNUgXc" },
  { id: "inscription", youtubeId: "Ka7BmoI-_DE" },
  { id: "client", youtubeId: "rQvXHu9A0pU" },
];

export function youtubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

export function youtubeWatchUrl(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}
