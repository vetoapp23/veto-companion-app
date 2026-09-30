-- Align stock_items with the CSV gabarit (subcategory, manufacturer, dosage,
-- barcode, sku) and add production_date.
ALTER TABLE public.stock_items
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS manufacturer text,
  ADD COLUMN IF NOT EXISTS dosage text,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS production_date date;

CREATE INDEX IF NOT EXISTS stock_items_organization_id_idx
  ON public.stock_items (organization_id);

CREATE UNIQUE INDEX IF NOT EXISTS stock_items_org_sku_uidx
  ON public.stock_items (organization_id, sku)
  WHERE sku IS NOT NULL AND btrim(sku) <> '';

CREATE INDEX IF NOT EXISTS stock_items_barcode_idx
  ON public.stock_items (organization_id, barcode)
  WHERE barcode IS NOT NULL AND btrim(barcode) <> '';

COMMENT ON COLUMN public.stock_items.production_date IS 'Date de production / fabrication du lot';
COMMENT ON COLUMN public.stock_items.subcategory IS 'Sous-catégorie affichée dans le gabarit stock';
COMMENT ON COLUMN public.stock_items.manufacturer IS 'Fabricant (distinct du fournisseur)';
