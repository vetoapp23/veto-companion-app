// @ts-nocheck
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Activity, Stethoscope, Users2, MapPin, Phone, Mail, Tractor, Calendar, Building2, Printer, Download } from "lucide-react";
import { useFarmBatches, useDeleteFarmBatch, useFarmHealthEvents, useDeleteFarmHealthEvent } from "@/hooks/useFarmBatches";
import { useFarmInfrastructures, useDeleteFarmInfrastructure } from "@/hooks/useFarmInfrastructures";
import { useFarmInterventionsByFarm, useDeleteFarmIntervention, useClients } from "@/hooks/useDatabase";
import BatchEditorDialog from "@/components/forms/BatchEditorDialog";
import FarmInfrastructureDialog from "@/components/forms/FarmInfrastructureDialog";
import NewFarmInterventionModalSupabase from "@/components/forms/NewFarmInterventionModalSupabase";
import { getFarmTypeConfig } from "@/lib/farmTypeConfig";
import { formatDate } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildFarmReportHtml, printHtml, downloadHtmlAsPdf } from "@/lib/farmReport";
import { useToast } from "@/hooks/use-toast";

interface FarmDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: any | null;
  onEdit?: (farm: any) => void;
}

const FarmDetailDrawer = ({ open, onOpenChange, farm, onEdit }: FarmDetailDrawerProps) => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const [batchOpen, setBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<any>(null);
  const [infraOpen, setInfraOpen] = useState(false);
  const [editingInfra, setEditingInfra] = useState<any>(null);

  const { data: batches = [] } = useFarmBatches(farm?.id);
  const { data: events = [] } = useFarmHealthEvents(farm?.id);
  const { data: interventions = [] } = useFarmInterventionsByFarm(farm?.id || "");
  const { data: infrastructures = [] } = useFarmInfrastructures(farm?.id);
  const { data: clients = [] } = useClients();
  const delBatch = useDeleteFarmBatch();
  const delEvent = useDeleteFarmHealthEvent();
  const delInfra = useDeleteFarmInfrastructure();
  const delIntervention = useDeleteFarmIntervention();

  const activeBatches = useMemo(() => batches.filter((b: any) => (b.status || "active") === "active"), [batches]);
  const totalActiveAnimals = activeBatches.reduce((s, b) => s + (b.animal_count || 0), 0);
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    activeBatches.forEach((b: any) => {
      const k = b.category || b.species || "Non catégorisé";
      m[k] = (m[k] || 0) + (b.animal_count || 0);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [activeBatches]);

  if (!farm) return null;
  const farmTypes: string[] = (farm.farm_types && farm.farm_types.length > 0)
    ? farm.farm_types
    : (farm.farm_type ? [farm.farm_type] : []);
  const config = getFarmTypeConfig(farm.farm_type || farmTypes[0]);

  const owner = clients.find((c: any) => c.id === farm.client_id);
  const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : undefined;

  const buildReport = () => buildFarmReportHtml({
    farm, ownerName, batches, infrastructures, interventions, events,
    clinic: {
      clinicName: settings.clinicName, address: settings.address,
      phone: settings.phone, email: settings.email, logo: settings.logo,
    },
    isFree,
  });

  const handlePrintReport = async () => { await printHtml(buildReport()); };
  const handleDownloadReport = async () => {
    try {
      await downloadHtmlAsPdf(buildReport(), `Rapport-${farm.farm_name}-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e: any) {
      toast({ title: "Erreur PDF", description: e.message, variant: "destructive" });
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tractor className="h-5 w-5 text-primary" />
            {farm.farm_name}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap gap-2 items-center">
            {farmTypes.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            {farm.production_type && <Badge variant="outline">{farm.production_type}</Badge>}
            {farm.active ? <Badge>Actif</Badge> : <Badge variant="destructive">Inactif</Badge>}
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button size="sm" onClick={() => onEdit?.(farm)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button size="sm" onClick={() => { setEditingIntervention(null); setInterventionOpen(true); }}>
            <Stethoscope className="h-4 w-4 mr-2" /> Nouvelle intervention
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrintReport}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer rapport
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Vue</TabsTrigger>
            <TabsTrigger value="batches">Lots ({activeBatches.length}/{batches.length})</TabsTrigger>
            <TabsTrigger value="infra">Infra ({infrastructures.length})</TabsTrigger>
            <TabsTrigger value="interventions">Inter. ({interventions.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline ({events.length})</TabsTrigger>
            <TabsTrigger value="photos">Photos ({(farm.photos || []).length})</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiBlock label="Cheptel actif" value={totalActiveAnimals} />
              <KpiBlock label="Lots actifs" value={activeBatches.length} />
              <KpiBlock label="Interventions" value={interventions.length} />
              <KpiBlock label="Surface (ha)" value={farm.surface_hectares ?? "—"} />
            </div>

            {byCategory.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-2">Répartition par catégorie (lots actifs)</div>
                  <div className="space-y-1.5">
                    {byCategory.map(([k, v]) => {
                      const pct = totalActiveAnimals ? Math.round((v / totalActiveAnimals) * 100) : 0;
                      return (
                        <div key={k} className="flex items-center gap-3">
                          <div className="text-sm w-40 truncate">{k}</div>
                          <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs text-muted-foreground w-20 text-right">{v} ({pct}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4 space-y-2 text-sm">
                {farm.address && <Info icon={<MapPin className="h-4 w-4" />} text={farm.address} />}
                {farm.coordinates && <Info icon={<MapPin className="h-4 w-4" />} text={`GPS: ${farm.coordinates}`} />}
                {farm.phone && <Info icon={<Phone className="h-4 w-4" />} text={farm.phone} />}
                {farm.email && <Info icon={<Mail className="h-4 w-4" />} text={farm.email} />}
                {farm.housing_type && <Info icon={<Tractor className="h-4 w-4" />} text={`Logement: ${farm.housing_type}`} />}
                {farm.registration_number && <Info icon={<Users2 className="h-4 w-4" />} text={`N° ${farm.registration_number}`} />}
                {farm.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {farm.certifications.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}
                  </div>
                )}
                {farm.notes && <p className="pt-2 text-muted-foreground whitespace-pre-wrap">{farm.notes}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BATCHES */}
          <TabsContent value="batches" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setEditingBatch(null); setBatchOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Ajouter un lot
              </Button>
            </div>
            {batches.length === 0 && <EmptyState text="Aucun lot. Créez votre premier lot/troupeau." />}
            {batches.map((b) => (
              <Card key={b.id}>
                <CardContent className="pt-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {b.name}
                      <Badge variant="secondary">{b.animal_count} animaux</Badge>
                      {b.status !== "active" && <Badge variant="outline">{b.status}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      {b.category && <span>{b.category}</span>}
                      {b.species && <span>· {b.species}</span>}
                      {b.location && <span>· {b.location}</span>}
                      {b.birth_period && <span>· {b.birth_period}</span>}
                    </div>
                    {b.notes && <p className="text-xs text-muted-foreground">{b.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingBatch(b); setBatchOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => confirm("Supprimer ce lot ?") && delBatch.mutate(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* INTERVENTIONS */}
          <TabsContent value="interventions" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setInterventionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle intervention
              </Button>
            </div>
            {interventions.length === 0 && <EmptyState text="Aucune intervention enregistrée." />}
            {interventions.map((i: any) => (
              <Card key={i.id}>
                <CardContent className="pt-4 space-y-1">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" /> {i.intervention_type}
                        {i.protocol_type && <Badge variant="outline">{i.protocol_type}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3">
                        <Calendar className="h-3 w-3 inline" /> {formatDate(i.intervention_date)}
                        {i.animal_count && <span>· {i.animal_count} animaux</span>}
                        {i.cost && <span>· {i.cost} MAD</span>}
                      </div>
                    </div>
                  </div>
                  {i.description && <p className="text-sm">{i.description}</p>}
                  {i.diagnosis && <p className="text-sm"><b>Diagnostic:</b> {i.diagnosis}</p>}
                  {i.treatment && <p className="text-sm"><b>Traitement:</b> {i.treatment}</p>}
                  {i.medications_used?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {i.medications_used.map((m: string) => <Badge key={m} variant="secondary">{m}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* TIMELINE health events */}
          <TabsContent value="timeline" className="space-y-3">
            {events.length === 0 && <EmptyState text="Aucun évènement sanitaire enregistré." />}
            {events.map((e) => (
              <Card key={e.id}>
                <CardContent className="pt-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" /> {e.event_type}
                      {e.product && <Badge variant="secondary">{e.product}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(e.event_date)}
                      {e.affected_count && ` · ${e.affected_count} animaux`}
                      {e.dose && ` · ${e.dose}`}
                    </div>
                    {e.notes && <p className="text-sm">{e.notes}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Supprimer ?") && delEvent.mutate(e.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* INFRASTRUCTURES */}
          <TabsContent value="infra" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setEditingInfra(null); setInfraOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Ajouter une infrastructure
              </Button>
            </div>
            {infrastructures.length === 0 && <EmptyState text="Aucune infrastructure. Ajoutez écuries, poulaillers, bassins…" />}
            {infrastructures.map((inf: any) => (
              <Card key={inf.id}>
                <CardContent className="pt-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> {inf.name}
                      <Badge variant="secondary">{inf.infra_type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      {typeof inf.capacity === "number" && <span>Capacité : {inf.capacity}</span>}
                      {typeof inf.surface_sqm === "number" && <span>· {inf.surface_sqm} m²</span>}
                      {inf.location && <span>· {inf.location}</span>}
                    </div>
                    {inf.notes && <p className="text-xs">{inf.notes}</p>}
                    {inf.photos?.length > 0 && (
                      <div className="flex gap-1 flex-wrap pt-1">
                        {inf.photos.slice(0, 4).map((src: string, i: number) => (
                          <img key={i} src={src} alt="" className="h-14 w-14 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingInfra(inf); setInfraOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => confirm("Supprimer ?") && delInfra.mutate(inf.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* PHOTOS */}
          <TabsContent value="photos" className="space-y-3">
            {(!farm.photos || farm.photos.length === 0) && (
              <EmptyState text="Aucune photo. Utilisez « Modifier » pour ajouter des photos à l'exploitation." />
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(farm.photos || []).map((src: string, i: number) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="block">
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-40 object-cover rounded border hover:opacity-90" />
                </a>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <BatchEditorDialog
          open={batchOpen}
          onOpenChange={setBatchOpen}
          farmId={farm.id}
          farmType={farm.farm_type}
          farmTypes={farmTypes}
          batch={editingBatch}
        />
        <FarmInfrastructureDialog
          open={infraOpen}
          onOpenChange={setInfraOpen}
          farmId={farm.id}
          infra={editingInfra}
        />
        <NewFarmInterventionModalSupabase
          open={interventionOpen}
          onOpenChange={setInterventionOpen}
          farmId={farm.id}
          farmName={farm.farm_name}
        />
      </SheetContent>
    </Sheet>
  );
};

const KpiBlock = ({ label, value }: { label: string; value: any }) => (
  <Card>
    <CardContent className="pt-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </CardContent>
  </Card>
);
const Info = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">{icon}<span>{text}</span></div>
);
const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-md">{text}</div>
);

export default FarmDetailDrawer;
