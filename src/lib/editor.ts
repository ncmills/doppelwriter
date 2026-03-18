import Anthropic from "@anthropic-ai/sdk";
import { diffWords } from "diff";
import { sql } from "./db";

const client = new Anthropic();

export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeDiff(original: string, edited: string): DiffChunk[] {
  return diffWords(original, edited).map((part) => ({
    value: part.value,
    added: part.added || undefined,
    removed: part.removed || undefined,
  }));
}

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name FROM style_profiles WHERE id = ${profileId}
  `;
  if (rows[0]?.system_prompt) return rows[0].system_prompt;
  return "You are an expert editor. Improve the writing while preserving the author's voice and intent.";
}

export async function* editDraft(
  draft: string,
  profileId: number,
  instructions?: string
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  const userMessage = instructions
    ? `Edit this draft in the author's voice. Additional instructions: ${instructions}\n\n---\n\n${draft}`
    : `Edit this draft in the author's voice. Improve clarity, flow, and impact while maintaining their style. Fix any errors.\n\n---\n\n${draft}`;

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

export async function* reviseDraft(
  original: string,
  currentEdit: string,
  feedback: string,
  profileId: number
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Edit this draft in the author's voice:\n\n${original}` },
      { role: "assistant", content: currentEdit },
      { role: "user", content: `Please revise based on this feedback: ${feedback}\n\nProvide the complete revised text.` },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}
