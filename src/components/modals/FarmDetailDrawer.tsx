// @ts-nocheck
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Activity, Stethoscope, Users2, MapPin, Phone, Mail, Tractor, Calendar, Building2, Image as ImageIcon } from "lucide-react";
import { useFarmBatches, useDeleteFarmBatch, useFarmHealthEvents, useDeleteFarmHealthEvent } from "@/hooks/useFarmBatches";
import { useFarmInfrastructures, useDeleteFarmInfrastructure } from "@/hooks/useFarmInfrastructures";
import { useFarmInterventionsByFarm } from "@/hooks/useDatabase";
import BatchEditorDialog from "@/components/forms/BatchEditorDialog";
import FarmInfrastructureDialog from "@/components/forms/FarmInfrastructureDialog";
import NewFarmInterventionModalSupabase from "@/components/forms/NewFarmInterventionModalSupabase";
import { getFarmTypeConfig } from "@/lib/farmTypeConfig";
import { formatDate } from "@/lib/utils";

interface FarmDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: any | null;
  onEdit?: (farm: any) => void;
}

const FarmDetailDrawer = ({ open, onOpenChange, farm, onEdit }: FarmDetailDrawerProps) => {
  const [batchOpen, setBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [infraOpen, setInfraOpen] = useState(false);
  const [editingInfra, setEditingInfra] = useState<any>(null);

  const { data: batches = [] } = useFarmBatches(farm?.id);
  const { data: events = [] } = useFarmHealthEvents(farm?.id);
  const { data: interventions = [] } = useFarmInterventionsByFarm(farm?.id || "");
  const { data: infrastructures = [] } = useFarmInfrastructures(farm?.id);
  const delBatch = useDeleteFarmBatch();
  const delEvent = useDeleteFarmHealthEvent();
  const delInfra = useDeleteFarmInfrastructure();

  if (!farm) return null;
  const farmTypes: string[] = (farm.farm_types && farm.farm_types.length > 0)
    ? farm.farm_types
    : (farm.farm_type ? [farm.farm_type] : []);
  const config = getFarmTypeConfig(farm.farm_type || farmTypes[0]);
  const totalBatchAnimals = batches.reduce((s, b) => s + (b.animal_count || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tractor className="h-5 w-5 text-primary" />
            {farm.farm_name}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap gap-2 items-center">
            {farm.farm_type && <Badge variant="secondary">{farm.farm_type}</Badge>}
            {farm.production_type && <Badge variant="outline">{farm.production_type}</Badge>}
            {farm.active ? <Badge>Actif</Badge> : <Badge variant="destructive">Inactif</Badge>}
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => onEdit?.(farm)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button size="sm" onClick={() => setInterventionOpen(true)}>
            <Stethoscope className="h-4 w-4 mr-2" /> Nouvelle intervention
          </Button>
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="batches">Lots ({batches.length})</TabsTrigger>
            <TabsTrigger value="interventions">Interventions ({interventions.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline ({events.length})</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiBlock label={config.herdLabel} value={farm.herd_size ?? totalBatchAnimals ?? "—"} />
              <KpiBlock label="Cheptel en lots" value={totalBatchAnimals} />
              <KpiBlock label="Interventions" value={interventions.length} />
              <KpiBlock label="Surface (ha)" value={farm.surface_hectares ?? "—"} />
            </div>

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
        </Tabs>

        <BatchEditorDialog
          open={batchOpen}
          onOpenChange={setBatchOpen}
          farmId={farm.id}
          farmType={farm.farm_type}
          batch={editingBatch}
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
