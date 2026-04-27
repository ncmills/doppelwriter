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
    return (
      <div
        className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink-mute)] shrink-0"
        style={{ width: size, height: size }}
        aria-label={`No portrait available for ${name}`}
      >
        <FaceQuestionGlyph size={size} />
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
    />
  );
}

function FaceQuestionGlyph({ size }: { size: number }) {
  // Single-stroke, ink-on-paper face with a question mark on the forehead.
  return (
    <svg
      viewBox="0 0 32 32"
      width={size * 0.65}
      height={size * 0.65}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="11" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="20" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <path d="M13 21 Q16 23 19 21" />
      <path d="M14 11 Q14 9 16 9 Q18 9 18 11 Q18 12 16.5 12.5 Q16 13 16 14" />
      <circle cx="16" cy="15.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
