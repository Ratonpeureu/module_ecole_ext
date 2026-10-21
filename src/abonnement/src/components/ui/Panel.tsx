import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function Panel({ title, subtitle, icon, right, children, className = '', bodyClassName = '', noPadding }: PanelProps) {
  return (
    <section className={`ecole_m-card overflow-hidden ${className}`}>
      {(title || icon || right) && (
        <header className="flex items-center gap-3 border-b border-[var(--em-border)] px-5 py-3.5">
          {icon && (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="ecole_m-display truncate text-[14px] font-semibold leading-tight text-[var(--em-text)]">
                {title}
              </h3>
            )}
            {subtitle && <p className="ecole_m-muted mt-0.5 truncate text-[12px]">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className={noPadding ? '' : `p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-[14px] bg-[var(--em-accent-soft)] text-[var(--em-accent)] ring-1 ring-[var(--em-accent)]/10">
        {icon ?? <Inbox className="h-6 w-6" strokeWidth={1.8} />}
      </div>
      <h4 className="ecole_m-display text-[15px] font-semibold text-[var(--em-text)]">{title}</h4>
      {description && <p className="ecole_m-muted mt-1.5 max-w-sm text-[13px]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}