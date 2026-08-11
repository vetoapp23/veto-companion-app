import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAnimals, useClients, useVaccinations, useAppointmentsByAnimal } from '@/hooks/useDatabase';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";
import { escapeHtml, safePrintUrl } from '@/lib/utils';
import { qrCodeDataUrl } from '@/lib/medicalShare';
import { format } from 'date-fns';
import { useAppLocale } from '@/i18n/useAppLocale';
import { useTranslation } from 'react-i18next';
import {
  buildCertificateDoseRows,
  formatCertDate,
} from '@/lib/vaccinationCertificate';

interface CertificateProps {
  animalId: string;
}

export function CertificateVaccinationPrintDynamic({ animalId }: CertificateProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('medical');
  const { dateFns } = useAppLocale();
  const { isFree } = usePlanLimits();
  const { data: animals } = useAnimals();
  const { data: clients } = useClients();
  const { data: vaccinations } = useVaccinations();
  const { data: appointments = [] } = useAppointmentsByAnimal(animalId);
  const [includeAnimalPhoto, setIncludeAnimalPhoto] = useState(true);
  const [printing, setPrinting] = useState(false);

  const vets = (settings.veterinarians || []).filter((v: any) => v.isActive !== false);

  const animal = animals?.find(a => a.id === animalId);
  const client = animal ? clients?.find(c => c.id === animal.client_id) : null;
  const animalVaccinations = useMemo(
    () => (vaccinations?.filter(v => v.animal_id === animalId) || []),
    [vaccinations, animalId]
  );

  const doseRows = useMemo(
    () => buildCertificateDoseRows(animalVaccinations, appointments),
    [animalVaccinations, appointments]
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

  const handlePrint = async () => {
    if (!animal || !client) {
      alert(t('alerts.missingAnimalClient'));
      return;
    }

    setPrinting(true);
    // Open synchronously (before await) so mobile browsers don't block the popup
    const printWindow = window.open('', `vaccination_certificate_${animal.id}`, 'height=900,width=820');
    if (!printWindow) {
      setPrinting(false);
      alert(t('alerts.printBlocked'));
      return;
    }
    try {
      printWindow.document.open();
      printWindow.document.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(t('vaccinationCertificate.heading'))}</title></head><body style="font-family:Arial,sans-serif;padding:24px;color:#555;">${escapeHtml(t('alerts.printPreparing', { defaultValue: 'Preparing…' }))}</body></html>`
      );
      printWindow.document.close();

      const issuedAt = format(new Date(), 'PPp', { locale: dateFns });
      const qrPayload = [
        t('vaccinationCertificate.heading'),
        `${settings.clinicName || t('vaccinationCertificate.clinicFallback')}`,
        `${animal.name} · ${animal.species}${animal.breed ? ` · ${animal.breed}` : ''}`,
        animal.microchip_number || animal.chip_number
          ? `Chip: ${animal.microchip_number || animal.chip_number}`
          : null,
        `${client.first_name} ${client.last_name}`,
        settings.phone || settings.email || settings.website || '',
        issuedAt,
      ]
        .filter(Boolean)
        .join('\n');

      const qrDataUrl = await qrCodeDataUrl(qrPayload, 160);

      const e = escapeHtml;
      const u = safePrintUrl;
      const administeredCount = doseRows.filter((r) => r.status === 'administered').length;
      const plannedCount = doseRows.filter((r) => r.status === 'planned').length;

      const dosesTableHtml =
        doseRows.length > 0
          ? `
            <table class="doses-table">
              <thead>
                <tr>
                  <th>${t('vaccinationCertificate.cols.date')}</th>
                  <th>${t('vaccinationCertificate.cols.vaccine')}</th>
                  <th>${t('vaccinationCertificate.cols.dose')}</th>
                  <th>${t('vaccinationCertificate.cols.status')}</th>
                  <th>${t('vaccinationCertificate.cols.batch')}</th>
                  <th>${t('vaccinationCertificate.cols.manufacturer')}</th>
                </tr>
              </thead>
              <tbody>
                ${doseRows
                  .map(
                    (row) => `
                  <tr class="${row.status === 'planned' ? 'row-planned' : 'row-done'}">
                    <td>${e(formatCertDate(row.date))}</td>
                    <td>
                      <strong>${e(row.vaccineName)}</strong>
                      ${row.vaccineType ? `<div class="muted">${e(row.vaccineType)}</div>` : ''}
                    </td>
                    <td>${e(row.doseLabel)}</td>
                    <td>
                      <span class="badge ${row.status === 'planned' ? 'badge-planned' : 'badge-done'}">
                        ${row.status === 'planned' ? e(t('vaccinationCertificate.statusPlanned')) : e(t('vaccinationCertificate.statusDone'))}
                      </span>
                    </td>
                    <td>${e(row.batchNumber || (row.status === 'planned' ? '—' : 'N/A'))}</td>
                    <td>${e(row.manufacturer || (row.status === 'planned' ? '—' : 'N/A'))}</td>
                  </tr>
                  ${
                    row.notes
                      ? `<tr class="notes-row"><td colspan="6"><em>${e(t('vaccinationCertificate.notes'))}</em> ${e(row.notes)}</td></tr>`
                      : ''
                  }
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <p class="doses-summary">
              ${t('vaccinationCertificate.summary', { done: administeredCount })}${plannedCount > 0 ? t('vaccinationCertificate.summaryPlanned', { planned: plannedCount }) : ''}
            </p>
          `
          : `<div class="no-vaccinations">
              <p>${t('vaccinationCertificate.empty')}</p>
            </div>`;

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${e(t('vaccinationCertificate.docTitle', { name: animal.name }))}</title>
            <style>
              @page { size: A4; margin: 12mm; }
              * { box-sizing: border-box; }
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 12px;
                line-height: 1.5;
                color: #333;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                border-bottom: 3px solid #2c5530;
                padding-bottom: 16px;
                margin-bottom: 24px;
              }
              .header-main {
                flex: 1;
                min-width: 0;
                text-align: center;
              }
              .header-main img {
                max-height: 70px;
                max-width: 180px;
                width: auto;
                object-fit: contain;
                margin-bottom: 8px;
              }
              .header h1 {
                color: #2c5530;
                font-size: 24px;
                margin: 8px 0 0;
                font-weight: bold;
              }
              .qr-section {
                flex: 0 0 auto;
                width: 104px;
                text-align: center;
              }
              .qr-section img {
                width: 100px;
                height: 100px;
                display: block;
                margin: 0 auto;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                background: #fff;
              }
              .qr-caption {
                margin-top: 4px;
                font-size: 9px;
                color: #64748b;
                line-height: 1.2;
              }
              .clinic-info {
                margin-bottom: 24px;
                padding: 14px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .clinic-info h2 {
                color: #2c5530;
                margin: 0 0 8px;
                font-size: 18px;
              }
              .animal-info {
                margin-bottom: 24px;
                padding: 16px;
                border: 2px solid #2c5530;
                border-radius: 8px;
              }
              .animal-info h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 8px;
                margin: 0 0 12px;
                font-size: 18px;
              }
              .animal-photo {
                text-align: center;
                margin-bottom: 16px;
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
                gap: 10px 14px;
              }
              .info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                min-width: 0;
              }
              .info-label {
                font-weight: bold;
                min-width: 88px;
                color: #2c5530;
                flex-shrink: 0;
              }
              .info-value {
                color: #555;
                word-break: break-word;
              }
              .vaccinations-section { margin-bottom: 24px; }
              .vaccinations-section h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 8px;
                margin: 0 0 12px;
                font-size: 18px;
              }
              .table-wrap {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
              }
              .doses-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                min-width: 520px;
              }
              .doses-table th,
              .doses-table td {
                border: 1px solid #d0d7d1;
                padding: 7px 8px;
                text-align: left;
                vertical-align: top;
              }
              .doses-table th {
                background: #e8f0e9;
                color: #2c5530;
              }
              .row-planned td { background: #fffaf0; }
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
              .badge-done { background: #e6f4ea; color: #1e7a3a; }
              .badge-planned { background: #fff3cd; color: #8a6d1d; }
              .notes-row td {
                background: #fafafa;
                font-size: 11px;
                color: #555;
              }
              .doses-summary {
                margin-top: 10px;
                font-size: 12px;
                color: #555;
              }
              .vets-info {
                margin-bottom: 24px;
                padding: 14px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .vets-info h2 {
                color: #2c5530;
                margin: 0 0 10px;
                font-size: 18px;
              }
              .vet-item { margin-bottom: 6px; color: #666; }
              .footer {
                text-align: center;
                margin-top: 28px;
                padding-top: 14px;
                border-top: 1px solid #ddd;
                color: #888;
                font-size: 11px;
              }
              .no-vaccinations {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 32px 16px;
                border: 2px dashed #ddd;
                border-radius: 8px;
              }

              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
                .table-wrap { overflow: visible; }
                .doses-table { min-width: 0; }
                .row-planned td,
                .badge-done,
                .badge-planned,
                .doses-table th {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              ${watermarkStyle}
            </style>
          </head>
          <body>
            ${buildWatermarkHtml(isFree)}
            <div class="header">
              <div class="header-main">
                ${settings.logo ? `<img src="${u(settings.logo)}" alt="${e(t('vaccinationCertificate.clinicLogoAlt'))}" />` : ''}
                <h1>${e(t('vaccinationCertificate.heading'))}</h1>
              </div>
              <div class="qr-section">
                <img src="${u(qrDataUrl)}" width="100" height="100" alt="QR" />
                <div class="qr-caption">${e(t('vaccinationCertificate.qrCaption', { defaultValue: 'Scan' }))}</div>
              </div>
            </div>

            ${settings.showClinicInfo ? `
            <div class="clinic-info">
              <h2>${e(settings.clinicName || t('vaccinationCertificate.clinicFallback'))}</h2>
              <p><strong>${e(t('vaccinationCertificate.labels.address'))}</strong> ${e(settings.address || 'N/A')}</p>
              <p><strong>${e(t('vaccinationCertificate.labels.phone'))}</strong> ${e(settings.phone || 'N/A')} | <strong>${e(t('vaccinationCertificate.labels.email'))}</strong> ${e(settings.email || 'N/A')}</p>
              ${settings.website ? `<p><strong>${e(t('vaccinationCertificate.labels.website'))}</strong> ${e(settings.website)}</p>` : ''}
            </div>
            ` : ''}

            ${settings.showVetsInfo && vets.length > 0 ? `
            <div class="vets-info">
              <h2>${t('vaccinationCertificate.vetTeam')}</h2>
              ${vets.map(vet => `
                <div class="vet-item">
                  <strong>${e(vet.title || 'Dr.')} ${e(vet.name)}</strong>
                  ${vet.specialty ? ` - ${e(vet.specialty)}` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="animal-info">
              <h2>${t('vaccinationCertificate.animalInfo')}</h2>
              ${includeAnimalPhoto && animal.photo_url ? `
              <div class="animal-photo">
                <img src="${u(animal.photo_url)}" alt="${e(t('vaccinationCertificate.animalPhotoAlt', { name: animal.name }))}" />
              </div>
              ` : ''}
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">${t('vaccinationCertificate.labels.name')}</span>
                  <span class="info-value">${e(animal.name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.species'))}</span>
                  <span class="info-value">${e(animal.species)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.breed'))}</span>
                  <span class="info-value">${e(animal.breed || 'N/A')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.age'))}</span>
                  <span class="info-value">${e(animal.birth_date ? getDetailedAge(animal.birth_date) : 'N/A')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.sex'))}</span>
                  <span class="info-value">${e(animal.sex || 'N/A')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.weight'))}</span>
                  <span class="info-value">${e(animal.weight ? animal.weight + ' kg' : 'N/A')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.owner'))}</span>
                  <span class="info-value">${e(client.first_name)} ${e(client.last_name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${e(t('vaccinationCertificate.labels.contact'))}</span>
                  <span class="info-value">${e(client.phone || client.email || 'N/A')}</span>
                </div>
              </div>
            </div>

            <div class="vaccinations-section">
              <h2>${t('vaccinationCertificate.scheduleTitle')}</h2>
              <div class="table-wrap">${dosesTableHtml}</div>
            </div>

            <div class="footer">
              <p>${e(t('vaccinationCertificate.generatedAt', { datetime: issuedAt }))}</p>
              <p>${e(t('vaccinationCertificate.footerSystem'))}</p>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 350);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      try {
        printWindow.close();
      } catch {
        /* ignore */
      }
      alert(t('alerts.printError'));
    } finally {
      setPrinting(false);
    }
  };

  if (!animal || !client) {
    return (
      <Button variant="outline" disabled size="sm" className="w-full sm:w-auto justify-center">
        <Printer className="h-4 w-4 mr-2 shrink-0" />
        <span className="sm:hidden">{t('vaccinationCertificate.buttonShort')}</span>
        <span className="hidden sm:inline">{t('vaccinationCertificate.button')}</span>
      </Button>
    );
  }

  const hasPhoto = !!animal.photo_url;

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      {hasPhoto && (
        <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
          <Checkbox
            checked={includeAnimalPhoto}
            onCheckedChange={(v) => setIncludeAnimalPhoto(v === true)}
          />
          <span>{t('vaccinationCertificate.includeAnimalPhoto')}</span>
        </label>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto justify-center"
        onClick={() => void handlePrint()}
        disabled={printing}
      >
        <Printer className="h-4 w-4 mr-2 shrink-0" />
        <span className="sm:hidden">{t('vaccinationCertificate.buttonShort')}{doseRows.length > 0 ? ` (${doseRows.length})` : ""}</span>
        <span className="hidden sm:inline">
          {t('vaccinationCertificate.button')}{doseRows.length > 0 ? ` (${doseRows.length})` : ""}
        </span>
      </Button>
    </div>
  );
}

export default CertificateVaccinationPrintDynamic;
