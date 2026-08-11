-- Prevent privilege escalation on user_profiles (self-service + cross-tenant).
CREATE OR REPLACE FUNCTION public.enforce_user_profile_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_sa boolean := public.is_super_admin(auth.uid());
  caller_is_oa boolean := public.is_org_admin();
  caller_org uuid := public.current_organization_id();
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF caller_is_sa THEN
    RETURN NEW;
  END IF;

  IF NEW.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'forbidden: cannot change own role';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'forbidden: cannot change own status';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'forbidden: cannot change own organization';
    END IF;
  END IF;

  IF NEW.id IS DISTINCT FROM auth.uid() THEN
    IF OLD.organization_id IS DISTINCT FROM caller_org OR caller_org IS NULL THEN
      RAISE EXCEPTION 'forbidden: target user not in your organization';
    END IF;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NEW.role = 'super_admin' THEN
      RAISE EXCEPTION 'forbidden: cannot assign super_admin';
    END IF;
    IF NOT caller_is_oa THEN
      RAISE EXCEPTION 'forbidden: cannot change role';
    END IF;
  END IF;

  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'forbidden: cannot move organization';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NOT caller_is_oa THEN
    RAISE EXCEPTION 'forbidden: cannot change status';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_user_profiles_priv_guard ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_priv_guard
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_profile_update_guard();
