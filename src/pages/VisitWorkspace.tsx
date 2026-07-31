import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  AlertTriangle,
  Pencil,
  RotateCcw,
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
  VISIT_STATUS_LABELS,
  VISIT_SERVICE_STATUS_LABELS,
  getServiceDef,
  resolveServiceAmount,
  getCatalogWithPrices,
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
import {
  useAnimals,
  useCreateVaccination,
  useCreateAntiparasitic,
  useUpdateAppointment,
  useAppointmentsByAnimal,
  useVaccinationsByAnimal,
  useAntiparasiticsByAnimal,
  appointmentKeys,
} from "@/hooks/useDatabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  buildVaccinationNotes,
  buildAntiparasiticNotes,
  resolveVisitVaccinationReminder,
  resolveVisitAntiparasiticReminder,
  toDayKey,
} from "@/lib/vaccinationCertificate";
import { syncRemindersAfterAdministered } from "@/lib/medicalDoseSync";
import {
  shouldSyncServiceToMedicalRecord,
  syncVisitExamToMedicalRecord,
} from "@/lib/medicalActSync";
import { useWriteAccess } from "@/components/RoleGuard";

export default function VisitWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const currency = settings?.currency || "MAD";
  const { canWrite, guardWrite } = useWriteAccess("can_manage_visits");
  const { canWrite: canWriteAnimals, guardWrite: guardWriteAnimals } =
    useWriteAccess("can_manage_animals");

  const { data: visit, isLoading, error } = useVisit(id);
  const addService = useAddVisitService();
  const updateService = useUpdateVisitService();
  const removeService = useRemoveVisitService();
  const completeVisit = useCompleteVisit();
  const updateVisit = useUpdateVisit();
  const createVaccination = useCreateVaccination();
  const createAntiparasitic = useCreateAntiparasitic();
  const updateAppointment = useUpdateAppointment();
  const { data: animalAppointments = [] } = useAppointmentsByAnimal(
    visit?.animal_id || ""
  );
  const { data: animalVaccinations = [] } = useVaccinationsByAnimal(
    visit?.animal_id || ""
  );
  const { data: animalAntiparasitics = [] } = useAntiparasiticsByAnimal(
    visit?.animal_id || ""
  );

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
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [editVisitOpen, setEditVisitOpen] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editVisitDate, setEditVisitDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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
    const priced = getCatalogWithPrices(settings.servicePrices);
    if (visit?.context === "farm") {
      return priced.filter(
        (s) =>
          s.action === "farm_intervention" ||
          s.action === "notes" ||
          s.code === "other" ||
          s.code === "prescription"
      );
    }
    return priced.filter((s) => s.action !== "farm_intervention");
  }, [visit?.context, settings.servicePrices]);

  const openActionFor = async (service: VisitService) => {
    if (!guardWrite()) return;
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

  const isVaccinationService = (service: VisitService) => {
    const def = getServiceDef(service.service_code);
    return def?.action === "vaccination" || service.service_code === "vaccination";
  };

  const isAntiparasiticService = (service: VisitService) => {
    const def = getServiceDef(service.service_code);
    return (
      def?.action === "antiparasitic" ||
      service.service_code === "antiparasitic" ||
      service.service_code === "deworming"
    );
  };

  const pendingServices = useMemo(
    () => services.filter((s) => s.status === "planned" || s.status === "in_progress"),
    [services]
  );

  const vaccinationWithoutDose = useMemo(
    () =>
      services.filter(
        (s) =>
          (isVaccinationService(s) || isAntiparasiticService(s)) &&
          s.status !== "skipped" &&
          (s.status !== "done" || !s.reference_id)
      ),
    [services]
  );

  const markDone = async (service: VisitService, reference?: { type: string; id: string }) => {
    if (!guardWrite()) return;
    if (!visit) return;

    let ref = reference;

    // Vaccination: « Marquer fait » enregistre la dose sur le certificat
    if (!ref && !service.reference_id && isVaccinationService(service)) {
      if (!visit.animal_id) {
        toast({
          title: "Animal requis",
          description: "Associez un animal avant d'enregistrer la vaccination.",
          variant: "destructive",
        });
        return;
      }

      const reminder = resolveVisitVaccinationReminder({
        reason: visit.reason,
        appointmentNotes: visit.appointment?.notes,
      });

      if (!reminder) {
        toast({
          title: "Saisie du vaccin requise",
          description:
            "Cliquez sur « Enregistrer vaccin » pour saisir le produit et la dose avant de marquer fait.",
          variant: "destructive",
        });
        setVaccOpen(true);
        return;
      }

      try {
        const administeredDate = format(new Date(), "yyyy-MM-dd");
        const existingVax = animalVaccinations.find(
          (v) =>
            toDayKey(v.vaccination_date || "") === administeredDate &&
            (v.vaccine_name || "")
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{M}/gu, "")
              .trim() ===
              reminder.productName
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{M}/gu, "")
                .trim()
        );

        if (existingVax) {
          ref = { type: "vaccination", id: existingVax.id };
        } else {
          const created = await createVaccination.mutateAsync({
            animal_id: visit.animal_id,
            vaccine_name: reminder.productName,
            vaccine_type: reminder.productName,
            vaccination_date: administeredDate,
            notes: buildVaccinationNotes({
              doseLabel: reminder.doseLabel,
              plannedReminders: [],
              userNotes: `Visite · ${reminder.doseLabel}`,
            }),
          });
          ref = { type: "vaccination", id: created.id };
        }

        await syncRemindersAfterAdministered({
          appointments: animalAppointments,
          animalId: visit.animal_id,
          productName: reminder.productName,
          date: administeredDate,
          kind: "vaccination",
          primaryAppointmentId: visit.appointment_id,
          updateFn: (id, data) =>
            updateAppointment.mutateAsync({ id, data }),
        });

        queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
        if (visit.animal_id) {
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.byAnimal(visit.animal_id),
          });
        }
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      } catch (e: any) {
        toast({
          title: "Impossible d'enregistrer la dose",
          description: e?.message || "Erreur lors de la création de la vaccination.",
          variant: "destructive",
        });
        return;
      }
    }

    // Antiparasitaire: « Marquer fait » enregistre le traitement
    if (!ref && !service.reference_id && isAntiparasiticService(service)) {
      if (!visit.animal_id) {
        toast({
          title: "Animal requis",
          description: "Associez un animal avant d'enregistrer le traitement.",
          variant: "destructive",
        });
        return;
      }

      const reminder = resolveVisitAntiparasiticReminder({
        reason: visit.reason,
        appointmentNotes: visit.appointment?.notes,
      });

      if (!reminder) {
        toast({
          title: "Saisie du traitement requise",
          description:
            "Cliquez sur « Enregistrer traitement » pour saisir le produit avant de marquer fait.",
          variant: "destructive",
        });
        setAntiOpen(true);
        return;
      }

      try {
        const administeredDate = format(new Date(), "yyyy-MM-dd");
        const existing = animalAntiparasitics.find(
          (t) =>
            toDayKey(t.treatment_date || "") === administeredDate &&
            (t.product_name || "")
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{M}/gu, "")
              .trim() ===
              reminder.productName
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{M}/gu, "")
                .trim()
        );

        if (existing) {
          ref = { type: "antiparasitic", id: existing.id };
        } else {
          const created = await createAntiparasitic.mutateAsync({
            animal_id: visit.animal_id,
            product_name: reminder.productName,
            treatment_date: administeredDate,
            notes: buildAntiparasiticNotes({
              doseLabel: reminder.doseLabel,
              plannedReminders: [],
              userNotes: `Visite · ${reminder.doseLabel}`,
            }),
          });
          ref = { type: "antiparasitic", id: created.id };
        }

        await syncRemindersAfterAdministered({
          appointments: animalAppointments,
          animalId: visit.animal_id,
          productName: reminder.productName,
          date: administeredDate,
          kind: "antiparasitic",
          primaryAppointmentId: visit.appointment_id,
          updateFn: (id, data) =>
            updateAppointment.mutateAsync({ id, data }),
        });

        queryClient.invalidateQueries({ queryKey: ["antiparasitics"] });
        if (visit.animal_id) {
          queryClient.invalidateQueries({
            queryKey: appointmentKeys.byAnimal(visit.animal_id),
          });
        }
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      } catch (e: any) {
        toast({
          title: "Impossible d'enregistrer le traitement",
          description: e?.message || "Erreur lors de la création du traitement.",
          variant: "destructive",
        });
        return;
      }
    }

    // Consultation clinique : « Marquer fait » crée aussi le dossier (page Consultations)
    if (
      !ref &&
      !service.reference_id &&
      getServiceDef(service.service_code)?.action === "consultation"
    ) {
      if (!visit.animal_id) {
        toast({
          title: "Animal requis",
          description: "Associez un animal avant d'enregistrer la consultation.",
          variant: "destructive",
        });
        return;
      }
      try {
        const { createConsultation } = await import("@/lib/database");
        const created = await createConsultation({
          animal_id: visit.animal_id,
          client_id: visit.client_id,
          visit_id: visit.id,
          consultation_date: visit.visit_date || new Date().toISOString(),
          consultation_type: service.service_code || "consultation",
          notes: service.notes || `Visite · ${service.service_label}`,
          status: "completed",
          cost: Number(service.amount) || undefined,
        });
        ref = { type: "consultation", id: created.id };
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
      } catch (e: any) {
        toast({
          title: "Impossible d'enregistrer la consultation",
          description: e?.message || "Erreur lors de la création du dossier.",
          variant: "destructive",
        });
        return;
      }
    }

    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit.id,
      patch: {
        status: "done",
        ...(ref
          ? { reference_type: ref.type, reference_id: ref.id }
          : service.reference_id
            ? {}
            : {}),
      },
    });
    toast({
      title: "Prestation terminée",
      description:
        ref?.type === "vaccination"
          ? `${service.service_label} — dose ajoutée au certificat`
          : ref?.type === "antiparasitic"
            ? `${service.service_label} — traitement ajouté au certificat`
            : ref?.type === "consultation"
              ? `${service.service_label} — dossier consultation créé`
              : service.service_label,
    });
  };

  const markSkipped = async (service: VisitService) => {
    if (!guardWrite()) return;
    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit!.id,
      patch: { status: "skipped" },
    });
  };

  const addFromCatalog = async (code: string) => {
    if (!guardWrite()) return;
    const def = getServiceDef(code);
    if (!def || !visit) return;
    try {
      const created = await addService.mutateAsync({
        visitId: visit.id,
        service: {
          service_code: def.code,
          service_label: def.label,
          amount: resolveServiceAmount(def.code, settings.servicePrices),
        },
      });
      setShowCatalog(false);
      setActiveServiceId(created.id);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const saveAmount = async (service: VisitService, amount: number) => {
    if (!guardWrite()) return;
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
    if (!guardWrite()) return;
    if (!visit) return;

    const notes = payload.notes ?? service.notes;
    const details = payload.details ?? service.details;
    const attachments = payload.attachments ?? service.attachments;

    let referencePatch: { reference_type?: string; reference_id?: string } = {};

    // Radio / écho / analyses → consultation dans le dossier médical
    if (
      visit.animal_id &&
      shouldSyncServiceToMedicalRecord(service.service_code) &&
      (payload.markDone || service.status === "done" || !!service.reference_id)
    ) {
      try {
        const consultation = await syncVisitExamToMedicalRecord({
          service,
          visit,
          notes,
          details,
          attachments,
        });
        if (consultation) {
          referencePatch = {
            reference_type: "consultation",
            reference_id: consultation.id,
          };
          queryClient.invalidateQueries({ queryKey: ["consultations"] });
        }
      } catch (e: any) {
        toast({
          title: "Dossier médical",
          description:
            e?.message ||
            "L'acte a été sauvé sur la visite, mais pas synchronisé au dossier.",
          variant: "destructive",
        });
      }
    }

    await updateService.mutateAsync({
      serviceId: service.id,
      visitId: visit.id,
      patch: {
        notes,
        details,
        attachments,
        ...referencePatch,
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

    if (!guardWrite()) return;

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
    if (!guardWrite()) return;
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

  const doCompleteVisit = async () => {
    if (!guardWrite()) return;
    if (!visit) return;
    try {
      await completeVisit.mutateAsync(visit.id);
      if (visit.animal_id) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.byAnimal(visit.animal_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      toast({ title: "Visite terminée" });
      navigate("/visites");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleComplete = async () => {
    if (!guardWrite()) return;
    if (!visit) return;
    if (pendingServices.length > 0 || vaccinationWithoutDose.length > 0) {
      setCompleteConfirmOpen(true);
      return;
    }
    await doCompleteVisit();
  };

  const assignAnimal = async (animalId: string | null) => {
    if (!guardWrite()) return;
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

  const openEditVisit = () => {
    if (!guardWrite()) return;
    if (!visit) return;
    setEditReason(visit.reason || "");
    setEditNotes(visit.notes || "");
    setEditVisitDate(
      visit.visit_date ? format(new Date(visit.visit_date), "yyyy-MM-dd'T'HH:mm") : ""
    );
    setEditVisitOpen(true);
  };

  const saveVisitEdits = async () => {
    if (!guardWrite()) return;
    if (!visit) return;
    setEditSaving(true);
    try {
      const patch: {
        reason: string | null;
        notes: string | null;
        visit_date?: string;
      } = {
        reason: editReason.trim() || null,
        notes: editNotes.trim() || null,
      };
      if (editVisitDate) {
        patch.visit_date = new Date(editVisitDate).toISOString();
      }
      await updateVisit.mutateAsync({ id: visit.id, patch });
      toast({ title: "Visite mise à jour" });
      setEditVisitOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const reopenVisit = async () => {
    if (!guardWrite()) return;
    if (!visit) return;
    try {
      await updateVisit.mutateAsync({
        id: visit.id,
        patch: { status: "in_progress" },
      });
      toast({
        title: "Visite réouverte",
        description: "Vous pouvez à nouveau modifier les prestations.",
      });
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
            {visit.status === "in_progress" && visit.context !== "farm" && canWrite && (
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
            {visit.status === "completed" && visit.context !== "farm" && canWrite && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1"
                onClick={() => setShowAnimalPicker(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Animal
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
          {(visit.reason || visit.notes) && (
            <div className="text-sm space-y-1">
              {visit.reason && (
                <p>
                  <span className="text-muted-foreground">Motif : </span>
                  {visit.reason}
                </p>
              )}
              {visit.notes && (
                <p className="text-muted-foreground">{visit.notes}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {canWrite && (
            <Button variant="outline" className="gap-2" onClick={openEditVisit}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          )}
          {canWrite && visit.status === "completed" && (
            <Button variant="outline" className="gap-2" onClick={reopenVisit}>
              <RotateCcw className="h-4 w-4" />
              Réouvrir
            </Button>
          )}
          {canWrite && (
            <Button variant="outline" className="gap-2" onClick={() => setShowCatalog(true)}>
              <Plus className="h-4 w-4" />
              Prestation
            </Button>
          )}
          {(visit.invoiced || canWrite) && (
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
          )}
          {canWrite && visit.invoiced && visit.invoice_id && lastInvoice?.status !== "paid" && (
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
          {canWrite && visit.status === "in_progress" && (
            <Button className="gap-2" onClick={handleComplete} disabled={completeVisit.isPending}>
              {pendingServices.length > 0 || vaccinationWithoutDose.length > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Terminer la visite
              {(pendingServices.length > 0 || vaccinationWithoutDose.length > 0) && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  !
                </Badge>
              )}
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
                {canWrite && (
                  <Button size="sm" onClick={() => setShowCatalog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                )}
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
                readOnly={!canWrite}
                onSaveAmount={(amount) => saveAmount(activeService, amount)}
                onSaveDetails={(payload) => saveServicePanel(activeService, payload)}
                onRealize={() => openActionFor(activeService)}
                onMarkDone={() => markDone(activeService)}
                onSkip={() => markSkipped(activeService)}
                onRemove={() => {
                  if (!guardWrite()) return;
                  return removeService.mutateAsync({
                    serviceId: activeService.id,
                    visitId: visit.id,
                  });
                }}
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
                      {item.amount > 0
                        ? `~ ${item.amount} ${currency}`
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
        onCreated={async (v) => {
          if (activeService) {
            await markDone(activeService, { type: "vaccination", id: v.id });
          }
          if (visit.animal_id) {
            try {
              await syncRemindersAfterAdministered({
                appointments: animalAppointments,
                animalId: visit.animal_id,
                productName: v.vaccine_name || "",
                date: (v.vaccination_date || "").slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
                kind: "vaccination",
                primaryAppointmentId: visit.appointment_id,
                updateFn: (id, data) =>
                  updateAppointment.mutateAsync({ id, data }),
              });
            } catch {
              /* non-blocking */
            }
          }
          queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
          if (visit.animal_id) {
            queryClient.invalidateQueries({
              queryKey: appointmentKeys.byAnimal(visit.animal_id),
            });
          }
          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
        }}
      />

      <NewAntiparasiticModalDynamic
        open={antiOpen}
        onOpenChange={setAntiOpen}
        selectedAnimalId={visit.animal_id || undefined}
        selectedClientId={visit.client_id}
        onCreated={async (a) => {
          if (activeService) {
            await markDone(activeService, { type: "antiparasitic", id: a.id });
          }
          if (visit.animal_id) {
            try {
              await syncRemindersAfterAdministered({
                appointments: animalAppointments,
                animalId: visit.animal_id,
                productName: a.product_name || "",
                date: (a.treatment_date || "").slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
                kind: "antiparasitic",
                primaryAppointmentId: visit.appointment_id,
                updateFn: (id, data) =>
                  updateAppointment.mutateAsync({ id, data }),
              });
            } catch {
              /* non-blocking */
            }
          }
          queryClient.invalidateQueries({ queryKey: ["antiparasitics"] });
          if (visit.animal_id) {
            queryClient.invalidateQueries({
              queryKey: appointmentKeys.byAnimal(visit.animal_id),
            });
          }
          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
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
          preferVisitId={visit.id}
          preferServiceId={activeService?.id}
          onCreated={() => {
            toast({
              title: "Prestation terminée",
              description:
                activeService?.service_label ||
                "Intervention liée à la visite d'élevage",
            });
            void queryClient.invalidateQueries({
              queryKey: visitKeys.detail(visit.id),
            });
            void queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
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
            {canWriteAnimals && (
              <Button
                type="button"
                className="w-full gap-2"
                onClick={() => {
                  if (!guardWriteAnimals()) return;
                  setShowAnimalPicker(false);
                  setShowPetModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Créer un nouvel animal
              </Button>
            )}
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

      <AlertDialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Prestations non terminées
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Des prestations ne sont pas encore marquées comme faites. Les doses / rappels
                  non enregistrés n&apos;apparaîtront pas sur le certificat de vaccination.
                </p>
                {pendingServices.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {pendingServices.map((s) => (
                      <li key={s.id}>
                        <span className="text-foreground font-medium">{s.service_label}</span>
                        {" — "}
                        {VISIT_SERVICE_STATUS_LABELS[s.status] || s.status}
                      </li>
                    ))}
                  </ul>
                )}
                {vaccinationWithoutDose.some(
                  (s) => s.status === "done" && !s.reference_id
                ) && (
                  <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-200">
                    Au moins une vaccination ou un antiparasitaire est « fait » sans
                    enregistrement lié au certificat. Utilisez « Enregistrer » ou « Marquer
                    fait » sur le rappel.
                  </p>
                )}
                <p>Terminez ou ignorez les prestations concernées, ou forcez la clôture.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setCompleteConfirmOpen(false);
                void doCompleteVisit();
              }}
            >
              Terminer quand même
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editVisitOpen} onOpenChange={setEditVisitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la visite</DialogTitle>
            <DialogDescription>
              Motif, notes et date. Les prestations se gèrent dans le panneau de gauche.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-visit-date">Date / heure</Label>
              <Input
                id="edit-visit-date"
                type="datetime-local"
                value={editVisitDate}
                onChange={(e) => setEditVisitDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reason">Motif</Label>
              <Input
                id="edit-reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="ex. Rappel vaccin — Rappel 2 · rage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <textarea
                id="edit-notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes internes…"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditVisitOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={saveVisitEdits} disabled={editSaving}>
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
