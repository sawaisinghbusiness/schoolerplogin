import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Student, MOCK_STUDENTS } from "@/data/mockData";
import { api, usingRemoteBackend } from "@/lib/apiClient";

// In-memory cache/mock store for when Supabase is in demo/fallback mode
let localStudents: Student[] = [...MOCK_STUDENTS];

export function mapDbToStudent(db: any): Student {
  // Schema uses `class` + `section`; keep legacy `class_name` as a fallback.
  const className = db.class || db.class_name || "10th";
  const section = db.section || "A";
  // Schema stores the phone in `mobile` (and `contact`); keep legacy `contact_phone` too.
  const mobile = db.mobile || db.contact || db.contact_phone || "9829012345";
  // Fees live in the joined `fee_ledger` row, not on students. When the caller
  // selects `students(*, fee_ledger(*))`, Supabase nests it under `fee_ledger`.
  const ledger = Array.isArray(db.fee_ledger) ? db.fee_ledger[0] : db.fee_ledger;
  const totalFee = Number(ledger?.total_fee ?? db.total_fee ?? 0);
  const paidFee = Number(ledger?.paid_fee ?? db.paid_fee ?? 0);
  const discountFee = Number(ledger?.discount_fee ?? 0);
  const balanceFee =
    ledger?.balance_fee !== undefined && ledger?.balance_fee !== null
      ? Number(ledger.balance_fee)
      : Math.max(0, totalFee - paidFee - discountFee);

  return {
    id: db.id || db.admission_no,
    photoUrl: db.photo_url || "",
    name: db.name || "Student",
    srNo: db.sr_no || "",
    admissionNo: db.admission_no || "",
    rollNo: db.roll_no ? String(db.roll_no) : "",
    class: className,
    section: section,
    classSec: db.class_sec || `${className} - ${section}`,
    fatherName: db.father_name || "",
    motherName: db.mother_name || "",
    guardianName: db.guardian_name || db.father_name || "",
    contact: db.contact || mobile,
    mobile: mobile,
    address: db.address || "Barmer, Rajasthan",
    penNo: db.pen_no || "",
    gender: db.gender || "Male",
    dob: db.dob || "2010-01-01",
    category: db.category || "General",
    house: db.house || "Tagore",
    transportOpted: Boolean(db.transport_opted ?? db.uses_transport),
    busRoute: db.bus_route,
    status: db.status || "Active",
    totalFee: totalFee,
    paidFee: paidFee,
    balanceFee: balanceFee,
  };
}

// Maps only to columns that exist on the `students` table (see supabase/schema.sql).
// Fee figures are NOT stored here — they belong to `fee_ledger` and are written
// through feeService. Undefined keys are stripped so partial updates don't clobber.
export function mapStudentToDb(student: Partial<Student>): Record<string, any> {
  const className = student.class || "10th";
  const section = student.section || "A";
  const phone = student.mobile || student.contact || "9829012345";

  const payload: Record<string, any> = {
    name: student.name,
    sr_no: student.srNo,
    admission_no: student.admissionNo,
    roll_no: student.rollNo,
    class: className,
    section: section,
    class_sec: student.classSec || `${className} - ${section}`,
    father_name: student.fatherName,
    mother_name: student.motherName,
    guardian_name: student.guardianName,
    contact: student.contact || phone,
    mobile: phone,
    address: student.address,
    pen_no: student.penNo,
    gender: student.gender,
    dob: student.dob,
    category: student.category,
    house: student.house,
    transport_opted: student.transportOpted,
    bus_route: student.busRoute,
    photo_url: student.photoUrl,
    status: student.status,
  };

  // Drop undefined so an update of one field doesn't null out the others.
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  return payload;
}

export const studentService = {
  /**
   * Fetch students with optional keyword and class filter.
   * Connects to Supabase if credentials exist; otherwise gracefully falls back to mock data.
   */
  async fetchStudents(options?: {
    query?: string;
    className?: string;
    section?: string;
    /** Cap the number of rows (search boxes); omit to get every match. */
    limit?: number;
  }): Promise<{ data: Student[]; isLive: boolean; error: string | null }> {
    const { query, className, section, limit } = options || {};

    // Preferred path: the backend server.
    if (usingRemoteBackend) {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (limit) params.set("limit", String(limit));
      if (className) params.set("class", className);
      if (section) params.set("section", section);
      const qs = params.toString();
      const res = await api.get<{ data: Student[] }>(`/api/students${qs ? `?${qs}` : ""}`);
      if (res.ok && res.data) {
        return { data: res.data.data, isLive: true, error: null };
      }
      return { data: [], isLive: false, error: res.error || "Failed to load students" };
    }

    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from("students")
          .select("*, fee_ledger(total_fee, paid_fee, discount_fee, balance_fee)")
          .order("created_at", { ascending: false });

        if (className) {
          q = q.eq("class", className);
        }
        if (section) {
          q = q.eq("section", section);
        }
        if (query && query.trim() !== "") {
          const term = query.trim();
          q = q.or(
            `name.ilike.%${term}%,sr_no.ilike.%${term}%,admission_no.ilike.%${term}%,father_name.ilike.%${term}%`
          );
        }

        const { data, error } = await q;

        if (error) {
          console.warn("Supabase query error, using local fallback:", error.message);
          return { data: filterLocalStudents(query, className, section), isLive: false, error: error.message };
        }

        if (data && data.length > 0) {
          let mapped = data.map(mapDbToStudent);
          if (query && query.trim() !== "") {
            const qLower = query.trim().toLowerCase();
            mapped = mapped.filter(
              (s) =>
                s.name.toLowerCase().includes(qLower) ||
                s.srNo.toLowerCase().includes(qLower) ||
                s.admissionNo.toLowerCase().includes(qLower) ||
                s.mobile.includes(qLower) ||
                s.fatherName.toLowerCase().includes(qLower)
            );
          }
          return { data: mapped, isLive: true, error: null };
        }
      } catch (err: any) {
        console.warn("Supabase connection exception:", err);
      }
    }

    // Local fallback
    return {
      data: filterLocalStudents(query, className, section),
      isLive: false,
      error: null,
    };
  },

  /**
   * Fetch single student by ID, admission number, or SR number
   */
  async fetchStudentById(id: string): Promise<{ data: Student | null; isLive: boolean; error: string | null }> {
    if (usingRemoteBackend) {
      const res = await api.get<{ data: Student }>(`/api/students/${encodeURIComponent(id)}`);
      if (res.ok && res.data) return { data: res.data.data, isLive: true, error: null };
      if (res.status === 404) return { data: null, isLive: true, error: null };
      return { data: null, isLive: false, error: res.error || "Failed to load student" };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*, fee_ledger(total_fee, paid_fee, discount_fee, balance_fee)")
          .or(`id.eq.${id},admission_no.eq.${id},sr_no.eq.${id}`)
          .maybeSingle();

        if (data && !error) {
          return { data: mapDbToStudent(data), isLive: true, error: null };
        }
      } catch (err: any) {
        console.warn("Supabase getById error:", err);
      }
    }

    const found = localStudents.find(
      (s) => s.id === id || s.admissionNo === id || s.srNo === id
    ) || null;
    return { data: found, isLive: false, error: null };
  },

  /** Excel import straight into the database; existing SR numbers are skipped. */
  async bulkImport(students: Partial<Student>[]): Promise<{ success: boolean; inserted?: number; skipped?: number; invalid?: number; error?: string }> {
    if (!usingRemoteBackend) return { success: false, error: "Import needs the backend server." };
    const res = await api.post<{ success: boolean; inserted: number; skipped: number; invalid: number; error?: string }>("/api/students/bulk", { students });
    if (res.ok && res.data?.success) return { success: true, inserted: res.data.inserted, skipped: res.data.skipped, invalid: res.data.invalid };
    return { success: false, error: res.data?.error || res.error || "Import failed." };
  },

  /**
   * Insert new student
   */
  async createStudent(newStudent: Partial<Student>): Promise<{ success: boolean; data?: Student; error?: string }> {
    if (usingRemoteBackend) {
      const res = await api.post<{ success: boolean; data: Student }>("/api/students", newStudent);
      if (res.ok && res.data?.data) {
        localStudents.unshift(res.data.data);
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.error || "Failed to create student" };
    }

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapStudentToDb(newStudent);
        const { data, error } = await supabase
          .from("students")
          .insert([dbPayload])
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const mapped = mapDbToStudent(data);
        localStudents.unshift(mapped);
        return { success: true, data: mapped };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to create student in database." };
      }
    }

    const mockStudent: Student = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      photoUrl: newStudent.photoUrl || "",
      name: newStudent.name || "Unnamed Student",
      srNo: newStudent.srNo || `SR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      admissionNo: newStudent.admissionNo || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      rollNo: newStudent.rollNo || "01",
      class: newStudent.class || "1st",
      section: newStudent.section || "A",
      classSec: `${newStudent.class || "1st"} - ${newStudent.section || "A"}`,
      fatherName: newStudent.fatherName || "Parent Name",
      motherName: newStudent.motherName || "",
      guardianName: newStudent.guardianName || newStudent.fatherName || "",
      contact: newStudent.contact || newStudent.mobile || "9414000000",
      mobile: newStudent.mobile || newStudent.contact || "9414000000",
      address: newStudent.address || "Barmer, Rajasthan",
      penNo: newStudent.penNo || "",
      gender: newStudent.gender || "Male",
      dob: newStudent.dob || "2015-01-01",
      category: newStudent.category || "General",
      house: newStudent.house || "Tagore",
      transportOpted: Boolean(newStudent.transportOpted),
      busRoute: newStudent.busRoute,
      status: "Active",
      totalFee: newStudent.totalFee || 35000,
      paidFee: newStudent.paidFee || 0,
      balanceFee: (newStudent.totalFee || 35000) - (newStudent.paidFee || 0),
    };

    localStudents.unshift(mockStudent);
    return { success: true, data: mockStudent };
  },

  /**
   * Update student
   */
  /** Promote, detain, pass out or change section for many students at once. */
  async moveStudents(moves: { id: string; class?: string; section?: string; status?: "Active" | "Inactive" }[]): Promise<{ success: boolean; moved?: number; failed?: string[]; error?: string }> {
    const res = await api.post<{ success: boolean; moved: number; failed: string[]; error?: string }>("/api/students/move", { moves });
    if (res.ok && res.data?.success) return { success: true, moved: res.data.moved, failed: res.data.failed };
    return { success: false, error: res.data?.error || res.error || "Could not move the students." };
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; data?: Student; error?: string }> {
    if (usingRemoteBackend) {
      const res = await api.patch<{ success: boolean; data?: Student }>(`/api/students/${encodeURIComponent(id)}`, updates);
      if (res.ok) {
        const idx = localStudents.findIndex((s) => s.id === id || s.admissionNo === id);
        if (idx !== -1) localStudents[idx] = res.data?.data || { ...localStudents[idx], ...updates };
        return { success: true, data: res.data?.data };
      }
      return { success: false, error: res.error || "Failed to update student" };
    }

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapStudentToDb(updates);
        const { error } = await supabase
          .from("students")
          .update(dbPayload)
          .or(`id.eq.${id},admission_no.eq.${id}`);

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const index = localStudents.findIndex((s) => s.id === id || s.admissionNo === id);
    if (index !== -1) {
      localStudents[index] = { ...localStudents[index], ...updates };
    }
    return { success: true };
  },

  /**
   * Delete student
   */
  async deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
    if (usingRemoteBackend) {
      const res = await api.del<{ success: boolean }>(`/api/students/${encodeURIComponent(id)}`);
      if (res.ok) {
        localStudents = localStudents.filter((s) => s.id !== id && s.admissionNo !== id);
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to delete student" };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("students")
          .delete()
          .or(`id.eq.${id},admission_no.eq.${id}`);

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    localStudents = localStudents.filter((s) => s.id !== id && s.admissionNo !== id);
    return { success: true };
  },
};

function filterLocalStudents(query?: string, className?: string, section?: string): Student[] {
  let result = [...localStudents];

  if (className) {
    result = result.filter((s) => s.class.toLowerCase() === className.toLowerCase());
  }
  if (section) {
    result = result.filter((s) => s.section.toLowerCase() === section.toLowerCase());
  }
  if (query && query.trim() !== "") {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.srNo.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.mobile.includes(q) ||
        s.fatherName.toLowerCase().includes(q)
    );
  }

  return result;
}
