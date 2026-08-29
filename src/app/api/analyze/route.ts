import { NextRequest } from "next/server";
import { allowAnon, RateLimitUnavailable } from "@/lib/anon-rate-limit";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/models";
import { trackServerEvent } from "@/lib/track";


export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // DURABLE RATE LIMIT (2026-08-29). This was a module-scope `Map`, i.e. a
  // counter per lambda instance that reset on every cold start — a limit in
  // name only, in front of an unauthenticated Anthropic call. It now counts in
  // Postgres, keyed on an address the caller cannot forge, and FAILS CLOSED:
  // if we cannot tell whether this caller has already spent, the answer is no.
  try {
    const verdict = await allowAnon(request.headers, "analyze");
    if (!verdict.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again in an hour." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    if (e instanceof RateLimitUnavailable) {
      console.error("[analyze] rate-limit store unreachable — refusing", e);
      return new Response(
        JSON.stringify({ error: "Temporarily unavailable. Please try again shortly." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    throw e;
  }

  // Parse and validate body
  let text: string;
  try {
    const body = await request.json();
    text = body.text;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!text || typeof text !== "string") {
    return new Response(
      JSON.stringify({ error: "Text is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (text.length < 100) {
    return new Response(
      JSON.stringify({ error: "Text must be at least 100 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (text.length > 10000) {
    return new Response(
      JSON.stringify({ error: "Text must be at most 10,000 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze this writing sample and return a JSON object with these fields:
- sentenceLength: { average: number, shortest: number, longest: number, variation: "low" | "medium" | "high" }
- vocabulary: { level: "simple" | "moderate" | "advanced" | "sophisticated", uniqueWordRatio: number (0-1), signatureWords: string[] (3-5 distinctive/frequently used words) }
- tone: { primary: string (one word like "conversational", "formal", "sardonic"), secondary: string, formality: number (1-10) }
- structure: { avgParagraphLength: string, usesFragments: boolean, listHeavy: boolean, preferredTransitions: string[] }
- personality: { description: string (2-3 sentence summary of the writer's personality as revealed by their prose), strengths: string[], quirks: string[] }
- similarTo: string[] (1-3 famous writers this style resembles, with brief reason)

Only return valid JSON, no markdown wrapping.

Writing sample:
${text}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return new Response(
        JSON.stringify({ error: "Unexpected response from AI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse JSON — strip markdown fences if present
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(jsonText);

    // Save result to DB for sharing
    const slug = crypto.randomUUID().slice(0, 8);
    const inputPreview = text.slice(0, 100);

    try {
      const db = sql();
      await db`
        INSERT INTO analyzer_results (slug, input_preview, result)
        VALUES (${slug}, ${inputPreview}, ${JSON.stringify(analysis)})
      `;
    } catch (dbErr) {
      console.error("Failed to save analyzer result:", dbErr);
      // Non-fatal — still return the analysis
    }

    trackServerEvent("voice_analyze", { textLength: text?.length });

    return new Response(JSON.stringify({ ...analysis, shareUrl: `/analyze/${slug}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to analyze writing. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
