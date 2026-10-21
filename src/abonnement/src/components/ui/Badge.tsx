import React, { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'violet';

const TONES: Record<Tone, string> = {
  neutral: 'bg-[#eef1f5] text-[var(--em-text-2)]',
  accent: 'bg-[var(--em-accent-soft)] text-[var(--em-accent)]',
  success: 'bg-[var(--em-success-soft)] text-[var(--em-success)]',
  warning: 'bg-[var(--em-warning-soft)] text-[var(--em-warning)]',
  danger: 'bg-[var(--em-danger-soft)] text-[var(--em-danger)]',
  info: 'bg-[var(--em-info-soft)] text-[var(--em-info)]',
  violet: 'bg-violet-100 text-violet-700',
};

export function Badge({
  tone = 'neutral',
  children,
  icon,
  className = '',
}: { tone?: Tone; children: ReactNode; icon?: ReactNode; className?: string; solid?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[.10em]',
        TONES[tone],
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </span>
  );
}

export function StatusDot({ tone = 'neutral', pulse }: { tone?: Tone; pulse?: boolean }) {
  const colors: Record<Tone, string> = {
    neutral: '#8b95a3',
    accent: '#0067c0',
    success: '#0e7a0d',
    warning: '#8a5300',
    danger: '#c42b1c',
    info: '#005fb8',
    violet: '#8b5cf6',
  };
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: colors[tone] }}
        />
      )}
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: colors[tone] }}
      />
    </span>
  );
}