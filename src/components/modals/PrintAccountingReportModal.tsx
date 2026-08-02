import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { getDateFnsLocale } from "@/i18n/dateLocale";
import { formatSourceLabel } from "@/lib/accountingLedger";
import {
  accountingEntryKey,
  buildAccountingReportHtml,
  computeAccountingTotals,
  printHtml,
  type AccountingReportEntry,
} from "@/lib/accountingReport";
import { format } from "date-fns";

interface PrintAccountingReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: AccountingReportEntry[];
  startDate: string;
  endDate: string;
}

export function PrintAccountingReportModal({
  open,
  onOpenChange,
  entries,
  startDate,
  endDate,
}: PrintAccountingReportModalProps) {
  const { t, i18n } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const dateLocale = getDateFnsLocale(i18n.language);
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { toast } = useToast();

  /** Keys of lines excluded from the PDF */
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setExcludedKeys(new Set());
  }, [open, startDate, endDate, entries]);

  const sortedEntries = useMemo(() => {
    const loc = (i18n.language || "fr").split("-")[0];
    return [...entries].sort((a, b) => {
      const da = a.date.slice(0, 10);
      const db = b.date.slice(0, 10);
      if (da !== db) return da.localeCompare(db);
      return (a.description || "").localeCompare(b.description || "", loc);
    });
  }, [entries, i18n.language]);

  const includedEntries = useMemo(
    () => sortedEntries.filter((e) => !excludedKeys.has(accountingEntryKey(e))),
    [sortedEntries, excludedKeys]
  );

  const totals = useMemo(
    () => computeAccountingTotals(includedEntries),
    [includedEntries]
  );

  const formatCurrency = (amount: number) =>
    `${amount.toFixed(2)} ${settings.currency}`;

  const toggleExcluded = (key: string, exclude: boolean) => {
    setExcludedKeys((prev) => {
      const next = new Set(prev);
      if (exclude) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const excludeAll = () => {
    setExcludedKeys(new Set(sortedEntries.map(accountingEntryKey)));
  };

  const includeAll = () => setExcludedKeys(new Set());

  const excludeByType = (type: AccountingReportEntry["type"]) => {
    setExcludedKeys((prev) => {
      const next = new Set(prev);
      sortedEntries.forEach((e) => {
        if (e.type === type) next.add(accountingEntryKey(e));
      });
      return next;
    });
  };

  const openPrintDialog = async () => {
    try {
      const html = buildAccountingReportHtml({
        entries: includedEntries,
        startDate,
        endDate,
        currency: settings.currency || "MAD",
        clinic: {
          clinicName: settings.clinicName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          logo: settings.logo,
        },
        isFree,
      });
      await printHtml(html);
    } catch (e: any) {
      toast({
        title: t("accounting.print.modal.exportFailed"),
        description:
          e?.message || t("accounting.print.modal.exportFailedBody"),
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = async () => {
    toast({
      title: t("accounting.print.modal.savePdfTitle"),
      description: t("accounting.print.modal.savePdfBody"),
    });
    await openPrintDialog();
  };

  const typeBadge = (type: AccountingReportEntry["type"]) => {
    if (type === "revenue")
      return <Badge className="bg-green-600 hover:bg-green-600">{t("accounting.print.types.revenue")}</Badge>;
    if (type === "valuation")
      return <Badge className="bg-blue-600 hover:bg-blue-600">{t("accounting.print.types.valuation")}</Badge>;
    return <Badge variant="destructive">{t("accounting.print.types.expense")}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("accounting.print.modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("accounting.print.modal.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {t("accounting.print.modal.period")} :{" "}
            <strong>
              {startDate
                ? format(new Date(`${startDate}T00:00:00`), "dd/MM/yyyy", {
                    locale: dateLocale,
                  })
                : "—"}{" "}
              →{" "}
              {endDate
                ? format(new Date(`${endDate}T00:00:00`), "dd/MM/yyyy", {
                    locale: dateLocale,
                  })
                : "—"}
            </strong>
          </span>
          <span>
            {t("accounting.print.modal.included")} : <strong>{includedEntries.length}</strong> /{" "}
            {sortedEntries.length}
          </span>
          <span>
            {t("accounting.print.modal.ca")} : <strong className="text-green-700">{formatCurrency(totals.totalRevenue)}</strong>
          </span>
          <span>
            {t("accounting.print.modal.expenses")} :{" "}
            <strong className="text-red-700">{formatCurrency(totals.totalExpenses)}</strong>
          </span>
          <span>
            {t("accounting.print.modal.result")} : <strong>{formatCurrency(totals.netIncome)}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={includeAll}>
            {t("accounting.print.modal.includeAll")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={excludeAll}>
            {t("accounting.print.modal.excludeAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("valuation")}
          >
            {t("accounting.print.modal.excludeValuations")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("expense")}
          >
            {t("accounting.print.modal.excludeExpenses")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("revenue")}
          >
            {t("accounting.print.modal.excludeRevenue")}
          </Button>
        </div>

        <ScrollArea className="h-[min(420px,45vh)] rounded-md border">
          <div className="divide-y">
            {sortedEntries.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                {t("accounting.print.modal.empty")}
              </p>
            )}
            {sortedEntries.map((entry) => {
              const key = accountingEntryKey(entry);
              const included = !excludedKeys.has(key);
              return (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                    included ? "" : "opacity-50"
                  }`}
                >
                  <Checkbox
                    checked={included}
                    onCheckedChange={(v) => toggleExcluded(key, v !== true)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {typeBadge(entry.type)}
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(`${entry.date.slice(0, 10)}T00:00:00`),
                          "dd/MM/yyyy",
                          { locale: dateLocale }
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatSourceLabel(entry.source)}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate">
                      {entry.description}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold shrink-0 ${
                      entry.type === "revenue"
                        ? "text-green-700"
                        : entry.type === "valuation"
                          ? "text-blue-700"
                          : "text-red-700"
                    }`}
                  >
                    {entry.type === "revenue" ? "+" : entry.type === "valuation" ? "" : "−"}
                    {formatCurrency(entry.amount)}
                  </div>
                </label>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={includedEntries.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("accounting.print.modal.generatePdf")}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">
          {t("accounting.print.modal.tip")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
