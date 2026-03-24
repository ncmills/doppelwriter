import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { CLAUDE_MODEL } from "./models";

const client = new Anthropic();

// Retry wrapper for Anthropic API calls with rate limit backoff
async function callWithRetry(
  fn: () => Promise<Anthropic.Message>,
  maxRetries = 3
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < maxRetries) {
        // Rate limited — wait with exponential backoff (15s, 30s, 60s)
        const delay = 15000 * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

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

  let result: { categories: string[]; assignments: Record<string, string> };

  if (samples.length <= 10) {
    // Single-category fast path: skip the categorization API call entirely.
    // Personal profiles are typically one voice — no need to categorize.
    const categoryName = "Personal Voice";
    result = {
      categories: [categoryName],
      assignments: Object.fromEntries(samples.map((s) => [String(s.id), categoryName])),
    };
  } else {
    // Only categorize when there are many samples that might have distinct voices
    // Use modest excerpts for categorization — we just need enough to group them
    const excerpts = samples.map((s) => ({
      id: s.id,
      title: s.title,
      source_type: s.source_type,
      excerpt: (s.content as string).slice(0, 1500),
    }));

    const response = await callWithRetry(() => client.messages.create({
      model: CLAUDE_MODEL,
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
    }));

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse categorization");
    result = JSON.parse(jsonMatch[0]);
  }

  // Create new profiles first, generate them, then clean up old ones.
  // This way, if generation fails mid-way, the user still has their old profiles.
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
    const numericId = Number(sampleId);
    if (!Number.isFinite(numericId)) continue;
    const profileId = profileIdMap[category as string];
    if (profileId) {
      await db`
        INSERT INTO sample_profiles (sample_id, profile_id)
        VALUES (${numericId}, ${profileId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  // Generate profiles sequentially to avoid rate limits
  for (const id of profileIds) {
    await generateProfile(id);
  }

  // Only clean up after all profiles are successfully generated:
  // 1. Remove old user profiles (the new ones are ready)
  await db`DELETE FROM style_profiles WHERE user_id = ${userId} AND is_curated = FALSE AND id != ALL(${profileIds})`;
  // 2. Purge raw writing samples — only the extracted profile persists.
  // "We read your writing, learn your voice, and forget the rest."
  await db`DELETE FROM writing_samples WHERE user_id = ${userId}`;

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

  // Smart content selection: ~25k chars (~5k words) is the sweet spot.
  // Beyond that, voice analysis has diminishing returns — we're just
  // burning tokens. Select a diverse subset that covers the voice well.
  const MAX_ANALYSIS_CHARS = 25000;

  // Sort samples by word count descending — longer pieces carry more signal
  const sorted = [...samples].sort(
    (a, b) => (b.content as string).length - (a.content as string).length
  );

  // Greedily pick samples until we hit the cap, ensuring variety
  const selected: typeof samples = [];
  let totalChars = 0;
  for (const s of sorted) {
    const content = s.content as string;
    const take = Math.min(content.length, MAX_ANALYSIS_CHARS - totalChars);
    if (take < 500) break; // don't include tiny scraps
    selected.push({ ...s, content: content.slice(0, take) });
    totalChars += take;
    if (totalChars >= MAX_ANALYSIS_CHARS) break;
  }

  const sampleText = selected
    .map((s) => `--- "${s.title}" ---\n${s.content as string}`)
    .join("\n\n");

  // Step 1: Extract multi-layer profile
  const profileResponse = await callWithRetry(() => client.messages.create({
    model: CLAUDE_MODEL,
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
  }));

  const profileText = profileResponse.content[0].type === "text" ? profileResponse.content[0].text : "";
  const profileJsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!profileJsonMatch) throw new Error("Failed to parse profile");
  const profileJson = JSON.parse(profileJsonMatch[0]) as FullStyleProfile;

  // Wait between calls to avoid rate limiting (30k tokens/min)
  await new Promise((r) => setTimeout(r, 5000));

  // Step 2: Select best exemplar passages
  const exemplarResponse = await callWithRetry(() => client.messages.create({
    model: CLAUDE_MODEL,
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
  }));

  const exemplarText = exemplarResponse.content[0].type === "text" ? exemplarResponse.content[0].text : "";
  const exemplarMatch = exemplarText.match(/\{[\s\S]*\}/);
  let exemplars: string[] = [];
  if (exemplarMatch) {
    try {
      exemplars = JSON.parse(exemplarMatch[0]).exemplars || [];
    } catch { /* use empty */ }
  }

  // Step 3: Check for user corrections to incorporate
  let corrections: { original_text: string; corrected_text: string; correction_type: string; lesson: string }[] = [];
  try {
    corrections = await db`
      SELECT original_text, corrected_text, correction_type, lesson FROM voice_corrections
      WHERE profile_id = ${profileId}
      ORDER BY created_at DESC LIMIT 30
    ` as typeof corrections;
  } catch (err) {
    console.error(`Failed to fetch corrections for profile ${profileId}:`, err);
  }

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
  corrections: Array<{ original_text: string; corrected_text: string; correction_type: string; lesson: string }>
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

═══ STYLE BOUNDARIES ═══
This author's voice stays WITHIN these boundaries:
WORD PALETTE: Use only words this author would naturally choose. Their avoided words include: ${p.anti_patterns.words_never_used.join(", ")}
STRUCTURAL PREFERENCES: ${p.anti_patterns.structures_avoided.join("; ")}
TONAL RANGE: ${p.anti_patterns.tonal_boundaries.join("; ")}
FORMAT CHOICES: ${p.anti_patterns.formatting_avoidances.join("; ")}

═══ VOICE PURITY (Positive Rules) ═══
Use simple, direct transition words ("And," "But," "So," "Still," "Then") instead of formal connectors.
Open sentences with the subject or a strong verb. Lead with action.
Say it once, clearly. Trust the reader. Tighten every sentence to its essential words.
Let verbs carry the meaning. Choose "decide" over "make a decision," "use" over "utilize."
Vary paragraph openings — start each paragraph differently from the last.

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

  // Separate lessons from raw corrections
  const lessons = corrections.filter((c) => c.lesson && c.correction_type !== "accept");
  const accepts = corrections.filter((c) => c.correction_type === "accept");

  if (lessons.length > 0) {
    prompt += `\n\n═══ LEARNED PREFERENCES (from ${lessons.length} corrections + ${accepts.length} approvals) ═══`;
    prompt += `\nThe author has been editing your output. Here is what you've learned about their preferences:`;

    // Group lessons — these are the analyzed WHY behind each edit
    const uniqueLessons = [...new Set(lessons.map((c) => c.lesson))].slice(0, 15);
    for (const lesson of uniqueLessons) {
      prompt += `\n• ${lesson}`;
    }

    // Show a few concrete before/after examples
    prompt += `\n\nSpecific corrections:`;
    for (const c of lessons.slice(0, 5)) {
      prompt += `\n• YOU WROTE: "${c.original_text.slice(0, 150)}"`;
      prompt += `\n  THEY CHANGED TO: "${c.corrected_text.slice(0, 150)}"`;
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
  updates: { name?: string; system_prompt?: string; profile_json?: string; voice_overrides?: Record<string, number> }
) {
  const db = sql();
  if (updates.name) {
    await db`UPDATE style_profiles SET name = ${updates.name}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (updates.system_prompt) {
    await db`UPDATE style_profiles SET system_prompt = ${updates.system_prompt}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (updates.profile_json) {
    await db`UPDATE style_profiles SET profile_json = ${updates.profile_json}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (updates.voice_overrides) {
    // Store overrides as JSON — these modify the system prompt at generation time
    await db`UPDATE style_profiles SET voice_overrides = ${JSON.stringify(updates.voice_overrides)}, updated_at = NOW() WHERE id = ${id}`;
  }
}
