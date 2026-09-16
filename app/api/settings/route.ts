import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/lib/services/schoolService";

export async function GET() {
  try {
    const result = await schoolService.fetchSettings();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await schoolService.updateSettings(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
