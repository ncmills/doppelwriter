import { describe, expect, it } from "vitest";
import { navHomeHref } from "./nav-home";
import { isPublicPath } from "./public-paths";

describe("app nav home link", () => {
  it("sends signed-in users to their dashboard", () => {
    expect(navHomeHref("authenticated")).toBe("/home");
  });

  it("sends signed-out and loading visitors to a page they can open", () => {
    for (const s of ["unauthenticated", "loading"] as const) {
      const href = navHomeHref(s);
      expect(href).toBe("/");
      expect(isPublicPath(href)).toBe(true);
    }
  });

  it("keeps /write and /how-it-works public so the back links work signed out", () => {
    expect(isPublicPath("/write")).toBe(true);
    expect(isPublicPath("/how-it-works")).toBe(true);
    expect(isPublicPath("/home")).toBe(false);
  });
});
