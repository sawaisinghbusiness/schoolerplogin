import { api } from "@/lib/apiClient";

export interface SalaryStructure {
  basic: number;
  hra: number;
  da: number;
  other_allowance: number;
  pf: boolean;
  esi: boolean;
  tds: number;
  other_deduction: number;
  bank_name: string;
  account_no: string;
  ifsc: string;
  pan: string;
}

export interface Payslip {
  id: string;
  month: string;
  staff_id: string;
  staff_name: string;
  emp_code: string | null;
  designation: string | null;
  days_in_month: number;
  lop_days: number;
  lop_manual: boolean;
  paid_days: number;
  earnings: { basic: number; hra: number; da: number; other: number; bonus: number };
  deductions: { pf: number; esi: number; tds: number; other: number; advance: number };
  bonus: number;
  advance: number;
  gross: number;
  total_deductions: number;
  net: number;
  status: "draft" | "paid";
  paid_on: string | null;
  pay_mode: string | null;
  pay_ref: string | null;
}

export interface PayrollRow {
  staffId: string;
  empCode: string;
  name: string;
  designation: string;
  department: string;
  status: string;
  structure: SalaryStructure | null;
  slip: Payslip | null;
}

type Done = { success: boolean; error?: string };
const done = async <T extends Done>(p: Promise<{ ok: boolean; data?: T; error?: string }>): Promise<T> => {
  const r = await p;
  return r.ok && r.data?.success ? r.data : ({ success: false, error: r.data?.error || r.error || "Could not reach the server." } as T);
};

export const payrollService = {
  async month(month: string): Promise<{ rows: PayrollRow[]; setupNeeded: boolean; error?: string; denied?: boolean }> {
    const r = await api.get<{ rows: PayrollRow[]; setupNeeded: boolean }>(`/api/payroll?month=${month}`);
    if (r.status === 403) return { rows: [], setupNeeded: false, denied: true };
    return r.ok && r.data ? r.data : { rows: [], setupNeeded: false, error: r.error };
  },
  saveStructure: (staffId: string, s: SalaryStructure) => done(api.put<Done>(`/api/payroll/structure/${staffId}`, s)),
  generate: (month: string) => done(api.post<Done & { made?: number; paid?: number; noSalary?: number }>("/api/payroll/generate", { month })),
  updateSlip: (id: string, b: { lopDays: string; bonus: string; advance: string }) => done(api.patch<Done>(`/api/payroll/slips/${id}`, b)),
  pay: (ids: string[], paidOn: string, mode: string, ref: string) => done(api.post<Done & { paid?: number }>("/api/payroll/pay", { ids, paidOn, mode, ref })),
  undoPay: (id: string) => done(api.post<Done>(`/api/payroll/slips/${id}/undo-pay`)),
};
