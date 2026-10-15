import { OBJECT_ICON_PATHS, objectIconFor } from "@/lib/writer-object-icon";

// Ink-on-paper object standing in for a missing portrait; see writer-object-icon.ts.
export default function WriterObjectIcon({
  name,
  size,
}: {
  name: string;
  size: number;
}) {
  const key = objectIconFor(name);
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-object-icon={key}
    >
      {OBJECT_ICON_PATHS[key].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
