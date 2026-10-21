import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpenIcon, PresentationIcon, UserPlusIcon, UsersIcon, UserCheckIcon } from "lucide-react";
import { creerEnseignant, listerClassesTitulaires, listerEnseignants, listerEnseignantsParMatiere } from "../../lib/api_ecole";
import { useDebounced } from "../../hooks/useAsync";
import { ModuleHero } from "../../components/layout/ModuleHero";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { PivotTabs } from "../../components/ui/PivotTabs";
import { TabTransition } from "../../components/ui/TabTransition";
import { SearchInput } from "../../components/ui/SearchInput";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { FormAction } from "../../components/form/FormAction";
import { EnseignantDetail } from "../../components/enseignants/EnseignantDetail";
import { enseignantCreateFields } from "../../data/fields/personnel";
import { AFFICHAGE_ACTIF } from "../../data/enums";
import { fromEnum } from "../../utils/options";
import { fullName, initials, str } from "../../utils/format";

const COLOR = "#8764B8";

export function Enseignants() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "equipe";
  const [q, setQ] = useState("");
  const [actif, setActif] = useState("true");
  const dq = useDebounced(q);

  return (
    <div className="space-y-6">
      <ModuleHero icon={PresentationIcon} color={COLOR} title="Enseignants" subtitle="Équipe pédagogique, affectations et charge horaire" />

      <PivotTabs
        layoutKey="enseignants"
        label="Rubriques des enseignants"
        tabs={[
        { id: "equipe", label: "Équipe", icon: UsersIcon },
        { id: "matieres", label: "Par matière", icon: BookOpenIcon },
        { id: "titulaires", label: "Titulaires de classe", icon: UserCheckIcon }]
        }
        value={tab}
        onChange={(t) => setParams({ tab: t })} />

      <WithAnnee>
        {(anneeId) =>
        <TabTransition id={tab}>
            {tab === "equipe" &&
          <ResourceView
            load={() => listerEnseignants({ q: dq || undefined, actif_seulement: actif === "true" })}
            deps={[dq, actif]}
            columns={[
            {
              key: "nom",
              label: "Enseignant",
              render: (r) =>
              <span className="flex items-center gap-3">
                      <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                  style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                        {initials(fullName(r))}
                      </span>
                      <span className="font-medium">{fullName(r)}</span>
                    </span>
            },
            { key: "specialite_principale", label: "Spécialité" },
            { key: "telephone" },
            { key: "nb_affectations_actives", label: "Matières confiées" },
            {
              key: "actif",
              render: (r) =>
              Number(r.actif) === 1 ?
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-accent-soft)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--em-accent)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--em-accent)]" aria-hidden="true" />
                        Actif
                      </span> :
              <span className="ecole_m-muted inline-flex items-center gap-1.5 rounded-full border border-[var(--em-border)] px-2.5 py-0.5 text-[12px] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
                        Inactif
                      </span>
            }]
            }
            toolbar={
            <>
                    <SearchInput value={q} onChange={setQ} placeholder="Nom ou spécialité" />
                    <LoadPicker label="Affichage" value={actif} onChange={setActif} options={fromEnum(AFFICHAGE_ACTIF)} width="sm:w-48" searchable={false} />
                  </>
            }
            actions={(reload) =>
            <FormAction
              label="Nouvel enseignant"
              icon={UserPlusIcon}
              variant="primary"
              fields={enseignantCreateFields(anneeId)}
              modalSize="xl"
              onSubmit={creerEnseignant}
              successMessage="Enseignant créé"
              showResult
              onDone={reload} />
            }
            emptyTitle="Aucun enseignant"
            emptyIcon={PresentationIcon}
            wide
            detailTitle={fullName}
            detailSubtitle={(r) => str(r.poste)}
            renderDetail={(r, ctx) => <EnseignantDetail enseignant={r} anneeId={anneeId} onChanged={ctx.reload} />} />
          }

            {tab === "matieres" &&
          <ResourceView load={() => listerEnseignantsParMatiere(anneeId)} deps={[anneeId]} emptyTitle="Aucune matière attribuée" detailTitle={(r) => str(r.libelle || r.matiere)} />
          }

            {tab === "titulaires" &&
          <ResourceView load={() => listerClassesTitulaires(anneeId)} deps={[anneeId]} emptyTitle="Aucune classe avec titulaire" detailTitle={(r) => str(r.libelle || r.classe_libelle)} />
          }
          </TabTransition>
        }
      </WithAnnee>
    </div>);
}