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
        className="rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-medium shrink-0"
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
      className="rounded-full object-cover shrink-0 bg-stone-800"
      loading="lazy"
    />
  );
}
