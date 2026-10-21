import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookMarkedIcon, CalendarIcon, CalendarPlusIcon, ChevronRightIcon, 
  ListChecksIcon, NetworkIcon, PlusIcon, RulerIcon, SettingsIcon, 
  SparklesIcon, Trash2Icon, WalletIcon, SmartphoneIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  creerAnnee,
  creerBareme,
  creerMatiere,
  creerTypeEvaluation,
  listerAnnees,
  listerBaremes,
  listerMatieres,
  listerTypesEvaluation,
  supprimerMatiere
} from "../lib/api_ecole";
import { useSchool } from "../contexts/SchoolContext";
import { ResourceView } from "../components/layout/ResourceView";
import { FormAction } from "../components/form/FormAction";
import { ConfirmAction } from "../components/form/ConfirmAction";
import { AnneeDetail } from "../components/parametres/AnneeDetail";
import { InitialisationPanel } from "../components/parametres/InitialisationPanel";
import { ReferentielPanel } from "../components/parametres/ReferentielPanel";
import { MobileAppPromo } from "../components/MobileAppPromo"; // <-- IMPORT ICI
import { anneeFields, baremeFields, matiereFields, typeEvaluationFields } from "../data/fields/parametres";
import { str } from "../utils/format";
import { useAbonnement } from '../lib/AbonnementContext';
import { StatutAbonnementCard } from '../abonnement/src/components/StatutAbonnementCard';
import { PaiementsHistorique } from '../abonnement/src/components/PaiementsHistorique';
import { Panel } from '../abonnement/src/components/ui/Panel';
import { Button as AboButton } from '../abonnement/src/components/ui/Button';
import '../abonnement/src/abonnement.css';

interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const TABS: TabDef[] = [
  { id: "annees", label: "Années scolaires", icon: CalendarIcon, description: "Années, périodes et passage en classe supérieure" },
  { id: "matieres", label: "Matières", icon: BookMarkedIcon, description: "Disciplines enseignées dans l'établissement" },
  { id: "baremes", label: "Barèmes", icon: RulerIcon, description: "Règles de notation et seuils de réussite" },
  { id: "types", label: "Types d'évaluation", icon: ListChecksIcon, description: "Devoirs, compositions et leur poids" },
  { id: "referentiel", label: "Référentiel", icon: NetworkIcon, description: "Cycles, niveaux et séries" },
  { id: "mobile", label: "App Mobile", icon: SmartphoneIcon, description: "L'application pour les parents (téléchargement)" }, // <-- ONGLET AJOUTÉ
  { id: "abonnement", label: "Abonnement", icon: WalletIcon, description: "Statut, échéances et historique de paiement" },
  { id: "initialisation", label: "Initialisation", icon: SparklesIcon, description: "Mise en place et maintenance des données" }
];

const EASE = [0.23, 1, 0.32, 1] as const;

function AbonnementPanel() {
  const { status } = useAbonnement();
  const isActif = status?.statut === 'actif';
  const paiements = status?.paiements ?? [];

  return (
    <div className="abonnement-scope space-y-5">
      <StatutAbonnementCard />
      <Panel
        title="Gérer mon abonnement"
        subtitle="Activer, prolonger ou changer de formule"
        icon={<WalletIcon className="w-4 h-4" strokeWidth={2.4} />}
      >
        <Link to="/abonnement/upgrade" className="inline-block">
          <AboButton variant={isActif ? 'primary' : 'accent'}>
            {isActif ? 'Prolonger mon abonnement' : 'Activer mon abonnement'}
          </AboButton>
        </Link>
      </Panel>
      <PaiementsHistorique paiements={paiements} />
    </div>
  );
}

export function Parametres() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "annees";
  const school = useSchool();
  const reduce = useReducedMotion();

  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "color-mix(in srgb, #5A6472 14%, transparent)", color: "#5A6472" }}>
          <SettingsIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">Paramètres</h1>
          <p className="ecole_m-muted text-[14px]">Organisation de l'année, matières et règles de notation</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label="Rubriques des paramètres" className="lg:sticky lg:top-4 lg:self-start">
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === current.id;
              return (
                <li key={t.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setParams({ tab: t.id })}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[14px] outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
                    active ? "font-semibold" : "ecole_m-muted hover:bg-[color-mix(in_srgb,var(--em-accent)_6%,transparent)]"
                    }`}>
                    {active && (
                      <motion.span
                        layoutId="parametres-nav-active"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: "color-mix(in srgb, var(--em-accent) 10%, transparent)" }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    {active && (
                      <motion.span
                        layoutId="parametres-nav-bar"
                        className="absolute left-0 top-1/2 hidden h-4 w-[3px] -translate-y-1/2 rounded-full lg:block"
                        style={{ background: "var(--em-accent)" }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    <Icon className={`relative h-[18px] w-[18px] shrink-0 ${active ? "text-[var(--em-accent)]" : ""}`} aria-hidden="true" />
                    <span className="relative flex-1">{t.label}</span>
                    {active && <ChevronRightIcon className="relative hidden h-4 w-4 text-[var(--em-accent)] lg:block" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--em-border)] pb-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--em-accent)]"
              style={{ background: "color-mix(in srgb, var(--em-accent) 12%, transparent)" }}>
              <CurrentIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold leading-tight">{current.label}</h2>
              <p className="ecole_m-muted text-[13px]">{current.description}</p>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: EASE }}>

              {tab === "annees" && (
                <ResourceView
                  load={listerAnnees}
                  deps={[]}
                  columns={[{ key: "libelle" }, { key: "date_debut", label: "Rentrée" }, { key: "date_fin", label: "Fin" }, { key: "statut" }, { key: "est_active", label: "Active" }]}
                  emptyTitle="Aucune année scolaire"
                  emptyText="Créez votre première année scolaire pour commencer."
                  emptyIcon={CalendarPlusIcon}
                  actions={(reload) => (
                    <FormAction
                      label="Nouvelle année"
                      icon={PlusIcon}
                      variant="primary"
                      fields={anneeFields}
                      onSubmit={creerAnnee}
                      successMessage="Année créée"
                      onDone={() => {
                        reload();
                        school.reload();
                      }} />
                  )}
                  detailTitle={(r) => str(r.libelle)}
                  detailSubtitle={(r) => r.est_active ? "Année active" : "Année scolaire"}
                  renderDetail={(r, ctx) => <AnneeDetail annee={r} reload={ctx.reload} />} />
              )}

              {tab === "matieres" && (
                <ResourceView
                  load={listerMatieres}
                  deps={[]}
                  columns={[
                    {
                      key: "libelle",
                      render: (r) => (
                        <span className="flex items-center gap-2.5">
                          <span className="h-3 w-3 shrink-0 rounded-full ring-2 ring-[var(--em-border)]" style={{ background: str(r.couleur_affichage) || "#c5ccd6" }} />
                          <span className="font-medium">{str(r.libelle)}</span>
                        </span>
                      )
                    },
                    { key: "code" },
                    { key: "categorie" }
                  ]}
                  emptyTitle="Aucune matière"
                  actions={(reload) => (
                    <FormAction label="Nouvelle matière" icon={PlusIcon} variant="primary" fields={matiereFields} onSubmit={creerMatiere} successMessage="Matière créée" onDone={reload} />
                  )}
                  detailTitle={(r) => str(r.libelle)}
                  rowActions={(r, reload) => (
                    <ConfirmAction
                      label="Supprimer"
                      icon={Trash2Icon}
                      iconOnly
                      size="sm"
                      variant="subtle"
                      danger
                      message={`Supprimer la matière ${str(r.libelle)} ?`}
                      confirmLabel="Supprimer"
                      run={() => supprimerMatiere(str(r.id))}
                      successMessage="Matière supprimée"
                      onDone={reload} />
                  )} />
              )}

              {tab === "baremes" && (
                <ResourceView
                  load={listerBaremes}
                  deps={[]}
                  columns={[{ key: "libelle" }, { key: "type_bareme", label: "Type" }, { key: "note_max" }, { key: "seuil_reussite" }]}
                  emptyTitle="Aucun barème"
                  actions={(reload) => (
                    <FormAction label="Nouveau barème" icon={PlusIcon} variant="primary" fields={baremeFields} modalSize="lg" onSubmit={creerBareme} successMessage="Barème créé" onDone={reload} />
                  )}
                  detailTitle={(r) => str(r.libelle)} />
              )}

              {tab === "types" && (
                <ResourceView
                  load={listerTypesEvaluation}
                  deps={[]}
                  columns={[{ key: "libelle" }, { key: "poids_dans_moyenne" }]}
                  emptyTitle="Aucun type d'évaluation"
                  actions={(reload) => (
                    <FormAction
                      label="Nouveau type"
                      icon={PlusIcon}
                      variant="primary"
                      fields={typeEvaluationFields}
                      onSubmit={creerTypeEvaluation}
                      successMessage="Type créé"
                      onDone={reload} />
                  )}
                  noDetail />
              )}

              {tab === "referentiel" && <ReferentielPanel />}
              {tab === "initialisation" && <InitialisationPanel />}
              {tab === "abonnement" && <AbonnementPanel />}
              
              {/* --- NOUVEL ONGLET APP MOBILE --- */}
              {tab === "mobile" && <MobileAppPromo />}
              
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}