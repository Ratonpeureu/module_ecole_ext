import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div 
      data-tauri-drag-region 
      className="fixed top-0 left-0 right-0 z-[10000] flex h-9 items-center justify-between bg-white/80 backdrop-blur-md border-b border-[var(--em-border)] select-none"
    >
      {/* Zone de drag (le logo et le texte) */}
      <div data-tauri-drag-region className="flex h-full items-center px-4 gap-2 pointer-events-none">
        <div className="h-4 w-4 rounded bg-[#0067c0] flex items-center justify-center">
           <div className="h-2 w-2 bg-white rounded-sm" />
        </div>
        <span className="text-[12px] font-semibold text-[#5a6472]">École Manager</span>
      </div>

      {/* Boutons de contrôle (droite) */}
      <div className="flex h-full pointer-events-auto">
        <button
          onClick={() => appWindow.minimize()}
          className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-black/5 transition-colors"
          aria-label="Réduire"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-black/5 transition-colors"
          aria-label="Agrandir"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="inline-flex h-full w-12 items-center justify-center text-[#5a6472] hover:bg-[#c42b1c] hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}