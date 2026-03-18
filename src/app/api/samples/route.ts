import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSamples, ingestText, ingestDocx, deleteSample } from "@/lib/ingest";
import mammoth from "mammoth";

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
  const { title, content, sourceType } = await request.json();
  const result = await ingestText(session.user.id, title || "Pasted text", content, sourceType || "paste");
  return NextResponse.json(result || { skipped: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await deleteSample(id, session.user.id);
  return NextResponse.json({ success: true });
}
