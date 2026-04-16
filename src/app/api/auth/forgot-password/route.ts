import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { sendOrThrow } from "@/lib/email";

export async function POST(req: Request) {
  let email: string;
  try {
    const body = await req.json();
    email = body.email;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const db = sql();

  // Always return success to prevent email enumeration
  const [user] = await db`SELECT id, email FROM users WHERE email = ${email}`;
  if (!user) return NextResponse.json({ ok: true });

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

  await sendOrThrow({
    from: "DoppelWriter <info@doppelwriter.com>",
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
  }, `password-reset:${user.id}`);

  return NextResponse.json({ ok: true });
}
