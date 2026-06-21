// src/components/ui/Button.tsx
import { cn } from "./cn";

type Variant = "primary" | "ghost" | "accent";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] " +
  "transition-colors duration-[var(--motion-fast)] focus-visible:outline focus-visible:outline-1 " +
  "focus-visible:outline-[var(--color-fg)] focus-visible:[outline-offset:2px] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-fg-muted)]",
  ghost:
    "bg-transparent text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)]",
  accent: "bg-[var(--color-brand)] text-[var(--color-surface)] hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "text-[var(--fs-caption)] px-3 py-1.5",
  md: "text-[var(--fs-body)] px-5 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
