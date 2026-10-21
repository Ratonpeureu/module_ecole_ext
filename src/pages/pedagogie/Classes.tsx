import React from "react";
import { PlusIcon, SchoolIcon } from "lucide-react";
import { creerClasseDepuisReferentiel, listerClasses } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { PageStage, Reveal } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { ClasseDetail } from "../../components/classes/ClasseDetail";
import { classeCreateFields } from "../../data/fields/pedagogie";
import { str } from "../../utils/format";

const COLOR = "#4F6BED";

export function Classes() {
  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={SchoolIcon} color={COLOR} title="Classes" subtitle="Classes, matières, organisation et matériel" />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <ResourceView
            load={() => listerClasses(anneeId)}
            deps={[anneeId]}
            columns={[
            {
              key: "libelle",
              label: "Classe",
              render: (r) =>
              <span className="flex items-center gap-3">
                      <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                        <SchoolIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate font-medium">{str(r.libelle)}</span>
                    </span>
            },
            { key: "effectif_max", label: "Capacité" },
            { key: "salle_habituelle", label: "Salle" },
            { key: "type_organisation_edt_effectif", label: "Organisation" },
            { key: "actif" }]
            }
            actions={(reload) =>
            <FormAction
              label="Nouvelle classe"
              icon={PlusIcon}
              variant="primary"
              fields={classeCreateFields(anneeId)}
              onSubmit={creerClasseDepuisReferentiel}
              successMessage="Classe créée"
              showResult
              onDone={reload} />
            }
            emptyTitle="Aucune classe pour cette année"
            emptyIcon={SchoolIcon}
            wide
            detailTitle={(r) => str(r.libelle)}
            renderDetail={(r) => <ClasseDetail classe={r} anneeId={anneeId} />} />
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}