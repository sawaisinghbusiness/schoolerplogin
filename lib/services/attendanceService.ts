import { api } from "@/lib/apiClient";

export type AttStatus = "Present" | "Absent" | "Leave" | "HalfDay";

export interface SectionDay {
  class: string;
  section: string;
  classSec: string;
  students: number;
  marked: number;
  present: number;
  absent: number;
  leave: number;
  half: number;
  markedBy: string | null;
  markedAt: string | null;
}

export interface AttendanceDay {
  date: string;
  sunday: boolean;
  holiday: string | null;
  sections: SectionDay[];
  totals: { students: number; marked: number; present: number; absent: number; leave: number; half: number; sectionsMarked: number; sections: number };
}

export interface RosterStudent {
  id: string;
  name: string;
  rollNo: string;
  srNo: string;
  fatherName: string;
  mobile: string;
  gender: string;
  photoUrl: string;
  status: AttStatus | null;
  remark: string;
}

export interface SectionRoster {
  date: string;
  class: string;
  section: string;
  sunday: boolean;
  holiday: string | null;
  saved: boolean;
  markedAt: string | null;
  markedBy: string | null;
  students: RosterStudent[];
}

export const attendanceService = {
  async day(date: string): Promise<{ data?: AttendanceDay; error?: string }> {
    const res = await api.get<AttendanceDay & { error?: string }>(`/api/attendance/day?date=${date}`);
    return res.ok && res.data ? { data: res.data } : { error: res.data?.error || res.error || "Could not load attendance." };
  },
  async section(date: string, cls: string, sec: string): Promise<{ data?: SectionRoster; error?: string }> {
    const q = new URLSearchParams({ date, class: cls, section: sec });
    const res = await api.get<SectionRoster & { error?: string }>(`/api/attendance/section?${q}`);
    return res.ok && res.data ? { data: res.data } : { error: res.data?.error || res.error || "Could not load the section." };
  },
  async save(date: string, cls: string, sec: string, marks: { studentId: string; status: AttStatus; remark?: string }[]) {
    const res = await api.post<{ success: boolean; data?: { saved: number; present: number; absent: number; leave: number; half: number; whatsappQueued?: number | null }; error?: string }>("/api/attendance/section", {
      date,
      class: cls,
      section: sec,
      marks,
    });
    return res.ok && res.data?.success ? { success: true as const, data: res.data.data! } : { success: false as const, error: res.data?.error || res.error || "Could not save attendance." };
  },
};

/** wa.me link with the absence note typed in (sent from the office phone). */
export function absenceWhatsApp(mobile: string, name: string, classSec: string, dateLabel: string, school: string): string | null {
  const d = (mobile || "").replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(d) || /^(\d)\1{9}$/.test(d)) return null; // 9999999999 etc. are placeholders, not parents
  const text = `प्रिय अभिभावक, आज (${dateLabel}) ${name} (कक्षा ${classSec.replace(/\s*-\s*/, "-")}) स्कूल में अनुपस्थित है। कृपया कारण बताएं। – ${school}`;
  return `https://wa.me/91${d}?text=${encodeURIComponent(text)}`;
}
