-- Read-only check: which policies still let anon / authenticated / public in?
-- An empty result after 20261116_close_anon_access.sql means the database is closed to the browser key.
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (roles && ARRAY['anon','authenticated','public']::name[])
ORDER BY schemaname, tablename, policyname;

-- Tables in public that still have RLS switched off (should be none).
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;
