import { supabase } from "@/lib/supabase";
import { todayLocalKey } from "@/lib/dateLocal";

export type LedgerSource =
  | "visit"
  | "consultation"
  | "vaccination"
  | "antiparasitic"
  | "prescription"
  | "stock_sale"
  | "stock_purchase"
  | "cogs"
  | "other";

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

/** Recette idempotente via reference_id + reference_type */
export async function postRevenue(input: {
  source: LedgerSource | string;
  category?: string;
  description: string;
  amount: number;
  revenue_date?: string;
  reference_id?: string | null;
  reference_type?: string | null;
  client_id?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  /** Si une ligne existe déjà pour cette référence, met à jour montant / libellés */
  updateIfExists?: boolean;
}) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const { user, organizationId } = await getOrgAndUser();

  if (input.reference_id && input.reference_type) {
    const { data: existing } = await supabase
      .from("revenue")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("reference_id", input.reference_id)
      .eq("reference_type", input.reference_type)
      .maybeSingle();
    if (existing) {
      if (input.updateIfExists) {
        const { error: updErr } = await supabase
          .from("revenue")
          .update({
            source: input.source,
            category: input.category || input.source,
            description: input.description,
            amount,
            client_id: input.client_id || null,
            notes: input.notes || null,
            payment_method: input.payment_method || null,
            ...(input.revenue_date ? { revenue_date: input.revenue_date } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (updErr) throw new Error(updErr.message);
      }
      return existing;
    }
  }

  const { data, error } = await supabase
    .from("revenue")
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      revenue_date: input.revenue_date || todayLocalKey(),
      source: input.source,
      category: input.category || input.source,
      description: input.description,
      amount,
      reference_id: input.reference_id || null,
      reference_type: input.reference_type || null,
      client_id: input.client_id || null,
      notes: input.notes || null,
      payment_method: input.payment_method || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRevenueByReference(
  referenceId: string,
  referenceType: string
) {
  if (!referenceId || !referenceType) return;
  const { organizationId } = await getOrgAndUser();
  await supabase
    .from("revenue")
    .delete()
    .eq("organization_id", organizationId)
    .eq("reference_id", referenceId)
    .eq("reference_type", referenceType);
}

function mapServiceCodeToLedgerSource(code?: string | null): LedgerSource {
  switch (code) {
    case "consultation":
    case "checkup":
    case "emergency":
      return "consultation";
    case "vaccination":
    case "herd_vaccination":
      return "vaccination";
    case "antiparasitic":
    case "prophylaxis":
      return "antiparasitic";
    case "prescription":
      return "prescription";
    case "farm_visit":
    case "farm_intervention":
      return "visit";
    default:
      return "visit";
  }
}

/**
 * Recette CA pour une prestation de visite marquée « fait ».
 * Montant = amount × head_count si facturation à la tête.
 * Idempotent via reference_type = visit_service.
 */
export async function syncVisitServiceToAccounting(
  service: {
    id: string;
    service_code?: string | null;
    service_label?: string | null;
    status?: string | null;
    amount?: number | null;
    notes?: string | null;
  },
  visit: {
    client_id: string;
    visit_date?: string | null;
    billing_mode?: string | null;
    head_count?: number | null;
    context?: string | null;
    client?: { first_name?: string | null; last_name?: string | null } | null;
    animal?: { name?: string | null } | null;
    farm?: { farm_name?: string | null } | null;
  }
) {
  if (!service?.id) return null;

  if (service.status !== "done") {
    await deleteRevenueByReference(service.id, "visit_service");
    return null;
  }

  const unit = Number(service.amount) || 0;
  const qty =
    visit.billing_mode === "per_head" && Number(visit.head_count) > 0
      ? Number(visit.head_count)
      : 1;
  const total = unit * qty;

  if (total <= 0) {
    await deleteRevenueByReference(service.id, "visit_service");
    return null;
  }

  const source = mapServiceCodeToLedgerSource(service.service_code);
  const clientName = [visit.client?.first_name, visit.client?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const farmLabel = visit.farm?.farm_name ? ` / ${visit.farm.farm_name}` : "";
  const animalLabel = visit.animal?.name ? ` / ${visit.animal.name}` : "";
  const label = service.service_label || "Prestation";
  const qtyNote = qty > 1 ? ` ×${qty}` : "";

  try {
    return await postRevenue({
      source,
      category: visit.context === "farm" ? "elevage" : source,
      description: `${label}${qtyNote} — ${clientName || "Client"}${farmLabel}${animalLabel}`.trim(),
      amount: total,
      revenue_date: (visit.visit_date || todayLocalKey()).slice(0, 10),
      reference_id: service.id,
      reference_type: "visit_service",
      client_id: visit.client_id,
      notes: service.notes || (qty > 1 ? `PU ${unit.toFixed(0)} MAD × ${qty}` : null),
      updateIfExists: true,
    });
  } catch (err) {
    console.warn("Accounting ledger post failed for visit service", service.id, err);
    return null;
  }
}

/**
 * Charge idempotente via receipt_number (clé unique métier).
 * expenses n'a pas reference_id — on utilise receipt_number.
 */
export async function postExpense(input: {
  category: string;
  subcategory?: string | null;
  description: string;
  amount: number;
  expense_date?: string;
  receipt_number?: string | null;
  supplier_name?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  is_deductible?: boolean;
}) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const { user, organizationId } = await getOrgAndUser();

  if (input.receipt_number) {
    const { data: existing } = await supabase
      .from("expenses")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("receipt_number", input.receipt_number)
      .maybeSingle();
    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      expense_date: input.expense_date || todayLocalKey(),
      category: input.category,
      subcategory: input.subcategory || null,
      description: input.description,
      amount,
      receipt_number: input.receipt_number || null,
      supplier_name: input.supplier_name || null,
      notes: input.notes || null,
      payment_method: input.payment_method || null,
      is_deductible: input.is_deductible !== false,
      status: "approved",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

function isSaleReason(reason?: string | null) {
  const r = (reason || "").toLowerCase();
  return /vente|ordonnance|cabinet|prescription|client/.test(r);
}

function isClinicalUseReason(reason?: string | null) {
  const r = (reason || "").toLowerCase();
  return /utilisation|consultation|périmé|expire|cassé|endommag|perte|vol/.test(r);
}

/**
 * Comptabilise un mouvement de stock :
 * - Entrée → valorisation stock (hors CA / hors résultat)
 * - Sortie "vente / ordonnance" → recette = prix de vente total (CA) + COGS
 * - Sortie "utilisation clinique" → COGS seul
 */
export async function postStockMovementLedger(opts: {
  movementId: string;
  itemName: string;
  movementType: string;
  quantity: number;
  reason?: string | null;
  unitCost?: number | null;
  sellingPrice?: number | null;
  date?: string;
}) {
  const qty = Number(opts.quantity) || 0;
  if (qty <= 0) return;

  const cost = Number(opts.unitCost) || 0;
  const price = Number(opts.sellingPrice) || 0;
  const date = (opts.date || todayLocalKey()).slice(0, 10);
  const name = opts.itemName || "Article";

  try {
    // Entrée stock = valorisation inventaire (pas une charge P&L, pas du CA)
    if (opts.movementType === "in" && cost > 0) {
      await postExpense({
        category: "stock_purchase",
        subcategory: "inventory_valuation",
        description: `Valorisation stock — ${name} ×${qty}`,
        amount: cost * qty,
        expense_date: date,
        receipt_number: `SM-IN-${opts.movementId}`,
        notes: opts.reason || "Entrée stock",
      });
      return;
    }

    if (opts.movementType === "out" && isSaleReason(opts.reason)) {
      // CA = prix de vente × quantité (pas la marge)
      const saleAmount = price > 0 ? price * qty : 0;
      if (saleAmount > 0) {
        const source = /ordonnance|prescription/i.test(opts.reason || "")
          ? "prescription"
          : "stock_sale";
        await postRevenue({
          source,
          category: source,
          description: `Vente stock — ${name} ×${qty}`,
          amount: saleAmount,
          revenue_date: date,
          reference_id: opts.movementId,
          reference_type: "stock_movement",
          notes: opts.reason || null,
        });
      }
      if (cost > 0) {
        await postExpense({
          category: "cogs",
          subcategory: "stock",
          description: `Coût de revient — ${name} ×${qty}`,
          amount: cost * qty,
          expense_date: date,
          receipt_number: `SM-COGS-${opts.movementId}`,
          notes: opts.reason || null,
        });
      }
      return;
    }

    if (opts.movementType === "out" && isClinicalUseReason(opts.reason) && cost > 0) {
      await postExpense({
        category: "cogs",
        subcategory: "clinical_use",
        description: `Consommation stock — ${name} ×${qty}`,
        amount: cost * qty,
        expense_date: date,
        receipt_number: `SM-USE-${opts.movementId}`,
        notes: opts.reason || null,
      });
    }
  } catch (err) {
    console.warn("Accounting ledger post failed for stock movement", opts.movementId, err);
  }
}

/** Paiement facture → ligne payments (idempotent) */
export async function postInvoicePayment(opts: {
  invoiceId: string;
  amount: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string | null;
}) {
  const { user } = await getOrgAndUser();
  const amount = Number(opts.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("invoice_id", opts.invoiceId)
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) return existing[0];

  const { data, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: opts.invoiceId,
      user_id: user.id,
      payment_date: opts.paymentDate || todayLocalKey(),
      amount,
      payment_method: opts.paymentMethod || "cash",
      notes: opts.notes || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Met à jour les recettes liées à une ordonnance avec le dernier prix
 * saisi sur les lignes prescription (unit_price × quantity).
 */
export async function syncPrescriptionSaleToAccounting(
  prescriptionId: string,
  medications: Array<{
    medication_name: string;
    stock_item_id?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
    sold_by_clinic?: boolean | null;
  }>
) {
  if (!prescriptionId) return;

  const { organizationId } = await getOrgAndUser();

  const { data: movements, error: movErr } = await supabase
    .from("stock_movements")
    .select("id, item_name, quantity, stock_item_id, notes")
    .eq("reference", prescriptionId)
    .eq("movement_type", "out");

  if (movErr) throw new Error(movErr.message);
  if (!movements?.length) return;

  const usedMovementIds = new Set<string>();

  for (const med of medications) {
    if (!med.sold_by_clinic) continue;
    const unitPrice = Number(med.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) continue;

    const qty = Number(med.quantity) || 1;
    const amount = unitPrice * qty;
    const nameKey = String(med.medication_name || "")
      .trim()
      .toLowerCase();

    const mov = movements.find((m) => {
      if (usedMovementIds.has(m.id)) return false;
      if (med.stock_item_id && m.stock_item_id === med.stock_item_id) return true;
      return String(m.item_name || "").trim().toLowerCase() === nameKey;
    });
    if (!mov) continue;
    usedMovementIds.add(mov.id);

    const notes = `Médicament: ${med.medication_name} · PU ${unitPrice.toFixed(2)} MAD`;
    await supabase
      .from("stock_movements")
      .update({ notes })
      .eq("id", mov.id);

    const { data: revenueRow } = await supabase
      .from("revenue")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("reference_id", mov.id)
      .eq("reference_type", "stock_movement")
      .maybeSingle();

    if (revenueRow?.id) {
      if (amount > 0) {
        await supabase
          .from("revenue")
          .update({
            amount,
            description: `Vente stock — ${med.medication_name} ×${qty}`,
            notes: "Ordonnance — vente cabinet",
            updated_at: new Date().toISOString(),
          })
          .eq("id", revenueRow.id);
      }
    } else if (amount > 0) {
      await postRevenue({
        source: "prescription",
        category: "prescription",
        description: `Vente stock — ${med.medication_name} ×${qty}`,
        amount,
        reference_id: mov.id,
        reference_type: "stock_movement",
        notes: "Ordonnance — vente cabinet",
      });
    }
  }
}

export const SOURCE_LABELS: Record<string, string> = {
  visit: "Visite / prestations",
  visit_service: "Prestation",
  consultation: "Consultation",
  vaccination: "Vaccination",
  antiparasitic: "Antiparasitaire",
  prescription: "Ordonnance / vente Rx",
  stock_sale: "Vente stock",
  stock_purchase: "Valorisation stock",
  stock_valuation: "Valorisation stock",
  cogs: "Coût de revient (COGS)",
  salary: "Salaires",
  rent: "Loyer",
  tax: "Impôts / taxes",
  insurance: "Assurance",
  other: "Autre",
  elevage: "Élevage",
  visite: "Visite",
};

export function formatSourceLabel(source?: string | null) {
  if (!source) return "Autre";
  return SOURCE_LABELS[source] || source;
}
