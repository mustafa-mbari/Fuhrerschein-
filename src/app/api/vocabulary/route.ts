import { NextResponse } from "next/server";
import { parseVocabulary } from "@/lib/parsers";

export async function GET() {
  try {
    const data = parseVocabulary();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load vocabulary" }, { status: 500 });
  }
}
