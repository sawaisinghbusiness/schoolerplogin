import type { Student, SavedStudent, StudentFull } from "@/data/mockData";

/** What the admission form sends: the student, the full-form details, and (optionally) the brothers/sisters to link. */
export type StudentInput = Partial<StudentFull> & { siblingIds?: string[] };
import { api } from "@/lib/apiClient";

/*
 * Every call goes to the backend server, which checks the signed-in role. The old browser-side Supabase
 * fallback and the 1,500-student sample list were removed (2026-11-16): the anon key let the browser skip
 * the role checks, and the sample list made the fee counter bundle 4 MB.
 */

export const studentService = {
  /**
   * Fetch students with optional keyword and class filter.
   * Connects to Supabase if credentials exist; otherwise gracefully falls back to mock data.
   */
  async fetchStudents(options?: {
    query?: string;
    className?: string;
    section?: string;
    /** Cap the number of rows (search boxes); omit to get every match. */
    limit?: number;
  }): Promise<{ data: Student[]; isLive: boolean; error: string | null }> {
    const { query, className, section, limit } = options || {};

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (limit) params.set("limit", String(limit));
    if (className) params.set("class", className);
    if (section) params.set("section", section);
    const qs = params.toString();
    const res = await api.get<{ data: Student[] }>(`/api/students${qs ? `?${qs}` : ""}`);
    if (res.ok && res.data) return { data: res.data.data, isLive: true, error: null };
    return { data: [], isLive: false, error: res.error || "Failed to load students" };
  },

  /**
   * One student with the full admission form and siblings (backend only). The list leaves these out,
   * so the edit form and the profile load them from here.
   */
  async fetchStudentFull(id: string): Promise<{ data: StudentFull | null; error: string | null }> {
    const res = await api.get<{ data: StudentFull }>(`/api/students/${encodeURIComponent(id)}`);
    if (res.ok && res.data?.data) return { data: res.data.data, error: null };
    return { data: null, error: res.status === 404 ? "This student is no longer in the register." : res.error || "Could not load the student." };
  },

  /**
   * Fetch single student by ID, admission number, or SR number
   */
  async fetchStudentById(id: string): Promise<{ data: Student | null; isLive: boolean; error: string | null }> {
    const res = await api.get<{ data: Student }>(`/api/students/${encodeURIComponent(id)}`);
    if (res.ok && res.data) return { data: res.data.data, isLive: true, error: null };
    if (res.status === 404) return { data: null, isLive: true, error: null };
    return { data: null, isLive: false, error: res.error || "Failed to load student" };
  },

  /** Excel import straight into the database; existing SR numbers are skipped. */
  async bulkImport(students: Partial<Student>[]): Promise<{ success: boolean; inserted?: number; skipped?: number; invalid?: number; error?: string }> {
    const res = await api.post<{ success: boolean; inserted: number; skipped: number; invalid: number; error?: string }>("/api/students/bulk", { students });
    if (res.ok && res.data?.success) return { success: true, inserted: res.data.inserted, skipped: res.data.skipped, invalid: res.data.invalid };
    return { success: false, error: res.data?.error || res.error || "Import failed." };
  },

  /**
   * Insert new student
   */
  async createStudent(newStudent: StudentInput): Promise<{ success: boolean; data?: SavedStudent; error?: string }> {
    const res = await api.post<{ success: boolean; data: SavedStudent }>("/api/students", newStudent);
    if (res.ok && res.data?.data) return { success: true, data: res.data.data };
    return { success: false, error: res.error || "Failed to create student" };
  },

  /**
   * Update student
   */
  /** Promote, detain, pass out or change section for many students at once. */
  async moveStudents(moves: { id: string; class?: string; section?: string; status?: "Active" | "Inactive" }[]): Promise<{ success: boolean; moved?: number; failed?: string[]; error?: string }> {
    const res = await api.post<{ success: boolean; moved: number; failed: string[]; error?: string }>("/api/students/move", { moves });
    if (res.ok && res.data?.success) return { success: true, moved: res.data.moved, failed: res.data.failed };
    return { success: false, error: res.data?.error || res.error || "Could not move the students." };
  },

  async updateStudent(id: string, updates: StudentInput): Promise<{ success: boolean; data?: SavedStudent; error?: string }> {
    const res = await api.patch<{ success: boolean; data?: SavedStudent }>(`/api/students/${encodeURIComponent(id)}`, updates);
    if (res.ok) return { success: true, data: res.data?.data };
    return { success: false, error: res.error || "Failed to update student" };
  },

  /**
   * Delete student
   */
  async deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await api.del<{ success: boolean }>(`/api/students/${encodeURIComponent(id)}`);
    if (res.ok) return { success: true };
    return { success: false, error: res.error || "Failed to delete student" };
  },
};

/** Scans of admission documents (office only: admin, accountant). Needs the 20261020 SQL on the server. */
export const studentDocumentService = {
  /** Signed links (valid ~30 min) for each document key that has a scan. */
  async list(id: string): Promise<{ files: Record<string, string>; error?: string }> {
    const r = await api.get<{ files: Record<string, string> }>(`/api/student-documents/${encodeURIComponent(id)}`);
    return r.ok && r.data ? { files: r.data.files || {} } : { files: {}, error: r.error || "Could not open the scans." };
  },
  /** `image` is a JPEG/PNG/WebP data URL (max 1.5 MB). Saving also ticks documents[key]. */
  async set(id: string, key: string, image: string): Promise<{ success: boolean; error?: string }> {
    const r = await api.post<{ success: boolean; error?: string }>(`/api/student-documents/${encodeURIComponent(id)}`, { key, image });
    return r.ok && r.data?.success ? { success: true } : { success: false, error: r.data?.error || r.error || "Could not save the scan." };
  },
  async remove(id: string, key: string): Promise<{ success: boolean; error?: string }> {
    const r = await api.del<{ success: boolean; error?: string }>(`/api/student-documents/${encodeURIComponent(id)}/${encodeURIComponent(key)}`);
    return r.ok && r.data?.success ? { success: true } : { success: false, error: r.data?.error || r.error || "Could not remove the scan." };
  },
};
