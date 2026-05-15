import { NextResponse } from "next/server";
import { parseTrafficSigns } from "@/lib/parsers";

export async function GET() {
  try {
    const data = parseTrafficSigns();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load traffic signs" }, { status: 500 });
  }
}
