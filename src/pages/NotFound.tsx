import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SeoHead } from "@/components/SeoHead";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SeoHead
        title={t("pageNotFoundTitle")}
        description={t("pageNotFoundDesc")}
        path={location.pathname}
        noIndex
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">{t("pageNotFound")}</p>
        <Link to="/" className="text-primary hover:underline">
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
