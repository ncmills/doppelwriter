// Guard for DOCKET-1017 DW-SCHEMA-DURABLE: prod threw NeonDbError 42703 because
// the primary_task column was added only by a manual POST /api/init. The route
// must add the column itself (idempotent ALTER) before it reads or writes it,
// once per process, and retry if that ALTER failed.
import { describe, expect, it, vi, beforeEach } from "vitest";

process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/dummy";

const calls: string[] = [];
let failAlter = false;

vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.reduce(
      (acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""),
      ""
    );
    calls.push(text);
    if (failAlter && text.startsWith("ALTER")) return Promise.reject(new Error("boom"));
    return Promise.resolve([{ primary_task: "blog" }]);
  }),
}));
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => ({ user: { id: "u1" } })) }));
vi.mock("@/lib/track", () => ({ trackServerEvent: vi.fn() }));

const ALTER = "ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_task TEXT";
const isAlter = (t: string) => t.includes(ALTER);

function post(task: string) {
  return new Request("http://x/api/user/primary-task", {
    method: "POST",
    body: JSON.stringify({ task }),
  }) as never;
}

describe("/api/user/primary-task self-heals the primary_task column", () => {
  beforeEach(() => {
    calls.length = 0;
    failAlter = false;
    vi.resetModules();
  });

  it("GET runs the ALTER before the SELECT", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const a = calls.findIndex(isAlter);
    const q = calls.findIndex((t) => t.startsWith("SELECT primary_task"));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(q);
  });

  it("POST runs the ALTER before the UPDATE", async () => {
    const { POST } = await import("./route");
    const res = await POST(post("blog"));
    expect(res.status).toBe(200);
    const a = calls.findIndex(isAlter);
    const u = calls.findIndex((t) => t.startsWith("UPDATE users SET primary_task"));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(u);
  });

  it("runs the ALTER once per process", async () => {
    const { GET, POST } = await import("./route");
    await GET();
    await GET();
    await POST(post("blog"));
    expect(calls.filter(isAlter)).toHaveLength(1);
  });

  it("retries the ALTER on the next call after a failure", async () => {
    const { GET } = await import("./route");
    failAlter = true;
    await expect(GET()).rejects.toThrow("boom");
    failAlter = false;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(calls.filter(isAlter)).toHaveLength(2);
  });
});
