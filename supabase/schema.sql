-- ==============================================================================
-- SchoolDesk ERP (Single-Tenant PostgreSQL / Supabase Schema)
-- Institution: Mother Teresa Nobles Academy (Account: SLRJ0402749)
-- Designed for 100% Performance, RLS Security & Next.js 14 Integration
-- ==============================================================================

-- 1. INSTITUTION CONFIGURATION
CREATE TABLE IF NOT EXISTS institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(255) NOT NULL DEFAULT 'Mother Teresa Nobles Academy',
    account_code VARCHAR(50) NOT NULL UNIQUE DEFAULT 'SLRJ0402749',
    affiliation_no VARCHAR(100) DEFAULT 'CBSE-1730045',
    active_session VARCHAR(20) NOT NULL DEFAULT '26-27',
    sms_wallet_balance INTEGER NOT NULL DEFAULT 5153,
    dlt_entity_id VARCHAR(100) DEFAULT '1401568294901',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER AUTHENTICATION & ROLE-BASED ACCESS
-- Login via Phone Number OR Admission No / Employee Code (Standard Indian School ERP Pattern)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE,
    admission_no VARCHAR(50) UNIQUE,
    employee_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'teacher', 'accountant', 'parent', 'student')),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_admission_no ON users(admission_no);

-- 3. STUDENTS MASTER TABLE (9-Way Search Indexed)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sr_no VARCHAR(50) NOT NULL UNIQUE,
    admission_no VARCHAR(50) NOT NULL UNIQUE,
    pen_no VARCHAR(50) UNIQUE,
    name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(20),
    class VARCHAR(20) NOT NULL,
    section VARCHAR(20) NOT NULL,
    class_sec VARCHAR(30) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'TC Issued')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast 9-Way Search
CREATE INDEX IF NOT EXISTS idx_students_name ON students(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_students_sr_no ON students(sr_no);
CREATE INDEX IF NOT EXISTS idx_students_guardian ON students(LOWER(guardian_name));
CREATE INDEX IF NOT EXISTS idx_students_contact ON students(contact, mobile);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_admission ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(class, section);
CREATE INDEX IF NOT EXISTS idx_students_pen ON students(pen_no);

-- 4. STAFF MASTER TABLE
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    qualification VARCHAR(150),
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DAILY ATTENDANCE SYSTEM
CREATE TABLE IF NOT EXISTS attendance_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session VARCHAR(20) NOT NULL DEFAULT '26-27',
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave', 'HalfDay', 'Unmarked')),
    remarks VARCHAR(255),
    marked_by UUID REFERENCES users(id),
    sms_alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS attendance_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'On Leave', 'Half Day', 'Unmarked')),
    in_time TIME,
    out_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, attendance_date)
);

-- 6. INSTITUTIONAL FEE LEDGER & TRANSACTIONS
CREATE TABLE IF NOT EXISTS fee_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(20) NOT NULL DEFAULT '26-27',
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_fee NUMERIC(10, 2) DEFAULT 0.00,
    balance_fee NUMERIC(10, 2) GENERATED ALWAYS AS (total_fee - paid_fee - discount_fee) STORED,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, session)
);

CREATE TABLE IF NOT EXISTS fee_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(20) NOT NULL DEFAULT '26-27',
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('UPI / QR', 'Cash', 'Cheque / DD', 'POS Machine', 'Razorpay Online')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    installment_name VARCHAR(100) NOT NULL,
    transaction_ref VARCHAR(100),
    collected_by UUID REFERENCES users(id),
    sms_receipt_sent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GATE PASS SYSTEM (STUDENT & STAFF EARLY EXITS)
CREATE TABLE IF NOT EXISTS gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    departure_time TIME NOT NULL DEFAULT CURRENT_TIME,
    reason TEXT NOT NULL,
    escorted_by VARCHAR(150) NOT NULL,
    authorized_by VARCHAR(100) NOT NULL DEFAULT 'Principal / Admin',
    security_verified BOOLEAN DEFAULT TRUE,
    sms_notified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SMS & WHATSAPP NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('SMS', 'WhatsApp')),
    campaign_name VARCHAR(150) NOT NULL,
    recipient_mobile VARCHAR(20) NOT NULL,
    recipient_type VARCHAR(50) NOT NULL, -- 'Student', 'Staff', 'Parent'
    dlt_template_id VARCHAR(100),
    message_content TEXT NOT NULL,
    credits_deducted INTEGER DEFAULT 1,
    delivery_status VARCHAR(30) DEFAULT 'Delivered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
