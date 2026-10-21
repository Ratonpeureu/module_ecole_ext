import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ModuleHeroProps {
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function ModuleHero({ icon: Icon, color, title, subtitle, aside }: ModuleHeroProps) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: EASE }}
      className="ecole_m-card overflow-hidden">
      <div
        className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
        style={{ background: `color-mix(in srgb, ${color} 6%, transparent)` }}>
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[24px] font-semibold leading-tight tracking-tight">{title}</h1>
            {subtitle ? <p className="ecole_m-muted mt-0.5 text-[14px]">{subtitle}</p> : null}
          </div>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </motion.header>);
}