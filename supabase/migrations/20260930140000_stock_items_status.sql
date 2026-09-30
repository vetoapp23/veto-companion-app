-- Statut métier stock pour filtres / exemples UI
-- Valeurs: active | low_stock | expired | expiring_soon

ALTER TABLE public.stock_items
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.stock_items
SET status = 'active'
WHERE status IS NULL;

ALTER TABLE public.stock_items
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stock_items_status_check'
  ) THEN
    ALTER TABLE public.stock_items
      ADD CONSTRAINT stock_items_status_check
      CHECK (status IN ('active', 'low_stock', 'expired', 'expiring_soon'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.compute_stock_item_status(
  p_active boolean,
  p_current_quantity numeric,
  p_minimum_quantity numeric,
  p_expiration_date date
) RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_expiration_date IS NOT NULL AND p_expiration_date < CURRENT_DATE THEN
    RETURN 'expired';
  END IF;

  IF COALESCE(p_current_quantity, 0) <= COALESCE(p_minimum_quantity, 0) THEN
    RETURN 'low_stock';
  END IF;

  IF p_expiration_date IS NOT NULL
     AND p_expiration_date >= CURRENT_DATE
     AND p_expiration_date <= CURRENT_DATE + 30 THEN
    RETURN 'expiring_soon';
  END IF;

  RETURN 'active';
END;
$$;

CREATE OR REPLACE FUNCTION public.stock_items_set_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := public.compute_stock_item_status(
    NEW.active,
    NEW.current_quantity,
    NEW.minimum_quantity,
    NEW.expiration_date
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_items_set_status ON public.stock_items;
CREATE TRIGGER trg_stock_items_set_status
  BEFORE INSERT OR UPDATE OF active, current_quantity, minimum_quantity, expiration_date
  ON public.stock_items
  FOR EACH ROW
  EXECUTE FUNCTION public.stock_items_set_status();

COMMENT ON COLUMN public.stock_items.status IS 'Statut métier: active | low_stock | expired | expiring_soon';
