import { api } from "@/lib/apiClient";

export interface SchoolProfile {
  school_name: string;
  short_name: string;
  board: string;
  affiliation_no: string;
  school_code: string;
  udise_code: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  contact1: string;
  contact2: string;
  email: string;
  website: string;
  logo_url: string;
  principal_name: string;
  updated_at?: string | null;
}

/** Shown until the backend answers, and when nothing is saved yet (the numbers are demo placeholders). */
export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  school_name: "St. Paul School",
  short_name: "SPS",
  board: "CBSE",
  affiliation_no: "1730512",
  school_code: "10492",
  udise_code: "",
  address: "",
  city: "Barmer",
  district: "Barmer",
  state: "Rajasthan",
  pincode: "344001",
  contact1: "",
  contact2: "",
  email: "",
  website: "",
  logo_url: "",
  principal_name: "",
};

export interface Holiday {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string | null;
}

export const schoolProfileService = {
  async getProfile(): Promise<SchoolProfile & { saved?: boolean; setupNeeded?: boolean }> {
    const res = await api.get<SchoolProfile & { saved: boolean; setupNeeded: boolean }>("/api/school");
    return res.ok && res.data ? { ...DEFAULT_SCHOOL_PROFILE, ...res.data } : DEFAULT_SCHOOL_PROFILE;
  },

  async updateProfile(profile: SchoolProfile): Promise<{ success: boolean; data?: SchoolProfile & { partial?: boolean }; error?: string }> {
    const res = await api.put<{ success: boolean; data?: SchoolProfile & { partial?: boolean }; error?: string }>("/api/school", profile);
    return res.ok && res.data?.success ? { success: true, data: res.data.data } : { success: false, error: res.data?.error || res.error || "Could not save." };
  },

  async session(): Promise<{ session: { code: string; label: string; start: string; end: string }; holidays: Holiday[]; error?: string }> {
    const res = await api.get<{ session: { code: string; label: string; start: string; end: string }; holidays: Holiday[]; error?: string }>("/api/school/session");
    if (res.data?.session) return res.data;
    return { session: { code: "2026-2027", label: "2026-27", start: "2026-04-01", end: "2027-03-31" }, holidays: [], error: res.error };
  },

  async addHoliday(title: string, start: string, end: string): Promise<{ success: boolean; data?: Holiday; error?: string }> {
    const res = await api.post<{ success: boolean; data?: Holiday; error?: string }>("/api/school/holidays", { title, start, end });
    return res.ok && res.data?.success ? { success: true, data: res.data.data } : { success: false, error: res.data?.error || res.error || "Could not add." };
  },

  async removeHoliday(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await api.del<{ success: boolean; error?: string }>(`/api/school/holidays/${id}`);
    return res.ok && res.data?.success ? { success: true } : { success: false, error: res.data?.error || res.error || "Could not remove." };
  },
};
