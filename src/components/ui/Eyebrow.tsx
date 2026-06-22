import { cn } from "./cn";

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[length:var(--fs-micro)] uppercase tracking-[0.12em] text-[var(--color-fg-muted)]",
        className,
      )}
      {...props}
    />
  );
}
