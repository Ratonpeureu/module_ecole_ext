import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface PivotTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface PivotTabsProps {
  tabs: PivotTab[];
  value: string;
  onChange: (id: string) => void;
  layoutKey?: string;
  label?: string;
}

export function PivotTabs({ tabs, value, onChange, layoutKey = "pivot", label = "Rubriques" }: PivotTabsProps) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === value));

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 500, damping: 40 };

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex min-w-max items-center gap-1 rounded-xl border border-[var(--em-border)] p-1">
        {tabs.map((t, i) => {
          const Icon = t.icon;
          const active = i === activeIndex;
          return (
            <button
              key={t.id}
              ref={(el) => {refs.current[i] = el;}}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
              active ? "font-semibold" : "ecole_m-muted hover:bg-[color-mix(in_srgb,var(--em-accent)_6%,transparent)]"}`
              }>
              {active &&
              <motion.span
                layoutId={`${layoutKey}-bg`}
                className="absolute inset-0 rounded-lg bg-[var(--em-accent-soft)]"
                transition={spring} />
              }
              {active &&
              <motion.span
                layoutId={`${layoutKey}-bar`}
                className="absolute bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-[var(--em-accent)]"
                transition={spring} />
              }
              {Icon ? <Icon className={`relative h-4 w-4 shrink-0 ${active ? "text-[var(--em-accent)]" : ""}`} aria-hidden="true" /> : null}
              <span className="relative">{t.label}</span>
            </button>);
        })}
      </div>
    </div>);
}