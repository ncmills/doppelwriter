// src/components/ui/Input.tsx
import { cn } from "./cn";

const field =
  "w-full bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-[var(--radius)] px-3 py-2 " +
  "placeholder:text-[var(--color-fg-muted)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-fg)] focus-visible:[outline-offset:2px]";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...props} />;
}
