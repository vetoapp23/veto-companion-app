import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, FileText, Download } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useFarmBatches, useFarmHealthEvents } from "@/hooks/useFarmBatches";
import { useFarmInfrastructures } from "@/hooks/useFarmInfrastructures";
import { useFarmInterventionsByFarm, useClients } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import {
  buildFarmReportHtml,
  printHtml,
  downloadHtmlAsPdf,
  FARM_SECTION_LABELS,
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

  const applyTemplate = (t: FarmTemplate) => {
    setTemplate(t);
    setSections(FARM_TEMPLATES[t]);
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

  const handlePrint = async () => {
    const html = buildHtml();
    if (!html) return;
    await printHtml(html);
  };

  const handleDownloadPdf = async () => {
    const html = buildHtml();
    if (!html || !farm) return;
    try {
      await downloadHtmlAsPdf(
        html,
        `Rapport-${farm.farm_name}-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (e: any) {
      toast({
        title: "Erreur PDF",
        description: e?.message || "Impossible de générer le PDF.",
        variant: "destructive",
      });
    }
  };

  if (!farm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Imprimer le rapport d'exploitation
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le modèle puis les sections à inclure pour {farm.farm_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Modèle</Label>
              <Select value={template} onValueChange={(v) => applyTemplate(v as FarmTemplate)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Rapport complet</SelectItem>
                  <SelectItem value="summary">Résumé</SelectItem>
                  <SelectItem value="sanitary">Suivi sanitaire</SelectItem>
                  <SelectItem value="inventory">Inventaire / cheptel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Du</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Au</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            La période filtre les interventions et évènements sanitaires.
          </p>

          <div>
            <Label className="mb-2 block">Sections à inclure</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {(Object.keys(FARM_SECTION_LABELS) as FarmSectionKey[]).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sections[k]} onCheckedChange={() => toggle(k)} />
                  {FARM_SECTION_LABELS[k]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
              <Download className="h-4 w-4" /> Télécharger PDF
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Imprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
