-- RLS, RPC functions, views, storage buckets

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antiparasitics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antiparasitic_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Generic org policy helper pattern
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND organization_id = org_id AND status = 'approved'
  );
$$;

-- Organizations
CREATE POLICY org_select ON public.organizations FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(id) OR owner_id = auth.uid());
CREATE POLICY org_insert ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY org_update ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_org_admin() AND public.user_belongs_to_org(id));

-- User profiles
CREATE POLICY profiles_select ON public.user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR (organization_id = public.current_organization_id() AND public.is_org_admin()));
CREATE POLICY profiles_insert ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON public.user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR (organization_id = public.current_organization_id() AND public.is_org_admin()));

-- Org-scoped tables macro via policies
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clients','animals','consultations','vaccinations','antiparasitics',
    'prescriptions','appointments','farms','farm_interventions','suppliers',
    'stock_items','stock_movements','stock_alerts','revenue','expenses','invoices'
  ]
  LOOP
    EXECUTE format('CREATE POLICY %I_select ON public.%I FOR SELECT TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_update ON public.%I FOR UPDATE TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_delete ON public.%I FOR DELETE TO authenticated USING (organization_id = public.current_organization_id())', tbl, tbl);
  END LOOP;
END $$;

-- Prescription medications via prescription org
CREATE POLICY rx_meds_select ON public.prescription_medications FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()
  ));
CREATE POLICY rx_meds_insert ON public.prescription_medications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()
  ));
CREATE POLICY rx_meds_update ON public.prescription_medications FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()
  ));
CREATE POLICY rx_meds_delete ON public.prescription_medications FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id AND p.organization_id = public.current_organization_id()
  ));

-- Payments via invoice
CREATE POLICY payments_all ON public.payments FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.organization_id = public.current_organization_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.organization_id = public.current_organization_id()
  ));

-- Global read protocols
CREATE POLICY vaccination_protocols_read ON public.vaccination_protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY vaccination_protocols_write ON public.vaccination_protocols FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY antiparasitic_protocols_select ON public.antiparasitic_protocols FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY antiparasitic_protocols_write ON public.antiparasitic_protocols FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

-- User-owned settings
CREATE POLICY app_settings_all ON public.app_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY accounting_templates_all ON public.accounting_templates FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY activity_logs_select ON public.user_activity_logs FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id());
CREATE POLICY activity_logs_insert ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_organization_id());

-- RPC: create_user_profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_role text DEFAULT 'assistant',
  p_organization_code text DEFAULT NULL,
  p_clinic_name text DEFAULT NULL,
  p_clinic_address text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_code text;
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.approve_user(user_id_param uuid, approved_by_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.user_profiles
  SET status = 'approved', approved_by = approved_by_param, approved_at = now(), rejection_reason = NULL
  WHERE id = user_id_param AND organization_id = public.current_organization_id();
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_user(user_id_param uuid, rejected_by_param uuid, reason_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.user_profiles
  SET status = 'rejected', approved_by = rejected_by_param, rejection_reason = reason_param
  WHERE id = user_id_param AND organization_id = public.current_organization_id();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_permissions(user_id_param uuid, permissions_param jsonb, updated_by_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.user_profiles
  SET permissions = permissions_param, updated_at = now()
  WHERE id = user_id_param AND organization_id = public.current_organization_id();
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_stock_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.stock_alerts (user_id, item_id, item_name, alert_type, message, severity)
  SELECT si.user_id, si.id, si.name, 'low_stock',
         format('Stock bas pour %s (%s restants)', si.name, si.current_quantity),
         CASE WHEN si.current_quantity <= 0 THEN 'critical' ELSE 'high' END
  FROM public.stock_items si
  WHERE si.organization_id = public.current_organization_id()
    AND si.active = true
    AND si.current_quantity <= si.minimum_quantity
    AND NOT EXISTS (
      SELECT 1 FROM public.stock_alerts sa
      WHERE sa.item_id = si.id AND sa.alert_type = 'low_stock' AND sa.is_read = false
    );
END;
$$;

-- Views
CREATE OR REPLACE VIEW public.animal_medical_summary AS
SELECT
  a.id AS animal_id,
  a.name AS animal_name,
  a.species,
  a.breed,
  (c.first_name || ' ' || c.last_name) AS owner_name,
  (SELECT count(*)::int FROM public.consultations co WHERE co.animal_id = a.id) AS total_consultations,
  (SELECT max(co.consultation_date) FROM public.consultations co WHERE co.animal_id = a.id) AS last_consultation,
  (SELECT count(*)::int FROM public.vaccinations v WHERE v.animal_id = a.id) AS total_vaccinations,
  (SELECT max(v.vaccination_date) FROM public.vaccinations v WHERE v.animal_id = a.id) AS last_vaccination,
  (SELECT count(*)::int FROM public.prescriptions p WHERE p.animal_id = a.id AND p.status = 'active') AS active_prescriptions,
  (SELECT count(*)::int FROM public.appointments ap WHERE ap.animal_id = a.id AND ap.status IN ('scheduled', 'confirmed')) AS upcoming_appointments
FROM public.animals a
JOIN public.clients c ON c.id = a.client_id;

CREATE OR REPLACE VIEW public.vaccination_reminders AS
SELECT
  v.id,
  a.name AS animal_name,
  (c.first_name || ' ' || c.last_name) AS owner_name,
  c.phone,
  c.email,
  v.vaccine_name,
  v.next_due_date,
  CASE
    WHEN v.next_due_date < CURRENT_DATE THEN 'Overdue'
    WHEN v.next_due_date <= CURRENT_DATE + 14 THEN 'Due Soon'
    ELSE 'Upcoming'
  END AS reminder_status
FROM public.vaccinations v
JOIN public.animals a ON a.id = v.animal_id
JOIN public.clients c ON c.id = a.client_id
WHERE v.next_due_date IS NOT NULL;

CREATE OR REPLACE VIEW public.financial_dashboard AS
SELECT
  COALESCE((SELECT sum(amount) FROM public.revenue r WHERE r.organization_id = public.current_organization_id()), 0) AS total_revenue,
  COALESCE((SELECT sum(amount) FROM public.expenses e WHERE e.organization_id = public.current_organization_id()), 0) AS total_expenses,
  COALESCE((SELECT sum(amount) FROM public.revenue r WHERE r.organization_id = public.current_organization_id()), 0)
    - COALESCE((SELECT sum(amount) FROM public.expenses e WHERE e.organization_id = public.current_organization_id()), 0) AS net_income;

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT count(*)::int FROM public.user_profiles up WHERE up.organization_id = public.current_organization_id()) AS total_users,
  (SELECT count(*)::int FROM public.user_profiles up WHERE up.organization_id = public.current_organization_id() AND up.status = 'pending') AS pending_users,
  (SELECT count(*)::int FROM public.clients cl WHERE cl.organization_id = public.current_organization_id()) AS total_clients,
  (SELECT count(*)::int FROM public.animals an WHERE an.organization_id = public.current_organization_id()) AS total_animals;

-- Storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('animal-photos', 'animal-photos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY animal_photos_public_read ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'animal-photos');
CREATE POLICY animal_photos_auth_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'animal-photos');
CREATE POLICY animal_photos_auth_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'animal-photos');
CREATE POLICY animal_photos_auth_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'animal-photos');

-- Realtime publication for app tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.animals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.vaccinations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
