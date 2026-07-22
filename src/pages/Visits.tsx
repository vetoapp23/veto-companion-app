import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppPageHeader } from "@/components/AppPageHeader";
import { useVisits, useCreateVisit } from "@/hooks/useVisits";
import { useClients, useAnimals, useFarmsByClient } from "@/hooks/useDatabase";
import { VISIT_STATUS_LABELS, getServiceDef } from "@/lib/visitCatalog";
import { ClipboardList, Plus, Search, Stethoscope, ArrowRight, Tractor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function isFarmClient(clientType?: string | null) {
  if (!clientType) return false;
  const t = clientType
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return t.includes("eleveur") || t.includes("ferme") || t.includes("farm");
}

export default function Visits() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: visits = [], isLoading } = useVisits(
    statusFilter === "all" ? undefined : (statusFilter as any)
  );
  const createVisit = useCreateVisit();
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();

  const [showNew, setShowNew] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newAnimalId, setNewAnimalId] = useState("");
  const [newFarmId, setNewFarmId] = useState("");
  const [billingMode, setBillingMode] = useState<"forfait" | "per_head">("forfait");
  const [headCount, setHeadCount] = useState("");
  const [forceFarmMode, setForceFarmMode] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === newClientId),
    [clients, newClientId]
  );
  const farmMode = forceFarmMode || isFarmClient(selectedClient?.client_type);

  const { data: clientFarms = [] } = useFarmsByClient(farmMode ? newClientId : "");

  const clientAnimals = useMemo(
    () => animals.filter((a) => a.client_id === newClientId),
    [animals, newClientId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter((v) => {
      const name = `${v.client?.first_name || ""} ${v.client?.last_name || ""}`.toLowerCase();
      const pet = (v.animal?.name || "").toLowerCase();
      const farm = (v.farm?.farm_name || "").toLowerCase();
      return (
        name.includes(q) ||
        pet.includes(q) ||
        farm.includes(q) ||
        (v.reason || "").toLowerCase().includes(q)
      );
    });
  }, [visits, search]);

  const resetNewForm = () => {
    setNewClientId("");
    setNewAnimalId("");
    setNewFarmId("");
    setBillingMode("forfait");
    setHeadCount("");
    setForceFarmMode(false);
  };

  const startWalkIn = async () => {
    if (!newClientId) {
      toast({ title: "Client requis", variant: "destructive" });
      return;
    }
    if (farmMode && !newFarmId) {
      toast({
        title: "Exploitation requise",
        description: "Sélectionnez une ferme pour une visite d'élevage.",
        variant: "destructive",
      });
      return;
    }
    try {
      const def = getServiceDef(farmMode ? "farm_visit" : "consultation")!;
      const heads = headCount ? parseInt(headCount, 10) : undefined;
      const visit = await createVisit.mutateAsync({
        client_id: newClientId,
        animal_id: newAnimalId || null,
        reason: farmMode ? "Visite d'élevage" : "Visite sans RDV",
        context: farmMode ? "farm" : "companion",
        farm_id: farmMode ? newFarmId : null,
        billing_mode: farmMode ? billingMode : null,
        head_count: farmMode ? heads || null : null,
        initial_service: {
          service_code: def.code,
          service_label: def.label,
          amount: def.defaultAmount,
        },
      });
      setShowNew(false);
      resetNewForm();
      navigate(`/visites/${visit.id}`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-4">
      <AppPageHeader
        eyebrow="Parcours clinique"
        title="Visites"
        description="Une visite regroupe une ou plusieurs prestations (consultation, vaccin, élevage…) avant facturation."
        icon={ClipboardList}
        actions={
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle visite
          </Button>
        }
      />

      <Card>
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Client, animal, ferme, motif…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground space-y-3">
            <Stethoscope className="h-10 w-10 mx-auto opacity-40" />
            <p>Aucune visite pour le moment</p>
            <p className="text-sm">Lancez une visite depuis un RDV, ou créez une visite walk-in.</p>
            <Button variant="outline" onClick={() => setShowNew(true)}>
              Démarrer une visite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((visit) => {
            const doneCount = (visit.services || []).filter((s) => s.status === "done").length;
            const total = visit.services?.length || 0;
            return (
              <Card key={visit.id} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {visit.client?.first_name} {visit.client?.last_name}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        {visit.context === "farm"
                          ? visit.farm?.farm_name || "Exploitation"
                          : visit.animal?.name || "Sans animal"}
                      </span>
                      {visit.context === "farm" && (
                        <Badge variant="outline" className="gap-1">
                          <Tractor className="h-3 w-3" />
                          Élevage
                        </Badge>
                      )}
                      <Badge variant={visit.status === "in_progress" ? "default" : "secondary"}>
                        {VISIT_STATUS_LABELS[visit.status] || visit.status}
                      </Badge>
                      {visit.invoiced && <Badge variant="outline">Facturée</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.visit_date).toLocaleString("fr-FR")}
                      {visit.reason ? ` — ${visit.reason}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doneCount}/{total} prestation{total > 1 ? "s" : ""} ·{" "}
                      {Number(visit.total_amount || 0).toFixed(0)} MAD
                    </p>
                  </div>
                  <Button asChild className="gap-2 shrink-0">
                    <Link to={`/visites/${visit.id}`}>
                      Ouvrir
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={showNew}
        onOpenChange={(open) => {
          setShowNew(open);
          if (!open) resetNewForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle visite (sans RDV)</DialogTitle>
            <DialogDescription>
              Client particulier ou éleveur — vous pourrez ajouter plusieurs prestations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={newClientId}
                onValueChange={(v) => {
                  setNewClientId(v);
                  setNewAnimalId("");
                  setNewFarmId("");
                  setForceFarmMode(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                      {isFarmClient(c.client_type) ? " · Éleveur" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newClientId && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={farmMode ? "default" : "outline"}
                  className="gap-1"
                  onClick={() => setForceFarmMode(true)}
                >
                  <Tractor className="h-3.5 w-3.5" />
                  Visite ferme
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!farmMode ? "default" : "outline"}
                  onClick={() => {
                    setForceFarmMode(false);
                    setNewFarmId("");
                  }}
                >
                  Animal de compagnie
                </Button>
              </div>
            )}

            {farmMode ? (
              <>
                <div className="space-y-2">
                  <Label>Exploitation *</Label>
                  <Select value={newFarmId} onValueChange={setNewFarmId} disabled={!newClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ferme" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientFarms.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.farm_name}
                          {f.herd_size != null ? ` (${f.herd_size})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newClientId && clientFarms.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Aucune exploitation pour ce client — créez-en une dans Fermes.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Facturation</Label>
                    <Select
                      value={billingMode}
                      onValueChange={(v) => setBillingMode(v as "forfait" | "per_head")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forfait">Forfait</SelectItem>
                        <SelectItem value="per_head">À la tête</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effectif</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="ex. 50"
                      value={headCount}
                      onChange={(e) => setHeadCount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Animal (optionnel)</Label>
                  <Select
                    value={newAnimalId || "__none__"}
                    onValueChange={(v) => setNewAnimalId(v === "__none__" ? "" : v)}
                    disabled={!newClientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun</SelectItem>
                      {clientAnimals.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Animal (recommandé)</Label>
                <Select
                  value={newAnimalId || "__none__"}
                  onValueChange={(v) => setNewAnimalId(v === "__none__" ? "" : v)}
                  disabled={!newClientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un animal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun</SelectItem>
                    {clientAnimals.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>
                Annuler
              </Button>
              <Button onClick={startWalkIn} disabled={createVisit.isPending}>
                Démarrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
