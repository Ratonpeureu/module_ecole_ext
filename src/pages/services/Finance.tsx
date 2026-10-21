import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckIcon, ClockIcon, FolderTreeIcon, PlusIcon, ReceiptIcon, SettingsIcon, ShoppingCartIcon, TableIcon, WalletIcon, XIcon } from "lucide-react";
import {
  approuverDemandeAchat,
  creerCategorieDepense,
  creerDemandeAchat,
  creerDepense,
  getCategoriesDepenses,
  getConfigFinance,
  listerDemandesAchat,
  listerDepenses,
  listerPaiementsEnAttente,
  rejeterPaiement,
  setConfigFinance,
  validerPaiement } from
"../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { PanelHeader } from "../../components/layout/PanelHeader";
import { Tabs } from "../../components/ui/Tabs";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { ObjectView } from "../../components/data/ObjectView";
import { MiniTable } from "../../components/data/MiniTable";
import { PersonCell } from "../../components/data/PersonCell";
import { ConfirmAction } from "../../components/form/ConfirmAction";
import { FormAction } from "../../components/form/FormAction";
import { SchemaForm } from "../../components/form/SchemaForm";
import { GrillesPanel, useOptionsGrille } from "../../components/finance/GrillesPanel";
import { achatFields, categorieDepenseFields, configFinanceFields, depenseFields } from "../../data/fields/services";
import { STATUT_DEMANDE_ACHAT } from "../../data/enums";
import { F, req } from "../../utils/fieldBuilders";
import { fromEnum } from "../../utils/options";
import { arr, str } from "../../utils/format";

const COLOR = "#1B7F3B";

const TABS = [
{ id: "attente", label: "Paiements à valider", icon: ClockIcon },
{ id: "grilles", label: "Frais scolaires", icon: TableIcon },
{ id: "depenses", label: "Dépenses", icon: ReceiptIcon },
{ id: "achats", label: "Demandes d'achat", icon: ShoppingCartIcon },
{ id: "categories", label: "Catégories", icon: FolderTreeIcon },
{ id: "config", label: "Réglages", icon: SettingsIcon }];

function ConfigPanel() {
  const o = useOptionsGrille();
  return (
    <section className="ecole_m-card mx-auto w-full max-w-4xl overflow-hidden">
      <PanelHeader icon={SettingsIcon} color={COLOR} title="Réglages financiers de l'établissement" />
      <div className="p-5 md:p-6">
        <AsyncBlock load={getConfigFinance} deps={[o.mois.length]} isEmpty={() => false}>
          {(c) =>
          <SchemaForm
            key={o.mois.length}
            fields={configFinanceFields(o.mois)}
            initial={c ?? undefined}
            submitLabel="Enregistrer les réglages"
            successMessage="Réglages enregistrés"
            onSubmit={setConfigFinance} />
          }
        </AsyncBlock>
      </div>
    </section>);
}

export function Finance() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "attente";
  const [statut, setStatut] = useState("");

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={WalletIcon} color={COLOR} title="Finance" subtitle="Encaissements, frais scolaires et dépenses" />
      </Reveal>

      <Reveal>
        <Tabs tabs={TABS} value={tab} onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <TabStage id={tab}>
              {tab === "attente" &&
            <>
                  <ContextBar
                icon={ClockIcon}
                color={COLOR}
                title="Paiements déclarés en attente"
                text="Validez ou rejetez chaque paiement depuis sa ligne." />
                  <ResourceView
                load={listerPaiementsEnAttente}
                deps={[]}
                columns={[
                { key: "eleve", label: "Élève", render: (r) => <PersonCell name={str(r.eleve)} color={COLOR} /> },
                { key: "montant_fcfa", label: "Montant" },
                { key: "mode_paiement", label: "Mode" },
                { key: "reference_transaction", label: "Référence" },
                { key: "date_paiement", label: "Date" }]
                }
                emptyTitle="Aucun paiement en attente"
                detailTitle={(r) => str(r.eleve)}
                rowActions={(r, reload) =>
                <>
                        <ConfirmAction
                    label="Valider"
                    icon={CheckIcon}
                    iconOnly
                    size="sm"
                    variant="subtle"
                    message={`Valider le paiement de ${str(r.eleve)} ?`}
                    confirmLabel="Valider"
                    run={() => validerPaiement(str(r.id))}
                    successMessage="Paiement validé"
                    onDone={reload} />
                        <FormAction
                    label="Rejeter"
                    icon={XIcon}
                    iconOnly
                    size="sm"
                    variant="subtle"
                    fields={[F.area("motif", "Motif du rejet", req)]}
                    submitLabel="Rejeter"
                    onSubmit={(b) => rejeterPaiement(str(r.id), b)}
                    successMessage="Paiement rejeté"
                    onDone={reload} />
                      </>
                } />
                </>
            }

              {tab === "grilles" && <GrillesPanel anneeId={anneeId} />}

              {tab === "depenses" &&
            <ResourceView
              load={listerDepenses}
              deps={[]}
              actions={(reload) =>
              <FormAction label="Nouvelle dépense" icon={PlusIcon} variant="primary" fields={depenseFields()} onSubmit={creerDepense} successMessage="Dépense enregistrée" onDone={reload} />
              }
              emptyTitle="Aucune dépense"
              detailTitle={(r) => str(r.libelle)} />
            }

              {tab === "achats" &&
            <>
                  <ContextBar icon={ShoppingCartIcon} color={COLOR} title="Demandes d'achat" text="Les demandes en attente peuvent être approuvées depuis leur ligne.">
                    <LoadPicker label="Statut" value={statut} onChange={setStatut} options={fromEnum(STATUT_DEMANDE_ACHAT)} placeholder="Tous" clearable />
                  </ContextBar>
                  <ResourceView
                load={() => listerDemandesAchat(statut || undefined)}
                deps={[statut]}
                actions={(reload) =>
                <FormAction label="Nouvelle demande" icon={PlusIcon} variant="primary" fields={achatFields} onSubmit={creerDemandeAchat} successMessage="Demande envoyée" onDone={reload} />
                }
                emptyTitle="Aucune demande d'achat"
                detailTitle={(r) => str(r.designation)}
                rowActions={(r, reload) =>
                str(r.statut) === "en_attente" ?
                <ConfirmAction
                  label="Approuver"
                  icon={CheckIcon}
                  iconOnly
                  size="sm"
                  variant="subtle"
                  message={`Approuver « ${str(r.designation)} » ?`}
                  confirmLabel="Approuver"
                  run={() => approuverDemandeAchat(str(r.id))}
                  successMessage="Demande approuvée"
                  onDone={reload} /> :
                null
                } />
                </>
            }

              {tab === "categories" &&
            <ResourceView
              load={getCategoriesDepenses}
              deps={[]}
              columns={[
              {
                key: "code",
                render: (r) =>
                <span
                  className="inline-flex rounded-md px-2 py-0.5 font-mono text-[12px] font-medium"
                  style={{ background: `color-mix(in srgb, ${COLOR} 10%, transparent)`, color: COLOR }}>
                        {str(r.code)}
                      </span>
              },
              { key: "libelle", render: (r) => <span className="font-medium">{str(r.libelle)}</span> },
              { key: "compte_comptable_ohada", label: "Compte" }]
              }
              actions={(reload) =>
              <FormAction label="Nouvelle catégorie" icon={PlusIcon} variant="primary" fields={categorieDepenseFields} onSubmit={creerCategorieDepense} successMessage="Catégorie créée" onDone={reload} />
              }
              emptyTitle="Aucune catégorie"
              detailTitle={(r) => str(r.libelle)}
              renderDetail={(r) =>
              <div className="space-y-4">
                      <ObjectView data={r} hide={["enfants"]} />
                      {arr(r.enfants).length > 0 && <MiniTable rows={arr(r.enfants)} />}
                    </div>
              } />
            }

              {tab === "config" && <ConfigPanel />}
            </TabStage>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}