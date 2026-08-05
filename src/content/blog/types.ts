export type BlogLang = "fr" | "en" | "es";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Optional in-article screenshot (public path) */
  image?: string;
  imageCaption?: string;
};

export type BlogArticleLocalized = {
  title: string;
  excerpt: string;
  metaDescription: string;
  category: string;
  sections: BlogSection[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
};

export type BlogArticle = {
  slug: string;
  cover: string;
  coverAlt: Record<BlogLang, string>;
  publishedAt: string;
  readingMinutes: number;
  locales: Record<BlogLang, BlogArticleLocalized>;
};
