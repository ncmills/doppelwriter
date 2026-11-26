import { sendOrThrow } from "./email";
import { unsubscribeUrl } from "./unsubscribe";

/** Free-plan monthly allowance, as quoted in the day-5 email. */
export const FREE_MONTHLY_LIMIT = 20;
/** Day-5 email only goes to people actually near the limit. */
export const SCARCITY_MIN_USED = 15;

const BASE_URL = process.env.NEXTAUTH_URL || "https://doppelwriter.com";

interface SequenceEmail {
  key: string;
  dayOffset: number;
  subject: string | ((ctx: { used: number }) => string);
  html: (name?: string, email?: string, ctx?: { used: number }) => string;
  /** Only send if this condition is met. Return true to send. */
  condition?: (user: { used: number; hasProfile: boolean }) => boolean;
}

export const SEQUENCES: SequenceEmail[] = [
  {
    key: "day1_welcome",
    dayOffset: 1,
    subject: "Here's what you can do with DoppelWriter",
    html: (name, email) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">Hey${name ? ` ${name}` : ""}, welcome aboard</h1>
      <p style="color: #444; line-height: 1.6;">Here are 3 things to try today:</p>
      <ol style="color: #444; line-height: 1.8;">
        <li>Write like Hemingway — short, punchy, iconic</li>
        <li>Try Paul Graham's voice — clear thinking, startup wisdom</li>
        <li>Channel Obama — soaring rhetoric, measured cadence</li>
      </ol>
      <p style="color: #444;">Just pick a voice and paste any draft. <a href="${BASE_URL}/write" style="color: #d97706;">Open the editor</a>.</p>
    `, email),
  },
  {
    key: "day3_voice",
    dayOffset: 3,
    subject: "Your voice is waiting",
    html: (name, email) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">Clone your own voice</h1>
      <p style="color: #444; line-height: 1.6;">
        ${name ? `${name}, t` : "T"}he famous voices are fun — but the real power is writing in <em>your</em> voice.
      </p>
      <p style="color: #444; line-height: 1.6;">
        Upload 3-5 writing samples (emails, essays, anything) and DoppelWriter builds a voice profile that sounds like you.
      </p>
      <a href="${BASE_URL}/create/personal" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        Create Your Voice
      </a>
    `, email),
    condition: (user) => !user.hasProfile,
  },
  {
    key: "day5_scarcity",
    dayOffset: 5,
    subject: ({ used }) => `${used} of ${FREE_MONTHLY_LIMIT} free uses used this month`,
    html: (name, email, ctx) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">You're getting close to your limit</h1>
      <p style="color: #444; line-height: 1.6;">
        ${name ? `${name}, y` : "Y"}ou've used ${ctx?.used ?? SCARCITY_MIN_USED} of your ${FREE_MONTHLY_LIMIT} free monthly uses. Upgrade to Pro for 200/month and never get blocked.
      </p>
      <a href="${BASE_URL}/pricing" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        See Pro Plans
      </a>
    `, email),
    condition: (user) => user.used >= SCARCITY_MIN_USED,
  },
  // day7_discount removed: it promised $9.50 via a coupon query param, but no checkout
  // code applies that coupon. Re-add only together with the coupon wiring.
];

function wrap(body: string, email?: string): string {
  const unsubUrl = unsubscribeUrl(BASE_URL, email);
  return `
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      ${body}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #aaa; font-size: 11px;">
        DoppelWriter &middot; <a href="${BASE_URL}" style="color: #aaa;">doppelwriter.com</a>
      </p>
      <p style="color: #aaa; font-size: 11px;">
        <a href="${unsubUrl}" style="color: #aaa;">Unsubscribe</a>
      </p>
    </div>
  `;
}

export async function sendSequenceEmail(
  email: string,
  sequence: SequenceEmail,
  name?: string,
  ctx: { used: number } = { used: 0 }
): Promise<void> {
  await sendOrThrow({
    from: "DoppelWriter <info@doppelwriter.com>",
    to: email,
    subject: typeof sequence.subject === "function" ? sequence.subject(ctx) : sequence.subject,
    html: sequence.html(name, email, ctx),
  }, `sequence:${sequence.key}`);
}
