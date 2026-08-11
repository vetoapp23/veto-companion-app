-- Returning Google users: reclaim orphan clinics (owner_id null after auth user cascade)
-- and restore profile linkage without forcing a new clinic.

CREATE OR REPLACE FUNCTION public.ensure_returning_user_org()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_full_name text;
  v_org_id uuid;
  v_profile public.user_profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  SELECT lower(u.email),
         COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
    INTO v_email, v_full_name
  FROM auth.users u
  WHERE u.id = v_uid;

  IF v_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_email');
  END IF;

  SELECT * INTO v_profile FROM public.user_profiles WHERE id = v_uid;
  IF FOUND AND v_profile.organization_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'reclaimed', false,
      'organization_id', v_profile.organization_id
    );
  END IF;

  SELECT id INTO v_org_id
  FROM public.organizations
  WHERE owner_id = v_uid
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_org_id IS NULL THEN
    SELECT o.id INTO v_org_id
    FROM public.organizations o
    WHERE lower(COALESCE(o.email, '')) = v_email
      AND o.owner_id IS NULL
      AND COALESCE(o.active, true) = true
      AND NOT EXISTS (
        SELECT 1 FROM public.user_profiles p WHERE p.organization_id = o.id
      )
    ORDER BY o.created_at DESC
    LIMIT 1;
  END IF;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', true, 'reclaimed', false, 'organization_id', null);
  END IF;

  UPDATE public.organizations
  SET owner_id = v_uid,
      email = COALESCE(NULLIF(email, ''), v_email),
      updated_at = now()
  WHERE id = v_org_id;

  INSERT INTO public.user_profiles (id, email, username, full_name, role, organization_id, status, approved_at)
  VALUES (
    v_uid,
    v_email,
    split_part(v_email, '@', 1),
    v_full_name,
    'admin',
    v_org_id,
    'approved',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    role = 'admin',
    organization_id = v_org_id,
    status = 'approved',
    approved_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'reclaimed', true,
    'organization_id', v_org_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

REVOKE ALL ON FUNCTION public.ensure_returning_user_org() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_returning_user_org() TO authenticated;
