import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  classSec?: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Half Day";
  remarks?: string;
}

export const attendanceService = {
  /**
   * Fetch attendance for a specific date and optional class
   */
  async fetchAttendance(date: string, classId?: string): Promise<{ data: AttendanceRecord[]; isLive: boolean }> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from("attendance")
          .select(`
            id,
            student_id,
            date,
            status,
            remarks,
            students (
              name,
              roll_no,
              class_sec
            )
          `)
          .eq("date", date);

        const { data, error } = await q;

        if (!error && data && data.length > 0) {
          const mapped: AttendanceRecord[] = data.map((row: any) => ({
            id: row.id,
            studentId: row.student_id,
            studentName: row.students?.name,
            rollNo: row.students?.roll_no,
            classSec: row.students?.class_sec,
            date: row.date,
            status: row.status,
            remarks: row.remarks,
          }));
          return { data: mapped, isLive: true };
        }
      } catch (err: any) {
        console.warn("Supabase attendance fetch error:", err);
      }
    }

    return { data: [], isLive: false };
  },

  /**
   * Bulk save or update attendance records in Supabase
   */
  async saveAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; count: number; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const payload = records.map((r) => ({
          student_id: r.studentId,
          date: r.date,
          status: r.status,
          remarks: r.remarks || null,
        }));

        const { data, error } = await supabase
          .from("attendance")
          .upsert(payload, { onConflict: "student_id,date" })
          .select();

        if (error) {
          return { success: false, count: 0, error: error.message };
        }

        return { success: true, count: data?.length || records.length };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message };
      }
    }

    // Local simulation
    return { success: true, count: records.length };
  },
};
