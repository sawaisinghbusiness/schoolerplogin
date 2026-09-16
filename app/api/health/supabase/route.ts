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
      instructions: {
        step1: "Create a free project at https://supabase.com",
        step2: "Execute supabase/schema.sql and supabase/seed.sql in the Supabase SQL Editor",
        step3: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY into .env.local",
      },
    });
  }

  try {
    // Attempt real query to test connection
    const { count, error } = await supabase
      .from("institution_settings")
      .select("*", { count: "exact", head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        status: "connection_error",
        configured: true,
        connected: false,
        latencyMs,
        error: error.message,
        hint: "Database connection failed. Please verify your Project URL and Anon API key, and make sure schema.sql has been executed in the Supabase SQL Editor.",
      }, { status: 502 });
    }

    // Check student table count
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    // Check staff table count
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
        institutionSettingsRows: count ?? 0,
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
