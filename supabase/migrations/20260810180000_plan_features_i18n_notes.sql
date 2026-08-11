-- Document marketing features shape for subscription_plans.features:
-- {
--   "name": { "fr": "...", "en": "...", "es": "..." },
--   "tagline": { "fr": "...", "en": "...", "es": "..." },
--   "notes": { "fr": ["..."], "en": ["..."], "es": ["..."] }
-- }
-- Quotas + module limits are auto-rendered on landing/pricing from columns + limits jsonb.

-- No schema change required (features already jsonb).
SELECT 1;
