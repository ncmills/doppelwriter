import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildWriterProfile, buildCustomWriter } from "@/lib/writer-builder";
import { checkUsage } from "@/lib/usage";
import { sql } from "@/lib/db";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writerName, bio, isCurated } = await request.json();
  if (!writerName) {
    return NextResponse.json({ error: "Writer name required" }, { status: 400 });
  }

  // Custom writer builds (non-curated) require Pro
  if (!isCurated) {
    const usage = await checkUsage(session.user.id);
    if (usage.plan !== "pro") {
      return NextResponse.json(
        { error: "Building custom voices requires the Pro plan. Upgrade to unlock this feature." },
        { status: 403 }
      );
    }
  }

  // Log the request for analytics
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS writer_requests (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      writer_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'pending'
    )
  `.catch(() => {});
  await db`
    INSERT INTO writer_requests (user_id, writer_name, status)
    VALUES (${session.user.id}, ${writerName.trim()}, 'building')
    ON CONFLICT DO NOTHING
  `.catch(() => {});

  try {
    const profileId = isCurated
      ? await buildWriterProfile(writerName, bio)
      : await buildCustomWriter(session.user.id, writerName, bio);

    // Mark as built
    await db`
      UPDATE writer_requests SET status = 'built' WHERE user_id = ${session.user.id} AND LOWER(writer_name) = LOWER(${writerName.trim()})
    `.catch(() => {});

    return NextResponse.json({ profileId });
  } catch (err) {
    console.error("Writer build failed:", err);
    return NextResponse.json({ error: "Writer build failed" }, { status: 500 });
  }
}
