import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  // Ajustement pour que le menu ne sorte pas de l'écran
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 36) - 20);

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ left: adjustedX, top: adjustedY }}
        className="fixed z-[99999] min-w-[200px] overflow-hidden rounded-lg border border-[var(--em-border)] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.onClick(); onClose(); }}
            className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[13px] font-medium transition-colors ${
              item.danger
                ? 'text-[var(--em-danger)] hover:bg-[var(--em-danger-soft)]'
                : 'text-[var(--em-text)] hover:bg-[var(--em-surface-2)]'
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            <span className="flex-1 truncate">{item.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}