import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  classSec?: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "HalfDay";
  remarks?: string;
}

export interface SavedSectionAttendance {
  classSec: string;
  date: string;
  statusMap: Record<string, "Present" | "Absent" | "Leave" | "HalfDay">;
  reasonMap: Record<string, string>;
  savedAt: string;
  total: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  halfDayCount: number;
  isLive?: boolean;
}

const STORAGE_PREFIX = "sms_barmer_att_";
const REGISTRY_KEY = "sms_barmer_marked_sections_registry";

export const attendanceService = {
  /**
   * Get attendance for a specific class and date.
   * Checks localStorage first for instant offline/local rendering,
   * then tries Supabase if configured.
   */
  async getSavedSectionAttendance(
    classSec: string,
    date: string
  ): Promise<SavedSectionAttendance | null> {
    // 1. Check local storage cache
    if (typeof window !== "undefined") {
      try {
        const localKey = `${STORAGE_PREFIX}${encodeURIComponent(classSec)}_${date}`;
        const cached = localStorage.getItem(localKey);
        if (cached) {
          const parsed: SavedSectionAttendance = JSON.parse(cached);
          return parsed;
        }
      } catch (e) {
        console.warn("Could not read local attendance:", e);
      }
    }

    // 2. Try Supabase cloud database
    if (isSupabaseConfigured) {
      try {
        // Try attendance_student first
        const { data, error } = await supabase
          .from("attendance_student")
          .select(`
            id,
            student_id,
            attendance_date,
            status,
            remarks
          `)
          .eq("attendance_date", date);

        if (!error && data && data.length > 0) {
          const statusMap: Record<string, "Present" | "Absent" | "Leave" | "HalfDay"> = {};
          const reasonMap: Record<string, string> = {};

          data.forEach((row: any) => {
            if (row.student_id) {
              statusMap[row.student_id] = row.status;
              if (row.remarks) reasonMap[row.student_id] = row.remarks;
            }
          });

          return {
            classSec,
            date,
            statusMap,
            reasonMap,
            savedAt: new Date().toISOString(),
            total: Object.keys(statusMap).length,
            presentCount: Object.values(statusMap).filter((s) => s === "Present").length,
            absentCount: Object.values(statusMap).filter((s) => s === "Absent").length,
            leaveCount: Object.values(statusMap).filter((s) => s === "Leave").length,
            halfDayCount: Object.values(statusMap).filter((s) => s === "HalfDay").length,
            isLive: true,
          };
        }
      } catch (err) {
        console.warn("Supabase fetch attendance error:", err);
      }
    }

    return null;
  },

  /**
   * Save or update section attendance permanently.
   * Guarantees persistence in browser localStorage and syncs with Supabase.
   */
  async saveSectionAttendance(params: {
    classSec: string;
    date: string;
    statusMap: Record<string, "Present" | "Absent" | "Leave" | "HalfDay">;
    reasonMap: Record<string, string>;
    students: { id: string; name: string; rollNo: string; srNo: string; classSec: string }[];
  }): Promise<{ success: boolean; savedAt: string; isLive: boolean; error?: string }> {
    const { classSec, date, statusMap, reasonMap, students } = params;
    const nowIso = new Date().toISOString();

    const presentCount = students.filter((s) => (statusMap[s.id] || "Present") === "Present").length;
    const absentCount = students.filter((s) => statusMap[s.id] === "Absent").length;
    const leaveCount = students.filter((s) => statusMap[s.id] === "Leave").length;
    const halfDayCount = students.filter((s) => statusMap[s.id] === "HalfDay").length;

    const recordData: SavedSectionAttendance = {
      classSec,
      date,
      statusMap,
      reasonMap,
      savedAt: nowIso,
      total: students.length,
      presentCount,
      absentCount,
      leaveCount,
      halfDayCount,
    };

    // 1. Always save to local storage immediately
    if (typeof window !== "undefined") {
      try {
        const localKey = `${STORAGE_PREFIX}${encodeURIComponent(classSec)}_${date}`;
        localStorage.setItem(localKey, JSON.stringify(recordData));

        // Update registry of saved sections
        const rawReg = localStorage.getItem(REGISTRY_KEY);
        const reg: Record<string, string[]> = rawReg ? JSON.parse(rawReg) : {};
        if (!reg[date]) reg[date] = [];
        if (!reg[date].includes(classSec)) {
          reg[date].push(classSec);
        }
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
    }

    // 2. Sync to Supabase if configured
    let isLive = false;
    if (isSupabaseConfigured) {
      try {
        const payload = students.map((s) => ({
          student_id: s.id,
          attendance_date: date,
          status: statusMap[s.id] || "Present",
          remarks: reasonMap[s.id] || null,
          session: "2026-2027",
        }));

        // Try upserting to attendance_student table
        const { error } = await supabase
          .from("attendance_student")
          .upsert(payload, { onConflict: "student_id,attendance_date" });

        if (!error) {
          isLive = true;
        } else {
          console.warn("Supabase upsert note:", error.message);
        }
      } catch (err: any) {
        console.warn("Supabase save error:", err);
      }
    }

    return { success: true, savedAt: nowIso, isLive };
  },

  /**
   * Fetch list of dates that have saved attendance for a section
   */
  getMarkedDatesForSection(classSec: string): string[] {
    if (typeof window === "undefined") return [];
    try {
      const dates: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${STORAGE_PREFIX}${encodeURIComponent(classSec)}_`)) {
          const date = key.replace(`${STORAGE_PREFIX}${encodeURIComponent(classSec)}_`, "");
          dates.push(date);
        }
      }
      return dates.sort();
    } catch {
      return [];
    }
  },

  /**
   * Compatibility method for API route
   */
  async fetchAttendance(date: string, classId?: string) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from("attendance_student").select("*").eq("attendance_date", date);
        if (classId) {
          query = query.eq("class_sec", classId);
        }
        const { data, error } = await query;
        if (!error && data) return { data, isLive: true };
      } catch (err) {
        console.warn("fetchAttendance error:", err);
      }
    }
    return { data: [], isLive: false };
  },

  /**
   * Compatibility method for API route
   */
  async saveAttendance(records: any[]) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("attendance_student").upsert(records);
        if (!error) return { success: true, count: records.length, isLive: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true, count: records.length, isLive: false };
  },
};

