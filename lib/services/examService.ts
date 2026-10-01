import { api } from "@/lib/apiClient";
import type { ExamPart } from "@/lib/grading";

export interface Exam {
  id: string;
  title: string;
  classes: string[];
  start_date: string | null;
  end_date: string | null;
  components: ExamPart[];
  max: number;
  order_seq: number;
  locked: boolean;
  session: string;
}

export interface ExamInput {
  title: string;
  classes: string[];
  start_date: string | null;
  end_date: string | null;
  components: ExamPart[];
  order_seq: number;
}

export interface SectionProgress {
  cls: string;
  section: string;
  sectionId: string;
  classSec: string;
  students: number;
  subjects: { name: string; entered: number }[];
}

export interface SheetRow {
  studentId: string;
  rollNo: string;
  name: string;
  srNo: string;
  marks: Record<string, number>;
  absent: boolean;
  saved: boolean;
}

export interface Sheet {
  exam: Exam;
  classSec: string;
  subject: string;
  lastSaved: { at: string; by: string | null } | null;
  rows: SheetRow[];
}

export interface ReportSubject {
  subject: string;
  marks: Record<string, number>;
  absent: boolean;
  total: number | null;
  grade: string | null;
  passed: boolean;
  entered: boolean;
}

export interface ReportCard {
  studentId: string;
  name: string;
  rollNo: string;
  srNo: string;
  fatherName: string;
  motherName: string;
  dob: string;
  subjects: ReportSubject[];
  grand: number;
  outOf: number;
  percent: number;
  grade: string | null;
  result: string;
  complete: boolean;
  attendance: { present: number; days: number } | null;
  rank: number | null;
}

export interface Report {
  exam: Exam;
  classSec: string;
  subjects: string[];
  cards: ReportCard[];
}

const enc = encodeURIComponent;

export const examService = {
  async list(): Promise<{ data: Exam[]; setupNeeded: boolean; error?: string }> {
    const r = await api.get<{ data: Exam[]; setupNeeded: boolean }>("/api/exams");
    return r.ok && r.data ? r.data : { data: [], setupNeeded: false, error: r.error };
  },
  async save(input: ExamInput, id?: string): Promise<{ data?: Exam; error?: string }> {
    const r = id ? await api.patch<{ data: Exam }>(`/api/exams/${id}`, input) : await api.post<{ data: Exam }>("/api/exams", input);
    return r.ok ? { data: r.data?.data } : { error: r.error };
  },
  async setLocked(id: string, locked: boolean): Promise<{ error?: string }> {
    const r = await api.post(`/api/exams/${id}/lock`, { locked });
    return r.ok ? {} : { error: r.error };
  },
  async remove(id: string): Promise<{ error?: string }> {
    const r = await api.del(`/api/exams/${id}`);
    return r.ok ? {} : { error: r.error };
  },
  async progress(id: string): Promise<{ data?: { exam: Exam; sections: SectionProgress[] }; error?: string }> {
    const r = await api.get<{ exam: Exam; sections: SectionProgress[] }>(`/api/exams/${id}/progress`);
    return r.ok ? { data: r.data } : { error: r.error };
  },
  async sheet(id: string, section: string, subject: string): Promise<{ data?: Sheet; error?: string }> {
    const r = await api.get<Sheet>(`/api/exams/${id}/sheet?section=${enc(section)}&subject=${enc(subject)}`);
    return r.ok ? { data: r.data } : { error: r.error };
  },
  async saveSheet(id: string, section: string, subject: string, rows: { studentId: string; marks: Record<string, number | null>; absent: boolean }[]): Promise<{ saved?: number; error?: string }> {
    const r = await api.put<{ saved: number }>(`/api/exams/${id}/sheet`, { section, subject, rows });
    return r.ok ? { saved: r.data?.saved } : { error: r.error };
  },
  async report(id: string, section: string): Promise<{ data?: Report; error?: string }> {
    const r = await api.get<Report>(`/api/exams/${id}/report?section=${enc(section)}`);
    return r.ok ? { data: r.data } : { error: r.error };
  },
};
