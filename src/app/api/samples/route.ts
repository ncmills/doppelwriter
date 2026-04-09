import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSamples, ingestText, ingestDocx, deleteSample } from "@/lib/ingest";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const samples = await getSamples(session.user.id);
  return NextResponse.json(samples);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // File upload
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (10MB max)" }, { status: 400 });
    if (!file.name.match(/\.(docx|txt|md)$/i)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.name.endsWith(".docx")) {
      const result = await ingestDocx(session.user.id, file.name.replace(/\.docx$/, ""), buffer);
      return NextResponse.json(result || { skipped: true });
    }

    // Plain text / markdown
    const text = buffer.toString("utf-8");
    const title = file.name.replace(/\.[^.]+$/, "");
    const result = await ingestText(session.user.id, title, text, "upload");
    return NextResponse.json(result || { skipped: true });
  }

  // JSON body - paste text
  let title: string, content: string, sourceType: string | undefined;
  try {
    const body = await request.json();
    title = body.title;
    content = body.content;
    sourceType = body.sourceType;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = await ingestText(session.user.id, title || "Pasted text", content, sourceType || "paste");
  return NextResponse.json(result || { skipped: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let id: number;
  try {
    const body = await request.json();
    id = body.id;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  await deleteSample(id, session.user.id);
  return NextResponse.json({ success: true });
}
