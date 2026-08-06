// @ts-nocheck
import i18n from "@/i18n";
import { getBcp47Locale } from "@/i18n/useAppLocale";
import { buildWatermarkHtml } from "@/lib/printWatermark";
import { buildReportDocument, buildDefaultFooter } from "@/lib/reportStyles";
import { escapeHtml, safePrintUrl } from "@/lib/utils";

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

const t = (key: string, opts?: Record<string, unknown>) =>
  i18n.t(key, { ns: "app", ...opts });

/** Section keys — labels resolved at call time via i18n. */
export const FARM_SECTION_KEYS: FarmSectionKey[] = [
  "identity",
  "herd",
  "batches",
  "infrastructures",
  "interventions",
  "events",
  "photos",
];

/** Prefer getFarmSectionLabels() for translated labels */
export const FARM_SECTION_LABELS: Record<FarmSectionKey, string> = {
  identity: "identity",
  herd: "herd",
  batches: "batches",
  infrastructures: "infrastructures",
  interventions: "interventions",
  events: "events",
  photos: "photos",
};

export function getFarmSectionLabels(): Record<FarmSectionKey, string> {
  return {
    identity: t("farms.print.sections.identity"),
    herd: t("farms.print.sections.herd"),
    batches: t("farms.print.sections.batches"),
    infrastructures: t("farms.print.sections.infrastructures"),
    interventions: t("farms.print.sections.interventions"),
    events: t("farms.print.sections.events"),
    photos: t("farms.print.sections.photos"),
  };
}

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
  try { return new Date(d).toLocaleDateString(getBcp47Locale(i18n.language)); } catch { return String(d); }
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
  const esc = escapeHtml;
  const u = safePrintUrl;
  const activeBatches = batches.filter((b) => (b.status || "active") === "active");
  const totalActive = activeBatches.reduce((s, b) => s + (b.animal_count || 0), 0);

  const byCat: Record<string, number> = {};
  activeBatches.forEach((b) => {
    const k = b.category || b.species || t("farms.print.uncategorized");
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
  const L = "farms.print.labels";
  const C = "farms.print.cols";

  if (sections.identity) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.sections.identity"))}</h2>
    <table class="info">
      <tr><th>${esc(t(`${L}.name`))}</th><td>${esc(farm.farm_name ?? "—")}</td><th>${esc(t(`${L}.owner`))}</th><td>${esc(ownerName ?? "—")}</td></tr>
      <tr><th>${esc(t(`${L}.farmTypes`))}</th><td colspan="3"><div class="badges">${farmTypes.map(tp=>`<span>${esc(tp)}</span>`).join("") || "—"}</div></td></tr>
      <tr><th>${esc(t(`${L}.production`))}</th><td>${esc(farm.production_type ?? "—")}</td><th>${esc(t(`${L}.housing`))}</th><td>${esc(farm.housing_type ?? "—")}</td></tr>
      <tr><th>${esc(t(`${L}.address`))}</th><td>${esc(farm.address ?? "—")}</td><th>${esc(t(`${L}.surface`))}</th><td>${esc(farm.surface_hectares != null ? farm.surface_hectares+" "+t(`${L}.hectaresUnit`) : "—")}</td></tr>
      <tr><th>${esc(t(`${L}.phone`))}</th><td>${esc(farm.phone ?? "—")}</td><th>${esc(t(`${L}.email`))}</th><td>${esc(farm.email ?? "—")}</td></tr>
      <tr><th>${esc(t(`${L}.registration`))}</th><td>${esc(farm.registration_number ?? "—")}</td><th>${esc(t(`${L}.status`))}</th><td>${esc(farm.active ? t("farms.print.active") : t("farms.print.inactive"))}</td></tr>
    </table>
    ${farm.certifications?.length ? `<p><strong>${esc(t(`${L}.certifications`))}</strong> ${esc(farm.certifications.join(", "))}</p>` : ""}
    ${farm.notes ? `<p>${esc(farm.notes)}</p>` : ""}
  </section>`);
  }

  if (sections.herd) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.herdTitle"))}</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">${esc(t("farms.print.totalHerd"))}</div><div class="v">${esc(totalActive)}</div></div>
      <div class="kpi"><div class="l">${esc(t("farms.print.activeBatches"))}</div><div class="v">${esc(activeBatches.length)}</div></div>
      <div class="kpi"><div class="l">${esc(t("farms.print.infrastructures"))}</div><div class="v">${esc(infrastructures.length)}</div></div>
      <div class="kpi"><div class="l">${esc(t("farms.print.interventions"))}</div><div class="v">${esc(filteredInterventions.length)}</div></div>
    </div>
    ${Object.keys(byCat).length ? `
    <table class="data" style="margin-top:10px">
      <thead><tr><th>${esc(t(`${C}.category`))}</th><th>${esc(t(`${C}.headcount`))}</th><th>${esc(t(`${C}.percent`))}</th></tr></thead>
      <tbody>
        ${Object.entries(byCat).map(([k,v]) => `
          <tr><td>${esc(k)}</td><td>${esc(v)}</td><td>${esc(totalActive ? Math.round((v/totalActive)*100) : 0)}%</td></tr>`).join("")}
      </tbody>
    </table>` : ""}
  </section>`);
  }

  if (sections.batches) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.batchesHeading", { count: batches.length }))}</h2>
    ${batches.length === 0 ? `<p class="muted">${esc(t("farms.print.empty.batches"))}</p>` : `
    <table class="data">
      <thead><tr><th>${esc(t(`${C}.name`))}</th><th>${esc(t(`${C}.type`))}</th><th>${esc(t(`${C}.category`))}</th><th>${esc(t(`${C}.species`))}</th><th>${esc(t(`${C}.headcount`))}</th><th>${esc(t(`${C}.location`))}</th><th>${esc(t(`${C}.status`))}</th></tr></thead>
      <tbody>
        ${batches.map(b => `<tr>
          <td>${esc(b.name ?? "—")}</td>
          <td>${esc(b.farm_type ?? "—")}</td>
          <td>${esc(b.category ?? "—")}</td>
          <td>${esc(b.species ?? "—")}</td>
          <td>${esc(b.animal_count ?? 0)}</td>
          <td>${esc(b.location ?? "—")}</td>
          <td>${esc(b.status ?? "active")}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>`);
  }

  if (sections.infrastructures) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.infraHeading", { count: infrastructures.length }))}</h2>
    ${infrastructures.length === 0 ? `<p class="muted">${esc(t("farms.print.empty.infra"))}</p>` : `
    <table class="data">
      <thead><tr><th>${esc(t(`${C}.name`))}</th><th>${esc(t(`${C}.type`))}</th><th>${esc(t(`${C}.capacity`))}</th><th>${esc(t(`${C}.surface`))}</th><th>${esc(t(`${C}.notes`))}</th></tr></thead>
      <tbody>
        ${infrastructures.map(i => `<tr>
          <td>${esc(i.name ?? "—")}</td>
          <td>${esc(i.infra_type ?? "—")}</td>
          <td>${esc(i.capacity ?? "—")}</td>
          <td>${esc(i.surface_sqm ? i.surface_sqm+" "+t("farms.print.sqmUnit") : "—")}</td>
          <td>${esc(i.notes ?? "")}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>`);
  }

  if (sections.interventions) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.interventionsHeading", { count: filteredInterventions.length }))}</h2>
    ${filteredInterventions.length === 0 ? `<p class="muted">${esc(t("farms.print.empty.interventions"))}</p>` : `
    <table class="data">
      <thead><tr><th>${esc(t(`${C}.date`))}</th><th>${esc(t(`${C}.type`))}</th><th>${esc(t(`${C}.nature`))}</th><th>${esc(t(`${C}.headcount`))}</th><th>${esc(t(`${C}.diagnosis`))}</th><th>${esc(t(`${C}.treatment`))}</th><th>${esc(t(`${C}.cost`))}</th></tr></thead>
      <tbody>
        ${filteredInterventions.map(i => `<tr>
          <td>${esc(fmtDate(i.intervention_date))}</td>
          <td>${esc(i.intervention_type ?? "—")}</td>
          <td>${esc(i.protocol_type ?? "—")}</td>
          <td>${esc(i.affected_count ?? i.animal_count ?? "—")}</td>
          <td>${esc(i.diagnosis ?? "—")}</td>
          <td>${esc(i.treatment ?? "—")}</td>
          <td>${esc(i.cost != null ? i.cost+" MAD" : "—")}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>`);
  }

  if (sections.events) {
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.eventsHeading", { count: filteredEvents.length }))}</h2>
    ${filteredEvents.length === 0 ? `<p class="muted">${esc(t("farms.print.empty.events"))}</p>` : `
    <table class="data">
      <thead><tr><th>${esc(t(`${C}.date`))}</th><th>${esc(t(`${C}.type`))}</th><th>${esc(t(`${C}.product`))}</th><th>${esc(t(`${C}.dose`))}</th><th>${esc(t(`${C}.headcount`))}</th><th>${esc(t(`${C}.notes`))}</th></tr></thead>
      <tbody>
        ${filteredEvents.map(ev => `<tr>
          <td>${esc(fmtDate(ev.event_date))}</td>
          <td>${esc(ev.event_type ?? "—")}</td>
          <td>${esc(ev.product ?? "—")}</td>
          <td>${esc(ev.dose ?? "—")}</td>
          <td>${esc(ev.affected_count ?? "—")}</td>
          <td>${esc(ev.notes ?? "")}</td>
        </tr>`).join("")}
      </tbody>
    </table>`}
  </section>`);
  }

  if (sections.photos) {
    const photos: string[] = farm.photos || [];
    sectionsHtml.push(`
  <section class="block">
    <h2>${esc(t("farms.print.photosHeading", { count: photos.length }))}</h2>
    ${photos.length === 0 ? `<p class="muted">${esc(t("farms.print.empty.photos"))}</p>` : `
    <div class="photos">
      ${photos.map((src, i) => `
        <div class="photo-item">
          <div class="photo-label">${esc(t("farms.print.photoLabel", { n: i + 1 }))}</div>
          <img src="${u(src)}" alt="${esc(t("farms.print.photoAlt", { n: i + 1 }))}" />
        </div>`).join("")}
    </div>`}
  </section>`);
  }

  return buildReportDocument({
    title: t("farms.print.docTitle", { name: farm.farm_name }),
    watermarkHtml: buildWatermarkHtml(!!isFree),
    headerTitle: t("farms.print.headerTitle"),
    clinic,
    sectionsHtml: sectionsHtml.join("\n"),
    footerHtml: buildDefaultFooter(clinic.clinicName, false),
  });
}
