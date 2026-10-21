import React, { useRef } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface FluentTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Onglets Windows 11 : pastille glissante + barre d'accent, navigation au clavier. */
export function FluentTabs({
  tabs,
  value,
  onChange,
  idPrefix,
  label,
  accent = "var(--em-accent)",
}: {
  tabs: FluentTab[];
  value: string;
  onChange: (id: string) => void;
  idPrefix: string;
  label: string;
  accent?: string;
}) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const transition = { duration: reduce ? 0 : 0.22, ease: EASE_OUT };

  const onKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <LayoutGroup id={idPrefix}>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--em-border)] bg-black/[0.03] p-1 [scrollbar-width:none]"
      >
        {tabs.map((t, i) => {
          const active = t.id === value;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`${idPrefix}-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              style={active ? { color: accent } : undefined}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
                active ? "" : "ecole_m-muted hover:bg-black/[0.04] hover:text-inherit"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="pill"
                  transition={transition}
                  className="absolute inset-0 rounded-md border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                />
              )}
              {Icon && <Icon className="relative h-4 w-4" aria-hidden />}
              <span className="relative">{t.label}</span>
              {active && (
                <motion.span
                  layoutId="bar"
                  transition={transition}
                  style={{ backgroundColor: accent }}
                  className="absolute bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}