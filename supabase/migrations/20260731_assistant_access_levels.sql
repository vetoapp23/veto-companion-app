-- Permissions assistants : niveaux none | view | edit
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
