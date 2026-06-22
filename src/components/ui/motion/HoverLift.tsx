// src/components/ui/motion/HoverLift.tsx
"use client";
import { motion } from "framer-motion";

export function HoverLift({
  lift = -3,
  className,
  children,
  ...props
}: { lift?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
