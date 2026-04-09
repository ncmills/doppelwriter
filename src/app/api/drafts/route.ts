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

  let title: string, profileId: number | undefined, mode: string | undefined, brief: string | undefined, content: string;
  try {
    const body = await request.json();
    title = body.title;
    profileId = body.profileId;
    mode = body.mode;
    brief = body.brief;
    content = body.content;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const db = sql();

  const [row] = await db`
    INSERT INTO drafts (user_id, title, profile_id, mode, brief, content)
    VALUES (${session.user.id}, ${title || "Untitled"}, ${profileId || null}, ${mode || "editor"}, ${brief || null}, ${content})
    RETURNING id
  `;

  return NextResponse.json({ id: row.id });
}
