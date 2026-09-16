-- ==============================================================================
-- SchoolDesk ERP (PostgreSQL / Supabase Production Schema)
-- Institution: Mother Teresa Nobles Academy Sr. Sec. School, Barmer
-- Account Code: SLRJ0402749 | School Code: 1040211 | CBSE Affiliation: 1730045
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. INSTITUTION & ACADEMIC SESSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS institution_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name VARCHAR(255) NOT NULL DEFAULT 'Mother Teresa Nobles Academy Sr. Sec. School',
    school_code VARCHAR(50) NOT NULL DEFAULT '1040211',
    account_code VARCHAR(50) NOT NULL UNIQUE DEFAULT 'SLRJ0402749',
    affiliation_no VARCHAR(100) DEFAULT 'CBSE-1730045',
    address TEXT DEFAULT 'RAM NAGAR, Barmer, Rajasthan 344001',
    contact_phone VARCHAR(20) DEFAULT '8769444584',
    contact_email VARCHAR(150) DEFAULT 'mtnabarmer@gmail.com',
    active_session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    sms_wallet_balance INTEGER NOT NULL DEFAULT 5153,
    dlt_entity_id VARCHAR(100) DEFAULT '1401568294901',
    director_otp_mobile VARCHAR(20) DEFAULT '8769444584',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_code VARCHAR(20) NOT NULL UNIQUE, -- '2026-2027'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    is_admission_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- '10th', '12th - Science'
    order_seq INTEGER NOT NULL,
    wing VARCHAR(30) DEFAULT 'Secondary', -- 'Pre-Primary', 'Primary', 'Middle', 'Secondary', 'Senior Secondary'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL, -- 'A', 'B', 'C'
    max_capacity INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, name)
);

-- ==============================================================================
-- 2. USER AUTHENTICATION & ROLE-BASED ACCESS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE,
    admission_no VARCHAR(50) UNIQUE,
    employee_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'teacher', 'exam_cell', 'accountant', 'parent', 'student')),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_admission_no ON users(admission_no);
CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);

-- ==============================================================================
-- 3. STUDENTS MASTER TABLE (9-Way Search Indexed)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sr_no VARCHAR(50) NOT NULL UNIQUE,
    admission_no VARCHAR(50) NOT NULL UNIQUE,
    pen_no VARCHAR(50) UNIQUE,
    name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(20),
    class VARCHAR(50) NOT NULL,
    section VARCHAR(20) NOT NULL,
    class_sec VARCHAR(50) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    mother_name VARCHAR(150),
    guardian_name VARCHAR(150),
    contact VARCHAR(20) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    address TEXT,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    category VARCHAR(20) DEFAULT 'General',
    house VARCHAR(50),
    transport_opted BOOLEAN DEFAULT FALSE,
    bus_route VARCHAR(150),
    photo_url TEXT,
    sibling_family_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'TC Issued')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9-Way Search Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_name ON students(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_students_sr_no ON students(sr_no);
CREATE INDEX IF NOT EXISTS idx_students_guardian ON students(LOWER(guardian_name));
CREATE INDEX IF NOT EXISTS idx_students_contact ON students(contact, mobile);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_admission ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(class, section);
CREATE INDEX IF NOT EXISTS idx_students_pen ON students(pen_no);

-- ==============================================================================
-- 4. STAFF & FACULTY MASTER TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    qualification VARCHAR(150),
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Relieved')),
    biometric_enrolled BOOLEAN DEFAULT FALSE,
    biometric_user_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_sec VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    is_class_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, class_sec, subject)
);

-- ==============================================================================
-- 5. ATTENDANCE & BIOMETRIC SYSTEM
-- ==============================================================================
CREATE TABLE IF NOT EXISTS attendance_student (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave', 'HalfDay', 'Unmarked')),
    remarks VARCHAR(255),
    marked_by UUID REFERENCES users(id),
    sms_alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS attendance_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'On Leave', 'Half Day', 'Unmarked')),
    in_time TIME,
    out_time TIME,
    device_id VARCHAR(50) DEFAULT 'CEXJ232160976',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, attendance_date)
);

-- ==============================================================================
-- 6. INSTITUTIONAL FEE LEDGER & TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS fee_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_fee NUMERIC(10, 2) DEFAULT 0.00,
    balance_fee NUMERIC(10, 2) GENERATED ALWAYS AS (total_fee - paid_fee - discount_fee) STORED,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, session)
);

CREATE TABLE IF NOT EXISTS fee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('UPI / QR', 'Cash', 'Cheque / DD', 'POS Machine', 'Razorpay Online')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    installment_name VARCHAR(100) NOT NULL,
    transaction_ref VARCHAR(100),
    collected_by UUID REFERENCES users(id),
    sms_receipt_sent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. HOMEWORK & COPY CHECK MODULES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_sec VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    teacher_id UUID REFERENCES staff(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    notify_sms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    chapter_topic VARCHAR(255) NOT NULL,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Excellent', 'Complete', 'Incomplete', 'Not Submitted')),
    remark TEXT,
    checked_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. EXAMINATIONS & MARKS TABULATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- 'Term 1', 'Term 2'
    weightage_percent INTEGER NOT NULL DEFAULT 50,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    term_id UUID REFERENCES academic_terms(id),
    classes_applicable TEXT[] NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    theory_max_marks INTEGER DEFAULT 80,
    passing_percentage INTEGER DEFAULT 33,
    status VARCHAR(30) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    grade VARCHAR(5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id, subject)
);

CREATE TABLE IF NOT EXISTS coscholastic_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    term_id UUID REFERENCES academic_terms(id),
    work_education VARCHAR(5) DEFAULT 'A',
    art_education VARCHAR(5) DEFAULT 'A',
    health_physical VARCHAR(5) DEFAULT 'A',
    discipline VARCHAR(5) DEFAULT 'A',
    teacher_remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, term_id)
);

-- ==============================================================================
-- 9. CIRCULARS & NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS circulars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circular_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    target_audience VARCHAR(100) NOT NULL, -- 'Whole School', 'Classes: 10th, 12th'
    content TEXT NOT NULL,
    channels TEXT[] DEFAULT ARRAY['App', 'Portal'], -- 'App', 'SMS', 'Portal'
    attachment_url TEXT,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by VARCHAR(150) DEFAULT 'Principal Office',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('SMS', 'WhatsApp', 'AppPush')),
    recipient_mobile VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(150),
    dlt_template_id VARCHAR(100),
    message_content TEXT NOT NULL,
    credits_deducted INTEGER DEFAULT 1,
    delivery_status VARCHAR(30) DEFAULT 'Delivered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. LEAVES & TELECALLING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_type VARCHAR(20) NOT NULL CHECK (applicant_type IN ('Student', 'Staff')),
    applicant_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    processed_by VARCHAR(150),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    target_description TEXT NOT NULL,
    total_contacts INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES call_campaigns(id),
    student_id UUID REFERENCES students(id),
    caller_name VARCHAR(150) NOT NULL,
    call_date DATE NOT NULL DEFAULT CURRENT_DATE,
    disposition VARCHAR(100) NOT NULL,
    followup_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. CALENDAR EVENTS & OFFLINE ADMISSION TESTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Holiday', 'Event', 'Exam', 'Meeting', 'Celebration'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    notify_sms BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offline_admission_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(200) NOT NULL,
    class_applicable VARCHAR(50) NOT NULL,
    test_date DATE NOT NULL,
    timing VARCHAR(100),
    venue VARCHAR(150),
    max_marks INTEGER DEFAULT 100,
    passing_marks INTEGER DEFAULT 40,
    status VARCHAR(30) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admission_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES offline_admission_tests(id) ON DELETE CASCADE,
    applicant_no VARCHAR(50) NOT NULL,
    candidate_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Selected' CHECK (status IN ('Selected', 'Waitlisted', 'Not Qualified')),
    admission_offered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
