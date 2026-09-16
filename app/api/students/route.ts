import { NextRequest, NextResponse } from "next/server";
import { studentService } from "@/lib/services/studentService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || undefined;
    const className = searchParams.get("class") || undefined;
    const section = searchParams.get("section") || undefined;

    const result = await studentService.fetchStudents({ query, className, section });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await studentService.createStudent(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save student" }, { status: 500 });
  }
}
