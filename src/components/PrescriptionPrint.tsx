import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Prescription } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
// Clé localStorage pour vétérinaires
const VETS_KEY = 'vetpro-veterinarians';

interface PrescriptionPrintProps {
  prescription: Prescription;
}

export function PrescriptionPrint({ prescription }: PrescriptionPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const vets = JSON.parse(localStorage.getItem(VETS_KEY) || '[]');
  const prescriber = prescription.prescribedBy;
  const handlePrint = () => {
    if (!prescription) {
      return;
    }

    if (!prescription.petName || !prescription.clientName) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    const content = `
      <html>
        <head>
          <title>Prescription - ${prescription.petName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .clinic-info {
              margin-bottom: 30px;
            }
            .patient-info {
              margin-bottom: 30px;
            }
            .prescription-details {
              margin-bottom: 30px;
            }
            .medications {
              margin-bottom: 30px;
            }
            .medication-item {
              border: 1px solid #ccc;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 5px;
            }
            .instructions {
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 200px;
              margin: 20px auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .total-cost {
              font-weight: bold;
              text-align: right;
              margin-top: 20px;
            }
            ${watermarkStyle}
          </style>
        </head>
        <body>
          ${buildWatermarkHtml(isFree)}
          <div class="header">
            ${settings.logo ? `<img src="${settings.logo}" alt="Logo clinique" style="height:60px;margin-bottom:10px;"/>` : ''}
            <h1>PRESCRIPTION MÉDICALE</h1>
            <h2>${settings.clinicName}</h2>
            <p>${settings.address}<br>
            Tél: ${settings.phone} | Email: ${settings.email}</p>
          </div>

          <div class="clinic-info">
            <strong>Date de prescription:</strong> ${new Date(prescription.date).toLocaleDateString('fr-FR')}<br>
            <strong>Prescrit par:</strong> ${prescriber}
          </div>

          <div class="patient-info">
            <h3>Informations du patient</h3>
            <table>
              <tr>
                <th>Propriétaire</th>
                <td>${prescription.clientName}</td>
              </tr>
              <tr>
                <th>Animal</th>
                <td>${prescription.petName}</td>
              </tr>
              <tr>
                <th>Diagnostic</th>
                <td>${prescription.diagnosis}</td>
              </tr>
              <tr>
                <th>Durée du traitement</th>
                <td>${prescription.duration}</td>
              </tr>
            </table>
          </div>

          <div class="medications">
            <h3>Médicaments prescrits</h3>
            ${prescription.medications.map(med => `
              <div class="medication-item">
                <h4>${med.name}</h4>
                <table>
                  <tr>
                    <th>Posologie</th>
                    <td>${med.dosage} - ${med.frequency}</td>
                  </tr>
                  <tr>
                    <th>Durée</th>
                    <td>${med.duration}</td>
                  </tr>
                  <tr>
                    <th>Quantité</th>
                    <td>${med.quantity} ${med.unit}</td>
                  </tr>
                  ${med.refills && med.refills > 0 ? `
                    <tr>
                      <th>Renouvellements</th>
                      <td>${med.refills}</td>
                    </tr>
                  ` : ''}
                  ${med.instructions ? `
                    <tr>
                      <th>Instructions</th>
                      <td>${med.instructions}</td>
                    </tr>
                  ` : ''}
                  ${med.cost ? `
                    <tr>
                      <th>Coût</th>
                      <td>${med.cost.toFixed(2)}€</td>
                    </tr>
                  ` : ''}
                </table>
              </div>
            `).join('')}
            
            <div class="total-cost">
              Coût total: ${prescription.medications.reduce((total, med) => total + (med.cost || 0), 0).toFixed(2)}€
            </div>
          </div>

          ${prescription.instructions ? `
            <div class="instructions">
              <h3>Instructions générales</h3>
              <p>${prescription.instructions}</p>
            </div>
          ` : ''}

          ${prescription.followUpDate ? `
            <div class="instructions">
              <h3>Suivi</h3>
              <p><strong>Date de suivi prévue:</strong> ${new Date(prescription.followUpDate).toLocaleDateString('fr-FR')}</p>
            </div>
          ` : ''}

          ${prescription.notes ? `
            <div class="instructions">
              <h3>Notes</h3>
              <p>${prescription.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <div class="signature-line"></div>
            <p>Signature du vétérinaire</p>
            <p><small>Cette prescription est valable pour la durée du traitement prescrit.</small></p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait a moment for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={handlePrint}
      className="gap-2"
    >
      <Printer className="h-4 w-4" />
      Générer Ordonnance
    </Button>
  );
}
