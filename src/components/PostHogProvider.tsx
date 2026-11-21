"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sanitizePageviewUrl } from "@/lib/pageview-url";

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
        // Cookieless and anonymous (Nick 2026-11-18): nothing is stored in the browser,
        // no clicks or typed input are auto-captured, no session is recorded.
        persistence: "memory",
        autocapture: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
        before_send: (event) => {
          if (event && event.properties) {
            for (const k of ["$current_url", "$referrer"]) {
              const v = event.properties[k];
              if (typeof v === "string") event.properties[k] = sanitizePageviewUrl(v);
            }
          }
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
