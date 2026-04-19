import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/models";

const client = new Anthropic();

// In-memory rate limit: 3 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_BRIEF =
  "Write a paragraph about why the best ideas come when you're not trying";
const MAX_BRIEF_CHARS = 500;

export const maxDuration = 60;

function sanitizeBrief(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_BRIEF;
  const trimmed = raw.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!trimmed) return DEFAULT_BRIEF;
  return trimmed.slice(0, MAX_BRIEF_CHARS);
}

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 3) {
      return new Response(
        JSON.stringify({ error: "Demo limit reached. Sign up for more!" }),
        { status: 429 }
      );
    }
    entry.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  // Parse optional brief from body
  let brief = DEFAULT_BRIEF;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      brief = sanitizeBrief(body?.brief);
    }
  } catch {
    // Ignore body parse errors — fall back to default
  }

  // Get Hemingway's profile
  const db = sql();
  const [hemingway] = await db`
    SELECT system_prompt, profile_json, exemplar_passages, voice_overrides
    FROM style_profiles
    WHERE writer_name = 'Ernest Hemingway' AND is_curated = TRUE
    LIMIT 1
  `;

  let systemPrompt = "You are Ernest Hemingway. Write with his unmistakable style: short declarative sentences, minimal adjectives, concrete nouns, understated emotion.";
  if (hemingway?.system_prompt) {
    systemPrompt = hemingway.system_prompt;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 300,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: brief }],
        });

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("Demo stream error:", err);
        controller.enqueue(encoder.encode(`\n\n[ERROR: An error occurred. Please try again.]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
