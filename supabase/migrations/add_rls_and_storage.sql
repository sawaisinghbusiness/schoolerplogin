-- ==============================================================================
-- Row Level Security + Storage buckets
-- ------------------------------------------------------------------------------
-- RLS is on with NO policy for anon/authenticated (2026-11-16). Only the backend
-- reads and writes, with the service-role key (which bypasses RLS). Earlier versions
-- granted anon full access; 20261116_close_anon_access.sql removes those policies.
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
            -- No policy for anon/authenticated (2026-11-16): only the backend's service-role key reads and writes.
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

-- Uploads go through the backend (service-role key); anon may not write to storage (2026-11-16).
