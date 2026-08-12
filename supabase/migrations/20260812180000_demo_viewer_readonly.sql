-- Public demo viewer: force read_only for demo-viewer@vetpro.test
CREATE OR REPLACE FUNCTION public.get_access_status()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_profile record;
  v_sub record;
  v_maint jsonb;
  v_flags jsonb;
  v_is_super boolean;
  v_access text := 'ok';
  v_reason text := null;
  v_read_only boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('access', 'denied', 'reason', 'not_authenticated');
  END IF;

  SELECT * INTO v_profile FROM public.user_profiles WHERE id = v_uid;
  IF NOT FOUND THEN
    RETURN json_build_object('access', 'denied', 'reason', 'no_profile');
  END IF;

  v_is_super := (v_profile.role = 'super_admin' AND v_profile.status = 'approved');

  SELECT value INTO v_maint FROM public.platform_settings WHERE key = 'maintenance_mode';
  SELECT value INTO v_flags FROM public.platform_settings WHERE key = 'feature_flags';

  IF COALESCE(v_maint->>'enabled') = 'true' AND NOT v_is_super THEN
    RETURN json_build_object(
      'access', 'maintenance',
      'reason', 'maintenance_mode',
      'message', COALESCE(v_maint->>'message', 'Maintenance en cours'),
      'user_status', v_profile.status,
      'role', v_profile.role,
      'is_super_admin', v_is_super
    );
  END IF;

  IF v_profile.status = 'pending' THEN
    v_access := 'pending';
    v_reason := 'account_pending';
  ELSIF v_profile.status = 'rejected' THEN
    v_access := 'denied';
    v_reason := 'account_rejected';
  ELSIF v_profile.status = 'suspended' THEN
    v_access := 'denied';
    v_reason := 'account_suspended';
  END IF;

  IF v_access = 'ok' AND v_profile.organization_id IS NOT NULL AND NOT v_is_super THEN
    SELECT * INTO v_sub
    FROM public.organization_subscriptions
    WHERE organization_id = v_profile.organization_id
    ORDER BY created_at DESC NULLS LAST
    LIMIT 1;

    IF FOUND THEN
      IF v_sub.status IN ('suspended', 'canceled') THEN
        v_access := 'denied';
        v_reason := 'subscription_' || v_sub.status;
      ELSIF v_sub.status = 'past_due' THEN
        v_read_only := true;
        v_reason := 'subscription_past_due';
      END IF;
    END IF;
  END IF;

  IF v_access = 'ok' AND COALESCE(v_flags->>'force_read_only') = 'true' AND NOT v_is_super THEN
    v_read_only := true;
    v_reason := COALESCE(v_reason, 'force_read_only');
  END IF;

  -- Marketing demo visitor: always read-only (shared clinic seed must not be mutated)
  IF v_access = 'ok'
     AND lower(COALESCE(v_profile.email, '')) = 'demo-viewer@vetpro.test'
     AND NOT v_is_super THEN
    v_read_only := true;
    v_reason := 'demo_readonly';
  END IF;

  RETURN json_build_object(
    'access', v_access,
    'reason', v_reason,
    'read_only', v_read_only,
    'user_status', v_profile.status,
    'role', v_profile.role,
    'organization_id', v_profile.organization_id,
    'is_super_admin', v_is_super,
    'subscription_status', v_sub.status,
    'plan_code', v_sub.plan_code,
    'maintenance', COALESCE(v_maint, '{}'::jsonb),
    'feature_flags', COALESCE(v_flags, '{}'::jsonb)
  );
END;
$function$;
