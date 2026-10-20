import{R as d,V as r,W as n}from"./index-CfItjhrY.js";import{w as l}from"./printWatermark-BmQ03DH8.js";import{i as p}from"./vendor-i18n-02tLOPTM.js";const a=(e,t)=>p.t(e,{ns:"app",...t});function s(){return(p.language||"fr").split("-")[0]||"fr"}const x=`
  .identity-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .identity-table {
    flex: 1;
    min-width: 0;
  }
  .animal-portrait {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: #f8fafc;
  }
  .animal-portrait img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .animal-portrait-solo {
    width: 160px;
    height: 160px;
  }
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
  @media print {
    .identity-row { gap: 12px; }
    .animal-portrait { width: 100px; height: 100px; }
  }
`,g=`
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
  ${x}
  ${l}
  @media print {
    @page { size: A4 portrait; margin: 10mm; }
    .report-root { max-width: none; padding: 0; }
    .block { break-inside: avoid; page-break-inside: avoid; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
  }
`;function f(e,t){const o=r,i=n;return`
    <header class="report-header">
      <div>
        ${t.logo?`<div class="logo"><img src="${i(t.logo)}" alt="${o(a("report.logoAlt"))}" /></div>`:""}
        <h1>${o(e)}</h1>
      </div>
      <div class="clinic">
        <strong>${o(t.clinicName??"")}</strong>
        ${t.address?`${o(t.address)}<br/>`:""}
        ${o([t.phone,t.email].filter(Boolean).join(" · "))}
      </div>
    </header>`}function h(e){const t=r,o=f(e.headerTitle,e.clinic);return`<!doctype html>
<html lang="${s()}">
<head>
  <meta charset="utf-8"/>
  <title>${t(e.title)}</title>
  <style>${g}${e.extraStyles??""}</style>
</head>
<body>
  <div class="report-root">
    ${e.watermarkHtml}
    ${o}
    <main class="report-content">
      ${e.sectionsHtml}
    </main>
    <footer class="report-footer">
      ${e.footerHtml}
    </footer>
  </div>
</body>
</html>`}function u(e,t=!1){const o=r,i=`<div>${o(a("report.generatedOn",{date:new Date().toLocaleDateString(d(p.language))}))}</div>`;return t?`${i}<div class="sig"><div class="line">${o(a("report.signatureStamp"))}</div></div>`:`${i}<div>${o(e??"")}</div>`}export{u as a,h as b};
