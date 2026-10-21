import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon, LucideIcon } from "lucide-react";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}
const WIDTH = {
  md: 560,
  lg: 760,
  xl: 980
};
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = "md",
  children
}: ModalProps) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return createPortal(<AnimatePresence>
      {open && <div className="ecole_m fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <motion.div className="absolute inset-0 bg-[rgba(15,23,42,0.32)]" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.18
      }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-labelledby={titleId} className="ecole_m-card relative flex max-h-[90vh] w-full flex-col overflow-hidden shadow-[var(--em-shadow)]" style={{
        maxWidth: WIDTH[size]
      }} initial={{
        opacity: 0,
        scale: 0.96,
        y: 8
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98,
        y: 4
      }} transition={{
        duration: 0.22,
        ease: [0.23, 1, 0.32, 1]
      }}>
            <div className="flex items-start gap-3 px-6 pb-4 pt-5">
              {Icon && <span className="ecole_m-tile h-9 w-9" style={{
            background: "var(--em-accent)"
          }}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="ecole_m-display text-[19px] font-semibold leading-tight">
                  {title}
                </h2>
                {description && <p className="ecole_m-muted mt-1 text-[13.5px]">{description}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Fermer" className="ecole_m-btn ecole_m-btn--subtle ecole_m-btn--icon -mr-2 -mt-1">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="ecole_m-scroll flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </div>}
    </AnimatePresence>, document.body);
}