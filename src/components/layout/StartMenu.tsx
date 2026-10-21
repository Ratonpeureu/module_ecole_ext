import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon, PinIcon, PinOffIcon } from "lucide-react";
import { modules } from "../../data/modules";
import { useSchool } from "../../contexts/SchoolContext";
import { initials } from "../../utils/format";

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  pinned: string[];
  onTogglePin: (path: string) => void;
}

export function StartMenu({ open, onClose, pinned, onTogglePin }: StartMenuProps) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { entreprise } = useSchool();

  useEffect(() => {
    if (!open) return;
    setQ("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const list = modules.filter((m) => `${m.label} ${m.description}`.toLowerCase().includes(q.trim().toLowerCase()));
  const name = entreprise?.nom || entreprise?.email || "Mon établissement";

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onClose} aria-hidden="true" />
          <div className="pointer-events-none fixed inset-x-0 bottom-[64px] z-[46] flex justify-center px-3">
            <motion.div
              role="dialog"
              aria-label="Menu Démarrer"
              className="ecole_m-mica pointer-events-auto w-full max-w-[700px] overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="px-6 pb-4 pt-6">
                <div className="relative">
                  <SearchIcon className="ecole_m-faint pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && list[0]) {
                        navigate(list[0].path);
                        onClose();
                      }
                    }}
                    placeholder="Rechercher un module"
                    aria-label="Rechercher un module"
                    className="ecole_m-input !h-10 !rounded-full pl-10"
                  />
                </div>
              </div>
              <div className="px-6">
                <h2 className="mb-2 text-[13.5px] font-semibold">Tous les modules</h2>
                <div className="ecole_m-scroll grid max-h-[52vh] grid-cols-3 gap-1 overflow-y-auto pb-2 sm:grid-cols-4 md:grid-cols-5">
                  {list.map((m) => {
                    const Icon = m.icon;
                    const isPinned = pinned.includes(m.path);
                    return (
                      <div
                        key={m.path}
                        className="group relative flex min-w-0 flex-col items-center gap-2 rounded-md px-2 py-3 text-center transition-colors duration-100 hover:bg-white/90 focus-within:bg-white/90"
                      >
                        {/* Bouton Épingler (apparaît au survol) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onTogglePin(m.path);
                          }}
                          className={`absolute right-1 top-1 z-10 grid h-6 w-6 place-items-center rounded-full transition-all duration-150 ${
                            isPinned
                              ? "text-[var(--em-accent)] opacity-100 hover:bg-black/5"
                              : "text-[#8A8A8A] opacity-0 hover:bg-black/5 hover:text-[var(--em-text)] group-hover:opacity-100"
                          }`}
                          aria-label={isPinned ? "Détacher de la barre" : "Épingler à la barre"}
                          title={isPinned ? "Détacher de la barre" : "Épingler à la barre"}
                        >
                          {isPinned ? <PinOffIcon className="h-3.5 w-3.5" /> : <PinIcon className="h-3.5 w-3.5" />}
                        </button>

                        {/* Lien vers l'application */}
                        <Link
                          to={m.path}
                          onClick={onClose}
                          title={m.description}
                          className="flex w-full flex-col items-center gap-2 outline-none"
                        >
                          <span className="ecole_m-tile h-10 w-10 shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5" style={{ background: m.color }}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="w-full truncate whitespace-nowrap text-[12.5px] font-medium">{m.label}</span>
                        </Link>
                      </div>
                    );
                  })}
                  {list.length === 0 && <p className="ecole_m-muted col-span-full py-6 text-center text-[13.5px]">Aucun module trouvé</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 bg-black/[0.03] px-6 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--em-accent)] text-[13px] font-semibold text-white">
                    {initials(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold">{name}</p>
                    {entreprise?.email && <p className="ecole_m-muted truncate text-[12px]">{entreprise.email}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}