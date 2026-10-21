import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRightIcon, GraduationCapIcon, PresentationIcon, ScrollTextIcon, WalletIcon, TrendingUp, AlertCircle } from "lucide-react";
import { getDashboardDirection } from "../../lib/api_ecole";
import { AsyncBlock } from "../data/AsyncBlock";
import { buttonClasses } from "../ui/Button";
import { formatMoney, formatNumber, formatPct, num, obj } from "../../utils/format";

const EASE = [0.23, 1, 0.32, 1] as const;

export function DirectionOverview({ anneeId }: { anneeId: string }) {
  return (
    <AsyncBlock load={() => getDashboardDirection(anneeId)} deps={[anneeId]} rows={4}>
      {(d) => {
        const eff = obj(d.effectifs);
        const fin = obj(d.finance);
        const ped = obj(d.pedagogie);
        const taux = num(fin.taux_recouvrement_pct) ?? 0;
        const retard = num(fin.nb_familles_en_retard) ?? 0;

        const kpis = [
          { label: "Élèves inscrits", value: eff.total_eleves, to: "/eleves", icon: GraduationCapIcon, color: "#0F7B6C", bg: "#e6f4f1" },
          { label: "Enseignants actifs", value: eff.nb_enseignants, to: "/enseignants", icon: PresentationIcon, color: "#8764B8", bg: "#f1ebf7" },
          { label: "Bulletins publiés", value: ped.nb_bulletins_publies, to: "/bulletins", icon: ScrollTextIcon, color: "#E3008C", bg: "#fce6f4" },
          { label: "Familles en retard", value: retard, to: "/finance", icon: AlertCircle, color: retard > 0 ? "#C42B1C" : "#5A6472", bg: retard > 0 ? "#fde7e9" : "#eef1f5" },
        ];

        return (
          <div className="space-y-4">
            {/* Ligne 1 : Les KPIs (4 cartes) */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                  >
                    <Link
                      to={kpi.to}
                      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--em-border)] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: kpi.bg, color: kpi.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowRightIcon className="h-4 w-4 text-[var(--em-text-3)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--em-text)]" />
                      </div>
                      <div className="mt-4">
                        <p className="text-[13px] font-medium text-[var(--em-text-2)]">{kpi.label}</p>
                        <p className="ecole_m-display mt-1 text-3xl font-bold tracking-tight text-[var(--em-text)]">
                          {formatNumber(kpi.value)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Ligne 2 : Finance (Recouvrement) */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: EASE }}
              className="overflow-hidden rounded-xl border border-[var(--em-border)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--em-border)] bg-gradient-to-r from-[#F9F9F9] to-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
                    <WalletIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--em-text)]">Recouvrement des frais scolaires</h2>
                    <p className="text-[12.5px] text-[var(--em-text-2)]">Performance globale des encaissements pour l'année</p>
                  </div>
                </div>
                <Link to="/finance" className={buttonClasses({ variant: "secondary", size: "sm", className: "group" })}>
                  Voir le module Finance
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Pourcentage principal */}
                  <div className="flex flex-col justify-center rounded-xl bg-[var(--em-accent-soft)]/50 p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--em-accent)]">Taux global</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="ecole_m-display text-5xl font-black text-[var(--em-accent)]">{formatPct(taux)}</p>
                    </div>
                    <p className="mt-3 text-[12.5px] font-medium text-[var(--em-text-2)]">
                      {formatMoney(fin.total_encaisse_fcfa)} encaissés
                    </p>
                  </div>

                  {/* Barre de progression détaillée */}
                  <div className="md:col-span-2 flex flex-col justify-center space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-[13px] font-medium">
                        <span className="text-[var(--em-text-2)]">Progression</span>
                        <span className="text-[var(--em-text)]">{formatMoney(fin.total_encaisse_fcfa)} / {formatMoney(fin.total_du_fcfa)}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#eef1f5]">
                        <motion.div
                          className="h-full rounded-full bg-[var(--em-accent)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, taux)}%` }}
                          transition={{ duration: 0.8, ease: EASE }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-3">
                        <p className="text-[11.5px] font-medium text-[var(--em-text-2)]">Reste à recouvrer</p>
                        <p className="mt-0.5 text-[15px] font-bold text-[var(--em-text)]">
                          {formatMoney((num(fin.total_du_fcfa) || 0) - (num(fin.total_encaisse_fcfa) || 0))}
                        </p>
                      </div>
                      <div className={`rounded-lg border p-3 ${retard > 0 ? 'border-[var(--em-danger)]/20 bg-[var(--em-danger-soft)]' : 'border-[var(--em-border)] bg-[#F9F9F9]'}`}>
                        <p className="text-[11.5px] font-medium text-[var(--em-text-2)]">Familles en retard</p>
                        <p className={`mt-0.5 text-[15px] font-bold ${retard > 0 ? 'text-[var(--em-danger)]' : 'text-[var(--em-text)]'}`}>
                          {formatNumber(retard)} famille(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        );
      }}
    </AsyncBlock>
  );
}