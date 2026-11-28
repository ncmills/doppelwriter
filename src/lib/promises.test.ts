// Proofs for the feature promises registered in src/lib/promises.json.
// scripts/guard-promises.ts requires every row's test_name to exist here.
// Rows named "UNPROVEN: ..." are policy statements that code cannot prove;
// they are it.todo on purpose so they show as todo, never as green.
import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const read = (p: string) => fs.readFileSync(p, "utf8");

const state = { session: { user: { id: "u1" } } as { user: { id: string } } | null, calls: [] as { q: string; v: unknown[] }[], rows: [{ id: 5 }] as unknown[] };
vi.mock("@/lib/auth", () => ({ auth: async () => state.session }));
vi.mock("@/lib/db", () => ({
  sql: () => async (s: TemplateStringsArray, ...v: unknown[]) => {
    state.calls.push({ q: s.join("?").replace(/\s+/g, " ").trim(), v });
    return state.rows;
  },
}));

describe("promises", () => {
  beforeEach(() => {
    state.session = { user: { id: "u1" } };
    state.calls = [];
    state.rows = [{ id: 5 }];
  });

  it("draft DELETE handler deletes only the caller's row", async () => {
    const { DELETE } = await import("@/app/api/drafts/[id]/route");
    const res = await DELETE({} as never, { params: Promise.resolve({ id: "5" }) });
    expect(res.status).toBe(200);
    expect(state.calls[0].q).toMatch(/^DELETE FROM drafts WHERE id = \? AND user_id = \?/);
    expect(state.calls[0].v).toEqual([5, "u1"]);
    state.session = null;
    expect((await DELETE({} as never, { params: Promise.resolve({ id: "5" }) })).status).toBe(401);
  });

  it("drafts are scoped to the signed-in user", () => {
    expect(read("src/app/api/drafts/route.ts")).toMatch(/WHERE d\.user_id = \$\{session\.user\.id\}/);
    expect(read("src/app/api/drafts/[id]/route.ts")).toMatch(/user_id = \$\{session\.user\.id\}/);
  });

  it("signup route takes no payment details", () => {
    const src = read("src/app/api/auth/signup/route.ts");
    expect(src).not.toMatch(/stripe|card|payment/i);
  });

  it("analyze route does not require a session", () => {
    const src = read("src/app/api/analyze/route.ts");
    expect(src).not.toMatch(/\bauth\(\)/);
    expect(src).toMatch(/allowAnon/);
  });

  it("writer builder falls back to model knowledge and the copy says so", () => {
    expect(read("src/lib/writer-builder.ts")).toMatch(/synthesizeFromKnowledge\(writerName\)/);
    const home = read("src/app/page.tsx");
    expect(home).toContain("from what is publicly known of their writing");
    expect(home).not.toMatch(/from their published work/);
  });

  it("profile build purges raw writing samples", () => {
    expect(read("src/lib/style-analyzer.ts")).toMatch(/DELETE FROM writing_samples WHERE user_id = \$\{userId\}/);
  });

  it("cancel goes through the Stripe billing portal", () => {
    expect(read("src/app/settings/page.tsx")).toContain("/api/stripe/portal");
    expect(fs.existsSync("src/app/api/stripe/portal/route.ts")).toBe(true);
  });

  it("account deletion contact address is the same everywhere", () => {
    const addr = "enterprise@doppelwriter.com";
    for (const f of ["src/app/privacy/page.tsx", "src/app/terms/page.tsx", "src/app/page.tsx"]) expect(read(f)).toContain(addr);
    // there is no in-app account delete; the copy must not claim one
    expect(read("src/app/page.tsx")).not.toMatch(/from your settings/);
  });

  it.todo("UNPROVEN: we don't use your content to train models");
  it.todo("UNPROVEN: we don't sell or share data");
  it.todo("UNPROVEN: we don't claim IP over input or output");
  it.todo("UNPROVEN: we don't lock you into annual contracts");
  it.todo("UNPROVEN: marketing email is opt-in with unsubscribe");
  it.todo("UNPROVEN: Gmail email content is never stored");
});
