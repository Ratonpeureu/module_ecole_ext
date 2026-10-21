import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardCheckIcon, GaugeIcon, InboxIcon, UserCheckIcon, UserPlusIcon } from "lucide-react";
import { convertirCandidature, creerCandidature, getCandidature, listerCandidatures, statuerCandidature } from "../../lib/api_ecole";
import { ModuleHero } from "../../components/layout/ModuleHero";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { PivotTabs } from "../../components/ui/PivotTabs";
import { TabTransition } from "../../components/ui/TabTransition";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { ObjectView } from "../../components/data/ObjectView";
import { FormAction } from "../../components/form/FormAction";
import { RemplissageList } from "../../components/dashboard/RemplissageList";
import { candidatureFields, convertirFields, statuerFields } from "../../data/fields/personnel";
import { STATUT_CANDIDATURE } from "../../data/enums";
import { fromEnum } from "../../utils/options";
import { initials, str } from "../../utils/format";

const COLOR = "#DA3B01";

const nom = (r: Record<string, unknown>) => `${str(r.prenom_candidat)} ${str(r.nom_candidat)}`.trim();

export function Admissions() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "candidatures";
  const [statut, setStatut] = useState("");

  return (
    <div className="space-y-6">
      <ModuleHero icon={UserPlusIcon} color={COLOR} title="Admissions" subtitle="Candidatures et places disponibles" />

      <PivotTabs
        layoutKey="admissions"
        label="Rubriques des admissions"
        tabs={[
        { id: "candidatures", label: "Candidatures", icon: InboxIcon },
        { id: "places", label: "Places disponibles", icon: GaugeIcon }]
        }
        value={tab}
        onChange={(t) => setParams({ tab: t })} />

      <WithAnnee>
        {(anneeId) =>
        <TabTransition id={tab}>
            {tab === "candidatures" ?
          <ResourceView
            load={() => listerCandidatures(statut || undefined)}
            deps={[statut]}
            columns={[
            {
              key: "nom_candidat",
              label: "Candidat",
              render: (r) =>
              <span className="flex items-center gap-3">
                      <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                  style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                        {initials(nom(r))}
                      </span>
                      <span className="font-medium">{nom(r)}</span>
                    </span>
            },
            { key: "date_naissance" },
            { key: "nom_parent", label: "Parent" },
            { key: "telephone_parent", label: "Téléphone" },
            { key: "statut" }]
            }
            toolbar={<LoadPicker label="Statut" value={statut} onChange={setStatut} options={fromEnum(STATUT_CANDIDATURE)} placeholder="Tous" clearable />}
            actions={(reload) =>
            <FormAction label="Nouvelle candidature" icon={UserPlusIcon} variant="primary" fields={candidatureFields(anneeId)} modalSize="lg" onSubmit={creerCandidature} successMessage="Candidature enregistrée" onDone={reload} />
            }
            emptyTitle="Aucune candidature"
            detailTitle={nom}
            renderDetail={(r, ctx) =>
            <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--em-border)] bg-[color-mix(in_srgb,var(--em-accent)_4%,transparent)] p-3">
                      <FormAction label="Changer le statut" icon={ClipboardCheckIcon} size="sm" fields={statuerFields} onSubmit={(b) => statuerCandidature(str(r.id), b)} successMessage="Statut mis à jour" onDone={ctx.reload} />
                      <FormAction
                  label="Inscrire comme élève"
                  icon={UserCheckIcon}
                  size="sm"
                  variant="primary"
                  fields={convertirFields(anneeId)}
                  onSubmit={(b) => convertirCandidature(str(r.id), b)}
                  successMessage="Élève inscrit"
                  showResult
                  onDone={ctx.reload} />
                    </div>
                    <AsyncBlock load={() => getCandidature(str(r.id))} deps={[str(r.id)]}>
                      {(d) => <ObjectView data={d} />}
                    </AsyncBlock>
                  </div>
            } /> :

          <section className="ecole_m-card p-5 md:p-6" aria-labelledby="places-title">
                <div className="mb-5 flex items-center gap-3">
                  <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                    <GaugeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="places-title" className="text-[15px] font-semibold leading-tight">Places disponibles</h2>
                    <p className="ecole_m-muted text-[13px]">Effectifs inscrits par rapport à la capacité de chaque classe</p>
                  </div>
                </div>
                <RemplissageList anneeId={anneeId} />
              </section>
          }
          </TabTransition>
        }
      </WithAnnee>
    </div>);
}