/**
 * Post-build: emit static HTML shells for public marketing routes so crawlers
 * see correct <title>, description, canonical and robots without waiting for JS.
 * Vercel serves filesystem files before the SPA rewrite.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const SITE = "https://www.vetocrm.com";

const STATIC_PAGES = [
  {
    path: "/",
    title: "VetoCrm — Logiciel de gestion clinique vétérinaire & CRM",
    description:
      "Logiciel de gestion pour cliniques et cabinets vétérinaires : clients, animaux, RDV, dossiers médicaux, vaccins, stock, comptabilité et élevage. Démo gratuite.",
  },
  {
    path: "/pricing",
    title: "Tarifs VetoCrm — Prix logiciel de gestion clinique vétérinaire",
    description:
      "Comparez les formules VetoCrm (gratuit, Pro, Duo, Clinique) : stockage, utilisateurs, stock et modules pour votre logiciel de gestion vétérinaire.",
  },
  {
    path: "/register",
    title: "Créer un compte VetoCrm — Inscription clinique vétérinaire",
    description:
      "Créez votre espace VetoCrm : choisissez une formule et démarrez la gestion de votre clinique vétérinaire.",
  },
  {
    path: "/contact",
    title: "Contact VetoCrm — Support logiciel clinique vétérinaire",
    description: "Contactez l’équipe VetoCrm pour une démo, une question commerciale ou un support.",
  },
  {
    path: "/press",
    title: "Presse & annuaires — VetoCrm",
    description: "Kit presse, description produit et liens utiles pour présenter VetoCrm.",
  },
  {
    path: "/monde-veto",
    title: "Le Monde Veto — Guides & actualités pour cliniques vétérinaires",
    description:
      "Articles et guides VetoCrm pour digitaliser et piloter une clinique vétérinaire : CRM, RDV, dossiers, vaccins.",
  },
  {
    path: "/privacy",
    title: "Politique de confidentialité — VetoCrm",
    description:
      "Politique de confidentialité VetoCrm — traitement des données personnelles du SaaS de gestion clinique vétérinaire (RGPD, Stripe, sous-traitants, droits).",
  },
  {
    path: "/terms",
    title: "Conditions d’utilisation — VetoCrm",
    description:
      "Conditions d’utilisation VetoCrm — accès, abonnements, usage acceptable, responsabilité et droit applicable.",
  },
  {
    path: "/cookies",
    title: "Politique cookies — VetoCrm",
    description:
      "Politique cookies VetoCrm — cookies essentiels, préférences, Vercel Analytics / Speed Insights et gestion du consentement.",
  },
  {
    path: "/disclosure",
    title: "Divulgation — VetoCrm",
    description:
      "Divulgations VetoCrm — avertissement professionnel, transparence publicitaire, partenariats et liens d’affiliation.",
  },
  {
    path: "/legal",
    title: "Mentions légales — VetoCrm",
    description: "Mentions légales VetoCrm — éditeur, hébergement, contact et identification.",
  },
  {
    path: "/refund",
    title: "Politique de remboursement — VetoCrm",
    description:
      "Annulation et remboursements des abonnements VetoCrm via Stripe et les stores — essais, renouvellements et rétrogradations.",
  },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectMeta(html, { path: routePath, title, description, noIndex = false }) {
  const url = routePath === "/" ? `${SITE}/` : `${SITE}${routePath}`;
  const robots = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const t = escapeHtml(title);
  const d = escapeHtml(description);

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${t}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="description" content="${d}" />`,
  );
  out = out.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i,
    `<meta name="robots" content="${robots}" />`,
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,
    `<link rel="canonical" href="${url}" />`,
  );
  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="fr"\s+href="[^"]*"\s*\/>/i,
    `<link rel="alternate" hreflang="fr" href="${url}" />`,
  );
  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/>/i,
    `<link rel="alternate" hreflang="en" href="${url}${url.includes("?") ? "&" : "?"}lng=en" />`,
  );
  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="es"\s+href="[^"]*"\s*\/>/i,
    `<link rel="alternate" hreflang="es" href="${url}${url.includes("?") ? "&" : "?"}lng=es" />`,
  );
  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/i,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:title" content="${t}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:description" content="${d}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:title" content="${t}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:description" content="${d}" />`,
  );
  return out;
}

function writePage(routePath, html) {
  if (routePath === "/") {
    fs.writeFileSync(path.join(dist, "index.html"), html, "utf8");
    return path.join(dist, "index.html");
  }
  const dir = path.join(dist, routePath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, html, "utf8");
  return file;
}

async function loadBlogPages() {
  try {
    // Prefer compiled-free import via dynamic path (tsx when available)
    const articlesUrl = pathToFileURL(path.join(root, "src/content/blog/articles.ts")).href;
    const mod = await import(articlesUrl);
    const articles = mod.BLOG_ARTICLES || [];
    return articles.map((a) => {
      const fr = a.locales?.fr;
      return {
        path: `/monde-veto/${a.slug}`,
        title: `${fr?.title || a.slug} — Monde Veto | VetoCrm`,
        description:
          fr?.metaDescription ||
          fr?.excerpt ||
          "Article Monde Veto — guides pour cliniques vétérinaires et VetoCrm.",
      };
    });
  } catch (e) {
    console.warn("[prerender] blog articles skipped:", e.message);
    return [];
  }
}

async function main() {
  const indexPath = path.join(dist, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("[prerender] dist/index.html missing — run vite build first");
    process.exit(1);
  }
  const base = fs.readFileSync(indexPath, "utf8");
  const blogPages = await loadBlogPages();
  const pages = [...STATIC_PAGES, ...blogPages];
  let n = 0;
  for (const page of pages) {
    const html = injectMeta(base, page);
    writePage(page.path, html);
    n += 1;
  }
  console.log(`[prerender] wrote ${n} marketing HTML shells → dist/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
