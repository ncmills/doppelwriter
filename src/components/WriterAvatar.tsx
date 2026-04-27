"use client";

import Image from "next/image";
import { WRITER_PHOTOS } from "@/lib/writer-photos";

export default function WriterAvatar({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  const url = WRITER_PHOTOS[name];

  if (!url) {
    // Fallback: initials
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink-soft)] font-[family-name:var(--font-display)] font-medium shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={`Portrait of ${name}`}
      width={size}
      height={size}
      className="object-cover shrink-0 bg-[var(--color-paper-deep)] duotone"
      loading="lazy"
      unoptimized
    />
  );
}
