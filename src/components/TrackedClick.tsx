"use client";

import { trackCtaTarget } from "@/lib/analytics";

/** Wraps a CTA to record a click with a fixed target id. display:contents keeps layout identical. */
export default function TrackedClick({ target, children }: { target: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "contents" }} onClickCapture={() => trackCtaTarget(target)}>
      {children}
    </span>
  );
}
