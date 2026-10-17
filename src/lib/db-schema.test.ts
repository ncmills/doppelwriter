// Guard for DOCKET-1017 DW-PRIMARY-TASK: prod /api/user/primary-task threw
// NeonDbError 42703 "column primary_task does not exist". The ALTER that adds
// it lived inside one multi-statement call in initSchema(), which runs only on
// a manual POST /api/init. Splitting to one statement per call rules out the
// suspected (unproven) cause that the Neon HTTP driver rejects multi-statement
// queries. This test pins two invariants: the primary_task migration exists,
// and every call to the mocked `db` tag holds exactly one SQL statement.
import { describe, expect, it, vi, beforeEach } from "vitest";

process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/dummy";

const calls: string[] = [];

vi.mock("@neondatabase/serverless", () => {
  function makeTag() {
    return (strings: TemplateStringsArray, ...values: unknown[]) => {
      const text = strings.reduce(
        (acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""),
        ""
      );
      calls.push(text);
      return Promise.resolve([]);
    };
  }
  return {
    neon: vi.fn(() => makeTag()),
  };
});

describe("initSchema DDL statements", () => {
  beforeEach(() => {
    calls.length = 0;
    vi.resetModules();
  });

  it("includes the primary_task column migration", async () => {
    const { initSchema } = await import("./db");
    await initSchema();

    const hasPrimaryTaskAlter = calls.some((sql) =>
      /ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_task TEXT/.test(sql)
    );
    expect(hasPrimaryTaskAlter).toBe(true);
  });

  it("issues exactly one SQL statement per call (no multi-statement calls)", async () => {
    const { initSchema } = await import("./db");
    await initSchema();

    expect(calls.length).toBeGreaterThan(0);

    for (const sql of calls) {
      const stripped = sql.trim().replace(/;\s*$/, "");
      expect(stripped.includes(";"), `multi-statement call found:\n${sql}`).toBe(false);
    }
  });
});
