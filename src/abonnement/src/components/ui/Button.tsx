import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircleIcon } from 'lucide-react';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const BASE =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border font-medium outline-none ' +
  'transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const VARIANTS: Record<Variant, string> = {
  primary:
    'border-black/10 bg-[var(--em-accent)] text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] ' +
    'hover:brightness-110 active:brightness-95',
  accent:
    'border-black/10 bg-[var(--em-accent)] text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] ' +
    'hover:brightness-110 active:brightness-95',
  dark: 'border-black/10 bg-[var(--em-text)] text-white hover:brightness-110',
  outline:
    'border-[var(--em-border)] bg-white text-[var(--em-text)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] hover:bg-[#F9F9F9]',
  ghost: 'border-transparent bg-transparent text-[var(--em-text)] hover:bg-black/[0.05]',
  danger:
    'border-black/10 bg-[var(--em-danger)] text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.22)] hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[13.5px] gap-2',
  lg: 'h-11 px-5 text-[14px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className = '', children, disabled, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className].join(' ')}
      {...rest}
    >
      {loading ? <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});