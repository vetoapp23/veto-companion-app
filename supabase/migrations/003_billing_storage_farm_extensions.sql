-- Billing, storage, farm extensions + super_admin role

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'assistant', 'super_admin'));

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  storage_mb integer NOT NULL DEFAULT 200,
  max_clients integer,
  max_animals integer,
  max_users integer NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  prices jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_highlighted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_code text NOT NULL REFERENCES public.subscription_plans(code),
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  currency text NOT NULL DEFAULT 'MAD',
  storage_quota_mb integer NOT NULL DEFAULT 200,
  storage_addon_mb integer NOT NULL DEFAULT 0,
  extra_users integer NOT NULL DEFAULT 0,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.storage_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'photos',
  bytes_used bigint NOT NULL DEFAULT 0,
  files_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, category)
);

CREATE TABLE IF NOT EXISTS public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  pedigree_depth text NOT NULL DEFAULT '3',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text,
  category text,
  farm_type text,
  animal_count integer NOT NULL DEFAULT 0,
  birth_period text,
  location text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_infrastructures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  infra_type text NOT NULL,
  location text,
  capacity integer,
  surface_sqm numeric,
  photos text[],
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_batch_health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.farm_batches(id) ON DELETE SET NULL,
  intervention_id uuid REFERENCES public.farm_interventions(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  product text,
  dose text,
  affected_count integer,
  cost numeric,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.animal_pedigree (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  animal_id uuid NOT NULL UNIQUE REFERENCES public.animals(id) ON DELETE CASCADE,
  registration_number text,
  pedigree_origin text,
  titles text,
  father_name text,
  father_breed text,
  father_registration text,
  father_animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  mother_name text,
  mother_breed text,
  mother_registration text,
  mother_animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  paternal_grandfather_name text,
  paternal_grandfather_breed text,
  paternal_grandmother_name text,
  paternal_grandmother_breed text,
  maternal_grandfather_name text,
  maternal_grandfather_breed text,
  maternal_grandmother_name text,
  maternal_grandmother_breed text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_dropdown_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  value text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, field_key, value)
);

INSERT INTO public.subscription_plans (code, name, tagline, storage_mb, max_clients, max_animals, max_users, display_order, features, limits, prices)
VALUES
  ('free', 'Découverte', 'Pour démarrer', 200, 10, 25, 1, 0, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('pro', 'Pro', 'Clinique solo', 2048, 500, 2000, 1, 1, '[]'::jsonb, '{"stock":true}'::jsonb, '{}'::jsonb),
  ('pro_plus', 'Pro Plus', 'Avec ferme & compta', 3072, null, null, 1, 2, '[]'::jsonb, '{"farm":true,"stock":true,"accounting":true}'::jsonb, '{}'::jsonb),
  ('duo', 'Duo', '2 utilisateurs', 5120, null, null, 2, 3, '[]'::jsonb, '{"farm":true,"stock":true,"accounting":true}'::jsonb, '{}'::jsonb),
  ('clinic', 'Clinique', 'Multi-utilisateurs', 15360, null, null, 10, 4, '[]'::jsonb, '{"farm":true,"stock":true,"accounting":true}'::jsonb, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = _user_id AND role = 'super_admin' AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = _user_id AND role = _role AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_org(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_all_orgs_storage()
RETURNS TABLE (organization_id uuid, bytes_used bigint, files_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id, SUM(bytes_used)::bigint, SUM(files_count)::bigint
  FROM public.storage_usage
  GROUP BY organization_id;
$$;

CREATE OR REPLACE FUNCTION public.record_storage_change(
  p_category text,
  p_bytes_delta bigint,
  p_files_delta integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id FROM public.user_profiles WHERE id = auth.uid();
  IF v_org_id IS NULL THEN
    RETURN json_build_object('error', 'no_org');
  END IF;

  INSERT INTO public.storage_usage (organization_id, category, bytes_used, files_count)
  VALUES (v_org_id, p_category, GREATEST(p_bytes_delta, 0), GREATEST(p_files_delta, 0))
  ON CONFLICT (organization_id, category) DO UPDATE SET
    bytes_used = GREATEST(0, public.storage_usage.bytes_used + p_bytes_delta),
    files_count = GREATEST(0, public.storage_usage.files_count + p_files_delta),
    updated_at = now();

  RETURN json_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_storage_usage()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object('ok', true, 'message', 'manual recompute placeholder');
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_orgs_storage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_storage_change(text, bigint, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_storage_usage() TO authenticated;
