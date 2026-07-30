import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { Prescription } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { printHtml, downloadHtmlAsPdf } from "@/lib/htmlToPdf";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionPrintProps {
  prescription: Prescription;
  /** Affiche uniquement l'icône (liste compacte) */
  compact?: boolean;
}

export function PrescriptionPrint({ prescription, compact = false }: PrescriptionPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { toast } = useToast();
  const [busy, setBusy] = useState<"print" | "download" | null>(null);
  const prescriber = prescription.prescribedBy;

  const buildHtml = (): string => {
    const medLines = prescription.medications
      .map((med, index) => {
        const parts = [
          med.name,
          med.dosage || "",
          med.frequency || "",
          med.duration ? `pendant ${med.duration}` : "",
          med.quantity ? `Qté : ${med.quantity}${med.unit ? ` ${med.unit}` : ""}` : "",
          med.refills && med.refills > 0 ? `Renouv. : ${med.refills}` : "",
        ].filter(Boolean);

        return `
          <p class="rx-line">
            <span class="rx-num">${index + 1}.</span>
            <span class="rx-text"><strong>${parts[0]}</strong>${
              parts.length > 1 ? ` — ${parts.slice(1).join(" — ")}` : ""
            }</span>
          </p>
          ${
            med.instructions
              ? `<p class="rx-instr">${med.instructions}</p>`
              : ""
          }`;
      })
      .join("");

    return `
      <html>
        <head>
          <title>Ordonnance - ${prescription.petName}</title>
          <style>
            @page { margin: 16mm; }
            body {
              font-family: "Times New Roman", Times, Georgia, serif;
              margin: 0;
              padding: 16px 28px;
              color: #111;
              font-size: 18px;
              line-height: 1.65;
            }
            .header {
              text-align: center;
              padding-bottom: 16px;
              border-bottom: 2px solid #222;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              letter-spacing: 0.04em;
              margin: 10px 0 6px;
              font-weight: 700;
            }
            .header h2 {
              font-size: 22px;
              margin: 0 0 8px;
              font-weight: 600;
            }
            .header p {
              margin: 2px 0;
              font-size: 16px;
              color: #333;
            }
            .meta {
              margin: 16px 0 20px;
              font-size: 18px;
            }
            .meta p { margin: 4px 0; }
            .section-title {
              font-size: 17px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              margin: 20px 0 10px;
              padding-bottom: 3px;
              border-bottom: 1px solid #ccc;
            }
            .patient p {
              margin: 5px 0;
              font-size: 18px;
            }
            .rp-mark {
              font-family: Georgia, "Times New Roman", serif;
              font-size: 36px;
              font-weight: 700;
              font-style: italic;
              margin: 22px 0 14px;
            }
            .medications {
              margin: 0 0 12px 4px;
            }
            .rx-line {
              margin: 0 0 14px;
              font-size: 20px;
              line-height: 1.5;
            }
            .rx-num {
              display: inline-block;
              min-width: 1.6em;
              font-weight: 700;
            }
            .rx-text { }
            .rx-instr {
              margin: -8px 0 14px 1.6em;
              font-size: 16px;
              font-style: italic;
              color: #333;
            }
            .notes {
              margin-top: 18px;
              font-size: 17px;
            }
            .notes p { margin: 5px 0; }
            .footer {
              margin-top: 56px;
              text-align: right;
            }
            .signature-block {
              display: inline-block;
              text-align: center;
              min-width: 240px;
              font-size: 17px;
            }
            .signature-line {
              border-top: 1.5px solid #222;
              margin: 48px 0 8px;
            }
            .footer small {
              display: block;
              text-align: center;
              margin-top: 32px;
              font-size: 13px;
              color: #555;
            }
            ${watermarkStyle}
          </style>
        </head>
        <body>
          ${buildWatermarkHtml(isFree)}
          <div class="header">
            ${settings.logo ? `<img src="${settings.logo}" alt="Logo clinique" style="height:64px;margin-bottom:8px;"/>` : ""}
            <h1>ORDONNANCE MÉDICALE</h1>
            <h2>${settings.clinicName || ""}</h2>
            <p>${settings.address || ""}</p>
            <p>Tél: ${settings.phone || ""} | Email: ${settings.email || ""}</p>
          </div>

          <div class="meta">
            <p><strong>Date :</strong> ${new Date(prescription.date).toLocaleDateString("fr-FR")}</p>
            <p><strong>Prescrit par :</strong> ${prescriber || "—"}</p>
          </div>

          <div class="patient">
            <p class="section-title">Patient</p>
            <p><strong>Propriétaire :</strong> ${prescription.clientName}</p>
            <p><strong>Animal :</strong> ${prescription.petName}</p>
            ${prescription.diagnosis ? `<p><strong>Diagnostic :</strong> ${prescription.diagnosis}</p>` : ""}
            ${prescription.duration ? `<p><strong>Validité :</strong> ${prescription.duration}</p>` : ""}
          </div>

          <p class="rp-mark">Rp/</p>
          <div class="medications">
            ${medLines || "<p>Aucun médicament prescrit.</p>"}
          </div>

          ${
            prescription.instructions
              ? `<div class="notes"><p class="section-title">Instructions générales</p><p>${prescription.instructions}</p></div>`
              : ""
          }
          ${
            prescription.followUpDate
              ? `<div class="notes"><p><strong>Suivi prévu :</strong> ${new Date(prescription.followUpDate).toLocaleDateString("fr-FR")}</p></div>`
              : ""
          }
          ${
            prescription.notes && prescription.notes !== prescription.instructions
              ? `<div class="notes"><p class="section-title">Notes</p><p>${prescription.notes}</p></div>`
              : ""
          }

          <div class="footer">
            <div class="signature-block">
              <div class="signature-line"></div>
              <p>Signature du vétérinaire</p>
            </div>
            <small>Cette ordonnance est valable pour la durée du traitement prescrit.</small>
          </div>
        </body>
      </html>
    `;
  };

  const ensureValid = () => {
    if (!prescription?.petName || !prescription?.clientName) {
      toast({
        title: "Ordonnance incomplete",
        description: "Animal ou propriétaire manquant.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePrint = async () => {
    if (!ensureValid()) return;
    setBusy("print");
    try {
      await printHtml(buildHtml());
    } catch (e: any) {
      toast({
        title: "Impression impossible",
        description: e?.message || "Autorisez les popups.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    if (!ensureValid()) return;
    setBusy("download");
    try {
      const filename = `ordonnance-${prescription.petName}-${new Date(prescription.date).toISOString().slice(0, 10)}.pdf`;
      await downloadHtmlAsPdf(buildHtml(), filename);
      toast({
        title: "Téléchargement",
        description: "Choisissez « Enregistrer au format PDF » dans la boîte d'impression.",
      });
    } catch (e: any) {
      toast({
        title: "Téléchargement impossible",
        description: e?.message || "Autorisez les popups.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  if (compact) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          disabled={!!busy}
          className="h-8 w-8 p-0"
          title="Imprimer l'ordonnance"
        >
          <Printer className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={!!busy}
          className="h-8 w-8 p-0"
          title="Télécharger l'ordonnance (PDF)"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={handlePrint} disabled={!!busy} className="gap-2">
        <Printer className="h-4 w-4" />
        {busy === "print" ? "Ouverture…" : "Imprimer"}
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={!!busy} className="gap-2">
        <Download className="h-4 w-4" />
        {busy === "download" ? "Ouverture…" : "Télécharger PDF"}
      </Button>
    </div>
  );
}
