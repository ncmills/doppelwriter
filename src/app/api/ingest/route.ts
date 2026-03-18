import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestEmail } from "@/lib/ingest";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { emails } = await request.json();

  if (Array.isArray(emails)) {
    let count = 0;
    for (const email of emails) {
      const result = await ingestEmail(session.user.id, email.id, email.subject, email.body);
      if (result) count++;
    }
    return NextResponse.json({ ingested: count });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
