import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (10MB max)" }, { status: 400 });
  }

  if (!file.name.match(/\.(docx|txt|md)$/i)) {
    return NextResponse.json({ error: "Only .docx, .txt, and .md files are supported" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  return NextResponse.json({
    text: textResult.value,
    html: htmlResult.value,
  });
}
