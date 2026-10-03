import { api } from "@/lib/apiClient";

export interface BulkResult {
  srNo: string;
  ok: boolean;
  name?: string;
  error?: string;
}

export const photoService = {
  async set(studentId: string, image: string): Promise<{ url?: string; error?: string }> {
    const r = await api.post<{ success: boolean; url?: string; error?: string }>(`/api/student-photos/${studentId}`, { image });
    return r.ok && r.data?.success ? { url: r.data.url } : { error: r.data?.error || r.error || "Could not save the photo." };
  },
  async remove(studentId: string): Promise<{ error?: string }> {
    const r = await api.del<{ success: boolean; error?: string }>(`/api/student-photos/${studentId}`);
    return r.ok && r.data?.success ? {} : { error: r.data?.error || r.error || "Could not remove the photo." };
  },
  /** At most 12 at a time. */
  async bulk(items: { srNo: string; image: string }[]): Promise<{ results?: BulkResult[]; error?: string }> {
    const r = await api.post<{ success: boolean; results?: BulkResult[]; error?: string }>("/api/student-photos/bulk", { items });
    return r.ok && r.data?.success ? { results: r.data.results } : { error: r.data?.error || r.error || "Could not save the photos." };
  },
};
