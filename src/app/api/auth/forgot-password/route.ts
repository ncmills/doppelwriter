import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const db = sql();

  // Always return success to prevent email enumeration
  const [user] = await db`SELECT id, email FROM users WHERE email = ${email}`;
  if (!user) return NextResponse.json({ ok: true });

  // Create password_resets table if needed
  await db`
    CREATE TABLE IF NOT EXISTS password_resets (
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Delete any existing tokens for this email
  await db`DELETE FROM password_resets WHERE email = ${email}`;

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db`
    INSERT INTO password_resets (email, token, expires_at)
    VALUES (${email}, ${token}, ${expiresAt})
  `;

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: "DoppelWriter <noreply@doppelwriter.com>",
    to: email,
    subject: "Reset your DoppelWriter password",
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; color: #1a1a1a;">Reset Your Password</h1>
        <p style="color: #444; line-height: 1.6;">
          Click the button below to set a new password for your DoppelWriter account.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 30px;">
          This link expires in 1 hour. If you didn't request a password reset, ignore this email.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
