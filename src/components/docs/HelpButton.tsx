import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className="fixed bottom-[80px] right-6 z-[80] grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--em-text-2)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] ring-1 ring-[var(--em-border)] transition-colors hover:bg-[var(--em-accent-soft)] hover:text-[var(--em-accent)] hover:ring-[var(--em-accent)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]"
      aria-label="Ouvrir la documentation"
    >
      <HelpCircle className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--em-accent)] opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--em-accent)]" />
      </span>
    </motion.button>
  );
}