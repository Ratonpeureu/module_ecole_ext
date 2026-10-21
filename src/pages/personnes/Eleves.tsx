import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCapIcon, UserPlusIcon, UsersIcon, UserXIcon } from "lucide-react";
import { creerEleve, listerEleves, listerElevesSansClasse } from "../../lib/api_ecole";
import { useDebounced } from "../../hooks/useAsync";
import { ModuleHero } from "../../components/layout/ModuleHero";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { PivotTabs } from "../../components/ui/PivotTabs";
import { TabTransition } from "../../components/ui/TabTransition";
import { SearchInput } from "../../components/ui/SearchInput";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { FormAction } from "../../components/form/FormAction";
import { EleveDetail } from "../../components/eleves/EleveDetail";
import { InscriptionResult } from "../../components/eleves/InscriptionResult";
import { eleveCreateFields } from "../../data/fields/eleves";
import { STATUT_ELEVE } from "../../data/enums";
import type { Column } from "../../types/ui";
import { fromEnum } from "../../utils/options";
import { fullName, initials, str } from "../../utils/format";

const COLOR = "#0F7B6C";

const nameColumn: Column = {
  key: "nom",
  label: "Élève",
  render: (r) =>
  <span className="flex items-center gap-3">
      <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
      style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
        {initials(fullName(r))}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{fullName(r)}</span>
        {str(r.matricule) ? <span className="ecole_m-muted block truncate text-[12px]">{str(r.matricule)}</span> : null}
      </span>
    </span>
};

export function Eleves() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "tous";
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("");
  const dq = useDebounced(q);

  return (
    <div className="space-y-6">
      <ModuleHero icon={GraduationCapIcon} color={COLOR} title="Élèves" subtitle="Dossiers, inscriptions, scolarité et suivi" />

      <PivotTabs
        layoutKey="eleves"
        label="Rubriques des élèves"
        tabs={[
        { id: "tous", label: "Tous les élèves", icon: UsersIcon },
        { id: "sans-classe", label: "Sans classe", icon: UserXIcon }]
        }
        value={tab}
        onChange={(t) => setParams({ tab: t })} />

      <WithAnnee>
        {(anneeId) =>
        <TabTransition id={tab}>
            {tab === "tous" ?
          <ResourceView
            load={() => listerEleves({ q: dq || undefined, statut: statut || undefined })}
            deps={[dq, statut]}
            columns={[{ key: "matricule" }, nameColumn, { key: "sexe" }, { key: "date_naissance" }, { key: "statut" }]}
            toolbar={
            <>
                    <SearchInput value={q} onChange={setQ} placeholder="Nom, prénom ou matricule" />
                    <LoadPicker label="Statut" value={statut} onChange={setStatut} options={fromEnum(STATUT_ELEVE)} placeholder="Tous" clearable width="sm:w-52" />
                  </>
            }
            actions={(reload) =>
            <FormAction
              label="Nouvel élève"
              icon={UserPlusIcon}
              variant="primary"
              description="L'élève est créé et inscrit directement dans sa classe."
              fields={eleveCreateFields(anneeId)}
              modalSize="lg"
              onSubmit={creerEleve}
              successMessage="Élève inscrit"
              showResult
              renderResult={(r) => <InscriptionResult result={r} anneeId={anneeId} />}
              onDone={reload} />
            }
            emptyTitle="Aucun élève trouvé"
            emptyIcon={GraduationCapIcon}
            wide
            detailTitle={fullName}
            detailSubtitle={(r) => `Matricule ${str(r.matricule)}`}
            renderDetail={(r, ctx) => <EleveDetail eleve={r} anneeId={anneeId} onChanged={ctx.reload} />} /> :

          <ResourceView
            load={listerElevesSansClasse}
            deps={[]}
            columns={[{ key: "matricule" }, nameColumn, { key: "statut" }]}
            emptyTitle="Tous les élèves ont une classe"
            wide
            detailTitle={fullName}
            detailSubtitle={(r) => `Matricule ${str(r.matricule)}`}
            renderDetail={(r, ctx) => <EleveDetail eleve={r} anneeId={anneeId} onChanged={ctx.reload} />} />
          }
          </TabTransition>
        }
      </WithAnnee>
    </div>);
}