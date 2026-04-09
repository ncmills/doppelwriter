import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeDiff } from "@/lib/editor";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let original: string, edited: string;
  try {
    const body = await request.json();
    original = body.original;
    edited = body.edited;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const diff = computeDiff(original, edited);
  return NextResponse.json({ diff });
}
