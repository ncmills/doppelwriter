import Anthropic from "@anthropic-ai/sdk";

// Centralized model configuration — change here to update all API calls.
// claude-sonnet-4-5 is the current production-stable Sonnet (Apr 2026).
// Bumping requires verifying compatibility with prompt-caching system blocks.
// Override per-environment via ANTHROPIC_MODEL.
export const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

// One-line audit hook: log token usage + cache effectiveness from any non-stream
// `messages.create` response. Stream APIs need to read `usage` from the final
// message_delta event manually.
export function logUsage(
  label: string,
  usage: { input_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number; output_tokens?: number } | undefined
) {
  if (!usage) return;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const cacheWrite = usage.cache_creation_input_tokens || 0;
  const totalInput = (usage.input_tokens || 0) + cacheRead + cacheWrite;
  const hitRatio = totalInput > 0 ? Math.round((cacheRead / totalInput) * 100) : 0;
  console.log(
    `[usage:${label}] in=${usage.input_tokens} out=${usage.output_tokens} cache_read=${cacheRead} cache_write=${cacheWrite} hit=${hitRatio}%`
  );
}

// Lazy singleton. SDK default timeout is 10 minutes; our route maxDuration is
// 60s, so we cap below that to surface failures before Vercel kills the function.
// Streaming generators (lib/generator.ts, lib/editor.ts) keep their own clients
// without this timeout to avoid clipping long-form generations.
let _anthropic: Anthropic | null = null;
export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      timeout: 55_000,
      maxRetries: 2,
    });
  }
  return _anthropic;
}
