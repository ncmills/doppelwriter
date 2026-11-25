/**
 * One-line token usage log for every model call. SN pulls `llm_usage ` lines from Vercel runtime logs
 * daily and prices them. ONLY these six fields are ever logged — never prompt text, user input, plan
 * content, email, IP or any person id. Must never throw or alter the response.
 */
export interface LlmUsageLike {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

export function logLlmUsage(route: string, model: string, usage: LlmUsageLike | null | undefined): void {
  try {
    const u = usage ?? {};
    console.log(
      "llm_usage " +
        JSON.stringify({
          route,
          model,
          in: n(u.input_tokens),
          out: n(u.output_tokens),
          cacheR: n(u.cache_read_input_tokens),
          cacheW: n(u.cache_creation_input_tokens),
        }),
    );
  } catch {
    /* logging must never affect the response */
  }
}

/** Stream variant: call AFTER the stream has been fully consumed; reads the final message usage. */
export async function logLlmStreamUsage(
  route: string,
  model: string,
  stream: { finalMessage: () => Promise<{ usage?: LlmUsageLike | null }> },
): Promise<void> {
  try {
    const msg = await stream.finalMessage();
    logLlmUsage(route, model, msg?.usage);
  } catch {
    /* logging must never affect the response */
  }
}
