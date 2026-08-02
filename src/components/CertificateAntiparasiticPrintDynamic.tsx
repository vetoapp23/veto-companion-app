import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAnimals, useClients, useAntiparasitics, useAppointmentsByAnimal } from '@/hooks/useDatabase';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { format } from 'date-fns';
import { useAppLocale } from '@/i18n/useAppLocale';
import { useTranslation } from 'react-i18next';
import {
  buildAntiparasiticCertificateRows,
  formatCertDate,
} from '@/lib/vaccinationCertificate';

interface CertificateProps {
  animalId: string;
}

export function CertificateAntiparasiticPrintDynamic({ animalId }: CertificateProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('medical');
  const { dateFns } = useAppLocale();
  const { isFree } = usePlanLimits();
  const { data: animals } = useAnimals();
  const { data: clients } = useClients();
  const { data: antiparasitics } = useAntiparasitics();
  const { data: appointments = [] } = useAppointmentsByAnimal(animalId);

  const vets = (settings.veterinarians || []).filter((v: any) => v.isActive !== false);

  const animal = animals?.find(a => a.id === animalId);
  const client = animal ? clients?.find(c => c.id === animal.client_id) : null;
  const animalTreatments = useMemo(
    () => (antiparasitics?.filter(v => v.animal_id === animalId) || []),
    [antiparasitics, animalId]
  );

  const doseRows = useMemo(
    () => buildAntiparasiticCertificateRows(animalTreatments, appointments),
    [animalTreatments, appointments]
  );

  const getDetailedAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    if (isNaN(birth.getTime())) return 'N/A';

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const weeks = Math.floor(days / 7);
    const parts: string[] = [];
    if (years > 0) parts.push(t('vaccinationCertificate.ageYears', { count: years }));
    if (months > 0) parts.push(t('vaccinationCertificate.ageMonths', { count: months }));
    if (weeks > 0) parts.push(t('vaccinationCertificate.ageWeeks', { count: weeks }));
    return parts.join(', ') || t('vaccinationCertificate.ageDays', { count: 0 });
  };

  const handlePrint = () => {
    if (!animal || !client) {
      alert(t('alerts.missingAnimalClient'));
      return;
    }

    try {
      const printWindow = window.open('', `antiparasitic_certificate_${animal.id}`, 'height=800,width=800');
      if (!printWindow) {
        alert(t('alerts.printBlocked'));
        return;
      }

      const administeredCount = doseRows.filter((r) => r.status === 'administered').length;
      const plannedCount = doseRows.filter((r) => r.status === 'planned').length;

      const dosesTableHtml =
        doseRows.length > 0
          ? `
            <table class="doses-table">
              <thead>
                <tr>
                  <th>${t('antiparasiticCertificate.cols.date')}</th>
                  <th>${t('antiparasiticCertificate.cols.product')}</th>
                  <th>${t('antiparasiticCertificate.cols.treatment')}</th>
                  <th>${t('antiparasiticCertificate.cols.status')}</th>
                  <th>—</th>
                  <th>${t('antiparasiticCertificate.cols.activeIngredient')}</th>
                </tr>
              </thead>
              <tbody>
                ${doseRows
                  .map(
                    (row) => `
                  <tr class="${row.status === 'planned' ? 'row-planned' : 'row-done'}">
                    <td>${formatCertDate(row.date)}</td>
                    <td>
                      <strong>${row.vaccineName}</strong>
                      ${row.vaccineType ? `<div class="muted">${row.vaccineType}</div>` : ''}
                    </td>
                    <td>${row.doseLabel}</td>
                    <td>
                      <span class="badge ${row.status === 'planned' ? 'badge-planned' : 'badge-done'}">
                        ${row.status === 'planned' ? t('antiparasiticCertificate.statusPlanned') : t('antiparasiticCertificate.statusDone')}
                      </span>
                    </td>
                    <td>${row.batchNumber || (row.status === 'planned' ? '—' : 'N/A')}</td>
                    <td>${row.manufacturer || (row.status === 'planned' ? '—' : 'N/A')}</td>
                  </tr>
                  ${
                    row.notes
                      ? `<tr class="notes-row"><td colspan="6"><em>${t('antiparasiticCertificate.notes')}</em> ${row.notes}</td></tr>`
                      : ''
                  }
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <p class="doses-summary">
              ${t('antiparasiticCertificate.summary', { done: administeredCount })}${plannedCount > 0 ? t('antiparasiticCertificate.summaryPlanned', { planned: plannedCount }) : ''}
            </p>
          `
          : `<div class="no-vaccinations">
              <p>${t('antiparasiticCertificate.empty')}</p>
            </div>`;

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${t('antiparasiticCertificate.docTitle', { name: animal.name })}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                line-height: 1.6;
                color: #333;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #2c5530;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header img {
                max-height: 70px;
                width: auto;
                object-fit: contain;
                margin-bottom: 8px;
              }
              .header h1 {
                color: #2c5530;
                font-size: 28px;
                margin: 10px 0;
                font-weight: bold;
              }
              .clinic-info {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .clinic-info h2 {
                color: #2c5530;
                margin: 10px 0;
              }
              .qr-section {
                float: right;
                margin-left: 20px;
              }
              .animal-info {
                clear: both;
                margin-bottom: 30px;
                padding: 20px;
                border: 2px solid #2c5530;
                border-radius: 8px;
              }
              .animal-info h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 10px;
                margin-bottom: 15px;
                font-size: 22px;
              }
              .animal-photo {
                text-align: center;
                margin-bottom: 20px;
              }
              .animal-photo img {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 50%;
                border: 3px solid #2c5530;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
              }
              .info-item {
                display: flex;
                align-items: center;
              }
              .info-label {
                font-weight: bold;
                min-width: 120px;
                color: #2c5530;
              }
              .info-value {
                color: #666;
              }
              .vaccinations-section {
                margin-bottom: 30px;
              }
              .vaccinations-section h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 10px;
                margin-bottom: 16px;
                font-size: 22px;
              }
              .doses-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
              }
              .doses-table th,
              .doses-table td {
                border: 1px solid #d0d7d1;
                padding: 8px 10px;
                text-align: left;
                vertical-align: top;
              }
              .doses-table th {
                background: #e8f0e9;
                color: #2c5530;
              }
              .row-planned td {
                background: #fffaf0;
              }
              .muted {
                color: #777;
                font-size: 11px;
                font-weight: normal;
              }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
              }
              .badge-done {
                background: #e6f4ea;
                color: #1e7a3a;
              }
              .badge-planned {
                background: #fff3cd;
                color: #8a6d1d;
              }
              .notes-row td {
                background: #fafafa;
                font-size: 12px;
                color: #555;
              }
              .doses-summary {
                margin-top: 10px;
                font-size: 12px;
                color: #555;
              }
              .vets-info {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .vets-info h2 {
                color: #2c5530;
                margin-bottom: 15px;
              }
              .vet-item {
                margin-bottom: 8px;
                color: #666;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #888;
                font-size: 12px;
              }
              .no-vaccinations {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px;
                border: 2px dashed #ddd;
                border-radius: 8px;
              }
              
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .row-planned td { background: #fffaf0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .badge-done, .badge-planned { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
              ${watermarkStyle}
            </style>
          </head>
          <body>
            ${buildWatermarkHtml(isFree)}
            <div class="header">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo clinique" />` : ''}
              <h1>${t('antiparasiticCertificate.heading')}</h1>
              <div class="qr-section">
                <canvas id="qrcode" width="100" height="100"></canvas>
              </div>
            </div>

            ${settings.showClinicInfo ? `
            <div class="clinic-info">
              <h2>${settings.clinicName || t('vaccinationCertificate.clinicFallback')}</h2>
              <p><strong>${t('vaccinationCertificate.labels.address')}</strong> ${settings.address || 'N/A'}</p>
              <p><strong>${t('vaccinationCertificate.labels.phone')}</strong> ${settings.phone || 'N/A'} | <strong>${t('vaccinationCertificate.labels.email')}</strong> ${settings.email || 'N/A'}</p>
              ${settings.website ? `<p><strong>${t('vaccinationCertificate.labels.website')}</strong> ${settings.website}</p>` : ''}
            </div>
            ` : ''}

            ${settings.showVetsInfo && vets.length > 0 ? `
            <div class="vets-info">
              <h2>${t('vaccinationCertificate.vetTeam')}</h2>
              ${vets.map(vet => `
                <div class="vet-item">
                  <strong>${vet.title || 'Dr.'} ${vet.name}</strong>
                  ${vet.specialty ? ` - ${vet.specialty}` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="animal-info">
              <h2>${t('vaccinationCertificate.animalInfo')}</h2>
              
              ${animal.photo_url ? `
              <div class="animal-photo">
                <img src="${animal.photo_url}" alt="Photo de ${animal.name}" />
              </div>
              ` : ''}

              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.name')}</span>
                  <span class="info-value">${animal.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.species')}</span>
                  <span class="info-value">${animal.species}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.breed')}</span>
                  <span class="info-value">${animal.breed || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.age')}</span>
                  <span class="info-value">${animal.birth_date ? getDetailedAge(animal.birth_date) : 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.sex')}</span>
                  <span class="info-value">${animal.sex || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.weight')}</span>
                  <span class="info-value">${animal.weight ? animal.weight + ' kg' : 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.owner')}</span>
                  <span class="info-value">${client.first_name} ${client.last_name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.contact')}</span>
                  <span class="info-value">${client.phone || client.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div class="vaccinations-section">
              <h2>${t('antiparasiticCertificate.scheduleTitle')}</h2>
              ${dosesTableHtml}
            </div>

            <div class="footer">
              <p>${t('vaccinationCertificate.generatedAt', { datetime: format(new Date(), 'PPp', { locale: dateFns }) })}</p>
              <p>${t('vaccinationCertificate.footerSystem')}</p>
            </div>

            <script>
              function generateQRCode() {
                const canvas = document.getElementById('qrcode');
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = '#000';
                  ctx.fillRect(0, 0, 100, 100);
                  ctx.fillStyle = '#fff';
                  ctx.font = '12px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('QR', 50, 45);
                  ctx.fillText('CODE', 50, 60);
                }
              }
              
              window.onload = function() {
                generateQRCode();
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };

    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert(t('alerts.printError'));
    }
  };

  if (!animal || !client) {
    return (
      <Button variant="outline" disabled>
        <Printer className="h-4 w-4 mr-2" />
        {t('antiparasiticCertificate.button')}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-2" />
      {t('antiparasiticCertificate.button')}
      {doseRows.length > 0 ? ` (${doseRows.length})` : ''}
    </Button>
  );
}

export default CertificateAntiparasiticPrintDynamic;
