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

import { redactPath, redactUrlPath, sanitizeEventProps } from "./pageview-url";

describe("share id masking (SWEEP-1121-1725)", () => {
  it("masks profile and share ids, keeps the rest", () => {
    expect(redactPath("/profile/abc123")).toBe("/profile/:id");
    expect(redactPath("/s/xyz")).toBe("/s/:id");
    expect(redactPath("/s/xyz/print")).toBe("/s/:id/print");
  });
  it("leaves lookalikes alone", () => {
    expect(redactPath("/profile")).toBe("/profile");
    expect(redactPath("/profiles/abc")).toBe("/profiles/abc");
    expect(redactPath("/pricing/s/abc")).toBe("/pricing/s/abc");
    expect(redactPath("/start")).toBe("/start");
  });
  it("keeps origin, allowlisted query and hash", () => {
    expect(redactUrlPath("https://doppelwriter.com/s/abc?utm_source=g#a")).toBe("https://doppelwriter.com/s/:id?utm_source=g#a");
    expect(redactUrlPath("$direct")).toBe("$direct");
  });
  it("sanitizes every url and path prop", () => {
    const p: Record<string, unknown> = {
      $current_url: "https://doppelwriter.com/profile/abc?token=s&utm_source=a",
      $pathname: "/profile/abc",
      $referrer: "https://doppelwriter.com/s/q1",
      $initial_referrer: "https://www.google.com/",
      $prev_pageview_pathname: "/s/q1",
      $prev_pageview_url: "https://doppelwriter.com/s/q1",
      $session_entry_url: "https://doppelwriter.com/profile/z",
      $session_entry_pathname: "/profile/z",
      $initial_pathname: "/s/q1/print",
      step_index: 2,
    };
    sanitizeEventProps(p);
    expect(p).toEqual({
      $current_url: "https://doppelwriter.com/profile/:id?utm_source=a",
      $pathname: "/profile/:id",
      $referrer: "https://doppelwriter.com/s/:id",
      $initial_referrer: "https://www.google.com/",
      $prev_pageview_pathname: "/s/:id",
      $prev_pageview_url: "https://doppelwriter.com/s/:id",
      $session_entry_url: "https://doppelwriter.com/profile/:id",
      $session_entry_pathname: "/profile/:id",
      $initial_pathname: "/s/:id/print",
      step_index: 2,
    });
  });
});
