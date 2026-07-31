import { buildWatermarkHtml } from "@/lib/printWatermark";
import { buildReportDocument, buildDefaultFooter } from "@/lib/reportStyles";
import { formatSourceLabel } from "@/lib/accountingLedger";

export { downloadHtmlAsPdf, printHtml } from "@/lib/htmlToPdf";

export interface AccountingReportEntry {
  id: string;
  type: "revenue" | "expense" | "valuation";
  category: "automatic" | "manual";
  description: string;
  amount: number;
  date: string;
  source?: string;
  notes?: string;
}

export function accountingEntryKey(entry: Pick<AccountingReportEntry, "type" | "id">): string {
  return `${entry.type}-${entry.id}`;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString("fr-FR");
  } catch {
    return String(d);
  }
}

function fmtMoney(amount: number, currency: string): string {
  const n = Number(amount) || 0;
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function typeLabel(type: AccountingReportEntry["type"]): string {
  if (type === "revenue") return "Recette";
  if (type === "valuation") return "Valorisation";
  return "Charge";
}

export function computeAccountingTotals(entries: AccountingReportEntry[]) {
  const revenues = entries.filter((e) => e.type === "revenue");
  const expenses = entries.filter((e) => e.type === "expense");
  const valuations = entries.filter((e) => e.type === "valuation");
  const totalRevenue = revenues.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const stockValuation = valuations.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const cogs = expenses
    .filter((e) => e.source === "cogs")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  return {
    totalRevenue,
    totalExpenses,
    stockValuation,
    netIncome: totalRevenue - totalExpenses,
    grossMargin: totalRevenue - cogs,
    entriesCount: entries.length,
  };
}

interface BuildArgs {
  entries: AccountingReportEntry[];
  startDate: string;
  endDate: string;
  currency: string;
  clinic: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    website?: string;
  };
  isFree?: boolean;
}

export function buildAccountingReportHtml({
  entries,
  startDate,
  endDate,
  currency,
  clinic,
  isFree,
}: BuildArgs): string {
  const sorted = [...entries].sort((a, b) => {
    const da = a.date.slice(0, 10);
    const db = b.date.slice(0, 10);
    if (da !== db) return da.localeCompare(db);
    return (a.description || "").localeCompare(b.description || "", "fr");
  });

  const totals = computeAccountingTotals(sorted);
  const periodLabel = `${fmtDate(startDate)} → ${fmtDate(endDate)}`;

  const rows = sorted
    .map((e) => {
      const amountClass =
        e.type === "revenue" ? "amt-pos" : e.type === "valuation" ? "amt-val" : "amt-neg";
      const prefix = e.type === "revenue" ? "+" : e.type === "valuation" ? "" : "−";
      const notes =
        e.notes && !e.notes.startsWith("__recurring__:")
          ? `<div class="row-note">${esc(e.notes)}</div>`
          : "";
      return `<tr>
        <td>${fmtDate(e.date)}</td>
        <td><span class="badge badge-${e.type}">${typeLabel(e.type)}</span></td>
        <td>
          <div class="row-desc">${esc(e.description)}</div>
          ${notes}
        </td>
        <td>${esc(formatSourceLabel(e.source))}</td>
        <td>${e.category === "automatic" ? "Auto" : "Manuel"}</td>
        <td class="num ${amountClass}">${prefix}${fmtMoney(e.amount, currency)}</td>
      </tr>`;
    })
    .join("");

  const sectionsHtml = `
  <section class="block">
    <h2>Période</h2>
    <table class="info">
      <tr>
        <th>Du</th><td>${fmtDate(startDate)}</td>
        <th>Au</th><td>${fmtDate(endDate)}</td>
      </tr>
    </table>
  </section>

  <section class="block">
    <h2>Synthèse du bilan</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">Chiffre d'affaires</div><div class="v amt-pos">${fmtMoney(totals.totalRevenue, currency)}</div></div>
      <div class="kpi"><div class="l">Charges (P&amp;L)</div><div class="v amt-neg">${fmtMoney(totals.totalExpenses, currency)}</div></div>
      <div class="kpi"><div class="l">Résultat net</div><div class="v">${fmtMoney(totals.netIncome, currency)}</div></div>
      <div class="kpi"><div class="l">Marge brute</div><div class="v">${fmtMoney(totals.grossMargin, currency)}</div></div>
    </div>
    ${
      totals.stockValuation > 0
        ? `<p class="muted" style="margin-top:10px">Valorisation stock (hors CA / hors charges) : <strong>${fmtMoney(totals.stockValuation, currency)}</strong></p>`
        : ""
    }
  </section>

  <section class="block">
    <h2>Journal comptable (${totals.entriesCount})</h2>
    ${
      sorted.length === 0
        ? `<p class="muted">Aucune écriture pour cette période.</p>`
        : `<table class="data">
      <thead>
        <tr>
          <th style="width:11%">Date</th>
          <th style="width:12%">Type</th>
          <th style="width:34%">Description</th>
          <th style="width:14%">Source</th>
          <th style="width:10%">Origine</th>
          <th style="width:19%" class="num">Montant</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
    }
  </section>
  `;

  const extraStyles = `
    .num { text-align: right; white-space: nowrap; }
    .amt-pos { color: #15803d; font-weight: 600; }
    .amt-neg { color: #b91c1c; font-weight: 600; }
    .amt-val { color: #1d4ed8; font-weight: 600; }
    .row-desc { font-weight: 600; }
    .row-note { font-size: 10px; color: #777; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
    }
    .badge-revenue { background: #16a34a; }
    .badge-expense { background: #dc2626; }
    .badge-valuation { background: #2563eb; }
    table.data th.num, table.data td.num { text-align: right; }
  `;

  const addressParts = [clinic.address, clinic.website].filter(Boolean).join(" · ");

  return buildReportDocument({
    title: `Bilan comptable – ${periodLabel}`,
    watermarkHtml: buildWatermarkHtml(!!isFree),
    headerTitle: "Bilan comptable",
    clinic: {
      clinicName: clinic.clinicName,
      address: addressParts || clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      logo: clinic.logo,
    },
    sectionsHtml,
    footerHtml: buildDefaultFooter(clinic.clinicName, true),
    extraStyles,
  });
}
