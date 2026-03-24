import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assessProfileQuality } from "@/lib/profile-quality";
import { sql } from "@/lib/db";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const profileId = Number(id);

  // Ownership check: user can assess their own profiles + curated profiles
  const db = sql();
  const [p] = await db`SELECT user_id, is_curated FROM style_profiles WHERE id = ${profileId}`;
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!p.is_curated && p.user_id !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const quality = await assessProfileQuality(profileId);
    return NextResponse.json(quality);
  } catch (err) {
    console.error("Quality assessment failed:", err);
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 });
  }
}
