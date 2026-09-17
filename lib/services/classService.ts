import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface SectionItem {
  id: string;
  name: string;
  subjects: string[];
}

export interface ClassItem {
  id: string;
  name: string;
  sections: SectionItem[];
  orderSeq?: number;
}

const STORAGE_KEY = "school_classes_data";

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "cls-1",
    name: "1",
    sections: [
      {
        id: "sec-1-a",
        name: "A",
        subjects: ["Mathematics", "English", "Hindi", "ENVIRONMENT STUDIES"],
      },
      {
        id: "sec-1-b",
        name: "B",
        subjects: ["Mathematics", "English", "Hindi", "ENVIRONMENT STUDIES"],
      },
    ],
  },
  {
    id: "cls-2",
    name: "2",
    sections: [
      {
        id: "sec-2-a",
        name: "A",
        subjects: ["Mathematics", "English", "Hindi", "ENVIRONMENT STUDIES"],
      },
      {
        id: "sec-2-b",
        name: "B",
        subjects: ["Mathematics", "English", "Hindi", "ENVIRONMENT STUDIES"],
      },
    ],
  },
  {
    id: "cls-12",
    name: "12",
    sections: [
      {
        id: "sec-12-maths",
        name: "MATHS",
        subjects: ["Mathematics", "Physics", "Chemistry", "English", "Hindi"],
      },
      {
        id: "sec-12-bio-a",
        name: "BIO A",
        subjects: ["Physics", "Chemistry", "Biology", "English", "Hindi"],
      },
      {
        id: "sec-12-bio-b",
        name: "BIO B",
        subjects: ["Physics", "Chemistry", "Biology", "English", "Hindi"],
      },
      {
        id: "sec-12-agri",
        name: "AGRICULTURE",
        subjects: [
          "English",
          "Hindi",
          "AGRICULTURE",
          "Agriculture Chemistry",
          "Agriculture Biology",
        ],
      },
      {
        id: "sec-12-arts-a",
        name: "ARTS A",
        subjects: [
          "History",
          "Geography",
          "English",
          "Hindi",
          "Political Science",
        ],
      },
      {
        id: "sec-12-arts-b",
        name: "ARTS B",
        subjects: [
          "Geography",
          "English",
          "Hindi",
          "HINDI LIT.",
          "Political Science",
        ],
      },
    ],
  },
];

export const classService = {
  getStoredClasses(): ClassItem[] {
    if (typeof window === "undefined") return INITIAL_CLASSES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading classes from localStorage:", e);
    }
    // Initialize default if nothing stored
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  },

  async fetchClasses(): Promise<{ data: ClassItem[]; isLive: boolean }> {
    const local = this.getStoredClasses();

    if (isSupabaseConfigured) {
      try {
        const { data: dbClasses, error: clsErr } = await supabase
          .from("classes")
          .select("id, name, order_seq")
          .order("order_seq", { ascending: true });

        if (!clsErr && dbClasses && dbClasses.length > 0) {
          // Fetch sections
          const { data: dbSections, error: secErr } = await supabase
            .from("sections")
            .select("id, class_id, name");

          const mapped: ClassItem[] = dbClasses.map((c: any) => {
            const classSections = (dbSections || [])
              .filter((s: any) => s.class_id === c.id)
              .map((s: any) => {
                // Find matching local subjects if available
                const localCls = local.find(
                  (lc) => lc.name.toLowerCase() === c.name.toLowerCase()
                );
                const localSec = localCls?.sections.find(
                  (ls) => ls.name.toLowerCase() === s.name.toLowerCase()
                );
                return {
                  id: s.id,
                  name: s.name,
                  subjects: localSec?.subjects || ["Mathematics", "English", "Hindi"],
                };
              });

            return {
              id: c.id,
              name: c.name,
              orderSeq: c.order_seq,
              sections: classSections,
            };
          });

          return { data: mapped, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase fetchClasses fallback to local:", err);
      }
    }

    return { data: local, isLive: false };
  },

  async saveClasses(classes: ClassItem[]): Promise<boolean> {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
      } catch (e) {
        console.error("Failed to save classes to localStorage:", e);
      }
    }

    if (isSupabaseConfigured) {
      try {
        // Attempt upsert to Supabase if tables are present
        const dbClasses = classes.map((c, index) => ({
          name: c.name,
          order_seq: c.orderSeq ?? index + 1,
        }));
        await supabase.from("classes").upsert(dbClasses, { onConflict: "name" });
      } catch (err) {
        // Silent catch for live sync
      }
    }

    return true;
  },
};
