import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

type Props = {
  /** `hero` = over landing media; `sticky` = dark bar on content pages (same look) */
  variant?: "hero" | "sticky";
};

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

  const nav = (
    <>
      <Link to="/" className="mk-brand" aria-label={t("nav.homeAria")}>
        Veto<span>Crm</span>
      </Link>
      <nav className="mk-nav-links" aria-label={t("nav.mainNavAria")}>
        <Link to="/pricing" className={linkClass("/pricing")}>
          {t("nav.pricing")}
        </Link>
        <Link to="/contact" className={linkClass("/contact")}>
          {t("nav.contact")}
        </Link>
        <Link to="/monde-veto" className={linkClass("/monde-veto")}>
          {t("nav.mondeVeto")}
        </Link>
        <Link to="/login" className="mk-link mk-link-compact">
          {t("nav.signIn")}
        </Link>
        <LanguageSwitcher variant="marketingHero" />
        <Link to="/register" className="mk-btn mk-btn-primary mk-btn-nav">
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
