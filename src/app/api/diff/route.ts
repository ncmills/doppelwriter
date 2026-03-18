import { NextRequest, NextResponse } from "next/server";
import { computeDiff } from "@/lib/editor";

export async function POST(request: NextRequest) {
  const { original, edited } = await request.json();
  const diff = computeDiff(original, edited);
  return NextResponse.json({ diff });
}
