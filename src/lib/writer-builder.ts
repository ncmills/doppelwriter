// Server-only module — imports Anthropic SDK, must not be imported from client components.
// For writer data (CURATED_WRITERS, CATEGORIES), import from "./writer-data" instead.

import { sql } from "./db";
import { CLAUDE_MODEL, getAnthropicClient } from "./models";
import { CURATED_WRITERS } from "./writer-data";
import { buildMultiLayerPrompt } from "./style-analyzer";

// Re-export for server-side consumers that imported from here before
export { CURATED_WRITERS, CATEGORIES } from "./writer-data";
export type { CuratedWriter } from "./writer-data";

const client = getAnthropicClient();

export async function buildWriterProfile(
  writerName: string,
  bio?: string
): Promise<number> {
  const db = sql();

  const existing = await db`
    SELECT id FROM style_profiles WHERE writer_name = ${writerName} AND is_curated = TRUE
  `;
  if (existing.length > 0) return existing[0].id;

  const { content: contentSamples } = await fetchRealContent(writerName);

  // Step 1: Extract structured multi-layer profile (same format as personal voices)
  const profileResponse = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a forensic writing analyst. Analyze the writing/speaking style of ${writerName} with extreme precision. Decompose their voice into micro (sentence-level) and macro (structure-level) patterns, and identify what they NEVER do.

${contentSamples}

Respond with JSON only:
{
  "micro": {
    "sentence_length_range": "e.g., 5-35 words, averaging 18",
    "sentence_length_variance": "e.g., high — alternates punchy fragments with long flowing sentences",
    "rhythm_and_cadence": "describe the musicality and flow patterns",
    "word_choice_patterns": "concrete vs abstract, simple vs elevated, specific preferences",
    "vocabulary_level": "describe range and any distinctive word preferences",
    "punctuation_habits": "em dashes, semicolons, parentheticals, ellipses — be specific",
    "function_word_patterns": "pronoun preferences (I vs we vs you), article usage, preposition habits",
    "characteristic_phrases": ["exact phrases or constructions they reuse"],
    "contractions_usage": "always, never, selectively — describe pattern"
  },
  "macro": {
    "paragraph_structure": "how paragraphs are built internally",
    "paragraph_length_tendency": "short/medium/long, with typical word counts",
    "transition_style": "how they move between ideas — explicit connectors or implicit?",
    "argument_structure": "how they build a case or narrative",
    "opening_patterns": "how they begin pieces",
    "closing_patterns": "how they end pieces",
    "pacing": "fast/slow/variable, where they accelerate or decelerate",
    "use_of_examples": "anecdotes, data, metaphors — what evidence style?"
  },
  "anti_patterns": {
    "words_never_used": ["words this author clearly avoids"],
    "structures_avoided": ["e.g., never uses bullet points, never opens with a question"],
    "tonal_boundaries": ["e.g., never sarcastic, never uses exclamation marks"],
    "formatting_avoidances": ["e.g., never uses headers, never writes single-sentence paragraphs"]
  },
  "tone": "overall tonal description",
  "formality": 7,
  "distinctive_quirks": ["specific, concrete quirks"],
  "overall_personality": "the human behind the writing in 2-3 sentences"
}`,
      },
    ],
  });

  const profileText = profileResponse.content[0].type === "text" ? profileResponse.content[0].text : "";
  const jsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse writer profile");
  const profileJson = JSON.parse(jsonMatch[0]);

  // Step 2: Build system prompt programmatically (same structure as personal voices)
  const systemPrompt = buildMultiLayerPrompt(writerName, profileJson, [], []);

  const writerBio = bio || CURATED_WRITERS.find((w) => w.name === writerName)?.bio || "";
  const writerCategory = CURATED_WRITERS.find((w) => w.name === writerName)?.category || "custom";

  const [row] = await db`
    INSERT INTO style_profiles (name, description, writer_name, writer_bio, writer_category, is_curated, profile_json, system_prompt)
    VALUES (${writerName}, ${writerBio}, ${writerName}, ${writerBio}, ${writerCategory}, TRUE, ${JSON.stringify(profileJson)}, ${systemPrompt})
    RETURNING id
  `;

  return row.id;
}

async function fetchRealContent(writerName: string): Promise<{ content: string; fromWeb: boolean }> {
  if (!process.env.TAVILY_API_KEY) {
    return { content: await synthesizeFromKnowledge(writerName), fromWeb: false };
  }

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

  if (texts.length > 0) {
    return { content: texts.join("\n\n"), fromWeb: true };
  }

  return { content: await synthesizeFromKnowledge(writerName), fromWeb: false };
}

async function synthesizeFromKnowledge(writerName: string): Promise<string> {
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
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
