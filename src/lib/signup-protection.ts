const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
  "throwaway.email", "yopmail.com", "trashmail.com", "dispostable.com",
  "maildrop.cc", "getairmail.com", "sharklasers.com", "emailondeck.com",
  "mohmal.com", "temp-mail.org", "mintemail.com", "fakeinbox.com",
  "tempmailaddress.com", "tempinbox.com", "mailnesia.com", "spambog.com",
  "libero.it",
]);

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function isSuspiciousEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const atIdx = normalized.lastIndexOf("@");
  if (atIdx < 1) return true;

  const local = normalized.slice(0, atIdx);
  const domain = normalized.slice(atIdx + 1);

  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  if (local.includes("..")) return true;
  if (local.length > 40 || local.length < 2) return true;

  if (GMAIL_DOMAINS.has(domain)) {
    const dots = (local.match(/\./g) || []).length;
    if (dots >= 3) return true;
    if (dots >= 2 && local.length <= 20) return true;
  }

  const digitRatio = (local.match(/\d/g) || []).length / local.length;
  const hasLetters = /[a-z]/.test(local);
  if (digitRatio > 0.5 && hasLetters && local.length >= 6) return true;

  return false;
}

const signupAttempts = new Map<string, { count: number; resetAt: number }>();
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_MAX_PER_WINDOW = 3;

export function checkSignupRateLimit(ip: string): { allowed: boolean; resetInMs: number } {
  const now = Date.now();
  const entry = signupAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    signupAttempts.set(ip, { count: 1, resetAt: now + SIGNUP_WINDOW_MS });
    return { allowed: true, resetInMs: SIGNUP_WINDOW_MS };
  }

  if (entry.count >= SIGNUP_MAX_PER_WINDOW) {
    return { allowed: false, resetInMs: entry.resetAt - now };
  }

  entry.count++;
  if (signupAttempts.size > 10000) {
    for (const [k, v] of signupAttempts) {
      if (now > v.resetAt) signupAttempts.delete(k);
    }
  }
  return { allowed: true, resetInMs: entry.resetAt - now };
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}
