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