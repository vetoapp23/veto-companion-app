// @ts-nocheck
import { type Consultation } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { escapeHtml, formatTemperature } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { getBcp47Locale } from "@/i18n/useAppLocale";

interface ConsultationPrintProps {
  consultation: Consultation;
}

export function ConsultationPrintNew({ consultation }: ConsultationPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { t, i18n } = useTranslation("medical");
  const { t: tc } = useTranslation("common");

  const handlePrint = () => {
    try {
      // Create a new window with a unique name to avoid popup blocking in some browsers
      const printWindow = window.open('', `print_consultation_${consultation.id}`, 'height=800,width=800');
      if (!printWindow) {
        alert(t("print.consultation.popupBlocked"));
        return;
      }

      const e = escapeHtml;
      const animalName = consultation.animal?.name || t("print.consultation.animalFallback");
      const na = "N/A";
      const ageYears = consultation.animal?.birth_date
        ? t("print.consultation.years", {
            count: Math.floor(
              (new Date().getTime() - new Date(consultation.animal.birth_date).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            ),
          })
        : na;

      const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${e(t("print.consultation.docTitle", { name: animalName }))}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .clinic-info {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            .consultation-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .info-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .info-content {
              color: #666;
            }
            .medical-section {
              margin-bottom: 20px;
            }
            .medical-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
              border-bottom: 1px solid #eee;
              padding-bottom: 4px;
            }
            .medical-content {
              color: #666;
              margin-bottom: 15px;
            }
            .vitals {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .vital-item {
              text-align: center;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .vital-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .vital-value {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header { page-break-after: avoid; }
              @page { size: auto; margin: 10mm; }
            }
            ${watermarkStyle}
          </style>
        </head>
        <body>
          ${buildWatermarkHtml(isFree)}
          <div class="header">
            <h1>${e(settings.clinicName || t("print.consultation.clinicFallback"))}</h1>
            <div class="clinic-info">
              <p>${e(settings.address || '')}</p>
              <p>${e(t("print.consultation.tel"))} ${e(settings.phone || '')} | ${e(t("print.consultation.email"))} ${e(settings.email || '')}</p>
            </div>
            <h2>${e(t("print.consultation.reportTitle"))}</h2>
          </div>

          <div class="consultation-info">
            <div class="info-section">
              <div class="info-title">${e(t("print.consultation.clientInfo"))}</div>
              <div class="info-content">
                <strong>${e(t("print.consultation.name"))}</strong> ${e(consultation.client?.first_name || '')} ${e(consultation.client?.last_name || '')}<br>
                <strong>${e(t("print.consultation.phone"))}</strong> ${e(consultation.client?.phone || na)}<br>
                <strong>${e(t("print.consultation.email"))}</strong> ${e(consultation.client?.email || na)}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-title">${e(t("print.consultation.animalInfo"))}</div>
              <div class="info-content">
                <strong>${e(t("print.consultation.animalName"))}</strong> ${e(consultation.animal?.name || na)}<br>
                <strong>${e(t("print.consultation.species"))}</strong> ${e(consultation.animal?.species || na)}<br>
                <strong>${e(t("print.consultation.breed"))}</strong> ${e(consultation.animal?.breed || na)}<br>
                <strong>${e(t("print.consultation.age"))}</strong> ${e(ageYears)}
              </div>
            </div>
          </div>

          <div class="info-section" style="margin-bottom: 20px;">
            <div class="info-title">${e(t("print.consultation.detailsTitle"))}</div>
            <div class="info-content">
              <strong>${e(t("print.consultation.date"))}</strong> ${e(new Date(consultation.consultation_date).toLocaleDateString(getBcp47Locale(i18n.language)))}<br>
              <strong>${e(t("print.consultation.type"))}</strong> ${e(consultation.consultation_type || t("print.consultation.routine"))}<br>
              <strong>${e(t("print.consultation.status"))}</strong> ${e(consultation.status || t("print.consultation.completed"))}
            </div>
          </div>

          ${consultation.weight || consultation.temperature || consultation.heart_rate || consultation.respiratory_rate ? `
          <div class="vitals">
            ${consultation.weight ? `
            <div class="vital-item">
              <div class="vital-label">${e(t("print.consultation.weight"))}</div>
              <div class="vital-value">${e(consultation.weight)} kg</div>
            </div>
            ` : ''}
            ${consultation.temperature ? `
            <div class="vital-item">
              <div class="vital-label">${e(t("print.consultation.temperature"))}</div>
              <div class="vital-value">${e(formatTemperature(consultation.temperature))}</div>
            </div>
            ` : ''}
            ${consultation.heart_rate ? `
            <div class="vital-item">
              <div class="vital-label">${e(t("print.consultation.heartRate"))}</div>
              <div class="vital-value">${e(consultation.heart_rate)} bpm</div>
            </div>
            ` : ''}
            ${consultation.respiratory_rate ? `
            <div class="vital-item">
              <div class="vital-label">${e(t("print.consultation.respiratoryRate"))}</div>
              <div class="vital-value">${e(consultation.respiratory_rate)}/min</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${consultation.symptoms ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.symptoms"))}</div>
            <div class="medical-content">${e(consultation.symptoms)}</div>
          </div>
          ` : ''}

          ${consultation.diagnosis ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.diagnosis"))}</div>
            <div class="medical-content">${e(consultation.diagnosis)}</div>
          </div>
          ` : ''}

          ${consultation.treatment ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.treatment"))}</div>
            <div class="medical-content">${e(consultation.treatment)}</div>
          </div>
          ` : ''}

          ${consultation.notes ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.notes"))}</div>
            <div class="medical-content">${e(consultation.notes)}</div>
          </div>
          ` : ''}

          ${consultation.follow_up_date ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.followUp"))}</div>
            <div class="medical-content">
              <strong>${e(t("print.consultation.date"))}</strong> ${e(new Date(consultation.follow_up_date).toLocaleDateString(getBcp47Locale(i18n.language)))}<br>
              ${consultation.follow_up_notes ? `<strong>${e(t("print.consultation.notes"))}</strong> ${e(consultation.follow_up_notes)}` : ''}
            </div>
          </div>
          ` : ''}

          ${consultation.cost ? `
          <div class="medical-section">
            <div class="medical-title">${e(t("print.consultation.cost"))}</div>
            <div class="medical-content">
              <strong>${e(consultation.cost)} ${e(settings.currency || 'EUR')}</strong>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>${e(t("print.consultation.reportGenerated", {
              date: new Date().toLocaleDateString(getBcp47Locale(i18n.language)),
              time: new Date().toLocaleTimeString(getBcp47Locale(i18n.language)),
            }))}</p>
            <p>${e(t("print.consultation.veterinarian"))} ${e(consultation.veterinarian_id || na)}</p>
          </div>
        </body>
      </html>
    `;

    // Make sure window is fully loaded before trying to print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      try {
        // Delay to ensure styles are applied
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Only close window after print dialog is closed or printing is done
          if (typeof printWindow.onafterprint === 'function') {
            printWindow.onafterprint = function() {
              try {
                printWindow.close();
              } catch (e) {
                console.error("Error closing print window:", e);
              }
            };
          } else {
            // For browsers that don't support onafterprint
            setTimeout(() => {
              try {
                printWindow.close();
              } catch (e) {
                console.error("Error closing print window after timeout:", e);
              }
            }, 2000);
          }
        }, 500);
      } catch (printError) {
        console.error("Error during print process:", printError);
        alert(t("print.consultation.printError"));
      }
    };
  } catch (error) {
    console.error("Error in print function:", error);
    alert(t("print.consultation.prepareError"));
  }
};

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handlePrint}
      className="gap-1"
    >
      <Printer className="h-3 w-3" />
      {tc("print")}
    </Button>
  );
}
