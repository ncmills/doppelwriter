import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const db = sql();
  const favs = await db`
    SELECT sp.id, sp.name, sp.writer_name, sp.writer_bio, sp.writer_category, sp.is_curated,
      sp.profile_json IS NOT NULL as has_profile
    FROM favorites f
    JOIN style_profiles sp ON sp.id = f.profile_id
    WHERE f.user_id = ${session.user.id}
    ORDER BY f.created_at DESC
  `;
  return NextResponse.json(favs);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profileId: number;
  try {
    const body = await request.json();
    profileId = body.profileId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const db = sql();

  await db`
    INSERT INTO favorites (user_id, profile_id)
    VALUES (${session.user.id}, ${profileId})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profileId: number;
  try {
    const body = await request.json();
    profileId = body.profileId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const db = sql();

  await db`DELETE FROM favorites WHERE user_id = ${session.user.id} AND profile_id = ${profileId}`;
  return NextResponse.json({ success: true });
}
