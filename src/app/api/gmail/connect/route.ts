import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { auth as gmailAuth } from "googleapis/build/src/apis/gmail";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const oauth2Client = new gmailAuth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/gmail/callback"
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    state: session.user.id,
  });

  return NextResponse.json({ url });
}
