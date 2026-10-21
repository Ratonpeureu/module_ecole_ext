import React from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function DetailPanel({ title, subtitle, onClose, children, wide }: DetailPanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
      aria-label={title}
      className={`fixed bottom-[68px] right-2 top-2 z-50 flex w-[calc(100vw-1rem)] min-w-0 flex-col overflow-hidden rounded-[12px] border border-black/[0.08] bg-[#FBFBFB]/95 shadow-[0_32px_64px_rgba(0,0,0,0.18),0_2px_21px_rgba(0,0,0,0.1)] backdrop-blur-2xl backdrop-saturate-150 sm:right-3 sm:top-3 
      ${wide ? "md:w-[80vw] md:max-w-[1200px]" : "md:w-[60vw] md:max-w-[900px]"} `}
    >
      <header className="flex items-start gap-3 border-b border-black/[0.06] bg-white/70 px-5 py-4">
        <span className="mt-1.5 h-5 w-[3px] shrink-0 rounded-full bg-[var(--em-accent,#0067C0)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="ecole_m-display truncate text-[17px] font-semibold tracking-[-0.01em] text-[#1A1A1A]">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-[13px] text-[#5D5D5D]">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le détail"
          className="-mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-[6px] text-[#5D5D5D] outline-none transition-[background-color,color,transform] duration-150 hover:bg-black/[0.06] hover:text-[#1A1A1A] active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-[var(--em-accent,#0067C0)]">
          <XIcon className="h-4 w-4" />
        </button>
      </header>
      <div className="ecole_m-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </motion.aside>
  );
}