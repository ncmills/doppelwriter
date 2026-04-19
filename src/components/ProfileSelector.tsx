"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: number;
  name: string;
  sample_count: number;
}

export default function ProfileSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then(setProfiles);
  }, []);

  if (profiles.length === 0) {
    return (
      <p className="text-[var(--color-ink-mute)] text-sm">
        No profiles yet. Go to Admin to analyze your writing samples.
      </p>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-[var(--color-paper)] border border-[var(--color-rule)] px-4 py-2 text-[var(--color-ink)] focus:outline-none"
    >
      <option value="" disabled>
        Select a style profile...
      </option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.sample_count} samples)
        </option>
      ))}
    </select>
  );
}
