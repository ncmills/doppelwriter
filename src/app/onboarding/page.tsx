"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Task = {
  key: string;
  label: string;
  blurb: string;
};

const TASKS: Task[] = [
  { key: "newsletter", label: "Newsletters", blurb: "Weekly or monthly" },
  { key: "linkedin", label: "LinkedIn posts", blurb: "Personal brand" },
  { key: "client-emails", label: "Client emails", blurb: "Polished, on-tone" },
  { key: "proposals", label: "Proposals & pitches", blurb: "Longer form" },
  { key: "speeches-letters", label: "Speeches & letters", blurb: "One-off, important" },
  { key: "blog", label: "Blog posts", blurb: "Long articles" },
  { key: "other", label: "Something else", blurb: "I&apos;ll show you around" },
];

// Deterministic resting offsets for the swim-into-place animation.
// Index-keyed so SSR matches client and the layout feels organic, not symmetric.
const SWIM_OFFSETS: { x: number; y: number; r: number }[] = [
  { x: -32, y: 18, r: -2 },
  { x: 28, y: -16, r: 1.5 },
  { x: -18, y: -28, r: 2.5 },
  { x: 22, y: 26, r: -2 },
  { x: -28, y: -14, r: 1 },
  { x: 30, y: 14, r: -1.5 },
  { x: -20, y: 22, r: 2 },
];

const HEADLINE = "What do you write every week?";

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState("");

  // Defer the "settled" mount state by one frame so chips paint at their
  // scattered start positions before transitioning to rest.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMounted(true);
      setTyped(HEADLINE);
      return;
    }
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) clearInterval(id);
    }, 25);
    return () => {
      cancelAnimationFrame(r1);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // If user already answered this, bypass to /write (or pending-sample flow)
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/primary-task")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.primaryTask) {
          try {
            if (sessionStorage.getItem("dw_pending_sample")) {
              router.replace("/create/personal?fromAnalyzer=1");
              return;
            }
          } catch {
            // ignore
          }
          router.replace("/write");
        }
      })
      .catch(() => {});
  }, [status, router]);

  async function handleSelect(task: string) {
    setSelected(task);
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/primary-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      if (!res.ok) {
        setError("Couldn't save — please try again.");
        setSaving(false);
        return;
      }
      try {
        const pending = sessionStorage.getItem("dw_pending_sample");
        if (pending) {
          router.push("/create/personal?fromAnalyzer=1");
          return;
        }
      } catch {
        // ignore
      }
      router.push("/write");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight mb-3 min-h-[1.2em]">
            {typed}
            {typed.length < HEADLINE.length && <span className="type-cursor" />}
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm sm:text-base">
            Pick the closest match. We&apos;ll tailor your first draft to it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {TASKS.map((t, i) => {
            const active = selected === t.key;
            const off = SWIM_OFFSETS[i] ?? { x: 0, y: 0, r: 0 };
            return (
              <button
                key={t.key}
                type="button"
                disabled={saving}
                onClick={() => handleSelect(t.key)}
                className={`onb-chip text-left px-5 py-4 rounded-[2px] border ${
                  active
                    ? "bg-[var(--color-surface-raised)] border-[var(--color-fg)] onb-chip-active"
                    : "bg-[var(--color-surface-raised)] border-[var(--color-border)] hover:border-[var(--color-fg)]"
                } ${saving && !active ? "opacity-50" : ""} ${mounted ? "is-settled" : ""}`}
                style={
                  {
                    "--swim-x": `${off.x}px`,
                    "--swim-y": `${off.y}px`,
                    "--swim-r": `${off.r}deg`,
                    "--swim-delay": `${i * 80}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="font-semibold text-[var(--color-fg)]">{t.label}</div>
                <div className="text-xs text-[var(--color-fg-muted)] mt-1" dangerouslySetInnerHTML={{ __html: t.blurb }} />
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-700 text-sm text-center mt-4">{error}</p>}

        <p className="text-center text-xs text-[var(--color-fg-muted)] mt-8">
          You can change this later in Settings.
        </p>
      </div>
    </div>
  );
}
