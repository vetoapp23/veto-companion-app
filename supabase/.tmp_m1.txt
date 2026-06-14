-- VetPro CRM schema (reconstructed from application code)
-- Note: dashboard backup contained only system schemas, no public app tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helpers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_name text NOT NULL,
  clinic_address text,
  phone text,
  email text,
  invitation_code text UNIQUE,
  business_hours jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text,
  full_name text,
  role text NOT NULL CHECK (role IN ('admin', 'assistant')),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  last_login timestamptz,
  permissions jsonb DEFAULT '{}'::jsonb,
  avatar_url text,
  phone text,
  address text,
  specialty text,
  experience text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$;

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  mobile_phone text,
  address text,
  city text NOT NULL DEFAULT 'Rabat',
  postal_code text,
  country text NOT NULL DEFAULT 'Maroc',
  notes text,
  client_type text NOT NULL DEFAULT 'particulier' CHECK (client_type IN ('particulier', 'eleveur', 'ferme')),
  status text NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'suspendu')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Animals
CREATE TABLE IF NOT EXISTS public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  color text,
  sex text CHECK (sex IN ('Mâle', 'Femelle', 'Inconnu')),
  weight numeric,
  height numeric,
  birth_date date,
  microchip_number text,
  tattoo_number text,
  sterilized boolean NOT NULL DEFAULT false,
  sterilization_date date,
  status text NOT NULL DEFAULT 'vivant' CHECK (status IN ('vivant', 'décédé', 'perdu')),
  death_date date,
  death_cause text,
  notes text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  veterinarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  consultation_date timestamptz NOT NULL DEFAULT now(),
  consultation_type text NOT NULL,
  symptoms text,
  diagnosis text,
  treatment text,
  notes text,
  weight numeric,
  temperature numeric,
  heart_rate integer,
  respiratory_rate integer,
  photos text[] DEFAULT '{}',
  follow_up_date date,
  follow_up_notes text,
  status text NOT NULL DEFAULT 'completed',
  cost numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  vaccine_name text NOT NULL,
  vaccine_type text,
  batch_number text,
  manufacturer text,
  vaccination_date date NOT NULL,
  next_due_date date,
  administered_by text,
  notes text,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vaccination protocols (global)
CREATE TABLE IF NOT EXISTS public.vaccination_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species text NOT NULL,
  vaccine_name text NOT NULL,
  vaccine_type text NOT NULL,
  age_recommendation text,
  frequency text,
  duration_days integer,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Antiparasitics
CREATE TABLE IF NOT EXISTS public.antiparasitics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  active_ingredient text,
  parasite_type text,
  administration_route text,
  dosage text,
  treatment_date date NOT NULL,
  next_treatment_date date,
  administered_by text,
  effectiveness_rating integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Antiparasitic protocols
CREATE TABLE IF NOT EXISTS public.antiparasitic_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  species text NOT NULL,
  parasite_type text NOT NULL,
  product_name text NOT NULL,
  active_ingredient text,
  administration_route text,
  dosage_per_kg text,
  frequency text,
  age_restriction text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  veterinarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  prescription_date date NOT NULL DEFAULT CURRENT_DATE,
  diagnosis text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  refill_count integer NOT NULL DEFAULT 0,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescription_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  stock_item_id uuid,
  medication_name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  quantity numeric NOT NULL DEFAULT 1,
  instructions text,
  route text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  veterinarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  appointment_type text NOT NULL CHECK (appointment_type IN ('consultation', 'vaccination', 'surgery', 'follow-up')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
  notes text,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Farms
CREATE TABLE IF NOT EXISTS public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  farm_name text NOT NULL,
  farm_type text,
  registration_number text,
  address text,
  phone text,
  email text,
  herd_size integer,
  certifications text[],
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farm_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  veterinarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  intervention_date date NOT NULL,
  intervention_type text NOT NULL,
  animal_count integer,
  description text,
  diagnosis text,
  treatment text,
  medications_used text[],
  cost numeric,
  follow_up_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stock
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'unit',
  current_quantity numeric NOT NULL DEFAULT 0,
  minimum_quantity numeric NOT NULL DEFAULT 0,
  maximum_quantity numeric,
  unit_cost numeric,
  selling_price numeric,
  supplier text,
  batch_number text,
  expiration_date date,
  location text,
  requires_prescription boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prescription_medications
  ADD CONSTRAINT prescription_medications_stock_item_id_fkey
  FOREIGN KEY (stock_item_id) REFERENCES public.stock_items(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id uuid NOT NULL REFERENCES public.stock_items(id) ON DELETE CASCADE,
  item_name text,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity numeric NOT NULL,
  reason text,
  reference text,
  performed_by text,
  movement_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.stock_items(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expired', 'expiring_soon')),
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Accounting
CREATE TABLE IF NOT EXISTS public.revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  revenue_date date NOT NULL,
  source text NOT NULL,
  category text,
  description text NOT NULL,
  amount numeric NOT NULL,
  tax_amount numeric,
  payment_method text,
  reference_id uuid,
  reference_type text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  expense_date date NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  amount numeric NOT NULL,
  payment_method text,
  supplier_name text,
  receipt_number text,
  tax_amount numeric,
  is_deductible boolean NOT NULL DEFAULT true,
  notes text,
  attachment_url text,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL,
  due_date date,
  total_amount numeric NOT NULL,
  tax_amount numeric,
  discount_amount numeric,
  status text NOT NULL DEFAULT 'pending',
  payment_date date,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('revenue', 'expense')),
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'annual', 'occasional')),
  description text NOT NULL,
  amount numeric NOT NULL,
  source text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- App settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  setting_category text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, setting_category, setting_key)
);

-- Audit / activity
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'assistant')),
  permissions jsonb DEFAULT '{}'::jsonb,
  invitation_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_animals_org ON public.animals(organization_id);
CREATE INDEX IF NOT EXISTS idx_consultations_org ON public.consultations(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON public.appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON public.user_profiles(organization_id);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations','user_profiles','clients','animals','consultations','vaccinations',
    'vaccination_protocols','antiparasitics','antiparasitic_protocols','prescriptions',
    'appointments','farms','farm_interventions','suppliers','stock_items','revenue',
    'expenses','invoices','accounting_templates','app_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;
