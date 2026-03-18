import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writerName } = await request.json();
  if (!writerName) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  // Use Claude to verify the person and assess whether there's enough
  // public content to build a high-quality DoppelWriter
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `A user wants to create a writing voice profile for "${writerName}". I need to verify:

1. Is this a real, identifiable public figure or well-known fictional character?
2. Is the name spelled correctly? If not, what's the correct spelling?
3. Is there sufficient publicly available written/spoken content to build a high-quality writing style profile? (Need substantial published essays, books, speeches, interviews, articles, scripts, etc.)
4. Brief bio (1-2 sentences)

Respond JSON only:
{
  "valid": true/false,
  "corrected_name": "The correctly spelled, canonical name",
  "bio": "Brief 1-2 sentence description",
  "content_quality": "high" | "medium" | "low" | "insufficient",
  "content_sources": "Brief description of what content exists (e.g., '14 published novels, numerous essays, interviews')",
  "reason": "If invalid or insufficient, explain why. If valid, leave empty.",
  "suggestions": ["If the name seems like a misspelling, suggest 1-3 alternatives"]
}

Rules:
- "high" = famous writer/speaker with extensive published work
- "medium" = public figure with some written/spoken content
- "low" = known person but limited written content
- "insufficient" = private individual, obscure figure, or fictional character with no written works to analyze
- Fictional characters from books/movies/TV ARE valid if they have distinctive speech patterns in substantial source material`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  const result = JSON.parse(jsonMatch[0]);
  return NextResponse.json(result);
}
