import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  let token: string, password: string;
  try {
    const body = await req.json();
    token = body.token;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  }

  // Validate password strength
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number" }, { status: 400 });
  }

  const db = sql();

  // Find valid token
  const [record] = await db`
    SELECT email, expires_at FROM password_resets WHERE token = ${token}
  `;

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  if (new Date(record.expires_at) < new Date()) {
    await db`DELETE FROM password_resets WHERE token = ${token}`;
    return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 400 });
  }

  // Hash new password and update
  const passwordHash = await bcrypt.hash(password, 12);
  await db`UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE email = ${record.email}`;

  // Clean up token
  await db`DELETE FROM password_resets WHERE email = ${record.email}`;

  return NextResponse.json({ ok: true });
}
