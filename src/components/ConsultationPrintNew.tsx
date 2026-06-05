// @ts-nocheck
import { type Consultation } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";

interface ConsultationPrintProps {
  consultation: Consultation;
}

export function ConsultationPrintNew({ consultation }: ConsultationPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  
  const handlePrint = () => {
    try {
      // Create a new window with a unique name to avoid popup blocking in some browsers
      const printWindow = window.open('', `print_consultation_${consultation.id}`, 'height=800,width=800');
      if (!printWindow) {
        alert("L'impression a été bloquée par le navigateur. Veuillez autoriser les popups pour ce site.");
        return;
      }

      const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consultation - ${consultation.animal?.name || 'Animal'}</title>
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
            <h1>${settings.clinicName || 'Clinique Vétérinaire'}</h1>
            <div class="clinic-info">
              <p>${settings.address || ''}</p>
              <p>Tél: ${settings.phone || ''} | Email: ${settings.email || ''}</p>
            </div>
            <h2>Rapport de Consultation</h2>
          </div>

          <div class="consultation-info">
            <div class="info-section">
              <div class="info-title">Informations Client</div>
              <div class="info-content">
                <strong>Nom:</strong> ${consultation.client?.first_name || ''} ${consultation.client?.last_name || ''}<br>
                <strong>Téléphone:</strong> ${consultation.client?.phone || 'N/A'}<br>
                <strong>Email:</strong> ${consultation.client?.email || 'N/A'}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-title">Informations Animal</div>
              <div class="info-content">
                <strong>Nom:</strong> ${consultation.animal?.name || 'N/A'}<br>
                <strong>Espèce:</strong> ${consultation.animal?.species || 'N/A'}<br>
                <strong>Race:</strong> ${consultation.animal?.breed || 'N/A'}<br>
                <strong>Âge:</strong> ${consultation.animal?.birth_date ? 
                  Math.floor((new Date().getTime() - new Date(consultation.animal.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + ' ans' 
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div class="info-section" style="margin-bottom: 20px;">
            <div class="info-title">Détails de la Consultation</div>
            <div class="info-content">
              <strong>Date:</strong> ${new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}<br>
              <strong>Type:</strong> ${consultation.consultation_type || 'Routine'}<br>
              <strong>Statut:</strong> ${consultation.status || 'Terminé'}
            </div>
          </div>

          ${consultation.weight || consultation.temperature || consultation.heart_rate || consultation.respiratory_rate ? `
          <div class="vitals">
            ${consultation.weight ? `
            <div class="vital-item">
              <div class="vital-label">Poids</div>
              <div class="vital-value">${consultation.weight} kg</div>
            </div>
            ` : ''}
            ${consultation.temperature ? `
            <div class="vital-item">
              <div class="vital-label">Température</div>
              <div class="vital-value">${consultation.temperature}°C</div>
            </div>
            ` : ''}
            ${consultation.heart_rate ? `
            <div class="vital-item">
              <div class="vital-label">Fréquence Cardiaque</div>
              <div class="vital-value">${consultation.heart_rate} bpm</div>
            </div>
            ` : ''}
            ${consultation.respiratory_rate ? `
            <div class="vital-item">
              <div class="vital-label">Fréquence Respiratoire</div>
              <div class="vital-value">${consultation.respiratory_rate}/min</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${consultation.symptoms ? `
          <div class="medical-section">
            <div class="medical-title">Symptômes</div>
            <div class="medical-content">${consultation.symptoms}</div>
          </div>
          ` : ''}

          ${consultation.diagnosis ? `
          <div class="medical-section">
            <div class="medical-title">Diagnostic</div>
            <div class="medical-content">${consultation.diagnosis}</div>
          </div>
          ` : ''}

          ${consultation.treatment ? `
          <div class="medical-section">
            <div class="medical-title">Traitement</div>
            <div class="medical-content">${consultation.treatment}</div>
          </div>
          ` : ''}

          ${consultation.notes ? `
          <div class="medical-section">
            <div class="medical-title">Notes</div>
            <div class="medical-content">${consultation.notes}</div>
          </div>
          ` : ''}

          ${consultation.follow_up_date ? `
          <div class="medical-section">
            <div class="medical-title">Suivi Programmé</div>
            <div class="medical-content">
              <strong>Date:</strong> ${new Date(consultation.follow_up_date).toLocaleDateString('fr-FR')}<br>
              ${consultation.follow_up_notes ? `<strong>Notes:</strong> ${consultation.follow_up_notes}` : ''}
            </div>
          </div>
          ` : ''}

          ${consultation.cost ? `
          <div class="medical-section">
            <div class="medical-title">Coût de la Consultation</div>
            <div class="medical-content">
              <strong>${consultation.cost} ${settings.currency || 'EUR'}</strong>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>Vétérinaire: ${consultation.veterinarian_id || 'N/A'}</p>
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
        alert("Une erreur s'est produite lors de l'impression. Veuillez réessayer.");
      }
    };
  } catch (error) {
    console.error("Error in print function:", error);
    alert("Une erreur s'est produite lors de la préparation de l'impression. Veuillez réessayer.");
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
      Imprimer
    </Button>
  );
}