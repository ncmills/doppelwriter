// src/components/ui/motion/Stagger.tsx
"use client";
import { createContext } from "react";
import { motion } from "framer-motion";

/** True when rendered inside a <Stagger> — lets <Reveal> inherit the parent's
 *  staggerChildren orchestration instead of self-triggering on its own viewport. */
export const InStaggerContext = createContext(false);

export function Stagger({
  gap = 0.06,
  className,
  children,
  ...props
}: { gap?: number } & React.ComponentProps<typeof motion.div>) {
  return (
    <InStaggerContext.Provider value={true}>
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
    </InStaggerContext.Provider>
  );
}
