import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type WithChildren = { children: React.ReactNode; className?: string };

/** Apparition douce (opacité + léger glissement). */
export function Reveal({ children, className, delay = 0 }: WithChildren & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Conteneur qui fait apparaître ses enfants en cascade. */
export function Stagger({ children, className }: WithChildren) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: WithChildren) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Barre de commandes façon Windows 11 (Fluent). */
export function CommandBar({ children, className = "", hint }: WithChildren & { hint?: React.ReactNode }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)]/80 px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {hint && <p className="ecole_m-muted ml-auto hidden text-[12px] md:block">{hint}</p>}
    </div>
  );
}