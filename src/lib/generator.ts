import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name FROM style_profiles WHERE id = ${profileId}
  `;
  if (rows[0]?.system_prompt) return rows[0].system_prompt;
  return "You are an expert writer. Write clear, engaging content.";
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

  let userMessage = `Write a first draft based on this brief:\n\n${brief}`;
  if (options.researchContext) {
    userMessage += `\n\nResearch context:\n\n${options.researchContext}`;
  }
  if (options.wordCount) {
    userMessage += `\n\nTarget word count: ~${options.wordCount} words.`;
  }
  if (options.instructions) {
    userMessage += `\n\nAdditional instructions: ${options.instructions}`;
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
        content: `Research the following topic and provide a comprehensive summary of key facts, data points, and context useful for writing about it.\n\nTopic: ${query}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
