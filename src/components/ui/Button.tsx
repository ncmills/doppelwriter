// src/components/ui/Button.tsx
import Link from "next/link";
import { cn } from "./cn";

type Variant = "primary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] " +
  "transition-colors duration-[var(--motion-fast)] focus-visible:outline focus-visible:outline-1 " +
  "focus-visible:outline-[var(--color-fg)] focus-visible:[outline-offset:2px] disabled:opacity-50 disabled:pointer-events-none";

// Hover → ember is the site's signature CTA interaction.
const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)]",
  ghost:
    "bg-transparent text-[var(--color-fg)] border border-[var(--color-border)] hover:border-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-surface)]",
  accent: "bg-[var(--color-brand)] text-[var(--color-surface)] hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "text-[length:var(--fs-caption)] px-4 py-1.5",
  md: "text-[length:var(--fs-body)] px-6 py-2.5",
  lg: "text-lg px-8 py-3",
};

type Common = { variant?: Variant; size?: Size; block?: boolean; className?: string };

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  ...props
}: Common &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const cls = cn(base, variants[variant], sizes[size], block && "w-full", className);
  if (typeof props.href === "string") {
    const { href, ...rest } = props as { href: string } & React.ComponentProps<typeof Link>;
    return <Link href={href} className={cls} {...rest} />;
  }
  return <button className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
