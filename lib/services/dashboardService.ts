import { api } from "@/lib/apiClient";

export interface Dashboard {
  generatedAt: string;
  students: { total: number; boys: number; girls: number; bus: number };
  fees: {
    sessionTotal: number;
    sessionPaid: number;
    sessionDue: number;
    dueStudents: number;
    thisMonth: number;
    lastMonth: number;
    byMonth: { month: string; amount: number }[];
    byMode: { Cash: number; UPI: number; Cheque: number; Other: number };
    topDueClasses: { class: string; due: number }[];
  };
  today: { receipts: number; amount: number };
  attention: {
    chequesThisWeek: { count: number; amount: number };
    birthdaysToday: { name: string; classSec: string }[];
    sectionsTotal: number;
    sectionsMarkedToday: number;
  };
}

export const dashboardService = {
  async get(): Promise<{ data: Dashboard | null; error?: string }> {
    const res = await api.get<{ data: Dashboard }>("/api/dashboard");
    return res.ok && res.data ? { data: res.data.data } : { data: null, error: res.error || "Could not load the dashboard." };
  },
};
