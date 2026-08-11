-- SECURITY INVOKER views + signup hardening + revoke anon on sensitive RPCs

ALTER VIEW public.animal_medical_summary SET (security_invoker = true);
ALTER VIEW public.vaccination_reminders SET (security_invoker = true);
ALTER VIEW public.financial_dashboard SET (security_invoker = true);
ALTER VIEW public.admin_dashboard_stats SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_role text DEFAULT 'assistant'::text,
  p_organization_code text DEFAULT NULL::text,
  p_clinic_name text DEFAULT NULL::text,
  p_clinic_address text DEFAULT NULL::text,
  p_phone text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_code text;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF auth.uid() IS DISTINCT FROM p_user_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
  ELSE
    -- Post-signup bootstrap when email confirmation has not issued a session yet.
    IF NOT EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE u.id = p_user_id
        AND lower(COALESCE(u.email, '')) = lower(COALESCE(p_email, ''))
        AND u.created_at > now() - interval '15 minutes'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
  END IF;

  IF p_role IS DISTINCT FROM 'admin' AND p_role IS DISTINCT FROM 'assistant' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role');
  END IF;

  IF p_role = 'admin' THEN
    v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    INSERT INTO public.organizations (name, owner_id, clinic_name, clinic_address, phone, email, invitation_code, active)
    VALUES (
      COALESCE(NULLIF(trim(p_clinic_name), ''), 'Ma clinique'),
      p_user_id,
      p_clinic_name,
      p_clinic_address,
      p_phone,
      p_email,
      v_code,
      true
    )
    RETURNING id INTO v_org_id;

    INSERT INTO public.user_profiles (id, email, username, full_name, role, organization_id, status, approved_at)
    VALUES (
      p_user_id,
      p_email,
      split_part(p_email, '@', 1),
      p_full_name,
      'admin',
      v_org_id,
      'approved',
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = 'admin',
      organization_id = v_org_id,
      status = 'approved',
      approved_at = now();

    RETURN jsonb_build_object('success', true, 'organization_id', v_org_id, 'invitation_code', v_code);
  ELSE
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE upper(invitation_code) = upper(p_organization_code) AND active = true;

    IF v_org_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Code organisation invalide');
    END IF;

    INSERT INTO public.user_profiles (id, email, username, full_name, role, organization_id, status)
    VALUES (
      p_user_id,
      p_email,
      split_part(p_email, '@', 1),
      p_full_name,
      'assistant',
      v_org_id,
      'pending'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = 'assistant',
      organization_id = v_org_id,
      status = 'pending';

    RETURN jsonb_build_object('success', true, 'organization_id', v_org_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'admin_update_user_profile',
        'admin_upsert_subscription',
        'approve_user',
        'start_impersonation',
        'end_impersonation',
        'log_admin_action',
        'get_org_admin_detail',
        'get_super_admin_billing_overview',
        'create_medical_share',
        'create_user_profile'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
    -- create_user_profile must remain callable by anon during email-confirm signup bootstrap
    IF r.proname = 'create_user_profile' THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', r.sig);
    ELSE
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);
    END IF;
  END LOOP;
END $$;
