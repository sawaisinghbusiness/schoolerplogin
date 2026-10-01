import { api } from "@/lib/apiClient";

export type UserRole = "admin" | "accountant" | "teacher" | "exam_cell" | "parent" | "student";

export interface AppUser {
  id: string;
  full_name: string;
  role: UserRole;
  phone_number: string | null;
  employee_code: string | null;
  admission_no: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string | null;
}

export interface UserInput {
  full_name?: string;
  role?: UserRole;
  phone_number?: string;
  employee_code?: string;
  admission_no?: string;
  is_active?: boolean;
  password?: string;
}

/** What each role can open — matches the checks in the backend routes. */
export const ROLE_INFO: Record<UserRole, { label: string; badge: string; can: string; staff: boolean }> = {
  admin: { label: "Admin", badge: "badge-brand", staff: true, can: "Everything: students, fees, fee setup, settings and these user accounts." },
  accountant: { label: "Accounts", badge: "badge-emerald", staff: true, can: "Collects fees and prints receipts, handles enquiries. Sees students and reports." },
  teacher: { label: "Teacher", badge: "badge-sky", staff: true, can: "Marks attendance and issues gate passes. Sees students and reports." },
  exam_cell: { label: "Exam cell", badge: "badge-violet", staff: true, can: "Sees students and reports. Marks entry will open for them with Exams." },
  parent: { label: "Parent", badge: "badge-amber", staff: false, can: "For the parent app (coming). Cannot open any office screen." },
  student: { label: "Student", badge: "badge-slate", staff: false, can: "For the student app (coming). Cannot open any office screen." },
};

export const ROLE_ORDER: UserRole[] = ["admin", "accountant", "teacher", "exam_cell", "parent", "student"];

/** A password that is easy to read out over the phone: Word + 4 digits + word. */
export function suggestPassword(): string {
  const words = ["Thar", "Barmer", "Desert", "Camel", "Marigold", "Sunrise", "Peacock", "Mango", "River", "Lotus", "Banyan", "Kesar"];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  return `${pick()}${Math.floor(1000 + Math.random() * 9000)}${pick().toLowerCase()}`;
}

/** Same rules as the backend; returns a message when too weak. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (pw.length > 72) return "Use at most 72 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Use both letters and numbers.";
  if (/^(admin|teacher|accounts|student|password)@?123$/i.test(pw)) return "That password is too easy to guess.";
  return null;
}

export const userService = {
  async list(): Promise<{ data: AppUser[]; error?: string; status?: number }> {
    const r = await api.get<{ data: AppUser[] }>("/api/users");
    return r.ok ? { data: r.data?.data || [] } : { data: [], error: r.error, status: r.status };
  },
  async create(input: UserInput): Promise<{ data?: AppUser; error?: string }> {
    const r = await api.post<{ data: AppUser }>("/api/users", input);
    return r.ok ? { data: r.data?.data } : { error: r.error };
  },
  async update(id: string, input: UserInput): Promise<{ data?: AppUser; error?: string }> {
    const r = await api.patch<{ data: AppUser }>(`/api/users/${id}`, input);
    return r.ok ? { data: r.data?.data } : { error: r.error };
  },
  async resetPassword(id: string, password: string): Promise<{ error?: string }> {
    const r = await api.post(`/api/users/${id}/password`, { password });
    return r.ok ? {} : { error: r.error };
  },
  async changeOwnPassword(current: string, next: string): Promise<{ error?: string }> {
    const r = await api.post("/api/auth/password", { current, next });
    return r.ok ? {} : { error: r.error };
  },
  async me(): Promise<{ id: string; role: UserRole } | null> {
    const r = await api.get<{ user?: { id: string; role: UserRole } }>("/api/auth/me");
    return r.ok && r.data?.user ? r.data.user : null;
  },
};
