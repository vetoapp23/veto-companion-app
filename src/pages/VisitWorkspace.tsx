import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Receipt,
  User,
  Heart,
  Tractor,
  Printer,
  Banknote,
} from "lucide-react";
import {
  useVisit,
  useAddVisitService,
  useUpdateVisitService,
  useRemoveVisitService,
  useCompleteVisit,
  useUpdateVisit,
  visitKeys,
} from "@/hooks/useVisits";
import {
  VISIT_SERVICE_CATALOG,
  VISIT_STATUS_LABELS,
  VISIT_SERVICE_STATUS_LABELS,
  getServiceDef,
} from "@/lib/visitCatalog";
import type { VisitService } from "@/lib/visits";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import {
  createVisitInvoice,
  getVisitInvoice,
  markInvoicePaid,
  printVisitInvoice,
  buildBillableLines,
  sumLines,
  type VisitInvoice,
} from "@/lib/visitInvoice";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import NewVaccinationModal from "@/components/forms/NewVaccinationModalDynamic";
import NewAntiparasiticModalDynamic from "@/components/forms/NewAntiparasiticModalDynamic";
import { NewPrescriptionModal } from "@/components/forms/NewPrescriptionModal";
import NewFarmInterventionModalSupabase from "@/components/forms/NewFarmInterventionModalSupabase";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { VisitServiceDetailPanel } from "@/components/visits/VisitServiceDetailPanel";
import { useAnimals } from "@/hooks/useDatabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VisitWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const currency = settings?.currency || "MAD";

  const { data: visit, isLoading, error } = useVisit(id);
  const addService = useAddVisitService();
  const updateService = useUpdateVisitService();
  const removeService = useRemoveVisitService();
  const completeVisit = useCompleteVisit();
  const updateVisit = useUpdateVisit();

  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const [consultOpen, setConsultOpen] = useState(false);
  const [vaccOpen, setVaccOpen] = useState(false);
  const [antiOpen, setAntiOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [farmOpen, setFarmOpen] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<VisitInvoice | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);

  const { data: animals = [] } = useAnimals();
  const clientAnimals = useMemo(
    () => (visit ? animals.filter((a) => a.client_id === visit.client_id) : []),
    [animals, visit]
  );

  const services = visit?.services || [];
  const activeService = services.find((s) => s.id === activeServiceId) || services[0];

  useEffect(() => {
    if (!visit?.invoice_id) {
      setLastInvoice(null);
      return;
    }
    let cancelled = false;
    getVisitInvoice(visit.invoice_id)
      .then((inv) => {
        if (!cancelled) setLastInvoice(inv);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visit?.invoice_id]);

  const linkedConsultationId = useMemo(() => {
    const done = services.find(
      (s) => s.reference_type === "consultation" && s.reference_id && s.status === "done"
    );
    return done?.reference_id || null;
  }, [services]);

  const progress = useMemo(() => {
    const total = services.filter((s) => s.status !== "skipped").length;
    const done = services.filter((s) => s.status === "done").length;
    return { total, done };
  }, [services]);

  const displayTotal = useMemo(() => {
    if (!visit) return 0;
    const lines = buildBillableLines(services, visit.billing_mode, visit.head_count);
    if (lines.length > 0) return sumLines(lines);
    const qty =
      visit.billing_mode === "per_head" && Number(visit.head_count) > 0
        ? Number(visit.head_count)
        : 1;
    return services
      .filter((s) => s.status !== "skipped")
      .reduce((sum, s) => sum + (Number(s.amount) || 0) * qty, 0);
  }, [visit, services]);

  const catalogForContext = useMemo(() => {
    if (visit?.context === "farm") {
      return VISIT_SERVICE_CATALOG.filter(
        (s) =>
          s.action === "farm_intervention" ||
          s.action === "notes" ||
          s.code === "other" ||
          s.code === "prescription"
      );
    }
    return VISIT_SERVICE_CATALOG.filter((s) => s.action !== "farm_intervention");
  }, [visit?.context]);

  const openActionFor = async (service: VisitService) => {
    setActiveServiceId(service.id);
    const def = getServiceDef(service.service_code);
    const needsAnimal =
      def?.action !== "notes" &&
      def?.action !== "none" &&
      def?.action !== "farm_intervention";
    if (!visit?.animal_id && needsAnimal) {
      toast({
        title: "Animal requis",
        description: "Associez un animal à la visite avant cet acte.",
        variant: "destructive",
      });
      setShowAnimalPicker(true);
      return;
    }
    if (def?.action === "farm_intervention" && !visit?.farm_id) {
      toast({
        title: "Exploitation requise",
        description: "Cette visite n'est pas liée à une ferme.",
        variant: "destructive",
      });
      return;
    }

    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: { status: "in_progress" },
    });

    switch (def?.action) {
      case "consultation":
        setConsultOpen(true);
        break;
      case "vaccination":
        setVaccOpen(true);
        break;
      case "antiparasitic":
        setAntiOpen(true);
        break;
      case "prescription":
        setRxOpen(true);
        break;
      case "farm_intervention":
        setFarmOpen(true);
        break;
      case "notes":
        break;
      default:
        break;
    }
  };

  const markDone = async (service: VisitService, reference?: { type: string; id: string }) => {
    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: {
        status: "done",
        ...(reference
          ? { reference_type: reference.type, reference_id: reference.id }
          : {}),
      },
    });
    toast({ title: "Prestation terminée", description: service.service_label });
  };

  const markSkipped = async (service: VisitService) => {
    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: { status: "skipped" },
    });
  };

  const addFromCatalog = async (code: string) => {
    const def = getServiceDef(code);
    if (!def || !visit) return;
    try {
      const created = await addService.mutateAsync({
        visitId: visit.id,
        service: {
          service_code: def.code,
          service_label: def.label,
          amount: def.defaultAmount,
        },
      });
      setShowCatalog(false);
      setActiveServiceId(created.id);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const saveAmount = async (service: VisitService, amount: number) => {
    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: { amount },
    });
  };

  const saveServicePanel = async (
    service: VisitService,
    payload: {
      notes?: string;
      details?: Record<string, unknown>;
      attachments?: string[];
      markDone?: boolean;
    }
  ) => {
    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: {
        notes: payload.notes ?? service.notes,
        details: payload.details ?? service.details,
        attachments: payload.attachments ?? service.attachments,
        ...(payload.markDone ? { status: "done" as const } : {}),
      },
    });
  };

  const clinicPrintSettings = () => ({
    clinicName: settings?.clinicName,
    address: settings?.address,
    phone: settings?.phone,
    email: settings?.email,
    website: settings?.website,
    logo: settings?.logo,
    currency,
  });

  /** Même flux pour PDF et Imprimer (dialogue navigateur). */
  const openInvoiceDocument = async () => {
    if (!visit?.invoice_id) return;
    try {
      const inv =
        lastInvoice?.id === visit.invoice_id
          ? lastInvoice
          : await getVisitInvoice(visit.invoice_id);
      setLastInvoice(inv);
      await printVisitInvoice(inv, visit, clinicPrintSettings());
    } catch (e: any) {
      toast({
        title: "Erreur document",
        description: e?.message,
        variant: "destructive",
      });
    }
  };

  const handleInvoice = async () => {
    if (!visit) return;

    if (visit.invoiced && visit.invoice_id) {
      await openInvoiceDocument();
      return;
    }

    const billable = buildBillableLines(services, visit.billing_mode, visit.head_count);
    const amount = sumLines(billable);
    if (amount <= 0) {
      toast({
        title: "Montant nul",
        description:
          "Marquez des prestations comme faites avec un montant > 0 avant de facturer.",
        variant: "destructive",
      });
      return;
    }
    const pending = services.filter(
      (s) => s.status === "planned" || s.status === "in_progress"
    );
    if (pending.length > 0) {
      toast({
        title: "Prestations en cours",
        description: `${pending.length} prestation(s) non terminée(s). Terminez-les ou ignorez-les avant facturation.`,
        variant: "destructive",
      });
      return;
    }
    setInvoiceBusy(true);
    try {
      const invoice = await createVisitInvoice({ visit, services });
      setLastInvoice(invoice);
      await queryClient.invalidateQueries({ queryKey: visitKeys.detail(visit.id) });
      await queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      toast({
        title: "Facture émise",
        description: `${invoice.invoice_number} — ${amount.toFixed(0)} ${currency}`,
      });
      await printVisitInvoice(invoice, visit, clinicPrintSettings());
    } catch (e: any) {
      toast({ title: "Erreur facturation", description: e?.message, variant: "destructive" });
    } finally {
      setInvoiceBusy(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!visit?.invoice_id) return;
    setPayBusy(true);
    try {
      const inv = await markInvoicePaid(visit.invoice_id);
      setLastInvoice(inv);
      toast({ title: "Facture payée", description: inv.invoice_number });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setPayBusy(false);
    }
  };

  const handleComplete = async () => {
    if (!visit) return;
    try {
      await completeVisit.mutateAsync(visit.id);
      toast({ title: "Visite terminée" });
      navigate("/visites");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const assignAnimal = async (animalId: string | null) => {
    if (!visit) return;
    try {
      await updateVisit.mutateAsync({
        id: visit.id,
        patch: { animal_id: animalId },
      });
      toast({
        title: animalId ? "Animal associé" : "Animal retiré",
        description: animalId
          ? "L'animal est maintenant lié à cette visite."
          : "La visite n'a plus d'animal associé.",
      });
      setShowAnimalPicker(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement de la visite…
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <p className="text-destructive">Visite introuvable.</p>
        <Button asChild variant="outline">
          <Link to="/visites">Retour</Link>
        </Button>
      </div>
    );
  }

  const defActive = activeService ? getServiceDef(activeService.service_code) : null;
  const ActionIcon = defActive?.icon || ClipboardList;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground">
            <Link to="/visites">
              <ArrowLeft className="h-4 w-4" />
              Visites
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display tracking-tight">Visite</h1>
            <Badge>{VISIT_STATUS_LABELS[visit.status]}</Badge>
            {visit.context === "farm" && (
              <Badge variant="outline" className="gap-1">
                <Tractor className="h-3 w-3" />
                Élevage
              </Badge>
            )}
            {visit.invoiced && <Badge variant="outline">Facturée</Badge>}
            {lastInvoice?.status === "paid" && (
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Payée</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground items-center">
            <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
              <User className="h-3.5 w-3.5" />
              {visit.client?.first_name} {visit.client?.last_name}
            </span>
            {visit.context === "farm" ? (
              <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                <Tractor className="h-3.5 w-3.5" />
                {visit.farm?.farm_name || "Exploitation"}
                {visit.head_count != null
                  ? ` · ${visit.head_count} têtes (${
                      visit.billing_mode === "per_head" ? "à la tête" : "forfait"
                    })`
                  : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                {visit.animal
                  ? `${visit.animal.name} (${visit.animal.species || "—"})`
                  : "Sans animal"}
              </span>
            )}
            {visit.status === "in_progress" && visit.context !== "farm" && (
              <Button
                type="button"
                size="sm"
                variant={visit.animal_id ? "ghost" : "default"}
                className="h-7 gap-1"
                onClick={() => setShowAnimalPicker(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {visit.animal_id ? "Changer l'animal" : "Ajouter un animal"}
              </Button>
            )}
            <span>{new Date(visit.visit_date).toLocaleString("fr-FR")}</span>
            {visit.appointment && (
              <Link to="/appointments" className="text-primary hover:underline">
                Lié au RDV
              </Link>
            )}
          </div>
          {!visit.animal_id && visit.status === "in_progress" && visit.context !== "farm" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
              Aucun animal associé. Ajoutez-en un pour réaliser consultation, vaccin ou ordonnance.
            </div>
          )}
          {visit.context === "farm" && (
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm">
              Visite d&apos;élevage
              {visit.farm?.farm_name ? ` — ${visit.farm.farm_name}` : ""}. Les actes ouvrent une
              intervention ferme.
            </div>
          )}
          {visit.reason && <p className="text-sm text-muted-foreground">{visit.reason}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowCatalog(true)}>
            <Plus className="h-4 w-4" />
            Prestation
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleInvoice}
            disabled={invoiceBusy || visit.status === "cancelled"}
          >
            {invoiceBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : visit.invoiced ? (
              <Printer className="h-4 w-4" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            {visit.invoiced ? "Imprimer / PDF" : "Générer facture"}
          </Button>
          {visit.invoiced && visit.invoice_id && lastInvoice?.status !== "paid" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleMarkPaid}
              disabled={payBusy}
            >
              {payBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
              Marquer payée
            </Button>
          )}
          {visit.status === "in_progress" && (
            <Button className="gap-2" onClick={handleComplete} disabled={completeVisit.isPending}>
              <Check className="h-4 w-4" />
              Terminer la visite
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            Progression : <strong>{progress.done}</strong> / {progress.total} prestations
          </span>
          <span className="font-semibold tabular-nums">
            Total : {displayTotal.toFixed(0)} {currency}
            {visit.billing_mode === "per_head" && visit.head_count
              ? ` (${visit.head_count} × PU)`
              : ""}
          </span>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        {/* Prestations list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prestations de la visite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-3">
                <p className="text-sm">Aucune prestation. Ajoutez-en une pour commencer.</p>
                <Button size="sm" onClick={() => setShowCatalog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            ) : (
              services.map((service) => {
                const def = getServiceDef(service.service_code);
                const Icon = def?.icon || FileText;
                const selected = activeService?.id === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setActiveServiceId(service.id);
                    }}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-colors",
                      selected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{service.service_label}</span>
                          <Badge
                            variant={
                              service.status === "done"
                                ? "default"
                                : service.status === "skipped"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="shrink-0 text-[10px]"
                          >
                            {VISIT_SERVICE_STATUS_LABELS[service.status]}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex justify-between">
                          <span>{def?.description}</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {Number(service.amount || 0).toFixed(0)} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active service panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {activeService ? (
                <>
                  <ActionIcon className="h-4 w-4 text-primary" />
                  {activeService.service_label}
                </>
              ) : (
                "Détail prestation"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeService ? (
              <p className="text-sm text-muted-foreground">Sélectionnez une prestation à gauche.</p>
            ) : (
              <VisitServiceDetailPanel
                key={activeService.id}
                service={activeService}
                currency={currency}
                perHead={visit.billing_mode === "per_head"}
                onSaveAmount={(amount) => saveAmount(activeService, amount)}
                onSaveDetails={(payload) => saveServicePanel(activeService, payload)}
                onRealize={() => openActionFor(activeService)}
                onMarkDone={() => markDone(activeService)}
                onSkip={() => markSkipped(activeService)}
                onRemove={() =>
                  removeService.mutateAsync({
                    serviceId: activeService.id,
                    visitId: visit.id,
                  })
                }
                onOpenRx={() => setRxOpen(true)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Catalog dialog */}
      <Dialog open={showCatalog} onOpenChange={setShowCatalog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une prestation</DialogTitle>
            <DialogDescription>
              Vous pouvez enchaîner plusieurs actes dans la même visite.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {catalogForContext.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => addFromCatalog(item.code)}
                  className="flex items-start gap-3 rounded-xl border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                    <div className="text-xs mt-1 tabular-nums">
                      {item.defaultAmount > 0
                        ? `~ ${item.defaultAmount} ${currency}`
                        : "Montant libre"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clinical modals */}
      <NewConsultationModal
        open={consultOpen}
        onOpenChange={setConsultOpen}
        prefillData={{
          clientId: visit.client_id,
          animalId: visit.animal_id || undefined,
          consultation_type: activeService?.service_code || "consultation",
          visit_id: visit.id,
          notes: visit.reason || undefined,
        }}
        onCreated={(c) => {
          if (activeService) {
            markDone(activeService, { type: "consultation", id: c.id });
          }
        }}
      />

      <NewVaccinationModal
        open={vaccOpen}
        onOpenChange={setVaccOpen}
        selectedAnimalId={visit.animal_id || undefined}
        onCreated={(v) => {
          if (activeService) {
            markDone(activeService, { type: "vaccination", id: v.id });
          }
        }}
      />

      <NewAntiparasiticModalDynamic
        open={antiOpen}
        onOpenChange={setAntiOpen}
        selectedAnimalId={visit.animal_id || undefined}
        selectedClientId={visit.client_id}
        onCreated={(a) => {
          if (activeService) {
            markDone(activeService, { type: "antiparasitic", id: a.id });
          }
        }}
      />

      {visit.animal_id && (
        <NewPrescriptionModal
          open={rxOpen}
          onOpenChange={setRxOpen}
          petId={visit.animal_id}
          consultationId={linkedConsultationId}
          visitId={visit.id}
          onCreated={(rx) => {
            if (activeService) {
              const patchAmount =
                rx.estimatedAmount && rx.estimatedAmount > 0
                  ? rx.estimatedAmount
                  : undefined;
              updateService
                .mutateAsync({
                  serviceId: activeService.id,
                  visitId: visit.id,
                  patch: {
                    status: "done",
                    reference_type: "prescription",
                    reference_id: rx.id,
                    ...(patchAmount != null ? { amount: patchAmount } : {}),
                  },
                })
                .then(() =>
                  toast({
                    title: "Prestation terminée",
                    description: activeService.service_label,
                  })
                );
            }
          }}
        />
      )}

      {visit.farm_id && (
        <NewFarmInterventionModalSupabase
          open={farmOpen}
          onOpenChange={setFarmOpen}
          farmId={visit.farm_id}
          farmName={visit.farm?.farm_name}
          defaultCost={activeService?.amount ?? undefined}
          defaultAnimalCount={visit.head_count ?? undefined}
          onCreated={(row) => {
            if (!activeService) return;
            const patch: any = {
              status: "done",
              reference_type: "farm_intervention",
              reference_id: row.id,
            };
            if (row.cost != null && row.cost > 0) patch.amount = row.cost;
            updateService
              .mutateAsync({
                serviceId: activeService.id,
                visitId: visit.id,
                patch,
              })
              .then(() =>
                toast({
                  title: "Prestation terminée",
                  description: activeService.service_label,
                })
              );
          }}
        />
      )}

      <Dialog open={showAnimalPicker} onOpenChange={setShowAnimalPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Animal de la visite</DialogTitle>
            <DialogDescription>
              Sélectionnez un animal du client ou créez-en un nouveau.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Animal existant</Label>
              <Select
                value={visit.animal_id || "__none__"}
                onValueChange={(v) => assignAnimal(v === "__none__" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucun animal</SelectItem>
                  {clientAnimals.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientAnimals.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Ce client n&apos;a pas encore d&apos;animal enregistré.
                </p>
              )}
            </div>
            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => {
                setShowAnimalPicker(false);
                setShowPetModal(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Créer un nouvel animal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NewPetModal
        open={showPetModal}
        onOpenChange={setShowPetModal}
        defaultClientId={visit.client_id}
        onCreated={(animal) => {
          assignAnimal(animal.id);
        }}
      />
    </div>
  );
}
