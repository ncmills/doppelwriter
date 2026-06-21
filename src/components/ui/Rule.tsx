import { cn } from "./cn";

export function Rule({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("border-0 h-px bg-[var(--color-border)]", className)}
      {...props}
    />
  );
}
