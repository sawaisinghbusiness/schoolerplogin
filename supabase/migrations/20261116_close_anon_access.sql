-- ==============================================================================
-- Close direct database access for the anon / authenticated roles (2026-11-16)
-- ------------------------------------------------------------------------------
-- add_rls_and_storage.sql (and setup_all.sql) created `app_access` policies
-- "FOR ALL TO anon, authenticated USING (true)" on every table, plus storage
-- insert/update/delete for anon. The anon key was in the ERP web bundle, so anyone
-- could read or change students, fees and users (with password hashes) through
-- Supabase REST, skipping the backend's role checks.
--
-- Nothing needs those policies: the backend (sms backend) uses the service-role
-- key, which bypasses RLS, and the web and phone apps talk only to the backend.
-- RLS stays ON with no policies, so anon/authenticated get nothing.
--
-- Run once in the Supabase SQL editor. Check first with check_anon_access.sql.
-- ==============================================================================

-- 1) Drop every policy in `public` that lets anon or authenticated in.
DO $$
DECLARE
    p RECORD;
BEGIN
    FOR p IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (roles && ARRAY['anon','authenticated']::name[] OR roles && ARRAY['public']::name[])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', p.policyname, p.schemaname, p.tablename);
    END LOOP;
END $$;

-- 2) Make sure RLS is on for every public table (no policy = no anon access).
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t.tablename);
    END LOOP;
END $$;

-- 3) Storage: anon may no longer upload, overwrite or delete files.
--    Public buckets (student-photos, attachments) still serve their public URLs.
DROP POLICY IF EXISTS "app write storage" ON storage.objects;
DROP POLICY IF EXISTS "app update storage" ON storage.objects;
DROP POLICY IF EXISTS "app delete storage" ON storage.objects;
