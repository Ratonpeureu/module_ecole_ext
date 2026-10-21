import React from "react";
import type { LucideIcon } from "lucide-react";

interface ContextBarProps {
  icon?: LucideIcon;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ContextBar({ icon: Icon, title, children, actions }: ContextBarProps) {
  return (
    <section className="ecole_m-card p-4 md:p-5" aria-label={title ?? "Sélection"}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          {title ?
          <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
              {Icon ? <Icon className="h-4 w-4 text-[var(--em-accent)]" aria-hidden="true" /> : null}
              {title}
            </p> :
          null}
          <div className="flex flex-wrap items-end gap-3">{children}</div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>);
}