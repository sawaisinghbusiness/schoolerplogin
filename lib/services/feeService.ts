import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { api, usingRemoteBackend } from "@/lib/apiClient";
import type { Student } from "@/data/mockData";
import type { FeeConfig } from "@/lib/feeEngine";

export interface DaySummary {
  date: string;
  count: number;
  total: number;
  byMode: { Cash: number; UPI: number; Cheque: number; Other: number };
}

/** Receipt heads: tuition_fee, annual_fee, exam_fee, computer_fee, transport_fee, admission_fee, other_fee, late_fine… */
export type FeeHeads = Record<string, number>;

export interface FeePosition {
  asOf: string;
  config: FeeConfig;
  input: { cls: string; bus: boolean; newAdmission: boolean; concession: string | null };
  ledger: { total: number; discount: number; paid: number; finePaid: number; net: number; balance: number };
  fineSupported: boolean;
}

export interface FeeTransaction {
  id: string;
  receipt_no: number;
  student_id: string;
  amount_paid: number;
  payment_mode: "Cash" | "UPI" | "Cheque" | "Net Banking";
  transaction_id?: string | null;
  fee_heads: FeeHeads;
  collected_by: string;
  payment_date: string;
  remarks?: string | null;
  /** Set on cancelled receipts: they stay in the register but are not money collected. */
  cancelled?: boolean;
  cancel_reason?: string | null;
  student?: {
    name: string;
    sr_no: string;
    admission_no?: string;
    class_name?: string;
    section?: string;
    father_name?: string;
    contact_phone?: string;
  };
}

// In-memory transactions cache for fallback
let localTransactions: FeeTransaction[] = [];

/**
 * Convert numeric Indian currency to English words
 * Example: 4500 -> "Four Thousand Five Hundred Rupees Only"
 */
export function numberToWordsIndian(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }

  function convertGroup(n: number): string {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let words = "";
  if (crore > 0) words += convertGroup(crore) + " Crore ";
  if (lakh > 0) words += convertGroup(lakh) + " Lakh ";
  if (thousand > 0) words += convertGroup(thousand) + " Thousand ";
  if (remainder > 0) words += convertGroup(remainder);

  return words.trim() + " Rupees Only";
}

export const feeService = {
  /**
   * Takes a payment at the counter. The backend decides where the money goes and what
   * late fine applies; the counter sends the fee part and the fine collected separately.
   */
  async collect(params: {
    studentId: string;
    amount: number;
    fine: number;
    waiveReason?: string;
    paymentMode: "Cash" | "UPI" | "Cheque" | "Net Banking";
    transactionId?: string;
    remarks?: string;
  }): Promise<{ success: boolean; transaction?: FeeTransaction; newDue?: number; error?: string }> {
    const res = await api.post<{ success: boolean; transaction?: FeeTransaction; newDue: number; error?: string }>("/api/fees/pay", params);
    if (res.ok && res.data?.success && res.data.transaction) return { success: true, transaction: res.data.transaction, newDue: res.data.newDue };
    return { success: false, newDue: res.data?.newDue, error: res.data?.error || res.error || "The payment was not saved." };
  },

  /** Fee setup + ledger for one student: the counter works out instalments and fine from it. */
  async fetchPosition(studentId: string): Promise<{ data?: FeePosition; error?: string }> {
    const res = await api.get<FeePosition & { error?: string }>(`/api/fees/position/${studentId}`);
    return res.ok && res.data ? { data: res.data } : { error: res.data?.error || res.error || "Could not load the fee details." };
  },

  /** Receipts for one student, newest first (backend only). */
  async fetchStudentTransactions(studentId: string, limit = 20): Promise<FeeTransaction[]> {
    if (!usingRemoteBackend) return localTransactions.filter((t) => t.student_id === studentId).slice(0, limit);
    const res = await api.get<{ data: FeeTransaction[] }>(`/api/fees/transactions?limit=${limit}&studentId=${encodeURIComponent(studentId)}`);
    return res.ok && res.data ? res.data.data : [];
  },

  /** What was collected on a day (defaults to today, India time), split by mode. */
  async fetchDaySummary(date?: string): Promise<DaySummary | null> {
    if (!usingRemoteBackend) return null;
    const res = await api.get<{ data: DaySummary }>(`/api/fees/summary${date ? `?date=${date}` : ""}`);
    return res.ok && res.data ? res.data.data : null;
  },

  /** Students with the largest pending balance. */
  async fetchTopDues(limit = 6): Promise<Student[]> {
    if (!usingRemoteBackend) return [];
    const res = await api.get<{ data: Student[] }>(`/api/fees/top-dues?limit=${limit}`);
    return res.ok && res.data ? res.data.data : [];
  },

  /**
   * Fetch recent fee transactions (for audit & reprinting)
   */
  async fetchRecentTransactions(limit = 10): Promise<FeeTransaction[]> {
    if (usingRemoteBackend) {
      const res = await api.get<{ data: FeeTransaction[] }>(`/api/fees/transactions?limit=${limit}`);
      return res.ok && res.data ? res.data.data : [];
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("fee_transactions")
          .select(`
            *,
            students (
              name,
              sr_no,
              admission_no,
              class,
              section,
              father_name,
              mobile
            )
          `)
          .order("payment_date", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            receipt_no: d.receipt_no,
            student_id: d.student_id,
            amount_paid: Number(d.amount),
            payment_mode: d.payment_mode,
            transaction_id: d.transaction_ref,
            fee_heads: { tuition_fee: Number(d.amount), exam_fee: 0, transport_fee: 0 },
            collected_by: d.collected_by,
            payment_date: d.payment_date,
            remarks: d.installment_name,
            student: d.students
              ? {
                  name: d.students.name,
                  sr_no: d.students.sr_no,
                  admission_no: d.students.admission_no,
                  class_name: d.students.class,
                  section: d.students.section,
                  father_name: d.students.father_name,
                  contact_phone: d.students.mobile,
                }
              : undefined,
          }));
        }
      } catch (err) {
        console.warn("fetchRecentTransactions error:", err);
      }
    }

    return localTransactions.slice(0, limit);
  },
};
