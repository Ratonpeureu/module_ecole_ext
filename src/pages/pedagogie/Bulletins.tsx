import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EyeIcon, FileTextIcon, ListOrderedIcon, ScrollTextIcon, SendIcon, SendToBackIcon } from "lucide-react";
import { getApercuBulletin, getBulletinPdf, getClassementClasse, listerBulletins, listerEleves, publierBulletin, publierBulletinsClasseEtAttendre } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { ClassePicker, PeriodePicker } from "../../components/ui/ClassePicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { EmptyState } from "../../components/data/States";
import { PersonCell } from "../../components/data/PersonCell";
import { RankBadge } from "../../components/data/RankBadge";
import { AsyncButton } from "../../components/form/AsyncButton";
import { FormAction } from "../../components/form/FormAction";
import { eleveOnlyField } from "../../data/fields/pedagogie";
import { useLookup } from "../../hooks/useLookup";
import { F } from "../../utils/fieldBuilders";
import { openFile } from "../../utils/files";
import { fullName, str } from "../../utils/format";

const COLOR = "#E3008C";

export function Bulletins() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "bulletins";
  const [classeId, setClasseId] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const ready = !!classeId && !!periodeId;
  const eleves = useLookup(() => listerEleves(), fullName);
  const ctx = { classe_id: classeId, periode_id: periodeId };
  const waiting =
  <EmptyState icon={ScrollTextIcon} title="Choisissez une classe et une période" text="Les bulletins et le classement de la classe s'afficheront ici." />;

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={ScrollTextIcon} color={COLOR} title="Bulletins" subtitle="Aperçu, publication et classement" />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "bulletins", label: "Bulletins", icon: FileTextIcon },
          { id: "classement", label: "Classement", icon: ListOrderedIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <div className="space-y-4">
              <ContextBar
              icon={ScrollTextIcon}
              color={COLOR}
              title="Classe et période"
              text="La sélection s'applique aux bulletins et au classement."
              steps={[
              { label: "Classe", done: !!classeId },
              { label: "Période", done: !!periodeId }]
              }>
                <ClassePicker anneeId={anneeId} value={classeId} onChange={setClasseId} />
                <PeriodePicker anneeId={anneeId} value={periodeId} onChange={setPeriodeId} />
              </ContextBar>

              <TabStage id={tab}>
                {tab === "bulletins" ?
              <ResourceView
                load={() => listerBulletins(classeId, periodeId)}
                deps={[classeId, periodeId]}
                enabled={ready}
                disabledState={waiting}
                actions={(reload) =>
                ready ?
                <>
                          <FormAction
                    label="Aperçu d'un bulletin"
                    icon={EyeIcon}
                    fields={eleveOnlyField()}
                    submitLabel="Afficher"
                    successMessage="Aperçu calculé"
                    showResult
                    onSubmit={(b) => getApercuBulletin({ eleve_id: str(b.eleve_id), ...ctx })} />
                          <FormAction
                    label="Publier un bulletin"
                    icon={SendIcon}
                    fields={eleveOnlyField()}
                    submitLabel="Publier"
                    successMessage="Bulletin publié"
                    showResult
                    onSubmit={(b) => publierBulletin({ ...b, ...ctx })}
                    onDone={reload} />
                          <FormAction
                    label="Publier toute la classe"
                    icon={SendToBackIcon}
                    variant="primary"
                    fields={[F.bool("forcer", "Republier les bulletins déjà publiés")]}
                    submitLabel="Publier"
                    successMessage="Bulletins publiés"
                    showResult
                    onSubmit={(b) => publierBulletinsClasseEtAttendre({ ...ctx, forcer: b.forcer === true })}
                    onDone={reload} />
                        </> :
                null
                }
                columns={[
                { key: "eleve_id", label: "Élève", render: (r) => <PersonCell name={eleves.get(str(r.eleve_id)) ?? "Élève"} color={COLOR} /> },
                { key: "moyenne_generale", label: "Moyenne" },
                { key: "rang", render: (r) => <RankBadge value={r.rang} color={COLOR} /> },
                { key: "mention" },
                { key: "statut" }]
                }
                emptyTitle="Aucun bulletin pour cette période"
                detailTitle={(r) => eleves.get(str(r.eleve_id)) ?? "Bulletin"}
                rowActions={(r) =>
                <AsyncButton
                  label="Ouvrir le PDF"
                  icon={FileTextIcon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  onClick={async () => openFile(await getBulletinPdf(str(r.id)))} />
                } /> :

              <ResourceView
                load={() => getClassementClasse(classeId, periodeId)}
                deps={[classeId, periodeId]}
                enabled={ready}
                disabledState={waiting}
                rowKey={(r) => str(r.eleve_id)}
                columns={[
                { key: "rang", render: (r) => <RankBadge value={r.rang} color={COLOR} /> },
                { key: "nom", label: "Élève", render: (r) => <PersonCell name={fullName(r)} color={COLOR} /> },
                { key: "moyenne_generale", label: "Moyenne" }]
                }
                emptyTitle="Aucun classement disponible"
                detailTitle={fullName} />
              }
              </TabStage>
            </div>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}