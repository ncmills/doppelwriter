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

import { redactPath, redactUrlPath, sanitizeEventProps, sanitizeEvent } from "./pageview-url";

describe("share id masking (SWEEP-1121-1725, IMF-PATH-REDACT-2)", () => {
  it("masks ids, keeps what follows the id", () => {
    expect(redactPath("/profile/abc123")).toBe("/profile/:id");
    expect(redactPath("/s/abc123")).toBe("/s/:id");
    expect(redactPath("/profile/abc123/print")).toBe("/other"); // superseded: not a known route
  });
  it("leaves lookalikes alone", () => {
    expect(redactPath("/profile")).toBe("/other"); // superseded: only /profile/:id is a route
    expect(redactPath("/profiles/abc")).toBe("/other"); // superseded: unknown -> /other
    expect(redactPath("/x/profile/abc")).toBe("/other"); // superseded: unknown -> /other
  });
  it("normalises odd forms before masking", () => {
    expect(redactPath("/PROFILE/Abc")).toBe("/profile/:id");
    expect(redactPath("%2Fprofile%2Fabc")).toBe("/profile/:id");
    expect(redactPath("//profile/abc")).toBe("/profile/:id");
    expect(redactPath("/x/../profile/abc")).toBe("/profile/:id");
    expect(redactPath("/profile/./abc")).toBe("/profile/:id");
  });
  it("keeps origin and query, drops hash on every url/path prop", () => {
    expect(redactUrlPath("https://doppelwriter.com/profile/abc?utm_source=g#a")).toBe("https://doppelwriter.com/profile/:id?utm_source=g");
    expect(redactPath("/pricing#x")).toBe("/pricing");
    expect(redactUrlPath("$direct")).toBe("$direct");
  });
  it("title on a masked page becomes the masked path; other titles kept", () => {
    const p: Record<string, unknown> = { $current_url: "https://doppelwriter.com/profile/abc", title: "Alex and Sam, shared plan" };
    sanitizeEventProps(p);
    expect(p.title).toBe("/profile/:id");
    const q: Record<string, unknown> = { $current_url: "https://doppelwriter.com/pricing", title: "Pricing" };
    sanitizeEventProps(q);
    expect(q.title).toBe("/pricing"); // superseded: title is always the template
  });
  it("sanitises $set and $set_once and $initial_current_url", () => {
    const e = {
      properties: { $current_url: "https://doppelwriter.com/profile/abc" },
      $set: { $current_url: "https://doppelwriter.com/profile/abc", $pathname: "/profile/abc" },
      $set_once: { $initial_current_url: "https://doppelwriter.com/profile/abc#h", $initial_pathname: "/profile/abc" },
    };
    sanitizeEvent(e);
    expect(e.properties.$current_url).toBe("https://doppelwriter.com/profile/:id");
    expect(e.$set).toEqual({ $current_url: "https://doppelwriter.com/profile/:id", $pathname: "/profile/:id" });
    expect(e.$set_once).toEqual({ $initial_current_url: "https://doppelwriter.com/profile/:id", $initial_pathname: "/profile/:id" });
    sanitizeEvent(null);
  });
  it("sanitizes a full props object", () => {
    const p: Record<string, unknown> = {
      $current_url: "https://doppelwriter.com/profile/abc?token=s&utm_source=a",
      $pathname: "/profile/abc",
      $referrer: "https://doppelwriter.com/profile/q1",
      $initial_referrer: "https://www.google.com/",
      $prev_pageview_pathname: "/profile/q1",
      $prev_pageview_url: "https://doppelwriter.com/profile/q1",
      $session_entry_url: "https://doppelwriter.com/profile/z",
      $session_entry_pathname: "/profile/z",
      $initial_pathname: "/profile/q1/print",
      step_index: 2,
    };
    sanitizeEventProps(p);
    expect(p).toEqual({
      $current_url: "https://doppelwriter.com/profile/:id?utm_source=a",
      $pathname: "/profile/:id",
      $referrer: "https://doppelwriter.com/profile/:id",
      $initial_referrer: "https://www.google.com", // superseded: cross-site referrer keeps origin only
      $prev_pageview_pathname: "/profile/:id",
      $prev_pageview_url: "https://doppelwriter.com/profile/:id",
      $session_entry_url: "https://doppelwriter.com/profile/:id",
      $session_entry_pathname: "/profile/:id",
      $initial_pathname: "/other", // superseded: /profile/:id/print is not a route
      step_index: 2,
    });
  });
});
