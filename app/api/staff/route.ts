import { NextRequest, NextResponse } from "next/server";
import { staffService } from "@/lib/services/staffService";

export async function GET() {
  try {
    const result = await staffService.fetchStaff();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await staffService.createStaff(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add staff" }, { status: 500 });
  }
}
