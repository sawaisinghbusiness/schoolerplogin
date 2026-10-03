import { api } from "@/lib/apiClient";

export interface Period {
  id: string;
  seq: number;
  label: string;
  start: string;
  end: string;
  isBreak: boolean;
}

export interface TTSection {
  id: string;
  name: string;
  subjects: string[];
}
export interface TTClass {
  id: string;
  name: string;
  sections: TTSection[];
}
export interface TTTeacher {
  id: string;
  name: string;
  designation: string;
  userId: string | null;
  teaching: boolean;
  assigned: { classSec: string; subject: string }[];
}

export interface Overview {
  setupNeeded: boolean;
  periods: Period[];
  classes: TTClass[];
  teachers: TTTeacher[];
  /** The viewer's own staff id, when they are on the staff list. */
  me: string | null;
}

export interface Entry {
  id: string;
  day: number;
  periodId: string;
  subject: string;
  staffId: string | null;
}
export interface Busy {
  day: number;
  periodId: string;
  staffId: string;
  classSec: string;
}
export interface TeacherEntry {
  day: number;
  periodId: string;
  subject: string;
  classSec: string;
}

type Done = { success: boolean; error?: string };
const done = async <T extends Done>(p: Promise<{ ok: boolean; data?: T; error?: string }>): Promise<T> => {
  const r = await p;
  return r.ok && r.data?.success ? r.data : ({ success: false, error: r.data?.error || r.error || "Could not reach the server." } as T);
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const timetableService = {
  async overview(): Promise<{ data?: Overview; error?: string }> {
    const r = await api.get<Overview>("/api/timetable");
    return r.ok && r.data ? { data: r.data } : { error: r.error };
  },
  async section(id: string): Promise<{ entries: Entry[]; busy: Busy[]; error?: string }> {
    const r = await api.get<{ entries: Entry[]; busy: Busy[] }>(`/api/timetable/section/${id}`);
    return r.ok && r.data ? r.data : { entries: [], busy: [], error: r.error };
  },
  async teacher(id: string): Promise<{ entries: TeacherEntry[]; error?: string }> {
    const r = await api.get<{ entries: TeacherEntry[] }>(`/api/timetable/teacher/${id}`);
    return r.ok && r.data ? r.data : { entries: [], error: r.error };
  },
  setCell: (b: { sectionId: string; day: number; periodId: string; subject: string; staffId: string | null }) => done(api.put<Done>("/api/timetable/cell", b)),
  clearCell: (b: { sectionId: string; day: number; periodId: string }) => done(api.del<Done>("/api/timetable/cell", b)),
  savePeriods: (periods: { id?: string; label: string; start: string; end: string; isBreak: boolean }[]) => done(api.put<Done & { periods?: Period[] }>("/api/timetable/periods", { periods })),
};
