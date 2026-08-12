-- Hard zero-write for public demo viewer (demo-viewer@vetpro.test).
-- UI locks are convenience; DB helpers + RLS + triggers are the source of truth.

CREATE OR REPLACE FUNCTION public.is_demo_readonly_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND lower(COALESCE(up.email, '')) = 'demo-viewer@vetpro.test'
  );
$fn$;

REVOKE ALL ON FUNCTION public.is_demo_readonly_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_demo_readonly_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_demo_readonly_user() TO authenticated;

CREATE OR REPLACE FUNCTION public.assert_not_demo_readonly()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
BEGIN
  IF public.is_demo_readonly_user() THEN
    RAISE EXCEPTION 'Mode démo — lecture seule. Aucune modification autorisée.'
      USING ERRCODE = '42501';
  END IF;
END;
$fn$;

REVOKE ALL ON FUNCTION public.assert_not_demo_readonly() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_not_demo_readonly() FROM anon;
GRANT EXECUTE ON FUNCTION public.assert_not_demo_readonly() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_permission(p_key text, p_min text DEFAULT 'view')
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_role text;
  v_status text;
  v_perms jsonb;
  v_level text;
  v_elem jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_super_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  IF public.is_demo_readonly_user()
     AND public.permission_level_rank(p_min) >= public.permission_level_rank('edit') THEN
    RETURN false;
  END IF;

  SELECT role, status, COALESCE(permissions, '{}'::jsonb)
  INTO v_role, v_status, v_perms
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF v_status IS DISTINCT FROM 'approved' THEN
    RETURN false;
  END IF;

  IF v_role = 'admin' THEN
    RETURN true;
  END IF;

  IF v_role IS DISTINCT FROM 'assistant' THEN
    RETURN false;
  END IF;

  IF p_key IS NULL OR NOT (v_perms ? p_key) THEN
    RETURN false;
  END IF;

  v_elem := v_perms -> p_key;
  IF jsonb_typeof(v_elem) = 'boolean' THEN
    v_level := CASE WHEN (v_perms ->> p_key)::boolean THEN 'edit' ELSE 'none' END;
  ELSE
    v_level := lower(COALESCE(v_perms ->> p_key, 'none'));
    IF v_level IN ('true', '1', 'write') THEN
      v_level := 'edit';
    ELSIF v_level IN ('false', '0', 'read') THEN
      v_level := CASE WHEN v_level = 'read' THEN 'view' ELSE 'none' END;
    END IF;
  END IF;

  RETURN public.permission_level_rank(v_level) >= public.permission_level_rank(p_min);
END;
$fn$;

-- Row trigger: blocks even SECURITY DEFINER RPCs (auth.uid() stays the caller)
CREATE OR REPLACE FUNCTION public.trg_assert_not_demo_readonly()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
BEGIN
  PERFORM public.assert_not_demo_readonly();
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$fn$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','animals','consultations','vaccinations','antiparasitics',
    'appointments','visits','visit_services','prescriptions',
    'farms','farm_interventions','stock_items','stock_movements','stock_alerts',
    'invoices','invoice_lines','expenses','animal_pedigree',
    'custom_dropdown_values','organization_settings','medical_share_links',
    'user_profiles'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('DROP TRIGGER IF EXISTS trg_demo_readonly_block ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_demo_readonly_block BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_assert_not_demo_readonly()',
      t
    );
  END LOOP;
END $$;

-- Soft tables: split ALL policies
DROP POLICY IF EXISTS animal_pedigree_org ON public.animal_pedigree;
DROP POLICY IF EXISTS animal_pedigree_select ON public.animal_pedigree;
DROP POLICY IF EXISTS animal_pedigree_insert ON public.animal_pedigree;
DROP POLICY IF EXISTS animal_pedigree_update ON public.animal_pedigree;
DROP POLICY IF EXISTS animal_pedigree_delete ON public.animal_pedigree;
CREATE POLICY animal_pedigree_select ON public.animal_pedigree
  FOR SELECT USING (organization_id = current_organization_id());
CREATE POLICY animal_pedigree_insert ON public.animal_pedigree
  FOR INSERT WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_animals', 'edit')
  );
CREATE POLICY animal_pedigree_update ON public.animal_pedigree
  FOR UPDATE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_animals', 'edit')
  )
  WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_animals', 'edit')
  );
CREATE POLICY animal_pedigree_delete ON public.animal_pedigree
  FOR DELETE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_animals', 'edit')
  );

DROP POLICY IF EXISTS custom_dropdown_values_org ON public.custom_dropdown_values;
DROP POLICY IF EXISTS custom_dropdown_values_select ON public.custom_dropdown_values;
DROP POLICY IF EXISTS custom_dropdown_values_insert ON public.custom_dropdown_values;
DROP POLICY IF EXISTS custom_dropdown_values_update ON public.custom_dropdown_values;
DROP POLICY IF EXISTS custom_dropdown_values_delete ON public.custom_dropdown_values;
CREATE POLICY custom_dropdown_values_select ON public.custom_dropdown_values
  FOR SELECT USING (organization_id = current_organization_id());
CREATE POLICY custom_dropdown_values_insert ON public.custom_dropdown_values
  FOR INSERT WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
  );
CREATE POLICY custom_dropdown_values_update ON public.custom_dropdown_values
  FOR UPDATE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
  )
  WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
  );
CREATE POLICY custom_dropdown_values_delete ON public.custom_dropdown_values
  FOR DELETE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
  );

DROP POLICY IF EXISTS organization_settings_org ON public.organization_settings;
DROP POLICY IF EXISTS organization_settings_select ON public.organization_settings;
DROP POLICY IF EXISTS organization_settings_insert ON public.organization_settings;
DROP POLICY IF EXISTS organization_settings_update ON public.organization_settings;
DROP POLICY IF EXISTS organization_settings_delete ON public.organization_settings;
CREATE POLICY organization_settings_select ON public.organization_settings
  FOR SELECT USING (organization_id = current_organization_id());
CREATE POLICY organization_settings_insert ON public.organization_settings
  FOR INSERT WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_settings', 'edit')
  );
CREATE POLICY organization_settings_update ON public.organization_settings
  FOR UPDATE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_settings', 'edit')
  )
  WITH CHECK (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_settings', 'edit')
  );
CREATE POLICY organization_settings_delete ON public.organization_settings
  FOR DELETE USING (
    organization_id = current_organization_id()
    AND NOT public.is_demo_readonly_user()
    AND public.has_permission('can_manage_settings', 'edit')
  );

DROP POLICY IF EXISTS stock_alerts_insert ON public.stock_alerts;
DROP POLICY IF EXISTS stock_alerts_update ON public.stock_alerts;
DROP POLICY IF EXISTS stock_alerts_delete ON public.stock_alerts;
CREATE POLICY stock_alerts_insert ON public.stock_alerts
  FOR INSERT WITH CHECK (
    NOT public.is_demo_readonly_user()
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_alerts.item_id AND si.organization_id = current_organization_id()
    )
  );
CREATE POLICY stock_alerts_update ON public.stock_alerts
  FOR UPDATE USING (
    NOT public.is_demo_readonly_user()
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_alerts.item_id AND si.organization_id = current_organization_id()
    )
  );
CREATE POLICY stock_alerts_delete ON public.stock_alerts
  FOR DELETE USING (
    NOT public.is_demo_readonly_user()
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_alerts.item_id AND si.organization_id = current_organization_id()
    )
  );

DROP POLICY IF EXISTS profiles_update ON public.user_profiles;
CREATE POLICY profiles_update ON public.user_profiles
  FOR UPDATE
  USING (
    NOT public.is_demo_readonly_user()
    AND (
      id = auth.uid()
      OR (organization_id = current_organization_id() AND public.is_org_admin())
    )
  )
  WITH CHECK (
    NOT public.is_demo_readonly_user()
    AND (
      id = auth.uid()
      OR (organization_id = current_organization_id() AND public.is_org_admin())
    )
  );
