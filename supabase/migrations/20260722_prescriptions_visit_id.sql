-- Link prescriptions to visits (optional consultation)
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prescriptions_visit_id ON public.prescriptions(visit_id);
