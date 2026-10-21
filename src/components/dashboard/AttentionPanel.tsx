import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldAlertIcon, WalletIcon, CheckCircle2 } from "lucide-react";
import { getDashboardDirection, listerEleves, listerPaiementsEnAttente } from "../../lib/api_ecole";
import { useLookup } from "../../hooks/useLookup";
import { AsyncBlock } from "../data/AsyncBlock";
import { Badge } from "../ui/Badge";
import { arr, formatDate, formatMoney, fullName, obj, str, valueLabel } from "../../utils/format";
import { motion } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

function Initial({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-bold shadow-sm"
      style={{ background: `color-mix(in srgb, ${color} 15%, white)`, color }}
      aria-hidden="true">
      {(name.trim()[0] || "?").toUpperCase()}
    </span>
  );
}

export function AttentionPanel({ anneeId }: { anneeId: string }) {
  const eleves = useLookup(() => listerEleves(), fullName);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Carte Paiements */}
      <motion.section
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col overflow-hidden rounded-xl border border-[var(--em-border)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--em-border)] bg-gradient-to-r from-[#F9F9F9] to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--em-success-soft)] text-[var(--em-success)]">
              <WalletIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-[14.5px] font-semibold text-[var(--em-text)]">Paiements à valider</h2>
              <p className="text-[12px] text-[var(--em-text-2)]">En attente de confirmation</p>
            </div>
          </div>
          <Link to="/finance?tab=attente" className="text-[12.5px] font-semibold text-[var(--em-accent)] hover:underline flex items-center gap-1">
            Traiter <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex-1 p-3">
          <AsyncBlock
            load={() => listerPaiementsEnAttente()}
            deps={[]}
            empty={
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-[var(--em-success)] mb-2 opacity-80" />
                <p className="text-[13.5px] font-medium text-[var(--em-text)]">Tout est à jour !</p>
                <p className="text-[12px] text-[var(--em-text-2)]">Aucun paiement en attente de validation.</p>
              </div>
            }>
            {(rows) => (
              <ul className="space-y-1">
                {rows.slice(0, 5).map((p) => (
                  <li key={str(p.id)} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F9F9F9]">
                    <Initial name={str(p.eleve)} color="#0F7B0F" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-[var(--em-text)]">{str(p.eleve)}</p>
                      <p className="text-[12px] text-[var(--em-text-2)]">{formatDate(p.date_paiement)}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[var(--em-success-soft)] px-2.5 py-1 text-[13px] font-bold text-[var(--em-success)]">
                      {formatMoney(p.montant_fcfa)}
                    </span>
                  </li>
                ))}
                {rows.length > 5 && (
                  <li className="px-2 pt-2 text-center text-[12.5px] font-medium text-[var(--em-accent)]">
                    + {rows.length - 5} autres paiements
                  </li>
                )}
              </ul>
            )}
          </AsyncBlock>
        </div>
      </motion.section>

      {/* Carte Sanctions */}
      <motion.section
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col overflow-hidden rounded-xl border border-[var(--em-border)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--em-border)] bg-gradient-to-r from-[#F9F9F9] to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--em-danger-soft)] text-[var(--em-danger)]">
              <ShieldAlertIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-[14.5px] font-semibold text-[var(--em-text)]">Discipline Récente</h2>
              <p className="text-[12px] text-[var(--em-text-2)]">Dernières sanctions</p>
            </div>
          </div>
          <Link to="/discipline" className="text-[12.5px] font-semibold text-[var(--em-accent)] hover:underline flex items-center gap-1">
            Détails <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex-1 p-3">
          <AsyncBlock
            load={async () => arr(obj((await getDashboardDirection(anneeId)).discipline).sanctions_recentes)}
            deps={[anneeId]}
            empty={
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-[var(--em-success)] mb-2 opacity-80" />
                <p className="text-[13.5px] font-medium text-[var(--em-text)]">Climat scolaire serein</p>
                <p className="text-[12px] text-[var(--em-text-2)]">Aucune sanction récente.</p>
              </div>
            }>
            {(rows) => (
              <ul className="space-y-1">
                {rows.slice(0, 5).map((s, i) => {
                  const name = eleves.get(str(s.eleve_id)) ?? "Élève";
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F9F9F9]">
                      <Initial name={name} color="#C42B1C" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13.5px] font-semibold text-[var(--em-text)]">{name}</p>
                          <Badge tone="danger">{valueLabel(str(s.type))}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-[var(--em-text-2)]">
                          {formatDate(s.date)} — <span className="italic">{str(s.motif)}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AsyncBlock>
        </div>
      </motion.section>
    </div>
  );
}