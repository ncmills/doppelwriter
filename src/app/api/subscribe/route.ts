import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, sourceSlug } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const db = sql();
    const result = await db`
      INSERT INTO email_captures (email, source, source_slug)
      VALUES (${cleanEmail}, ${source || null}, ${sourceSlug || null})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    const isNew = result.length > 0;

    // Notify on every NEW capture so leads aren't orphaned in the DB
    if (isNew && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY.trim());
        await resend.emails.send({
          from: "DoppelWriter <info@doppelwriter.com>",
          to: "info@doppelwriter.com",
          subject: `New DoppelWriter signup: ${cleanEmail}`,
          html: `
            <h2>New newsletter signup</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;">
              <tr><td style="padding:4px 12px;font-weight:bold;">Email</td><td style="padding:4px 12px;">${cleanEmail}</td></tr>
              <tr><td style="padding:4px 12px;font-weight:bold;">Source</td><td style="padding:4px 12px;">${source || "—"}</td></tr>
              <tr><td style="padding:4px 12px;font-weight:bold;">Source slug</td><td style="padding:4px 12px;">${sourceSlug || "—"}</td></tr>
            </table>
          `,
        });
      } catch (err) {
        console.error("[subscribe] Resend notification failed:", err);
      }
    }

    return NextResponse.json({ success: true, isNew });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
