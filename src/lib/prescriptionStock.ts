/** Catégories stock pouvant être prescrites sur une ordonnance (EN + FR seeds). */
const PRESCRIPTION_STOCK_CATEGORIES = new Set([
  "medication",
  "medicament",
  "supplement",
  "supplementaire",
  "antiparasitaire",
  // Vaccins parfois délivrés avec l'ordonnance de rappel
  "vaccine",
  "vaccin",
]);

export function isPrescriptionStockCategory(category?: string | null): boolean {
  if (!category) return false;
  return PRESCRIPTION_STOCK_CATEGORIES.has(category.trim().toLowerCase());
}

/** Match stock item by exact name (case-insensitive). */
export function findStockItemByName<T extends { name: string }>(
  items: T[],
  medicationName: string
): T | undefined {
  const needle = medicationName.trim().toLowerCase();
  if (!needle) return undefined;
  return items.find((item) => item.name.trim().toLowerCase() === needle);
}
