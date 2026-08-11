-- Photos d'intervention élevage
ALTER TABLE public.farm_interventions
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.farm_interventions.photos IS 'Photos prises lors de l''intervention (data URLs ou URLs)';
