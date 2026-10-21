import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClockIcon, CalendarRangeIcon, ClockIcon, HistoryIcon, ListPlusIcon, PlusIcon, RepeatIcon, SearchCheckIcon, UserIcon, XIcon } from "lucide-react";
import {
  creerCreneau,
  creerCreneauxBulk,
  getEdtClasse,
  getEdtClasseADate,
  getEdtEnseignant,
  getHistoriqueEdtClasse,
  listerMatieresClasse,
  remplacerCreneau,
  verifierConflitsCreneau } from
"../../lib/api_ecole";
import { useAsync, useTick } from "../../hooks/useAsync";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { PanelHeader } from "../../components/layout/PanelHeader";
import { Tabs } from "../../components/ui/Tabs";
import { ClassePicker } from "../../components/ui/ClassePicker";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { EdtGrid } from "../../components/data/EdtGrid";
import { EmptyState } from "../../components/data/States";
import { FormAction } from "../../components/form/FormAction";
import { bulkFields, creneauFields, remplacerCreneauFields } from "../../data/fields/pedagogie";
import { optEnseignants } from "../../utils/options";
import { formatDate, formatNumber, obj, str } from "../../utils/format";

const COLOR = "#0099BC";

function ClasseActions({ classeId, onDone }: {classeId: string;onDone: () => void;}) {
  const { data } = useAsync(() => listerMatieresClasse(classeId), [classeId]);
  const matieres = (data ?? []).map((m) => ({ value: str(m.matiere_classe_id), label: str(m.matiere) }));
  return (
    <>
      <FormAction label="Vérifier un horaire" icon={SearchCheckIcon} fields={creneauFields(classeId, false)} submitLabel="Vérifier" successMessage="Vérification terminée" showResult onSubmit={verifierConflitsCreneau} />
      <FormAction label="Plusieurs créneaux" icon={ListPlusIcon} fields={bulkFields(matieres)} modalSize="xl" onSubmit={(b) => creerCreneauxBulk(classeId, b)} successMessage="Créneaux créés" showResult onDone={onDone} />
      <FormAction label="Nouveau créneau" icon={PlusIcon} variant="primary" fields={creneauFields(classeId)} onSubmit={creerCreneau} successMessage="Créneau créé" showResult onDone={onDone} />
    </>);
}

function Chip({ children }: {children: React.ReactNode;}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ background: `color-mix(in srgb, ${COLOR} 12%, transparent)`, color: COLOR }}>
      {children}
    </span>);
}

export function EmploiDuTemps() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "classe";
  const [classeId, setClasseId] = useState("");
  const [dateRef, setDateRef] = useState("");
  const [ensId, setEnsId] = useState("");
  const [tick, bump] = useTick();

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={CalendarClockIcon} color={COLOR} title="Emploi du temps" subtitle="Créneaux des classes et plannings des enseignants" />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "classe", label: "Par classe", icon: CalendarRangeIcon },
          { id: "historique", label: "Historique des changements", icon: HistoryIcon },
          { id: "enseignant", label: "Par enseignant", icon: UserIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <TabStage id={tab}>
              {tab === "classe" &&
            <>
                  <ContextBar
                icon={CalendarRangeIcon}
                color={COLOR}
                title="Emploi du temps de la classe"
                text="Choisissez une date pour consulter l'emploi du temps tel qu'il était à ce jour-là."
                steps={[{ label: "Classe", done: !!classeId }]}
                actions={classeId ? <ClasseActions classeId={classeId} onDone={bump} /> : null}>
                    <ClassePicker anneeId={anneeId} value={classeId} onChange={setClasseId} />
                    <label className="w-full sm:w-48">
                      <span className="ecole_m-label">À la date du</span>
                      <input type="date" className="ecole_m-input" value={dateRef} onChange={(e) => setDateRef(e.target.value)} />
                    </label>
                  </ContextBar>

                  <div className="ecole_m-card overflow-hidden">
                    {classeId ?
                <>
                        <PanelHeader
                    icon={CalendarRangeIcon}
                    color={COLOR}
                    title="Grille hebdomadaire"
                    meta={
                    dateRef ?
                    <>
                                <Chip>Au {formatDate(dateRef)}</Chip>
                                <button
                        type="button"
                        onClick={() => setDateRef("")}
                        className="ecole_m-muted grid h-7 w-7 place-items-center rounded-md transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--em-accent)_10%,transparent)]"
                        aria-label="Retirer la date">
                                  <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </> :
                    null
                    } />
                        <div className="p-5">
                          <AsyncBlock
                      load={() => dateRef ? getEdtClasseADate(classeId, dateRef) : getEdtClasse(classeId)}
                      deps={[classeId, dateRef, tick]}
                      isEmpty={() => false}>
                            {(d) => <EdtGrid grille={obj(d.grille ?? d)} />}
                          </AsyncBlock>
                        </div>
                      </> :
                <EmptyState icon={CalendarRangeIcon} title="Choisissez une classe" text="L'emploi du temps de la classe s'affichera ici." />
                }
                  </div>
                </>
            }

              {tab === "historique" &&
            <>
                  <ContextBar
                icon={HistoryIcon}
                color={COLOR}
                title="Historique des créneaux"
                text="Les créneaux en vigueur peuvent être modifiés à partir d'une date donnée."
                steps={[{ label: "Classe", done: !!classeId }]}>
                    <ClassePicker anneeId={anneeId} value={classeId} onChange={setClasseId} />
                  </ContextBar>
                  <ResourceView
                load={() => getHistoriqueEdtClasse(classeId)}
                deps={[classeId, tick]}
                enabled={!!classeId}
                disabledState={<EmptyState icon={HistoryIcon} title="Choisissez une classe" />}
                rowKey={(r) => str(r.creneau_id)}
                columns={[
                { key: "matiere" },
                { key: "jour_semaine", label: "Jour" },
                { key: "heure_debut" },
                { key: "heure_fin" },
                { key: "salle" },
                { key: "date_debut_validite", label: "Depuis" },
                { key: "actif_actuellement", label: "En vigueur" }]
                }
                emptyTitle="Aucun créneau"
                noDetail
                rowActions={(r, reload) =>
                r.actif_actuellement ?
                <FormAction
                  label="Modifier ce créneau"
                  icon={RepeatIcon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  fields={remplacerCreneauFields()}
                  onSubmit={(b) => remplacerCreneau(str(r.creneau_id), b)}
                  successMessage="Créneau modifié"
                  onDone={reload} /> :
                null
                } />
                </>
            }

              {tab === "enseignant" &&
            <>
                  <ContextBar
                icon={UserIcon}
                color={COLOR}
                title="Planning d'un enseignant"
                steps={[{ label: "Enseignant", done: !!ensId }]}>
                    <LoadPicker label="Enseignant" value={ensId} onChange={setEnsId} load={optEnseignants} searchable placeholder="Rechercher un enseignant" width="sm:w-80" />
                  </ContextBar>

                  <div className="ecole_m-card overflow-hidden">
                    {ensId ?
                <AsyncBlock load={() => getEdtEnseignant(ensId)} deps={[ensId]}>
                        {(d) =>
                  <>
                            <PanelHeader
                      icon={CalendarRangeIcon}
                      color={COLOR}
                      title="Planning hebdomadaire"
                      meta={
                      <Chip>
                                  <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatNumber(d.total_heures_semaine)} heure(s) par semaine
                                </Chip>
                      } />
                            <div className="p-5">
                              <EdtGrid grille={obj(d.grille)} />
                            </div>
                          </>
                  }
                      </AsyncBlock> :
                <EmptyState icon={UserIcon} title="Choisissez un enseignant" text="Son planning de la semaine s'affichera ici." />
                }
                  </div>
                </>
            }
            </TabStage>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}