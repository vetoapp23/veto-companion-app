import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export type CookieConsentValue = "accepted" | "rejected";

const STORAGE_KEY = "vetocrm_cookie_consent";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "accepted" || v === "rejected") return v;
  return null;
}

export function setCookieConsent(value: CookieConsentValue) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event("vetocrm-cookie-consent"));
}

/** Renders only after the user accepts non-essential cookies. */
export function AnalyticsGate({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());
    const onChange = () => setConsent(getCookieConsent());
    window.addEventListener("vetocrm-cookie-consent", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("vetocrm-cookie-consent", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (consent !== "accepted") return null;
  return <>{children}</>;
}

export function CookieConsentBanner() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() == null);
  }, []);

  if (!visible) return null;

  const choose = (value: CookieConsentValue) => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[100] border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          <p id="cookie-consent-title" className="font-medium">
            {t("cookieConsent.title")}
          </p>
          <p className="text-muted-foreground">
            {t("cookieConsent.body")}{" "}
            <Link to="/cookies" className="underline underline-offset-2 hover:text-foreground">
              {t("cookieConsent.learnMore")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => choose("rejected")}>
            {t("cookieConsent.reject")}
          </Button>
          <Button type="button" size="sm" onClick={() => choose("accepted")}>
            {t("cookieConsent.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
