-- Defaults + garde-fous pour droits assistants (SaaS org admin)
CREATE OR REPLACE FUNCTION public.approve_user(user_id_param uuid, approved_by_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  default_perms jsonb := '{
    "can_manage_clients": true,
    "can_manage_animals": true,
    "can_manage_appointments": true,
    "can_manage_visits": true,
    "can_create_consultations": true,
    "can_manage_vaccinations": true,
    "can_manage_antiparasites": true,
    "can_view_history": true,
    "can_view_reports": true,
    "can_manage_farms": false,
    "can_manage_stock": false,
    "can_manage_accounting": false,
    "can_manage_settings": false
  }'::jsonb;
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.user_profiles
  SET
    status = 'approved',
    approved_by = approved_by_param,
    approved_at = now(),
    rejection_reason = NULL,
    permissions = COALESCE(NULLIF(permissions, '{}'::jsonb), default_perms),
    updated_at = now()
  WHERE id = user_id_param
    AND organization_id = public.current_organization_id();
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
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT role INTO target_role
  FROM public.user_profiles
  WHERE id = user_id_param
    AND organization_id = public.current_organization_id();

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User not found in organization';
  END IF;

  IF target_role = 'admin' OR target_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot set granular permissions on admin users';
  END IF;

  UPDATE public.user_profiles
  SET permissions = permissions_param, updated_at = now()
  WHERE id = user_id_param
    AND organization_id = public.current_organization_id();
END;
$function$;

UPDATE public.user_profiles
SET permissions = '{
  "can_manage_clients": true,
  "can_manage_animals": true,
  "can_manage_appointments": true,
  "can_manage_visits": true,
  "can_create_consultations": true,
  "can_manage_vaccinations": true,
  "can_manage_antiparasites": true,
  "can_view_history": true,
  "can_view_reports": true,
  "can_manage_farms": false,
  "can_manage_stock": false,
  "can_manage_accounting": false,
  "can_manage_settings": false
}'::jsonb,
updated_at = now()
WHERE role = 'assistant'
  AND status = 'approved'
  AND (permissions IS NULL OR permissions = '{}'::jsonb OR permissions = 'null'::jsonb);
