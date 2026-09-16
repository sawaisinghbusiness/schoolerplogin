import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { DbStaff } from "@/lib/types/database";

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  dept: string;
  mobile: string;
  email: string;
  status: "Active" | "On Leave" | "Left";
  attendance: "Present" | "Absent" | "On Leave" | "Half Day" | "Unmarked";
  qualification?: string;
  joiningDate?: string;
  biometricEnrolled?: boolean;
}

const INITIAL_MOCK_STAFF: StaffMember[] = [
  { id: "EMP-001", name: "Dr. K. S. Rathore", designation: "Principal", dept: "Administration", mobile: "9414012345", email: "principal@motherteresa.edu.in", status: "Active", attendance: "Present", qualification: "Ph.D., M.Ed.", joiningDate: "2015-06-01", biometricEnrolled: true },
  { id: "EMP-002", name: "Mrs. Sunita Sharma", designation: "Senior PGT", dept: "Mathematics", mobile: "9829055443", email: "sunita.math@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.Sc. Maths, B.Ed", joiningDate: "2018-07-15", biometricEnrolled: true },
  { id: "EMP-003", name: "Mr. Vikram Verma", designation: "PGT Physics", dept: "Science", mobile: "9414199887", email: "vikram.phy@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.Sc. Physics, B.Ed", joiningDate: "2019-04-10", biometricEnrolled: true },
  { id: "EMP-004", name: "Ms. Rekha Choudhary", designation: "TGT English", dept: "Languages", mobile: "9784311223", email: "rekha.eng@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.A. English, B.Ed", joiningDate: "2021-08-01", biometricEnrolled: true },
  { id: "EMP-005", name: "Mr. Ramesh Bhati", designation: "Accounts Officer", dept: "Finance", mobile: "9460122334", email: "accounts@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.Com, Tally Pro", joiningDate: "2017-03-20", biometricEnrolled: true },
  { id: "EMP-006", name: "Mr. Mahendra Singh", designation: "HOD Physical Ed", dept: "Sports", mobile: "9602433445", email: "sports@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.P.Ed, NIS Coach", joiningDate: "2020-01-10", biometricEnrolled: true },
  { id: "EMP-007", name: "Er. Deepak Jain", designation: "System Admin", dept: "IT & Labs", mobile: "9166554433", email: "deepak.it@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "B.Tech CSE", joiningDate: "2022-11-01", biometricEnrolled: true },
  { id: "EMP-008", name: "Mrs. Manju Bhati", designation: "PRT Primary Head", dept: "Primary Wing", mobile: "9587441122", email: "manju.prt@motherteresa.edu.in", status: "Active", attendance: "Absent", qualification: "M.A., D.El.Ed", joiningDate: "2016-09-05", biometricEnrolled: true },
];

let localStaff: StaffMember[] = [...INITIAL_MOCK_STAFF];

function mapDbToStaff(db: any): StaffMember {
  return {
    id: db.emp_code || db.id,
    name: db.name,
    designation: db.designation,
    dept: db.department,
    mobile: db.mobile,
    email: db.email || `${db.name.toLowerCase().replace(/[^a-z]/g, "")}@motherteresa.edu.in`,
    status: db.status || "Active",
    attendance: db.today_attendance || "Present",
    qualification: db.qualification,
    joiningDate: db.joining_date,
    biometricEnrolled: Boolean(db.biometric_enrolled),
  };
}

export const staffService = {
  async fetchStaff(): Promise<{ data: StaffMember[]; isLive: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .order("emp_code", { ascending: true });

        if (error) {
          console.warn("Supabase staff query error:", error.message);
          return { data: localStaff, isLive: false, error: error.message };
        }

        if (data && data.length > 0) {
          return { data: data.map(mapDbToStaff), isLive: true, error: null };
        }
      } catch (err: any) {
        console.warn("Supabase staff connection exception:", err);
      }
    }

    return { data: localStaff, isLive: false, error: null };
  },

  async createStaff(member: Partial<StaffMember>): Promise<{ success: boolean; data?: StaffMember; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("staff")
          .insert([
            {
              emp_code: member.id,
              name: member.name,
              department: member.dept,
              designation: member.designation,
              mobile: member.mobile,
              email: member.email,
              qualification: member.qualification,
              joining_date: member.joiningDate || new Date().toISOString().split("T")[0],
              status: member.status || "Active",
              biometric_enrolled: member.biometricEnrolled ?? true,
            },
          ])
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const mapped = mapDbToStaff(data);
        localStaff.push(mapped);
        return { success: true, data: mapped };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const newEmp: StaffMember = {
      id: member.id || `EMP-${String(localStaff.length + 1).padStart(3, "0")}`,
      name: member.name || "New Staff",
      designation: member.designation || "Assistant Teacher",
      dept: member.dept || "General",
      mobile: member.mobile || "9414000000",
      email: member.email || "staff@motherteresa.edu.in",
      status: member.status || "Active",
      attendance: "Unmarked",
      qualification: member.qualification,
      joiningDate: member.joiningDate || new Date().toISOString().split("T")[0],
      biometricEnrolled: true,
    };

    localStaff.push(newEmp);
    return { success: true, data: newEmp };
  },

  async deleteStaff(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("staff")
          .delete()
          .eq("emp_code", id);

        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    localStaff = localStaff.filter((st) => st.id !== id);
    return { success: true };
  },
};
