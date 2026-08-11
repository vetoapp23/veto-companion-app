-- RLS for tables added in 003 + super_admin cross-org read

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_infrastructures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_batch_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_pedigree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dropdown_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_plans_read ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY subscription_plans_super ON public.subscription_plans
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY org_subscriptions_select ON public.organization_subscriptions
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY org_subscriptions_write ON public.organization_subscriptions
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY storage_usage_org ON public.storage_usage
  FOR ALL TO authenticated
  USING (
    organization_id = public.current_organization_id()
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    OR public.is_super_admin(auth.uid())
  );

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'organization_settings','farm_batches','farm_infrastructures',
    'farm_batch_health_events','animal_pedigree','custom_dropdown_values'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I_org ON public.%I FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id())',
      tbl, tbl
    );
  END LOOP;
END $$;

CREATE POLICY organizations_super_admin ON public.organizations
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY user_profiles_super_admin ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
