import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type Props = {
  /** `hero` = over landing media; `sticky` = dark bar on content pages (same look) */
  variant?: "hero" | "sticky";
};

const PREFETCH: Record<string, () => Promise<unknown>> = {
  "/pricing": () => import("@/pages/Pricing"),
  "/contact": () => import("@/pages/ContactPage"),
  "/monde-veto": () => import("@/pages/MondeVetoPage"),
  "/register": () => import("@/pages/Register"),
  "/login": () =>
    import("@/components/LoginForm").then((m) => ({ default: m.LoginForm })),
};

const prefetched = new Set<string>();

function prefetchRoute(path: string) {
  const loader = PREFETCH[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);
  void loader();
}

export function MarketingNav({ variant = "hero" }: Props) {
  const { t } = useTranslation("marketing");
  const { pathname } = useLocation();
  const isSticky = variant === "sticky";

  const linkClass = (path: string) =>
    cn(
      "mk-link hidden md:inline-flex",
      isSticky &&
        (pathname === path || (path !== "/" && pathname.startsWith(path))) &&
        "mk-link-active-dark"
    );

  const prefetchHandlers = (path: string) => ({
    onPointerEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
  });

  const nav = (
    <>
      <Link to="/" className="mk-brand" aria-label={t("nav.homeAria")}>
        <BrandLogo size={36} />
      </Link>
      <nav className="mk-nav-links" aria-label={t("nav.mainNavAria")}>
        <Link to="/pricing" className={linkClass("/pricing")} {...prefetchHandlers("/pricing")}>
          {t("nav.pricing")}
        </Link>
        <Link to="/contact" className={linkClass("/contact")} {...prefetchHandlers("/contact")}>
          {t("nav.contact")}
        </Link>
        <Link
          to="/monde-veto"
          className={linkClass("/monde-veto")}
          {...prefetchHandlers("/monde-veto")}
        >
          {t("nav.mondeVeto")}
        </Link>
        <Link
          to="/login"
          className="mk-link mk-link-compact"
          {...prefetchHandlers("/login")}
        >
          {t("nav.signIn")}
        </Link>
        <LanguageSwitcher variant="marketingHero" />
        <Link
          to="/register"
          className="mk-btn mk-btn-primary mk-btn-nav"
          {...prefetchHandlers("/register")}
        >
          <span className="sm:hidden">{t("nav.getStartedShort")}</span>
          <span className="hidden sm:inline">{t("nav.getStarted")}</span>
        </Link>
      </nav>
    </>
  );

  if (isSticky) {
    return (
      <header className="mk-nav mk-nav-sticky">
        <div className="mk-nav-sticky-inner">{nav}</div>
      </header>
    );
  }

  return <header className="mk-nav">{nav}</header>;
}
