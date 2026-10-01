import { api } from "@/lib/apiClient";

/** Staff records. Talks only to the backend (/api/staff). */

export type StaffType = "teaching" | "non_teaching";

export interface Assignment {
  classSec: string;
  subject: string;
}

export interface StaffMember {
  id: string;
  empCode: string;
  name: string;
  staffType: StaffType;
  department: string;
  designation: string;
  mobile: string;
  altMobile: string;
  email: string;
  qualification: string;
  joiningDate: string;
  gender: string;
  dob: string;
  address: string;
  experienceYears: number | null;
  status: "Active" | "On Leave" | "Relieved";
  relievedOn: string;
  notes: string;
  login: { userId: string; role: string; active: boolean } | null;
  classTeacherOf: string | null;
  subjects: Assignment[];
}

export type StaffInput = Partial<Omit<StaffMember, "id" | "status" | "relievedOn" | "login" | "classTeacherOf" | "subjects">>;

export const DESIGNATIONS: Record<StaffType, string[]> = {
  teaching: ["Principal", "Vice Principal", "PGT", "TGT", "PRT", "NTT", "Teacher", "Sports Teacher", "Music Teacher", "Librarian", "Counsellor"],
  non_teaching: ["Office Clerk", "Accountant", "Receptionist", "Lab Assistant", "Computer Operator", "Driver", "Conductor", "Peon", "Ayah", "Guard", "Sweeper"],
};

type R<T> = { data?: T; error?: string };
const res = <T>(r: { ok: boolean; data?: any; error?: string }, pick: (d: any) => T): R<T> => (r.ok ? { data: pick(r.data) } : { error: r.error });

export const staffService = {
  async list(): Promise<{ data: StaffMember[]; setupNeeded: boolean; error?: string }> {
    const r = await api.get<{ data: StaffMember[]; setupNeeded: boolean }>("/api/staff");
    return r.ok && r.data ? r.data : { data: [], setupNeeded: false, error: r.error };
  },
  async nextCode(): Promise<string> {
    const r = await api.get<{ code: string }>("/api/staff/next-code");
    return r.data?.code || "";
  },
  async create(input: StaffInput): Promise<R<StaffMember>> {
    return res(await api.post("/api/staff", input), (d) => d.data);
  },
  async update(id: string, input: StaffInput): Promise<R<StaffMember>> {
    return res(await api.patch(`/api/staff/${id}`, input), (d) => d.data);
  },
  async relieve(id: string, date: string): Promise<R<StaffMember>> {
    return res(await api.post(`/api/staff/${id}/relieve`, { date }), (d) => d.data);
  },
  async rejoin(id: string): Promise<R<StaffMember>> {
    return res(await api.post(`/api/staff/${id}/rejoin`), (d) => d.data);
  },
  async setAssignments(id: string, classTeacherOf: string | null, subjects: Assignment[]): Promise<R<{ staff: StaffMember; movedFrom: string | null }>> {
    return res(await api.put(`/api/staff/${id}/assignments`, { classTeacherOf, subjects }), (d) => ({ staff: d.staff, movedFrom: d.movedFrom }));
  },
  async createLogin(id: string, role: string, password: string): Promise<R<StaffMember>> {
    return res(await api.post(`/api/staff/${id}/login`, { role, password }), (d) => d.data);
  },
  async remove(id: string): Promise<{ error?: string }> {
    const r = await api.del(`/api/staff/${id}`);
    return r.ok ? {} : { error: r.error };
  },
};
