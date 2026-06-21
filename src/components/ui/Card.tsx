// src/components/ui/Card.tsx
import { cn } from "./cn";

export function Card({
  raised,
  className,
  ...props
}: { raised?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-[var(--color-border)] p-6",
        raised ? "bg-[var(--color-surface-raised)]" : "bg-[var(--color-surface)]",
        className,
      )}
      {...props}
    />
  );
}
