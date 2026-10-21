import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, color, title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-[12px] border border-black/[0.06] bg-white/75 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      <span className="pointer-events-none absolute inset-0" style={{ background: `${color}0D` }} aria-hidden="true" />
      <span className="absolute inset-y-4 left-0 w-[3px] rounded-r-full" style={{ background: color }} aria-hidden="true" />

      <div className="relative flex flex-wrap items-center gap-4 px-5 py-5 sm:px-6">
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.04, ease: [0.23, 1, 0.32, 1] }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] text-white"
          style={{ background: color, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 16px ${color}40` }}>
          <Icon className="h-6 w-6" strokeWidth={2.1} aria-hidden="true" />
        </motion.span>

        <div className="min-w-0 flex-1">
          <h1 className="ecole_m-display text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A] sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] text-[#5D5D5D]">{subtitle}</p>}
        </div>

        {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>}
      </div>
    </motion.header>
  );
}