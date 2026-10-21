import React from "react";
import { GitBranchIcon, LayersIcon, NetworkIcon } from "lucide-react";
import { listerCycles, listerNiveaux, listerSeries } from "../../lib/api_ecole";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { EmptyState } from "../data/States";
import { ResourceView } from "../layout/ResourceView";
import { Section } from "../layout/Section";
import { ObjectView } from "../data/ObjectView";
import { str } from "../../utils/format";

export function ReferentielPanel() {
  return (
    <div className="space-y-8">
      {/* ── Cycles & niveaux ────────────────────────────────────────── */}
      <section aria-labelledby="ref-cycles" className="space-y-3">
        <header className="flex items-center gap-3">
          <span className="ecole_m-tile h-9 w-9 rounded-lg" style={{ background: "var(--em-accent)" }}>
            <NetworkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 id="ref-cycles" className="text-[15px] font-semibold leading-tight">Cycles et niveaux</h2>
            <p className="ecole_m-muted text-[13px]">Sélectionnez un cycle pour consulter ses niveaux.</p>
          </div>
        </header>

        <ResourceView
          load={listerCycles}
          deps={[]}
          emptyTitle="Aucun cycle"
          emptyText="Lancez l'initialisation de l'établissement pour charger le référentiel."
          detailTitle={(r) => str(r.libelle)}
          detailSubtitle={() => "Niveaux du cycle"}
          renderDetail={(r) =>
          <div className="space-y-6">
              <div className="rounded-lg border border-[var(--em-border)] p-4">
                <ObjectView data={r} />
              </div>
              <Section title="Niveaux">
                <div className="mb-3 flex items-center gap-2">
                  <LayersIcon className="ecole_m-muted h-4 w-4" aria-hidden="true" />
                  <p className="ecole_m-muted text-[13px]">Niveaux rattachés à ce cycle.</p>
                </div>
                <AsyncBlock
                load={() => listerNiveaux(str(r.id))}
                deps={[str(r.id)]}
                empty={<EmptyState compact title="Aucun niveau" />}>
                  {(rows) =>
                <div className="overflow-hidden rounded-lg border border-[var(--em-border)]">
                      <MiniTable rows={rows} />
                    </div>
                }
                </AsyncBlock>
              </Section>
            </div>
          } />
      </section>

      <hr className="border-[var(--em-border)]" />

      {/* ── Séries ──────────────────────────────────────────────────── */}
      <section aria-labelledby="ref-series" className="space-y-3">
        <header className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--em-accent)]"
            style={{ background: "color-mix(in srgb, var(--em-accent) 12%, transparent)" }}>
            <GitBranchIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 id="ref-series" className="text-[15px] font-semibold leading-tight">Séries</h2>
            <p className="ecole_m-muted text-[13px]">Filières proposées pour les niveaux à séries.</p>
          </div>
        </header>
        <ResourceView load={listerSeries} deps={[]} emptyTitle="Aucune série" noDetail />
      </section>
    </div>);
}