import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface StageProps {
  children: React.ReactNode;
  className?: string;
}

/** Conteneur de page : révèle ses enfants <Reveal> en cascade courte. */
export function PageStage({ children, className = "space-y-6" }: StageProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}>
      {children}
    </motion.div>
  );
}

/** Élément révélé par un <PageStage> parent. */
export function Reveal({ children, className }: StageProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE_OUT } }
      }}>
      {children}
    </motion.div>
  );
}

/** Transition entre onglets / contenus identifiés par `id`. */
export function TabStage({ id, children, className = "space-y-4" }: StageProps & { id: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className={className}
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } }}
        exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: 0.14, ease: EASE_OUT } }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}