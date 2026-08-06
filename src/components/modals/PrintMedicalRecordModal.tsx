import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, FileText, Download, Loader2, QrCode, Copy, Share2, Check } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml } from "@/lib/printWatermark";
import {
  useConsultationsByAnimal,
  useVaccinationsByAnimal,
  useAntiparasiticsByAnimal,
  usePrescriptionsByAnimal,
  useAppointmentsByAnimal,
  useClients,
} from "@/hooks/useDatabase";
import { usePedigree } from "@/hooks/usePedigree";
import { calculateAge, escapeHtml, formatTemperature, safePrintUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAppLocale } from "@/i18n/useAppLocale";
import { printHtml } from "@/lib/htmlToPdf";
import { buildReportDocument, buildDefaultFooter } from "@/lib/reportStyles";
import {
  buildAdministeredDoseRows,
  buildAdministeredAntiparasiticRows,
  formatCertDate,
} from "@/lib/vaccinationCertificate";
import {
  buildMedicalSharePayload,
  buildTransferQrSectionHtml,
  createMedicalShare,
  medicalShareImportUrl,
  qrCodeDataUrl,
} from "@/lib/medicalShare";

type SectionKey =
  | "identity"
  | "pedigree"
  | "history"
  | "consultations"
  | "vaccinations"
  | "antiparasitics"
  | "prescriptions"
  | "photos";

type Template = "complete" | "summary" | "vaccinations" | "certificate";

const TEMPLATES: Record<Template, Record<SectionKey, boolean>> = {
  complete: {
    identity: true, pedigree: true, history: true,
    consultations: true, vaccinations: true, antiparasitics: true,
    prescriptions: true, photos: false,
  },
  summary: {
    identity: true, pedigree: false, history: true,
    consultations: true, vaccinations: true, antiparasitics: false,
    prescriptions: false, photos: false,
  },
  vaccinations: {
    identity: true, pedigree: false, history: false,
    consultations: false, vaccinations: true, antiparasitics: true,
    prescriptions: false, photos: false,
  },
  certificate: {
    identity: true, pedigree: true, history: false,
    consultations: false, vaccinations: true, antiparasitics: false,
    prescriptions: false, photos: false,
  },
};

interface PrintMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: any | null;
}

type SharePreview = {
  url: string;
  qrDataUrl: string;
  expiresAt: string;
  shortCode: string;
};

export function PrintMedicalRecordModal({ open, onOpenChange, animal }: PrintMedicalRecordModalProps) {
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const { bcp47 } = useAppLocale();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const animalId = animal?.id || animal?.dbId;
  const { data: consultations = [] } = useConsultationsByAnimal(animalId);
  const { data: vaccinations = [] } = useVaccinationsByAnimal(animalId);
  const { data: antiparasitics = [] } = useAntiparasiticsByAnimal(animalId);
  const { data: appointments = [] } = useAppointmentsByAnimal(animalId || "");
  const { data: prescriptions = [] } = usePrescriptionsByAnimal(animalId);
  const { data: pedigree } = usePedigree(animalId);
  const { data: clients = [] } = useClients();

  const [template, setTemplate] = useState<Template>("complete");
  const [sections, setSections] = useState<Record<SectionKey, boolean>>(TEMPLATES.complete);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includeTransferQr, setIncludeTransferQr] = useState(false);
  const [ownerConsent, setOwnerConsent] = useState(false);
  const [expiresDays, setExpiresDays] = useState<"7" | "30" | "90">("30");
  const [busy, setBusy] = useState(false);
  const [sharePreview, setSharePreview] = useState<SharePreview | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const applyTemplate = (tmpl: Template) => {
    setTemplate(tmpl);
    setSections(TEMPLATES[tmpl]);
  };

  const toggle = (k: SectionKey) =>
    setSections((s) => ({ ...s, [k]: !s[k] }));

  const fmtDate = (d?: string | Date | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString(bcp47); } catch { return String(d); }
  };

  const inRange = (d?: string | null) => {
    if (!d) return true;
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  };

  const completedVaccinations = useMemo(
    () =>
      buildAdministeredDoseRows(vaccinations, appointments).filter((r) =>
        inRange(r.date)
      ),
    [vaccinations, appointments, dateFrom, dateTo]
  );

  const completedAntiparasitics = useMemo(
    () =>
      buildAdministeredAntiparasiticRows(antiparasitics, appointments).filter((r) =>
        inRange(r.date)
      ),
    [antiparasitics, appointments, dateFrom, dateTo]
  );

  const buildHtml = async (transferQrHtml = "") => {
    if (!animal) return "";

    const e = escapeHtml;
    const u = safePrintUrl;
    const owner = clients.find((c: any) => c.id === (animal.client_id || animal.dbClientId));
    const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : (animal.owner || "—");

    const sectionsHtml: string[] = [];

    if (sections.identity) {
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.identityHeading"))}</h2>
          <table class="info">
            <tr><th>${e(t("print.dossier.name"))}</th><td>${e(animal.name ?? "—")}</td><th>${e(t("print.dossier.owner"))}</th><td>${e(ownerName)}</td></tr>
            <tr><th>${e(t("print.dossier.species"))}</th><td>${e(animal.species ?? animal.type ?? "—")}</td><th>${e(t("print.dossier.breed"))}</th><td>${e(animal.breed ?? "—")}</td></tr>
            <tr><th>${e(t("print.dossier.sex"))}</th><td>${e(animal.sex ?? animal.gender ?? "—")}</td><th>${e(t("print.dossier.color"))}</th><td>${e(animal.color ?? "—")}</td></tr>
            <tr><th>${e(t("print.dossier.birthDate"))}</th><td>${e(fmtDate(animal.birth_date ?? animal.birthDate))}</td><th>${e(t("print.dossier.age"))}</th><td>${e(animal.birth_date || animal.birthDate ? calculateAge(animal.birth_date ?? animal.birthDate) : "—")}</td></tr>
            <tr><th>${e(t("print.dossier.weight"))}</th><td>${e(animal.weight ? `${animal.weight} kg` : "—")}</td><th>${e(t("print.dossier.microchip"))}</th><td>${e(animal.microchip_number ?? animal.microchip ?? "—")}</td></tr>
            <tr><th>${e(t("print.dossier.sterilized"))}</th><td>${e(animal.sterilized ? tc("yes") : tc("no"))}</td><th>${e(t("print.dossier.status"))}</th><td>${e(animal.status ?? "—")}</td></tr>
          </table>
          ${animal.medical_history ? `<p><strong>${e(t("print.dossier.history"))}</strong> ${e(animal.medical_history)}</p>` : ""}
          ${animal.allergies?.length ? `<p><strong>${e(t("print.dossier.allergies"))}</strong> ${e(animal.allergies.join(", "))}</p>` : ""}
          ${animal.chronic_conditions?.length ? `<p><strong>${e(t("print.dossier.chronic"))}</strong> ${e(animal.chronic_conditions.join(", "))}</p>` : ""}
        </section>
      `);
    }

    if (sections.pedigree && pedigree) {
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.pedigree"))}</h2>
          <table class="info">
            <tr><th>${e(t("print.dossier.registration"))}</th><td>${e(pedigree.registration_number ?? "—")}</td><th>${e(t("print.dossier.origin"))}</th><td>${e(pedigree.pedigree_origin ?? "—")}</td></tr>
            <tr><th>${e(t("print.dossier.titles"))}</th><td colspan="3">${e(pedigree.titles ?? "—")}</td></tr>
            <tr><th>${e(t("print.dossier.father"))}</th><td>${e(pedigree.father_name ?? "—")} (${e(pedigree.father_breed ?? "—")}) – ${e(pedigree.father_registration ?? "")}</td>
                <th>${e(t("print.dossier.mother"))}</th><td>${e(pedigree.mother_name ?? "—")} (${e(pedigree.mother_breed ?? "—")}) – ${e(pedigree.mother_registration ?? "")}</td></tr>
          </table>
        </section>
      `);
    }

    if (sections.consultations) {
      const list = consultations.filter((c: any) => inRange(c.consultation_date));
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.consultationsHeading", { count: list.length }))}</h2>
          ${list.length === 0 ? `<p class='muted'>${e(t("print.dossier.noConsultations"))}</p>` : `
          <table class="data">
            <thead><tr><th>${e(t("dossier.table.date"))}</th><th>${e(t("dossier.table.type"))}</th><th>${e(t("dossier.table.context"))}</th><th>${e(t("dossier.table.diagnosisResults"))}</th><th>${e(t("dossier.table.treatment"))}</th><th>${e(t("dossier.table.notes"))}</th></tr></thead>
            <tbody>
              ${list.map((c: any) => {
                const linkedRx = prescriptions.filter((p: any) => p.consultation_id === c.id);
                const medNames = linkedRx
                  .flatMap((p: any) => (p.medications || []).map((m: any) => m.medication_name))
                  .filter(Boolean);
                const treatmentCell = [
                  c.treatment ?? null,
                  medNames.length ? t("print.dossier.rxAbbrev", { meds: medNames.join(", ") }) : null,
                ].filter(Boolean).join(" · ") || "—";
                return `
                <tr>
                  <td>${e(fmtDate(c.consultation_date))}</td>
                  <td>${e(c.consultation_type ?? "—")}</td>
                  <td>${e(c.symptoms ?? (c.weight ? c.weight + " kg" : "—"))}${c.temperature ? " · " + e(formatTemperature(c.temperature)) : ""}</td>
                  <td>${e(c.diagnosis ?? "—")}</td>
                  <td>${e(treatmentCell)}</td>
                  <td>${e(c.notes ?? "—")}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    if (sections.vaccinations) {
      const list = completedVaccinations;
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.vaccinationsDone", { count: list.length }))}</h2>
          ${list.length === 0 ? `<p class='muted'>${e(t("print.dossier.noVaccinations"))}</p>` : `
          <table class="data">
            <thead><tr><th>${e(t("dossier.table.date"))}</th><th>${e(t("print.dossier.vaccine"))}</th><th>${e(t("print.dossier.dose"))}</th><th>${e(t("print.dossier.type"))}</th><th>${e(t("print.dossier.manufacturer"))}</th><th>${e(t("print.dossier.batch"))}</th></tr></thead>
            <tbody>
              ${list.map((v) => `
                <tr>
                  <td>${e(formatCertDate(v.date))}</td>
                  <td>${e(v.vaccineName ?? "—")}</td>
                  <td>${e(v.doseLabel ?? "—")}</td>
                  <td>${e(v.vaccineType ?? "—")}</td>
                  <td>${e(v.manufacturer ?? "—")}</td>
                  <td>${e(v.batchNumber ?? "—")}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    if (sections.antiparasitics) {
      const list = completedAntiparasitics;
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.antiparasiticsDone", { count: list.length }))}</h2>
          ${list.length === 0 ? `<p class='muted'>${e(t("print.dossier.noAntiparasitics"))}</p>` : `
          <table class="data">
            <thead><tr><th>${e(t("dossier.table.date"))}</th><th>${e(t("print.dossier.product"))}</th><th>${e(t("print.dossier.treatment"))}</th><th>${e(t("print.dossier.type"))}</th><th>${e(t("print.dossier.activeIngredient"))}</th><th>${e(t("dossier.table.notes"))}</th></tr></thead>
            <tbody>
              ${list.map((a) => `
                <tr>
                  <td>${e(formatCertDate(a.date))}</td>
                  <td>${e(a.vaccineName ?? "—")}</td>
                  <td>${e(a.doseLabel ?? "—")}</td>
                  <td>${e(a.vaccineType ?? "—")}</td>
                  <td>${e(a.manufacturer ?? "—")}</td>
                  <td>${e(a.notes ?? "—")}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    if (sections.prescriptions) {
      const list = prescriptions.filter((p: any) => inRange(p.prescription_date));
      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("dossier.prescriptionsHeading", { count: list.length }))}</h2>
          ${list.length === 0 ? `<p class='muted'>${e(t("print.dossier.noPrescriptions"))}</p>` : list.map((p: any) => {
            const meds = Array.isArray(p.medications) ? p.medications : [];
            return `
            <div class="rx-block" style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;"><strong>${e(fmtDate(p.prescription_date))}</strong>
                · ${e(p.status ?? "—")}
                ${p.valid_until ? ` · ${e(t("dossier.validUntilLabel", { date: fmtDate(p.valid_until) }))}` : ""}
              </p>
              ${p.diagnosis ? `<p style="margin:0 0 6px;"><strong>${e(t("dossier.diagnosis"))}</strong> ${e(p.diagnosis)}</p>` : ""}
              ${meds.length === 0
                ? `<p class="muted" style="margin:0;">${e(t("dossier.noMedication"))}</p>`
                : `<table class="data">
                    <thead><tr><th>${e(t("print.dossier.medication"))}</th><th>${e(t("print.dossier.dosage"))}</th><th>${e(t("print.dossier.frequency"))}</th><th>${e(t("print.dossier.duration"))}</th><th>${e(t("print.dossier.qty"))}</th><th>${e(t("print.dossier.instructions"))}</th></tr></thead>
                    <tbody>
                      ${meds.map((m: any) => `
                        <tr>
                          <td>${e(m.medication_name ?? "—")}</td>
                          <td>${e(m.dosage ?? "—")}</td>
                          <td>${e(m.frequency ?? "—")}</td>
                          <td>${e(m.duration ?? "—")}</td>
                          <td>${e(m.quantity ?? "—")}</td>
                          <td>${e(m.instructions ?? "—")}</td>
                        </tr>`).join("")}
                    </tbody>
                  </table>`}
              ${p.notes ? `<p style="margin:6px 0 0;"><strong>${e(t("dossier.notes"))}</strong> ${e(p.notes)}</p>` : ""}
            </div>`;
          }).join("")}
        </section>
      `);
    }

    if (sections.photos) {
      const photoItems: { src: string; label: string }[] = [];
      const mainPhoto = animal.photo || animal.photo_url;
      if (mainPhoto) {
        photoItems.push({ src: mainPhoto, label: t("print.dossier.mainPhoto", { name: animal.name }) });
      }
      consultations
        .filter((c: any) => inRange(c.consultation_date))
        .forEach((c: any) => {
          (c.photos || []).forEach((src: string, idx: number) => {
            photoItems.push({
              src,
              label: t("print.dossier.consultPhoto", { date: fmtDate(c.consultation_date), n: idx + 1 }),
            });
          });
        });

      sectionsHtml.push(`
        <section class="block">
          <h2>${e(t("print.dossier.photos", { count: photoItems.length }))}</h2>
          ${photoItems.length === 0 ? `<p class='muted'>${e(t("print.dossier.noPhotos"))}</p>` : `
          <div class="photos">
            ${photoItems.map((p) => `
              <div class="photo-item">
                <div class="photo-label">${e(p.label)}</div>
                <img src="${u(p.src)}" alt="${e(p.label)}" />
              </div>`).join("")}
          </div>`}
        </section>
      `);
    }

    if (transferQrHtml) {
      sectionsHtml.push(transferQrHtml);
    }

    return buildReportDocument({
      title: t("print.dossier.docTitle", { name: animal.name }),
      watermarkHtml: buildWatermarkHtml(isFree),
      headerTitle: t("dossier.headerTitle"),
      clinic: {
        clinicName: settings.clinicName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        logo: settings.logo,
      },
      sectionsHtml: sectionsHtml.join("\n"),
      footerHtml: buildDefaultFooter(settings.clinicName, true),
    });
  };

  const createShare = async (): Promise<SharePreview> => {
    if (!animalId) throw new Error(t("dossier.animalNotFound"));
    if (!ownerConsent) {
      throw new Error(t("dossier.ownerConsentRequired"));
    }
    const owner = clients.find((c: any) => c.id === (animal.client_id || animal.dbClientId));
    const consultationsInRange = consultations.filter((c: any) => inRange(c.consultation_date));
    const payload = buildMedicalSharePayload({
      clinicName: settings.clinicName,
      owner: owner || null,
      animal,
      vaccinations: completedVaccinations as unknown as Array<Record<string, unknown>>,
      antiparasitics: completedAntiparasitics as unknown as Array<Record<string, unknown>>,
      consultations: consultationsInRange as unknown as Array<Record<string, unknown>>,
      includeVaccinations: sections.vaccinations,
      includeAntiparasitics: sections.antiparasitics,
      includeConsultations: sections.consultations,
    });
    const share = await createMedicalShare({
      animalId,
      payload,
      consent: true,
      expiresDays: Number(expiresDays) || 30,
      maxUses: 5,
    });
    const code = (share.short_code || "").toUpperCase();
    const url = medicalShareImportUrl(code || share.token);
    const qr = await qrCodeDataUrl(url, 320);
    return { url, qrDataUrl: qr, expiresAt: share.expires_at, shortCode: code };
  };

  const handleGenerateQr = async () => {
    setBusy(true);
    setCopied(false);
    setCopiedCode(false);
    try {
      const preview = await createShare();
      setSharePreview(preview);
      toast({
        title: t("dossier.codeGenerated"),
        description: t("print.dossier.codeGeneratedDesc", { code: preview.shortCode }),
      });
    } catch (e: any) {
      toast({
        title: t("dossier.generateFailed"),
        description: e?.message || t("print.dossier.generateError"),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const resolveTransferQrHtml = async (): Promise<string> => {
    if (!includeTransferQr) return "";
    const preview = sharePreview || (await createShare());
    if (!sharePreview) setSharePreview(preview);
    return buildTransferQrSectionHtml({
      qrDataUrl: preview.qrDataUrl,
      importUrl: preview.url,
      shortCode: preview.shortCode,
      expiresAt: preview.expiresAt,
    });
  };

  const openPrintDialog = async () => {
    if (!animal) return;
    setBusy(true);
    try {
      if (includeTransferQr && !ownerConsent) {
        throw new Error(t("dossier.ownerConsentPrint"));
      }
      const transferQrHtml = await resolveTransferQrHtml();
      const html = await buildHtml(transferQrHtml);
      if (!html) return;
      await printHtml(html);
    } catch (e: any) {
      toast({
        title: t("dossier.printFailed"),
        description: e?.message || t("dossier.printFailedBody"),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!sharePreview?.url) return;
    try {
      await navigator.clipboard.writeText(sharePreview.url);
      setCopied(true);
      toast({ title: t("dossier.linkCopied") });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t("dossier.copyFailed"),
        description: t("dossier.copyFailedLink"),
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    if (!sharePreview?.shortCode) return;
    try {
      await navigator.clipboard.writeText(sharePreview.shortCode);
      setCopiedCode(true);
      toast({ title: t("dossier.codeCopied"), description: sharePreview.shortCode });
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast({
        title: t("dossier.copyFailed"),
        description: t("dossier.copyFailedCode"),
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (!sharePreview) return;
    const text = t("print.dossier.shareText", {
      code: sharePreview.shortCode,
      url: sharePreview.url,
    });
    if (!navigator.share) {
      await handleCopyCode();
      return;
    }
    try {
      await navigator.share({
        title: t("dossier.shareTitle", { name: animal?.name || "animal" }),
        text,
        url: sharePreview.url,
      });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        await handleCopyCode();
      }
    }
  };

  if (!animal) return null;

  const SECTION_LABELS: Record<SectionKey, string> = {
    identity: t("dossier.sections.identity"),
    pedigree: t("dossier.sections.pedigree"),
    history: t("dossier.sections.history"),
    consultations: t("dossier.sections.consultations"),
    vaccinations: t("dossier.sections.vaccinations"),
    antiparasitics: t("dossier.sections.antiparasitics"),
    prescriptions: t("dossier.sections.prescriptions"),
    photos: t("dossier.sections.photos"),
  };

  const qrReady = includeTransferQr && ownerConsent;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setSharePreview(null);
          setCopied(false);
          setCopiedCode(false);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl w-[calc(100%-1rem)] p-4 sm:p-6 gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5 shrink-0" />
            {t("dossier.printShareTitle", { name: animal.name })}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("dossier.printShareDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("dossier.template")}</Label>
              <Select value={template} onValueChange={(v) => applyTemplate(v as Template)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">{t("dossier.templates.complete")}</SelectItem>
                  <SelectItem value="summary">{t("dossier.templates.summary")}</SelectItem>
                  <SelectItem value="vaccinations">{t("dossier.templates.vaccinationsOnly")}</SelectItem>
                  <SelectItem value="certificate">{t("dossier.templates.certificatePedigree")}</SelectItem>
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

          <div>
            <Label className="mb-2 block">{t("dossier.sectionsToInclude")}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-md">
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer min-h-9">
                  <Checkbox checked={sections[k]} onCheckedChange={() => toggle(k)} />
                  {SECTION_LABELS[k]}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={includeTransferQr}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setIncludeTransferQr(on);
                  if (!on) {
                    setOwnerConsent(false);
                    setSharePreview(null);
                  }
                }}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium inline-flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5" />
                  {t("dossier.includeTransferQr")}
                </span>
                <span className="block text-muted-foreground text-xs mt-0.5">
                  {t("dossier.includeTransferQrHint")}
                </span>
              </span>
            </label>

            {includeTransferQr && (
              <div className="space-y-3 sm:pl-6">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={ownerConsent}
                    onCheckedChange={(v) => setOwnerConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    {t("dossier.ownerConsent")}
                  </span>
                </label>
                <div className="space-y-1.5 max-w-[220px]">
                  <Label htmlFor="qr-expiry">{t("dossier.linkValidity")}</Label>
                  <Select
                    value={expiresDays}
                    onValueChange={(v) => setExpiresDays(v as "7" | "30" | "90")}
                  >
                    <SelectTrigger id="qr-expiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">{t("dossier.days", { count: 7 })}</SelectItem>
                      <SelectItem value="30">{t("dossier.days", { count: 30 })}</SelectItem>
                      <SelectItem value="90">{t("dossier.days", { count: 90 })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto gap-2"
                  disabled={!qrReady || busy}
                  onClick={() => void handleGenerateQr()}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  {t("dossier.generateQr")}
                </Button>

                {sharePreview && (
                  <div className="rounded-lg border bg-background p-3 space-y-3">
                    <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">{t("dossier.transferCode")}</div>
                        <div className="text-2xl sm:text-3xl font-bold tracking-[0.18em] font-mono text-primary select-all">
                          {sharePreview.shortCode}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={copiedCode ? "secondary" : "default"}
                        className="h-12 w-12 shrink-0"
                        onClick={() => void handleCopyCode()}
                      >
                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <img
                        src={sharePreview.qrDataUrl}
                        alt={t("dossier.qrAlt")}
                        className="w-40 h-40 sm:w-36 sm:h-36 rounded-md border bg-white"
                      />
                      <div className="flex-1 w-full space-y-2 text-sm">
                        <p className="text-muted-foreground text-xs">
                          {t("dossier.validUntil", {
                            date: new Date(sharePreview.expiresAt).toLocaleDateString(bcp47),
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("dossier.otherClinicHint")}
                        </p>
                        <Input readOnly value={sharePreview.url} className="text-xs font-mono" />
                        <div className="grid grid-cols-2 gap-2">
                          <Button type="button" variant="outline" className="gap-2" onClick={() => void handleCopyLink()}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? t("dossier.linkCopied") : t("dossier.copyLink")}
                          </Button>
                          <Button type="button" className="gap-2" onClick={() => void handleNativeShare()}>
                            <Share2 className="h-4 w-4" />
                            {t("dossier.share")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="!flex-col gap-2 sm:!flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy} className="w-full sm:w-auto">
            {t("dossier.close")}
          </Button>
          <Button
            variant="outline"
            onClick={() => void openPrintDialog()}
            className="gap-2 w-full sm:w-auto"
            disabled={busy || (includeTransferQr && !ownerConsent)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t("dossier.pdfPrint")}
          </Button>
          <Button
            onClick={() => void openPrintDialog()}
            className="gap-2 w-full sm:w-auto hidden md:inline-flex"
            disabled={busy || (includeTransferQr && !ownerConsent)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            {tc("print")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
