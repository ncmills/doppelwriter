import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordCorrection } from "@/lib/editor";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profileId: number, aiOutput: string, userVersion: string | undefined, correctionType: "accept" | "manual_edit" | "revision_feedback" | undefined, revisionFeedback: string | undefined;
  try {
    const body = await request.json();
    profileId = body.profileId;
    aiOutput = body.aiOutput;
    userVersion = body.userVersion;
    correctionType = body.correctionType;
    revisionFeedback = body.revisionFeedback;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

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
