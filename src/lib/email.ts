import { Resend } from "resend";
import crypto from "crypto";
import { sql } from "./db";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export async function sendVerificationEmail(email: string, userId: string): Promise<void> {
  const db = sql();

  // Generate a secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store the token
  await db`
    INSERT INTO email_verifications (user_id, email, token, expires_at)
    VALUES (${userId}, ${email}, ${token}, ${expiresAt})
    ON CONFLICT (user_id) DO UPDATE SET
      email = ${email}, token = ${token}, expires_at = ${expiresAt}
  `;

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  await getResend().emails.send({
    from: "DoppelWriter <noreply@doppelwriter.com>",
    to: email,
    subject: "Verify your DoppelWriter account",
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; color: #1a1a1a;">Welcome to DoppelWriter</h1>
        <p style="color: #444; line-height: 1.6;">
          Click the button below to verify your email and start writing.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 30px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function verifyEmail(token: string): Promise<{ success: boolean; userId?: string }> {
  const db = sql();

  const [record] = await db`
    SELECT user_id, expires_at FROM email_verifications
    WHERE token = ${token}
  `;

  if (!record) return { success: false };
  if (new Date(record.expires_at) < new Date()) return { success: false };

  // Mark user as verified
  await db`UPDATE users SET email_verified = TRUE WHERE id = ${record.user_id}`;

  // Clean up token
  await db`DELETE FROM email_verifications WHERE user_id = ${record.user_id}`;

  return { success: true, userId: record.user_id };
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const db = sql();
  const [user] = await db`SELECT email_verified FROM users WHERE id = ${userId}`;
  return !!user?.email_verified;
}
