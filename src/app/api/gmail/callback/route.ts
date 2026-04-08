import { NextRequest, NextResponse } from "next/server";
import { auth as gmailAuth } from "googleapis/build/src/apis/gmail";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const stateUserId = request.nextUrl.searchParams.get("state");

  if (!code || !stateUserId) {
    return NextResponse.redirect(new URL("/create/personal?gmail=error", request.url));
  }

  // Verify the authenticated user matches the state parameter
  const session = await auth();
  if (!session?.user?.id || session.user.id !== stateUserId) {
    return NextResponse.redirect(new URL("/create/personal?gmail=error", request.url));
  }

  const oauth2Client = new gmailAuth.OAuth2(
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
      WHERE id = ${session.user.id}
    `;

    return NextResponse.redirect(new URL("/create/personal?gmail=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/create/personal?gmail=error", request.url));
  }
}
