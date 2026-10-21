import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRightLeftIcon, BookOpenIcon, BookPlusIcon, BookUpIcon, LibraryIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { creerOuvrage, emprunterOuvrage, listerEmprunts, listerOuvrages, retournerEmprunt, supprimerOuvrage } from "../../lib/api_ecole";
import { useDebounced } from "../../hooks/useAsync";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { SearchInput } from "../../components/ui/SearchInput";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { ConfirmAction } from "../../components/form/ConfirmAction";
import { FormAction } from "../../components/form/FormAction";
import { empruntFields, ouvrageFields } from "../../data/fields/services";
import { STATUT_EMPRUNT } from "../../data/enums";
import { fromEnum } from "../../utils/options";
import { str } from "../../utils/format";

const COLOR = "#8E562E";

export function Bibliotheque() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "ouvrages";
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("");
  const dq = useDebounced(q);

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={LibraryIcon} color={COLOR} title="Bibliothèque" subtitle="Ouvrages et emprunts" />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "ouvrages", label: "Ouvrages", icon: BookOpenIcon },
          { id: "emprunts", label: "Emprunts", icon: ArrowRightLeftIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <TabStage id={tab}>
          {tab === "ouvrages" ?
          <>
              <ContextBar icon={BookOpenIcon} color={COLOR} title="Fonds documentaire" text="Recherchez par titre, auteur ou ISBN. Prêtez un ouvrage directement depuis sa ligne.">
                <SearchInput value={q} onChange={setQ} placeholder="Titre, auteur, ISBN" />
              </ContextBar>
              <ResourceView
              load={() => listerOuvrages(dq || undefined)}
              deps={[dq]}
              columns={[
              {
                key: "titre",
                render: (r) =>
                <span className="flex min-w-0 items-center gap-3">
                        <span
                    className="grid h-9 w-7 shrink-0 place-items-center rounded-[4px]"
                    style={{ background: `color-mix(in srgb, ${COLOR} 16%, transparent)`, color: COLOR }}>
                          <BookOpenIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span className="truncate font-medium">{str(r.titre)}</span>
                      </span>
              },
              { key: "auteur" },
              { key: "categorie" },
              { key: "nb_exemplaires_total", label: "Exemplaires" },
              { key: "nb_exemplaires_disponibles", label: "Disponibles" }]
              }
              actions={(reload) =>
              <FormAction label="Nouvel ouvrage" icon={BookPlusIcon} variant="primary" fields={ouvrageFields} onSubmit={creerOuvrage} successMessage="Ouvrage ajouté" onDone={reload} />
              }
              emptyTitle="Aucun ouvrage"
              detailTitle={(r) => str(r.titre)}
              renderDetail={undefined}
              rowActions={(r, reload) =>
              <>
                    <FormAction
                  label="Prêter"
                  icon={BookUpIcon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  fields={empruntFields(str(r.id))}
                  onSubmit={(b) => emprunterOuvrage({ ...b, ouvrage_id: str(r.id) })}
                  successMessage="Prêt enregistré"
                  onDone={reload} />
                    <ConfirmAction
                  label="Supprimer"
                  icon={Trash2Icon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  danger
                  message={`Supprimer « ${str(r.titre)} » ?`}
                  confirmLabel="Supprimer"
                  run={() => supprimerOuvrage(str(r.id))}
                  successMessage="Ouvrage supprimé"
                  onDone={reload} />
                  </>
              } />
            </> :

          <>
              <ContextBar icon={ArrowRightLeftIcon} color={COLOR} title="Prêts en cours et historique" text="Enregistrez le retour d'un ouvrage depuis sa ligne.">
                <LoadPicker label="Statut" value={statut} onChange={setStatut} options={fromEnum(STATUT_EMPRUNT)} placeholder="Tous" clearable />
              </ContextBar>
              <ResourceView
              load={() => listerEmprunts({ statut: statut || undefined })}
              deps={[statut]}
              actions={(reload) =>
              <FormAction label="Nouveau prêt" icon={BookUpIcon} variant="primary" fields={empruntFields()} onSubmit={emprunterOuvrage} successMessage="Prêt enregistré" onDone={reload} />
              }
              emptyTitle="Aucun emprunt"
              detailTitle={() => "Emprunt"}
              rowActions={(r, reload) =>
              str(r.statut) !== "rendu" ?
              <ConfirmAction
                label="Retour"
                icon={RotateCcwIcon}
                iconOnly
                size="sm"
                variant="subtle"
                message="Confirmer le retour de l'ouvrage ?"
                confirmLabel="Confirmer"
                run={() => retournerEmprunt(str(r.id))}
                successMessage="Retour enregistré"
                onDone={reload} /> :
              null
              } />
            </>
          }
        </TabStage>
      </Reveal>
    </PageStage>);
}