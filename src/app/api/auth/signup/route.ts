import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { trackServerEvent } from "@/lib/track";
import { isSuspiciousEmail, checkSignupRateLimit, clientIp } from "@/lib/signup-protection";
import crypto from "crypto";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rl = checkSignupRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }

  let email: string, password: string, name: string | undefined, ref: string | undefined;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
    name = body.name;
    ref = body.ref;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  // Server-side email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (isSuspiciousEmail(email)) {
    return NextResponse.json({ error: "Unable to create account with this email" }, { status: 400 });
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
  const referralCode = crypto.randomBytes(3).toString("hex"); // 6-char alphanumeric

  const [user] = await db`
    INSERT INTO users (email, name, password_hash, referral_code, referred_by)
    VALUES (${email}, ${name || null}, ${hash}, ${referralCode}, ${ref || null})
    RETURNING id, email, name, plan
  `;

  // Process referral: grant bonuses to both sides
  if (ref) {
    const [referrer] = await db`SELECT id FROM users WHERE referral_code = ${ref}`;
    if (referrer) {
      await db`
        INSERT INTO referrals (referrer_id, referred_id, bonus_applied)
        VALUES (${referrer.id}, ${user.id}, TRUE)
      `;
    }
  }

  // Send verification email (non-blocking — don't fail signup if email fails)
  try {
    await sendVerificationEmail(user.email, user.id);
  } catch {
    // Email sending failed — user can still log in, will be prompted to verify later
  }

  await trackServerEvent("signup", { method: "email", ref: ref || null }, user.id);

  return NextResponse.json({ id: user.id, email: user.email, needsVerification: true });
}
