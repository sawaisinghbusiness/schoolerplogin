import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface SectionItem {
  id: string;
  name: string;
  subjects: string[];
}

export interface ClassItem {
  id: string;
  name: string;
  orderSeq?: number;
  sections: SectionItem[];
}

export const classService = {
  /**
   * Fetch all classes and their sections directly from Supabase
   */
  async fetchClasses(): Promise<{
    data: ClassItem[];
    tableMissing: boolean;
    error?: string;
  }> {
    if (!isSupabaseConfigured) {
      return {
        data: [],
        tableMissing: true,
        error: "Supabase credentials are not configured in .env.local",
      };
    }

    try {
      // 1. Fetch classes ordered by sequence
      const { data: dbClasses, error: clsErr } = await supabase
        .from("classes")
        .select("id, name, order_seq")
        .order("order_seq", { ascending: true });

      if (clsErr) {
        const isMissing =
          clsErr.code === "PGRST205" ||
          clsErr.message.includes("does not exist") ||
          clsErr.message.includes("schema cache");
        return { data: [], tableMissing: isMissing, error: clsErr.message };
      }

      if (!dbClasses || dbClasses.length === 0) {
        return { data: [], tableMissing: false };
      }

      // 2. Fetch sections for these classes
      const { data: dbSections, error: secErr } = await supabase
        .from("sections")
        .select("id, class_id, name, subjects")
        .order("name", { ascending: true });

      if (secErr) {
        return { data: [], tableMissing: false, error: secErr.message };
      }

      // 3. Map into nested ClassItem structure
      const mapped: ClassItem[] = dbClasses.map((c: any) => {
        const classSections = (dbSections || [])
          .filter((s: any) => s.class_id === c.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            subjects: Array.isArray(s.subjects) ? s.subjects : [],
          }));

        return {
          id: c.id,
          name: c.name,
          orderSeq: c.order_seq,
          sections: classSections,
        };
      });

      return { data: mapped, tableMissing: false };
    } catch (err: any) {
      return {
        data: [],
        tableMissing: false,
        error: err.message || "Failed to fetch classes from Supabase",
      };
    }
  },

  /**
   * Insert a new class and its default sections in Supabase
   */
  async createClass(
    className: string,
    sectionNames: string[],
    defaultSubjects: string[]
  ): Promise<{ success: boolean; data?: ClassItem; error?: string }> {
    try {
      // Insert class
      const { data: insertedClass, error: clsErr } = await supabase
        .from("classes")
        .insert({
          name: className.trim(),
          order_seq: Date.now() % 100000,
        })
        .select()
        .single();

      if (clsErr) {
        return { success: false, error: clsErr.message };
      }

      const sectionsToInsert = (sectionNames.length > 0 ? sectionNames : ["A"]).map(
        (sec) => ({
          class_id: insertedClass.id,
          name: sec.trim().toUpperCase(),
          subjects: defaultSubjects,
        })
      );

      const { data: insertedSections, error: secErr } = await supabase
        .from("sections")
        .insert(sectionsToInsert)
        .select();

      if (secErr) {
        return { success: false, error: secErr.message };
      }

      const newClassItem: ClassItem = {
        id: insertedClass.id,
        name: insertedClass.name,
        orderSeq: insertedClass.order_seq,
        sections: (insertedSections || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          subjects: s.subjects || [],
        })),
      };

      return { success: true, data: newClassItem };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Rename a class in Supabase
   */
  async updateClass(
    classId: string,
    newName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("classes")
        .update({ name: newName.trim() })
        .eq("id", classId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete class and cascade delete sections in Supabase
   */
  async deleteClass(classId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("classes").delete().eq("id", classId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Add new sections to an existing class
   */
  async addSections(
    classId: string,
    sectionNames: string[],
    defaultSubjects: string[]
  ): Promise<{ success: boolean; data?: SectionItem[]; error?: string }> {
    try {
      const sectionsToInsert = sectionNames.map((sec) => ({
        class_id: classId,
        name: sec.trim().toUpperCase(),
        subjects: defaultSubjects,
      }));

      const { data, error } = await supabase
        .from("sections")
        .insert(sectionsToInsert)
        .select();

      if (error) return { success: false, error: error.message };

      return {
        success: true,
        data: (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          subjects: s.subjects || [],
        })),
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete a section from Supabase
   */
  async deleteSection(sectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("sections").delete().eq("id", sectionId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Rename a section
   */
  async renameSection(
    sectionId: string,
    newName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("sections")
        .update({ name: newName.trim().toUpperCase() })
        .eq("id", sectionId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Update subjects list for a section directly in Supabase
   */
  async updateSectionSubjects(
    sectionId: string,
    subjects: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("sections")
        .update({ subjects })
        .eq("id", sectionId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Reorder classes
   */
  async reorderClasses(
    orderedClasses: { id: string; orderSeq: number }[]
  ): Promise<void> {
    try {
      for (const item of orderedClasses) {
        await supabase
          .from("classes")
          .update({ order_seq: item.orderSeq })
          .eq("id", item.id);
      }
    } catch (err) {
      console.warn("Error reordering classes in Supabase:", err);
    }
  },
};
