import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { CLAUDE_MODEL } from "./models";

const client = new Anthropic();

export interface QualityDimension {
  name: string;
  score: number; // 0-100
  status: "strong" | "moderate" | "weak" | "missing";
  description: string;
  improvement: string; // What to upload to improve this dimension
}

export interface ProfileQuality {
  overall: number; // 0-100
  dimensions: QualityDimension[];
  topRecommendation: string;
  sampleTypes: { type: string; count: number }[];
}

export async function assessProfileQuality(profileId: number): Promise<ProfileQuality> {
  const db = sql();

  const [profile] = await db`SELECT * FROM style_profiles WHERE id = ${profileId}`;
  if (!profile || !profile.profile_json) {
    return {
      overall: 0,
      dimensions: getEmptyDimensions(),
      topRecommendation: "Upload your first writing samples to get started.",
      sampleTypes: [],
    };
  }

  const profileJson = typeof profile.profile_json === "string"
    ? JSON.parse(profile.profile_json)
    : profile.profile_json;

  const corrections = await db`
    SELECT correction_type, COUNT(*)::int as count FROM voice_corrections
    WHERE profile_id = ${profileId}
    GROUP BY correction_type
  `;

  const correctionCount = (corrections as { count: number }[]).reduce((sum, c) => sum + c.count, 0);
  const exemplars = profile.exemplar_passages
    ? (typeof profile.exemplar_passages === "string" ? JSON.parse(profile.exemplar_passages) : profile.exemplar_passages)
    : [];

  // Ask Claude to evaluate the profile quality
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Evaluate this writing style profile for completeness and quality. Score each dimension 0-100 based on how well-defined and distinctive the patterns are. A score of 100 means the profile is so specific that output would be indistinguishable from the author.

PROFILE:
${JSON.stringify(profileJson, null, 2)}

NUMBER OF EXEMPLAR PASSAGES: ${exemplars.length}
NUMBER OF CORRECTIONS LEARNED: ${correctionCount}

Score these dimensions and for any below 80, suggest what TYPE of writing sample would improve it most:

1. Sentence Rhythm (sentence length variation, cadence, flow)
2. Vocabulary & Word Choice (distinctive words, vocabulary level)
3. Tone & Personality (warmth, formality, humor, confidence)
4. Structure & Pacing (paragraph patterns, transitions, argument flow)
5. Punctuation & Mechanics (em dashes, semicolons, contractions, etc.)
6. Opening & Closing Patterns (how they start/end pieces)
7. Anti-Patterns (what they NEVER do — more specific = better)
8. Emotional Range (formal vs casual, serious vs playful diversity)

Respond JSON only:
{
  "dimensions": [
    {
      "name": "Sentence Rhythm",
      "score": 75,
      "description": "brief assessment of current quality",
      "improvement": "Upload longer-form essays or blog posts to capture your natural paragraph rhythm"
    },
    ...
  ],
  "topRecommendation": "The single most impactful thing you could upload right now to improve your profile"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      overall: 50,
      dimensions: getEmptyDimensions(),
      topRecommendation: "Upload more diverse writing samples to improve your profile.",
      sampleTypes: [],
    };
  }

  const result = JSON.parse(jsonMatch[0]);
  const dimensions: QualityDimension[] = result.dimensions.map((d: { name: string; score: number; description: string; improvement: string }) => ({
    name: d.name,
    score: d.score,
    status: d.score >= 80 ? "strong" : d.score >= 60 ? "moderate" : d.score >= 30 ? "weak" : "missing",
    description: d.description,
    improvement: d.improvement,
  }));

  const overall = Math.round(dimensions.reduce((sum: number, d: { score: number }) => sum + d.score, 0) / dimensions.length);

  return {
    overall,
    dimensions,
    topRecommendation: result.topRecommendation,
    sampleTypes: [],
  };
}

function getEmptyDimensions(): QualityDimension[] {
  return [
    { name: "Sentence Rhythm", score: 0, status: "missing", description: "No data", improvement: "Upload any writing sample to start" },
    { name: "Vocabulary & Word Choice", score: 0, status: "missing", description: "No data", improvement: "Upload emails or essays" },
    { name: "Tone & Personality", score: 0, status: "missing", description: "No data", improvement: "Upload casual and formal writing" },
    { name: "Structure & Pacing", score: 0, status: "missing", description: "No data", improvement: "Upload longer-form writing" },
    { name: "Punctuation & Mechanics", score: 0, status: "missing", description: "No data", improvement: "Upload any writing sample" },
    { name: "Opening & Closing Patterns", score: 0, status: "missing", description: "No data", improvement: "Upload complete pieces (not fragments)" },
    { name: "Anti-Patterns", score: 0, status: "missing", description: "No data", improvement: "Use the editor — corrections teach what you don't like" },
    { name: "Emotional Range", score: 0, status: "missing", description: "No data", improvement: "Upload both formal and casual writing" },
  ];
}
