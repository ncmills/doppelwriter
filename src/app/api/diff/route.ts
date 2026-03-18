import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeDiff } from "@/lib/editor";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { original, edited } = await request.json();
  const diff = computeDiff(original, edited);
  return NextResponse.json({ diff });
}
