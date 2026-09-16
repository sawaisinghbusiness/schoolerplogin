export interface DbInstitutionSettings {
  id: string;
  school_name: string;
  school_code: string;
  account_code: string;
  affiliation_no: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  active_session: string;
  sms_wallet_balance: number;
  dlt_entity_id: string;
  director_otp_mobile: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbStudent {
  id: string;
  sr_no: string;
  admission_no: string;
  pen_no?: string;
  name: string;
  roll_no?: string;
  class: string;
  section: string;
  class_sec: string;
  father_name: string;
  mother_name?: string;
  guardian_name?: string;
  contact: string;
  mobile: string;
  address?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string;
  category: 'General' | 'OBC' | 'SC' | 'ST';
  house?: 'Tagore' | 'Ashoka' | 'Shivaji' | 'Raman';
  transport_opted: boolean;
  bus_route?: string;
  photo_url?: string;
  status: 'Active' | 'Inactive';
  total_fee?: number;
  paid_fee?: number;
  balance_fee?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbStaff {
  id: string;
  emp_code: string;
  name: string;
  department: string;
  designation: string;
  mobile: string;
  email?: string;
  qualification?: string;
  joining_date?: string;
  status: 'Active' | 'On Leave' | 'Left';
  biometric_enrolled: boolean;
  biometric_user_id?: string;
  today_attendance?: 'Present' | 'Absent' | 'On Leave' | 'Half Day' | 'Unmarked';
  created_at?: string;
  updated_at?: string;
}

export interface DbAttendance {
  id: string;
  student_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  marked_by?: string;
  slot?: string;
  remarks?: string;
  created_at?: string;
}

export interface DbCircular {
  id: string;
  title: string;
  message: string;
  target_audience: 'All' | 'Classes' | 'Staff';
  classes?: string[];
  send_sms: boolean;
  send_app: boolean;
  sender_name: string;
  created_at?: string;
}

export interface DbUser {
  id: string;
  phone_number?: string;
  admission_no?: string;
  employee_code?: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'exam_cell' | 'accountant' | 'parent' | 'student';
  is_active: boolean;
  last_login?: string;
  created_at?: string;
}
