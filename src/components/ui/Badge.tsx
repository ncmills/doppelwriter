import { cn } from "./cn";

export function Badge({
  tone = "default",
  className,
  ...props
}: { tone?: "default" | "brand" } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[length:var(--fs-micro)] px-2 py-0.5 rounded-[var(--radius)] border",
        tone === "brand"
          ? "border-[var(--color-brand)] text-[var(--color-brand)]"
          : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
        className,
      )}
      {...props}
    />
  );
}
