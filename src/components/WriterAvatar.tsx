"use client";

import Image from "next/image";
import { WRITER_PHOTOS } from "@/lib/writer-photos";
import WriterObjectIcon from "./WriterObjectIcon";

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
        className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-fg-muted)] shrink-0"
        style={{ width: size, height: size }}
        aria-label={`No portrait available for ${name}`}
      >
        <WriterObjectIcon name={name} size={size * 0.65} />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={`Portrait of ${name}`}
      width={size}
      height={size}
      className="object-cover shrink-0 bg-[var(--color-surface-raised)] duotone"
      loading="lazy"
    />
  );
}
