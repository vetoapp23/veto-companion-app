import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppPageHeader } from "@/components/AppPageHeader";
import { useVisits, useCreateVisit } from "@/hooks/useVisits";
import { useClients, useAnimals, useFarmsByClient, type Client } from "@/hooks/useDatabase";
import {
  getServiceDef,
  getVisitServiceLabel,
  getVisitStatusLabel,
  resolveServiceAmount,
} from "@/lib/visitCatalog";
import { ClipboardList, Plus, Search, Stethoscope, ArrowRight, Tractor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { ListDateFilter, DEFAULT_LIST_DATE_FILTER } from "@/components/ListDateFilter";
import { matchesListDateFilter, type ListDateFilterState } from "@/lib/dateLocal";
import { useWriteAccess } from "@/components/RoleGuard";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";

function isFarmClient(clientType?: string | null) {
  if (!clientType) return false;
  const t = clientType
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return t.includes("eleveur") || t.includes("ferme") || t.includes("farm");
}

export default function Visits() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { t: tm } = useTranslation("medical");
  const { bcp47 } = useAppLocale();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_visits");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<ListDateFilterState>(DEFAULT_LIST_DATE_FILTER);
  const { data: visits = [], isLoading } = useVisits(
    statusFilter === "all" ? undefined : (statusFilter as any)
  );
  const createVisit = useCreateVisit();
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();

  const [showNew, setShowNew] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
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
    return visits.filter((v) => {
      if (!matchesListDateFilter(v.visit_date, dateFilter)) return false;
      if (!q) return true;
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
  }, [visits, search, dateFilter]);

  const resetNewForm = () => {
    setNewClientId("");
    setNewAnimalId("");
    setNewFarmId("");
    setBillingMode("forfait");
    setHeadCount("");
    setForceFarmMode(false);
  };

  const handleClientCreated = (client: Client) => {
    setNewClientId(client.id);
    setNewAnimalId("");
    setNewFarmId("");
    setForceFarmMode(isFarmClient(client.client_type));
    toast({
      title: t("visits.newClient"),
      description: t("visits.selectedForVisit", {
        name: `${client.first_name} ${client.last_name}`,
      }),
    });
  };

  const handlePetCreated = (animal: { id: string }) => {
    setNewAnimalId(animal.id);
  };

  const startWalkIn = async () => {
    if (!guardWrite()) return;
    if (!newClientId) {
      toast({ title: t("visits.clientRequired"), variant: "destructive" });
      return;
    }
    if (farmMode && !newFarmId) {
      toast({
        title: t("visits.farmRequiredTitle"),
        description: t("visits.farmRequiredBody"),
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
        reason: farmMode ? t("visits.farmVisitReason") : t("visits.walkInReason"),
        context: farmMode ? "farm" : "companion",
        farm_id: farmMode ? newFarmId : null,
        billing_mode: farmMode ? billingMode : null,
        head_count: farmMode ? heads || null : null,
        initial_service: {
          service_code: def.code,
          service_label: getVisitServiceLabel(def, tm),
          amount: resolveServiceAmount(def.code, settings.servicePrices),
        },
      });
      setShowNew(false);
      resetNewForm();
      navigate(`/visites/${visit.id}`);
    } catch (e: any) {
      toast({ title: tc("error"), description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-4">
      <AppPageHeader
        eyebrow={t("visits.clinicalJourney")}
        title={t("visits.title")}
        description={t("visits.description")}
        icon={ClipboardList}
        actions={
          canWrite ? (
            <Button onClick={() => setShowNew(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("visits.new")}
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("visits.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t("visits.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc("all")}</SelectItem>
                <SelectItem value="in_progress">{tc("inProgress")}</SelectItem>
                <SelectItem value="completed">{tc("completed")}</SelectItem>
                <SelectItem value="cancelled">{tc("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ListDateFilter
            value={dateFilter}
            onChange={setDateFilter}
            idPrefix="visits-date"
            compact
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground space-y-3">
            <Stethoscope className="h-10 w-10 mx-auto opacity-40" />
            <p>{t("visits.empty")}</p>
            <p className="text-sm">{t("visits.emptyHint")}</p>
            {canWrite && (
              <Button variant="outline" onClick={() => setShowNew(true)}>
                {t("visits.new")}
              </Button>
            )}
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
                          ? visit.farm?.farm_name || t("visits.farm")
                          : visit.animal?.name || tc("none")}
                      </span>
                      {visit.context === "farm" && (
                        <Badge variant="outline" className="gap-1">
                          <Tractor className="h-3 w-3" />
                          {t("visits.farm")}
                        </Badge>
                      )}
                      <Badge variant={visit.status === "in_progress" ? "default" : "secondary"}>
                        {getVisitStatusLabel(visit.status, tm)}
                      </Badge>
                      {visit.invoiced && <Badge variant="outline">{t("visits.billed")}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.visit_date).toLocaleString(bcp47)}
                      {visit.reason ? ` — ${visit.reason}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doneCount}/{total} prestation{total > 1 ? "s" : ""} ·{" "}
                      {Number(visit.total_amount || 0).toFixed(0)} MAD
                    </p>
                  </div>
                  <Button asChild className="gap-2 shrink-0">
                    <Link to={`/visites/${visit.id}`}>
                      {tc("open")}
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
            <DialogTitle>{t("visits.new")}</DialogTitle>
            <DialogDescription>
              Client particulier ou éleveur — vous pourrez ajouter plusieurs prestations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{tc("client")} *</Label>
              <div className="flex gap-2">
                <Select
                  value={newClientId}
                  onValueChange={(v) => {
                    setNewClientId(v);
                    setNewAnimalId("");
                    setNewFarmId("");
                    setForceFarmMode(false);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("visits.selectClient")} />
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
                {canWrite && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowClientModal(true)}
                    title={t("visits.newClient")}
                    aria-label="Ajouter un nouveau client"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {canWrite && (
                <p className="text-xs text-muted-foreground">
                  Client absent ? Cliquez sur + pour l&apos;enregistrer en base.
                </p>
              )}
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
                  {t("visits.farm")}
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
                  {tc("pet")}
                </Button>
              </div>
            )}

            {farmMode ? (
              <>
                <div className="space-y-2">
                  <Label>{t("visits.farmLabel")} *</Label>
                  <Select value={newFarmId} onValueChange={setNewFarmId} disabled={!newClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("visits.selectFarm")} />
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
                    <Label>{tc("invoice")}</Label>
                    <Select
                      value={billingMode}
                      onValueChange={(v) => setBillingMode(v as "forfait" | "per_head")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forfait">{t("visits.billingModes.package")}</SelectItem>
                        <SelectItem value="per_head">{t("visits.billingModes.perHead")}</SelectItem>
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
                  <Label>{tc("animal")} ({tc("optional").toLowerCase()})</Label>
                  <Select
                    value={newAnimalId || "__none__"}
                    onValueChange={(v) => setNewAnimalId(v === "__none__" ? "" : v)}
                    disabled={!newClientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tc("none")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{tc("none")}</SelectItem>
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
                <Label>{tc("animal")} ({tc("optional").toLowerCase()})</Label>
                <div className="flex gap-2">
                  <Select
                    value={newAnimalId || "__none__"}
                    onValueChange={(v) => setNewAnimalId(v === "__none__" ? "" : v)}
                    disabled={!newClientId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t("visits.selectPet")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{tc("none")}</SelectItem>
                      {clientAnimals.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {canWrite && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={!newClientId}
                      onClick={() => setShowPetModal(true)}
                      title={t("visits.newPet")}
                      aria-label="Ajouter un nouvel animal"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>
                {tc("cancel")}
              </Button>
              {canWrite && (
                <Button onClick={startWalkIn} disabled={createVisit.isPending}>
                  {tc("create")}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NewClientModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onCreated={handleClientCreated}
      />

      <NewPetModal
        open={showPetModal}
        onOpenChange={setShowPetModal}
        defaultClientId={newClientId || undefined}
        onCreated={handlePetCreated}
      />
    </div>
  );
}
