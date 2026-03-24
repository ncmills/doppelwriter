import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const db = sql();

  // Store the request (create table if not exists)
  await db`
    CREATE TABLE IF NOT EXISTS writer_requests (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      writer_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'pending'
    )
  `;

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
