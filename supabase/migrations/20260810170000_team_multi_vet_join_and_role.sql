-- Allow joining an existing org as admin (vet) or assistant via invitation code.
-- Add set_org_member_role for clinic admins to promote/demote members.
-- Adjust approve_user so admin joins do not get assistant permission packs.

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

  -- Join existing clinic via invitation code (vet or assistant)
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
      permissions = EXCLUDED.permissions;

    RETURN jsonb_build_object(
      'success', true,
      'organization_id', v_org_id,
      'role', v_join_role,
      'status', 'pending'
    );
  END IF;

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
      approved_at = now();

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
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE id = user_id_param
    AND organization_id = public.current_organization_id();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'User not found in organization';
  END IF;

  UPDATE public.user_profiles
  SET
    status = 'approved',
    approved_by = approved_by_param,
    approved_at = now(),
    rejection_reason = NULL,
    permissions = CASE
      WHEN v_role = 'admin' THEN '{}'::jsonb
      ELSE COALESCE(NULLIF(permissions, '{}'::jsonb), default_perms)
    END,
    updated_at = now()
  WHERE id = user_id_param
    AND organization_id = public.current_organization_id();
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_org_member_role(
  p_user_id uuid,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_org_id uuid;
  v_target record;
  v_admin_count integer;
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
BEGIN
  IF v_actor IS NULL OR NOT public.is_org_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Non autorisé');
  END IF;

  IF p_role IS DISTINCT FROM 'admin' AND p_role IS DISTINCT FROM 'assistant' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rôle invalide');
  END IF;

  v_org_id := public.current_organization_id();

  SELECT * INTO v_target
  FROM public.user_profiles
  WHERE id = p_user_id
    AND organization_id = v_org_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membre introuvable');
  END IF;

  IF v_target.role = 'super_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Impossible de modifier un super administrateur');
  END IF;

  IF v_target.role = p_role THEN
    RETURN jsonb_build_object('success', true, 'role', p_role);
  END IF;

  IF v_target.role = 'admin' AND p_role = 'assistant' AND v_target.status = 'approved' THEN
    SELECT COUNT(*)::integer INTO v_admin_count
    FROM public.user_profiles
    WHERE organization_id = v_org_id
      AND role = 'admin'
      AND status = 'approved'
      AND id IS DISTINCT FROM p_user_id;
    IF COALESCE(v_admin_count, 0) = 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error',
        'Impossible de rétrograder le dernier vétérinaire administrateur'
      );
    END IF;
  END IF;

  UPDATE public.user_profiles
  SET
    role = p_role,
    permissions = CASE
      WHEN p_role = 'admin' THEN '{}'::jsonb
      ELSE COALESCE(NULLIF(permissions, '{}'::jsonb), default_perms)
    END,
    updated_at = now()
  WHERE id = p_user_id
    AND organization_id = v_org_id;

  RETURN jsonb_build_object('success', true, 'role', p_role);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.set_org_member_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_org_member_role(uuid, text) TO service_role;
