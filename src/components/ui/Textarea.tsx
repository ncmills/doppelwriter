// src/components/ui/Textarea.tsx
import { cn } from "./cn";

const field =
  "w-full bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-[var(--radius)] px-3 py-2 " +
  "placeholder:text-[var(--color-fg-muted)] focus:outline focus:outline-1 focus:outline-[var(--color-fg)] focus:[outline-offset:2px]";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, className)} {...props} />;
}
