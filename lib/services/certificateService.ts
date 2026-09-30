import { api } from "@/lib/apiClient";

export type CertificateType = "tc" | "bonafide" | "character";

export interface Certificate {
  id: string;
  serial_no: string;
  type: CertificateType;
  session: string;
  student_id: string;
  /** A snapshot of everything printed, so a reprint matches the original. */
  details: Record<string, string>;
  issued_by_name: string;
  issued_at: string;
  student?: { name: string; sr_no: string; class_sec: string; father_name: string };
}

export const CERT_LABEL: Record<CertificateType, string> = {
  tc: "Transfer certificate",
  bonafide: "Bonafide certificate",
  character: "Character certificate",
};

export const certificateService = {
  async list(options: { studentId?: string; type?: CertificateType; limit?: number } = {}): Promise<{ data: Certificate[]; error?: string }> {
    const qs = new URLSearchParams();
    if (options.studentId) qs.set("studentId", options.studentId);
    if (options.type) qs.set("type", options.type);
    if (options.limit) qs.set("limit", String(options.limit));
    const res = await api.get<{ data: Certificate[]; error?: string }>(`/api/certificates${qs.toString() ? `?${qs}` : ""}`);
    if (res.ok && res.data) return { data: res.data.data };
    return { data: [], error: res.error || "Could not load certificates." };
  },

  async issue(input: { studentId: string; type: CertificateType; details: Record<string, string>; markLeft?: boolean }): Promise<{ success: boolean; data?: Certificate; error?: string }> {
    const res = await api.post<{ success: boolean; data?: Certificate; error?: string }>("/api/certificates", input);
    if (res.ok && res.data?.success && res.data.data) return { success: true, data: res.data.data };
    return { success: false, error: res.data?.error || res.error || "Could not issue the certificate." };
  },
};
