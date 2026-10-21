import React, { useState } from "react";
import { ShieldAlertIcon } from "lucide-react";
import { creerSanction, listerSanctionsEleve } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { ContextBar } from "../../components/layout/ContextBar";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal } from "../../components/ui/Motion";
import { EmptyState } from "../../components/data/States";
import { FormAction } from "../../components/form/FormAction";
import { sanctionFields } from "../../data/fields/eleves";
import { optEleves } from "../../utils/options";

const COLOR = "#9A0089";

export function Discipline() {
  const [eleveId, setEleveId] = useState("");

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={ShieldAlertIcon} color={COLOR} title="Discipline" subtitle="Sanctions disciplinaires" />
      </Reveal>

      <Reveal className="space-y-4">
        <ContextBar
          icon={ShieldAlertIcon}
          color={COLOR}
          title="Historique disciplinaire"
          text="Choisissez un élève pour consulter ses sanctions."
          steps={[{ label: "Élève", done: !!eleveId }]}>
          <LoadPicker label="Élève" value={eleveId} onChange={setEleveId} load={optEleves} searchable placeholder="Rechercher un élève" width="sm:w-80" />
        </ContextBar>

        <ResourceView
          load={() => listerSanctionsEleve(eleveId)}
          deps={[eleveId]}
          enabled={!!eleveId}
          disabledState={<EmptyState icon={ShieldAlertIcon} title="Choisissez un élève" text="Son historique disciplinaire s'affichera ici." />}
          actions={(reload) =>
          <FormAction label="Nouvelle sanction" icon={ShieldAlertIcon} variant="primary" fields={sanctionFields(true)} onSubmit={creerSanction} successMessage="Sanction enregistrée" onDone={reload} />
          }
          emptyTitle="Aucune sanction pour cet élève"
          detailTitle={() => "Sanction"} />
      </Reveal>
    </PageStage>);
}