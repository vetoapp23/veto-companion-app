import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setAppLanguage,
  SUPPORTED_LANGS,
  LANGUAGE_LABELS,
  type AppLanguage,
} from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Compact control for nav / marketing header */
  variant?: "default" | "compact" | "marketing" | "marketingHero";
};

const SHORT: Record<AppLanguage, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

export function LanguageSwitcher({ className, variant = "default" }: Props) {
  const { i18n, t } = useTranslation("common");
  const current = (i18n.language?.split("-")[0] || "fr") as AppLanguage;
  const value = SUPPORTED_LANGS.includes(current) ? current : "fr";
  const isHero = variant === "marketingHero";
  const isMarketing = variant === "marketing" || isHero;
  /** Nav: show code only in the trigger (dropdown still has full names). */
  const shortOnly = variant !== "default";

  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      {variant === "default" && (
        <Languages className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      )}
      <Select
        value={value}
        onValueChange={(lng) => setAppLanguage(lng as AppLanguage)}
      >
        <SelectTrigger
          aria-label={t("language")}
          className={cn(
            "overflow-hidden whitespace-nowrap gap-1 [&>span]:line-clamp-none [&>span]:flex [&>span]:items-center",
            variant === "compact" &&
              "h-8 w-auto min-w-[3.5rem] px-2 text-xs text-foreground bg-background",
            isMarketing &&
              !isHero &&
              "h-9 w-auto min-w-[3.5rem] px-2.5 border-[color:var(--mk-line)] bg-[color:var(--mk-surface)] text-[color:var(--mk-ink)]",
            isHero &&
              "h-8 sm:h-9 w-auto min-w-[3.5rem] px-2.5 border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 focus:ring-white/30 focus:ring-offset-0 [&>svg]:text-white/80",
            variant === "default" && "w-[10rem]"
          )}
        >
          {shortOnly ? (
            // Plain text — do not use SelectValue (it mirrors SelectItem content = "FR Français")
            <span
              className={cn(
                "font-semibold tracking-wide tabular-nums",
                isHero ? "text-white" : "text-inherit"
              )}
            >
              {SHORT[value]}
            </span>
          ) : (
            <SelectValue placeholder={LANGUAGE_LABELS[value]} />
          )}
        </SelectTrigger>
        <SelectContent align="end">
          {SUPPORTED_LANGS.map((lng) => (
            <SelectItem key={lng} value={lng} textValue={LANGUAGE_LABELS[lng]}>
              <span className="inline-flex items-center gap-2">
                <span className="font-semibold tabular-nums w-6 shrink-0">{SHORT[lng]}</span>
                <span>{LANGUAGE_LABELS[lng]}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
