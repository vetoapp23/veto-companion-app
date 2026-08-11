-- Plan entitlements hardening
-- - Effective plan respects subscription status + plan is_active (fallback free)
-- - Storage prefers catalog unless org snapshot differs (custom)
-- - sync_plan_storage_to_orgs for super_admin after plan edits
-- - Clamp assistant permissions to plan modules
-- - Server-side module gates on farm / stock / accounting writes

-- ---------------------------------------------------------------------------
-- Helpers: permission ↔ module
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.permission_key_to_module(p_key text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE p_key
    WHEN 'can_manage_clients' THEN 'clients'
    WHEN 'can_manage_animals' THEN 'animals'
    WHEN 'can_manage_appointments' THEN 'appointments'
    WHEN 'can_manage_visits' THEN 'visits'
    WHEN 'can_create_consultations' THEN 'consultations'
    WHEN 'can_manage_vaccinations' THEN 'vaccinations'
    WHEN 'can_manage_antiparasites' THEN 'antiparasites'
    WHEN 'can_manage_farms' THEN 'farm'
    WHEN 'can_manage_stock' THEN 'stock'
    WHEN 'can_manage_accounting' THEN 'accounting'
    ELSE NULL
  END;
$function$;

CREATE OR REPLACE FUNCTION public.clamp_permissions_to_plan_limits(p_permissions jsonb, p_limits jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  v_out jsonb := COALESCE(p_permissions, '{}'::jsonb);
  v_key text;
  v_module text;
  v_enabled boolean;
BEGIN
  FOR v_key IN
    SELECT unnest(ARRAY[
      'can_manage_clients',
      'can_manage_animals',
      'can_manage_appointments',
      'can_manage_visits',
      'can_create_consultations',
      'can_manage_vaccinations',
      'can_manage_antiparasites',
      'can_manage_farms',
      'can_manage_stock',
      'can_manage_accounting'
    ])
  LOOP
    v_module := public.permission_key_to_module(v_key);
    IF v_module IS NULL THEN
      CONTINUE;
    END IF;
    IF p_limits ? v_module THEN
      v_enabled := COALESCE((p_limits ->> v_module)::boolean, false);
    ELSE
      v_enabled := v_module NOT IN ('farm', 'stock', 'accounting');
    END IF;
    IF NOT v_enabled THEN
      v_out := jsonb_set(v_out, ARRAY[v_key], '"none"'::jsonb, true);
    END IF;
  END LOOP;
  RETURN v_out;
END;
$function$;

-- ---------------------------------------------------------------------------
-- Effective plan (status + is_active + storage sync rules)
-- ---------------------------------------------------------------------------
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
  v_free subscription_plans%ROWTYPE;
  v_limits jsonb;
  v_status text;
  v_entitled boolean := true;
  v_use_custom_storage boolean := false;
BEGIN
  SELECT * INTO v_free
  FROM subscription_plans
  WHERE code = 'free'
  ORDER BY is_active DESC, display_order ASC
  LIMIT 1;

  SELECT * INTO v_sub
  FROM organization_subscriptions
  WHERE organization_id = p_org_id
  ORDER BY created_at DESC NULLS LAST
  LIMIT 1;

  IF v_sub.id IS NULL THEN
    v_plan := v_free;
    plan_code := 'free';
    v_limits := COALESCE(v_plan.limits, '{}'::jsonb);
    v_entitled := true;
  ELSE
    v_status := lower(COALESCE(v_sub.status, 'active'));
    v_entitled := v_status IN ('active', 'trialing', 'past_due');

    SELECT * INTO v_plan
    FROM subscription_plans
    WHERE code = v_sub.plan_code
    LIMIT 1;

    IF NOT v_entitled
       OR v_plan.id IS NULL
       OR COALESCE(v_plan.is_active, false) = false THEN
      v_plan := v_free;
      plan_code := 'free';
      v_limits := COALESCE(v_plan.limits, '{}'::jsonb);
    ELSE
      plan_code := v_sub.plan_code;
      v_limits := COALESCE(v_plan.limits, '{}'::jsonb)
        || COALESCE(v_sub.feature_overrides, '{}'::jsonb);
      v_use_custom_storage :=
        v_sub.storage_quota_mb IS NOT NULL
        AND v_plan.storage_mb IS NOT NULL
        AND v_sub.storage_quota_mb IS DISTINCT FROM v_plan.storage_mb;
    END IF;
  END IF;

  plan_name := COALESCE(v_plan.name, 'Découverte');

  IF v_use_custom_storage THEN
    storage_total_mb := v_sub.storage_quota_mb::numeric
      + COALESCE(v_sub.storage_addon_mb, 0)::numeric;
  ELSE
    storage_total_mb := COALESCE(v_plan.storage_mb, 200)::numeric
      + COALESCE(v_sub.storage_addon_mb, 0)::numeric;
  END IF;

  max_clients := v_plan.max_clients;
  max_animals := v_plan.max_animals;
  max_users := COALESCE(v_plan.max_users, 1)
    + CASE
        WHEN v_sub.id IS NOT NULL AND plan_code = v_sub.plan_code AND v_entitled
          THEN COALESCE(v_sub.extra_users, 0)
        ELSE 0
      END;
  features := COALESCE(v_plan.features, '{}'::jsonb);
  limits := v_limits;
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_plan_storage_to_orgs(p_plan_code text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_storage int;
  v_count int := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  SELECT storage_mb INTO v_storage
  FROM subscription_plans
  WHERE code = p_plan_code;

  IF v_storage IS NULL THEN
    RAISE EXCEPTION 'Plan introuvable: %', p_plan_code;
  END IF;

  UPDATE organization_subscriptions
  SET storage_quota_mb = v_storage,
      updated_at = now()
  WHERE plan_code = p_plan_code;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.sync_plan_storage_to_orgs(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Module gates (server)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.org_module_enabled(p_org_id uuid, p_module text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_limits jsonb;
  v_core text[] := ARRAY[
    'consultations','visits','appointments','vaccinations',
    'antiparasites','clients','animals'
  ];
BEGIN
  IF p_org_id IS NULL OR p_module IS NULL THEN
    RETURN false;
  END IF;
  IF public.is_super_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  SELECT limits INTO v_limits FROM public.get_effective_plan_for_org(p_org_id);
  v_limits := COALESCE(v_limits, '{}'::jsonb);

  IF v_limits ? p_module THEN
    RETURN COALESCE((v_limits ->> p_module)::boolean, false);
  END IF;

  IF p_module = ANY (ARRAY['farm','stock','accounting']) THEN
    RETURN false;
  END IF;
  IF p_module = ANY (v_core) THEN
    RETURN true;
  END IF;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_org_module()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org uuid;
  v_module text := TG_ARGV[0];
BEGIN
  IF public.is_super_admin(auth.uid()) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_TABLE_NAME = 'stock_movements' THEN
    SELECT si.organization_id INTO v_org
    FROM stock_items si
    WHERE si.id = COALESCE(NEW.stock_item_id, OLD.stock_item_id);
  ELSE
    v_org := COALESCE(NEW.organization_id, OLD.organization_id);
  END IF;

  IF v_org IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF NOT public.org_module_enabled(v_org, v_module) THEN
    RAISE EXCEPTION 'Module "%" non inclus dans votre pack. Passez à une offre supérieure.', v_module;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_module_farms ON public.farms;
CREATE TRIGGER trg_enforce_module_farms
  BEFORE INSERT OR DELETE OR UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION enforce_org_module('farm');

DROP TRIGGER IF EXISTS trg_enforce_module_stock_items ON public.stock_items;
CREATE TRIGGER trg_enforce_module_stock_items
  BEFORE INSERT OR DELETE OR UPDATE ON public.stock_items
  FOR EACH ROW EXECUTE FUNCTION enforce_org_module('stock');

DROP TRIGGER IF EXISTS trg_enforce_module_stock_movements ON public.stock_movements;
CREATE TRIGGER trg_enforce_module_stock_movements
  BEFORE INSERT OR DELETE OR UPDATE ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION enforce_org_module('stock');

DROP TRIGGER IF EXISTS trg_enforce_module_invoices ON public.invoices;
CREATE TRIGGER trg_enforce_module_invoices
  BEFORE INSERT OR DELETE OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION enforce_org_module('accounting');

DROP TRIGGER IF EXISTS trg_enforce_module_expenses ON public.expenses;
CREATE TRIGGER trg_enforce_module_expenses
  BEFORE INSERT OR DELETE OR UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION enforce_org_module('accounting');

-- ---------------------------------------------------------------------------
-- Clamp on approve / update permissions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_user(user_id_param uuid, approved_by_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_perms jsonb := '{
    "can_manage_clients": "edit",
    "can_manage_animals": "edit",
    "can_manage_appointments": "edit",
    "can_manage_visits": "edit",
    "can_create_consultations": "edit",
    "can_manage_vaccinations": "edit",
    "can_manage_antiparasites": "edit",
    "can_view_history": "view",
    "can_view_reports": "view",
    "can_manage_farms": "none",
    "can_manage_stock": "none",
    "can_manage_accounting": "none",
    "can_manage_settings": "none"
  }'::jsonb;
  v_role text;
  v_org uuid;
  v_limits jsonb;
  v_perms jsonb;
  v_existing jsonb;
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_org := public.current_organization_id();

  SELECT role, permissions INTO v_role, v_existing
  FROM public.user_profiles
  WHERE id = user_id_param
    AND organization_id = v_org;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'User not found in organization';
  END IF;

  SELECT limits INTO v_limits FROM public.get_effective_plan_for_org(v_org);

  IF v_role = 'admin' THEN
    v_perms := '{}'::jsonb;
  ELSE
    v_perms := public.clamp_permissions_to_plan_limits(
      COALESCE(NULLIF(v_existing, '{}'::jsonb), default_perms),
      COALESCE(v_limits, '{}'::jsonb)
    );
  END IF;

  UPDATE public.user_profiles
  SET
    status = 'approved',
    approved_by = approved_by_param,
    approved_at = now(),
    rejection_reason = NULL,
    permissions = v_perms,
    updated_at = now()
  WHERE id = user_id_param
    AND organization_id = v_org;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_permissions(
  user_id_param uuid,
  permissions_param jsonb,
  updated_by_param uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_role text;
  v_org uuid;
  v_limits jsonb;
  v_clamped jsonb;
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_org := public.current_organization_id();

  SELECT role INTO target_role
  FROM public.user_profiles
  WHERE id = user_id_param
    AND organization_id = v_org;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User not found in organization';
  END IF;

  IF target_role = 'admin' OR target_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot set granular permissions on admin users';
  END IF;

  SELECT limits INTO v_limits FROM public.get_effective_plan_for_org(v_org);
  v_clamped := public.clamp_permissions_to_plan_limits(
    COALESCE(permissions_param, '{}'::jsonb),
    COALESCE(v_limits, '{}'::jsonb)
  );

  UPDATE public.user_profiles
  SET permissions = v_clamped, updated_at = now()
  WHERE id = user_id_param
    AND organization_id = v_org;
END;
$function$;

-- Align free-plan org storage snapshots that still have the old 200 Mo default
UPDATE public.organization_subscriptions os
SET storage_quota_mb = sp.storage_mb,
    updated_at = now()
FROM public.subscription_plans sp
WHERE os.plan_code = sp.code
  AND sp.code = 'free'
  AND os.storage_quota_mb = 200
  AND sp.storage_mb IS DISTINCT FROM 200;
