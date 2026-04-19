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

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            What do you write every week?
          </h1>
          <p className="text-[var(--color-ink-soft)] text-sm sm:text-base">
            Pick the closest match. We&apos;ll tailor your first draft to it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {TASKS.map((t) => {
            const active = selected === t.key;
            return (
              <button
                key={t.key}
                type="button"
                disabled={saving}
                onClick={() => handleSelect(t.key)}
                className={`text-left px-5 py-4 rounded-[2px] border transition-colors ${
                  active
                    ? "bg-[var(--color-paper-deep)] border-[var(--color-ink)]"
                    : "bg-[var(--color-paper-deep)] border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                } ${saving && !active ? "opacity-50" : ""}`}
              >
                <div className="font-semibold text-[var(--color-ink)]">{t.label}</div>
                <div className="text-xs text-[var(--color-ink-mute)] mt-1" dangerouslySetInnerHTML={{ __html: t.blurb }} />
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-700 text-sm text-center mt-4">{error}</p>}

        <p className="text-center text-xs text-[var(--color-ink-mute)] mt-8">
          You can change this later in Settings.
        </p>
      </div>
    </div>
  );
}
