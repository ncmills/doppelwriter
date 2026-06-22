"use client";

import { useEffect, useRef, useState } from "react";

const CROSS_SITES: { label: string; href: string; note: string }[] = [
  { label: "Tour de Fore", href: "https://tourdefore.com", note: "Golf trip planner" },
  { label: "Peptide Stack", href: "https://whatpeptidesdo.com", note: "Research journal" },
  { label: "I Don't Have a Will", href: "https://idonthaveawill.com", note: "Estate tool" },
  { label: "Imfrustrated", href: "https://imfrustrated.org", note: "Venting, done well" },
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
            rel="nofollow"
            className="cross-site-link text-[13px] text-[var(--color-fg)]"
          >
            {s.label}
          </a>
          <span className="cross-site-note text-[11px] text-[var(--color-fg-muted)] italic font-[family-name:var(--font-display)]">
            {s.note}
          </span>
        </li>
      ))}
    </ul>
  );
}
