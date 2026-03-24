import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, voiceName } = await request.json();
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const slug = crypto.randomBytes(4).toString("hex"); // 8-char hex slug

  const db = sql();
  await db`
    INSERT INTO shared_drafts (user_id, slug, content, voice_name)
    VALUES (${session.user.id}, ${slug}, ${content}, ${voiceName || null})
  `;

  trackServerEvent("share_created", { slug }, session.user.id);

  const baseUrl = process.env.NEXTAUTH_URL || "https://doppelwriter.com";
  return NextResponse.json({ url: `${baseUrl}/s/${slug}`, slug });
}
