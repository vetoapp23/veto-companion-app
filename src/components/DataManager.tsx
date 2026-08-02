import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Download, Upload, RotateCcw, Database, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getBcp47Locale } from "@/i18n/useAppLocale";

export function DataManager() {
  const { t, i18n } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { 
    clients, 
    pets, 
    consultations, 
    appointments, 
    prescriptions, 
    farms, 

    farmInterventions,
    resetData, 
    exportData, 
    importData 
  } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const totalRecords = clients.length + pets.length + consultations.length + appointments.length + prescriptions.length + farms.length + farmInterventions.length;
  
  const estimatedDataSize = Math.round(totalRecords * 0.5); // KB
  
  const allDates = [
    ...clients.map(c => c.lastVisit),
    ...pets.map(p => p.lastVisit).filter(Boolean),
    ...consultations.map(c => c.date),
    ...appointments.map(a => a.date),
    ...prescriptions.map(p => p.date),
    ...farms.map(f => f.lastVisit),

  ].filter(Boolean);
  
  const lastModification = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => new Date(d).getTime()))) : new Date();
  
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const newRecordsToday = [
    ...clients.filter(c => c.lastVisit === today),
    ...pets.filter(p => p.lastVisit === today),
    ...consultations.filter(c => c.date === today),
    ...appointments.filter(a => a.date === today)
  ].length;
  
  const newRecordsThisMonth = [
    ...clients.filter(c => {
      const date = new Date(c.lastVisit);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...pets.filter(p => {
      if (!p.lastVisit) return false;
      const date = new Date(p.lastVisit);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...consultations.filter(c => {
      const date = new Date(c.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...appointments.filter(a => {
      const date = new Date(a.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    })
  ].length;

  const handleExport = () => {
    try {
      exportData();
      toast({
        title: t("dataManager.exportedTitle"),
        description: t("dataManager.exportedBody", { count: totalRecords }),
      });
    } catch (error) {
      toast({
        title: t("dataManager.exportErrorTitle"),
        description: t("dataManager.exportErrorBody"),
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.clients && data.pets) {
          importData(data);
          toast({
            title: t("dataManager.importedTitle"),
            description: t("dataManager.importedBody", {
              clients: data.clients.length,
              pets: data.pets.length,
              consultations: data.consultations?.length || 0,
            }),
          });
        } else {
          throw new Error("invalid");
        }
      } catch (error) {
        toast({
          title: t("dataManager.importErrorTitle"),
          description: t("dataManager.importErrorBody"),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    setShowImportDialog(false);
  };

  const handleReset = () => {
    try {
      resetData();
      toast({
        title: t("dataManager.resetDoneTitle"),
        description: t("dataManager.resetDoneBody"),
      });
      setShowResetDialog(false);
    } catch (error) {
      toast({
        title: t("dataManager.resetErrorTitle"),
        description: t("dataManager.resetErrorBody"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("dataManager.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t("dataManager.total")}</span>
                <span className="text-muted-foreground">{tc("recordsCount", { count: totalRecords })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t("dataManager.size")}</span>
                <span className="text-muted-foreground">~{estimatedDataSize} KB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t("dataManager.lastMod")}</span>
                <span className="text-muted-foreground">{lastModification.toLocaleDateString(getBcp47Locale(i18n.language))}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">{t("dataManager.today")}</span>
                <span className="text-muted-foreground">{newRecordsToday}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{t("dataManager.thisMonth")}</span>
                <span className="text-muted-foreground">{newRecordsThisMonth}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">{t("dataManager.clinic")}</span>
                <span className="text-muted-foreground">{settings.clinicName || tc("notConfigured")}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-medium text-blue-700">{clients.length}</div>
              <div className="text-blue-600">{t("dataManager.clients")}</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-medium text-red-700">{pets.length}</div>
              <div className="text-red-600">{t("dataManager.pets")}</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-medium text-green-700">{consultations.length}</div>
              <div className="text-green-600">{t("dataManager.consultations")}</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="font-medium text-purple-700">{appointments.length}</div>
              <div className="text-purple-600">{t("dataManager.appointments")}</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-medium text-orange-700">{prescriptions.length}</div>
              <div className="text-orange-600">{t("dataManager.prescriptions")}</div>
            </div>
            <div className="text-center p-2 bg-indigo-50 rounded">
              <div className="font-medium text-indigo-700">{farms.length}</div>
              <div className="text-indigo-600">{t("dataManager.farms")}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              {t("dataManager.export")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              {t("dataManager.import")}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowResetDialog(true)} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {t("dataManager.reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t("dataManager.resetTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("dataManager.resetBody")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              {t("dataManager.reset")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t("dataManager.importTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("dataManager.importBody")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              <strong>{t("dataManager.importNote")}</strong> {t("dataManager.importWarning")}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              {tc("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
