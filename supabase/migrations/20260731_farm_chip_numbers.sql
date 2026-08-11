-- Numéros de puces / boucles sur lots et interventions élevage
ALTER TABLE public.farm_batches
  ADD COLUMN IF NOT EXISTS chip_numbers text[] DEFAULT '{}'::text[];

ALTER TABLE public.farm_interventions
  ADD COLUMN IF NOT EXISTS chip_numbers text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.farm_batches.chip_numbers IS 'Numéros de puces / boucles des animaux du lot';
COMMENT ON COLUMN public.farm_interventions.chip_numbers IS 'Numéros de puces des animaux concernés par l''intervention';
