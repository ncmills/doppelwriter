import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

export const CURATED_WRITERS = [
  { name: "Paul Graham", bio: "Essayist, programmer, Y Combinator co-founder. Clear, direct essays on startups and thinking.", tag: "business" },
  { name: "Seth Godin", bio: "Marketing pioneer. Punchy, provocative daily blog posts on marketing, leadership, and change.", tag: "marketing" },
  { name: "Ernest Hemingway", bio: "Nobel laureate. Sparse, powerful prose with the iceberg theory of omission.", tag: "literary" },
  { name: "George Orwell", bio: "Author of 1984 and Animal Farm. Crystal-clear political and social commentary.", tag: "literary" },
  { name: "Joan Didion", bio: "Journalist and essayist. Precise, atmospheric observation of American life and culture.", tag: "literary" },
  { name: "Hunter S. Thompson", bio: "Father of gonzo journalism. Visceral, unhinged, brilliantly chaotic energy.", tag: "literary" },
  { name: "David Ogilvy", bio: "The father of advertising. Persuasive, authoritative, research-driven copy.", tag: "marketing" },
  { name: "Malcolm Gladwell", bio: "Staff writer at The New Yorker. Narrative-driven exploration of ideas and research.", tag: "journalism" },
  { name: "Naval Ravikant", bio: "Entrepreneur and philosopher. Aphoristic wisdom on wealth, happiness, and thinking.", tag: "philosophy" },
  { name: "Tim Urban", bio: "Creator of Wait But Why. Complex ideas explained with humor and accessible analogies.", tag: "education" },
  { name: "James Clear", bio: "Author of Atomic Habits. Actionable, evidence-based writing on habits and improvement.", tag: "self-improvement" },
  { name: "Morgan Housel", bio: "Author of The Psychology of Money. Storytelling meets behavioral finance.", tag: "finance" },
];

export async function buildWriterProfile(
  writerName: string,
  bio?: string
): Promise<number> {
  const db = sql();

  // Check if already exists as curated
  const existing = await db`
    SELECT id FROM style_profiles WHERE writer_name = ${writerName} AND is_curated = TRUE
  `;
  if (existing.length > 0) return existing[0].id;

  let contentSamples: string;

  if (process.env.TAVILY_API_KEY) {
    contentSamples = await fetchRealContent(writerName);
  } else {
    contentSamples = await synthesizeFromKnowledge(writerName);
  }

  // Generate style profile from content
  const profileResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are analyzing the writing style of ${writerName}. Based on these samples/knowledge of their work, create a detailed style profile.

${contentSamples}

Respond with JSON only:
{
  "tone": "...", "formality": 7, "sentence_style": "...",
  "vocabulary_level": "...", "document_structure": "...",
  "rhetorical_patterns": "...", "characteristic_phrases": ["..."],
  "punctuation_habits": "...", "opening_style": "...",
  "closing_style": "...", "distinctive_quirks": ["..."]
}`,
      },
    ],
  });

  const profileText =
    profileResponse.content[0].type === "text"
      ? profileResponse.content[0].text
      : "";
  const jsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse writer profile");

  const profileJson = JSON.parse(jsonMatch[0]);

  // Generate system prompt
  const promptResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create a detailed system prompt for an AI ghostwriter that perfectly mimics ${writerName}'s writing style. Use this style profile:

${JSON.stringify(profileJson, null, 2)}

The system prompt should instruct the AI to write exactly as ${writerName} would — matching their rhythm, vocabulary, sentence structure, rhetorical devices, and personality. Be specific with examples and patterns. The prompt should work for any topic/format the user requests.

Return ONLY the system prompt text, no wrapping.`,
      },
    ],
  });

  const systemPrompt =
    promptResponse.content[0].type === "text"
      ? promptResponse.content[0].text
      : "";

  const writerBio =
    bio ||
    CURATED_WRITERS.find((w) => w.name === writerName)?.bio ||
    "";

  const [row] = await db`
    INSERT INTO style_profiles (name, description, writer_name, writer_bio, is_curated, profile_json, system_prompt)
    VALUES (${writerName}, ${writerBio}, ${writerName}, ${writerBio}, TRUE, ${JSON.stringify(profileJson)}, ${systemPrompt})
    RETURNING id
  `;

  return row.id;
}

async function fetchRealContent(writerName: string): Promise<string> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: `${writerName} essays writing published full text`,
      max_results: 8,
      include_raw_content: true,
    }),
  });

  const data = await response.json();
  const texts: string[] = [];

  for (const result of data.results || []) {
    if (result.raw_content) {
      texts.push(
        `--- From: ${result.title} ---\n${result.raw_content.slice(0, 3000)}`
      );
    }
  }

  return texts.length > 0
    ? texts.join("\n\n")
    : synthesizeFromKnowledge(writerName);
}

async function synthesizeFromKnowledge(writerName: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a literary analyst. Provide a comprehensive analysis of ${writerName}'s writing style, including:
1. Multiple representative excerpts or close paraphrases that capture their voice
2. Analysis of their sentence structure, vocabulary, and rhythm
3. Their typical rhetorical devices and narrative techniques
4. How they open and close pieces
5. Their most distinctive stylistic quirks

Be as specific and detailed as possible with concrete examples.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function buildCustomWriter(
  userId: string,
  writerName: string,
  bio?: string
): Promise<number> {
  const db = sql();

  // For custom writer requests, build and mark as curated so others can use it too
  const profileId = await buildWriterProfile(writerName, bio);

  // Log that this user requested it
  await db`
    INSERT INTO usage_log (user_id, action, tokens_used)
    VALUES (${userId}, ${"writer_build:" + writerName}, ${0})
  `;

  return profileId;
}

export async function getCuratedProfiles() {
  const db = sql();
  return db`
    SELECT id, name, writer_name, writer_bio, description, is_curated,
      profile_json IS NOT NULL as has_profile
    FROM style_profiles
    WHERE is_curated = TRUE
    ORDER BY name
  `;
}

export async function seedCuratedWriters(): Promise<number> {
  const db = sql();
  let built = 0;

  for (const writer of CURATED_WRITERS) {
    const existing = await db`
      SELECT id FROM style_profiles WHERE writer_name = ${writer.name} AND is_curated = TRUE
    `;
    if (existing.length === 0) {
      await buildWriterProfile(writer.name, writer.bio);
      built++;
    }
  }

  return built;
}
