import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, FileText, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useFarmBatches, useFarmHealthEvents } from "@/hooks/useFarmBatches";
import { useFarmInfrastructures } from "@/hooks/useFarmInfrastructures";
import { useFarmInterventionsByFarm, useClients } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import {
  buildFarmReportHtml,
  printHtml,
  getFarmSectionLabels,
  FARM_SECTION_KEYS,
  FARM_TEMPLATES,
  type FarmSectionKey,
  type FarmTemplate,
} from "@/lib/farmReport";

interface PrintFarmReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: any | null;
}

export function PrintFarmReportModal({ open, onOpenChange, farm }: PrintFarmReportModalProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const farmId = farm?.id || "";

  const { data: batches = [] } = useFarmBatches(farmId);
  const { data: events = [] } = useFarmHealthEvents(farmId);
  const { data: interventions = [] } = useFarmInterventionsByFarm(farmId);
  const { data: infrastructures = [] } = useFarmInfrastructures(farmId);
  const { data: clients = [] } = useClients();

  const [template, setTemplate] = useState<FarmTemplate>("complete");
  const [sections, setSections] = useState<Record<FarmSectionKey, boolean>>(FARM_TEMPLATES.complete);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const sectionLabels = getFarmSectionLabels();

  const applyTemplate = (tmpl: FarmTemplate) => {
    setTemplate(tmpl);
    setSections(FARM_TEMPLATES[tmpl]);
  };

  const toggle = (k: FarmSectionKey) =>
    setSections((s) => ({ ...s, [k]: !s[k] }));

  const owner = clients.find((c: any) => c.id === farm?.client_id);
  const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : undefined;

  const buildHtml = () => {
    if (!farm) return "";
    return buildFarmReportHtml({
      farm,
      ownerName,
      batches,
      infrastructures,
      interventions,
      events,
      clinic: {
        clinicName: settings.clinicName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        logo: settings.logo,
      },
      isFree,
      sections,
      dateFrom,
      dateTo,
    });
  };

  const openPrintDialog = async () => {
    const html = buildHtml();
    if (!html) return;
    try {
      await printHtml(html);
    } catch (e: any) {
      toast({
        title: t("farms.print.modal.printFailed"),
        description: e?.message || t("farms.print.modal.printFailedBody"),
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    void openPrintDialog();
  };

  /** Same path as Print (browser dialog → Save as PDF). */
  const handleDownloadPdf = async () => {
    toast({
      title: t("farms.print.modal.savePdfTitle"),
      description: t("farms.print.modal.savePdfBody"),
    });
    await openPrintDialog();
  };

  if (!farm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("farms.print.modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("farms.print.modal.desc", { name: farm.farm_name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("farms.print.modal.template")}</Label>
              <Select value={template} onValueChange={(v) => applyTemplate(v as FarmTemplate)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">{t("farms.print.templates.complete")}</SelectItem>
                  <SelectItem value="summary">{t("farms.print.templates.summary")}</SelectItem>
                  <SelectItem value="sanitary">{t("farms.print.templates.sanitary")}</SelectItem>
                  <SelectItem value="inventory">{t("farms.print.templates.inventory")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>{tc("from")}</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{tc("to")}</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("farms.print.modal.periodHint")}
          </p>

          <div>
            <Label className="mb-2 block">{t("farms.print.modal.sectionsToInclude")}</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {FARM_SECTION_KEYS.map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sections[k]} onCheckedChange={() => toggle(k)} />
                  {sectionLabels[k]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{tc("cancel")}</Button>
            <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
              <Download className="h-4 w-4" /> {t("farms.print.modal.downloadPdf")}
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> {tc("print")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
