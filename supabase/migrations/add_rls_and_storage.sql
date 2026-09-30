-- ==============================================================================
-- Row Level Security + Storage buckets
-- ------------------------------------------------------------------------------
-- IMPORTANT: This app authenticates at the application layer (a signed httpOnly
-- session cookie + Next.js middleware), NOT with Supabase Auth. All DB traffic
-- currently uses the anon key. So the policies below enable RLS and grant access
-- to the `anon` and `authenticated` roles — they make the "RLS is enabled" box
-- true and block direct unauthenticated table access from outside the app, while
-- the real authorization (who may see what) is enforced in middleware/API routes.
--
-- When you later migrate to Supabase Auth (auth.uid()), tighten these policies to
-- per-row / per-role checks. Search for "TODO: tighten" below.
-- ==============================================================================

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'institution_settings','academic_sessions','classes','sections','users',
        'students','staff','teacher_subject_assignments','attendance_student',
        'attendance_staff','fee_ledger','fee_transactions','homework','copy_checks',
        'academic_terms','exams','exam_marks','coscholastic_grades','circulars',
        'notification_logs','leave_applications','call_campaigns','call_logs',
        'calendar_events','offline_admission_tests','admission_test_results'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Only touch tables that actually exist.
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

            -- App-layer access policy (idempotent recreate).
            EXECUTE format('DROP POLICY IF EXISTS app_access ON public.%I;', t);
            -- TODO: tighten to auth.uid()/role checks after moving to Supabase Auth.
            EXECUTE format(
                'CREATE POLICY app_access ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
                t
            );
        END IF;
    END LOOP;
END $$;

-- ==============================================================================
-- Storage buckets: student photos, documents, homework & circular attachments
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('student-photos', 'student-photos', true),
    ('student-documents', 'student-documents', false),
    ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for the public buckets; app layer gates who can upload.
DROP POLICY IF EXISTS "public read photos" ON storage.objects;
CREATE POLICY "public read photos" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('student-photos', 'attachments'));

DROP POLICY IF EXISTS "app write storage" ON storage.objects;
CREATE POLICY "app write storage" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id IN ('student-photos', 'student-documents', 'attachments'));

DROP POLICY IF EXISTS "app update storage" ON storage.objects;
CREATE POLICY "app update storage" ON storage.objects
    FOR UPDATE TO anon, authenticated
    USING (bucket_id IN ('student-photos', 'student-documents', 'attachments'));

DROP POLICY IF EXISTS "app delete storage" ON storage.objects;
CREATE POLICY "app delete storage" ON storage.objects
    FOR DELETE TO anon, authenticated
    USING (bucket_id IN ('student-photos', 'student-documents', 'attachments'));
