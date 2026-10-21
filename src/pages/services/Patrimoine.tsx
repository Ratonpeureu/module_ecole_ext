import React from "react";
import { useSearchParams } from "react-router-dom";
import { BoxesIcon, DoorOpenIcon, LandmarkIcon, PackageSearchIcon, PlusIcon } from "lucide-react";
import { creerMaterielPedagogique, creerSalle, getCatalogueMaterielScolaire, listerMaterielPedagogique, listerSalles } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { Tabs } from "../../components/ui/Tabs";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { materielPedaFields, salleFields } from "../../data/fields/services";
import { str } from "../../utils/format";

const COLOR = "#486860";

function NameCell({ icon: Icon, label }: {icon: typeof DoorOpenIcon;label: string;}) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="truncate font-medium">{label}</span>
    </span>);
}

export function Patrimoine() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "salles";

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={LandmarkIcon} color={COLOR} title="Patrimoine" subtitle="Salles, matériel pédagogique et catalogue" />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "salles", label: "Salles", icon: DoorOpenIcon },
          { id: "materiel", label: "Matériel pédagogique", icon: BoxesIcon },
          { id: "catalogue", label: "Catalogue", icon: PackageSearchIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <TabStage id={tab}>
          {tab === "salles" &&
          <ResourceView
            load={listerSalles}
            deps={[]}
            actions={(reload) =>
            <FormAction label="Nouvelle salle" icon={PlusIcon} variant="primary" fields={salleFields} onSubmit={creerSalle} successMessage="Salle ajoutée" onDone={reload} />
            }
            emptyTitle="Aucune salle"
            emptyIcon={DoorOpenIcon}
            detailTitle={(r) => str(r.nom)} />
          }

          {tab === "materiel" &&
          <ResourceView
            load={listerMaterielPedagogique}
            deps={[]}
            actions={(reload) =>
            <FormAction label="Nouveau matériel" icon={PlusIcon} variant="primary" fields={materielPedaFields} modalSize="lg" onSubmit={creerMaterielPedagogique} successMessage="Matériel ajouté" onDone={reload} />
            }
            emptyTitle="Aucun matériel"
            emptyIcon={BoxesIcon}
            detailTitle={(r) => str(r.designation)} />
          }

          {tab === "catalogue" &&
          <ResourceView
            load={() => getCatalogueMaterielScolaire()}
            deps={[]}
            emptyTitle="Catalogue vide"
            emptyText="Chargez les catalogues communs depuis Paramètres › Initialisation."
            emptyIcon={PackageSearchIcon}
            detailTitle={(r) => str(r.libelle)} />
          }
        </TabStage>
      </Reveal>
    </PageStage>);
}