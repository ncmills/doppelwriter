import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordCorrection } from "@/lib/editor";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, aiOutput, userVersion, correctionType, revisionFeedback } = await request.json();

  if (!profileId || !aiOutput) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await recordCorrection(
    session.user.id,
    profileId,
    aiOutput,
    userVersion || aiOutput,
    correctionType || "manual_edit",
    revisionFeedback
  );

  return NextResponse.json({ success: true });
}
