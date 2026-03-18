import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

// ── Multi-Layer Voice Architecture ──────────────────────────────────────────
// Decomposes voice into micro (sentence-level) and macro (structure-level)
// layers, plus anti-patterns and exemplar passages.

interface MicroProfile {
  sentence_length_range: string;
  sentence_length_variance: string;
  rhythm_and_cadence: string;
  word_choice_patterns: string;
  vocabulary_level: string;
  punctuation_habits: string;
  function_word_patterns: string;
  characteristic_phrases: string[];
  contractions_usage: string;
}

interface MacroProfile {
  paragraph_structure: string;
  paragraph_length_tendency: string;
  transition_style: string;
  argument_structure: string;
  opening_patterns: string;
  closing_patterns: string;
  pacing: string;
  use_of_examples: string;
}

interface AntiPatterns {
  words_never_used: string[];
  structures_avoided: string[];
  tonal_boundaries: string[];
  formatting_avoidances: string[];
}

interface FullStyleProfile {
  micro: MicroProfile;
  macro: MacroProfile;
  anti_patterns: AntiPatterns;
  tone: string;
  formality: number;
  distinctive_quirks: string[];
  overall_personality: string;
}

// ── Analysis ────────────────────────────────────────────────────────────────

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

  for (const id of profileIds) {
    await generateProfile(id);
  }

  return { categories: result.categories, profileIds };
}

// ── Multi-Layer Profile Generation ──────────────────────────────────────────

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
    .map((s) => `--- "${s.title}" ---\n${(s.content as string).slice(0, 4000)}`)
    .join("\n\n");

  // Step 1: Extract multi-layer profile
  const profileResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a forensic writing analyst. Analyze these samples from the "${profile.name}" category with extreme precision. Decompose the author's voice into micro (sentence-level) and macro (structure-level) patterns, and identify what they NEVER do.

${sampleText}

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
  const profileJsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!profileJsonMatch) throw new Error("Failed to parse profile");
  const profileJson = JSON.parse(profileJsonMatch[0]) as FullStyleProfile;

  // Step 2: Select best exemplar passages
  const exemplarResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `From these writing samples, select the 2 passages (each 100-300 words) that BEST showcase this author's distinctive voice. Choose passages where their personality, rhythm, and style are most vivid and recognizable.

${sampleText}

Return JSON only:
{ "exemplars": ["passage 1 text...", "passage 2 text..."] }`,
      },
    ],
  });

  const exemplarText = exemplarResponse.content[0].type === "text" ? exemplarResponse.content[0].text : "";
  const exemplarMatch = exemplarText.match(/\{[\s\S]*\}/);
  let exemplars: string[] = [];
  if (exemplarMatch) {
    try {
      exemplars = JSON.parse(exemplarMatch[0]).exemplars || [];
    } catch { /* use empty */ }
  }

  // Step 3: Check for user corrections to incorporate
  const corrections = await db`
    SELECT original_text, corrected_text FROM voice_corrections
    WHERE profile_id = ${profileId}
    ORDER BY created_at DESC LIMIT 20
  `.catch(() => []) as { original_text: string; corrected_text: string }[];

  // Step 4: Build the system prompt
  const systemPrompt = buildMultiLayerPrompt(profile.name as string, profileJson, exemplars, corrections);

  await db`
    UPDATE style_profiles
    SET profile_json = ${JSON.stringify(profileJson)},
        system_prompt = ${systemPrompt},
        exemplar_passages = ${JSON.stringify(exemplars)},
        updated_at = NOW()
    WHERE id = ${profileId}
  `;
}

function buildMultiLayerPrompt(
  name: string,
  p: FullStyleProfile,
  exemplars: string[],
  corrections: Array<{ original_text: string; corrected_text: string }>
): string {
  let prompt = `You are ghostwriting as a specific author in their "${name}" voice. Match their writing EXACTLY — not approximately, not "inspired by," but indistinguishable from their own hand.

═══ MICRO LAYER (Sentence-Level) ═══
SENTENCE LENGTH: ${p.micro.sentence_length_range}. Variance: ${p.micro.sentence_length_variance}
RHYTHM: ${p.micro.rhythm_and_cadence}
WORD CHOICE: ${p.micro.word_choice_patterns}
VOCABULARY: ${p.micro.vocabulary_level}
PUNCTUATION: ${p.micro.punctuation_habits}
FUNCTION WORDS: ${p.micro.function_word_patterns}
CONTRACTIONS: ${p.micro.contractions_usage}
CHARACTERISTIC PHRASES (use naturally): ${p.micro.characteristic_phrases.join(" | ")}

═══ MACRO LAYER (Structure-Level) ═══
PARAGRAPHS: ${p.macro.paragraph_structure} (typically ${p.macro.paragraph_length_tendency})
TRANSITIONS: ${p.macro.transition_style}
ARGUMENT STRUCTURE: ${p.macro.argument_structure}
OPENINGS: ${p.macro.opening_patterns}
CLOSINGS: ${p.macro.closing_patterns}
PACING: ${p.macro.pacing}
EVIDENCE STYLE: ${p.macro.use_of_examples}

═══ ANTI-PATTERNS (Things this author NEVER does) ═══
FORBIDDEN WORDS: ${p.anti_patterns.words_never_used.join(", ")}
AVOIDED STRUCTURES: ${p.anti_patterns.structures_avoided.join("; ")}
TONAL LIMITS: ${p.anti_patterns.tonal_boundaries.join("; ")}
FORMAT AVOIDANCES: ${p.anti_patterns.formatting_avoidances.join("; ")}

═══ AI-ISM SUPPRESSION ═══
NEVER use: "Moreover," "Furthermore," "Additionally," "In conclusion," "It's worth noting," "Delve," "Crucial," "Landscape," "Leverage," "Elevate," "Streamline," "Robust," "Utilize"
NEVER use present participial openings ("Being a...", "Having considered...")
NEVER over-explain or pad sentences. If 5 words work, do not use 15.
NEVER use noun-heavy academic phrasing. Prefer verbs over nominalizations.
NEVER begin consecutive paragraphs with the same word or structure.

═══ PERSONALITY ═══
TONE: ${p.tone} (formality: ${p.formality}/10)
QUIRKS: ${p.distinctive_quirks.join("; ")}
WHO THEY ARE: ${p.overall_personality}`;

  if (exemplars.length > 0) {
    prompt += `\n\n═══ EXEMPLAR PASSAGES (This is what their writing actually sounds like) ═══`;
    exemplars.forEach((ex, i) => {
      prompt += `\n\n--- Example ${i + 1} ---\n${ex}`;
    });
  }

  if (corrections.length > 0) {
    prompt += `\n\n═══ LEARNED CORRECTIONS (The author has corrected your output before) ═══`;
    prompt += `\nWhen you wrote something the author didn't like, they changed it. Learn from these:`;
    for (const c of corrections.slice(0, 10)) {
      prompt += `\n• YOU WROTE: "${c.original_text.slice(0, 200)}"`;
      prompt += `\n  THEY CHANGED TO: "${c.corrected_text.slice(0, 200)}"`;
    }
  }

  prompt += `\n\nWrite EXACTLY as this author would. Match their rhythm at the sentence level and their structure at the paragraph level. The output should pass a blind test — a reader who knows this author should not be able to tell you apart.`;

  return prompt;
}

// ── Queries ─────────────────────────────────────────────────────────────────

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
