-- Medical share: longer short codes + restricted anonymous PHI disclosure

CREATE OR REPLACE FUNCTION public.generate_medical_share_short_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  b int;
BEGIN
  LOOP
    v_code := '';
    FOR i IN 1..10 LOOP
      b := get_byte(extensions.gen_random_bytes(1), 0);
      v_code := v_code || substr(v_chars, (b % length(v_chars)) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.medical_share_links WHERE upper(short_code) = v_code
    );
  END LOOP;
  RETURN v_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_medical_share(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.medical_share_links%ROWTYPE;
  v_owner jsonb;
  v_animal jsonb;
  v_valid boolean;
  v_raw text := trim(COALESCE(p_token, ''));
  v_key text := upper(v_raw);
  v_authed boolean := auth.uid() IS NOT NULL;
  v_matched_by_token boolean := false;
  v_summary jsonb;
BEGIN
  IF length(v_key) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Code ou lien invalide');
  END IF;

  SELECT * INTO v_row
  FROM public.medical_share_links
  WHERE token = v_raw
     OR upper(short_code) = v_key
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Lien ou code introuvable');
  END IF;

  v_matched_by_token := (v_row.token = v_raw);

  v_valid :=
    v_row.revoked_at IS NULL
    AND v_row.expires_at > now()
    AND v_row.use_count < v_row.max_uses;

  v_owner := COALESCE(v_row.payload->'owner', '{}'::jsonb);
  v_animal := COALESCE(v_row.payload->'animal', '{}'::jsonb);

  IF v_authed THEN
    v_summary := jsonb_build_object(
      'owner_name', trim(concat(COALESCE(v_owner->>'first_name',''), ' ', COALESCE(v_owner->>'last_name',''))),
      'animal_name', v_animal->>'name',
      'species', v_animal->>'species',
      'breed', v_animal->>'breed',
      'microchip_number', v_animal->>'microchip_number',
      'vaccinations_count', COALESCE(jsonb_array_length(v_row.payload->'vaccinations'), 0),
      'antiparasitics_count', COALESCE(jsonb_array_length(v_row.payload->'antiparasitics'), 0),
      'consultations_count', COALESCE(jsonb_array_length(v_row.payload->'consultations'), 0)
    );
  ELSE
    v_summary := jsonb_build_object(
      'owner_name', NULL,
      'animal_name', v_animal->>'name',
      'species', v_animal->>'species',
      'breed', v_animal->>'breed',
      'microchip_number', NULL,
      'vaccinations_count', COALESCE(jsonb_array_length(v_row.payload->'vaccinations'), 0),
      'antiparasitics_count', COALESCE(jsonb_array_length(v_row.payload->'antiparasitics'), 0),
      'consultations_count', COALESCE(jsonb_array_length(v_row.payload->'consultations'), 0)
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'valid', v_valid,
    'expired', v_row.expires_at <= now(),
    'revoked', v_row.revoked_at IS NOT NULL,
    'exhausted', v_row.use_count >= v_row.max_uses,
    'expires_at', v_row.expires_at,
    'use_count', CASE WHEN v_authed THEN v_row.use_count ELSE NULL END,
    'max_uses', CASE WHEN v_authed THEN v_row.max_uses ELSE NULL END,
    'short_code', v_row.short_code,
    'token', CASE WHEN v_authed AND v_matched_by_token THEN v_row.token ELSE NULL END,
    'source_clinic_name', v_row.payload->>'source_clinic_name',
    'exported_at', v_row.payload->>'exported_at',
    'summary', v_summary,
    'payload', CASE WHEN v_authed AND v_valid THEN v_row.payload ELSE NULL END,
    'requires_auth_for_import', true
  );
END;
$function$;
