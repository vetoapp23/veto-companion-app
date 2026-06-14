// @ts-nocheck
import { buildWatermarkHtml } from "@/lib/printWatermark";
import { buildReportDocument, buildDefaultFooter } from "@/lib/reportStyles";

export { downloadHtmlAsPdf, printHtml } from "@/lib/htmlToPdf";

export type FarmSectionKey =
  | "identity"
  | "herd"
  | "batches"
  | "infrastructures"
  | "interventions"
  | "events"
  | "photos";

export type FarmTemplate = "complete" | "summary" | "sanitary" | "inventory";

export const FARM_SECTION_LABELS: Record<FarmSectionKey, string> = {
  identity: "Exploitation",
  herd: "Cheptel actif",
  batches: "Lots",
  infrastructures: "Infrastructures",
  interventions: "Interventions",
  events: "Évènements sanitaires",
  photos: "Photos",
};

export const FARM_TEMPLATES: Record<FarmTemplate, Record<FarmSectionKey, boolean>> = {
  complete: {
    identity: true, herd: true, batches: true, infrastructures: true,
    interventions: true, events: true, photos: false,
  },
  summary: {
    identity: true, herd: true, batches: false, infrastructures: false,
    interventions: true, events: false, photos: false,
  },
  sanitary: {
    identity: true, herd: false, batches: false, infrastructures: false,
    interventions: true, events: true, photos: false,
  },
  inventory: {
    identity: true, herd: true, batches: true, infrastructures: true,
    interventions: false, events: false, photos: false,
  },
};

const ALL_SECTIONS: Record<FarmSectionKey, boolean> = {
  identity: true, herd: true, batches: true, infrastructures: true,
  interventions: true, events: true, photos: true,
};

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
  sections?: Record<FarmSectionKey, boolean>;
  dateFrom?: string;
  dateTo?: string;
}

const inRange = (d?: string | null, dateFrom?: string, dateTo?: string) => {
  if (!d) return true;
  if (dateFrom && d < dateFrom) return false;
  if (dateTo && d > dateTo) return false;
  return true;
};

export function buildFarmReportHtml({
  farm, ownerName, batches, infrastructures, interventions, events, clinic, isFree,
  sections = ALL_SECTIONS, dateFrom = "", dateTo = "",
}: BuildArgs) {
  const activeBatches = batches.filter((b) => (b.status || "active") === "active");
  const totalActive = activeBatches.reduce((s, b) => s + (b.animal_count || 0), 0);

  const byCat: Record<string, number> = {};
  activeBatches.forEach((b) => {
    const k = b.category || b.species || "Non catégorisé";
    byCat[k] = (byCat[k] || 0) + (b.animal_count || 0);
  });

  const farmTypes: string[] = (farm.farm_types && farm.farm_types.length > 0)
    ? farm.farm_types
    : (farm.farm_type ? [farm.farm_type] : []);

  const filteredInterventions = interventions.filter((i) =>
    inRange(i.intervention_date, dateFrom, dateTo)
  );
  const filteredEvents = events.filter((e) =>
    inRange(e.event_date, dateFrom, dateTo)
  );

  const sectionsHtml: string[] = [];

  if (sections.identity) {
    sectionsHtml.push(`
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
    ${farm.certifications?.length ? `<p><strong>Certifications :</strong> ${farm.certifications.join(", ")}</p>` : ""}
    ${farm.notes ? `<p>${farm.notes}</p>` : ""}
  </section>`);
  }

  if (sections.herd) {
    sectionsHtml.push(`
  <section class="block">
    <h2>Cheptel actif</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">Total cheptel actif</div><div class="v">${totalActive}</div></div>
      <div class="kpi"><div class="l">Lots actifs</div><div class="v">${activeBatches.length}</div></div>
      <div class="kpi"><div class="l">Infrastructures</div><div class="v">${infrastructures.length}</div></div>
      <div class="kpi"><div class="l">Interventions</div><div class="v">${filteredInterventions.length}</div></div>
    </div>
    ${Object.keys(byCat).length ? `
    <table class="data" style="margin-top:10px">
      <thead><tr><th>Catégorie</th><th>Effectif</th><th>%</th></tr></thead>
      <tbody>
        ${Object.entries(byCat).map(([k,v]) => `
          <tr><td>${k}</td><td>${v}</td><td>${totalActive ? Math.round((v/totalActive)*100) : 0}%</td></tr>`).join("")}
      </tbody>
    </table>` : ""}
  </section>`);
  }

  if (sections.batches) {
    sectionsHtml.push(`
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
  </section>`);
  }

  if (sections.infrastructures) {
    sectionsHtml.push(`
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
  </section>`);
  }

  if (sections.interventions) {
    sectionsHtml.push(`
  <section class="block">
    <h2>Interventions (${filteredInterventions.length})</h2>
    ${filteredInterventions.length === 0 ? `<p class="muted">Aucune intervention.</p>` : `
    <table class="data">
      <thead><tr><th>Date</th><th>Type</th><th>Nature</th><th>Effectif</th><th>Diagnostic</th><th>Traitement</th><th>Coût</th></tr></thead>
      <tbody>
        ${filteredInterventions.map(i => `<tr>
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
  </section>`);
  }

  if (sections.events) {
    sectionsHtml.push(`
  <section class="block">
    <h2>Évènements sanitaires (${filteredEvents.length})</h2>
    ${filteredEvents.length === 0 ? `<p class="muted">Aucun évènement.</p>` : `
    <table class="data">
      <thead><tr><th>Date</th><th>Type</th><th>Produit</th><th>Dose</th><th>Effectif</th><th>Notes</th></tr></thead>
      <tbody>
        ${filteredEvents.map(e => `<tr>
          <td>${fmtDate(e.event_date)}</td>
          <td>${e.event_type ?? "—"}</td>
          <td>${e.product ?? "—"}</td>
          <td>${e.dose ?? "—"}</td>
          <td>${e.affected_count ?? "—"}</td>
          <td>${e.notes ?? ""}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>`);
  }

  if (sections.photos) {
    const photos: string[] = farm.photos || [];
    sectionsHtml.push(`
  <section class="block">
    <h2>Photos (${photos.length})</h2>
    ${photos.length === 0 ? `<p class="muted">Aucune photo.</p>` : `
    <div class="photos">
      ${photos.map((src, i) => `
        <div class="photo-item">
          <div class="photo-label">Photo ${i + 1}</div>
          <img src="${src}" alt="Photo exploitation ${i + 1}" />
        </div>`).join("")}
    </div>`}
  </section>`);
  }

  return buildReportDocument({
    title: `Rapport exploitation – ${farm.farm_name}`,
    watermarkHtml: buildWatermarkHtml(!!isFree),
    headerTitle: "Rapport d'exploitation",
    clinic,
    sectionsHtml: sectionsHtml.join("\n"),
    footerHtml: buildDefaultFooter(clinic.clinicName, false),
  });
}

