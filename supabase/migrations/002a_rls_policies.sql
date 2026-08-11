-- RLS policies (part 1/2)

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antiparasitics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antiparasitic_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_belongs_to_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND organization_id = org_id AND status = 'approved'
  );
$$;

CREATE POLICY org_select ON public.organizations FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(id) OR owner_id = auth.uid());
CREATE POLICY org_insert ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY org_update ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_org_admin() AND public.user_belongs_to_org(id));

CREATE POLICY profiles_select ON public.user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR (organization_id = public.current_organization_id() AND public.is_org_admin()));
CREATE POLICY profiles_insert ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON public.user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR (organization_id = public.current_organization_id() AND public.is_org_admin()));

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clients','animals','consultations','vaccinations','antiparasitics',
    'prescriptions','appointments','farms','farm_interventions','suppliers',
    'stock_items','revenue','expenses','invoices'
  ]
  LOOP
    EXECUTE format('CREATE POLICY %I_select ON public.%I FOR SELECT TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_update ON public.%I FOR UPDATE TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_delete ON public.%I FOR DELETE TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
  END LOOP;
END $$;

CREATE POLICY stock_movements_select ON public.stock_movements FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = stock_item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_movements_insert ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = stock_item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_movements_update ON public.stock_movements FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = stock_item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_movements_delete ON public.stock_movements FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = stock_item_id AND si.organization_id = public.current_organization_id()
  ));

CREATE POLICY stock_alerts_select ON public.stock_alerts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_alerts_insert ON public.stock_alerts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_alerts_update ON public.stock_alerts FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = item_id AND si.organization_id = public.current_organization_id()
  ));
CREATE POLICY stock_alerts_delete ON public.stock_alerts FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = item_id AND si.organization_id = public.current_organization_id()
  ));

CREATE POLICY rx_meds_select ON public.prescription_medications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()));
CREATE POLICY rx_meds_insert ON public.prescription_medications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()));
CREATE POLICY rx_meds_update ON public.prescription_medications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()));
CREATE POLICY rx_meds_delete ON public.prescription_medications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()));

CREATE POLICY payments_all ON public.payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.organization_id = public.current_organization_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.organization_id = public.current_organization_id()));

CREATE POLICY vaccination_protocols_read ON public.vaccination_protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY vaccination_protocols_write ON public.vaccination_protocols FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY antiparasitic_protocols_select ON public.antiparasitic_protocols FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY antiparasitic_protocols_write ON public.antiparasitic_protocols FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY app_settings_all ON public.app_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY accounting_templates_all ON public.accounting_templates FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY activity_logs_select ON public.user_activity_logs FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id());
CREATE POLICY activity_logs_insert ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_organization_id());
