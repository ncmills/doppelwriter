import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

export async function analyzeAndCategorize(userId: string): Promise<{
  categories: string[];
  profileIds: number[];
}> {
  const db = sql();
  const samples = await db`
    SELECT id, title, source_type, content
    FROM writing_samples WHERE user_id = ${userId}
  `;

  if (samples.length === 0) return { categories: [], profileIds: [] };

  const excerpts = samples.map((s) => ({
    id: s.id,
    title: s.title,
    source_type: s.source_type,
    excerpt: (s.content as string).slice(0, 2000),
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze these writing samples from a single author. Group them into natural style categories based on voice, tone, and purpose.

${excerpts.map((e) => `--- Sample ${e.id}: "${e.title}" (${e.source_type}) ---\n${e.excerpt}\n`).join("\n")}

Respond with JSON only:
{ "categories": ["name", ...], "assignments": { "sample_id": "category_name", ... } }`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse categorization");

  const result = JSON.parse(jsonMatch[0]);

  // Clear old personal profiles for this user
  await db`DELETE FROM style_profiles WHERE user_id = ${userId} AND is_curated = FALSE`;

  const profileIds: number[] = [];
  const profileIdMap: Record<string, number> = {};

  for (const category of result.categories) {
    const [row] = await db`
      INSERT INTO style_profiles (user_id, name, is_curated)
      VALUES (${userId}, ${category}, FALSE)
      RETURNING id
    `;
    profileIdMap[category] = row.id;
    profileIds.push(row.id);
  }

  for (const [sampleId, category] of Object.entries(result.assignments)) {
    const profileId = profileIdMap[category as string];
    if (profileId) {
      await db`
        INSERT INTO sample_profiles (sample_id, profile_id)
        VALUES (${Number(sampleId)}, ${profileId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  // Generate detailed profiles for each
  for (const id of profileIds) {
    await generateProfile(id);
  }

  return { categories: result.categories, profileIds };
}

export async function generateProfile(profileId: number): Promise<void> {
  const db = sql();

  const [profile] = await db`SELECT * FROM style_profiles WHERE id = ${profileId}`;
  if (!profile) throw new Error("Profile not found");

  const samples = await db`
    SELECT ws.content, ws.title FROM writing_samples ws
    JOIN sample_profiles sp ON sp.sample_id = ws.id
    WHERE sp.profile_id = ${profileId}
  `;

  if (samples.length === 0) return;

  const sampleText = samples
    .map((s) => `--- "${s.title}" ---\n${(s.content as string).slice(0, 3000)}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze these writing samples from the "${profile.name}" style category. Extract a detailed style profile.

${sampleText}

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

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse profile");

  const profileJson = JSON.parse(jsonMatch[0]);
  const systemPrompt = buildSystemPrompt(profile.name as string, profileJson);

  await db`
    UPDATE style_profiles
    SET profile_json = ${JSON.stringify(profileJson)}, system_prompt = ${systemPrompt}, updated_at = NOW()
    WHERE id = ${profileId}
  `;
}

function buildSystemPrompt(
  name: string,
  p: Record<string, unknown>
): string {
  return `You are a ghostwriter perfectly mimicking a specific author's "${name}" writing style.

TONE: ${p.tone}
FORMALITY: ${p.formality}/10
SENTENCE STYLE: ${p.sentence_style}
VOCABULARY: ${p.vocabulary_level}

STRUCTURE: ${p.document_structure}
RHETORIC: ${p.rhetorical_patterns}

CHARACTERISTIC PHRASES: ${(p.characteristic_phrases as string[]).join(", ")}
PUNCTUATION: ${p.punctuation_habits}

OPENING STYLE: ${p.opening_style}
CLOSING STYLE: ${p.closing_style}

QUIRKS: ${(p.distinctive_quirks as string[]).join("; ")}

Write exactly as this author would — match their rhythm, word choices, structural preferences, and personality. The output should be indistinguishable from their own writing.`;
}

export async function getProfiles(userId: string) {
  const db = sql();
  return db`
    SELECT sp.*,
      (SELECT COUNT(*)::int FROM sample_profiles spp WHERE spp.profile_id = sp.id) as sample_count
    FROM style_profiles sp
    WHERE sp.user_id = ${userId} OR sp.is_curated = TRUE
    ORDER BY sp.is_curated DESC, sp.name
  `;
}

export async function getProfile(id: number) {
  const db = sql();
  const rows = await db`SELECT * FROM style_profiles WHERE id = ${id}`;
  return rows[0] || null;
}

export async function updateProfile(
  id: number,
  updates: { name?: string; system_prompt?: string }
) {
  const db = sql();
  if (updates.name) {
    await db`UPDATE style_profiles SET name = ${updates.name}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (updates.system_prompt) {
    await db`UPDATE style_profiles SET system_prompt = ${updates.system_prompt}, updated_at = NOW() WHERE id = ${id}`;
  }
}
