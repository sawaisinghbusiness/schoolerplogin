import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "staff_schedules.json");

function readLocalBackendSchedules(): Record<string, any> {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading staff_schedules.json:", e);
  }
  return {};
}

function writeLocalBackendSchedules(data: Record<string, any>) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing staff_schedules.json:", e);
  }
}

export async function GET() {
  const localSchedules = readLocalBackendSchedules();
  const supabaseSchedules: Record<string, any> = {};

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("employee_code, schedule");

      if (!error && data && data.length > 0) {
        for (const row of data) {
          if (row.employee_code && row.schedule && Object.keys(row.schedule).length > 0) {
            supabaseSchedules[row.employee_code] = row.schedule;
          }
        }
      }
    } catch (e) {
      // Supabase schedule column might not be migrated yet; fallback gracefully
    }
  }

  // Merge: Supabase takes precedence, fallback to local backend store
  const merged = { ...localSchedules, ...supabaseSchedules };
  return NextResponse.json({ success: true, data: merged });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeCode, schedule, allSchedules } = body;

    const localSchedules = readLocalBackendSchedules();

    if (allSchedules) {
      Object.assign(localSchedules, allSchedules);
    } else if (employeeCode && schedule) {
      localSchedules[employeeCode] = schedule;
    }

    writeLocalBackendSchedules(localSchedules);

    // Also attempt to update Supabase if configured
    let syncedToSupabase = false;
    if (isSupabaseConfigured && employeeCode && schedule) {
      try {
        const { error } = await supabase
          .from("staff")
          .update({ schedule })
          .eq("employee_code", employeeCode);

        if (!error) {
          syncedToSupabase = true;
        }
      } catch (e) {
        // Fallback safely if schema cache doesn't have schedule column yet
      }
    }

    return NextResponse.json({
      success: true,
      data: localSchedules,
      syncedToSupabase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update schedule" },
      { status: 500 }
    );
  }
}
