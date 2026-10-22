-- P0: Harden user_profiles INSERT, revoke anon table/RPC grants, tighten medical_share SELECT.
-- Direct client INSERT into user_profiles is blocked; signup goes through create_user_profile (SECURITY DEFINER).

-- ---------------------------------------------------------------------------
-- 1) INSERT privilege guard (defense in depth even for DEFINER paths)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_user_profile_insert_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role = 'super_admin' THEN
    IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
      RAISE EXCEPTION 'forbidden: cannot insert super_admin';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM 'admin' AND NEW.role IS DISTINCT FROM 'assistant' THEN
    RAISE EXCEPTION 'forbidden: invalid role on insert';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_user_profiles_insert_guard ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_insert_guard
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_profile_insert_guard();

-- Block direct INSERT from authenticated clients (RPC DEFINER still bypasses RLS).
DROP POLICY IF EXISTS profiles_insert ON public.user_profiles;
CREATE POLICY profiles_insert ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 2) Harden create_user_profile ON CONFLICT (no rewrite of approved profiles)
-- ---------------------------------------------------------------------------
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
  v_uid uuid := auth.uid();
  v_join_role text;
  v_approved_count integer;
  v_max_users integer;
  v_plan record;
  v_existing public.user_profiles%ROWTYPE;
BEGIN
  IF v_uid IS NOT NULL THEN
    IF v_uid IS DISTINCT FROM p_user_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    p_user_id := v_uid;
  ELSE
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

  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',
      'Compte introuvable ou session expirée. Déconnectez-vous puis reconnectez-vous avec Google.'
    );
  END IF;

  IF p_role IS DISTINCT FROM 'admin' AND p_role IS DISTINCT FROM 'assistant' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role');
  END IF;

  SELECT * INTO v_existing FROM public.user_profiles WHERE id = p_user_id;
  IF FOUND AND v_existing.status = 'approved' AND v_existing.organization_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'organization_id', v_existing.organization_id,
      'role', v_existing.role,
      'status', v_existing.status,
      'already_exists', true
    );
  END IF;

  -- Join existing clinic via invitation code
  IF NULLIF(trim(p_organization_code), '') IS NOT NULL THEN
    v_join_role := p_role;

    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE upper(invitation_code) = upper(trim(p_organization_code))
      AND active = true;

    IF v_org_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Code organisation invalide');
    END IF;

    SELECT * INTO v_plan FROM public.get_effective_plan_for_org(v_org_id);
    v_max_users := v_plan.max_users;
    IF v_max_users IS NOT NULL THEN
      SELECT COUNT(*)::integer INTO v_approved_count
      FROM public.user_profiles
      WHERE organization_id = v_org_id
        AND status IN ('approved', 'pending');
      IF v_approved_count >= v_max_users THEN
        RETURN jsonb_build_object(
          'success', false,
          'error',
          format('Cette clinique a atteint la limite de %s sièges (%s).', v_max_users, v_plan.plan_name)
        );
      END IF;
    END IF;

    INSERT INTO public.user_profiles (id, email, username, full_name, role, organization_id, status, permissions)
    VALUES (
      p_user_id,
      p_email,
      split_part(p_email, '@', 1),
      p_full_name,
      v_join_role,
      v_org_id,
      'pending',
      '{}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      organization_id = v_org_id,
      status = 'pending',
      permissions = EXCLUDED.permissions
    WHERE public.user_profiles.status IS DISTINCT FROM 'approved';

    RETURN jsonb_build_object(
      'success', true,
      'organization_id', v_org_id,
      'role', v_join_role,
      'status', 'pending'
    );
  END IF;

  -- Create / reclaim own clinic (owner path)
  IF p_role = 'admin' THEN
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE owner_id = p_user_id
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_org_id IS NULL THEN
      SELECT o.id INTO v_org_id
      FROM public.organizations o
      WHERE lower(COALESCE(o.email, '')) = lower(COALESCE(p_email, ''))
        AND o.owner_id IS NULL
        AND COALESCE(o.active, true) = true
        AND NOT EXISTS (
          SELECT 1 FROM public.user_profiles p WHERE p.organization_id = o.id
        )
      ORDER BY o.created_at DESC
      LIMIT 1;

      IF v_org_id IS NOT NULL THEN
        UPDATE public.organizations SET
          owner_id = p_user_id,
          name = COALESCE(NULLIF(trim(p_clinic_name), ''), name),
          clinic_name = COALESCE(NULLIF(trim(p_clinic_name), ''), clinic_name),
          clinic_address = COALESCE(NULLIF(trim(p_clinic_address), ''), clinic_address),
          phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
          email = COALESCE(NULLIF(trim(p_email), ''), email),
          updated_at = now()
        WHERE id = v_org_id
        RETURNING invitation_code INTO v_code;
      END IF;
    END IF;

    IF v_org_id IS NULL THEN
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
    ELSE
      UPDATE public.organizations SET
        name = COALESCE(NULLIF(trim(p_clinic_name), ''), name),
        clinic_name = COALESCE(NULLIF(trim(p_clinic_name), ''), clinic_name),
        clinic_address = COALESCE(NULLIF(trim(p_clinic_address), ''), clinic_address),
        phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
        email = COALESCE(NULLIF(trim(p_email), ''), email),
        owner_id = COALESCE(owner_id, p_user_id),
        updated_at = now()
      WHERE id = v_org_id
      RETURNING invitation_code INTO v_code;
    END IF;

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
      approved_at = now()
    WHERE public.user_profiles.status IS DISTINCT FROM 'approved'
       OR public.user_profiles.organization_id IS NULL;

    RETURN jsonb_build_object('success', true, 'organization_id', v_org_id, 'invitation_code', v_code);
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Code organisation requis');
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object(
    'success', false,
    'error',
    'Compte introuvable ou session expirée. Déconnectez-vous puis reconnectez-vous avec Google.'
  );
WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- ---------------------------------------------------------------------------
-- 3) Medical share: only creator or org admin can SELECT token/payload
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS medical_share_links_select_own_org ON public.medical_share_links;
CREATE POLICY medical_share_links_select_own_org ON public.medical_share_links
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND (
      created_by = auth.uid()
      OR public.is_org_admin()
      OR public.is_super_admin(auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 4) Revoke anon table privileges (keep public pricing SELECT)
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

GRANT SELECT ON TABLE public.subscription_plans TO anon;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;

-- ---------------------------------------------------------------------------
-- 5) Revoke dangerous RPC EXECUTE from anon (keep public signup + medical share get)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'get_user_org',
        'has_role',
        'is_super_admin',
        'is_org_admin',
        'update_user_permissions',
        'reject_user',
        'set_org_member_role',
        'import_medical_share',
        'generate_medical_share_short_code',
        'get_access_status',
        'get_all_orgs_storage',
        'get_all_orgs_usage_stats',
        'get_organization_quota',
        'get_active_impersonation',
        'enforce_org_module',
        'enforce_org_quota',
        'enforce_user_profile_update_guard',
        'ensure_returning_user_org',
        'clamp_permissions_to_plan_limits',
        'check_quota_limit',
        'recompute_storage_usage',
        'record_storage_change',
        'org_module_enabled',
        'current_organization_id',
        'user_belongs_to_org',
        'has_permission',
        'permission_level_rank',
        'permission_key_to_module'
      )
  LOOP
    EXECUTE format(
      'REVOKE ALL ON FUNCTION %I.%I(%s) FROM anon',
      r.schema_name, r.func_name, r.args
    );
  END LOOP;
END $$;

-- Explicitly keep public signup + medical share read for unauthenticated visitors
GRANT EXECUTE ON FUNCTION public.create_user_profile(uuid, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_medical_share(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_plan_for_org(uuid) TO anon, authenticated;
