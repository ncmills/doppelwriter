import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestText } from "@/lib/ingest";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let title: string, content: string, sourceType: string | undefined;
  try {
    const body = await request.json();
    title = body.title;
    content = body.content;
    sourceType = body.sourceType;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!content) return NextResponse.json({ error: "No content" }, { status: 400 });

  const result = await ingestText(session.user.id, title || "Untitled", content, sourceType || "paste");
  return NextResponse.json(result || { skipped: true });
}
