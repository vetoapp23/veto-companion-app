-- Short human-enterable code for medical dossier transfer
ALTER TABLE public.medical_share_links
  ADD COLUMN IF NOT EXISTS short_code text;

-- Full function updates applied remotely via MCP migration medical_share_short_code
-- (generate_medical_share_short_code, create/get/import_medical_share)
