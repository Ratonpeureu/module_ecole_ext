import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FolderOpenIcon, GraduationCapIcon, HeartPulseIcon, UserRoundIcon, WalletIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Row } from "../../types/ui";
import { EleveProfil } from "./EleveProfil";
import { EleveScolarite } from "./EleveScolarite";
import { EleveFinance } from "./EleveFinance";
import { EleveSante } from "./EleveSante";
import { EleveDocuments } from "./EleveDocuments";
import { EASE_OUT } from "./EleveMotion";
import { fullName, str } from "../../utils/format";

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "profil", label: "Profil", icon: UserRoundIcon },
  { id: "scolarite", label: "Scolarité", icon: GraduationCapIcon },
  { id: "finance", label: "Finance", icon: WalletIcon },
  { id: "sante", label: "Suivi", icon: HeartPulseIcon },
  { id: "documents", label: "Documents", icon: FolderOpenIcon },
];

export function EleveDetail({ eleve, anneeId, onChanged }: { eleve: Row; anneeId: string; onChanged: () => void }) {
  const [tab, setTab] = useState("profil");
  const id = str(eleve.id);
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-1 pt-1 backdrop-blur-md">
        <div
          role="tablist"
          aria-label="Dossier de l'élève"
          className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--em-border)] bg-black/[0.03] p-1 [scrollbar-width:none]"
        >
          {TABS.map((t, i) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                ref={(el) => (refs.current[i] = el)}
                role="tab"
                id={`eleve-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`eleve-panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
                  active ? "text-[var(--em-accent)]" : "ecole_m-muted hover:bg-black/[0.04] hover:text-inherit"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="eleve-tab-pill"
                    className="absolute inset-0 rounded-md border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    transition={{ duration: reduce ? 0 : 0.22, ease: EASE_OUT }}
                  />
                )}
                <Icon className="relative h-4 w-4" aria-hidden />
                <span className="relative">{t.label}</span>
                {active && (
                  <motion.span
                    layoutId="eleve-tab-bar"
                    className="absolute bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-[var(--em-accent)]"
                    transition={{ duration: reduce ? 0 : 0.22, ease: EASE_OUT }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`eleve-panel-${tab}`}
          aria-labelledby={`eleve-tab-${tab}`}
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {tab === "profil" && <EleveProfil eleveId={id} onChanged={onChanged} />}
          {tab === "scolarite" && <EleveScolarite eleveId={id} anneeId={anneeId} />}
          {tab === "finance" && <EleveFinance eleveId={id} />}
          {tab === "sante" && <EleveSante eleveId={id} eleveNom={fullName(eleve)} />}
          {tab === "documents" && <EleveDocuments eleveId={id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}