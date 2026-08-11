-- P0: Server-side assistant permissions (RLS) + revoke anon on admin RPCs + invitations policies
-- Applied remotely as: assistant_permission_rls_and_rpc_hardening

CREATE OR REPLACE FUNCTION public.permission_level_rank(p_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $fn$
  SELECT CASE lower(COALESCE(p_level, 'none'))
    WHEN 'edit' THEN 2
    WHEN 'view' THEN 1
    WHEN 'true' THEN 2
    ELSE 0
  END;
$fn$;

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

REVOKE ALL ON FUNCTION public.has_permission(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_permission(text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.permission_level_rank(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.permission_level_rank(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.permission_level_rank(text) TO authenticated;

-- clients
DROP POLICY IF EXISTS clients_select ON public.clients;
DROP POLICY IF EXISTS clients_insert ON public.clients;
DROP POLICY IF EXISTS clients_update ON public.clients;
DROP POLICY IF EXISTS clients_delete ON public.clients;
CREATE POLICY clients_select ON public.clients FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_clients', 'view'));
CREATE POLICY clients_insert ON public.clients FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_clients', 'edit'));
CREATE POLICY clients_update ON public.clients FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_clients', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_clients', 'edit'));
CREATE POLICY clients_delete ON public.clients FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_clients', 'edit'));

-- animals
DROP POLICY IF EXISTS animals_select ON public.animals;
DROP POLICY IF EXISTS animals_insert ON public.animals;
DROP POLICY IF EXISTS animals_update ON public.animals;
DROP POLICY IF EXISTS animals_delete ON public.animals;
CREATE POLICY animals_select ON public.animals FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_animals', 'view'));
CREATE POLICY animals_insert ON public.animals FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_animals', 'edit'));
CREATE POLICY animals_update ON public.animals FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_animals', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_animals', 'edit'));
CREATE POLICY animals_delete ON public.animals FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_animals', 'edit'));

-- appointments
DROP POLICY IF EXISTS appointments_select ON public.appointments;
DROP POLICY IF EXISTS appointments_insert ON public.appointments;
DROP POLICY IF EXISTS appointments_update ON public.appointments;
DROP POLICY IF EXISTS appointments_delete ON public.appointments;
CREATE POLICY appointments_select ON public.appointments FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_appointments', 'view'));
CREATE POLICY appointments_insert ON public.appointments FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_appointments', 'edit'));
CREATE POLICY appointments_update ON public.appointments FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_appointments', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_appointments', 'edit'));
CREATE POLICY appointments_delete ON public.appointments FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_appointments', 'edit'));

-- visits
DROP POLICY IF EXISTS visits_org_all ON public.visits;
DROP POLICY IF EXISTS visits_select ON public.visits;
DROP POLICY IF EXISTS visits_insert ON public.visits;
DROP POLICY IF EXISTS visits_update ON public.visits;
DROP POLICY IF EXISTS visits_delete ON public.visits;
CREATE POLICY visits_select ON public.visits FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'view'));
CREATE POLICY visits_insert ON public.visits FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));
CREATE POLICY visits_update ON public.visits FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));
CREATE POLICY visits_delete ON public.visits FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));

-- visit_services
DROP POLICY IF EXISTS visit_services_org_all ON public.visit_services;
DROP POLICY IF EXISTS visit_services_select ON public.visit_services;
DROP POLICY IF EXISTS visit_services_insert ON public.visit_services;
DROP POLICY IF EXISTS visit_services_update ON public.visit_services;
DROP POLICY IF EXISTS visit_services_delete ON public.visit_services;
CREATE POLICY visit_services_select ON public.visit_services FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'view'));
CREATE POLICY visit_services_insert ON public.visit_services FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));
CREATE POLICY visit_services_update ON public.visit_services FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));
CREATE POLICY visit_services_delete ON public.visit_services FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_visits', 'edit'));

-- consultations
DROP POLICY IF EXISTS consultations_select ON public.consultations;
DROP POLICY IF EXISTS consultations_insert ON public.consultations;
DROP POLICY IF EXISTS consultations_update ON public.consultations;
DROP POLICY IF EXISTS consultations_delete ON public.consultations;
CREATE POLICY consultations_select ON public.consultations FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'view'));
CREATE POLICY consultations_insert ON public.consultations FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));
CREATE POLICY consultations_update ON public.consultations FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));
CREATE POLICY consultations_delete ON public.consultations FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));

-- vaccinations
DROP POLICY IF EXISTS vaccinations_select ON public.vaccinations;
DROP POLICY IF EXISTS vaccinations_insert ON public.vaccinations;
DROP POLICY IF EXISTS vaccinations_update ON public.vaccinations;
DROP POLICY IF EXISTS vaccinations_delete ON public.vaccinations;
CREATE POLICY vaccinations_select ON public.vaccinations FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_vaccinations', 'view'));
CREATE POLICY vaccinations_insert ON public.vaccinations FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_vaccinations', 'edit'));
CREATE POLICY vaccinations_update ON public.vaccinations FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_vaccinations', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_vaccinations', 'edit'));
CREATE POLICY vaccinations_delete ON public.vaccinations FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_vaccinations', 'edit'));

-- antiparasitics
DROP POLICY IF EXISTS antiparasitics_select ON public.antiparasitics;
DROP POLICY IF EXISTS antiparasitics_insert ON public.antiparasitics;
DROP POLICY IF EXISTS antiparasitics_update ON public.antiparasitics;
DROP POLICY IF EXISTS antiparasitics_delete ON public.antiparasitics;
CREATE POLICY antiparasitics_select ON public.antiparasitics FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_antiparasites', 'view'));
CREATE POLICY antiparasitics_insert ON public.antiparasitics FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_antiparasites', 'edit'));
CREATE POLICY antiparasitics_update ON public.antiparasitics FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_antiparasites', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_antiparasites', 'edit'));
CREATE POLICY antiparasitics_delete ON public.antiparasitics FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_antiparasites', 'edit'));

-- farms
DROP POLICY IF EXISTS farms_select ON public.farms;
DROP POLICY IF EXISTS farms_insert ON public.farms;
DROP POLICY IF EXISTS farms_update ON public.farms;
DROP POLICY IF EXISTS farms_delete ON public.farms;
CREATE POLICY farms_select ON public.farms FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'view'));
CREATE POLICY farms_insert ON public.farms FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farms_update ON public.farms FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farms_delete ON public.farms FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));

DROP POLICY IF EXISTS farm_batches_org ON public.farm_batches;
DROP POLICY IF EXISTS farm_batches_select ON public.farm_batches;
DROP POLICY IF EXISTS farm_batches_insert ON public.farm_batches;
DROP POLICY IF EXISTS farm_batches_update ON public.farm_batches;
DROP POLICY IF EXISTS farm_batches_delete ON public.farm_batches;
CREATE POLICY farm_batches_select ON public.farm_batches FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'view'));
CREATE POLICY farm_batches_insert ON public.farm_batches FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farm_batches_update ON public.farm_batches FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farm_batches_delete ON public.farm_batches FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));

DROP POLICY IF EXISTS farm_interventions_select ON public.farm_interventions;
DROP POLICY IF EXISTS farm_interventions_insert ON public.farm_interventions;
DROP POLICY IF EXISTS farm_interventions_update ON public.farm_interventions;
DROP POLICY IF EXISTS farm_interventions_delete ON public.farm_interventions;
CREATE POLICY farm_interventions_select ON public.farm_interventions FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'view'));
CREATE POLICY farm_interventions_insert ON public.farm_interventions FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farm_interventions_update ON public.farm_interventions FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));
CREATE POLICY farm_interventions_delete ON public.farm_interventions FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_farms', 'edit'));

-- stock
DROP POLICY IF EXISTS stock_items_select ON public.stock_items;
DROP POLICY IF EXISTS stock_items_insert ON public.stock_items;
DROP POLICY IF EXISTS stock_items_update ON public.stock_items;
DROP POLICY IF EXISTS stock_items_delete ON public.stock_items;
CREATE POLICY stock_items_select ON public.stock_items FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_stock', 'view'));
CREATE POLICY stock_items_insert ON public.stock_items FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_stock', 'edit'));
CREATE POLICY stock_items_update ON public.stock_items FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_stock', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_stock', 'edit'));
CREATE POLICY stock_items_delete ON public.stock_items FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_stock', 'edit'));

DROP POLICY IF EXISTS stock_movements_select ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_insert ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_update ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_delete ON public.stock_movements;
CREATE POLICY stock_movements_select ON public.stock_movements FOR SELECT
  USING (
    has_permission('can_manage_stock', 'view')
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_movements.stock_item_id
        AND si.organization_id = current_organization_id()
    )
  );
CREATE POLICY stock_movements_insert ON public.stock_movements FOR INSERT
  WITH CHECK (
    has_permission('can_manage_stock', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_movements.stock_item_id
        AND si.organization_id = current_organization_id()
    )
  );
CREATE POLICY stock_movements_update ON public.stock_movements FOR UPDATE
  USING (
    has_permission('can_manage_stock', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_movements.stock_item_id
        AND si.organization_id = current_organization_id()
    )
  )
  WITH CHECK (
    has_permission('can_manage_stock', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_movements.stock_item_id
        AND si.organization_id = current_organization_id()
    )
  );
CREATE POLICY stock_movements_delete ON public.stock_movements FOR DELETE
  USING (
    has_permission('can_manage_stock', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.stock_items si
      WHERE si.id = stock_movements.stock_item_id
        AND si.organization_id = current_organization_id()
    )
  );

-- accounting
DROP POLICY IF EXISTS invoices_select ON public.invoices;
DROP POLICY IF EXISTS invoices_insert ON public.invoices;
DROP POLICY IF EXISTS invoices_update ON public.invoices;
DROP POLICY IF EXISTS invoices_delete ON public.invoices;
CREATE POLICY invoices_select ON public.invoices FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'view'));
CREATE POLICY invoices_insert ON public.invoices FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));
CREATE POLICY invoices_update ON public.invoices FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));
CREATE POLICY invoices_delete ON public.invoices FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));

DROP POLICY IF EXISTS expenses_select ON public.expenses;
DROP POLICY IF EXISTS expenses_insert ON public.expenses;
DROP POLICY IF EXISTS expenses_update ON public.expenses;
DROP POLICY IF EXISTS expenses_delete ON public.expenses;
CREATE POLICY expenses_select ON public.expenses FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'view'));
CREATE POLICY expenses_insert ON public.expenses FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));
CREATE POLICY expenses_update ON public.expenses FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));
CREATE POLICY expenses_delete ON public.expenses FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_manage_accounting', 'edit'));

DROP POLICY IF EXISTS payments_all ON public.payments;
DROP POLICY IF EXISTS payments_select ON public.payments;
DROP POLICY IF EXISTS payments_write ON public.payments;
CREATE POLICY payments_select ON public.payments FOR SELECT
  USING (
    has_permission('can_manage_accounting', 'view')
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND i.organization_id = current_organization_id()
    )
  );
CREATE POLICY payments_insert ON public.payments FOR INSERT
  WITH CHECK (
    has_permission('can_manage_accounting', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND i.organization_id = current_organization_id()
    )
  );
CREATE POLICY payments_update ON public.payments FOR UPDATE
  USING (
    has_permission('can_manage_accounting', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND i.organization_id = current_organization_id()
    )
  )
  WITH CHECK (
    has_permission('can_manage_accounting', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND i.organization_id = current_organization_id()
    )
  );
CREATE POLICY payments_delete ON public.payments FOR DELETE
  USING (
    has_permission('can_manage_accounting', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND i.organization_id = current_organization_id()
    )
  );

-- prescriptions
DROP POLICY IF EXISTS prescriptions_select ON public.prescriptions;
DROP POLICY IF EXISTS prescriptions_insert ON public.prescriptions;
DROP POLICY IF EXISTS prescriptions_update ON public.prescriptions;
DROP POLICY IF EXISTS prescriptions_delete ON public.prescriptions;
CREATE POLICY prescriptions_select ON public.prescriptions FOR SELECT
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'view'));
CREATE POLICY prescriptions_insert ON public.prescriptions FOR INSERT
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));
CREATE POLICY prescriptions_update ON public.prescriptions FOR UPDATE
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'))
  WITH CHECK (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));
CREATE POLICY prescriptions_delete ON public.prescriptions FOR DELETE
  USING (organization_id = current_organization_id() AND has_permission('can_create_consultations', 'edit'));

DROP POLICY IF EXISTS rx_meds_select ON public.prescription_medications;
DROP POLICY IF EXISTS rx_meds_insert ON public.prescription_medications;
DROP POLICY IF EXISTS rx_meds_update ON public.prescription_medications;
DROP POLICY IF EXISTS rx_meds_delete ON public.prescription_medications;
CREATE POLICY rx_meds_select ON public.prescription_medications FOR SELECT
  USING (
    has_permission('can_create_consultations', 'view')
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_medications.prescription_id
        AND p.organization_id = current_organization_id()
    )
  );
CREATE POLICY rx_meds_insert ON public.prescription_medications FOR INSERT
  WITH CHECK (
    has_permission('can_create_consultations', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_medications.prescription_id
        AND p.organization_id = current_organization_id()
    )
  );
CREATE POLICY rx_meds_update ON public.prescription_medications FOR UPDATE
  USING (
    has_permission('can_create_consultations', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_medications.prescription_id
        AND p.organization_id = current_organization_id()
    )
  )
  WITH CHECK (
    has_permission('can_create_consultations', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_medications.prescription_id
        AND p.organization_id = current_organization_id()
    )
  );
CREATE POLICY rx_meds_delete ON public.prescription_medications FOR DELETE
  USING (
    has_permission('can_create_consultations', 'edit')
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_medications.prescription_id
        AND p.organization_id = current_organization_id()
    )
  );

-- invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_invitations_admin_all ON public.user_invitations;
CREATE POLICY user_invitations_admin_all ON public.user_invitations
  FOR ALL
  USING (organization_id = current_organization_id() AND public.is_org_admin())
  WITH CHECK (organization_id = current_organization_id() AND public.is_org_admin());

-- Revoke anon EXECUTE on sensitive admin RPCs
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND (
        p.proname LIKE 'admin_%'
        OR p.proname IN (
          'sync_plan_storage_to_orgs',
          'log_admin_action',
          'impersonate_start',
          'impersonate_stop'
        )
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
  END LOOP;
END $$;
