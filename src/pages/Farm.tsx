// @ts-nocheck
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Tractor, Users2, Stethoscope, MapPin, Phone, Eye, Pencil, Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFarms, useDeleteFarm, useFarmInterventions, useClients } from "@/hooks/useDatabase";
import { useFarmManagementSettings } from "@/hooks/useAppSettings";
import NewFarmModal from "@/components/forms/NewFarmModal";
import NewFarmInterventionModalSupabase from "@/components/forms/NewFarmInterventionModalSupabase";
import FarmDetailDrawer from "@/components/modals/FarmDetailDrawer";

const FarmPage = () => {
  const { toast } = useToast();
  const { data: farms = [], isLoading } = useFarms();
  const { data: clients = [] } = useClients();
  const { data: allInterventions = [] } = useFarmInterventions();
  const { data: farmSettings } = useFarmManagementSettings();
  const deleteFarm = useDeleteFarm();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [newFarmOpen, setNewFarmOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [detailFarm, setDetailFarm] = useState<any>(null);
  const [interventionOpen, setInterventionOpen] = useState(false);

  const farmTypes = useMemo(() => {
    const s = new Set<string>(farmSettings?.farm_types || []);
    farms.forEach((f: any) => {
      (f.farm_types || []).forEach((t: string) => t && s.add(t));
      if (f.farm_type) s.add(f.farm_type);
    });
    return Array.from(s);
  }, [farmSettings, farms]);

  const filtered = useMemo(() => {
    return farms.filter((f: any) => {
      if (typeFilter !== "all" && f.farm_type !== typeFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.farm_name?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q) ||
        f.registration_number?.toLowerCase().includes(q)
      );
    });
  }, [farms, search, typeFilter]);

  const kpis = useMemo(() => {
    const totalHerd = farms.reduce((s: number, f: any) => s + (f.herd_size || 0), 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const thisMonth = allInterventions.filter((i: any) => new Date(i.intervention_date) >= monthStart).length;
    return { totalFarms: farms.length, totalHerd, monthlyInterventions: thisMonth };
  }, [farms, allInterventions]);

  const clientName = (id: string) => {
    const c = clients.find((x: any) => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : "—";
  };

  const onDelete = async (farm: any) => {
    if (!confirm(`Supprimer l'exploitation « ${farm.farm_name} » ?`)) return;
    try {
      await deleteFarm.mutateAsync(farm.id);
      toast({ title: "✓ Exploitation supprimée" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de fermes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pilotez exploitations, lots, interventions et suivi sanitaire collectif.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setInterventionOpen(true)}>
            <Stethoscope className="h-4 w-4 mr-2" /> Intervention
          </Button>
          <Button onClick={() => { setEditingFarm(null); setNewFarmOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle exploitation
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={<Tractor className="h-5 w-5" />} label="Exploitations" value={kpis.totalFarms} />
        <Kpi icon={<Users2 className="h-5 w-5" />} label="Cheptel total" value={kpis.totalHerd} />
        <Kpi icon={<Stethoscope className="h-5 w-5" />} label="Interventions ce mois" value={kpis.monthlyInterventions} />
        <Kpi icon={<MapPin className="h-5 w-5" />} label="Types d'élevage" value={farmTypes.length} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher une exploitation…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tous les types</option>
            {farmTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Aucune exploitation. Créez votre première exploitation pour commencer.
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((f: any) => (
            <Card key={f.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <Tractor className="h-4 w-4 text-primary" /> {f.farm_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{clientName(f.client_id)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDetailFarm(f)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingFarm(f); setNewFarmOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(f)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {f.farm_type && <Badge variant="secondary">{f.farm_type}</Badge>}
                  {f.production_type && <Badge variant="outline">{f.production_type}</Badge>}
                  {f.housing_type && <Badge variant="outline">{f.housing_type}</Badge>}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {f.address && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{f.address}</div>}
                  {f.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{f.phone}</div>}
                  <div className="flex gap-3 pt-1">
                    {typeof f.herd_size === "number" && <span><b>{f.herd_size}</b> animaux</span>}
                    {typeof f.surface_hectares === "number" && <span><b>{f.surface_hectares}</b> ha</span>}
                  </div>
                </div>
                {f.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {f.certifications.slice(0, 3).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <NewFarmModal open={newFarmOpen} onOpenChange={setNewFarmOpen} farm={editingFarm} />
      <NewFarmInterventionModalSupabase open={interventionOpen} onOpenChange={setInterventionOpen} />
      <FarmDetailDrawer
        open={!!detailFarm}
        onOpenChange={(o) => !o && setDetailFarm(null)}
        farm={detailFarm}
        onEdit={(f) => { setDetailFarm(null); setEditingFarm(f); setNewFarmOpen(true); }}
      />
    </div>
  );
};

const Kpi = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => (
  <Card>
    <CardContent className="pt-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </CardContent>
  </Card>
);

export default FarmPage;
