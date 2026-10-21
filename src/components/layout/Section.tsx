import React from "react";

interface SectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, description, actions, children }: SectionProps) {
  return (
    <section className="space-y-3.5 border-t border-black/[0.06] pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-[5px] h-3.5 w-[3px] shrink-0 rounded-full bg-[var(--em-accent,#0067C0)]" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-semibold tracking-[-0.005em] text-[#1A1A1A]">{title}</h3>
            {description && <p className="mt-0.5 text-[12.5px] text-[#5D5D5D]">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}