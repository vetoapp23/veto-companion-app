import React from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Prescription } from '@/contexts/ClientContext';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { useTranslation } from "react-i18next";

interface InvoicePrescriptionPrintProps {
  prescription: Prescription;
}

export function InvoicePrescriptionPrint({ prescription }: InvoicePrescriptionPrintProps) {
  const { settings } = useSettings();
  const { isFree } = usePlanLimits();
  const { t } = useTranslation("medical");
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
          <title>${t("print.invoice.docTitle", { name: prescription.petName })}</title>
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
            ${logo ? `<img src="${logo}" alt="${t("print.invoice.clinicLogoAlt")}" style="height:60px;width:60px;object-fit:contain;"/>` : '<div style="width:60px;"></div>'}
            <div class="clinic-info">
              <h1>${clinicName}</h1>
              <p>${address}</p>
              <p>${phone} | ${email}</p>
              ${website ? `<p>${website}</p>` : ''}
            </div>
            <div style="width:60px;"></div>
          </div>

          <div class="invoice-section">
            <h2>${t("print.invoice.prescription")}</h2>
            <div class="grid">
              <div>
                <p><strong>${t("print.invoice.date")}</strong> ${prescription.date}</p>
                <p><strong>${t("print.invoice.patient")}</strong> ${prescription.petName} (${prescription.clientName})</p>
              </div>
              <div>
                <p><strong>${t("print.invoice.prescribedBy")}</strong> ${prescription.prescribedBy}</p>
                <p><strong>${t("print.invoice.diagnosis")}</strong> ${prescription.diagnosis}</p>
              </div>
            </div>
          </div>

          <div class="invoice-section">
            <h2>${t("print.invoice.medsDetail")}</h2>
            <table>
              <thead>
                <tr>
                  <th>${t("print.invoice.medication")}</th>
                  <th>${t("print.invoice.quantity")}</th>
                  <th>${t("print.invoice.unitPrice")}</th>
                  <th>${t("print.invoice.total")}</th>
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
                  <td colspan="3"><strong>${t("print.invoice.total")}</strong></td>
                  <td><strong>${totalAmount.toFixed(2)} ${currency}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${prescription.instructions ? `
            <div class="invoice-section">
              <h2>${t("print.invoice.instructions")}</h2>
              <p>${prescription.instructions}</p>
            </div>
          ` : ''}

          <div style="margin-top: 50px; text-align: center;">
            <div style="border-top: 1px solid #333; width: 200px; margin: 20px auto;"></div>
            <p>${t("print.invoice.vetSignature")}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="p-8 max-w-screen-lg mx-auto bg-white text-gray-800">
      {/* Entête */}
      <header className="flex items-center justify-between mb-8">
        {logo && <img src={logo} alt={t("print.invoice.clinicLogoAlt")} className="h-16 w-16 object-contain" />}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">{clinicName}</h1>
          <p className="text-sm">{address}</p>
          <p className="text-sm">{phone} | {email}</p>
          {website && <p className="text-sm">{website}</p>}
        </div>
        <div>
          <Button variant="outline" onClick={handlePrint} className="uppercase text-sm">
            {t("print.invoice.print")}
          </Button>
        </div>
      </header>

      {/* Ordonnance */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">{t("print.invoice.prescription")}</h2>
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div>
            <p><strong>{t("print.invoice.date")}</strong> {prescription.date}</p>
            <p><strong>{t("print.invoice.patient")}</strong> {prescription.petName} ({prescription.clientName})</p>
          </div>
          <div>
            <p><strong>{t("print.invoice.prescribedBy")}</strong> {prescription.prescribedBy}</p>
            <p><strong>{t("print.invoice.diagnosis")}</strong> {prescription.diagnosis}</p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">{t("print.invoice.medication")}</th>
              <th className="border-b py-2 text-left">{t("print.invoice.dosage")}</th>
              <th className="border-b py-2 text-left">{t("print.invoice.frequency")}</th>
              <th className="border-b py-2 text-left">{t("print.invoice.duration")}</th>
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
        <h2 className="text-xl font-semibold mb-4">{t("print.invoice.invoiceSection")}</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">{t("print.invoice.productService")}</th>
              <th className="border-b py-2 text-right">{t("print.invoice.quantity")}</th>
              <th className="border-b py-2 text-right">{t("print.invoice.unitPriceCol", { currency })}</th>
              <th className="border-b py-2 text-right">{t("print.invoice.total")} ({currency})</th>
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
              <td colSpan={3} className="py-2 text-right font-semibold">{t("print.invoice.amountTotal")}</td>
              <td className="py-2 text-right font-semibold">{totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
