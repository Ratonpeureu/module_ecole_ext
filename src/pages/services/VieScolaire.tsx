import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BellIcon, CalendarDaysIcon, CalendarXIcon, FileSignatureIcon, MailWarningIcon, MegaphoneIcon, PlusIcon, UsersRoundIcon } from "lucide-react";
import {
  creerConvocation,
  creerEvenement,
  creerReunion,
  creerSignatureRequise,
  getJournalNotifications,
  listerConvocations,
  listerEvenements,
  listerReunions,
  listerSignatures,
  notifierAbsence } from
"../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { convocationFields, evenementFields, reunionFields, signatureFields } from "../../data/fields/services";
import { absenceFields } from "../../data/fields/eleves";
import { SIGNE_FILTRE, STATUT_CONVOCATION } from "../../data/enums";
import { fromEnum } from "../../utils/options";
import { str } from "../../utils/format";

const COLOR = "#E74856";

const TABS = [
{ id: "evenements", label: "Événements", icon: CalendarDaysIcon },
{ id: "reunions", label: "Réunions", icon: UsersRoundIcon },
{ id: "convocations", label: "Convocations", icon: MailWarningIcon },
{ id: "signatures", label: "Signatures", icon: FileSignatureIcon },
{ id: "messages", label: "Messages envoyés", icon: BellIcon }];

export function VieScolaire() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "evenements";
  const [statut, setStatut] = useState("");
  const [signe, setSigne] = useState("");

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={MegaphoneIcon} color={COLOR} title="Vie scolaire" subtitle="Événements, réunions, convocations et échanges avec les familles" />
      </Reveal>

      <Reveal>
        <Tabs tabs={TABS} value={tab} onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <TabStage id={tab}>
              {tab === "evenements" &&
            <ResourceView
              load={listerEvenements}
              deps={[]}
              actions={(reload) =>
              <FormAction label="Nouvel événement" icon={PlusIcon} variant="primary" fields={evenementFields(anneeId)} onSubmit={creerEvenement} successMessage="Événement créé" onDone={reload} />
              }
              emptyTitle="Aucun événement"
              emptyIcon={CalendarDaysIcon}
              detailTitle={(r) => str(r.titre)} />
            }

              {tab === "reunions" &&
            <ResourceView
              load={listerReunions}
              deps={[]}
              actions={(reload) =>
              <FormAction label="Nouvelle réunion" icon={PlusIcon} variant="primary" fields={reunionFields(anneeId)} onSubmit={creerReunion} successMessage="Réunion planifiée" onDone={reload} />
              }
              emptyTitle="Aucune réunion"
              emptyIcon={UsersRoundIcon}
              detailTitle={(r) => str(r.titre)} />
            }

              {tab === "convocations" &&
            <>
                  <ContextBar icon={MailWarningIcon} color={COLOR} title="Convocations des parents" text="Suivez l'envoi, la confirmation et la présence des parents convoqués.">
                    <LoadPicker label="Statut" value={statut} onChange={setStatut} options={fromEnum(STATUT_CONVOCATION)} placeholder="Tous" clearable />
                  </ContextBar>
                  <ResourceView
                load={() => listerConvocations(statut || undefined)}
                deps={[statut]}
                actions={(reload) =>
                <FormAction label="Convoquer un parent" icon={PlusIcon} variant="primary" fields={convocationFields()} onSubmit={creerConvocation} successMessage="Convocation envoyée" onDone={reload} />
                }
                emptyTitle="Aucune convocation"
                detailTitle={() => "Convocation"} />
                </>
            }

              {tab === "signatures" &&
            <>
                  <ContextBar icon={FileSignatureIcon} color={COLOR} title="Documents à signer" text="Affichez les documents signés ou ceux qui attendent encore une signature.">
                    <LoadPicker label="Afficher" value={signe} onChange={setSigne} options={fromEnum(SIGNE_FILTRE)} placeholder="Tous" clearable />
                  </ContextBar>
                  <ResourceView
                load={() => listerSignatures({ signe: signe === "" ? undefined : signe === "true" })}
                deps={[signe]}
                actions={(reload) =>
                <FormAction label="Demander une signature" icon={PlusIcon} variant="primary" fields={signatureFields} onSubmit={creerSignatureRequise} successMessage="Demande envoyée" onDone={reload} />
                }
                emptyTitle="Aucun document"
                detailTitle={(r) => str(r.titre)} />
                </>
            }

              {tab === "messages" &&
            <ResourceView
              load={() => getJournalNotifications()}
              deps={[]}
              actions={(reload) =>
              <FormAction label="Signaler une absence" icon={CalendarXIcon} variant="primary" fields={absenceFields(true)} onSubmit={notifierAbsence} successMessage="Famille prévenue" showResult onDone={reload} />
              }
              emptyTitle="Aucun message envoyé"
              emptyIcon={BellIcon}
              detailTitle={() => "Message"} />
            }
            </TabStage>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}