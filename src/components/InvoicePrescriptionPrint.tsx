import React from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Prescription } from '@/contexts/ClientContext';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";

interface InvoicePrescriptionPrintProps {
  prescription: Prescription;
}

export function InvoicePrescriptionPrint({ prescription }: InvoicePrescriptionPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { logo, clinicName, address, phone, email, website, currency } = settings;

  // Calcul des totaux
  const lineTotals = prescription.medications.map(med => med.cost * (med.quantity || 1));
  const totalAmount = lineTotals.reduce((sum, val) => sum + val, 0);

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

    const invoiceContent = generateInvoiceHTML();
    
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    
    // Wait a moment for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const generateInvoiceHTML = () => {
    return `
      <html>
        <head>
          <title>Facture Prescription - ${prescription.petName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .clinic-info {
              text-align: center;
              flex: 1;
            }
            .clinic-info h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .clinic-info p {
              font-size: 14px;
              margin: 5px 0;
            }
            .invoice-section {
              margin-bottom: 30px;
            }
            .invoice-section h2 {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 15px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f8f9fa;
            }
            .print-hidden {
              display: none;
            }
            @media print {
              body { margin: 0; }
              .print-hidden { display: none !important; }
            }
            ${watermarkStyle}
          </style>
        </head>
        <body>
          ${buildWatermarkHtml(isFree)}
          <div class="header">
            ${logo ? `<img src="${logo}" alt="Logo clinique" style="height:60px;width:60px;object-fit:contain;"/>` : '<div style="width:60px;"></div>'}
            <div class="clinic-info">
              <h1>${clinicName}</h1>
              <p>${address}</p>
              <p>${phone} | ${email}</p>
              ${website ? `<p>${website}</p>` : ''}
            </div>
            <div style="width:60px;"></div>
          </div>

          <div class="invoice-section">
            <h2>Ordonnance</h2>
            <div class="grid">
              <div>
                <p><strong>Date :</strong> ${prescription.date}</p>
                <p><strong>Patient :</strong> ${prescription.petName} (${prescription.clientName})</p>
              </div>
              <div>
                <p><strong>Prescrit par :</strong> ${prescription.prescribedBy}</p>
                <p><strong>Diagnostic :</strong> ${prescription.diagnosis}</p>
              </div>
            </div>
          </div>

          <div class="invoice-section">
            <h2>Détail des médicaments</h2>
            <table>
              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.medications.map(med => {
                  const lineTotal = med.cost * (med.quantity || 1);
                  return `
                    <tr>
                      <td>
                        <strong>${med.name}</strong><br>
                        <small>${med.dosage} - ${med.frequency}</small>
                      </td>
                      <td>${med.quantity || 1}</td>
                      <td>${med.cost.toFixed(2)} ${currency}</td>
                      <td>${lineTotal.toFixed(2)} ${currency}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="total-row">
                  <td colspan="3"><strong>Total</strong></td>
                  <td><strong>${totalAmount.toFixed(2)} ${currency}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${prescription.instructions ? `
            <div class="invoice-section">
              <h2>Instructions</h2>
              <p>${prescription.instructions}</p>
            </div>
          ` : ''}

          <div style="margin-top: 50px; text-align: center;">
            <div style="border-top: 1px solid #333; width: 200px; margin: 20px auto;"></div>
            <p>Signature du vétérinaire</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="p-8 max-w-screen-lg mx-auto bg-white text-gray-800">
      {/* Entête */}
      <header className="flex items-center justify-between mb-8">
        {logo && <img src={logo} alt="Logo clinique" className="h-16 w-16 object-contain" />}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">{clinicName}</h1>
          <p className="text-sm">{address}</p>
          <p className="text-sm">{phone} | {email}</p>
          {website && <p className="text-sm">{website}</p>}
        </div>
        <div>
          <Button variant="outline" onClick={handlePrint} className="uppercase text-sm">
            Imprimer
          </Button>
        </div>
      </header>

      {/* Ordonnance */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Ordonnance</h2>
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div>
            <p><strong>Date :</strong> {prescription.date}</p>
            <p><strong>Patient :</strong> {prescription.petName} ({prescription.clientName})</p>
          </div>
          <div>
            <p><strong>Prescrit par :</strong> {prescription.prescribedBy}</p>
            <p><strong>Diagnostic :</strong> {prescription.diagnosis}</p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">Médicament</th>
              <th className="border-b py-2 text-left">Dosage</th>
              <th className="border-b py-2 text-left">Fréquence</th>
              <th className="border-b py-2 text-left">Durée</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map(med => (
              <tr key={med.id} className="border-b">
                <td className="py-2">{med.name}</td>
                <td className="py-2">{med.dosage}</td>
                <td className="py-2">{med.frequency}</td>
                <td className="py-2">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Facture */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Facture</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">Produit / Service</th>
              <th className="border-b py-2 text-right">Quantité</th>
              <th className="border-b py-2 text-right">Prix Unitaire ({currency})</th>
              <th className="border-b py-2 text-right">Total ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map(med => {
              const qty = med.quantity || 1;
              const lineTotal = (med.cost || 0) * qty;
              return (
                <tr key={med.id} className="border-b">
                  <td className="py-2">{med.name}</td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">{med.cost.toFixed(2)}</td>
                  <td className="py-2 text-right">{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-2 text-right font-semibold">Montant total :</td>
              <td className="py-2 text-right font-semibold">{totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
