import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordCorrection } from "@/lib/editor";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, originalText, correctedText } = await request.json();

  if (!profileId || !originalText || !correctedText) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await recordCorrection(session.user.id, profileId, originalText, correctedText);
  return NextResponse.json({ success: true });
}
