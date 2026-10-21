import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { 
  X, Search, ChevronDown, ChevronRight, Lightbulb, 
  AlertTriangle, Sparkles, BookOpen, ExternalLink
} from 'lucide-react';
import { DOCUMENTATION, DEFAULT_DOC, PageDoc } from '../../data/documentation';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function DocumentationDrawer({ open, onClose }: Props) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const [search, setSearch] = useState('');
  
  // Logique de routage intelligente : trouve la clé la plus longue qui correspond au pathname
  const currentDoc: PageDoc = useMemo(() => {
    const match = Object.keys(DOCUMENTATION)
      .filter(key => pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0]; // Prend la correspondance la plus précise
    return match ? DOCUMENTATION[match] : DEFAULT_DOC;
  }, [pathname]);

  // État des accordéons (tous ouverts par défaut)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const defaults = currentDoc.sections.reduce((acc, sec) => ({ ...acc, [sec.title]: true }), {});
    setOpenSections(defaults);
    setSearch('');
  }, [currentDoc]);

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Filtrage par recherche
  const filteredSections = currentDoc.sections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(sec => sec.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: EASE }}
            className="ecole_m fixed right-0 top-0 bottom-0 z-[100] flex w-full max-w-[450px] flex-col border-l border-[var(--em-border)] bg-[#FBFBFB] shadow-[-10px_0_30px_rgba(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-[var(--em-border)] bg-white px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[var(--em-accent)]">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[.1em]">Documentation</span>
                </div>
                <h2 className="ecole_m-display mt-1 truncate text-[19px] font-semibold text-[var(--em-text)]">
                  {currentDoc.title}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--em-text-2)] transition-colors hover:bg-[var(--em-border)] hover:text-[var(--em-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Barre de recherche sticky */}
            <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--em-border)] bg-[#FBFBFB] px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--em-text-3)]" />
                <input
                  type="text"
                  placeholder="Rechercher un mot-clé (ex: paiement)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ecole_m-input h-9 w-full pl-9"
                />
              </div>
            </div>

            {/* Contenu défilable */}
            <div className="ecole_m-scroll flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-6 text-[13.5px] leading-relaxed text-[var(--em-text-2)]">
                {currentDoc.description}
              </p>

              {filteredSections.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#eef1f5] text-[var(--em-text-3)]">
                    <Search className="h-5 w-5" />
                  </span>
                  <p className="text-[13.5px] font-medium text-[var(--em-text)]">Aucun résultat</p>
                  <p className="text-[12.5px] text-[var(--em-text-2)]">Essayez un autre mot-clé.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSections.map((sec, i) => {
                    const Icon = sec.icon;
                    const isOpen = openSections[sec.title];
                    return (
                      <motion.div 
                        key={sec.title}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="overflow-hidden rounded-xl border border-[var(--em-border)] bg-white shadow-sm"
                      >
                        {/* Titre de section (Accordéon) */}
                        <button
                          onClick={() => toggleSection(sec.title)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                            isOpen ? 'bg-[var(--em-accent-soft)]/30' : 'hover:bg-[#F9F9F9]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${
                              isOpen ? 'bg-[var(--em-accent)] text-white' : 'bg-[var(--em-accent-soft)] text-[var(--em-accent)]'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className={`text-[13.5px] font-semibold ${isOpen ? 'text-[var(--em-accent)]' : 'text-[var(--em-text)]'}`}>
                              {sec.title}
                            </span>
                          </div>
                          {isOpen ? <ChevronDown className="h-4 w-4 text-[var(--em-accent)]" /> : <ChevronRight className="h-4 w-4 text-[var(--em-text-2)]" />}
                        </button>

                        {/* Contenu de la section */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="border-t border-[var(--em-border)] px-4 py-1"
                            >
                              <ul className="divide-y divide-[var(--em-border)]/60">
                                {sec.items.map((item, j) => (
                                  <li key={j} className="py-3 last:pb-4">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[13px] font-semibold text-[var(--em-text)]">{item.title}</p>
                                        
                                        {item.badge && (
                                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                            ${item.badge === 'Nouveau' ? 'bg-[var(--em-success-soft)] text-[var(--em-success)]' : 
                                              item.badge === 'Astuce' ? 'bg-[var(--em-warning-soft)] text-[var(--em-warning)]' : 
                                              'bg-[var(--em-danger-soft)] text-[var(--em-danger)]'}`}
                                          >
                                            {item.badge === 'Astuce' && <Lightbulb className="h-3 w-3" />}
                                            {item.badge === 'Attention' && <AlertTriangle className="h-3 w-3" />}
                                            {item.badge === 'Nouveau' && <Sparkles className="h-3 w-3" />}
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[12.5px] leading-relaxed text-[var(--em-text-2)]">
                                        {item.description}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[var(--em-border)] bg-white px-5 py-3 flex items-center justify-between text-[11.5px] text-[var(--em-text-2)]">
              <span>École Manager © {new Date().getFullYear()}</span>
              <a href="#" className="flex items-center gap-1 text-[var(--em-accent)] hover:underline">
                Support <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}