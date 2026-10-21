import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { modules } from '../../data/modules';

export function TitleBar() {
  const { pathname } = useLocation();
  const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;

  useEffect(() => {
    if (!isTauri) return;
    const appWindow = getCurrentWindow();
    const currentModule = modules.find((m) => pathname.startsWith(m.path) && m.path !== '/');
    const title = currentModule ? `École Manager - ${currentModule.label}` : 'École Manager';
    appWindow.setTitle(title).catch(() => {});
  }, [pathname, isTauri]);

  const handleMinimize = () => { if (isTauri) getCurrentWindow().minimize(); };
  const handleMaximize = () => { if (isTauri) getCurrentWindow().toggleMaximize(); };
  const handleClose = () => { if (isTauri) getCurrentWindow().close(); };

  const handleDragStart = (e: React.MouseEvent) => {
    // Si on clique sur le fond (et pas sur un bouton) on déplace la fenêtre
    if (e.buttons === 1 && isTauri && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SVG') {
      getCurrentWindow().startDragging();
    }
  };

  if (!isTauri) return null;

  return (
    <div
      onMouseDown={handleDragStart}
      className="fixed top-0 left-0 right-0 z-[10000] flex h-9 items-center justify-between bg-white/80 backdrop-blur-md border-b border-[var(--em-border)] select-none"
    >
      <div className="flex h-full items-center px-4 gap-2 pointer-events-none">
        <div className="h-4 w-4 rounded bg-[#0067c0] flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-sm" />
        </div>
        <span className="text-[12px] font-semibold text-[#5a6472]">École Manager</span>
      </div>

      <div className="flex h-full">
        <button onClick={handleMinimize} className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-black/5 transition-colors" aria-label="Réduire">
          <Minus className="h-4 w-4" />
        </button>
        <button onClick={handleMaximize} className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-black/5 transition-colors" aria-label="Agrandir">
          <Square className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleClose} className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-[#c42b1c] hover:text-white transition-colors" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}