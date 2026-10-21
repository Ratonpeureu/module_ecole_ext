import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EASE_OUT } from "../ui/Motion";

interface Step {
  label: string;
  done: boolean;
}

interface ContextBarProps {
  icon: LucideIcon;
  color: string;
  title: string;
  text?: string;
  steps?: Step[];
  aside?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/** Bandeau de contexte : titre, progression de la sélection, filtres et actions. */
export function ContextBar({ icon: Icon, color, title, text, steps, aside, actions, children }: ContextBarProps) {
  const hasBody = !!children || !!actions;
  return (
    <section className="ecole_m-card overflow-hidden">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${hasBody ? "border-b border-[var(--em-border)]" : ""}`}
        style={{ background: `color-mix(in srgb, ${color} 5%, transparent)` }}>
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold leading-tight">{title}</h2>
            {text ? <p className="ecole_m-muted mt-0.5 text-[12.5px] leading-snug">{text}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {steps && steps.length > 0 ?
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="Sélection">
              {steps.map((s) => <StepChip key={s.label} {...s} color={color} />)}
            </ol> :
          null}
          {aside}
        </div>
      </div>
      {hasBody ?
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{children}</div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div> :
      null}
    </section>
  );
}

function StepChip({ label, done, color }: Step & { color: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium transition-[background-color,border-color,color] duration-200 ${done ? "" : "ecole_m-muted border-[var(--em-border)]"}`}
      style={done ? { borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
      aria-label={`${label} : ${done ? "choisi" : "à choisir"}`}>
      <span
        className="grid h-4 w-4 place-items-center rounded-full transition-[background-color] duration-200"
        style={done ? { background: color, color: "#fff" } : { border: "1px solid var(--em-border)" }}>
        <AnimatePresence initial={false}>
          {done ?
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}>
              <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </motion.span> :
          null}
        </AnimatePresence>
      </span>
      {label}
    </li>
  );
}