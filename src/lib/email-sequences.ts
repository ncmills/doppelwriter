import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const BASE_URL = process.env.NEXTAUTH_URL || "https://doppelwriter.com";

interface SequenceEmail {
  key: string;
  dayOffset: number;
  subject: string;
  html: (name?: string) => string;
  /** Only send if this condition is met. Return true to send. */
  condition?: (user: { used: number; hasProfile: boolean }) => boolean;
}

export const SEQUENCES: SequenceEmail[] = [
  {
    key: "day1_welcome",
    dayOffset: 1,
    subject: "Here's what you can do with DoppelWriter",
    html: (name) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">Hey${name ? ` ${name}` : ""}, welcome aboard</h1>
      <p style="color: #444; line-height: 1.6;">Here are 3 things to try today:</p>
      <ol style="color: #444; line-height: 1.8;">
        <li><a href="${BASE_URL}/write" style="color: #d97706;">Write like Hemingway</a> — short, punchy, iconic</li>
        <li><a href="${BASE_URL}/write" style="color: #d97706;">Try Paul Graham's voice</a> — clear thinking, startup wisdom</li>
        <li><a href="${BASE_URL}/write" style="color: #d97706;">Channel Obama</a> — soaring rhetoric, measured cadence</li>
      </ol>
      <p style="color: #444;">Just pick a voice and paste any draft. Watch the magic.</p>
    `),
  },
  {
    key: "day3_voice",
    dayOffset: 3,
    subject: "Your voice is waiting",
    html: (name) => wrap(`
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
    `),
    condition: (user) => !user.hasProfile,
  },
  {
    key: "day5_scarcity",
    dayOffset: 5,
    subject: "2 free uses left this month",
    html: (name) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">You're almost out</h1>
      <p style="color: #444; line-height: 1.6;">
        ${name ? `${name}, y` : "Y"}ou've used 3 of your 5 free monthly uses. Upgrade to Pro for 200/month and never get blocked.
      </p>
      <a href="${BASE_URL}/pricing" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        See Pro Plans
      </a>
    `),
    condition: (user) => user.used >= 3,
  },
  {
    key: "day7_discount",
    dayOffset: 7,
    subject: "50% off your first month of DoppelWriter Pro",
    html: (name) => wrap(`
      <h1 style="font-size: 22px; color: #1a1a1a;">Half off, just for you</h1>
      <p style="color: #444; line-height: 1.6;">
        ${name ? `${name}, w` : "W"}e want you writing. For the next 48 hours, get your first month of Pro for $9.50 (normally $19).
      </p>
      <ul style="color: #444; line-height: 1.8;">
        <li>200 edits & generations per month</li>
        <li>Unlimited voice profiles</li>
        <li>Custom writer builds</li>
        <li>Never blocked</li>
      </ul>
      <a href="${BASE_URL}/pricing?coupon=WELCOME50" style="display: inline-block; background: #d97706; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        Upgrade for $9.50
      </a>
      <p style="color: #888; font-size: 13px;">Offer expires in 48 hours.</p>
    `),
  },
];

function wrap(body: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      ${body}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #aaa; font-size: 11px;">
        DoppelWriter &middot; <a href="${BASE_URL}" style="color: #aaa;">doppelwriter.com</a>
      </p>
    </div>
  `;
}

export async function sendSequenceEmail(
  email: string,
  sequence: SequenceEmail,
  name?: string
): Promise<void> {
  await getResend().emails.send({
    from: "DoppelWriter <noreply@doppelwriter.com>",
    to: email,
    subject: sequence.subject,
    html: sequence.html(name),
  });
}
