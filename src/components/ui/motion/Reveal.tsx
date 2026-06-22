// src/components/ui/motion/Reveal.tsx
"use client";
import { motion } from "framer-motion";

export function Reveal({
  delay = 0,
  y = 12,
  className,
  children,
  ...props
}: { delay?: number; y?: number } & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
