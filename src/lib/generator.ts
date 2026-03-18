import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name FROM style_profiles WHERE id = ${profileId}
  `;
  if (rows[0]?.system_prompt) return rows[0].system_prompt;
  return `You are an expert writer. Write clear, engaging content.

ANTI-AI-ISM RULES:
Never use "Moreover," "Furthermore," "Additionally," "In conclusion," "It's worth noting," "Delve," "Crucial," "Landscape," "Leverage."
Never over-explain. Prefer short sentences when they work. Use verbs, not nominalizations.`;
}

export async function* generateDraft(
  brief: string,
  profileId: number,
  options: {
    wordCount?: number;
    instructions?: string;
    researchContext?: string;
  } = {}
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  let userMessage = `Write a first draft based on this brief. Write ONLY the draft — no meta-commentary, no "here's your draft" preamble, no sign-off.

BRIEF: ${brief}`;

  if (options.researchContext) {
    userMessage += `\n\nRESEARCH CONTEXT (use as source material, do not copy):\n${options.researchContext}`;
  }
  if (options.wordCount) {
    userMessage += `\n\nTARGET LENGTH: ~${options.wordCount} words.`;
  }
  if (options.instructions) {
    userMessage += `\n\nADDITIONAL INSTRUCTIONS: ${options.instructions}`;
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

export async function research(query: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Research this topic. Provide key facts, data points, and context useful for writing about it. Be thorough and factual. No filler.\n\nTopic: ${query}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
