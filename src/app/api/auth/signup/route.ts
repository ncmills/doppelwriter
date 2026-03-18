import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  // Server-side email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Server-side password strength
  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json({
      error: "Password must include at least one uppercase letter, one lowercase letter, and one number",
    }, { status: 400 });
  }

  const db = sql();

  const existing = await db`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    // Generic message to prevent email enumeration
    return NextResponse.json({ error: "Unable to create account with this email" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const [user] = await db`
    INSERT INTO users (email, name, password_hash)
    VALUES (${email}, ${name || null}, ${hash})
    RETURNING id, email, name, plan
  `;

  return NextResponse.json({ id: user.id, email: user.email });
}
