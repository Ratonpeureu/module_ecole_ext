import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { modules } from '../../data/modules';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const results = modules.filter(m => m.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
      >
        <div className="flex items-center border-b border-gray-100 px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            autoFocus
            className="h-12 w-full bg-transparent px-4 text-sm outline-none placeholder:text-gray-400"
            placeholder="Où voulez-vous aller ? (ex: Élèves, Finance...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.map((m) => (
            <button
              key={m.path}
              onClick={() => { navigate(m.path); setOpen(false); }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <div className="flex items-center gap-3">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                {m.label}
              </div>
              <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}