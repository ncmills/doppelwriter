import { NextRequest } from "next/server";
import { allowAnon, RateLimitUnavailable } from "@/lib/anon-rate-limit";
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
    const verdict = await allowAnon(request.headers, "analyze-tone");
    if (!verdict.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again in an hour." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    if (e instanceof RateLimitUnavailable) {
      console.error("[analyze-tone] rate-limit store unreachable — refusing", e);
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
      JSON.stringify({ error: "Email text is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (text.length < 10) {
    return new Response(
      JSON.stringify({ error: "Email must be at least 10 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (text.length > 5000) {
    return new Response(
      JSON.stringify({ error: "Email must be at most 5,000 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are an expert email communication coach. Analyze the tone of this email and return ONLY valid JSON (no markdown fences) with these fields:

- overall: string — a concise 2-4 word tone label (e.g. "Professional & Warm", "Passive-Aggressive", "Too Formal", "Friendly & Casual", "Urgent & Direct", "Apologetic & Hesitant", "Cold & Transactional")
- scores: { warmth: number, formality: number, confidence: number, clarity: number } — each 1-10
- observations: string[] — exactly 3 specific observations about word choices, sentence patterns, or phrasing that shape the tone. Be concrete and reference actual words/phrases from the email.
- suggestion: string — one concise, actionable improvement suggestion

Email to analyze:
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

    trackServerEvent("tone_check", { textLength: text.length });

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Analyze tone error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to analyze email tone. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
