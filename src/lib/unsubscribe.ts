import { createHmac, timingSafeEqual } from "node:crypto";
import { ensureUnsubscribeColumn, sql } from "./db";

function secret(): string | null {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || null;
}

/** HMAC token binding an unsubscribe link to one email address. Null if no secret is configured. */
export function unsubscribeToken(email: string): string | null {
  const s = secret();
  if (!s) return null;
  return createHmac("sha256", s).update(`unsubscribe:${email.toLowerCase()}`).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string | null | undefined): boolean {
  if (!email || !token) return false;
  const expected = unsubscribeToken(email);
  if (!expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(baseUrl: string, email?: string): string {
  if (!email) return `${baseUrl}/unsubscribe`;
  const token = unsubscribeToken(email);
  const q = `email=${encodeURIComponent(email)}${token ? `&token=${token}` : ""}`;
  return `${baseUrl}/unsubscribe?${q}`;
}

/** Sets the flag if the token is valid. Returns true when the flag was set (or already set). */
export async function applyUnsubscribe(email: string, token: string | null | undefined): Promise<boolean> {
  if (!verifyUnsubscribeToken(email, token)) return false;
  await ensureUnsubscribeColumn();
  const db = sql();
  await db`UPDATE users SET email_unsubscribed = TRUE WHERE LOWER(email) = ${email.toLowerCase()}`;
  return true;
}
