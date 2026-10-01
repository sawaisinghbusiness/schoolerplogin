import { api } from "@/lib/apiClient";

/** Staff attendance and leave. Talks only to the backend (/api/staff-attendance). */

export type StaffAttStatus = "Present" | "Absent" | "On Leave" | "Half Day";
export type Mark = "P" | "A" | "L" | "H";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export const LEAVE_TYPES = ["Casual", "Sick", "Earned", "Other"];

export interface DayStaff {
  id: string;
  empCode: string;
  name: string;
  designation: string;
  staffType: "teaching" | "non_teaching";
  status: StaffAttStatus | null;
  inTime: string;
  outTime: string;
  remark: string;
  leave: { id: string; type: string; from: string; to: string; status: LeaveStatus } | null;
}

export interface StaffDay {
  date: string;
  today: string;
  sunday: boolean;
  holiday: string | null;
  marked: number;
  markedAt: string | null;
  markedBy: string | null;
  staff: DayStaff[];
}

export interface RegisterDay {
  date: string;
  weekday: string;
  sunday: boolean;
  holiday: string | null;
  marked: boolean;
  present: number;
  absent: number;
  leave: number;
  half: number;
}
export interface RegisterStaff {
  id: string;
  empCode: string;
  name: string;
  designation: string;
  marks: Record<string, Mark>;
  present: number;
  absent: number;
  leave: number;
  half: number;
  days: number;
}
export interface StaffRegister {
  month: string;
  days: RegisterDay[];
  staff: RegisterStaff[];
  totals: { workingDays: number; schoolDays: number };
}

export interface StaffLeave {
  id: string;
  staffId: string;
  name: string;
  empCode: string;
  designation: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  processedBy: string;
  processedAt: string | null;
  remarks: string;
  createdAt: string;
}
export interface LeaveList {
  today: string;
  data: StaffLeave[];
  staff: { id: string; empCode: string; name: string; designation: string }[];
}

export interface DayMark {
  staffId: string;
  status: StaffAttStatus;
  inTime?: string;
  outTime?: string;
  remark?: string;
}
export interface LeaveInput {
  staffId: string;
  leaveType: string;
  from: string;
  to: string;
  reason: string;
  approve?: boolean;
}

/** A load either gives data, says the SQL is missing, or fails. */
export type Loaded<T> = { data: T; setupNeeded?: false; error?: undefined } | { data?: undefined; setupNeeded: true; error?: undefined } | { data?: undefined; setupNeeded?: false; error: string };

async function load<T>(path: string, what: string): Promise<Loaded<T>> {
  const r = await api.get<any>(path);
  if (!r.ok || !r.data) return { error: r.error || `Could not load ${what}.` };
  if (r.data.setupNeeded) return { setupNeeded: true };
  return { data: r.data as T };
}

type Saved<T> = { success: true; data: T } | { success: false; error: string };
async function send<T>(path: string, body: unknown): Promise<Saved<T>> {
  const r = await api.post<{ success: boolean; data: T; error?: string }>(path, body);
  return r.ok && r.data?.success ? { success: true, data: r.data.data } : { success: false, error: r.error || "Could not save." };
}

export const staffAttendanceService = {
  day: (date: string) => load<StaffDay>(`/api/staff-attendance/day?date=${date}`, "the staff list"),
  saveDay: (date: string, marks: DayMark[]) => send<{ saved: number; present: number; absent: number; leave: number; half: number }>("/api/staff-attendance/day", { date, marks }),
  month: (month: string) => load<StaffRegister>(`/api/staff-attendance/month?month=${month}`, "the register"),
  leaves: () => load<LeaveList>("/api/staff-attendance/leaves", "leave"),
  recordLeave: (input: LeaveInput) => send<{ leave: StaffLeave; written: number; kept: number }>("/api/staff-attendance/leaves", input),
  decide: (id: string, decision: "Approved" | "Rejected", remark: string) => send<{ leave: StaffLeave; written: number; kept: number }>(`/api/staff-attendance/leaves/${id}/decide`, { decision, remark }),
};

/* ── Small shared helpers ── */

export const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const at = (d: string) => new Date(d + "T00:00:00");
export const shortDate = (d: string) => at(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const longDate = (d: string) => at(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const monthLabel = (m: string) => at(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
export const clock = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
export function shiftDate(d: string, n: number) {
  const x = at(d);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
export function shiftMonth(m: string, by: number) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1 + by, 1)).toISOString().slice(0, 7);
}
/** Leave days: calendar days from–to, not counting Sundays (same rule as the backend). */
export function leaveDays(from: string, to: string) {
  if (!from || !to || to < from) return 0;
  let n = 0;
  for (let d = from, i = 0; d <= to && i < 400; d = shiftDate(d, 1), i++) if (at(d).getDay() !== 0) n++;
  return n;
}
export const firstName = (by: string | null) => (by || "").split(" (")[0];
