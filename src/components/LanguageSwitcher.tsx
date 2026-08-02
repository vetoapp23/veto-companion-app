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
  variant?: "default" | "compact" | "marketing";
};

export function LanguageSwitcher({ className, variant = "default" }: Props) {
  const { i18n, t } = useTranslation("common");
  const current = (i18n.language?.split("-")[0] || "fr") as AppLanguage;
  const value = SUPPORTED_LANGS.includes(current) ? current : "fr";

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
            variant === "compact" && "h-8 w-[7.5rem] text-xs",
            variant === "marketing" &&
              "h-9 w-[8.5rem] border-[color:var(--mk-line)] bg-[color:var(--mk-surface)] text-[color:var(--mk-ink)]",
            variant === "default" && "w-[10rem]"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGS.map((lng) => (
            <SelectItem key={lng} value={lng}>
              {LANGUAGE_LABELS[lng]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
