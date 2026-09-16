import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { DbInstitutionSettings } from "@/lib/types/database";

const DEFAULT_SETTINGS: DbInstitutionSettings = {
  id: "inst-default",
  school_name: "Mother Teresa Nobles Academy Sr. Sec. School",
  school_code: "1040211",
  account_code: "SLRJ0402749",
  affiliation_no: "CBSE-1730045",
  address: "RAM NAGAR, Barmer, Rajasthan 344001",
  contact_phone: "8769444584",
  contact_email: "mtnabarmer@gmail.com",
  active_session: "2026-2027",
  sms_wallet_balance: 5153,
  dlt_entity_id: "1401568294901",
  director_otp_mobile: "8769444584",
};

export const schoolService = {
  async fetchSettings(): Promise<{ data: DbInstitutionSettings; isLive: boolean }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("institution_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          return { data, isLive: true };
        }
      } catch (err: any) {
        console.warn("Supabase fetchSettings error:", err);
      }
    }

    return { data: DEFAULT_SETTINGS, isLive: false };
  },

  async updateSettings(updates: Partial<DbInstitutionSettings>): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("institution_settings")
          .update(updates)
          .eq("account_code", "SLRJ0402749");

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    Object.assign(DEFAULT_SETTINGS, updates);
    return { success: true };
  },
};
