import { api } from "@/lib/apiClient";

/**
 * Classes, sections and their subjects. Talks only to the backend (/api/classes).
 * Writes are admin-only on the server; its error messages are friendly and shown as-is.
 */

export interface SectionItem {
  id: string;
  name: string;
  subjects: string[];
}

export interface ClassItem {
  id: string;
  name: string;
  orderSeq?: number;
  wing?: string | null;
  sections: SectionItem[];
}

export type Result<T = undefined> = { success: boolean; data?: T; error?: string; needsSetup?: boolean };

/** Fallback text when subjects cannot be saved because the database is missing the column. */
export const SUBJECTS_SETUP_MESSAGE =
  "Subjects cannot be saved yet: the database needs a one-time update (sections.subjects column). Classes and sections still work.";

/** The backend explains a missing subjects column with a "one-time database update" message. */
const isSetupMessage = (msg?: string) => !!msg && /one-time database update|sections\.subjects/i.test(msg);

function done<T>(res: { ok: boolean; data?: any; error?: string }, fallback: string, pick?: (body: any) => T): Result<T> {
  if (res.ok) return { success: true, data: pick ? pick(res.data) : undefined };
  const error = res.data?.error || res.error || fallback;
  return { success: false, error, needsSetup: isSetupMessage(error) };
}

const enc = encodeURIComponent;

export const classService = {
  /** All classes in order, each with its sections and subjects. */
  async fetchClasses(): Promise<{ data: ClassItem[]; tableMissing: boolean; error?: string }> {
    const res = await api.get<{ data: ClassItem[] }>("/api/classes");
    if (!res.ok) return { data: [], tableMissing: false, error: res.error || "Could not load classes." };
    const list = Array.isArray(res.data?.data) ? res.data!.data : [];
    return {
      data: list.map((c) => ({
        id: c.id,
        name: c.name,
        orderSeq: c.orderSeq,
        wing: c.wing ?? null,
        sections: (c.sections || []).map((s) => ({ id: s.id, name: s.name, subjects: Array.isArray(s.subjects) ? s.subjects : [] })),
      })),
      tableMissing: false,
    };
  },

  /** Class and its sections, all or nothing. */
  async createClass(name: string, sections: string[], subjects: string[], wing?: string | null): Promise<Result<ClassItem>> {
    const res = await api.post<{ data: ClassItem }>("/api/classes", { name: name.trim(), sections, subjects, ...(wing ? { wing } : {}) });
    return done(res, "Could not add the class.", (b) => b?.data);
  },

  /** Renames the class; the backend moves its students to the new name too. */
  async updateClass(classId: string, name: string): Promise<Result> {
    return done(await api.patch(`/api/classes/${enc(classId)}`, { name: name.trim() }), "Could not rename the class.");
  },

  /** Refused by the backend while the class has students. */
  async deleteClass(classId: string): Promise<Result> {
    return done(await api.del(`/api/classes/${enc(classId)}`), "Could not delete the class.");
  },

  async addSections(classId: string, names: string[], subjects: string[]): Promise<Result<SectionItem[]>> {
    const res = await api.post<{ data: SectionItem[] }>(`/api/classes/${enc(classId)}/sections`, { names, subjects });
    return done(res, "Could not add the section.", (b) => b?.data || []);
  },

  /** Renames the section; its students move with it. */
  async renameSection(sectionId: string, name: string): Promise<Result> {
    return done(await api.patch(`/api/classes/sections/${enc(sectionId)}`, { name: name.trim() }), "Could not rename the section.");
  },

  async updateSectionSubjects(sectionId: string, subjects: string[]): Promise<Result> {
    return done(await api.patch(`/api/classes/sections/${enc(sectionId)}`, { subjects }), "Could not save the subjects.");
  },

  /** Refused by the backend while the section has students. */
  async deleteSection(sectionId: string): Promise<Result> {
    return done(await api.del(`/api/classes/sections/${enc(sectionId)}`), "Could not delete the section.");
  },

  async reorderClasses(order: { id: string; orderSeq: number }[]): Promise<Result> {
    return done(await api.put("/api/classes/order", { order }), "Could not save the new order.");
  },

  /**
   * Active students per class and section, keyed "class|section" (read-only, from the
   * attendance day summary). Includes sections that are not set up as classes yet.
   */
  async studentCounts(): Promise<{ data: Record<string, number>; error?: string }> {
    const res = await api.get<{ sections?: { class: string; section: string; students: number }[] }>("/api/attendance/day");
    if (!res.ok) return { data: {}, error: res.error || "Could not load student counts." };
    const data: Record<string, number> = {};
    for (const s of res.data?.sections || []) data[`${s.class}|${s.section}`] = (data[`${s.class}|${s.section}`] || 0) + (s.students || 0);
    return { data };
  },
};
