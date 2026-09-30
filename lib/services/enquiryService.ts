import { api } from "@/lib/apiClient";

export type EnquiryStatus = "new" | "visited" | "admitted" | "dropped";

export interface EnquiryNote {
  at: string;
  by: string;
  text: string;
}

export interface Enquiry {
  id: string;
  enquiry_no: number;
  student_name: string;
  class_wanted: string;
  gender: string | null;
  dob: string | null;
  father_name: string | null;
  mother_name: string | null;
  mobile: string;
  alt_mobile: string | null;
  area: string | null;
  previous_school: string | null;
  source: string | null;
  status: EnquiryStatus;
  next_follow_up: string | null;
  notes: EnquiryNote[];
  admitted_student_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export type EnquiryInput = Partial<Omit<Enquiry, "id" | "enquiry_no" | "notes" | "created_at" | "updated_at" | "created_by_name">>;

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  visited: "Visited school",
  admitted: "Admitted",
  dropped: "Not interested",
};

export const SOURCES = ["Walk-in", "Phone call", "Parent reference", "Staff reference", "Hoarding / banner", "Newspaper", "Facebook / Instagram", "WhatsApp"];

export const enquiryNo = (n: number) => `ENQ-${String(n).padStart(4, "0")}`;

type Res = { success: boolean; data?: Enquiry; error?: string };
const unwrap = (r: { ok: boolean; data?: Res; error?: string }, fallback: string): Res =>
  r.ok && r.data?.success && r.data.data ? { success: true, data: r.data.data } : { success: false, error: r.data?.error || r.error || fallback };

export const enquiryService = {
  async list(): Promise<{ data: Enquiry[]; error?: string }> {
    const res = await api.get<{ data: Enquiry[]; error?: string }>("/api/enquiries");
    return res.ok && res.data ? { data: res.data.data } : { data: [], error: res.error || "Could not load enquiries." };
  },
  async create(input: EnquiryInput & { note?: string }) {
    return unwrap(await api.post<Res>("/api/enquiries", input), "Could not save the enquiry.");
  },
  async update(id: string, input: EnquiryInput) {
    return unwrap(await api.patch<Res>(`/api/enquiries/${id}`, input), "Could not update the enquiry.");
  },
  async addNote(id: string, text: string, nextFollowUp?: string | null) {
    return unwrap(await api.post<Res>(`/api/enquiries/${id}/notes`, { text, ...(nextFollowUp !== undefined ? { next_follow_up: nextFollowUp } : {}) }), "Could not save the note.");
  },
};
