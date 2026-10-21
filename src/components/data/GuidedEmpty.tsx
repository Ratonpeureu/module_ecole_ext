import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  label: string;
  done: boolean;
}

interface GuidedEmptyProps {
  icon: LucideIcon;
  title: string;
  text?: string;
  steps?: Step[];
  color?: string;
  card?: boolean;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function GuidedEmpty({ icon: Icon, title, text, steps = [], color = "var(--em-accent)", card = false }: GuidedEmptyProps) {
  const reduce = useReducedMotion();
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE }}
      className={`flex flex-col items-center px-6 py-14 text-center ${card ? "ecole_m-card" : ""}`}>
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-[16px] font-semibold">{title}</h3>
      {text ? <p className="ecole_m-muted mt-1 max-w-md text-[13px] leading-relaxed">{text}</p> : null}

      {steps.length > 0 &&
      <ol className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Étapes">
          {steps.map((s, i) => {
          const isNext = i === nextIndex;
          return (
            <li key={s.label} className="flex items-center gap-2">
                <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150 ease-out ${
                s.done ?
                "border-transparent bg-[var(--em-accent-soft)] font-medium text-[var(--em-accent)]" :
                isNext ?
                "border-[var(--em-accent)] font-medium" :
                "ecole_m-muted border-[var(--em-border)]"}`
                }>
                  <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${
                  s.done ? "bg-[var(--em-accent)] text-white" : "border border-current"}`
                  }>
                    {s.done ?
                  <motion.span
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, ease: EASE }}>
                        <CheckIcon className="h-3 w-3" aria-hidden="true" />
                      </motion.span> :
                  i + 1}
                  </span>
                  {s.label}
                  <span className="sr-only">{s.done ? " (fait)" : " (à faire)"}</span>
                </span>
                {i < steps.length - 1 ? <span className="ecole_m-muted text-[12px]" aria-hidden="true">→</span> : null}
              </li>);
        })}
        </ol>
      }
    </motion.div>);
}