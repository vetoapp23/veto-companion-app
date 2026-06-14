import { watermarkStyle } from "@/lib/printWatermark";

export const REPORT_PHOTO_STYLES = `
  .photos {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .photo-item {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 8px;
    background: #fafafa;
  }
  .photo-item .photo-label {
    font-size: 10px;
    color: #666;
    margin-bottom: 6px;
  }
  .photos img, .photo-item img {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: 280px;
    height: auto;
    object-fit: contain;
    object-position: center;
    border-radius: 4px;
    background: #fff;
  }
`;

/** Styles partagés — même rendu à l'écran, à l'impression et en PDF. */
export const REPORT_STYLES = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 12px;
    line-height: 1.5;
  }
  .report-root {
    position: relative;
    width: 100%;
    max-width: 210mm;
    min-height: 100%;
    margin: 0 auto;
    padding: 14mm 12mm;
    background: #fff;
  }
  .report-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 3px solid hsl(160, 60%, 40%);
    margin-bottom: 20px;
  }
  .report-header h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 8px 0 0;
    color: hsl(160, 60%, 28%);
    letter-spacing: 0.2px;
  }
  .report-header .logo img {
    display: block;
    max-height: 48px;
    max-width: 160px;
    object-fit: contain;
  }
  .clinic {
    text-align: right;
    font-size: 11px;
    color: #555;
    line-height: 1.45;
    min-width: 180px;
  }
  .clinic strong {
    display: block;
    font-size: 13px;
    color: #111;
    margin-bottom: 2px;
  }
  .report-content { position: relative; z-index: 1; }
  .report-header { position: relative; z-index: 1; }
  .report-footer { position: relative; z-index: 1; }
  .block {
    margin-bottom: 20px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: hsl(160, 60%, 28%);
    border-left: 4px solid hsl(160, 60%, 40%);
    padding-left: 10px;
    margin: 0 0 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    table-layout: fixed;
  }
  table.info th {
    background: #eef6f2;
    text-align: left;
    font-weight: 600;
    padding: 7px 8px;
    width: 18%;
    color: #444;
    border-bottom: 1px solid #dce8e2;
  }
  table.info td {
    padding: 7px 8px;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    word-wrap: break-word;
  }
  table.data th {
    background: hsl(160, 60%, 94%);
    padding: 7px 8px;
    text-align: left;
    border-bottom: 2px solid hsl(160, 60%, 38%);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  table.data td {
    padding: 7px 8px;
    border-bottom: 1px solid #e8e8e8;
    vertical-align: top;
    word-wrap: break-word;
  }
  table.data tr:nth-child(even) td { background: #fafafa; }
  .kpis {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .kpi {
    flex: 1 1 calc(25% - 8px);
    min-width: 110px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px 12px;
    background: #fff;
  }
  .kpi .l { font-size: 10px; color: #666; margin-bottom: 2px; }
  .kpi .v { font-size: 17px; font-weight: 700; color: #111; }
  .badges span {
    display: inline-block;
    padding: 2px 8px;
    margin: 2px 4px 2px 0;
    border-radius: 10px;
    background: #eef6f2;
    font-size: 10px;
  }
  .muted { color: #888; font-style: italic; font-size: 11px; }
  .report-footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    font-size: 10px;
    color: #555;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
  }
  .report-footer .sig {
    width: 200px;
    text-align: center;
    flex-shrink: 0;
  }
  .report-footer .sig .line {
    border-top: 1px solid #333;
    margin-top: 44px;
    padding-top: 4px;
    font-size: 10px;
  }
  ${REPORT_PHOTO_STYLES}
  ${watermarkStyle}
  @media print {
    @page { size: A4 portrait; margin: 10mm; }
    .report-root { max-width: none; padding: 0; }
    .block { break-inside: avoid; page-break-inside: avoid; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
  }
`;

export interface ReportDocumentOptions {
  title: string;
  watermarkHtml: string;
  headerTitle: string;
  clinic: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };
  sectionsHtml: string;
  footerHtml: string;
  extraStyles?: string;
}

export function buildReportHeader(title: string, clinic: ReportDocumentOptions["clinic"]): string {
  return `
    <header class="report-header">
      <div>
        ${clinic.logo ? `<div class="logo"><img src="${clinic.logo}" alt="Logo" /></div>` : ""}
        <h1>${title}</h1>
      </div>
      <div class="clinic">
        <strong>${clinic.clinicName ?? ""}</strong>
        ${clinic.address ? `${clinic.address}<br/>` : ""}
        ${[clinic.phone, clinic.email].filter(Boolean).join(" · ")}
      </div>
    </header>`;
}

export function buildReportDocument(opts: ReportDocumentOptions): string {
  const headerHtml = buildReportHeader(opts.headerTitle, opts.clinic);
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>${opts.title}</title>
  <style>${REPORT_STYLES}${opts.extraStyles ?? ""}</style>
</head>
<body>
  <div class="report-root">
    ${opts.watermarkHtml}
    ${headerHtml}
    <main class="report-content">
      ${opts.sectionsHtml}
    </main>
    <footer class="report-footer">
      ${opts.footerHtml}
    </footer>
  </div>
</body>
</html>`;
}

export function buildDefaultFooter(clinicName?: string, withSignature = false): string {
  const dateLine = `<div>Document généré le ${new Date().toLocaleDateString("fr-FR")}</div>`;
  if (withSignature) {
    return `${dateLine}<div class="sig"><div class="line">Signature et cachet</div></div>`;
  }
  return `${dateLine}<div>${clinicName ?? ""}</div>`;
}
