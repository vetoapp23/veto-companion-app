-- Align protocol tables with app: org scoping + booster schedule JSON

ALTER TABLE public.vaccination_protocols
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS booster_schedule jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.antiparasitic_protocols
  ADD COLUMN IF NOT EXISTS booster_schedule jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_vaccination_protocols_org
  ON public.vaccination_protocols(organization_id);

DROP POLICY IF EXISTS vaccination_protocols_read ON public.vaccination_protocols;
DROP POLICY IF EXISTS vaccination_protocols_write ON public.vaccination_protocols;

CREATE POLICY vaccination_protocols_select ON public.vaccination_protocols
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL
    OR organization_id = public.current_organization_id()
  );

CREATE POLICY vaccination_protocols_insert ON public.vaccination_protocols
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY vaccination_protocols_update ON public.vaccination_protocols
  FOR UPDATE TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY vaccination_protocols_delete ON public.vaccination_protocols
  FOR DELETE TO authenticated
  USING (organization_id = public.current_organization_id());
