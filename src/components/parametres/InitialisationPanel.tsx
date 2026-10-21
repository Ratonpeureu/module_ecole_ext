import React from "react";
import { BookCopyIcon, DatabaseZapIcon, RefreshCwIcon, SparklesIcon, UsersRoundIcon, WrenchIcon, RocketIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  initialisationComplete,
  initialiserEtablissement,
  recalculerParcoursTousElevesEtAttendre,
  recalculerParcoursTousEnseignantsEtAttendre,
  seedCataloguesGlobaux } from
"../../lib/api_ecole";
import { useSchool } from "../../contexts/SchoolContext";
import { ConfirmAction } from "../form/ConfirmAction";

interface Item {
  title: string;
  text: string;
  icon: LucideIcon;
  run: () => Promise<unknown>;
  label: string;
}

export function InitialisationPanel() {
  const school = useSchool();

  const principal: Item = {
    title: "Initialisation complète",
    text: "Met en place en une seule fois toute la configuration de départ : référentiel, paramètres et catalogues.",
    icon: DatabaseZapIcon,
    run: initialisationComplete,
    label: "Lancer"
  };

  const miseEnPlace: Item[] = [{
    title: "Préparer l'établissement",
    text: "Crée les éléments de base nécessaires au fonctionnement de l'établissement.",
    icon: SparklesIcon,
    run: initialiserEtablissement,
    label: "Préparer"
  }, {
    title: "Catalogues communs",
    text: "Charge les catalogues partagés (matériel scolaire, catégories de dépenses…).",
    icon: BookCopyIcon,
    run: seedCataloguesGlobaux,
    label: "Charger"
  }];

  const maintenance: Item[] = [{
    title: "Mettre à jour le parcours de tous les élèves",
    text: "Recalcule l'historique scolaire complet de chaque élève. L'opération peut prendre quelques instants.",
    icon: RefreshCwIcon,
    run: recalculerParcoursTousElevesEtAttendre,
    label: "Mettre à jour"
  }, {
    title: "Mettre à jour le parcours de tous les enseignants",
    text: "Recalcule l'historique et les statistiques de chaque enseignant.",
    icon: UsersRoundIcon,
    run: recalculerParcoursTousEnseignantsEtAttendre,
    label: "Mettre à jour"
  }];

  const renderAction = (it: Item, variant?: "primary") =>
  <ConfirmAction
    label={it.label}
    title={it.title}
    message={it.text}
    run={it.run}
    showResult
    successMessage="Opération terminée"
    onDone={school.reload}
    {...variant ? { variant } : {}} />;

  const PrincipalIcon = principal.icon;

  return (
    <div className="space-y-8">
      {/* ── Action principale ───────────────────────────────────────── */}
      <section aria-labelledby="init-principal" className="ecole_m-card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
          <span className="ecole_m-tile h-14 w-14 shrink-0 rounded-xl shadow-sm" style={{ background: "var(--em-accent)" }}>
            <PrincipalIcon className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <RocketIcon className="h-4 w-4 text-[var(--em-accent)]" aria-hidden="true" />
              <span className="text-[12px] font-medium text-[var(--em-accent)]">Recommandé pour un nouvel établissement</span>
            </div>
            <h2 id="init-principal" className="text-[18px] font-semibold tracking-tight">{principal.title}</h2>
            <p className="ecole_m-muted mt-1 max-w-2xl text-[13px] leading-relaxed">{principal.text}</p>
          </div>
          <div className="shrink-0">{renderAction(principal, "primary")}</div>
        </div>
      </section>

      {/* ── Mise en place ───────────────────────────────────────────── */}
      <section aria-labelledby="init-miseenplace">
        <div className="mb-3 flex items-center gap-2">
          <SparklesIcon className="ecole_m-muted h-4 w-4" aria-hidden="true" />
          <h3 id="init-miseenplace" className="text-[14px] font-semibold">Mise en place étape par étape</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {miseEnPlace.map((it) => {
            const Icon = it.icon;
            return (
              <article key={it.title} className="ecole_m-card flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--em-accent)]"
                    style={{ background: "color-mix(in srgb, var(--em-accent) 12%, transparent)" }}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-semibold">{it.title}</h4>
                    <p className="ecole_m-muted mt-1 text-[13px] leading-relaxed">{it.text}</p>
                  </div>
                </div>
                <div className="mt-auto flex justify-end pt-4">{renderAction(it)}</div>
              </article>);
          })}
        </div>
      </section>

      {/* ── Maintenance ─────────────────────────────────────────────── */}
      <section aria-labelledby="init-maintenance">
        <div className="mb-3 flex items-center gap-2">
          <WrenchIcon className="ecole_m-muted h-4 w-4" aria-hidden="true" />
          <h3 id="init-maintenance" className="text-[14px] font-semibold">Maintenance des données</h3>
        </div>
        <div className="ecole_m-card divide-y divide-[var(--em-border)] overflow-hidden">
          {maintenance.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.title} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--em-border)]">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">{it.title}</p>
                  <p className="ecole_m-muted text-[13px]">{it.text}</p>
                </div>
                <div className="shrink-0">{renderAction(it)}</div>
              </div>);
          })}
        </div>
      </section>
    </div>);
}