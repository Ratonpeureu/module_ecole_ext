import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
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
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const results = modules.filter((m) =>
    m.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
      >
        <div className="flex items-center border-b border-gray-100 px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            autoFocus
            className="h-14 w-full bg-transparent px-4 text-[15px] outline-none placeholder:text-gray-400"
            placeholder="Où voulez-vous aller ? (ex: Élèves, Finance...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="rounded bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-500">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">Aucun module trouvé.</div>
          ) : (
            results.map((m, i) => (
              <button
                key={m.path}
                onClick={() => { navigate(m.path); setOpen(false); }}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[14px] text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 group-hover:bg-blue-100">
                    <m.icon className="h-4 w-4" style={{ color: m.color }} />
                  </span>
                  <span className="font-medium">{m.label}</span>
                </div>
                {i === 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-500">
                    Aller <CornerDownLeft className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}