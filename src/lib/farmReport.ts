// @ts-nocheck
import { buildWatermarkHtml, watermarkStyle } from "@/lib/printWatermark";

const fmtDate = (d?: string | Date | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return String(d); }
};

interface BuildArgs {
  farm: any;
  ownerName?: string;
  batches: any[];
  infrastructures: any[];
  interventions: any[];
  events: any[];
  clinic: { clinicName?: string; address?: string; phone?: string; email?: string; logo?: string };
  isFree?: boolean;
}

export function buildFarmReportHtml({ farm, ownerName, batches, infrastructures, interventions, events, clinic, isFree }: BuildArgs) {
  const activeBatches = batches.filter((b) => (b.status || "active") === "active");
  const totalActive = activeBatches.reduce((s, b) => s + (b.animal_count || 0), 0);

  // group by category (active only)
  const byCat: Record<string, number> = {};
  activeBatches.forEach((b) => {
    const k = b.category || b.species || "Non catégorisé";
    byCat[k] = (byCat[k] || 0) + (b.animal_count || 0);
  });

  const farmTypes: string[] = (farm.farm_types && farm.farm_types.length > 0)
    ? farm.farm_types
    : (farm.farm_type ? [farm.farm_type] : []);

  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Rapport exploitation – ${farm.farm_name}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 32px; line-height: 1.5; }
    .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:16px; border-bottom:3px solid hsl(160,60%,40%); margin-bottom:24px; }
    .header h1 { font-size: 22px; margin: 0; color: hsl(160,60%,30%); }
    .clinic { text-align:right; font-size:12px; color:#555; }
    .clinic strong { display:block; font-size:14px; color:#111; }
    .block { margin-bottom: 22px; page-break-inside: avoid; }
    h2 { font-size:14px; text-transform:uppercase; letter-spacing:.8px; color:hsl(160,60%,30%);
         border-left:4px solid hsl(160,60%,40%); padding-left:10px; margin: 0 0 10px; }
    .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .kpi { border:1px solid #e5e7eb; border-radius:6px; padding:10px; }
    .kpi .l { font-size:11px; color:#666; }
    .kpi .v { font-size:18px; font-weight:600; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    table.info th { background:#f3f8f6; text-align:left; font-weight:600; padding:6px 8px; width:22%; color:#444; }
    table.info td { padding:6px 8px; border-bottom:1px solid #eee; }
    table.data th { background: hsl(160,60%,96%); padding:8px; text-align:left; border-bottom:2px solid hsl(160,60%,40%); font-size:11px; }
    table.data td { padding:8px; border-bottom:1px solid #eee; vertical-align:top; }
    table.data tr:nth-child(even) td { background:#fafafa; }
    .badges span { display:inline-block; padding:2px 8px; margin:2px; border-radius:10px; background:#eef6f2; font-size:11px; }
    .muted { color:#888; font-style:italic; }
    .footer { margin-top:32px; padding-top:12px; border-top:1px solid #ddd; font-size:11px; color:#555; display:flex; justify-content:space-between; }
    ${watermarkStyle}
  </style>
  </head><body>
  ${buildWatermarkHtml(!!isFree)}
  <div class="header">
    <div>
      ${clinic.logo ? `<img src="${clinic.logo}" style="max-height:50px;"/>` : ""}
      <h1>Rapport d'exploitation</h1>
    </div>
    <div class="clinic">
      <strong>${clinic.clinicName ?? ""}</strong>
      ${clinic.address ?? ""}<br/>
      ${clinic.phone ?? ""} · ${clinic.email ?? ""}
    </div>
  </div>

  <section class="block">
    <h2>Exploitation</h2>
    <table class="info">
      <tr><th>Nom</th><td>${farm.farm_name ?? "—"}</td><th>Propriétaire</th><td>${ownerName ?? "—"}</td></tr>
      <tr><th>Types d'élevage</th><td colspan="3"><div class="badges">${farmTypes.map(t=>`<span>${t}</span>`).join("") || "—"}</div></td></tr>
      <tr><th>Production</th><td>${farm.production_type ?? "—"}</td><th>Logement</th><td>${farm.housing_type ?? "—"}</td></tr>
      <tr><th>Adresse</th><td>${farm.address ?? "—"}</td><th>Surface</th><td>${farm.surface_hectares != null ? farm.surface_hectares+" ha" : "—"}</td></tr>
      <tr><th>Téléphone</th><td>${farm.phone ?? "—"}</td><th>Email</th><td>${farm.email ?? "—"}</td></tr>
      <tr><th>N° enregistrement</th><td>${farm.registration_number ?? "—"}</td><th>Statut</th><td>${farm.active ? "Actif" : "Inactif"}</td></tr>
    </table>
    ${farm.notes ? `<p>${farm.notes}</p>` : ""}
  </section>

  <section class="block">
    <h2>Cheptel actif</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">Total cheptel actif</div><div class="v">${totalActive}</div></div>
      <div class="kpi"><div class="l">Lots actifs</div><div class="v">${activeBatches.length}</div></div>
      <div class="kpi"><div class="l">Infrastructures</div><div class="v">${infrastructures.length}</div></div>
      <div class="kpi"><div class="l">Interventions</div><div class="v">${interventions.length}</div></div>
    </div>
    ${Object.keys(byCat).length ? `
    <table class="data" style="margin-top:10px">
      <thead><tr><th>Catégorie</th><th>Effectif</th><th>%</th></tr></thead>
      <tbody>
        ${Object.entries(byCat).map(([k,v]) => `
          <tr><td>${k}</td><td>${v}</td><td>${totalActive ? Math.round((v/totalActive)*100) : 0}%</td></tr>`).join("")}
      </tbody>
    </table>` : ""}
  </section>

  <section class="block">
    <h2>Lots (${batches.length})</h2>
    ${batches.length === 0 ? `<p class="muted">Aucun lot.</p>` : `
    <table class="data">
      <thead><tr><th>Nom</th><th>Type</th><th>Catégorie</th><th>Espèce</th><th>Effectif</th><th>Emplacement</th><th>Statut</th></tr></thead>
      <tbody>
        ${batches.map(b => `<tr>
          <td>${b.name ?? "—"}</td>
          <td>${b.farm_type ?? "—"}</td>
          <td>${b.category ?? "—"}</td>
          <td>${b.species ?? "—"}</td>
          <td>${b.animal_count ?? 0}</td>
          <td>${b.location ?? "—"}</td>
          <td>${b.status ?? "active"}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>

  <section class="block">
    <h2>Infrastructures (${infrastructures.length})</h2>
    ${infrastructures.length === 0 ? `<p class="muted">Aucune infrastructure.</p>` : `
    <table class="data">
      <thead><tr><th>Nom</th><th>Type</th><th>Capacité</th><th>Surface</th><th>Notes</th></tr></thead>
      <tbody>
        ${infrastructures.map(i => `<tr>
          <td>${i.name ?? "—"}</td>
          <td>${i.infra_type ?? "—"}</td>
          <td>${i.capacity ?? "—"}</td>
          <td>${i.surface_sqm ? i.surface_sqm+" m²" : "—"}</td>
          <td>${i.notes ?? ""}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>

  <section class="block">
    <h2>Interventions (${interventions.length})</h2>
    ${interventions.length === 0 ? `<p class="muted">Aucune intervention.</p>` : `
    <table class="data">
      <thead><tr><th>Date</th><th>Type</th><th>Nature</th><th>Effectif</th><th>Diagnostic</th><th>Traitement</th><th>Coût</th></tr></thead>
      <tbody>
        ${interventions.map(i => `<tr>
          <td>${fmtDate(i.intervention_date)}</td>
          <td>${i.intervention_type ?? "—"}</td>
          <td>${i.protocol_type ?? "—"}</td>
          <td>${i.affected_count ?? i.animal_count ?? "—"}</td>
          <td>${i.diagnosis ?? "—"}</td>
          <td>${i.treatment ?? "—"}</td>
          <td>${i.cost != null ? i.cost+" MAD" : "—"}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>

  <section class="block">
    <h2>Évènements sanitaires (${events.length})</h2>
    ${events.length === 0 ? `<p class="muted">Aucun évènement.</p>` : `
    <table class="data">
      <thead><tr><th>Date</th><th>Type</th><th>Produit</th><th>Dose</th><th>Effectif</th><th>Notes</th></tr></thead>
      <tbody>
        ${events.map(e => `<tr>
          <td>${fmtDate(e.event_date)}</td>
          <td>${e.event_type ?? "—"}</td>
          <td>${e.product ?? "—"}</td>
          <td>${e.dose ?? "—"}</td>
          <td>${e.affected_count ?? "—"}</td>
          <td>${e.notes ?? ""}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>

  <div class="footer">
    <div>Document généré le ${new Date().toLocaleDateString("fr-FR")}</div>
    <div>${clinic.clinicName ?? ""}</div>
  </div>
  </body></html>`;
}

export async function printHtml(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

export async function downloadHtmlAsPdf(html: string, filename: string) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.zIndex = "-1";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  const styleMatch = html.match(/<style[\s\S]*?<\/style>/i)?.[0] || "";
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  container.innerHTML = `${styleMatch}<div class="pdf-root">${bodyMatch}</div>`;
  document.body.appendChild(container);
  await new Promise((r) => setTimeout(r, 250));
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf().set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    } as any).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}
