import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = sql();
  const rows = await db`
    SELECT d.*, sp.name as profile_name
    FROM drafts d
    LEFT JOIN style_profiles sp ON sp.id = d.profile_id
    WHERE d.id = ${Number(id)} AND d.user_id = ${session.user.id}
  `;

  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const db = sql();

  const existing = await db`
    SELECT * FROM drafts WHERE id = ${Number(id)} AND user_id = ${session.user.id}
  `;
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const revisions = (existing[0].revisions as unknown[]) || [];
  if (body.content && body.content !== existing[0].content) {
    revisions.push({ content: existing[0].content, timestamp: new Date().toISOString() });
  }

  await db`
    UPDATE drafts SET
      title = COALESCE(${body.title || null}, title),
      content = COALESCE(${body.content || null}, content),
      revisions = ${JSON.stringify(revisions)}::jsonb,
      updated_at = NOW()
    WHERE id = ${Number(id)} AND user_id = ${session.user.id}
  `;

  const [updated] = await db`SELECT * FROM drafts WHERE id = ${Number(id)}`;
  return NextResponse.json(updated);
}
