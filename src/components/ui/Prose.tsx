import { cn } from "./cn";

export function Prose({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("max-w-[65ch] leading-relaxed text-[var(--color-fg)]", className)}
      {...props}
    />
  );
}
