"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sanitizePageviewUrl, sanitizeEvent } from "@/lib/pageview-url";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      // Query allowlist: utm_* / gclid / fbclid only (MAX-DATA-NO-COOKIES).
      ph.capture("$pageview", { $current_url: sanitizePageviewUrl(url) });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

  useEffect(() => {
    if (key && typeof window !== "undefined") {
      posthog.init(key, {
        api_host: (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").trim(),
        capture_pageview: false, // We capture manually via PostHogPageView
        capture_pageleave: true,
        // First-party persistence (COOKIES-OPTION-2, Nick 2026-11-21): a PostHog cookie plus
        // localStorage keep one anonymous id, so returning visitors and multi-visit journeys
        // are measured. Still no autocapture, no session recording, no person profile unless
        // identified, and every URL/property redaction in before_send still applies.
        persistence: "localStorage+cookie",
        secure_cookie: true,
        autocapture: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
        before_send: (event) => {
          sanitizeEvent(event as Parameters<typeof sanitizeEvent>[0]);
          return event;
        },
      });
    }
  }, [key]);

  if (!key) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
