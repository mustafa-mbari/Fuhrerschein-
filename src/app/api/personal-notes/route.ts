import { NextResponse } from "next/server";
import { parsePersonalNotes } from "@/lib/parsers";

export async function GET() {
  try {
    const data = parsePersonalNotes();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load personal notes" }, { status: 500 });
  }
}
