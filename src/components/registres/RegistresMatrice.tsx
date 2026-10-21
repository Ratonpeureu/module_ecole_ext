import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheckIcon, FolderOpenIcon, PenLineIcon, RefreshCwIcon, SearchIcon, WalletIcon, LucideIcon } from "lucide-react";
import { synchroRegistresEtAttendre } from "../../lib/api_ecole";
import { RegistresStatut, TypeRegistre } from "../../types/ui";
import { ORDRE_REGISTRES, TYPE_REGISTRE } from "../../data/registres";
import { Section } from "../layout/Section";
import { EmptyState } from "../data/States";
import { AsyncButton } from "../form/AsyncButton";
import { EASE_OUT } from "../eleves/EleveMotion";
import { CelluleRegistre } from "./CelluleRegistre";
const ICONES: Record<TypeRegistre, LucideIcon> = {
  appels: CalendarCheckIcon,
  notes: PenLineIcon,
  finance: WalletIcon,
  dossier: FolderOpenIcon
};
interface RegistresMatriceProps {
  statut: RegistresStatut;
  onOuvrir: (classeId: string, type: TypeRegistre) => void;
  onActualiser: () => void;
}
export function RegistresMatrice({
  statut,
  onOuvrir,
  onActualiser
}: RegistresMatriceProps) {
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();
  const filtre = q.trim().toLowerCase();
  const classes = statut.classes.filter((c) => c.libelle.toLowerCase().includes(filtre));
  return <Section title="Registres par classe" description={`Année ${statut.annee ?? ""} · ${statut.classes.length} classe(s) active(s)`} actions={statut.classes.length > 0 ? <label className="relative flex items-center">
            <span className="sr-only">Rechercher une classe</span>
            <SearchIcon className="ecole_m-muted pointer-events-none absolute left-2.5 h-3.5 w-3.5" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une classe" className="h-8 w-[200px] rounded-md border border-[var(--em-border)] bg-transparent pl-8 pr-2.5 text-[12.5px] outline-none transition-[box-shadow,border-color] duration-150 focus:border-[var(--em-accent)] focus:ring-2 focus:ring-[var(--em-accent)]/20" />
          </label> : null}>
      {statut.classes.length === 0 ? <EmptyState compact title="Aucune classe active" text="Les registres sont tenus pour les classes actives de l'année active." /> : classes.length === 0 ? <EmptyState compact title={`Aucune classe ne correspond à « ${q.trim()} »`} /> : <div className="ecole_m-scroll -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-1.5 text-[13px]">
            <thead>
              <tr>
                <th scope="col" className="ecole_m-muted w-[160px] px-2 pb-1 text-left text-[12px] font-medium">
                  Classe
                </th>
                {ORDRE_REGISTRES.map((t) => {
              const Icon = ICONES[t];
              return <th key={t} scope="col" className="ecole_m-muted px-1 pb-1 text-left text-[12px] font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {TYPE_REGISTRE[t]}
                      </span>
                    </th>;
            })}
                <th scope="col" className="w-10">
                  <span className="sr-only">Synchroniser</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => <motion.tr key={c.classe_id} initial={{
            opacity: 0,
            y: reduce ? 0 : 4
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.2,
            ease: EASE_OUT,
            delay: reduce ? 0 : Math.min(i * 0.03, 0.3)
          }}>
                  <th scope="row" className="px-2 text-left align-middle text-[13.5px] font-semibold">
                    {c.libelle}
                  </th>
                  {ORDRE_REGISTRES.map((t) => <td key={t} className="px-1 align-top">
                      <CelluleRegistre info={c.registres[t]} libelle={`${TYPE_REGISTRE[t]} — ${c.libelle}`} onOuvrir={() => onOuvrir(c.classe_id, t)} />
                    </td>)}
                  <td className="px-1 text-center align-middle">
                    <AsyncButton label={`Synchroniser tous les registres de ${c.libelle}`} icon={RefreshCwIcon} iconOnly size="sm" variant="subtle" successMessage="Registres synchronisés" onClick={async () => {
                await synchroRegistresEtAttendre({
                  classe_id: c.classe_id
                });
                onActualiser();
              }} />
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>}
    </Section>;
}