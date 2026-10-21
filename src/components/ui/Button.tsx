import React from "react";
import { LoaderCircleIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "subtle" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  iconOnly?: boolean;
}

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border font-medium outline-none " +
  "transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:ring-2 focus-visible:ring-[var(--em-accent,#0067C0)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const VARIANTS: Record<Variant, string> = {
  primary:
    "border-black/10 bg-[var(--em-accent,#0067C0)] text-white " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] " +
    "hover:brightness-110 active:brightness-95",
  secondary:
    "border-black/[0.08] bg-white text-[#1A1A1A] " +
    "shadow-[inset_0_-1px_0_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.04)] " +
    "hover:bg-[#F9F9F9] active:bg-[#F3F3F3] active:text-[#5D5D5D]",
  subtle:
    "border-transparent bg-transparent text-[#1A1A1A] hover:bg-black/[0.05] active:bg-black/[0.08] active:text-[#5D5D5D]",
  danger:
    "border-black/10 bg-[#C42B1C] text-white " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.1)] " +
    "hover:bg-[#B3261A] active:bg-[#9E2316]"
};

const SIZES: Record<Size, { base: string; icon: string; glyph: string }> = {
  md: { base: "h-9 px-4 text-[13.5px]", icon: "h-9 w-9 px-0", glyph: "h-4 w-4" },
  sm: { base: "h-8 px-3 text-[13px]", icon: "h-8 w-8 px-0", glyph: "h-[15px] w-[15px]" }
};

export function buttonClasses({
  variant = "secondary",
  size = "md",
  iconOnly = false,
  className = ""
}: { variant?: Variant; size?: Size; iconOnly?: boolean; className?: string } = {}) {
  return [BASE, VARIANTS[variant], iconOnly ? SIZES[size].icon : SIZES[size].base, className].filter(Boolean).join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon: Icon, loading, iconOnly, className = "", children, disabled, type = "button", ...rest },
  ref
) {
  const glyph = SIZES[size].glyph;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}>
      {loading ? (
        <LoaderCircleIcon className={`${glyph} animate-spin`} aria-hidden="true" />
      ) : Icon ? (
        <Icon className={glyph} strokeWidth={2.1} aria-hidden="true" />
      ) : null}
      {!iconOnly && children}
    </button>
  );
});