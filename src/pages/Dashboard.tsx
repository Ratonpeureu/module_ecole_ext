import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, CalendarDaysIcon, CheckCircle2Icon, HomeIcon, SchoolIcon, LayoutGridIcon } from "lucide-react";
import { useSchool } from "../contexts/SchoolContext";
import { WithAnnee } from "../components/layout/WithAnnee";
import { DirectionOverview } from "../components/dashboard/DirectionOverview";
import { AttentionPanel } from "../components/dashboard/AttentionPanel";
import { RemplissageList } from "../components/dashboard/RemplissageList";
import { modules } from "../data/modules";
import { str } from "../utils/format";
import { SeedDemoButton } from "../components/dashboard/SeedDemoButton";

const EASE = [0.23, 1, 0.32, 1] as const;

export function Dashboard() {
  const { annee, entreprise } = useSchool();
  const reduce = useReducedMotion();

  const aujourdhui = useMemo(
    () => new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    []
  );

  // Filtrer les modules pour les raccourcis (on exclut l'accueil, paramètres et abonnement)
  const shortcuts = modules.filter(m => 
    !["/", "/parametres"].includes(m.path)
  ).slice(0, 8);

  const reveal = (i: number) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: EASE, delay: i * 0.08 }
    };

  return (
    <div className="space-y-6 pb-10">
      {/* ── En-tête (Hero) ────────────────────────────────────── */}
      <motion.header {...reveal(0)} className="relative overflow-hidden rounded-2xl border border-[var(--em-border)] bg-white p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[var(--em-accent-soft)] opacity-50 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--em-accent)] text-white shadow-lg">
              <HomeIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-medium capitalize text-[var(--em-text-2)]">{aujourdhui}</p>
              <h1 className="ecole_m-display mt-0.5 text-2xl font-bold tracking-tight text-[var(--em-text)] sm:text-3xl">
                Bonjour, {entreprise?.nom || "Direction"}
              </h1>
              <p className="mt-1 text-[13.5px] text-[var(--em-text-2)]">
                {annee ? `Année scolaire ${str(annee.libelle)} en cours` : "Bienvenue sur votre espace de gestion"}
              </p>
            </div>
          </div>

          {annee && (
            <div className="flex items-center gap-2 self-start rounded-full border border-[var(--em-border)] bg-[#F9F9F9] px-4 py-2 sm:self-auto">
              <CheckCircle2Icon className="h-4 w-4 text-[var(--em-accent)]" />
              <span className="text-[13px] font-semibold text-[var(--em-text)]">{str(annee.libelle)}</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Seed Demo (uniquement si activé) */}
      <motion.div {...reveal(1)}>
        <SeedDemoButton />
      </motion.div>

      <WithAnnee>
        {(anneeId) => (
          <div className="space-y-6">
            {/* ── Indicateurs clés & Finance ───────────────────── */}
            <motion.div {...reveal(2)}>
              <DirectionOverview anneeId={anneeId} />
            </motion.div>

            {/* ── Points d'attention (Paiements & Discipline) ──── */}
            <motion.div {...reveal(3)}>
              <AttentionPanel anneeId={anneeId} />
            </motion.div>

            {/* ── Raccourcis Modules (Comble le vide) ──────────── */}
            <motion.section {...reveal(4)} className="ecole_m-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <LayoutGridIcon className="h-5 w-5 text-[var(--em-text-2)]" />
                <h2 className="text-[15px] font-semibold text-[var(--em-text)]">Accès rapide aux modules</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                {shortcuts.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link
                      key={m.path}
                      to={m.path}
                      className="group flex flex-col items-center justify-center rounded-xl border border-[var(--em-border)] bg-[#F9F9F9] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--em-accent)]/30 hover:bg-white hover:shadow-md"
                    >
                      <span
                        className="mb-2 grid h-10 w-10 place-items-center rounded-lg text-white transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: m.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[12.5px] font-semibold text-[var(--em-text)] text-center">{m.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.section>

            {/* ── Remplissage des classes ──────────────────────── */}
            <motion.div {...reveal(5)}>
              <div className="mb-3 flex items-center gap-2 px-1">
                <SchoolIcon className="h-5 w-5 text-[var(--em-text-2)]" />
                <h2 className="text-[15px] font-semibold text-[var(--em-text)]">Répartition des classes</h2>
              </div>
              <RemplissageList anneeId={anneeId} />
            </motion.div>
          </div>
        )}
      </WithAnnee>

      {/* Footer */}
      <motion.div {...reveal(6)} className="flex items-center justify-center pt-4 text-[12px] text-[var(--em-text-3)]">
        <CalendarDaysIcon className="mr-2 h-4 w-4" />
        Données synchronisées en temps réel
      </motion.div>
    </div>
  );
}