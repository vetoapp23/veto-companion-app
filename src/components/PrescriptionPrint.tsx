import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { Prescription } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { printHtml, downloadHtmlAsPdf } from "@/lib/htmlToPdf";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getBcp47Locale } from "@/i18n/useAppLocale";

interface PrescriptionPrintProps {
  prescription: Prescription;
  /** Affiche uniquement l'icône (liste compacte) */
  compact?: boolean;
}

export function PrescriptionPrint({ prescription, compact = false }: PrescriptionPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { toast } = useToast();
  const { t, i18n } = useTranslation("medical");
  const [busy, setBusy] = useState<"print" | "download" | null>(null);
  const prescriber = prescription.prescribedBy;

  const buildHtml = (): string => {
    const medLines = prescription.medications
      .map((med, index) => {
        const parts = [
          med.name,
          med.dosage || "",
          med.frequency || "",
          med.duration ? t("print.prescription.forDuration", { duration: med.duration }) : "",
          med.quantity
            ? t("print.prescription.qty", {
                qty: `${med.quantity}${med.unit ? ` ${med.unit}` : ""}`,
              })
            : "",
          med.refills && med.refills > 0
            ? t("print.prescription.refills", { count: med.refills })
            : "",
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
          <title>${t("print.prescription.docTitle", { name: prescription.petName })}</title>
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
            ${settings.logo ? `<img src="${settings.logo}" alt="${t("print.prescription.clinicLogoAlt")}" style="height:64px;margin-bottom:8px;"/>` : ""}
            <h1>${t("print.prescription.heading")}</h1>
            <h2>${settings.clinicName || ""}</h2>
            <p>${settings.address || ""}</p>
            <p>${t("print.prescription.tel")} ${settings.phone || ""} | ${t("print.prescription.email")} ${settings.email || ""}</p>
          </div>

          <div class="meta">
            <p><strong>${t("print.prescription.date")}</strong> ${new Date(prescription.date).toLocaleDateString(getBcp47Locale(i18n.language))}</p>
            <p><strong>${t("print.prescription.prescribedBy")}</strong> ${prescriber || "—"}</p>
          </div>

          <div class="patient">
            <p class="section-title">${t("print.prescription.patient")}</p>
            <p><strong>${t("print.prescription.owner")}</strong> ${prescription.clientName}</p>
            <p><strong>${t("print.prescription.animal")}</strong> ${prescription.petName}</p>
            ${prescription.diagnosis ? `<p><strong>${t("print.prescription.diagnosis")}</strong> ${prescription.diagnosis}</p>` : ""}
            ${prescription.duration ? `<p><strong>${t("print.prescription.validity")}</strong> ${prescription.duration}</p>` : ""}
          </div>

          <p class="rp-mark">Rp/</p>
          <div class="medications">
            ${medLines || `<p>${t("print.prescription.noMeds")}</p>`}
          </div>

          ${
            prescription.instructions
              ? `<div class="notes"><p class="section-title">${t("print.prescription.generalInstructions")}</p><p>${prescription.instructions}</p></div>`
              : ""
          }
          ${
            prescription.followUpDate
              ? `<div class="notes"><p><strong>${t("print.prescription.followUpScheduled")}</strong> ${new Date(prescription.followUpDate).toLocaleDateString(getBcp47Locale(i18n.language))}</p></div>`
              : ""
          }
          ${
            prescription.notes && prescription.notes !== prescription.instructions
              ? `<div class="notes"><p class="section-title">${t("print.prescription.notes")}</p><p>${prescription.notes}</p></div>`
              : ""
          }

          <div class="footer">
            <div class="signature-block">
              <div class="signature-line"></div>
              <p>${t("print.prescription.vetSignature")}</p>
            </div>
            <small>${t("print.prescription.validityNote")}</small>
          </div>
        </body>
      </html>
    `;
  };

  const ensureValid = () => {
    if (!prescription?.petName || !prescription?.clientName) {
      toast({
        title: t("print.prescription.incompleteTitle"),
        description: t("print.prescription.incompleteBody"),
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
        title: t("print.prescription.printFailedTitle"),
        description: e?.message || t("print.prescription.printFailedBody"),
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
      const filename = `prescription-${prescription.petName}-${new Date(prescription.date).toISOString().slice(0, 10)}.pdf`;
      await downloadHtmlAsPdf(buildHtml(), filename);
      toast({
        title: t("print.prescription.downloadTitle"),
        description: t("print.prescription.downloadBody"),
      });
    } catch (e: any) {
      toast({
        title: t("print.prescription.downloadFailedTitle"),
        description: e?.message || t("print.prescription.printFailedBody"),
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
          title={t("print.prescription.printRx")}
        >
          <Printer className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={!!busy}
          className="h-8 w-8 p-0"
          title={t("print.prescription.downloadRx")}
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
        {busy === "print" ? t("print.prescription.opening") : t("print.prescription.print")}
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={!!busy} className="gap-2">
        <Download className="h-4 w-4" />
        {busy === "download" ? t("print.prescription.opening") : t("print.prescription.downloadPdf")}
      </Button>
    </div>
  );
}
