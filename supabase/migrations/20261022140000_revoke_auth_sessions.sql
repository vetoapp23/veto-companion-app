-- Secure session revocation helpers (password-change / device logout).
-- Deletes auth.sessions rows for the caller except the current JWT session.

CREATE OR REPLACE FUNCTION public.revoke_other_auth_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_sid uuid;
  v_deleted integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  BEGIN
    v_sid := NULLIF(auth.jwt() ->> 'session_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_sid := NULL;
  END;

  -- Revoke refresh tokens for sessions we are about to drop
  UPDATE auth.refresh_tokens rt
  SET revoked = true, updated_at = now()
  WHERE rt.session_id IN (
    SELECT s.id
    FROM auth.sessions s
    WHERE s.user_id = v_uid
      AND (v_sid IS NULL OR s.id <> v_sid)
  );

  DELETE FROM auth.sessions s
  WHERE s.user_id = v_uid
    AND (v_sid IS NULL OR s.id <> v_sid);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.revoke_other_auth_sessions() IS
  'Deletes all auth sessions for the current user except the active JWT session_id.';

REVOKE ALL ON FUNCTION public.revoke_other_auth_sessions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_other_auth_sessions() FROM anon;
GRANT EXECUTE ON FUNCTION public.revoke_other_auth_sessions() TO authenticated;

-- Used after password reset: wipe every session for the caller (force re-login everywhere).
CREATE OR REPLACE FUNCTION public.revoke_all_auth_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_deleted integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  UPDATE auth.refresh_tokens rt
  SET revoked = true, updated_at = now()
  WHERE rt.session_id IN (
    SELECT s.id FROM auth.sessions s WHERE s.user_id = v_uid
  )
  OR rt.user_id = v_uid::text;

  DELETE FROM auth.sessions s WHERE s.user_id = v_uid;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.revoke_all_auth_sessions() IS
  'Deletes all auth sessions for the current user (password reset / full lockout).';

REVOKE ALL ON FUNCTION public.revoke_all_auth_sessions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_all_auth_sessions() FROM anon;
GRANT EXECUTE ON FUNCTION public.revoke_all_auth_sessions() TO authenticated;
