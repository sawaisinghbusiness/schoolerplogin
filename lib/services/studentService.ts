import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Student, MOCK_STUDENTS } from "@/data/mockData";
import { DbStudent } from "@/lib/types/database";

// In-memory cache/mock store for when Supabase is in demo/fallback mode
let localStudents: Student[] = [...MOCK_STUDENTS];

export function mapDbToStudent(db: DbStudent): Student {
  return {
    id: db.id || db.admission_no,
    photoUrl: db.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    name: db.name,
    srNo: db.sr_no,
    admissionNo: db.admission_no,
    rollNo: db.roll_no || "",
    class: db.class,
    section: db.section,
    classSec: db.class_sec || `${db.class} - ${db.section}`,
    fatherName: db.father_name,
    motherName: db.mother_name || "",
    guardianName: db.guardian_name || db.father_name,
    contact: db.contact,
    mobile: db.mobile,
    address: db.address || "",
    penNo: db.pen_no || "",
    gender: db.gender || "Male",
    dob: db.dob || "",
    category: db.category || "General",
    house: db.house || "Tagore",
    transportOpted: Boolean(db.transport_opted),
    busRoute: db.bus_route,
    status: db.status || "Active",
    totalFee: Number(db.total_fee || 0),
    paidFee: Number(db.paid_fee || 0),
    balanceFee: Number(db.balance_fee || 0),
  };
}

export function mapStudentToDb(student: Partial<Student>): Partial<DbStudent> {
  return {
    name: student.name,
    sr_no: student.srNo,
    admission_no: student.admissionNo,
    roll_no: student.rollNo,
    class: student.class,
    section: student.section,
    class_sec: student.classSec || (student.class && student.section ? `${student.class} - ${student.section}` : undefined),
    father_name: student.fatherName,
    mother_name: student.motherName,
    guardian_name: student.guardianName,
    contact: student.contact || student.mobile,
    mobile: student.mobile || student.contact,
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
    total_fee: student.totalFee,
    paid_fee: student.paidFee,
    balance_fee: student.balanceFee,
  };
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
  }): Promise<{ data: Student[]; isLive: boolean; error: string | null }> {
    const { query, className, section } = options || {};

    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false });

        if (className) {
          q = q.eq("class", className);
        }
        if (section) {
          q = q.eq("section", section);
        }
        if (query && query.trim() !== "") {
          const term = query.trim();
          // Multi-column search supported by indexes in schema.sql
          q = q.or(
            `name.ilike.%${term}%,sr_no.ilike.%${term}%,admission_no.ilike.%${term}%,mobile.ilike.%${term}%,father_name.ilike.%${term}%`
          );
        }

        const { data, error } = await q;

        if (error) {
          console.warn("Supabase query error, using local fallback:", error.message);
          return { data: filterLocalStudents(query, className, section), isLive: false, error: error.message };
        }

        if (data && data.length > 0) {
          return { data: data.map(mapDbToStudent), isLive: true, error: null };
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
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

  /**
   * Insert new student
   */
  async createStudent(newStudent: Partial<Student>): Promise<{ success: boolean; data?: Student; error?: string }> {
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

    // Local store mock insert
    const mockStudent: Student = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      photoUrl: newStudent.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
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
  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; error?: string }> {
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
