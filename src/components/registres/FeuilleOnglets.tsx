import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "../eleves/EleveMotion";

interface FeuilleOngletsProps {
  feuilles: string[];
  valeur: string;
  onChange: (feuille: string) => void;
}

export function FeuilleOnglets({ feuilles, valeur, onChange }: FeuilleOngletsProps) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + feuilles.length) % feuilles.length;
    onChange(feuilles[n]);
    refs.current[n]?.focus();
  };

  return (
    <div role="tablist" aria-label="Feuilles du classeur" className="ecole_m-scroll flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto px-2 [scrollbar-width:none]">
      {feuilles.map((f, i) => {
        const actif = f === valeur;
        return (
          <button
            key={f}
            ref={(el) => refs.current[i] = el}
            type="button"
            role="tab"
            aria-selected={actif}
            tabIndex={actif ? 0 : -1}
            onClick={() => onChange(f)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative shrink-0 whitespace-nowrap rounded-b-md px-3.5 pb-2 pt-1.5 text-[12.5px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
            actif ? "text-[var(--em-accent)]" : "ecole_m-muted hover:bg-black/[0.04] hover:text-inherit"}`
            }>
            
            {actif &&
            <motion.span
              layoutId="registre-feuille-pill"
              className="absolute inset-0 rounded-b-md border border-t-0 border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }} />

            }
            <span className="relative">{f}</span>
            {actif &&
            <motion.span
              layoutId="registre-feuille-bar"
              className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-[var(--em-accent)]"
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }} />

            }
          </button>);

      })}
    </div>);

}