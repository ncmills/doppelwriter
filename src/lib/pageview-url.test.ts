import { describe, it, expect } from "vitest";
import { sanitizePageviewUrl, filterQuery } from "./pageview-url";
import * as analytics from "./analytics";

describe("pageview url allowlist", () => {
  it("keeps utm and click ids, drops everything else", () => {
    expect(sanitizePageviewUrl("https://x.com/a?utm_source=g&email=a%40b.c&gclid=1&ref=abc#h")).toBe(
      "https://x.com/a?utm_source=g&gclid=1#h",
    );
  });
  it("drops ref and returns bare path when nothing allowed", () => {
    expect(sanitizePageviewUrl("https://x.com/a?ref=abc&token=1")).toBe("https://x.com/a");
    expect(filterQuery("?q=1")).toBe("");
  });
  it("passes through urls without a query", () => {
    expect(sanitizePageviewUrl("https://x.com/a")).toBe("https://x.com/a");
  });
});

describe("new tracking helpers exist", () => {
  it("exports the new events", () => {
    expect(typeof analytics.trackFormError).toBe("function");
    expect(typeof analytics.trackCtaTarget).toBe("function");
    expect(typeof analytics.trackOnboardingStep).toBe("function");
    expect(typeof analytics.trackResultShown).toBe("function");
  });
});
