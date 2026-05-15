import { NextResponse } from "next/server";
import { parseTheoryQuestions } from "@/lib/parsers";

export async function GET() {
  try {
    const data = parseTheoryQuestions();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load theory questions" }, { status: 500 });
  }
}
