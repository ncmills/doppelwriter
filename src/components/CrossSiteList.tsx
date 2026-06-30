"use client";

import { useEffect, useRef, useState } from "react";

// Legal/self-help cluster, upstream only (funnel toward aissdi). dofollow —
// these pass link equity to higher-priority cluster sites. See src/lib/network-sites.ts.
const CROSS_SITES: { label: string; href: string; note: string }[] = [
  { label: "AISSDI", href: "https://aissdi.com", note: "Free SSDI tools" },
  { label: "I Don't Have a Will", href: "https://idonthaveawill.com", note: "Free will tool" },
];

export default function CrossSiteList() {
  const ref = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ul
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3"
    >
      {CROSS_SITES.map((s, i) => (
        <li
          key={s.href}
          className={`cross-site-li flex items-baseline gap-2 ${visible ? "is-visible" : ""}`}
          style={{ ["--reveal-delay" as string]: `${i * 180}ms` } as React.CSSProperties}
        >
          <a
            href={s.href}
            rel="noopener"
            className="cross-site-link text-[13px] text-[var(--color-fg)]"
          >
            {s.label}
          </a>
          <span className="cross-site-note text-[11px] text-[var(--color-fg-muted)]">
            {s.note}
          </span>
        </li>
      ))}
    </ul>
  );
}
