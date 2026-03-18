import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Get both plain text and HTML
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  return NextResponse.json({
    text: textResult.value,
    html: htmlResult.value,
  });
}
