import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let name: string;
  try {
    const body = await request.json();
    name = body.name;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const db = sql();

  // Deduplicate: don't insert if this user already requested this writer
  const existing = await db`
    SELECT id FROM writer_requests WHERE user_id = ${session.user.id} AND LOWER(writer_name) = LOWER(${name.trim()})
  `;
  if (existing.length > 0) {
    return NextResponse.json({ status: "already_requested" });
  }

  await db`
    INSERT INTO writer_requests (user_id, writer_name)
    VALUES (${session.user.id}, ${name.trim()})
  `;

  return NextResponse.json({ status: "requested" });
}
