// src/components/ui/motion/Stagger.tsx
"use client";
import { motion } from "framer-motion";

export function Stagger({
  gap = 0.06,
  className,
  children,
  ...props
}: { gap?: number } & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
