import React from "react";
import type { LucideIcon } from "lucide-react";

interface PanelHeaderProps {
  icon: LucideIcon;
  color: string;
  title: string;
  meta?: React.ReactNode;
}

export function PanelHeader({ icon: Icon, color, title, meta }: PanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--em-border)] px-5 py-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
      </div>
      {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
    </div>
  );
}