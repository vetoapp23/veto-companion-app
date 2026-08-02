import i18n from "@/i18n";
import { getBcp47Locale } from "@/i18n/useAppLocale";
import { buildWatermarkHtml } from "@/lib/printWatermark";
import { buildReportDocument, buildDefaultFooter } from "@/lib/reportStyles";
import { formatSourceLabel } from "@/lib/accountingLedger";

export { downloadHtmlAsPdf, printHtml } from "@/lib/htmlToPdf";

const t = (key: string, opts?: Record<string, unknown>) =>
  i18n.t(key, { ns: "app", ...opts });

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
    return new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString(getBcp47Locale(i18n.language));
  } catch {
    return String(d);
  }
}

function fmtMoney(amount: number, currency: string): string {
  const n = Number(amount) || 0;
  return `${n.toLocaleString(getBcp47Locale(i18n.language), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function typeLabel(type: AccountingReportEntry["type"]): string {
  if (type === "revenue") return t("accounting.print.types.revenue");
  if (type === "valuation") return t("accounting.print.types.valuation");
  return t("accounting.print.types.expense");
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
  const sortLocale = (i18n.language || "fr").split("-")[0] || "fr";
  const sorted = [...entries].sort((a, b) => {
    const da = a.date.slice(0, 10);
    const db = b.date.slice(0, 10);
    if (da !== db) return da.localeCompare(db);
    return (a.description || "").localeCompare(b.description || "", sortLocale);
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
        <td>${e.category === "automatic" ? t("accounting.print.origin.auto") : t("accounting.print.origin.manual")}</td>
        <td class="num ${amountClass}">${prefix}${fmtMoney(e.amount, currency)}</td>
      </tr>`;
    })
    .join("");

  const sectionsHtml = `
  <section class="block">
    <h2>${t("accounting.print.period")}</h2>
    <table class="info">
      <tr>
        <th>${t("accounting.print.from")}</th><td>${fmtDate(startDate)}</td>
        <th>${t("accounting.print.to")}</th><td>${fmtDate(endDate)}</td>
      </tr>
    </table>
  </section>

  <section class="block">
    <h2>${t("accounting.print.summary")}</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">${t("accounting.print.kpis.revenue")}</div><div class="v amt-pos">${fmtMoney(totals.totalRevenue, currency)}</div></div>
      <div class="kpi"><div class="l">${t("accounting.print.kpis.expenses")}</div><div class="v amt-neg">${fmtMoney(totals.totalExpenses, currency)}</div></div>
      <div class="kpi"><div class="l">${t("accounting.print.kpis.netIncome")}</div><div class="v">${fmtMoney(totals.netIncome, currency)}</div></div>
      <div class="kpi"><div class="l">${t("accounting.print.kpis.grossMargin")}</div><div class="v">${fmtMoney(totals.grossMargin, currency)}</div></div>
    </div>
    ${
      totals.stockValuation > 0
        ? `<p class="muted" style="margin-top:10px">${t("accounting.print.stockValuationNote")} <strong>${fmtMoney(totals.stockValuation, currency)}</strong></p>`
        : ""
    }
  </section>

  <section class="block">
    <h2>${t("accounting.print.journalHeading", { count: totals.entriesCount })}</h2>
    ${
      sorted.length === 0
        ? `<p class="muted">${t("accounting.print.empty")}</p>`
        : `<table class="data">
      <thead>
        <tr>
          <th style="width:11%">${t("accounting.print.cols.date")}</th>
          <th style="width:12%">${t("accounting.print.cols.type")}</th>
          <th style="width:34%">${t("accounting.print.cols.description")}</th>
          <th style="width:14%">${t("accounting.print.cols.source")}</th>
          <th style="width:10%">${t("accounting.print.cols.origin")}</th>
          <th style="width:19%" class="num">${t("accounting.print.cols.amount")}</th>
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
    title: t("accounting.print.docTitle", { period: periodLabel }),
    watermarkHtml: buildWatermarkHtml(!!isFree),
    headerTitle: t("accounting.print.headerTitle"),
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
