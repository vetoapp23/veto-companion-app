-- Public read of active packs + restore marketing content

DROP POLICY IF EXISTS subscription_plans_read ON public.subscription_plans;
CREATE POLICY subscription_plans_read
  ON public.subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

UPDATE public.subscription_plans SET
  tagline = 'Pour tester gratuitement',
  description = 'Idéal pour démarrer et tester la plateforme',
  prices = '{"yearly": {"EUR": 0, "MAD": 0, "USD": 0}, "monthly": {"EUR": 0, "MAD": 0, "USD": 0}}'::jsonb,
  features = '["10 clients max", "10 animaux max", "1 utilisateur", "Consultations & antiparasites", "1 seule ferme", "200 Mo stockage photos", "Ordonnances basiques (avec filigrane)"]'::jsonb,
  max_clients = 10, max_animals = 10, max_users = 1, storage_mb = 200,
  is_highlighted = false, display_order = 1, updated_at = now()
WHERE code = 'free';

UPDATE public.subscription_plans SET
  tagline = 'Pour le vétérinaire indépendant',
  description = 'Pour un cabinet géré par un seul vétérinaire',
  prices = '{"yearly": {"EUR": 240, "MAD": 2400, "USD": 260}, "monthly": {"EUR": 25, "MAD": 250, "USD": 27}}'::jsonb,
  features = '["Clients & animaux illimités", "1 utilisateur", "Consultations, vaccinations, antiparasites", "Stock & ordonnances PDF personnalisées", "2 Go stockage photos", "Rappels vaccinations par email", "Support par email"]'::jsonb,
  max_clients = null, max_animals = null, max_users = 1, storage_mb = 2048,
  is_highlighted = false, display_order = 2,
  limits = jsonb_build_object('stock', true), updated_at = now()
WHERE code = 'pro';

UPDATE public.subscription_plans SET
  tagline = 'Vétérinaire + gestion de ferme & compta',
  description = 'Pack Pro enrichi avec fermes et comptabilité',
  prices = '{"yearly": {"EUR": 288, "MAD": 2880, "USD": 310}, "monthly": {"EUR": 30, "MAD": 300, "USD": 32}}'::jsonb,
  features = '["Tout du pack Pro", "Gestion complète des fermes & élevages", "Comptabilité complète", "3 Go stockage photos", "Statistiques avancées", "Support par email"]'::jsonb,
  max_clients = null, max_animals = null, max_users = 1, storage_mb = 3072,
  is_highlighted = true, display_order = 3,
  limits = jsonb_build_object('farm', true, 'stock', true, 'accounting', true), updated_at = now()
WHERE code = 'pro_plus';

UPDATE public.subscription_plans SET
  tagline = 'Vétérinaire + assistant(e)',
  description = 'Parfait pour un cabinet avec un(e) assistant(e)',
  prices = '{"yearly": {"EUR": 336, "MAD": 3360, "USD": 365}, "monthly": {"EUR": 35, "MAD": 350, "USD": 38}}'::jsonb,
  features = '["Tout du pack Pro Plus", "2 utilisateurs (véto + assistant)", "5 Go stockage photos", "Sauvegardes hebdomadaires", "Support email prioritaire"]'::jsonb,
  max_clients = null, max_animals = null, max_users = 2, storage_mb = 5120,
  is_highlighted = false, display_order = 4,
  limits = jsonb_build_object('farm', true, 'stock', true, 'accounting', true), updated_at = now()
WHERE code = 'duo';

UPDATE public.subscription_plans SET
  tagline = 'Pour les cliniques multi-praticiens',
  description = 'Conçu pour les cliniques avec plusieurs praticiens',
  prices = '{"yearly": {"EUR": 960, "MAD": 9600, "USD": 1040}, "monthly": {"EUR": 100, "MAD": 1000, "USD": 108}}'::jsonb,
  features = '["Tout du pack Duo", "6 utilisateurs inclus (extensible)", "Rôles & permissions granulaires", "15 Go stockage photos", "Rappels par email + SMS", "Exports comptables avancés", "Sauvegardes quotidiennes", "Support dédié"]'::jsonb,
  max_clients = null, max_animals = null, max_users = 6, storage_mb = 15360,
  is_highlighted = false, display_order = 5,
  limits = jsonb_build_object('farm', true, 'stock', true, 'accounting', true), updated_at = now()
WHERE code = 'clinic';
