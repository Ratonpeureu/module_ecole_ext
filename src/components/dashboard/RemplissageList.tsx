import React from "react";
import { motion } from "framer-motion";
import { getTauxRemplissage } from "../../lib/api_ecole";
import { AsyncBlock } from "../data/AsyncBlock";
import { EmptyState } from "../data/States";
import { formatNumber, formatPct, num, str } from "../../utils/format";
import { Users, DoorOpen } from "lucide-react";

function barColor(t: number) {
  if (t >= 100) return "var(--em-danger)";
  if (t >= 85) return "var(--em-warning)";
  return "var(--em-accent)";
}

export function RemplissageList({ anneeId }: { anneeId: string }) {
  return (
    <AsyncBlock
      load={() => getTauxRemplissage(anneeId)}
      deps={[anneeId]}
      empty={<EmptyState compact title="Aucune classe pour cette année" />}>
      {(rows) => {
        // Calcul global
        const totalEleves = rows.reduce((acc, r) => acc + (num(r.effectif_actuel) || 0), 0);
        const totalPlaces = rows.reduce((acc, r) => acc + (num(r.effectif_max) || 0), 0);
        const totalRestantes = rows.reduce((acc, r) => acc + (num(r.places_restantes) || 0), 0);

        return (
          <div className="rounded-xl border border-[var(--em-border)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {/* Header Global */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--em-border)] bg-gradient-to-r from-[#F9F9F9] to-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--em-text)]">Capacité globale de l'établissement</h2>
                  <p className="text-[12.5px] text-[var(--em-text-2)]">Répartition des effectifs sur l'ensemble des classes</p>
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--em-text-2)]">Places libres</p>
                  <p className="text-[18px] font-bold text-[var(--em-text)]">{formatNumber(totalRestantes)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--em-text-2)]">Total Élèves</p>
                  <p className="text-[18px] font-bold text-[var(--em-text)]">{formatNumber(totalEleves)} / {formatNumber(totalPlaces)}</p>
                </div>
              </div>
            </div>

            {/* Grille des classes */}
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r, i) => {
                const t = num(r.taux_remplissage_pct) ?? 0;
                const color = barColor(t);
                return (
                  <motion.div
                    key={str(r.classe_id) || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03, ease: [0.23, 1, 0.32, 1] }}
                    className="group flex flex-col justify-between rounded-lg border border-[var(--em-border)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-[var(--em-text-2)]" />
                        <p className="truncate text-[13.5px] font-bold text-[var(--em-text)]">{str(r.classe)}</p>
                      </div>
                      <span
                        className="shrink-0 rounded-md px-2 py-0.5 text-[12px] font-bold tabular-nums"
                        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, white)`, color }}
                      >
                        {formatPct(t)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef1f5]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, t)}%` }}
                          transition={{ duration: 0.6, delay: Math.min(i, 10) * 0.03, ease: [0.23, 1, 0.32, 1] }}
                        />
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-[11.5px] font-medium">
                        <span className="text-[var(--em-text-2)]">{formatNumber(r.effectif_actuel)} / {formatNumber(r.effectif_max)} élèves</span>
                        <span className={t >= 100 ? "text-[var(--em-danger)]" : "text-[var(--em-text-3)]"}>
                          {formatNumber(r.places_restantes)} place(s)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      }}
    </AsyncBlock>
  );
}