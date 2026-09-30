import { api } from "@/lib/apiClient";

export type ModeKey = "Cash" | "UPI" | "Cheque" | "Other";
export type ByMode = Record<ModeKey, number>;

export interface CollectionReport {
  from: string;
  to: string;
  /** Only days with receipts, newest first. */
  days: { date: string; receipts: number; total: number; byMode: ByMode }[];
  totals: { receipts: number; total: number; byMode: ByMode };
  /** Always sums to totals.total (an "Unsplit" head takes any gap). */
  heads: { key: string; label: string; amount: number }[];
  byCollector: { name: string; receipts: number; total: number }[];
}

export interface ClassMoney {
  students: number;
  total: number;
  discount: number;
  paid: number;
  balance: number;
}

export interface ClasswiseReport {
  session: string;
  classes: (ClassMoney & { class: string; sections: (ClassMoney & { section: string })[] })[];
  totals: ClassMoney;
}

export const reportService = {
  async collection(from: string, to: string): Promise<{ data?: CollectionReport; error?: string }> {
    const res = await api.get<CollectionReport>(`/api/reports/collection?from=${from}&to=${to}`);
    return res.ok && res.data ? { data: res.data } : { error: res.error || "Could not load the collection report." };
  },

  async classwise(): Promise<{ data?: ClasswiseReport; error?: string }> {
    const res = await api.get<ClasswiseReport>("/api/reports/classwise");
    return res.ok && res.data ? { data: res.data } : { error: res.error || "Could not load the class-wise report." };
  },
};
