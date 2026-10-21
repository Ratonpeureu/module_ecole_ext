import React from "react";
import { LucideIcon } from "lucide-react";
interface BoutonOutilProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  iconOnly?: boolean;
  badge?: number;
  title?: string;
  pressed?: boolean;
}
export function BoutonOutil({
  label,
  icon: Icon,
  onClick,
  disabled,
  primary,
  iconOnly,
  badge,
  title,
  pressed
}: BoutonOutilProps) {
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={iconOnly ? label : undefined} aria-pressed={pressed} title={title ?? (iconOnly ? label : undefined)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium outline-none transition-[background-color,color,transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] disabled:pointer-events-none disabled:opacity-40 ${iconOnly ? "w-8 justify-center" : "px-2.5"} ${primary ? "bg-[var(--em-accent)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:opacity-90" : pressed ? "bg-[var(--em-accent-soft)] text-[var(--em-accent)]" : "hover:bg-black/[0.05]"}`}>
      <Icon className="h-4 w-4" aria-hidden />
      {!iconOnly && <span>{label}</span>}
      {badge !== undefined && badge > 0 && <span className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${primary ? "bg-white/25 text-white" : "bg-[var(--em-accent)] text-white"}`}>
          {badge}
        </span>}
    </button>;
}