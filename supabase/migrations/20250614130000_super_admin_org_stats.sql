-- Stats agrégées par organisation pour la console Super Admin (contourne RLS en toute sécurité)

CREATE OR REPLACE FUNCTION public.get_all_orgs_usage_stats()
RETURNS TABLE (
  organization_id uuid,
  clients_count bigint,
  animals_count bigint,
  users_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès réservé au super administrateur';
  END IF;

  RETURN QUERY
  SELECT
    o.id AS organization_id,
    COALESCE(c.cnt, 0)::bigint AS clients_count,
    COALESCE(a.cnt, 0)::bigint AS animals_count,
    COALESCE(u.cnt, 0)::bigint AS users_count
  FROM organizations o
  LEFT JOIN (
    SELECT organization_id, COUNT(*) AS cnt FROM clients GROUP BY organization_id
  ) c ON c.organization_id = o.id
  LEFT JOIN (
    SELECT organization_id, COUNT(*) AS cnt FROM animals GROUP BY organization_id
  ) a ON a.organization_id = o.id
  LEFT JOIN (
    SELECT organization_id, COUNT(*) AS cnt
    FROM user_profiles
    WHERE status = 'approved'
    GROUP BY organization_id
  ) u ON u.organization_id = o.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_orgs_usage_stats() TO authenticated;
