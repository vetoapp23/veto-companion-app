-- Phase E: documentary invoices linked to visits + line items
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invoices_visit_idx ON public.invoices(visit_id);
CREATE INDEX IF NOT EXISTS invoices_org_idx ON public.invoices(organization_id);

-- Link visits back to invoice (FK added after invoices.visit_id exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'visits_invoice_id_fkey'
  ) THEN
    ALTER TABLE public.visits
      ADD CONSTRAINT visits_invoice_id_fkey
      FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  label text NOT NULL,
  service_code text,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  reference_type text,
  reference_id uuid,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_lines_invoice_idx ON public.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_lines_org_idx ON public.invoice_lines(organization_id);

ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_lines_org_all ON public.invoice_lines;
CREATE POLICY invoice_lines_org_all ON public.invoice_lines
  FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());
