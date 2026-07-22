import { supabase } from "@/integrations/supabase/client";
import type { Visit, VisitService } from "@/lib/visits";
import { printHtml } from "@/lib/htmlToPdf";
import { todayLocalKey } from "@/lib/dateLocal";

export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export interface VisitInvoiceLine {
  label: string;
  service_code?: string | null;
  quantity: number;
  unit_price: number;
  amount: number;
  reference_type?: string | null;
  reference_id?: string | null;
  sort_order: number;
}

export interface VisitInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  client_id: string;
  visit_id: string | null;
  organization_id: string | null;
  total_amount: number;
  tax_amount: number | null;
  status: string;
  payment_date?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  lines?: VisitInvoiceLine[];
}

export interface ClinicPrintSettings {
  clinicName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  currency?: string;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getOrgAndUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.organization_id) {
    throw new Error("Organisation introuvable");
  }

  return { user, organizationId: profile.organization_id as string };
}

/** Build billable lines: per_head multiplies qty by head_count */
export function buildBillableLines(
  services: VisitService[],
  billingMode: "forfait" | "per_head" | null | undefined,
  headCount: number | null | undefined
): VisitInvoiceLine[] {
  const qtyBase =
    billingMode === "per_head" && headCount && headCount > 0 ? headCount : 1;

  return services
    .filter((s) => s.status === "done" && Number(s.amount) > 0)
    .map((s, i) => {
      const unit = Number(s.amount) || 0;
      return {
        label: s.service_label,
        service_code: s.service_code,
        quantity: qtyBase,
        unit_price: unit,
        amount: unit * qtyBase,
        reference_type: s.reference_type,
        reference_id: s.reference_id,
        sort_order: i,
      };
    });
}

export function sumLines(lines: VisitInvoiceLine[]) {
  return lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
}

export async function nextInvoiceNumber(organizationId: string): Promise<string> {
  const ym = todayLocalKey().slice(0, 7).replace("-", "");
  const prefix = `FAC-${ym}-`;

  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("organization_id", organizationId)
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);

  let seq = 1;
  const last = data?.[0]?.invoice_number;
  if (last) {
    const part = last.split("-").pop();
    const n = parseInt(part || "0", 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function createVisitInvoice(opts: {
  visit: Visit;
  services: VisitService[];
  taxRate?: number;
  notes?: string;
}): Promise<VisitInvoice> {
  const { user, organizationId } = await getOrgAndUser();
  const visit = opts.visit;

  if (visit.invoiced && visit.invoice_id) {
    return getVisitInvoice(visit.invoice_id);
  }

  const lines = buildBillableLines(
    opts.services,
    visit.billing_mode,
    visit.head_count
  );
  if (lines.length === 0) {
    throw new Error("Aucune prestation facturable (montant > 0 et statut fait).");
  }

  const total = sumLines(lines);
  const taxRate = opts.taxRate ?? 0;
  const taxAmount = Math.round(total * taxRate * 100) / 100;
  const invoiceNumber = await nextInvoiceNumber(organizationId);
  const invoiceDate = todayLocalKey();

  const descLines = lines
    .map((l) => `${l.label} ×${l.quantity}: ${l.amount.toFixed(0)}`)
    .join(" · ");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      client_id: visit.client_id,
      organization_id: organizationId,
      user_id: user.id,
      visit_id: visit.id,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      total_amount: total,
      tax_amount: taxAmount,
      status: "issued",
      notes: opts.notes || descLines,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const lineRows = lines.map((l) => ({
    invoice_id: invoice.id,
    organization_id: organizationId,
    label: l.label,
    service_code: l.service_code || null,
    quantity: l.quantity,
    unit_price: l.unit_price,
    amount: l.amount,
    reference_type: l.reference_type || null,
    reference_id: l.reference_id || null,
    sort_order: l.sort_order,
  }));

  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);
  if (linesError) throw new Error(linesError.message);

  const farmLabel = visit.farm?.farm_name ? ` / ${visit.farm.farm_name}` : "";
  const animalLabel = visit.animal?.name ? ` / ${visit.animal.name}` : "";

  const { error: revError } = await supabase.from("revenue").insert({
    user_id: user.id,
    organization_id: organizationId,
    revenue_date: invoiceDate,
    source: "visit",
    category: visit.context === "farm" ? "elevage" : "visite",
    description: `Visite — ${visit.client?.first_name || ""} ${visit.client?.last_name || ""}${farmLabel}${animalLabel}`.trim(),
    amount: total,
    notes: descLines,
    client_id: visit.client_id,
    reference_id: visit.id,
    reference_type: "visit",
  });

  if (revError) {
    // Roll back invoice if revenue fails (best-effort)
    await supabase.from("invoices").delete().eq("id", invoice.id);
    throw new Error(revError.message || "La recette n'a pas pu être enregistrée");
  }

  const { error: visitError } = await supabase
    .from("visits")
    .update({
      invoiced: true,
      invoice_id: invoice.id,
      total_amount: total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", visit.id);

  if (visitError) throw new Error(visitError.message);

  return {
    ...invoice,
    lines,
  } as VisitInvoice;
}

export async function getVisitInvoice(invoiceId: string): Promise<VisitInvoice> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();
  if (error) throw new Error(error.message);

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("sort_order");

  return { ...data, lines: lines || [] } as VisitInvoice;
}

export async function markInvoicePaid(
  invoiceId: string,
  paymentMethod?: string
): Promise<VisitInvoice> {
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      payment_date: todayLocalKey(),
      payment_method: paymentMethod || "cash",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  return getVisitInvoice(invoiceId);
}

export function buildVisitInvoiceHtml(opts: {
  invoice: VisitInvoice;
  visit: Visit;
  settings: ClinicPrintSettings;
}): string {
  const { invoice, visit, settings } = opts;
  const currency = settings.currency || "MAD";
  const clinic = settings.clinicName || "Clinique vétérinaire";
  const lines = invoice.lines || [];
  const tax = Number(invoice.tax_amount || 0);
  const total = Number(invoice.total_amount || 0);
  const ht = total - tax;

  const clientName = `${visit.client?.first_name || ""} ${visit.client?.last_name || ""}`.trim();
  const subject =
    visit.context === "farm"
      ? visit.farm?.farm_name || "Exploitation"
      : visit.animal
        ? `${visit.animal.name}${visit.animal.species ? ` (${visit.animal.species})` : ""}`
        : "—";

  const linesHtml = lines
    .map(
      (l) => `
      <tr>
        <td>${escapeHtml(l.label)}</td>
        <td style="text-align:center">${Number(l.quantity)}</td>
        <td style="text-align:right">${Number(l.unit_price).toFixed(2)}</td>
        <td style="text-align:right">${Number(l.amount).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const logoHtml = settings.logo
    ? `<img src="${settings.logo}" alt="" style="max-height:64px;max-width:120px;object-fit:contain" />`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtml(invoice.invoice_number)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; margin: 0; color: #1a1a1a; background: #fff; }
    .report-root { width: 794px; max-width: 794px; padding: 32px 40px; box-sizing: border-box; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .clinic h1 { margin: 0 0 6px; font-size: 22px; color: #0f766e; }
    .clinic p { margin: 2px 0; font-size: 12px; color: #555; }
    .meta { text-align: right; font-size: 13px; }
    .meta strong { font-size: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
    .box h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #f0fdfa; text-align: left; padding: 10px 8px; border-bottom: 1px solid #99f6e4; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-left: auto; width: 240px; font-size: 13px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #0f766e; margin-top: 8px; padding-top: 8px; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;
      background: ${invoice.status === "paid" ? "#dcfce7" : "#fef3c7"}; color: ${invoice.status === "paid" ? "#166534" : "#92400e"}; }
    .footer { margin-top: 36px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="report-root">
    <div class="header">
      <div class="clinic">
        ${logoHtml}
        <h1>${escapeHtml(clinic)}</h1>
        ${settings.address ? `<p>${escapeHtml(settings.address)}</p>` : ""}
        ${settings.phone ? `<p>Tél. ${escapeHtml(settings.phone)}</p>` : ""}
        ${settings.email ? `<p>${escapeHtml(settings.email)}</p>` : ""}
      </div>
      <div class="meta">
        <strong>FACTURE</strong><br/>
        N° ${escapeHtml(invoice.invoice_number)}<br/>
        Date : ${escapeHtml(invoice.invoice_date)}<br/>
        <span class="status">${invoice.status === "paid" ? "Payée" : "Émise"}</span>
      </div>
    </div>
    <div class="grid">
      <div class="box">
        <h3>Client</h3>
        <div>${escapeHtml(clientName || "—")}</div>
        ${visit.client?.phone ? `<div>${escapeHtml(visit.client.phone)}</div>` : ""}
        ${visit.client?.email ? `<div>${escapeHtml(visit.client.email)}</div>` : ""}
      </div>
      <div class="box">
        <h3>${visit.context === "farm" ? "Exploitation" : "Animal"}</h3>
        <div>${escapeHtml(subject)}</div>
        ${
          visit.context === "farm" && visit.head_count
            ? `<div>Effectif facturé : ${visit.head_count}${
                visit.billing_mode === "per_head" ? " (à la tête)" : " (forfait)"
              }</div>`
            : ""
        }
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Prestation</th>
          <th style="text-align:center">Qté</th>
          <th style="text-align:right">P.U. (${escapeHtml(currency)})</th>
          <th style="text-align:right">Montant</th>
        </tr>
      </thead>
      <tbody>${linesHtml}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Sous-total</span><span>${ht.toFixed(2)} ${escapeHtml(currency)}</span></div>
      ${tax > 0 ? `<div class="row"><span>TVA</span><span>${tax.toFixed(2)} ${escapeHtml(currency)}</span></div>` : ""}
      <div class="row grand"><span>Total TTC</span><span>${total.toFixed(2)} ${escapeHtml(currency)}</span></div>
    </div>
    <div class="footer">Document généré par VetoCrm — ${escapeHtml(clinic)}</div>
  </div>
</body>
</html>`;
}

/**
 * Ouvre la facture dans la boîte d'impression navigateur
 * (Imprimer ou Enregistrer au format PDF — même rendu CSS).
 */
export async function printVisitInvoice(
  invoice: VisitInvoice,
  visit: Visit,
  settings: ClinicPrintSettings
) {
  const html = buildVisitInvoiceHtml({ invoice, visit, settings });
  await printHtml(html);
}

/** Alias : même module que l'impression (évite html2canvas qui casse la mise en page). */
export async function downloadVisitInvoicePdf(
  invoice: VisitInvoice,
  visit: Visit,
  settings: ClinicPrintSettings
) {
  await printVisitInvoice(invoice, visit, settings);
}
