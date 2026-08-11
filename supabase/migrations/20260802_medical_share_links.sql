-- Medical dossier transfer via opaque share token (QR -> URL)
-- Applied remotely via Supabase MCP; kept here for repo parity.

CREATE TABLE IF NOT EXISTS public.medical_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id uuid REFERENCES public.animals(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  consent_confirmed boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  max_uses integer NOT NULL DEFAULT 5 CHECK (max_uses >= 1 AND max_uses <= 50),
  use_count integer NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS medical_share_links_token_idx ON public.medical_share_links(token);
CREATE INDEX IF NOT EXISTS medical_share_links_org_idx ON public.medical_share_links(organization_id);
CREATE INDEX IF NOT EXISTS medical_share_links_expires_idx ON public.medical_share_links(expires_at);

ALTER TABLE public.medical_share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medical_share_links_select_own_org ON public.medical_share_links;
CREATE POLICY medical_share_links_select_own_org ON public.medical_share_links
  FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id());

GRANT SELECT ON public.medical_share_links TO authenticated;
GRANT ALL ON public.medical_share_links TO service_role;

-- Token generation must use extensions.gen_random_bytes (Supabase schema),
-- because search_path is set to 'public' on SECURITY DEFINER RPCs.
-- See create_medical_share / get_medical_share / import_medical_share on remote.
