import React from 'react';
import { useAuth } from '@/lib/auth';
import { Wifi, Database, User } from 'lucide-react';

export function StatusBar() {
  const { entreprise } = useAuth();

  return (
    <div className="absolute bottom-14 left-0 right-0 z-30 flex h-7 items-center justify-between bg-[#005fb8] px-4 text-[11px] font-medium text-white/90">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 cursor-default hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
          <Wifi className="h-3 w-3" /> Connecté
        </span>
        <span className="flex items-center gap-1.5 cursor-default hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
          <Database className="h-3 w-3" /> Base de données synchronisée
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <User className="h-3 w-3" /> {entreprise?.nom || 'Administrateur'}
        </span>
        <span className="cursor-default hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
          v1.0.0
        </span>
      </div>
    </div>
  );
}