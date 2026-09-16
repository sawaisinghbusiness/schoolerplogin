-- ==============================================================================
-- Mother Teresa Nobles Academy Sr. Sec. School, Barmer
-- Seed Data for Supabase Initial Database Setup
-- Run this in your Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. INSTITUTION SETTINGS
INSERT INTO institution_settings (
    school_name, school_code, account_code, affiliation_no, address, contact_phone, contact_email, active_session, sms_wallet_balance, dlt_entity_id, director_otp_mobile
) VALUES (
    'Mother Teresa Nobles Academy Sr. Sec. School',
    '1040211',
    'SLRJ0402749',
    'CBSE-1730045',
    'RAM NAGAR, Barmer, Rajasthan 344001',
    '8769444584',
    'mtnabarmer@gmail.com',
    '2026-2027',
    5153,
    '1401568294901',
    '8769444584'
) ON CONFLICT (account_code) DO NOTHING;

-- 2. ACADEMIC SESSIONS
INSERT INTO academic_sessions (session_code, start_date, end_date, is_active, is_admission_open) VALUES
('2026-2027', '2026-04-01', '2027-03-31', TRUE, TRUE),
('2025-2026', '2025-04-01', '2026-03-31', FALSE, FALSE)
ON CONFLICT (session_code) DO NOTHING;

-- 3. USERS (Admin, Teacher, Staff)
INSERT INTO users (phone_number, full_name, role, password_hash, is_active) VALUES
('8769444584', 'Mahendra Parihar (Director/Admin)', 'admin', 'pbkdf2_sha256$mockhash$admin123', TRUE),
('9876543210', 'Kailash Bishnoi (TGT Math)', 'teacher', 'pbkdf2_sha256$mockhash$teacher123', TRUE),
('9414156789', 'Pooja Sharma (TGT English)', 'teacher', 'pbkdf2_sha256$mockhash$teacher123', TRUE)
ON CONFLICT (phone_number) DO NOTHING;

-- 4. STAFF ROSTER
INSERT INTO staff (emp_code, name, department, designation, mobile, email, qualification, joining_date, status, biometric_enrolled, biometric_user_id) VALUES
('T-014', 'Kailash Bishnoi', 'Mathematics', 'TGT Mathematics', '9828456123', 'kailash.math@mtna.in', 'M.Sc. Mathematics, B.Ed', '2021-07-15', 'Active', TRUE, 'BIO-101'),
('T-003', 'Dr. Arvind Rathore', 'Science', 'PGT Chemistry & Science', '9414211223', 'arvind.chem@mtna.in', 'Ph.D Chemistry, B.Ed', '2019-06-10', 'Active', TRUE, 'BIO-102'),
('T-021', 'Pooja Sharma', 'English', 'TGT English Literature', '9876543210', 'pooja.eng@mtna.in', 'M.A. English, B.Ed', '2022-04-01', 'Active', TRUE, 'BIO-103'),
('T-008', 'Anand Soni', 'Commerce', 'PGT Accountancy', '9414122334', 'anand.acc@mtna.in', 'M.Com, B.Ed', '2020-08-01', 'Active', TRUE, 'BIO-104'),
('T-011', 'Bhawani Singh', 'Physical Education', 'PTI Sports Officer', '9784332211', 'bhawani.sports@mtna.in', 'B.P.Ed, M.P.Ed', '2021-09-01', 'Active', TRUE, 'BIO-105')
ON CONFLICT (emp_code) DO NOTHING;

-- 5. STUDENTS
INSERT INTO students (
    sr_no, admission_no, pen_no, name, roll_no, class, section, class_sec, father_name, mother_name, guardian_name, contact, mobile, address, gender, dob, category, house, transport_opted, bus_route, photo_url, status
) VALUES
('SR-2024-001', 'ADM-9102', 'PEN-RJ-2024-819', 'Aarav Sharma', '12', '10th', 'A', '10th - A', 'Rajesh Sharma', 'Sunita Sharma', 'Rajesh Sharma', '9876543210', '9876543210', 'Plot 42, Civil Lines, Barmer', 'Male', '2009-04-12', 'General', 'Tagore', TRUE, 'Route 3 (Station Road)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'),
('SR-2024-002', 'ADM-9103', 'PEN-RJ-2024-820', 'Diya Rathore', '05', '9th', 'B', '9th - B', 'Kalyan Singh Rathore', 'Meenakshi Rathore', 'Kalyan Singh Rathore', '9829012345', '9829012345', 'Opp. Collectorate, Mahaveer Nagar, Barmer', 'Female', '2010-08-25', 'General', 'Ashoka', FALSE, NULL, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Active'),
('SR-2023-114', 'ADM-8451', 'PEN-RJ-2023-412', 'Vikram Choudhary', '21', '12th', 'PCM', '12th - PCM', 'Hanuman Ram Choudhary', 'Geeta Devi', 'Hanuman Ram Choudhary', '9414156789', '9414156789', 'Baldev Nagar, Near Ratan Singh Circle, Barmer', 'Male', '2007-11-03', 'OBC', 'Shivaji', TRUE, 'Route 1 (Baldev Nagar)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'Active'),
('SR-2024-045', 'ADM-9210', 'PEN-RJ-2024-954', 'Ananya Meena', '03', '8th', 'A', '8th - A', 'Ramesh Chand Meena', 'Kamla Meena', 'Ramesh Chand Meena', '9784321987', '9784321987', 'Indira Colony, Lane 4, Barmer', 'Female', '2011-02-14', 'ST', 'Raman', TRUE, 'Route 2 (Indira Colony)', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'Active'),
('SR-2022-098', 'ADM-7712', 'PEN-RJ-2022-311', 'Karan Soni', '18', '11th', 'Commerce', '11th - Commerce', 'Gopal Soni', 'Savitri Soni', 'Gopal Soni', '9414122334', '9414122334', 'Station Road, Near Soni Dharmshala, Barmer', 'Male', '2008-09-18', 'OBC', 'Tagore', FALSE, NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active')
ON CONFLICT (sr_no) DO NOTHING;

-- 6. ACADEMIC TERMS
INSERT INTO academic_terms (name, weightage_percent, start_date, end_date) VALUES
('Term 1 (Half Yearly & Periodic)', 40, '2026-07-01', '2026-10-31'),
('Term 2 (Annual Examination)', 60, '2026-11-01', '2027-03-31');

-- 7. CALENDAR EVENTS & HOLIDAYS
INSERT INTO calendar_events (title, category, start_date, end_date, is_holiday, notify_sms, description) VALUES
('Ramdev Jayanti / Teja Dashami', 'Holiday', '2026-09-21', '2026-09-21', TRUE, TRUE, 'State Gazetted Holiday'),
('Pre-Board Exam Term 1 Commencement', 'Exam', '2026-09-25', '2026-10-06', FALSE, TRUE, 'Class 10th and 12th Pre-Boards'),
('Mahatma Gandhi Jayanti', 'Holiday', '2026-10-02', '2026-10-02', TRUE, FALSE, 'National Holiday'),
('Parent Teacher Meeting (PTM)', 'Meeting', '2026-10-10', '2026-10-10', FALSE, TRUE, 'Term 1 progress cards distribution');
