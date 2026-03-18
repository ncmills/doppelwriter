import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const db = sql();

  const existing = await db`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const [user] = await db`
    INSERT INTO users (email, name, password_hash)
    VALUES (${email}, ${name || null}, ${hash})
    RETURNING id, email, name, plan
  `;

  return NextResponse.json({ id: user.id, email: user.email });
}
