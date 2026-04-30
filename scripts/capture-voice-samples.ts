// One-off script: captures real Claude outputs for 3 writers using the same
// brief and model as /api/demo. Uses minimal style-tuning system prompts
// (matching /api/demo's Hemingway fallback shape). Outputs:
//   _assets/voice-samples/{slug}.json  with { writer, brief, sample, capturedAt }
//
// Run with: cd ~/claude/doppelwriter && npx tsx scripts/capture-voice-samples.ts

// Env is loaded by shell: `set -a && source .env.local && set +a` before running.
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Match /api/demo's brief verbatim — same prompt the homepage cinematic frames around.
const BRIEF =
  "Write a paragraph about why the best ideas come when you're not trying";

// Style-tuning system prompts modeled after /api/demo's Hemingway fallback shape.
// Kept minimal (concrete, named patterns) so the model's voice cloning is the
// thing being tested — not our prompt verbosity.
const WRITERS: { name: string; slug: string; system: string }[] = [
  {
    name: "Joan Didion",
    slug: "joan-didion",
    system:
      "You are Joan Didion. Write a single paragraph in her unmistakable style: long, controlled, recursive sentences that loop back on themselves; flat affect concealing exact emotional precision; specific California or East-Coast detail; the cadence of someone watching herself watch. Use 'one' and 'we' and 'I' deliberately. Do not perform. Do not hedge. Write one paragraph only.",
  },
  {
    name: "Ernest Hemingway",
    slug: "ernest-hemingway",
    system:
      "You are Ernest Hemingway. Write a single paragraph in his unmistakable style: short declarative sentences, minimal adjectives, concrete nouns, understated emotion, the iceberg theory. Use 'and' as a connector. No interior monologue. No abstractions. Write one paragraph only.",
  },
  {
    name: "Paul Graham",
    slug: "paul-graham",
    system:
      "You are Paul Graham. Write a single paragraph in his unmistakable style: clear, direct sentences of medium length; concrete examples drawn from startups, programming, or thinking; an analytical-essay tone that earns each claim; one good metaphor; no jargon and no hedging. Write one paragraph only.",
  },
  {
    name: "Barack Obama",
    slug: "barack-obama",
    system:
      "You are Barack Obama. Write a single paragraph in his unmistakable style: balanced rhetorical structure with rule-of-three patterns; measured sentences that build toward a moral or unifying point; specific American detail; the cadence of someone who weighs each word for fairness; uses 'we' and 'our' deliberately; warm but precise. Write one paragraph only.",
  },
  {
    name: "Toni Morrison",
    slug: "toni-morrison",
    system:
      "You are Toni Morrison. Write a single paragraph in her unmistakable style: musical, weighty sentences that hold both the visible and the buried; rhythm pulled from oral tradition and Black church syntax; sensory specificity; metaphor that haunts rather than decorates; the cadence of language that knows it carries history. Write one paragraph only.",
  },
];

async function captureOne(client: Anthropic, w: typeof WRITERS[number]) {
  console.log(`Capturing ${w.name}…`);
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: [{ type: "text", text: w.system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: BRIEF }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  return {
    writer: w.name,
    slug: w.slug,
    brief: BRIEF,
    sample: text,
    capturedAt: new Date().toISOString(),
    model: "claude-sonnet-4-5",
  };
}

async function main() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("Missing ANTHROPIC_API_KEY in env. Source .env.local first.");
    process.exit(1);
  }

  const outDir = join(process.cwd(), "_assets", "voice-samples");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const client = new Anthropic({ apiKey: key });
  const results = [];
  for (const w of WRITERS) {
    const sample = await captureOne(client, w);
    writeFileSync(join(outDir, `${w.slug}.json`), JSON.stringify(sample, null, 2));
    console.log(`  ✓ ${w.slug}.json (${sample.sample.length} chars)`);
    results.push(sample);
  }

  // Combined manifest
  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify({ brief: BRIEF, writers: results }, null, 2),
  );
  console.log(`\nWrote ${results.length} voice samples to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
