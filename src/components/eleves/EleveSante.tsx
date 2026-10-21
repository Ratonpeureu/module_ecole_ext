import React from "react";
import { BellRingIcon, CalendarXIcon, ClipboardPlusIcon, ShieldAlertIcon, ShieldPlusIcon } from "lucide-react";
import {
  creerProtocoleUrgence,
  creerSanction,
  enregistrerVisiteInfirmerie,
  getContactUrgenceEleve,
  getJournalNotifications,
  getProtocoleUrgence,
  listerSanctionsEleve,
  listerSignatures,
  listerVisitesInfirmerie,
  notifierAbsence,
  notifierUrgenceSante,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { absenceFields, protocoleFields, sanctionFields, urgenceFields, visiteFields } from "../../data/fields/eleves";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { EmptyState } from "../data/States";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { Stagger, StaggerItem } from "./EleveMotion";

export function EleveSante({ eleveId, eleveNom }: { eleveId: string; eleveNom: string }) {
  const [tick, bump] = useTick();
  const withE = { eleve_id: eleveId };

  return (
    <Stagger className="space-y-5">
      {/* Urgence : les deux blocs critiques côte à côte */}
      <div className="grid gap-5 lg:grid-cols-2">
        <StaggerItem>
          <Section title="Contact d'urgence">
            <AsyncBlock
              load={() => getContactUrgenceEleve(eleveId)}
              deps={[eleveId]}
              isEmpty={(d) => !d}
              empty={<EmptyState compact title="Aucun contact renseigné" />}
            >
              {(c) => <ObjectView data={c} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>

        <StaggerItem>
          <Section
            title="Protocole d'urgence"
            actions={
              <FormAction
                label="Définir un protocole"
                icon={ShieldPlusIcon}
                size="sm"
                fields={protocoleFields(false)}
                modalSize="lg"
                onSubmit={(b) => creerProtocoleUrgence({ ...b, ...withE })}
                successMessage="Protocole enregistré"
                onDone={bump}
              />
            }
          >
            <AsyncBlock
              load={() => getProtocoleUrgence(eleveId)}
              deps={[eleveId, tick]}
              isEmpty={(d) => !d}
              empty={<EmptyState compact title="Aucun protocole" />}
            >
              {(p) => <ObjectView data={p} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>
      </div>

      <StaggerItem>
        <Section
          title="Messages aux familles"
          actions={
            <>
              <FormAction
                label="Signaler une absence"
                icon={CalendarXIcon}
                size="sm"
                fields={absenceFields(false)}
                onSubmit={(b) => notifierAbsence({ ...b, ...withE, eleve_nom: eleveNom })}
                successMessage="Famille prévenue"
                showResult
                onDone={bump}
              />
              <FormAction
                label="Alerte santé"
                icon={BellRingIcon}
                size="sm"
                variant="danger"
                fields={urgenceFields(false)}
                onSubmit={(b) => notifierUrgenceSante({ ...b, ...withE, eleve_nom: eleveNom })}
                successMessage="Alerte envoyée"
                showResult
                onDone={bump}
              />
            </>
          }
        >
          <AsyncBlock
            load={() => getJournalNotifications(eleveId)}
            deps={[eleveId, tick]}
            empty={<EmptyState compact title="Aucun message envoyé" />}
          >
            {(rows) => <MiniTable rows={rows} />}
          </AsyncBlock>
        </Section>
      </StaggerItem>

      <div className="grid gap-5 xl:grid-cols-2">
        <StaggerItem>
          <Section
            title="Passages à l'infirmerie"
            actions={
              <FormAction
                label="Nouvelle visite"
                icon={ClipboardPlusIcon}
                size="sm"
                fields={visiteFields(false)}
                modalSize="lg"
                onSubmit={(b) => enregistrerVisiteInfirmerie({ ...b, ...withE })}
                successMessage="Visite enregistrée"
                onDone={bump}
              />
            }
          >
            <AsyncBlock
              load={() => listerVisitesInfirmerie(eleveId)}
              deps={[eleveId, tick]}
              empty={<EmptyState compact title="Aucune visite" />}
            >
              {(rows) => <MiniTable rows={rows} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>

        <StaggerItem>
          <Section
            title="Sanctions"
            actions={
              <FormAction
                label="Nouvelle sanction"
                icon={ShieldAlertIcon}
                size="sm"
                fields={sanctionFields(false)}
                onSubmit={(b) => creerSanction({ ...b, ...withE })}
                successMessage="Sanction enregistrée"
                onDone={bump}
              />
            }
          >
            <AsyncBlock
              load={() => listerSanctionsEleve(eleveId)}
              deps={[eleveId, tick]}
              empty={<EmptyState compact title="Aucune sanction" />}
            >
              {(rows) => <MiniTable rows={rows} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>
      </div>

      <StaggerItem>
        <Section title="Documents à signer">
          <AsyncBlock
            load={() => listerSignatures({ eleve_id: eleveId })}
            deps={[eleveId]}
            empty={<EmptyState compact title="Aucun document" />}
          >
            {(rows) => <MiniTable rows={rows} />}
          </AsyncBlock>
        </Section>
      </StaggerItem>
    </Stagger>
  );
}