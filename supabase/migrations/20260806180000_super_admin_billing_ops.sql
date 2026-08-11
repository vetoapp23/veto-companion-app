-- Super Admin billing ops: payments ledger, custom price, feature overrides, RPCs

-- 1) Extend organization_subscriptions
ALTER TABLE public.organization_subscriptions
  ADD COLUMN IF NOT EXISTS custom_price numeric,
  ADD COLUMN IF NOT EXISTS feature_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.organization_subscriptions.custom_price IS
  'Override SaaS price per billing cycle; NULL = use catalog plan price';
COMMENT ON COLUMN public.organization_subscriptions.feature_overrides IS
  'Per-org module toggles; keys true/false override plan.limits';

-- 2) Platform subscription payments ledger
CREATE TABLE IF NOT EXISTS public.platform_subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'MAD',
  method text NOT NULL DEFAULT 'virement'
    CHECK (method IN ('virement', 'especes', 'cheque', 'stripe', 'autre')),
  reference text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  period_start timestamptz,
  period_end timestamptz,
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'pending', 'refunded')),
  notes text,
  plan_code text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_sub_payments_org
  ON public.platform_subscription_payments (organization_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_sub_payments_paid_at
  ON public.platform_subscription_payments (paid_at DESC);

ALTER TABLE public.platform_subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_sub_payments_super ON public.platform_subscription_payments;
CREATE POLICY platform_sub_payments_super ON public.platform_subscription_payments
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- 3) Effective plan merges feature_overrides into limits
CREATE OR REPLACE FUNCTION public.get_effective_plan_for_org(p_org_id uuid)
RETURNS TABLE(
  plan_code text,
  plan_name text,
  storage_total_mb numeric,
  max_clients integer,
  max_animals integer,
  max_users integer,
  features jsonb,
  limits jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub organization_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
  v_limits jsonb;
BEGIN
  SELECT * INTO v_sub FROM organization_subscriptions WHERE organization_id = p_org_id LIMIT 1;

  IF v_sub.id IS NULL THEN
    SELECT * INTO v_plan FROM subscription_plans WHERE code = 'free' AND is_active = true LIMIT 1;
    plan_code := 'free';
    v_limits := COALESCE(v_plan.limits, '{}'::jsonb);
  ELSE
    SELECT * INTO v_plan FROM subscription_plans WHERE code = v_sub.plan_code LIMIT 1;
    plan_code := v_sub.plan_code;
    v_limits := COALESCE(v_plan.limits, '{}'::jsonb)
      || COALESCE(v_sub.feature_overrides, '{}'::jsonb);
  END IF;

  plan_name := COALESCE(v_plan.name, 'Découverte');
  storage_total_mb := COALESCE(v_sub.storage_quota_mb, v_plan.storage_mb, 200)::numeric
    + COALESCE(v_sub.storage_addon_mb, 0)::numeric;
  max_clients := v_plan.max_clients;
  max_animals := v_plan.max_animals;
  max_users := COALESCE(v_plan.max_users, 1) + COALESCE(v_sub.extra_users, 0);
  features := COALESCE(v_plan.features, '[]'::jsonb);
  limits := v_limits;
  RETURN NEXT;
END;
$function$;

-- 4) admin_upsert_subscription: custom_price + feature_overrides
CREATE OR REPLACE FUNCTION public.admin_upsert_subscription(
  p_organization_id uuid,
  p_payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_before record;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  SELECT * INTO v_before FROM organization_subscriptions
  WHERE organization_id = p_organization_id
  ORDER BY created_at DESC NULLS LAST LIMIT 1;

  IF FOUND THEN
    UPDATE organization_subscriptions SET
      plan_code = COALESCE(p_payload->>'plan_code', plan_code),
      status = COALESCE(p_payload->>'status', status),
      storage_quota_mb = COALESCE((p_payload->>'storage_quota_mb')::int, storage_quota_mb),
      storage_addon_mb = COALESCE((p_payload->>'storage_addon_mb')::int, storage_addon_mb),
      extra_users = COALESCE((p_payload->>'extra_users')::int, extra_users),
      cancel_at_period_end = COALESCE((p_payload->>'cancel_at_period_end')::boolean, cancel_at_period_end),
      current_period_end = CASE
        WHEN p_payload ? 'current_period_end' AND p_payload->>'current_period_end' IS NOT NULL
          THEN (p_payload->>'current_period_end')::timestamptz
        WHEN p_payload ? 'current_period_end' THEN NULL
        ELSE current_period_end
      END,
      billing_cycle = COALESCE(p_payload->>'billing_cycle', billing_cycle),
      currency = COALESCE(p_payload->>'currency', currency),
      custom_price = CASE
        WHEN p_payload ? 'custom_price' AND NULLIF(trim(p_payload->>'custom_price'), '') IS NULL THEN NULL
        WHEN p_payload ? 'custom_price' THEN (p_payload->>'custom_price')::numeric
        ELSE custom_price
      END,
      feature_overrides = CASE
        WHEN p_payload ? 'feature_overrides' AND jsonb_typeof(p_payload->'feature_overrides') = 'object'
          THEN p_payload->'feature_overrides'
        ELSE feature_overrides
      END,
      updated_at = now()
    WHERE id = v_before.id
    RETURNING id INTO v_id;
  ELSE
    INSERT INTO organization_subscriptions (
      organization_id, plan_code, status, storage_quota_mb, storage_addon_mb,
      extra_users, cancel_at_period_end, current_period_start, current_period_end,
      billing_cycle, currency, custom_price, feature_overrides
    ) VALUES (
      p_organization_id,
      COALESCE(p_payload->>'plan_code', 'free'),
      COALESCE(p_payload->>'status', 'active'),
      COALESCE((p_payload->>'storage_quota_mb')::int, 200),
      COALESCE((p_payload->>'storage_addon_mb')::int, 0),
      COALESCE((p_payload->>'extra_users')::int, 0),
      COALESCE((p_payload->>'cancel_at_period_end')::boolean, false),
      now(),
      CASE WHEN p_payload->>'current_period_end' IS NOT NULL
        THEN (p_payload->>'current_period_end')::timestamptz ELSE NULL END,
      COALESCE(p_payload->>'billing_cycle', 'monthly'),
      COALESCE(p_payload->>'currency', 'MAD'),
      CASE WHEN NULLIF(trim(COALESCE(p_payload->>'custom_price','')), '') IS NULL THEN NULL
        ELSE (p_payload->>'custom_price')::numeric END,
      CASE WHEN jsonb_typeof(p_payload->'feature_overrides') = 'object'
        THEN p_payload->'feature_overrides' ELSE '{}'::jsonb END
    )
    RETURNING id INTO v_id;
  END IF;

  PERFORM public.log_admin_action(
    'subscription.upsert',
    'organization_subscription',
    v_id::text,
    p_organization_id,
    CASE WHEN v_before.id IS NULL THEN NULL ELSE to_jsonb(v_before) END,
    p_payload
  );

  RETURN json_build_object('ok', true, 'id', v_id);
END;
$function$;

-- 5) Record SaaS payment (+ optional activate)
CREATE OR REPLACE FUNCTION public.admin_record_subscription_payment(
  p_organization_id uuid,
  p_amount numeric,
  p_currency text DEFAULT 'MAD',
  p_method text DEFAULT 'virement',
  p_reference text DEFAULT NULL,
  p_paid_at timestamptz DEFAULT now(),
  p_period_start timestamptz DEFAULT NULL,
  p_period_end timestamptz DEFAULT NULL,
  p_status text DEFAULT 'received',
  p_notes text DEFAULT NULL,
  p_plan_code text DEFAULT NULL,
  p_activate boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_sub_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_organization_id) THEN
    RAISE EXCEPTION 'Organisation introuvable';
  END IF;
  IF p_amount IS NULL OR p_amount < 0 THEN
    RAISE EXCEPTION 'Montant invalide';
  END IF;
  IF p_method NOT IN ('virement', 'especes', 'cheque', 'stripe', 'autre') THEN
    RAISE EXCEPTION 'Méthode de paiement invalide';
  END IF;
  IF p_status NOT IN ('received', 'pending', 'refunded') THEN
    RAISE EXCEPTION 'Statut paiement invalide';
  END IF;

  INSERT INTO platform_subscription_payments (
    organization_id, amount, currency, method, reference, paid_at,
    period_start, period_end, status, notes, plan_code, recorded_by
  ) VALUES (
    p_organization_id, p_amount, COALESCE(NULLIF(p_currency,''), 'MAD'),
    p_method, p_reference, COALESCE(p_paid_at, now()),
    p_period_start, p_period_end, p_status, p_notes, p_plan_code, auth.uid()
  )
  RETURNING id INTO v_id;

  IF COALESCE(p_activate, true) AND p_status = 'received' THEN
    SELECT id INTO v_sub_id FROM organization_subscriptions
    WHERE organization_id = p_organization_id
    ORDER BY created_at DESC NULLS LAST LIMIT 1;

    IF v_sub_id IS NULL THEN
      INSERT INTO organization_subscriptions (
        organization_id, plan_code, status, storage_quota_mb,
        current_period_start, current_period_end, billing_cycle, currency, custom_price
      ) VALUES (
        p_organization_id,
        COALESCE(p_plan_code, 'pro'),
        'active',
        2048,
        COALESCE(p_period_start, now()),
        p_period_end,
        'monthly',
        COALESCE(NULLIF(p_currency,''), 'MAD'),
        p_amount
      );
    ELSE
      UPDATE organization_subscriptions SET
        status = 'active',
        plan_code = COALESCE(p_plan_code, plan_code),
        current_period_start = COALESCE(p_period_start, current_period_start, now()),
        current_period_end = COALESCE(p_period_end, current_period_end),
        custom_price = COALESCE(p_amount, custom_price),
        currency = COALESCE(NULLIF(p_currency,''), currency),
        cancel_at_period_end = false,
        updated_at = now()
      WHERE id = v_sub_id;
    END IF;
  END IF;

  PERFORM public.log_admin_action(
    'subscription.payment.record',
    'platform_subscription_payment',
    v_id::text,
    p_organization_id,
    NULL,
    jsonb_build_object(
      'amount', p_amount, 'method', p_method, 'activate', p_activate, 'status', p_status
    )
  );

  RETURN json_build_object('ok', true, 'id', v_id);
END;
$function$;

-- 6) List payments
CREATE OR REPLACE FUNCTION public.admin_list_subscription_payments(
  p_organization_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lim integer := LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500);
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  RETURN COALESCE((
    SELECT json_agg(row_to_json(t) ORDER BY t.paid_at DESC)
    FROM (
      SELECT
        p.id, p.organization_id, o.name AS organization_name,
        p.amount, p.currency, p.method, p.reference, p.paid_at,
        p.period_start, p.period_end, p.status, p.notes, p.plan_code,
        p.recorded_by, p.created_at
      FROM platform_subscription_payments p
      JOIN organizations o ON o.id = p.organization_id
      WHERE p_organization_id IS NULL OR p.organization_id = p_organization_id
      ORDER BY p.paid_at DESC
      LIMIT v_lim
    ) t
  ), '[]'::json);
END;
$function$;

-- 7) Set org user role/status
CREATE OR REPLACE FUNCTION public.admin_set_org_user(
  p_user_id uuid,
  p_role text DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_before record;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  SELECT * INTO v_before FROM user_profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Utilisateur introuvable'; END IF;

  IF p_role IS NOT NULL AND p_role NOT IN ('admin', 'assistant') THEN
    RAISE EXCEPTION 'Rôle invalide (admin|assistant)';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('approved', 'pending', 'suspended', 'rejected') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;
  IF v_before.role = 'super_admin' THEN
    RAISE EXCEPTION 'Impossible de modifier un super_admin via cette RPC';
  END IF;

  UPDATE user_profiles SET
    role = COALESCE(p_role, role),
    status = COALESCE(p_status, status),
    approved_at = CASE
      WHEN COALESCE(p_status, status) = 'approved' THEN COALESCE(approved_at, now())
      ELSE approved_at
    END,
    updated_at = now()
  WHERE id = p_user_id;

  PERFORM public.log_admin_action(
    'user.org_set',
    'user_profile',
    p_user_id::text,
    v_before.organization_id,
    to_jsonb(v_before),
    jsonb_build_object('role', p_role, 'status', p_status)
  );

  RETURN json_build_object('ok', true);
END;
$function$;

-- 8) Billing overview with custom_price + payments KPIs
CREATE OR REPLACE FUNCTION public.get_super_admin_billing_overview()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result json;
  v_month_start timestamptz := date_trunc('month', now());
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  SELECT json_build_object(
    'by_status', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT COALESCE(status, 'none') AS status, COUNT(*)::int AS orgs
        FROM organization_subscriptions
        GROUP BY status
      ) t
    ),
    'by_plan', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT plan_code, COUNT(*)::int AS orgs,
          COUNT(*) FILTER (WHERE status = 'active')::int AS active,
          COUNT(*) FILTER (WHERE status = 'trialing')::int AS trialing,
          COUNT(*) FILTER (WHERE status = 'past_due')::int AS past_due,
          COUNT(*) FILTER (WHERE status IN ('canceled','suspended'))::int AS churned
        FROM organization_subscriptions
        GROUP BY plan_code
      ) t
    ),
    'trials_ending_7d', (
      SELECT COUNT(*)::int FROM organization_subscriptions
      WHERE status = 'trialing'
        AND current_period_end IS NOT NULL
        AND current_period_end <= now() + interval '7 days'
    ),
    'past_due_count', (
      SELECT COUNT(*)::int FROM organization_subscriptions WHERE status = 'past_due'
    ),
    'with_stripe', (
      SELECT COUNT(*)::int FROM organization_subscriptions
      WHERE stripe_customer_id IS NOT NULL OR stripe_subscription_id IS NOT NULL
    ),
    'estimated_mrr_mad', (
      SELECT COALESCE(SUM(
        CASE
          WHEN s.custom_price IS NOT NULL THEN
            CASE WHEN s.billing_cycle = 'yearly' THEN s.custom_price / 12 ELSE s.custom_price END
          WHEN s.billing_cycle = 'yearly' THEN COALESCE((p.prices->'yearly'->>'MAD')::numeric, 0) / 12
          ELSE COALESCE((p.prices->'monthly'->>'MAD')::numeric, 0)
        END
      ), 0)
      FROM organization_subscriptions s
      LEFT JOIN subscription_plans p ON p.code = s.plan_code
      WHERE s.status IN ('active', 'trialing', 'past_due')
        AND s.plan_code <> 'free'
    ),
    'payments_received_month', (
      SELECT COALESCE(SUM(amount), 0)
      FROM platform_subscription_payments
      WHERE status = 'received' AND paid_at >= v_month_start AND currency = 'MAD'
    ),
    'payments_pending', (
      SELECT COALESCE(SUM(amount), 0)
      FROM platform_subscription_payments
      WHERE status = 'pending'
    ),
    'payments_count_month', (
      SELECT COUNT(*)::int
      FROM platform_subscription_payments
      WHERE paid_at >= v_month_start
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

-- Grants
REVOKE ALL ON FUNCTION public.admin_record_subscription_payment(uuid, numeric, text, text, text, timestamptz, timestamptz, timestamptz, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_subscription_payments(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_org_user(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_record_subscription_payment(uuid, numeric, text, text, text, timestamptz, timestamptz, timestamptz, text, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_subscription_payments(uuid, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_org_user(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_subscription(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_super_admin_billing_overview() TO authenticated, service_role;
