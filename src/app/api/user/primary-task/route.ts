import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";

const ALLOWED = [
  "newsletter",
  "linkedin",
  "client-emails",
  "proposals",
  "speeches-letters",
  "blog",
  "other",
] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = sql();
  const [row] = await db`SELECT primary_task FROM users WHERE id = ${session.user.id}`;
  return NextResponse.json({ primaryTask: row?.primary_task ?? null });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let task: string;
  try {
    const body = await request.json();
    task = String(body.task || "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!(ALLOWED as readonly string[]).includes(task)) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  const db = sql();
  await db`UPDATE users SET primary_task = ${task} WHERE id = ${session.user.id}`;
  trackServerEvent("primary_task_selected", { task }, session.user.id);
  return NextResponse.json({ ok: true });
}
