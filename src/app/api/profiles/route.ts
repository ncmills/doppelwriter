import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfiles, analyzeAndCategorize, generateProfile } from "@/lib/style-analyzer";
import { getTotalWordCount } from "@/lib/ingest";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";

export const maxDuration = 300;

const WORD_MINIMUM = 1500;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const profiles = await getProfiles(session.user.id);
  return NextResponse.json(profiles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, improveProfileId } = await request.json();

  if (action === "analyze") {
    const wordCount = await getTotalWordCount(session.user.id);
    if (wordCount < WORD_MINIMUM) {
      return NextResponse.json(
        { error: "insufficient_content", wordCount, minimum: WORD_MINIMUM },
        { status: 422 }
      );
    }
    try {
      if (improveProfileId) {
        // Improving an existing profile: link new samples to it, then regenerate
        const db = sql();
        await db`
          INSERT INTO sample_profiles (sample_id, profile_id)
          SELECT id, ${Number(improveProfileId)} FROM writing_samples
          WHERE user_id = ${session.user.id}
          ON CONFLICT DO NOTHING
        `;
        await generateProfile(Number(improveProfileId));
        // Purge raw samples after rebuilding
        await db`DELETE FROM writing_samples WHERE user_id = ${session.user.id}`;
        return NextResponse.json({ profileIds: [Number(improveProfileId)] });
      }

      const result = await analyzeAndCategorize(session.user.id);
      if (result.profileIds?.[0]) {
        trackServerEvent("profile_created", { profileId: result.profileIds[0], name: "personal" }, session.user.id);
      }
      return NextResponse.json(result);
    } catch (err) {
      console.error("Profile analysis failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Profile analysis failed: ${message}. Please try again.` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
