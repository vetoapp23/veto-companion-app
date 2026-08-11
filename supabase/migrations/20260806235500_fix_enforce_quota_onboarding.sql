-- Allow first approved user (clinic owner) during signup/onboarding.
-- Previously check_quota_limit() saw no_org (profile not yet linked) and
-- enforce_org_quota raised 'Limite du plan atteinte'.
CREATE OR REPLACE FUNCTION public.enforce_org_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_kind text;
  v_check json;
  v_other_approved integer;
BEGIN
  IF TG_TABLE_NAME = 'clients' THEN
    v_kind := 'clients';
  ELSIF TG_TABLE_NAME = 'animals' THEN
    v_kind := 'animals';
  ELSIF TG_TABLE_NAME = 'user_profiles' THEN
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      RETURN NEW;
    END IF;

    -- Bootstrap / onboarding: first approved seat in the org (usually the owner)
    IF NEW.organization_id IS NOT NULL THEN
      SELECT COUNT(*)::integer INTO v_other_approved
      FROM public.user_profiles
      WHERE organization_id = NEW.organization_id
        AND status = 'approved'
        AND id IS DISTINCT FROM NEW.id;
      IF COALESCE(v_other_approved, 0) = 0 THEN
        RETURN NEW;
      END IF;
    END IF;

    v_kind := 'users';
  ELSE
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  v_check := public.check_quota_limit(v_kind);

  -- During profile create the caller's row may not have organization_id yet
  IF COALESCE(v_check ->> 'error', '') = 'no_org' THEN
    RETURN NEW;
  END IF;

  IF COALESCE((v_check ->> 'allowed')::boolean, false) = false THEN
    RAISE EXCEPTION '%', COALESCE(v_check ->> 'message', 'Limite du plan atteinte');
  END IF;

  RETURN NEW;
END;
$function$;
