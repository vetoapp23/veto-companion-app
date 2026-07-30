import { supabase } from "@/lib/supabase";
import { postStockMovementLedger } from "@/lib/accountingLedger";

export type StockMovementType = "in" | "out" | "adjustment" | "transfer";

export interface RecordStockMovementInput {
  stock_item_id: string;
  item_name?: string | null;
  movement_type: StockMovementType | string;
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  movement_date?: string;
  /** Si true (défaut), met à jour current_quantity sur stock_items */
  updateQuantity?: boolean;
  /**
   * Pour adjustment: si true, `quantity` est le nouveau stock absolu.
   * Sinon `quantity` est un delta (in/out).
   */
  absoluteAdjustment?: boolean;
  /** Si false, ne crée pas d'écriture comptable (défaut: true) */
  postAccounting?: boolean;
  /** Prix de vente unitaire (ex. modifié manuellement sur une ordonnance) */
  sellingPriceOverride?: number | null;
}

/**
 * Enregistre un mouvement dans stock_movements (schéma réel Supabase)
 * et met à jour la quantité de l'article si demandé.
 * Synchronise aussi la compta (achat / vente / COGS) quand pertinent.
 */
export async function recordStockMovement(input: RecordStockMovementInput) {
  const qty = Number(input.quantity);
  if (!input.stock_item_id || !Number.isFinite(qty) || qty < 0) {
    throw new Error("Mouvement de stock invalide");
  }

  const { data: item, error: itemErr } = await supabase
    .from("stock_items")
    .select("id, name, current_quantity, organization_id, unit_cost, selling_price")
    .eq("id", input.stock_item_id)
    .single();

  if (itemErr || !item) {
    throw new Error(itemErr?.message || "Article de stock introuvable");
  }

  const current = Number(item.current_quantity || 0);
  const type = String(input.movement_type || "adjustment");
  const updateQty = input.updateQuantity !== false;

  let newQty = current;
  let movementQty = qty;
  let notes = input.notes || null;

  if (updateQty) {
    if (type === "in") {
      newQty = current + qty;
      movementQty = qty;
    } else if (type === "out") {
      if (qty > current) {
        throw new Error(`Stock insuffisant (disponible: ${current}, demandé: ${qty})`);
      }
      newQty = current - qty;
      movementQty = qty;
    } else if (type === "adjustment") {
      if (input.absoluteAdjustment !== false) {
        newQty = qty;
        movementQty = Math.abs(qty - current);
        notes = [notes, `Ajustement: ${current} → ${qty}`].filter(Boolean).join(" · ");
      } else {
        newQty = Math.max(0, current + qty);
        movementQty = Math.abs(qty);
      }
    } else if (type === "transfer") {
      newQty = current;
      movementQty = qty;
    }

    if (newQty !== current) {
      const { error: updErr } = await supabase
        .from("stock_items")
        .update({
          current_quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      if (updErr) throw new Error(updErr.message);
    }
  }

  const payload = {
    stock_item_id: item.id,
    item_name: input.item_name || item.name,
    movement_type: type,
    quantity: movementQty,
    reason: input.reason || null,
    reference: input.reference || null,
    performed_by: input.performed_by || null,
    movement_date: input.movement_date || new Date().toISOString(),
    notes,
  };

  const { data: movement, error: movErr } = await supabase
    .from("stock_movements")
    .insert([payload])
    .select()
    .single();

  if (movErr) throw new Error(movErr.message);

  if (input.postAccounting !== false && movementQty > 0) {
    const dateStr = String(movement.movement_date || new Date().toISOString()).slice(0, 10);
    const catalogPrice = Number(item.selling_price) || 0;
    const override =
      input.sellingPriceOverride != null && Number.isFinite(Number(input.sellingPriceOverride))
        ? Number(input.sellingPriceOverride)
        : null;
    await postStockMovementLedger({
      movementId: movement.id,
      itemName: movement.item_name || item.name,
      movementType: type,
      quantity: movementQty,
      reason: input.reason,
      unitCost: Number(item.unit_cost) || 0,
      sellingPrice: override != null ? override : catalogPrice,
      date: dateStr,
    });
  }

  return movement;
}

/** Marge unitaire et pourcentage sur le prix d'achat */
export function calcStockMargin(
  purchasePrice: number | string | null | undefined,
  sellingPrice: number | string | null | undefined
) {
  const cost = Number(purchasePrice) || 0;
  const price = Number(sellingPrice) || 0;
  const unit = price - cost;
  const pct = cost > 0 ? (unit / cost) * 100 : price > 0 ? 100 : 0;
  return { unit, pct, cost, price };
}
