-- Full module limits per plan + sync storage/overrides on plan change + storage hard cap
-- Applied remotely via MCP as plan_apply_sync_and_enforcement

UPDATE public.subscription_plans SET limits = jsonb_build_object(
  'consultations', true, 'visits', true, 'appointments', true,
  'vaccinations', true, 'antiparasites', true, 'clients', true, 'animals', true,
  'farm', false, 'stock', false, 'accounting', false
) WHERE code = 'free';

UPDATE public.subscription_plans SET limits = jsonb_build_object(
  'consultations', true, 'visits', true, 'appointments', true,
  'vaccinations', true, 'antiparasites', true, 'clients', true, 'animals', true,
  'farm', false, 'stock', true, 'accounting', false
) WHERE code = 'pro';

UPDATE public.subscription_plans SET limits = jsonb_build_object(
  'consultations', true, 'visits', true, 'appointments', true,
  'vaccinations', true, 'antiparasites', true, 'clients', true, 'animals', true,
  'farm', true, 'stock', true, 'accounting', true
) WHERE code IN ('pro_plus', 'duo', 'clinic');

-- See remote for full function bodies:
-- admin_upsert_subscription, admin_record_subscription_payment, record_storage_change
