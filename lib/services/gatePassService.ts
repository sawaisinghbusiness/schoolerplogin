import { api } from "@/lib/apiClient";

export interface GatePass {
  id: string;
  pass_no: string;
  student_id: string;
  reason: string;
  escort: string;
  issued_by_name: string;
  issued_at: string;
  student?: { name: string; sr_no: string; class_sec: string; father_name: string; mobile: string };
}

export const gatePassService = {
  async issue(input: { studentId: string; reason: string; escort: string }): Promise<{ success: boolean; data?: GatePass; error?: string }> {
    const res = await api.post<{ success: boolean; data?: GatePass; error?: string }>("/api/gate-passes", input);
    if (res.ok && res.data?.success && res.data.data) return { success: true, data: res.data.data };
    return { success: false, error: res.data?.error || res.error || "Could not issue the gate pass." };
  },

  async list(options: { studentId?: string; limit?: number } = {}): Promise<{ data: GatePass[]; error?: string }> {
    const qs = new URLSearchParams();
    if (options.studentId) qs.set("studentId", options.studentId);
    if (options.limit) qs.set("limit", String(options.limit));
    const res = await api.get<{ data: GatePass[] }>(`/api/gate-passes${qs.toString() ? `?${qs}` : ""}`);
    return res.ok && res.data ? { data: res.data.data } : { data: [], error: res.error || "Could not load gate passes." };
  },
};
