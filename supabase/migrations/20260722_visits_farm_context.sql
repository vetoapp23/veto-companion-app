-- Phase D: farm / éleveur visit context
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'companion',
  ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_mode text,
  ADD COLUMN IF NOT EXISTS head_count int,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visits_context_check'
  ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT visits_context_check
      CHECK (context IN ('companion', 'farm'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visits_billing_mode_check'
  ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT visits_billing_mode_check
      CHECK (billing_mode IS NULL OR billing_mode IN ('forfait', 'per_head'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visits_farm_requires_farm_id'
  ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT visits_farm_requires_farm_id
      CHECK (context <> 'farm' OR farm_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS visits_farm_idx ON public.visits(farm_id);
CREATE INDEX IF NOT EXISTS visits_context_idx ON public.visits(context);
