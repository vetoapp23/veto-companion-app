import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, FileText } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import {
  useConsultationsByAnimal,
  useVaccinationsByAnimal,
  useAntiparasiticsByAnimal,
  usePrescriptionsByAnimal,
  useClients,
} from "@/hooks/useDatabase";
import { usePedigree } from "@/hooks/usePedigree";
import { calculateAge } from "@/lib/utils";

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

export function PrintMedicalRecordModal({ open, onOpenChange, animal }: PrintMedicalRecordModalProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const animalId = animal?.id || animal?.dbId;
  const { data: consultations = [] } = useConsultationsByAnimal(animalId);
  const { data: vaccinations = [] } = useVaccinationsByAnimal(animalId);
  const { data: antiparasitics = [] } = useAntiparasiticsByAnimal(animalId);
  const { data: prescriptions = [] } = usePrescriptionsByAnimal(animalId);
  const { data: pedigree } = usePedigree(animalId);
  const { data: clients = [] } = useClients();

  const [template, setTemplate] = useState<Template>("complete");
  const [sections, setSections] = useState<Record<SectionKey, boolean>>(TEMPLATES.complete);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const handlePrint = () => {
    if (!animal) return;
    const win = window.open("", "_blank");
    if (!win) return;

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
          <h2>Consultations (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucune consultation</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Type</th><th>Poids</th><th>T°</th><th>Diagnostic</th><th>Traitement</th></tr></thead>
            <tbody>
              ${list.map((c: any) => `
                <tr>
                  <td>${fmtDate(c.consultation_date)}</td>
                  <td>${c.consultation_type ?? "—"}</td>
                  <td>${c.weight ? c.weight + " kg" : "—"}</td>
                  <td>${c.temperature ? c.temperature + "°C" : "—"}</td>
                  <td>${c.diagnosis ?? "—"}</td>
                  <td>${c.treatment ?? "—"}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    if (sections.vaccinations) {
      const list = vaccinations.filter((v: any) => inRange(v.vaccination_date));
      sectionsHtml.push(`
        <section class="block">
          <h2>Vaccinations (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucune vaccination</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Vaccin</th><th>Type</th><th>Fabricant</th><th>Lot</th><th>Rappel</th></tr></thead>
            <tbody>
              ${list.map((v: any) => `
                <tr>
                  <td>${fmtDate(v.vaccination_date)}</td>
                  <td>${v.vaccine_name ?? "—"}</td>
                  <td>${v.vaccine_type ?? "—"}</td>
                  <td>${v.manufacturer ?? "—"}</td>
                  <td>${v.batch_number ?? "—"}</td>
                  <td>${fmtDate(v.next_due_date)}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    if (sections.antiparasitics) {
      const list = antiparasitics.filter((a: any) => inRange(a.treatment_date));
      sectionsHtml.push(`
        <section class="block">
          <h2>Antiparasitaires (${list.length})</h2>
          ${list.length === 0 ? "<p class='muted'>Aucun traitement</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Produit</th><th>Principe actif</th><th>Type</th><th>Dosage</th><th>Prochain</th></tr></thead>
            <tbody>
              ${list.map((a: any) => `
                <tr>
                  <td>${fmtDate(a.treatment_date)}</td>
                  <td>${a.product_name ?? "—"}</td>
                  <td>${a.active_ingredient ?? "—"}</td>
                  <td>${a.parasite_type ?? "—"}</td>
                  <td>${a.dosage ?? "—"}</td>
                  <td>${fmtDate(a.next_treatment_date)}</td>
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
          ${list.length === 0 ? "<p class='muted'>Aucune ordonnance</p>" : `
          <table class="data">
            <thead><tr><th>Date</th><th>Diagnostic</th><th>Statut</th><th>Validité</th></tr></thead>
            <tbody>
              ${list.map((p: any) => `
                <tr>
                  <td>${fmtDate(p.prescription_date)}</td>
                  <td>${p.diagnosis ?? "—"}</td>
                  <td>${p.status ?? "—"}</td>
                  <td>${fmtDate(p.valid_until)}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
        </section>
      `);
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Dossier médical - ${animal.name}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 32px; line-height: 1.5; }
        .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 3px solid hsl(160, 60%, 40%); margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0; color: hsl(160, 60%, 30%); letter-spacing: 0.3px; }
        .clinic { text-align: right; font-size: 12px; color: #555; }
        .clinic strong { display: block; font-size: 14px; color: #111; }
        .block { margin-bottom: 22px; page-break-inside: avoid; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: hsl(160, 60%, 30%); border-left: 4px solid hsl(160, 60%, 40%); padding-left: 10px; margin: 0 0 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        table.info th { background: #f3f8f6; text-align: left; font-weight: 600; padding: 6px 8px; width: 22%; color: #444; }
        table.info td { padding: 6px 8px; border-bottom: 1px solid #eee; }
        table.data th { background: hsl(160, 60%, 96%); padding: 8px; text-align: left; border-bottom: 2px solid hsl(160, 60%, 40%); font-size: 11px; }
        table.data td { padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
        table.data tr:nth-child(even) td { background: #fafafa; }
        .muted { color: #888; font-style: italic; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #555; display: flex; justify-content: space-between; }
        .footer .sig { width: 220px; text-align: center; }
        .footer .sig .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 4px; }
        ${watermarkStyle}
        @media print { body { padding: 16px; } }
      </style>
    </head><body>
      ${buildWatermarkHtml(isFree)}
      <div class="header">
        <div>
          ${settings.logo ? `<img src="${settings.logo}" style="max-height:50px;"/>` : ""}
          <h1>Dossier médical vétérinaire</h1>
        </div>
        <div class="clinic">
          <strong>${settings.clinicName ?? ""}</strong>
          ${settings.address ?? ""}<br/>
          ${settings.phone ?? ""} · ${settings.email ?? ""}
        </div>
      </div>
      ${sectionsHtml.join("\n")}
      <div class="footer">
        <div>Document généré le ${new Date().toLocaleDateString("fr-FR")}</div>
        <div class="sig"><div class="line">Signature et cachet</div></div>
      </div>
    </body></html>`;

    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!animal) return null;

  const SECTION_LABELS: Record<SectionKey, string> = {
    identity: "Identité",
    pedigree: "Pédigrée",
    history: "Historique général",
    consultations: "Consultations",
    vaccinations: "Vaccinations",
    antiparasitics: "Antiparasitaires",
    prescriptions: "Ordonnances",
    photos: "Photos",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Imprimer le dossier médical
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le modèle puis les sections à inclure pour {animal.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sections[k]} onCheckedChange={() => toggle(k)} />
                  {SECTION_LABELS[k]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Imprimer / PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
