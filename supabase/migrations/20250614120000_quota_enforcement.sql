-- Quotas configurables par plan + enforcement côté serveur

-- Valeurs par défaut pour le plan free si non définies
UPDATE subscription_plans
SET max_clients = COALESCE(max_clients, 10),
    max_animals = COALESCE(max_animals, 25),
    max_users = COALESCE(max_users, 1)
WHERE code = 'free';

CREATE OR REPLACE FUNCTION public.get_effective_plan_for_org(p_org_id uuid)
RETURNS TABLE (
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
SET search_path = public
AS $$
DECLARE
  v_sub organization_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM organization_subscriptions WHERE organization_id = p_org_id LIMIT 1;

  IF v_sub.id IS NULL THEN
    SELECT * INTO v_plan FROM subscription_plans WHERE code = 'free' AND is_active = true LIMIT 1;
    plan_code := 'free';
  ELSE
    SELECT * INTO v_plan FROM subscription_plans WHERE code = v_sub.plan_code LIMIT 1;
    plan_code := v_sub.plan_code;
  END IF;

  plan_name := COALESCE(v_plan.name, 'Découverte');
  storage_total_mb := COALESCE(v_sub.storage_quota_mb, v_plan.storage_mb, 200)::numeric
    + COALESCE(v_sub.storage_addon_mb, 0)::numeric;
  max_clients := v_plan.max_clients;
  max_animals := v_plan.max_animals;
  max_users := COALESCE(v_plan.max_users, 1) + COALESCE(v_sub.extra_users, 0);
  features := COALESCE(v_plan.features, '[]'::jsonb);
  limits := COALESCE(v_plan.limits, '{}'::jsonb);
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_organization_quota()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_plan record;
  v_storage_bytes bigint;
  v_used_mb numeric;
  v_pct numeric;
BEGIN
  SELECT organization_id INTO v_org_id FROM user_profiles WHERE id = auth.uid();
  IF v_org_id IS NULL THEN
    RETURN json_build_object('error', 'no_org');
  END IF;

  SELECT * INTO v_plan FROM get_effective_plan_for_org(v_org_id);

  SELECT COALESCE(SUM(bytes_used), 0) INTO v_storage_bytes
  FROM storage_usage WHERE organization_id = v_org_id;

  v_used_mb := ROUND((v_storage_bytes::numeric / (1024 * 1024))::numeric, 2);
  v_pct := CASE
    WHEN v_plan.storage_total_mb > 0 THEN ROUND((v_used_mb / v_plan.storage_total_mb) * 100, 1)
    ELSE 0
  END;

  RETURN json_build_object(
    'organization_id', v_org_id,
    'plan_code', v_plan.plan_code,
    'plan_name', v_plan.plan_name,
    'storage_total_mb', v_plan.storage_total_mb,
    'storage_used_mb', v_used_mb,
    'storage_used_bytes', v_storage_bytes,
    'percent_used', v_pct,
    'over_quota', v_used_mb > v_plan.storage_total_mb,
    'max_clients', v_plan.max_clients,
    'max_animals', v_plan.max_animals,
    'max_users', v_plan.max_users,
    'features', v_plan.features,
    'limits', v_plan.limits
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_quota_limit(p_kind text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_plan record;
  v_current integer := 0;
  v_max integer;
  v_labels jsonb := '{"clients":"clients","animals":"animaux","users":"utilisateurs"}'::jsonb;
BEGIN
  IF public.is_super_admin(auth.uid()) THEN
    RETURN json_build_object('allowed', true, 'bypass', true);
  END IF;

  SELECT organization_id INTO v_org_id FROM user_profiles WHERE id = auth.uid();
  IF v_org_id IS NULL THEN
    RETURN json_build_object('allowed', false, 'error', 'no_org');
  END IF;

  SELECT * INTO v_plan FROM get_effective_plan_for_org(v_org_id);

  IF p_kind = 'clients' THEN
    SELECT COUNT(*)::integer INTO v_current FROM clients WHERE organization_id = v_org_id;
    v_max := v_plan.max_clients;
  ELSIF p_kind = 'animals' THEN
    SELECT COUNT(*)::integer INTO v_current FROM animals WHERE organization_id = v_org_id;
    v_max := v_plan.max_animals;
  ELSIF p_kind = 'users' THEN
    SELECT COUNT(*)::integer INTO v_current FROM user_profiles
    WHERE organization_id = v_org_id AND status = 'approved';
    v_max := v_plan.max_users;
  ELSE
    RETURN json_build_object('allowed', false, 'error', 'invalid_kind');
  END IF;

  IF v_max IS NULL THEN
    RETURN json_build_object(
      'allowed', true,
      'current', v_current,
      'max', null,
      'plan_code', v_plan.plan_code,
      'plan_name', v_plan.plan_name
    );
  END IF;

  IF v_current >= v_max THEN
    RETURN json_build_object(
      'allowed', false,
      'current', v_current,
      'max', v_max,
      'plan_code', v_plan.plan_code,
      'plan_name', v_plan.plan_name,
      'message', format(
        'Votre pack %s est limité à %s %s. Passez à un pack payant pour continuer.',
        v_plan.plan_name,
        v_max,
        v_labels ->> p_kind
      )
    );
  END IF;

  RETURN json_build_object(
    'allowed', true,
    'current', v_current,
    'max', v_max,
    'plan_code', v_plan.plan_code,
    'plan_name', v_plan.plan_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_org_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kind text;
  v_check json;
BEGIN
  IF TG_TABLE_NAME = 'clients' THEN
    v_kind := 'clients';
  ELSIF TG_TABLE_NAME = 'animals' THEN
    v_kind := 'animals';
  ELSIF TG_TABLE_NAME = 'user_profiles' THEN
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      RETURN NEW;
    END IF;
    v_kind := 'users';
  ELSE
    RETURN NEW;
  END IF;

  -- Service role / super-admin seeding: skip when no auth context
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  v_check := public.check_quota_limit(v_kind);
  IF COALESCE((v_check ->> 'allowed')::boolean, false) = false THEN
    RAISE EXCEPTION '%', COALESCE(v_check ->> 'message', 'Limite du plan atteinte');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_client_quota ON public.clients;
CREATE TRIGGER trg_enforce_client_quota
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_quota();

DROP TRIGGER IF EXISTS trg_enforce_animal_quota ON public.animals;
CREATE TRIGGER trg_enforce_animal_quota
  BEFORE INSERT ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_quota();

DROP TRIGGER IF EXISTS trg_enforce_user_quota ON public.user_profiles;
CREATE TRIGGER trg_enforce_user_quota
  BEFORE INSERT OR UPDATE OF status ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_quota();
