import { api } from "@/lib/apiClient";

/** WhatsApp sent by the backend from the school's own number (linked once by QR). */

export type WaState = "off" | "connecting" | "qr" | "open";

export interface WaSettings {
  auto_absent: boolean;
  auto_receipt: boolean;
  updated_by_name?: string | null;
  updated_at?: string | null;
}

export interface WaStatus {
  state: WaState;
  qr: string | null;
  me: { number: string; name: string } | null;
  lastError: string | null;
  quietHours: boolean;
  setupNeeded: boolean;
  settings: WaSettings | null;
  counts: { pending: number; sentToday: number; failed: number };
}

export type OutboxStatus = "pending" | "sent" | "failed" | "skipped";

export interface OutboxRow {
  id: string;
  kind: "absent" | "receipt" | "dues" | "notice" | "test";
  student_name: string | null;
  class_sec: string | null;
  phone: string;
  body: string;
  status: OutboxStatus;
  error: string | null;
  attempts: number;
  created_by_name: string | null;
  created_at: string;
  sent_at: string | null;
}

type Done = { success: boolean; error?: string };
const done = <T extends Done>(r: { ok: boolean; data?: T; error?: string }) => (r.ok && r.data?.success ? r.data : ({ success: false, error: r.data?.error || r.error || "Could not reach the server." } as T));

export const whatsappService = {
  async status(): Promise<WaStatus | null> {
    const r = await api.get<WaStatus>("/api/whatsapp/status");
    return r.ok && r.data ? r.data : null;
  },
  connect: async () => done(await api.post<Done>("/api/whatsapp/connect")),
  logout: async () => done(await api.post<Done>("/api/whatsapp/logout")),
  saveSettings: async (patch: Partial<Pick<WaSettings, "auto_absent" | "auto_receipt">>) => done(await api.put<Done & { data?: WaSettings }>("/api/whatsapp/settings", patch)),
  test: async (phone: string, text: string) => done(await api.post<Done>("/api/whatsapp/test", { phone, text })),
  retry: async () => done(await api.post<Done & { count?: number }>("/api/whatsapp/retry")),

  async outbox(status?: OutboxStatus): Promise<{ data: OutboxRow[]; setupNeeded: boolean; error?: string }> {
    const r = await api.get<{ data: OutboxRow[]; setupNeeded: boolean }>(`/api/whatsapp/outbox${status ? `?status=${status}` : ""}`);
    return r.ok && r.data ? r.data : { data: [], setupNeeded: false, error: r.error };
  },

  /** Queues one message per student; the backend looks up each parent's number itself. */
  queue: async (kind: "dues" | "notice", items: { studentId: string; text: string }[]) =>
    done(await api.post<Done & { queued?: number; noPhone?: number; alreadyQueued?: number; connected?: boolean }>("/api/whatsapp/queue", { kind, items })),
};
