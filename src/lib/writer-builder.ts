// Server-only module — imports Anthropic SDK, must not be imported from client components.
// For writer data (CURATED_WRITERS, CATEGORIES), import from "./writer-data" instead.

import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { CURATED_WRITERS } from "./writer-data";

// Re-export for server-side consumers that imported from here before
export { CURATED_WRITERS, CATEGORIES } from "./writer-data";
export type { CuratedWriter } from "./writer-data";

const client = new Anthropic();

export async function buildWriterProfile(
  writerName: string,
  bio?: string
): Promise<number> {
  const db = sql();

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

  const profileResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze the writing/speaking style of ${writerName}. Create a detailed style profile.

${contentSamples}

Respond with JSON only:
{
  "micro": {
    "sentence_length_range": "...", "sentence_length_variance": "...",
    "rhythm_and_cadence": "...", "word_choice_patterns": "...",
    "vocabulary_level": "...", "punctuation_habits": "...",
    "function_word_patterns": "...", "characteristic_phrases": ["..."],
    "contractions_usage": "..."
  },
  "macro": {
    "paragraph_structure": "...", "paragraph_length_tendency": "...",
    "transition_style": "...", "argument_structure": "...",
    "opening_patterns": "...", "closing_patterns": "...",
    "pacing": "...", "use_of_examples": "..."
  },
  "anti_patterns": {
    "words_never_used": ["..."], "structures_avoided": ["..."],
    "tonal_boundaries": ["..."], "formatting_avoidances": ["..."]
  },
  "tone": "...", "formality": 7, "distinctive_quirks": ["..."],
  "overall_personality": "..."
}`,
      },
    ],
  });

  const profileText = profileResponse.content[0].type === "text" ? profileResponse.content[0].text : "";
  const jsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse writer profile");
  const profileJson = JSON.parse(jsonMatch[0]);

  const promptResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create a system prompt for an AI ghostwriter mimicking ${writerName}'s style. Use this profile:

${JSON.stringify(profileJson, null, 2)}

The prompt should instruct the AI to write exactly as ${writerName} would. Be specific. Include anti-AI-ism rules (never use "Moreover", "Furthermore", etc.). Return ONLY the prompt text.`,
      },
    ],
  });

  const systemPrompt = promptResponse.content[0].type === "text" ? promptResponse.content[0].text : "";
  const writerBio = bio || CURATED_WRITERS.find((w) => w.name === writerName)?.bio || "";
  const writerCategory = CURATED_WRITERS.find((w) => w.name === writerName)?.category || "custom";

  const [row] = await db`
    INSERT INTO style_profiles (name, description, writer_name, writer_bio, writer_category, is_curated, profile_json, system_prompt)
    VALUES (${writerName}, ${writerBio}, ${writerName}, ${writerBio}, ${writerCategory}, TRUE, ${JSON.stringify(profileJson)}, ${systemPrompt})
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
      texts.push(`--- From: ${result.title} ---\n${result.raw_content.slice(0, 3000)}`);
    }
  }

  return texts.length > 0 ? texts.join("\n\n") : synthesizeFromKnowledge(writerName);
}

async function synthesizeFromKnowledge(writerName: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Provide a comprehensive analysis of ${writerName}'s writing/speaking style with multiple representative excerpts or close paraphrases, sentence structure analysis, rhetorical devices, and distinctive quirks. Be specific with examples.`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function buildCustomWriter(
  userId: string,
  writerName: string,
  bio?: string,
  category?: string
): Promise<number> {
  const db = sql();
  const profileId = await buildWriterProfile(writerName, bio);

  if (category) {
    await db`UPDATE style_profiles SET writer_category = ${category} WHERE id = ${profileId}`;
  }

  await db`
    INSERT INTO usage_log (user_id, action) VALUES (${userId}, ${"writer_build:" + writerName})
  `;

  return profileId;
}

export async function getCuratedProfiles(category?: string) {
  const db = sql();
  if (category) {
    return db`
      SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
        profile_json IS NOT NULL as has_profile
      FROM style_profiles
      WHERE is_curated = TRUE AND writer_category = ${category}
      ORDER BY name
    `;
  }
  return db`
    SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
      profile_json IS NOT NULL as has_profile
    FROM style_profiles
    WHERE is_curated = TRUE
    ORDER BY writer_category, name
  `;
}

export async function searchCuratedProfiles(query: string) {
  const db = sql();
  return db`
    SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
      profile_json IS NOT NULL as has_profile
    FROM style_profiles
    WHERE is_curated = TRUE
    AND (writer_name ILIKE ${"%" + query + "%"} OR writer_bio ILIKE ${"%" + query + "%"} OR writer_category ILIKE ${"%" + query + "%"})
    ORDER BY name
  `;
}
