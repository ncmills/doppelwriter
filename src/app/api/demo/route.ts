import { NextRequest } from "next/server";
import { allowAnon, RateLimitUnavailable } from "@/lib/anon-rate-limit";
import { sql } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/models";

const client = new Anthropic();


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
  // DURABLE RATE LIMIT (2026-08-29). This was a module-scope `Map`, i.e. a
  // counter per lambda instance that reset on every cold start — a limit in
  // name only, in front of an unauthenticated Anthropic call. It now counts in
  // Postgres, keyed on an address the caller cannot forge, and FAILS CLOSED:
  // if we cannot tell whether this caller has already spent, the answer is no.
  try {
    const verdict = await allowAnon(request.headers, "demo");
    if (!verdict.allowed) {
      return new Response(
        JSON.stringify({ error: "Demo limit reached. Sign up for more!" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    if (e instanceof RateLimitUnavailable) {
      console.error("[demo] rate-limit store unreachable — refusing", e);
      return new Response(
        JSON.stringify({ error: "Temporarily unavailable. Please try again shortly." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    throw e;
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
          system: [
            { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
          ],
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
