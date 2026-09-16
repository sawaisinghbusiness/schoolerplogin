import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export async function GET() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: "mock_mode",
      configured: false,
      connected: false,
      message: "Supabase credentials are not configured in .env.local. The ERP is operating safely using the built-in mock data engine.",
      details: {
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey,
        hasServiceKey,
      },
    });
  }

  try {
    // Primary query on students table (confirmed present in live database)
    const { count: studentCount, error: studentError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    const latencyMs = Date.now() - startTime;

    if (studentError) {
      return NextResponse.json({
        status: "connection_error",
        configured: true,
        connected: false,
        latencyMs,
        error: studentError.message,
        hint: "Database query failed. Please verify your Project URL and Anon API key.",
      }, { status: 502 });
    }

    // Optional check on staff table
    const { count: staffCount } = await supabase
      .from("staff")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      status: "connected",
      configured: true,
      connected: true,
      latencyMs,
      database: {
        projectUrl: supabaseUrl,
        studentsCount: studentCount ?? 0,
        staffCount: staffCount ?? 0,
      },
      message: "Successfully connected to live Supabase PostgreSQL database!",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "exception",
      configured: true,
      connected: false,
      error: err.message || "Failed to reach Supabase backend",
    }, { status: 500 });
  }
}
