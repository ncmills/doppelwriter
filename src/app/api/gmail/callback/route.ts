import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const userId = request.nextUrl.searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/create/personal?gmail=error", request.url));
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/gmail/callback"
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const db = sql();

    await db`
      UPDATE users SET
        google_access_token = ${tokens.access_token || null},
        google_refresh_token = ${tokens.refresh_token || null},
        google_token_expiry = ${tokens.expiry_date ? String(tokens.expiry_date) : null}
      WHERE id = ${userId}
    `;

    return NextResponse.redirect(new URL("/create/personal?gmail=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/create/personal?gmail=error", request.url));
  }
}
