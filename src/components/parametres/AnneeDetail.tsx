import React from "react";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  InfoIcon,
  LayersIcon,
  PowerIcon } from
"lucide-react";
import { activerAnnee, creerPeriode, listerPeriodes, promouvoirAnnee } from "../../lib/api_ecole";
import { useSchool } from "../../contexts/SchoolContext";
import type { Row } from "../../types/ui";
import { periodeFields, promotionFields } from "../../data/fields/parametres";
import { STATUT_ANNEE } from "../../data/enums";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { EmptyState } from "../data/States";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { useTick } from "../../hooks/useAsync";
import { str } from "../../utils/format";

export function AnneeDetail({ annee, reload }: {annee: Row;reload: () => void;}) {
  const id = str(annee.id);
  const school = useSchool();
  const [tick, bump] = useTick();

  const refresh = () => {
    reload();
    school.reload();
  };

  const libelle = str(annee.libelle);
  const statut = str(annee.statut);
  const debut = str(annee.date_debut);
  const fin = str(annee.date_fin);

  return (
    <div className="space-y-6">
      {/* ── En-tête de l'année ───────────────────────────────────────── */}
      <header className="ecole_m-card overflow-hidden">
        <div className="flex flex-wrap items-start gap-4 p-5">
          <span
            className="ecole_m-tile h-12 w-12 shrink-0 rounded-lg shadow-sm"
            style={{ background: "var(--em-accent)" }}>
            <CalendarRangeIcon className="h-6 w-6" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[20px] font-semibold leading-tight tracking-tight">{libelle}</h2>

              {annee.est_active ?
              <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--em-accent)_12%,transparent)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--em-accent)]">
                  <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  Année active
                </span> :
              null}

              {statut ?
              <span className="inline-flex items-center rounded-full border border-[var(--em-border)] px-2.5 py-0.5 text-[12px] font-medium">
                  {STATUT_ANNEE[statut] ?? statut}
                </span> :
              null}
            </div>

            {debut || fin ?
            <p className="ecole_m-muted mt-1.5 flex items-center gap-1.5 text-[13px]">
                <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{debut || "—"}</span>
                <span aria-hidden="true">→</span>
                <span>{fin || "—"}</span>
              </p> :
            null}
          </div>
        </div>

        {/* Barre de commandes façon Windows 11 */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--em-border)] bg-[color-mix(in_srgb,var(--em-accent)_4%,transparent)] px-5 py-3">
          {!annee.est_active &&
          <ConfirmAction
            label="Définir comme année active"
            icon={PowerIcon}
            variant="primary"
            message={`L'année ${str(annee.libelle)} deviendra l'année de travail par défaut.`}
            run={() => activerAnnee(id)}
            successMessage="Année activée"
            onDone={refresh} />
          }
          <FormAction
            label="Passage en année supérieure"
            icon={ArrowUpRightIcon}
            description="Inscrivez automatiquement les élèves de cette année dans les classes de l'année suivante."
            fields={promotionFields(id)}
            modalSize="xl"
            submitLabel="Lancer le passage"
            successMessage="Passage effectué"
            showResult
            onSubmit={(b) => promouvoirAnnee(id, b)}
            onDone={refresh} />
        </div>
      </header>

      {/* ── Contenu : périodes (principal) + informations ───────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0">
          <Section
            title="Périodes"
            actions={
            <FormAction
              label="Ajouter une période"
              icon={CalendarPlusIcon}
              size="sm"
              fields={periodeFields}
              onSubmit={(b) => creerPeriode({ ...b, annee_scolaire_id: id })}
              successMessage="Période ajoutée"
              onDone={bump} />
            }>
            <div className="mb-3 flex items-center gap-2">
              <LayersIcon className="ecole_m-muted h-4 w-4" aria-hidden="true" />
              <p className="ecole_m-muted text-[13px]">Trimestres ou semestres qui découpent l'année scolaire.</p>
            </div>
            <AsyncBlock
              load={() => listerPeriodes(id)}
              deps={[id, tick]}
              empty={<EmptyState compact title="Aucune période" text="Ajoutez les trimestres ou semestres de l'année." />}>
              {(rows) =>
              <div className="overflow-hidden rounded-lg border border-[var(--em-border)]">
                  <MiniTable
                  rows={rows}
                  columns={[{ key: "libelle" }, { key: "ordre" }, { key: "date_debut" }, { key: "date_fin" }, { key: "bulletins_publies" }]} />
                </div>
              }
            </AsyncBlock>
          </Section>
        </div>

        <aside className="min-w-0">
          <div className="ecole_m-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <InfoIcon className="h-4 w-4 text-[var(--em-accent)]" aria-hidden="true" />
              <h3 className="text-[14px] font-semibold">Informations</h3>
            </div>
            <ObjectView data={annee} />
          </div>
        </aside>
      </div>
    </div>);
}