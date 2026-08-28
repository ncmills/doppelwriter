// Guard for D95: every Vercel cron path must pass the auth middleware's
// public-path rule, and must guard itself with CRON_SECRET (that is the
// contract that makes listing it public safe). A cron that is registered in
// vercel.json but not public here never runs -- the middleware 307s it to
// /login before the handler's own secret check executes.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vercelJson from "../../vercel.json";
import { isPublicPath } from "./public-paths";

const ROOT = join(__dirname, "..", "..");
const cronPaths = vercelJson.crons.map((c) => c.path);

describe("vercel.json crons vs middleware public paths", () => {
  it("registers at least one cron (positive control)", () => {
    expect(cronPaths.length).toBeGreaterThan(0);
  });

  it.each(cronPaths)("%s passes the middleware public-path rule", (path) => {
    expect(isPublicPath(path)).toBe(true);
  });

  it.each(cronPaths)("%s has a route handler that self-guards on CRON_SECRET", (path) => {
    const routeFile = join(ROOT, "src", "app", path, "route.ts");
    expect(existsSync(routeFile), `missing ${routeFile}`).toBe(true);
    expect(readFileSync(routeFile, "utf8")).toContain("process.env.CRON_SECRET");
  });

  it("middleware uses this module's predicate rather than its own list", () => {
    const middleware = readFileSync(join(ROOT, "src", "middleware.ts"), "utf8");
    expect(middleware).toMatch(/from ["']@\/lib\/public-paths["']/);
    expect(middleware).not.toMatch(/const publicPaths\s*=/);
  });

  it("does not open non-public paths (negative control)", () => {
    expect(isPublicPath("/home")).toBe(false);
    expect(isPublicPath("/api/profiles")).toBe(false);
    expect(isPublicPath("/api/gmail")).toBe(false);
  });
});
