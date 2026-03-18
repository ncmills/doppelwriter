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
      <p className="text-gray-500 text-sm">
        No profiles yet. Go to Admin to analyze your writing samples.
      </p>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
