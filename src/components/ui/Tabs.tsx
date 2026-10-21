import React, { useId, useRef } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const n = tabs.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div role="tablist" className="ecole_m-scroll relative flex items-end gap-0.5 overflow-x-auto border-b border-black/[0.07]">
      {tabs.map((t, i) => {
        const selected = t.id === value;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={[
              "group relative mb-1 inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-[6px] px-3.5 text-[13.5px] font-medium outline-none",
              "transition-[background-color,color] duration-150 ease-out",
              "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--em-accent,#0067C0)]",
              selected ? "text-[#1A1A1A]" : "text-[#5D5D5D] hover:bg-black/[0.04] hover:text-[#1A1A1A] active:bg-black/[0.07]"
            ].join(" ")}>
            {Icon && (
              <Icon
                className={`h-4 w-4 transition-colors duration-150 ${selected ? "text-[var(--em-accent,#0067C0)]" : ""}`}
                strokeWidth={2.1}
                aria-hidden="true"
              />
            )}
            {t.label}
            {selected && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute -bottom-[5px] left-[calc(50%-10px)] h-[3px] w-5 rounded-full"
                style={{ background: "var(--em-accent, #0067C0)" }}
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}