import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const db = sql();
  const drafts = await db`
    SELECT d.*, sp.name as profile_name
    FROM drafts d
    LEFT JOIN style_profiles sp ON sp.id = d.profile_id
    WHERE d.user_id = ${session.user.id}
    ORDER BY d.updated_at DESC
  `;
  return NextResponse.json(drafts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, profileId, mode, brief, content } = await request.json();
  const db = sql();

  const [row] = await db`
    INSERT INTO drafts (user_id, title, profile_id, mode, brief, content)
    VALUES (${session.user.id}, ${title || "Untitled"}, ${profileId || null}, ${mode || "editor"}, ${brief || null}, ${content})
    RETURNING id
  `;

  return NextResponse.json({ id: row.id });
}
