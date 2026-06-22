// src/components/ui/motion/Reveal.tsx
"use client";
import { useContext } from "react";
import { motion } from "framer-motion";
import { InStaggerContext } from "./Stagger";

export function Reveal({
  delay = 0,
  y = 12,
  className,
  children,
  ...props
}: { delay?: number; y?: number } & React.ComponentProps<typeof motion.div>) {
  const inStagger = useContext(InStaggerContext);
  const variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0 },
  };

  // Inside a <Stagger>, inherit the parent's staggerChildren orchestration —
  // define the variants but let the parent drive initial/animate so the
  // children cascade in sequence rather than each firing on its own viewport.
  if (inStagger) {
    return (
      <motion.div
        className={className}
        variants={variants}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  // Standalone: self-trigger when scrolled into view.
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
