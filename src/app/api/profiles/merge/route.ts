import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/models";

const client = new Anthropic();

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileIds, name, weights } = await request.json();

  if (!profileIds || profileIds.length < 2) {
    return NextResponse.json({ error: "Select at least 2 voices to merge" }, { status: 400 });
  }

  const db = sql();

  // Fetch all profiles to merge — only allow profiles the user owns or curated ones
  const profiles = await db`
    SELECT id, name, writer_name, system_prompt, profile_json, is_curated
    FROM style_profiles
    WHERE id = ANY(${profileIds})
    AND (user_id = ${session.user.id} OR is_curated = TRUE)
  `;

  if (profiles.length < 2) {
    return NextResponse.json({ error: "Could not find all selected profiles" }, { status: 400 });
  }

  // Build the merged profile using Claude
  const profileDescriptions = profiles.map((p, i) => {
    const weight = weights?.[i] || Math.round(100 / profiles.length);
    return `--- Voice ${i + 1}: "${p.writer_name || p.name}" (${weight}% influence) ---\n${p.system_prompt || JSON.stringify(p.profile_json)}`;
  }).join("\n\n");

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are creating a HYBRID writing voice by merging multiple style profiles. The result should be a coherent, natural voice that blends elements from each source voice according to their weight percentages.

SOURCE VOICES:
${profileDescriptions}

Create a merged system prompt that:
1. Blends the sentence rhythm and vocabulary from all sources proportionally
2. Combines distinctive phrases and patterns from each voice
3. Merges the structural preferences (paragraph style, transitions, openings/closings)
4. Resolves conflicts by favoring the higher-weighted voice
5. Creates a coherent personality description for the hybrid
6. Includes anti-AI-ism rules (never use "Moreover", "Furthermore", etc.)

The merged voice should feel NATURAL — like a real person who was influenced by all these writers, not a jarring mix. It should read as one cohesive voice.

Return ONLY the system prompt text. No commentary or preamble.`,
      },
    ],
  });

  const mergedPrompt = response.content[0].type === "text" ? response.content[0].text : "";
  const sourceNames = profiles.map((p) => p.writer_name || p.name).join(" + ");
  const mergeName = name || `${sourceNames} Blend`;

  // Create the merged profile
  const [row] = await db`
    INSERT INTO style_profiles (
      user_id, name, description, is_curated, system_prompt, profile_json
    ) VALUES (
      ${session.user.id},
      ${mergeName},
      ${"Merged voice: " + sourceNames},
      FALSE,
      ${mergedPrompt},
      ${JSON.stringify({ merged_from: profiles.map((p) => ({ id: p.id, name: p.writer_name || p.name })) })}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id, name: mergeName });
}
