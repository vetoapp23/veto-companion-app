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
import { calculateAge, formatTemperature } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

  const applyTemplate = (t: Template) => {
    setTemplate(t);
    setSections(TEMPLATES[t]);
  };

  const toggle = (k: SectionKey) =>
    setSections((s) => ({ ...s, [k]: !s[k] }));

  const fmtDate = (d?: string | Date | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return String(d); }
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

    const owner = clients.find((c: any) => c.id === (animal.client_id || animal.dbClientId));
    const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : (animal.owner || "—");

    const sectionsHtml: string[] = [];

    if (sections.identity) {
      sectionsHtml.push(`
        <section class="block">
          <h2>Identité de l'animal</h2>
          <table class="info">
            <tr><th>Nom</th><td>${animal.name ?? "—"}</td><th>Propriétaire</th><td>${ownerName}</td></tr>
            <tr><th>Espèce</th><td>${animal.species ?? animal.type ?? "—"}</td><th>Race</th><td>${animal.breed ?? "—"}</td></tr>
            <tr><th>Sexe</th><td>${animal.sex ?? animal.gender ?? "—"}</td><th>Couleur</th><td>${animal.color ?? "—"}</td></tr>
            <tr><th>Date de naissance</th><td>${fmtDate(animal.birth_date ?? animal.birthDate)}</td><th>Âge</th><td>${animal.birth_date || animal.birthDate ? calculateAge(animal.birth_date ?? animal.birthDate) : "—"}</td></tr>
            <tr><th>Poids</th><td>${animal.weight ? `${animal.weight} kg` : "—"}</td><th>N° puce</th><td>${animal.microchip_number ?? animal.microchip ?? "—"}</td></tr>
            <tr><th>Stérilisé</th><td>${animal.sterilized ? "Oui" : "Non"}</td><th>Statut</th><td>${animal.status ?? "—"}</td></tr>
          </table>
          ${animal.medical_history ? `<p><strong>Antécédents :</strong> ${animal.medical_history}</p>` : ""}
          ${animal.allergies?.length ? `<p><strong>Allergies :</strong> ${animal.allergies.join(", ")}</p>` : ""}
          ${animal.chronic_conditions?.length ? `<p><strong>Maladies chroniques :</strong> ${animal.chronic_conditions.join(", ")}</p>` : ""}
        </section>
      `);
    }

    if (sections.pedigree && pedigree) {
      sectionsHtml.push(`
        <section class="block">
          <h2>Pédigrée</h2>
          <table class="info">
            <tr><th>N° enregistrement</th><td>${pedigree.registration_number ?? "—"}</td><th>Origine</th><td>${pedigree.pedigree_origin ?? "—"}</td></tr>
            <tr><th>Titres</th><td colspan="3">${pedigree.titles ?? "—"}</td></tr>
            <tr><th>Père</th><td>${pedigree.father_name ?? "—"} (${pedigree.father_breed ?? "—"}) – ${pedigree.father_registration ?? ""}</td>
                <th>Mère</th><td>${pedigree.mother_name ?? "—"} (${pedigree.mother_breed ?? "—"}) – ${pedigree.mother_registration ?? ""}</td></tr>
          </table>
        </section>
      `);
    }

    if (sections.consultations) {
      const list = consultations.filter((c: any) => inRange(c.consultation_date));
      sectionsHtml.push(`
        <section class="block">
          <h2>Consultations & examens (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucune consultation</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Type</th><th>Contexte</th><th>Diagnostic / résultats</th><th>Traitement</th><th>Notes</th></tr></thead>
            <tbody>
              ${list.map((c: any) => {
                const linkedRx = prescriptions.filter((p: any) => p.consultation_id === c.id);
                const medNames = linkedRx
                  .flatMap((p: any) => (p.medications || []).map((m: any) => m.medication_name))
                  .filter(Boolean);
                const treatmentCell = [
                  c.treatment ?? null,
                  medNames.length ? `Ordo. : ${medNames.join(", ")}` : null,
                ].filter(Boolean).join(" · ") || "—";
                return `
                <tr>
                  <td>${fmtDate(c.consultation_date)}</td>
                  <td>${c.consultation_type ?? "—"}</td>
                  <td>${c.symptoms ?? (c.weight ? c.weight + " kg" : "—")}${c.temperature ? " · " + formatTemperature(c.temperature) : ""}</td>
                  <td>${c.diagnosis ?? "—"}</td>
                  <td>${treatmentCell}</td>
                  <td>${c.notes ?? "—"}</td>
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
          <h2>Vaccinations réalisées (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucune vaccination réalisée</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Vaccin</th><th>Dose</th><th>Type</th><th>Fabricant</th><th>Lot</th></tr></thead>
            <tbody>
              ${list.map((v) => `
                <tr>
                  <td>${formatCertDate(v.date)}</td>
                  <td>${v.vaccineName ?? "—"}</td>
                  <td>${v.doseLabel ?? "—"}</td>
                  <td>${v.vaccineType ?? "—"}</td>
                  <td>${v.manufacturer ?? "—"}</td>
                  <td>${v.batchNumber ?? "—"}</td>
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
          <h2>Antiparasitaires réalisés (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucun traitement réalisé</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Produit</th><th>Traitement</th><th>Type</th><th>Principe actif</th><th>Notes</th></tr></thead>
            <tbody>
              ${list.map((a) => `
                <tr>
                  <td>${formatCertDate(a.date)}</td>
                  <td>${a.vaccineName ?? "—"}</td>
                  <td>${a.doseLabel ?? "—"}</td>
                  <td>${a.vaccineType ?? "—"}</td>
                  <td>${a.manufacturer ?? "—"}</td>
                  <td>${a.notes ?? "—"}</td>
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
          <h2>Ordonnances (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucune ordonnance</p>" : list.map((p: any) => {
            const meds = Array.isArray(p.medications) ? p.medications : [];
            return `
            <div class="rx-block" style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;"><strong>${fmtDate(p.prescription_date)}</strong>
                · ${p.status ?? "—"}
                ${p.valid_until ? ` · Valide jusqu'au ${fmtDate(p.valid_until)}` : ""}
              </p>
              ${p.diagnosis ? `<p style="margin:0 0 6px;"><strong>Diagnostic :</strong> ${p.diagnosis}</p>` : ""}
              ${meds.length === 0
                ? `<p class="muted" style="margin:0;">Aucun médicament enregistré</p>`
                : `<table class="data">
                    <thead><tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th><th>Qté</th><th>Instructions</th></tr></thead>
                    <tbody>
                      ${meds.map((m: any) => `
                        <tr>
                          <td>${m.medication_name ?? "—"}</td>
                          <td>${m.dosage ?? "—"}</td>
                          <td>${m.frequency ?? "—"}</td>
                          <td>${m.duration ?? "—"}</td>
                          <td>${m.quantity ?? "—"}</td>
                          <td>${m.instructions ?? "—"}</td>
                        </tr>`).join("")}
                    </tbody>
                  </table>`}
              ${p.notes ? `<p style="margin:6px 0 0;"><strong>Notes :</strong> ${p.notes}</p>` : ""}
            </div>`;
          }).join("")}
        </section>
      `);
    }

    if (sections.photos) {
      const photoItems: { src: string; label: string }[] = [];
      const mainPhoto = animal.photo || animal.photo_url;
      if (mainPhoto) {
        photoItems.push({ src: mainPhoto, label: `Photo principale — ${animal.name}` });
      }
      consultations
        .filter((c: any) => inRange(c.consultation_date))
        .forEach((c: any) => {
          (c.photos || []).forEach((src: string, idx: number) => {
            photoItems.push({
              src,
              label: `Consultation ${fmtDate(c.consultation_date)} — photo ${idx + 1}`,
            });
          });
        });

      sectionsHtml.push(`
        <section class="block">
          <h2>Photos (${photoItems.length})</h2>
          ${photoItems.length === 0 ? "<p class='muted'>Aucune photo.</p>" : `
          <div class="photos">
            ${photoItems.map((p) => `
              <div class="photo-item">
                <div class="photo-label">${p.label}</div>
                <img src="${p.src}" alt="${p.label}" />
              </div>`).join("")}
          </div>`}
        </section>
      `);
    }

    if (transferQrHtml) {
      sectionsHtml.push(transferQrHtml);
    }

    return buildReportDocument({
      title: `Dossier médical - ${animal.name}`,
      watermarkHtml: buildWatermarkHtml(isFree),
      headerTitle: "Dossier médical vétérinaire",
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
    if (!animalId) throw new Error("Animal introuvable");
    if (!ownerConsent) {
      throw new Error("Confirmez le consentement du propriétaire pour générer le QR.");
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
        title: "Code généré",
        description: `Code ${preview.shortCode} — partagez-le ou le QR.`,
      });
    } catch (e: any) {
      toast({
        title: "Génération impossible",
        description: e?.message || "Erreur lors de la génération",
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
        throw new Error("Confirmez le consentement du propriétaire pour inclure le QR.");
      }
      const transferQrHtml = await resolveTransferQrHtml();
      const html = await buildHtml(transferQrHtml);
      if (!html) return;
      await printHtml(html);
    } catch (e: any) {
      toast({
        title: "Impression impossible",
        description: e?.message || "Réessayez ou utilisez « Générer le QR » puis partagez le lien.",
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
      toast({ title: "Lien copié" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copie impossible",
        description: "Sélectionnez le lien manuellement.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    if (!sharePreview?.shortCode) return;
    try {
      await navigator.clipboard.writeText(sharePreview.shortCode);
      setCopiedCode(true);
      toast({ title: "Code copié", description: sharePreview.shortCode });
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast({
        title: "Copie impossible",
        description: "Notez le code manuellement.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (!sharePreview) return;
    const text = `Code transfert VetoCrm : ${sharePreview.shortCode}\n${sharePreview.url}`;
    if (!navigator.share) {
      await handleCopyCode();
      return;
    }
    try {
      await navigator.share({
        title: `Dossier ${animal?.name || "animal"} — VetoCrm`,
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
    identity: "Identité",
    pedigree: "Pédigrée",
    history: "Historique général",
    consultations: "Consultations & examens",
    vaccinations: "Vaccinations",
    antiparasitics: "Antiparasitaires",
    prescriptions: "Ordonnances",
    photos: "Photos",
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
            Imprimer / partager — {animal.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Choisissez les sections. Sur mobile, générez d’abord le QR puis partagez le lien.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Modèle</Label>
              <Select value={template} onValueChange={(v) => applyTemplate(v as Template)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Dossier complet</SelectItem>
                  <SelectItem value="summary">Résumé</SelectItem>
                  <SelectItem value="vaccinations">Vaccinations uniquement</SelectItem>
                  <SelectItem value="certificate">Certificat / pédigrée</SelectItem>
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

          <div>
            <Label className="mb-2 block">Sections à inclure</Label>
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
                  Inclure un QR de transfert
                </span>
                <span className="block text-muted-foreground text-xs mt-0.5">
                  Générez un code court (comme l’invitation clinique) + QR, puis partagez ou imprimez.
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
                    Le propriétaire autorise le partage de ces données médicales via ce lien.
                  </span>
                </label>
                <div className="space-y-1.5 max-w-[220px]">
                  <Label htmlFor="qr-expiry">Validité du lien</Label>
                  <Select
                    value={expiresDays}
                    onValueChange={(v) => setExpiresDays(v as "7" | "30" | "90")}
                  >
                    <SelectTrigger id="qr-expiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
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
                  Générer le code / QR
                </Button>

                {sharePreview && (
                  <div className="rounded-lg border bg-background p-3 space-y-3">
                    <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Code de transfert</div>
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
                        alt="QR transfert"
                        className="w-40 h-40 sm:w-36 sm:h-36 rounded-md border bg-white"
                      />
                      <div className="flex-1 w-full space-y-2 text-sm">
                        <p className="text-muted-foreground text-xs">
                          Valable jusqu’au{" "}
                          {new Date(sharePreview.expiresAt).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          L’autre clinique saisit ce code dans Animaux → Importer dossier (QR).
                        </p>
                        <Input readOnly value={sharePreview.url} className="text-xs font-mono" />
                        <div className="grid grid-cols-2 gap-2">
                          <Button type="button" variant="outline" className="gap-2" onClick={() => void handleCopyLink()}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Lien copié" : "Copier lien"}
                          </Button>
                          <Button type="button" className="gap-2" onClick={() => void handleNativeShare()}>
                            <Share2 className="h-4 w-4" />
                            Partager
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
            Fermer
          </Button>
          <Button
            variant="outline"
            onClick={() => void openPrintDialog()}
            className="gap-2 w-full sm:w-auto"
            disabled={busy || (includeTransferQr && !ownerConsent)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF / Imprimer
          </Button>
          <Button
            onClick={() => void openPrintDialog()}
            className="gap-2 w-full sm:w-auto hidden md:inline-flex"
            disabled={busy || (includeTransferQr && !ownerConsent)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Imprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
