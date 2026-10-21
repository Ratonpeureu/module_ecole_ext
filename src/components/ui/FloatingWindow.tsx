import React, { useState, useRef, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { XIcon, MinusIcon, SquareIcon, CopyIcon } from "lucide-react";

export interface FloatingWindowProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onResize: (w: number, h: number) => void;
  onMove: (x: number, y: number) => void;
}

export function FloatingWindow({
  id, title, subtitle, icon, children,
  x, y, width, height, zIndex,
  onFocus, onClose, onResize, onMove,
}: FloatingWindowProps) {
  const dragControls = useDragControls();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x, y });

  // Sync position from props (ex: si la fenêtre est déplacée par le parent)
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;

    const onMouseMove = (ev: MouseEvent) => {
      const newW = Math.max(380, startW + ev.clientX - startX);
      const newH = Math.max(250, startH + ev.clientY - startY);
      onResize(newW, newH);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const actualWidth = isMaximized ? "calc(100vw - 16px)" : isMinimized ? width : width;
  const actualHeight = isMaximized ? "calc(100vh - 80px)" : isMinimized ? "auto" : height;
  const actualX = isMaximized ? 8 : position.x;
  const actualY = isMaximized ? 8 : position.y;

  return (
    <motion.div
      drag={!isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onDragEnd={(e, info) => {
        onMove(position.x + info.offset.x, position.y + info.offset.y);
      }}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      onMouseDown={onFocus}
      style={{
        position: "fixed",
        left: actualX,
        top: actualY,
        width: actualWidth,
        height: actualHeight,
        zIndex,
      }}
      className="flex flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-[#FBFBFB]/95 shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-2xl backdrop-saturate-150"
    >
      {/* Header (Drag handle) */}
      <header
        onPointerDown={(e) => !isMaximized && dragControls.start(e)}
        className="flex shrink-0 cursor-move items-center gap-3 border-b border-black/[0.06] bg-white/70 px-4 py-2.5 select-none"
      >
        {icon && <span className="text-[var(--em-accent)]">{icon}</span>}
        <div className="min-w-0 flex-1">
          <h2 className="ecole_m-display truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1A1A1A]">
            {title}
          </h2>
          {subtitle && <p className="truncate text-[12px] text-[#5D5D5D]">{subtitle}</p>}
        </div>

        {/* Contrôles fenêtre (Windows 11 style) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-md text-[#5D5D5D] transition-colors hover:bg-black/[0.05] hover:text-[#1A1A1A]"
            aria-label={isMinimized ? "Agrandir" : "Réduire"}
          >
            {isMinimized ? <SquareIcon className="h-3.5 w-3.5" /> : <MinusIcon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMaximized((v) => !v);
              setIsMinimized(false);
              if (isMaximized) setPosition({ x, y });
            }}
            className="grid h-8 w-8 place-items-center rounded-md text-[#5D5D5D] transition-colors hover:bg-black/[0.05] hover:text-[#1A1A1A]"
            aria-label={isMaximized ? "Restaurer" : "Agrandir"}
          >
            {isMaximized ? <CopyIcon className="h-3.5 w-3.5" /> : <SquareIcon className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-[#5D5D5D] transition-colors hover:bg-[var(--em-danger-soft)] hover:text-[var(--em-danger)]"
            aria-label="Fermer"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Body */}
      {!isMinimized && (
        <div className="ecole_m-scroll relative min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>
      )}

      {/* Resize Handle (coin bas-droit) */}
      {!isMaximized && !isMinimized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
          style={{
            background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)",
          }}
          title="Redimensionner"
        />
      )}
    </motion.div>
  );
}