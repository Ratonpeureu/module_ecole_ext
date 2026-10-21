import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ActivityIcon, PresentationIcon, RefreshCwIcon, SchoolIcon, TrendingUpIcon, UsersRoundIcon } from "lucide-react";
import { getClassementClasses, getClassementCombinaisonsProfs, getClassementEnseignants, recalculerCombinaisonsProfs, recalculerStatsClasse } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { AsyncButton } from "../../components/form/AsyncButton";
import { FIABILITE, TRI_ENSEIGNANTS } from "../../data/enums";
import { fromEnum } from "../../utils/options";
import { str } from "../../utils/format";

const COLOR = "#3A5BD9";

export function Analyses() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "enseignants";
  const [tri, setTri] = useState("");
  const [fiab, setFiab] = useState("");

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={TrendingUpIcon} color={COLOR} title="Analyses" subtitle="Classements et indicateurs de réussite" />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "enseignants", label: "Enseignants", icon: PresentationIcon },
          { id: "classes", label: "Classes", icon: SchoolIcon },
          { id: "equipes", label: "Équipes d'enseignants", icon: UsersRoundIcon },
          { id: "absences", label: "Absentéisme", icon: ActivityIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <TabStage id={tab}>
              {tab === "enseignants" &&
            <>
                  <ContextBar
                icon={PresentationIcon}
                color={COLOR}
                title="Classement des enseignants"
                text="Triez selon le score de performance, la moyenne des élèves ou le taux de réussite.">
                    <LoadPicker label="Trier par" value={tri} onChange={setTri} options={fromEnum(TRI_ENSEIGNANTS)} placeholder="Par défaut" clearable />
                  </ContextBar>
                  <ResourceView
                load={() => getClassementEnseignants(anneeId, tri || undefined)}
                deps={[anneeId, tri]}
                emptyTitle="Aucune statistique"
                emptyText="Recalculez les statistiques depuis la fiche d'un enseignant."
                detailTitle={(r) => str(r.nom_complet) || "Enseignant"} />
                </>
            }

              {tab === "classes" &&
            <>
                  <ContextBar
                icon={SchoolIcon}
                color={COLOR}
                title="Classement des classes"
                text="Utilisez le bouton de recalcul d'une ligne pour actualiser les indicateurs de la classe." />
                  <ResourceView
                load={() => getClassementClasses(anneeId)}
                deps={[anneeId]}
                emptyTitle="Aucune statistique"
                detailTitle={(r) => str(r.classe_libelle || r.libelle) || "Classe"}
                rowActions={(r, reload) =>
                <AsyncButton
                  label="Recalculer"
                  icon={RefreshCwIcon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  successMessage="Statistiques mises à jour"
                  onClick={async () => {await recalculerStatsClasse(str(r.classe_id), anneeId);reload();}} />
                } />
                </>
            }

              {tab === "equipes" &&
            <>
                  <ContextBar
                icon={UsersRoundIcon}
                color={COLOR}
                title="Classement des équipes d'enseignants"
                text="Filtrez selon la fiabilité minimale de l'analyse.">
                    <LoadPicker label="Fiabilité minimale" value={fiab} onChange={setFiab} options={fromEnum(FIABILITE)} placeholder="Toutes" clearable />
                  </ContextBar>
                  <ResourceView
                load={() => getClassementCombinaisonsProfs(fiab || undefined)}
                deps={[fiab]}
                actions={(reload) =>
                <AsyncButton
                  label="Recalculer"
                  icon={RefreshCwIcon}
                  successMessage="Classement mis à jour"
                  onClick={async () => {await recalculerCombinaisonsProfs();reload();}} />
                }
                emptyTitle="Aucune équipe analysée"
                detailTitle={() => "Équipe d'enseignants"} />
                </>
            }

              {tab === "absences"}
            </TabStage>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}