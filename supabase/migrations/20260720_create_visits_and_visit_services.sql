-- Clinical visit workspace: one visit can hold multiple prestations
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  veterinarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  reason text,
  notes text,
  total_amount numeric(12,2) DEFAULT 0,
  invoiced boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visit_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_code text NOT NULL,
  service_label text NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'done', 'skipped')),
  reference_type text,
  reference_id uuid,
  amount numeric(12,2) DEFAULT 0,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visits_org_idx ON public.visits(organization_id);
CREATE INDEX IF NOT EXISTS visits_client_idx ON public.visits(client_id);
CREATE INDEX IF NOT EXISTS visits_appointment_idx ON public.visits(appointment_id);
CREATE INDEX IF NOT EXISTS visits_status_idx ON public.visits(status);
CREATE INDEX IF NOT EXISTS visit_services_visit_idx ON public.visit_services(visit_id);

CREATE UNIQUE INDEX IF NOT EXISTS visits_one_active_per_appointment
  ON public.visits(appointment_id)
  WHERE appointment_id IS NOT NULL AND status = 'in_progress';

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS visits_org_all ON public.visits;
CREATE POLICY visits_org_all ON public.visits
  FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

DROP POLICY IF EXISTS visit_services_org_all ON public.visit_services;
CREATE POLICY visit_services_org_all ON public.visit_services
  FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS consultations_visit_idx ON public.consultations(visit_id);
