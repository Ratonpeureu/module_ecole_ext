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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      // Barre d'outils compacte, fixe en haut du contenu
      className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--em-border)] pb-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white shadow-sm"
          style={{ background: color }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="ecole_m-display text-[18px] font-bold tracking-tight text-[#1A1A1A] leading-tight truncate">
            {title}
          </h1>
          {subtitle && <p className="text-[12px] text-[#5D5D5D] truncate">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </motion.header>
  );
}