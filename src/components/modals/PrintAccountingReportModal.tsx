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
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { formatSourceLabel } from "@/lib/accountingLedger";
import {
  accountingEntryKey,
  buildAccountingReportHtml,
  computeAccountingTotals,
  printHtml,
  type AccountingReportEntry,
} from "@/lib/accountingReport";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { toast } = useToast();

  /** Clés des lignes exclues du PDF */
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setExcludedKeys(new Set());
  }, [open, startDate, endDate, entries]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = a.date.slice(0, 10);
      const db = b.date.slice(0, 10);
      if (da !== db) return da.localeCompare(db);
      return (a.description || "").localeCompare(b.description || "", "fr");
    });
  }, [entries]);

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
        title: "Export impossible",
        description:
          e?.message || "Autorisez les popups pour enregistrer le PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = async () => {
    toast({
      title: "Enregistrer en PDF",
      description:
        "Dans la boîte d'impression, choisissez « Enregistrer au format PDF ».",
    });
    await openPrintDialog();
  };

  const typeBadge = (type: AccountingReportEntry["type"]) => {
    if (type === "revenue")
      return <Badge className="bg-green-600 hover:bg-green-600">Recette</Badge>;
    if (type === "valuation")
      return <Badge className="bg-blue-600 hover:bg-blue-600">Valorisation</Badge>;
    return <Badge variant="destructive">Charge</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exporter le bilan comptable (PDF)
          </DialogTitle>
          <DialogDescription>
            Décochez les lignes à exclure du rapport, puis générez le PDF
            (logo et informations de la clinique inclus).
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
          <span>
            Période :{" "}
            <strong>
              {startDate
                ? format(new Date(`${startDate}T00:00:00`), "dd/MM/yyyy", {
                    locale: fr,
                  })
                : "—"}{" "}
              →{" "}
              {endDate
                ? format(new Date(`${endDate}T00:00:00`), "dd/MM/yyyy", {
                    locale: fr,
                  })
                : "—"}
            </strong>
          </span>
          <span>
            Incluses : <strong>{includedEntries.length}</strong> /{" "}
            {sortedEntries.length}
          </span>
          <span>
            CA : <strong className="text-green-700">{formatCurrency(totals.totalRevenue)}</strong>
          </span>
          <span>
            Charges :{" "}
            <strong className="text-red-700">{formatCurrency(totals.totalExpenses)}</strong>
          </span>
          <span>
            Résultat : <strong>{formatCurrency(totals.netIncome)}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={includeAll}>
            Tout inclure
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={excludeAll}>
            Tout exclure
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("valuation")}
          >
            Exclure valorisations
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("expense")}
          >
            Exclure charges
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => excludeByType("revenue")}
          >
            Exclure recettes
          </Button>
        </div>

        <ScrollArea className="h-[min(420px,45vh)] rounded-md border">
          <div className="divide-y">
            {sortedEntries.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                Aucune écriture sur cette période.
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
                          { locale: fr }
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
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={includedEntries.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Générer le PDF
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">
          Astuce : dans la boîte d’impression, choisissez « Enregistrer au format PDF ».
        </p>
      </DialogContent>
    </Dialog>
  );
}
