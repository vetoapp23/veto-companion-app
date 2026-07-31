import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import {
  DEFAULT_LIST_DATE_FILTER,
  getBoundsForPeriod,
  resolveListDateBounds,
  type ListDateFilterState,
  type ListDatePeriod,
} from "@/lib/dateLocal";
import { cn } from "@/lib/utils";

interface ListDateFilterProps {
  value: ListDateFilterState;
  onChange: (next: ListDateFilterState) => void;
  className?: string;
  /** Compact: smaller title / denser layout */
  compact?: boolean;
  idPrefix?: string;
  /** Titre affiché (défaut : Période d'analyse) */
  title?: string;
  /** Afficher le bouton « Tout » (défaut true pour les listes) */
  showAll?: boolean;
}

const PRESET_BUTTONS: { value: "today" | "month" | "quarter" | "year"; label: string }[] = [
  { value: "today", label: "Ce jour" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
];

export function ListDateFilter({
  value,
  onChange,
  className,
  compact = false,
  idPrefix = "list-date",
  title = "Période d'analyse",
  showAll = true,
}: ListDateFilterProps) {
  const selectPreset = (period: "today" | "month" | "quarter" | "year") => {
    const bounds = getBoundsForPeriod(period);
    onChange({ period, dateFrom: bounds.from, dateTo: bounds.to });
  };

  const selectAll = () => {
    onChange({ period: "all", dateFrom: "", dateTo: "" });
  };

  const onFromChange = (dateFrom: string) => {
    onChange({
      period: "range",
      dateFrom,
      dateTo: value.dateTo || dateFrom,
    });
  };

  const onToChange = (dateTo: string) => {
    onChange({
      period: "range",
      dateFrom: value.dateFrom || dateTo,
      dateTo,
    });
  };

  const bounds = resolveListDateBounds(value);
  const displayFrom = bounds?.from || value.dateFrom || "";
  const displayTo = bounds?.to || value.dateTo || "";

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("flex items-center gap-2 font-medium", compact ? "text-sm" : "text-base")}>
        <Calendar className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
        {title}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between flex-wrap">
        <div className="flex flex-wrap gap-2">
          {showAll && (
            <Button
              type="button"
              variant={value.period === "all" ? "default" : "outline"}
              size="sm"
              onClick={selectAll}
            >
              Tout
            </Button>
          )}
          {PRESET_BUTTONS.map((b) => (
            <Button
              key={b.value}
              type="button"
              variant={value.period === b.value ? "default" : "outline"}
              size="sm"
              onClick={() => selectPreset(b.value)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Label htmlFor={`${idPrefix}-from`} className="shrink-0">
            Du
          </Label>
          <Input
            id={`${idPrefix}-from`}
            type="date"
            value={displayFrom}
            max={displayTo || undefined}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full sm:w-40"
          />
          <Label htmlFor={`${idPrefix}-to`} className="shrink-0">
            Au
          </Label>
          <Input
            id={`${idPrefix}-to`}
            type="date"
            value={displayTo}
            min={displayFrom || undefined}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_LIST_DATE_FILTER };
export type { ListDateFilterState, ListDatePeriod };
