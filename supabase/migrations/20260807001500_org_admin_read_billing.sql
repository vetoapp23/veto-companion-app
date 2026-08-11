-- Clinic admins can read their org subscription payments (history)
ALTER TABLE public.platform_subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_payments_org_admin_select ON public.platform_subscription_payments;
CREATE POLICY platform_payments_org_admin_select
  ON public.platform_subscription_payments
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND up.organization_id = platform_subscription_payments.organization_id
        AND up.role IN ('admin', 'super_admin')
        AND coalesce(up.status, 'approved') = 'approved'
    )
  );

ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS org_subs_member_select ON public.organization_subscriptions;
CREATE POLICY org_subs_member_select
  ON public.organization_subscriptions
  FOR SELECT
  TO authenticated
  USING (organization_id = public.current_organization_id());
