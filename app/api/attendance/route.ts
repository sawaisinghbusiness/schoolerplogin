import { NextRequest, NextResponse } from "next/server";
import { attendanceService } from "@/lib/services/attendanceService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const classId = searchParams.get("class") || undefined;

    const result = await attendanceService.fetchAttendance(date, classId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of attendance records." }, { status: 400 });
    }
    const result = await attendanceService.saveAttendance(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit attendance" }, { status: 500 });
  }
}
