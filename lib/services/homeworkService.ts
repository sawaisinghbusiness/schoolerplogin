import { api } from "@/lib/apiClient";

export interface HwSection {
  id: string;
  name: string;
  subjects: string[];
}
export interface HwClass {
  id: string;
  name: string;
  sections: HwSection[];
}
/** What the viewer may post homework for. */
export interface PostOption {
  sectionId: string;
  classSec: string;
  subjects: string[];
  anySubject: boolean;
}
export interface Homework {
  id: string;
  subject: string;
  title: string;
  details: string;
  assignedOn: string;
  dueDate: string | null;
  canEdit: boolean;
  by: string;
}
export interface HwInput {
  sectionId: string;
  subject: string;
  title: string;
  details: string;
  dueDate: string;
}

type Done = { success: boolean; error?: string };
const done = async <T extends Done>(p: Promise<{ ok: boolean; data?: T; error?: string }>): Promise<T> => {
  const r = await p;
  return r.ok && r.data?.success ? r.data : ({ success: false, error: r.data?.error || r.error || "Could not reach the server." } as T);
};

export const homeworkService = {
  async options(): Promise<{ setupNeeded: boolean; options: PostOption[]; classes: HwClass[]; error?: string }> {
    const r = await api.get<{ setupNeeded: boolean; options?: PostOption[]; classes?: HwClass[] }>("/api/homework/options");
    return r.ok && r.data ? { setupNeeded: r.data.setupNeeded, options: r.data.options || [], classes: r.data.classes || [] } : { setupNeeded: false, options: [], classes: [], error: r.error };
  },
  async list(sectionId: string, subject: string): Promise<{ data: Homework[]; error?: string }> {
    const r = await api.get<{ data: Homework[] }>(`/api/homework?section=${sectionId}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`);
    return r.ok && r.data ? r.data : { data: [], error: r.error };
  },
  create: (b: HwInput) => done(api.post<Done>("/api/homework", b)),
  update: (id: string, b: HwInput) => done(api.patch<Done>(`/api/homework/${id}`, b)),
  remove: (id: string) => done(api.del<Done>(`/api/homework/${id}`)),
};
