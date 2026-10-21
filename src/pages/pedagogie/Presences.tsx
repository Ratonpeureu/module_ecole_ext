import React, { useState } from "react";
import { CalendarCheckIcon, ClipboardListIcon } from "lucide-react";
import { faireAppel, getAppel, listerAppelsClasse } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { ClassePicker } from "../../components/ui/ClassePicker";
import { PageStage, Reveal } from "../../components/ui/Motion";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { ObjectView } from "../../components/data/ObjectView";
import { EmptyState } from "../../components/data/States";
import { FormAction } from "../../components/form/FormAction";
import { appelFields } from "../../data/fields/pedagogie";
import { formatDate, shiftISO, str, todayISO } from "../../utils/format";

const COLOR = "#107C10";

export function Presences() {
  const [classeId, setClasseId] = useState("");
  const [debut, setDebut] = useState(shiftISO(-14));
  const [fin, setFin] = useState(todayISO());

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={CalendarCheckIcon} color={COLOR} title="Présences" subtitle="Appels en classe et suivi des absences" />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <div className="space-y-4">
              <ContextBar
              icon={ClipboardListIcon}
              color={COLOR}
              title="Appels de la classe"
              text="Choisissez une classe et une période pour consulter les appels effectués."
              steps={[{ label: "Classe", done: !!classeId }]}>
                <ClassePicker anneeId={anneeId} value={classeId} onChange={setClasseId} />
                <label className="w-full sm:w-44">
                  <span className="ecole_m-label">Du</span>
                  <input type="date" className="ecole_m-input" value={debut} onChange={(e) => setDebut(e.target.value)} />
                </label>
                <label className="w-full sm:w-44">
                  <span className="ecole_m-label">Au</span>
                  <input type="date" className="ecole_m-input" value={fin} onChange={(e) => setFin(e.target.value)} />
                </label>
              </ContextBar>

              <ResourceView
              load={() => listerAppelsClasse(classeId, { date_debut: debut || undefined, date_fin: fin || undefined })}
              deps={[classeId, debut, fin]}
              enabled={!!classeId}
              disabledState={<EmptyState icon={ClipboardListIcon} title="Choisissez une classe" text="Les appels effectués s'afficheront ici." />}
              actions={(reload) =>
              classeId ?
              <FormAction
                label="Faire l'appel"
                icon={ClipboardListIcon}
                variant="primary"
                fields={appelFields(classeId)}
                modalSize="xl"
                onSubmit={faireAppel}
                successMessage="Appel enregistré"
                showResult
                onDone={reload} /> :
              null
              }
              emptyTitle="Aucun appel sur cette période"
              detailTitle={(r) => `Appel du ${formatDate(r.date_appel)}`}
              renderDetail={(r) =>
              <AsyncBlock load={() => getAppel(str(r.id))} deps={[str(r.id)]}>
                    {(d) => <ObjectView data={d} />}
                  </AsyncBlock>
              } />
            </div>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}