import { api } from "@/lib/apiClient";
import type { FeeTransaction } from "@/lib/services/feeService";

export interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  createdAt: string;
  amount: number;
  mode: string;
  ref: string | null;
  instalment: string | null;
  heads: Record<string, number> | null;
  remarks: string | null;
  collectedBy: string;
  cancelled: boolean;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  student: { id: string; name: string; srNo: string; classSec: string; class: string; section: string; fatherName: string; mobile: string; admissionNo: string } | null;
}

export interface ReceiptList {
  from: string;
  to: string;
  receipts: Receipt[];
  totals: { count: number; total: number; byMode: Record<"Cash" | "UPI" | "Cheque" | "Other", number>; cancelledCount: number; cancelledAmount: number };
  canCancel: boolean;
}

export const receiptService = {
  async list(from: string, to: string): Promise<{ data?: ReceiptList; error?: string }> {
    const res = await api.get<ReceiptList & { error?: string }>(`/api/fees/receipts?from=${from}&to=${to}`);
    return res.ok && res.data ? { data: res.data } : { error: res.data?.error || res.error || "Could not load receipts." };
  },
  async cancel(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const res = await api.post<{ success: boolean; error?: string }>(`/api/fees/receipts/${id}/cancel`, { reason });
    return res.ok && res.data?.success ? { success: true } : { success: false, error: res.data?.error || res.error || "Could not cancel the receipt." };
  },
};

/** The receipt slip component takes the older FeeTransaction shape. */
export function toTransaction(r: Receipt): FeeTransaction {
  return {
    id: r.id,
    receipt_no: r.receiptNo as unknown as number,
    student_id: r.student?.id || "",
    amount_paid: r.amount,
    payment_mode: r.mode as FeeTransaction["payment_mode"],
    transaction_id: r.ref,
    fee_heads: r.heads || {},
    collected_by: r.collectedBy,
    payment_date: r.date,
    remarks: r.remarks,
    cancelled: r.cancelled,
    cancel_reason: r.cancelReason,
    student: r.student
      ? { name: r.student.name, sr_no: r.student.srNo, admission_no: r.student.admissionNo, class_name: r.student.class, section: r.student.section, father_name: r.student.fatherName, contact_phone: r.student.mobile }
      : undefined,
  };
}
