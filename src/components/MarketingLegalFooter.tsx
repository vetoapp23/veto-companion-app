import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Linkedin, Instagram, Mail } from "lucide-react";
import { LEGAL_ENTITY } from "@/content/legal";

export function MarketingLegalFooter() {
  const { t } = useTranslation(["common", "marketing"]);

  return (
    <footer className="mk-footer">
      <nav
        aria-label={t("marketing:nav.footerAria")}
        className="mk-footer-nav"
      >
        <Link to="/pricing" className="mk-link">
          {t("marketing:nav.pricing")}
        </Link>
        <Link to="/contact" className="mk-link">
          {t("marketing:nav.contact")}
        </Link>
        <Link to="/monde-veto" className="mk-link">
          {t("marketing:nav.mondeVeto")}
        </Link>
        <Link to="/privacy" className="mk-link">
          {t("common:privacy")}
        </Link>
        <Link to="/terms" className="mk-link">
          {t("common:terms")}
        </Link>
        <Link to="/cookies" className="mk-link">
          {t("common:cookies")}
        </Link>
        <Link to="/legal" className="mk-link">
          {t("common:legal")}
        </Link>
        <Link to="/refund" className="mk-link">
          {t("common:refund")}
        </Link>
        <Link to="/login" className="mk-link">
          {t("marketing:nav.login")}
        </Link>
      </nav>

      <div className="mk-footer-social" aria-label={t("common:socialNetworks")}>
        <a
          href={`mailto:${LEGAL_ENTITY.publicEmail}`}
          className="mk-social-btn"
          aria-label={`Email ${LEGAL_ENTITY.publicEmail}`}
        >
          <Mail className="h-4 w-4" aria-hidden />
          <span>Email</span>
        </a>
        <a
          href={LEGAL_ENTITY.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mk-social-btn"
          aria-label="LinkedIn VetoCrm"
        >
          <Linkedin className="h-4 w-4" aria-hidden />
          <span>LinkedIn</span>
        </a>
        <a
          href={LEGAL_ENTITY.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mk-social-btn"
          aria-label="Instagram VetoCrm"
        >
          <Instagram className="h-4 w-4" aria-hidden />
          <span>Instagram</span>
        </a>
      </div>

      <p>{t("marketing:landing.footerCopy", { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
