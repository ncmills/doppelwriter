import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildWriterProfile, buildCustomWriter } from "@/lib/writer-builder";
import { checkUsage } from "@/lib/usage";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writerName, bio, isCurated } = await request.json();
  if (!writerName) {
    return NextResponse.json({ error: "Writer name required" }, { status: 400 });
  }

  // Custom writer builds require Pro
  if (!isCurated) {
    const usage = await checkUsage(session.user.id);
    if (usage.plan !== "pro") {
      return NextResponse.json(
        { error: "Custom writer building requires the Pro plan." },
        { status: 403 }
      );
    }
  }

  try {
    const profileId = isCurated
      ? await buildWriterProfile(writerName, bio)
      : await buildCustomWriter(session.user.id, writerName, bio);

    return NextResponse.json({ profileId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
