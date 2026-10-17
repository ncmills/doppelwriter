import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withCronLog } from "./cron-log";

describe("withCronLog", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("logs exactly one [cron] line with status=200 on success and returns the response unchanged", async () => {
    const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const handler = vi.fn(async () => res);
    const wrapped = withCronLog("test/route", handler);

    const result = await wrapped();

    expect(result).toBe(res);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    const line = logSpy.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[cron\] test\/route status=200 ms=\d+$/);
  });

  it("logs exactly one [cron] line with status=401 on a 401 response", async () => {
    const res = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const handler = vi.fn(async () => res);
    const wrapped = withCronLog("test/route", handler);

    const result = await wrapped();

    expect(result).toBe(res);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    const line = logSpy.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[cron\] test\/route status=401 ms=\d+$/);
  });

  it("logs exactly one [cron] line with status=throw via console.error and rethrows", async () => {
    const boom = new Error("boom");
    const handler = vi.fn(async () => {
      throw boom;
    });
    const wrapped = withCronLog("test/route", handler);

    await expect(wrapped()).rejects.toBe(boom);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const line = errorSpy.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[cron\] test\/route status=throw ms=\d+$/);
  });

  it("never logs headers, auth values, request body or env values", async () => {
    const res = new Response(null, { status: 200 });
    const handler = vi.fn(async (req: { headers: { authorization: string } }) => {
      expect(req.headers.authorization).toBe("Bearer super-secret");
      return res;
    });
    const wrapped = withCronLog("test/route", handler);

    await wrapped({ headers: { authorization: "Bearer super-secret" } });

    const allLoggedText = [...logSpy.mock.calls, ...errorSpy.mock.calls].flat().join(" ");
    expect(allLoggedText).not.toContain("super-secret");
    expect(allLoggedText).not.toContain("authorization");
  });
});
