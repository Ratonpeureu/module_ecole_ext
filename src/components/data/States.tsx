import React from "react";
import { motion } from "framer-motion";
import { CircleAlertIcon, InboxIcon, RefreshCwIcon, LucideIcon } from "lucide-react";
import { buttonClasses } from "../ui/Button";

const EASE = [0.23, 1, 0.32, 1] as const;

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1 p-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-[8px] px-2 py-2.5" style={{ opacity: 1 - i * 0.14 }}>
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-[8px] bg-black/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 animate-pulse rounded-full bg-black/[0.07]" style={{ width: `${Math.max(30, 68 - i * 8)}%` }} />
            <div className="h-2.5 animate-pulse rounded-full bg-black/[0.045]" style={{ width: `${Math.max(20, 42 - i * 5)}%` }} />
          </div>
          <div className="hidden h-6 w-16 animate-pulse rounded-full bg-black/[0.045] sm:block" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="flex flex-col items-center gap-3.5 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-[#C42B1C]/[0.08] text-[var(--em-danger,#C42B1C)] ring-1 ring-[#C42B1C]/[0.12]">
        <CircleAlertIcon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[15px] font-semibold text-[#1A1A1A]">Impossible d'afficher ces informations</p>
        <p className="mx-auto mt-1.5 max-w-md whitespace-pre-line rounded-[8px] bg-[#C42B1C]/[0.05] px-3 py-2 text-[13px] text-[#5D5D5D]">{message}</p>
      </div>
      {onRetry && (
        <button type="button" className={buttonClasses({ variant: "secondary", size: "sm", className: "group" })} onClick={onRetry}>
          <RefreshCwIcon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-180" aria-hidden="true" />
          Réessayer
        </button>
      )}
    </motion.div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  text?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon = InboxIcon, title, text, children, compact }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className={`flex flex-col items-center px-6 text-center ${compact ? "gap-2.5 py-6" : "gap-4 py-14"}`}>
      <span
        className={`relative grid place-items-center rounded-[14px] bg-[var(--em-accent,#0067C0)]/[0.08] text-[var(--em-accent,#0067C0)] ring-1 ring-[var(--em-accent,#0067C0)]/[0.12] ${
          compact ? "h-10 w-10" : "h-14 w-14"
        }`}>
        <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <p className={`font-semibold text-[#1A1A1A] ${compact ? "text-[13.5px]" : "text-[16px]"}`}>{title}</p>
        {text && <p className="mx-auto mt-1 max-w-md text-[13.5px] leading-relaxed text-[#5D5D5D]">{text}</p>}
      </div>
      {children && <div className="mt-1 flex flex-wrap justify-center gap-2">{children}</div>}
    </motion.div>
  );
}