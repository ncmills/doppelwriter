import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  sql: vi.fn(() => {
    throw new Error("db must not be touched on the 401 path");
  }),
}));
vi.mock("@/lib/email-sequences", () => ({
  SEQUENCES: [],
  sendSequenceEmail: vi.fn(async () => {
    throw new Error("sendSequenceEmail must not be touched on the 401 path");
  }),
}));
vi.mock("@/lib/heartbeat", () => ({
  heartbeat: vi.fn(async () => {}),
}));

describe("GET /api/cron/emails — cron auth", () => {
  const ORIGINAL_ENV = process.env.CRON_SECRET;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.CRON_SECRET = "dummy-test-secret";
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_ENV;
    logSpy.mockRestore();
    vi.resetModules();
  });

  it("returns 401 with no authorization header and logs exactly one [cron] line", async () => {
    const { GET } = await import("./route");
    const req = new Request("https://example.com/api/cron/emails", { method: "GET" });

    const res = await GET(req as never);

    expect(res.status).toBe(401);
    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = logSpy.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[cron\] cron\/emails status=401 ms=\d+$/);
  });
});
