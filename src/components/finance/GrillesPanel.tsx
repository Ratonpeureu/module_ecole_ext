import React from "react";
import { CalendarRangeIcon, PlusIcon, ReceiptTextIcon, Trash2Icon, WandSparklesIcon } from "lucide-react";
import {
  ajouterEcheanceGrilleFrais,
  autoGenererEcheancesGrilleFrais,
  creerGrilleFrais,
  getDetailGrilleFrais,
  getOptionsGrilleFrais,
  listerGrillesFrais,
  supprimerEcheanceGrilleFrais,
} from "../../lib/api_ecole";
import { useAsync, useTick } from "../../hooks/useAsync";
import { autogenFields, echeanceFields, grilleFields } from "../../data/fields/services";
import type { OptionItem, Row } from "../../types/ui";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { EmptyState } from "../data/States";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";
import { ResourceView } from "../layout/ResourceView";
import { Section } from "../layout/Section";
import { Stagger, StaggerItem } from "../eleves/EleveMotion";
import { arr, obj, str } from "../../utils/format";

const MODULE_COLOR = "#1B7F3B";

const toOpts = (rows: Row[], label = "label", value = "value"): OptionItem[] =>
  rows.map((r) => ({ value: str(r[value]), label: str(r[label]) }));

export function useOptionsGrille() {
  const { data } = useAsync(() => getOptionsGrilleFrais(), []);
  const d = obj(data);
  return {
    niveaux: toOpts(arr(d.niveaux), "libelle", "id"),
    types: toOpts(arr(d.types_frais)),
    modes: toOpts(arr(d.modes_facturation)),
    mois: toOpts(arr(d.mois)),
  };
}

function SectionHeading({ icon: Icon, children }: { icon: typeof ReceiptTextIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid h-7 w-7 place-items-center rounded-md"
        style={{ backgroundColor: `${MODULE_COLOR}14`, color: MODULE_COLOR }}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </span>
  );
}

function GrilleDetail({ grille }: { grille: Row }) {
  const id = str(grille.id);
  const [tick, bump] = useTick();
  const o = useOptionsGrille();

  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <Section title={(<SectionHeading icon={ReceiptTextIcon}>Grille tarifaire</SectionHeading>) as unknown as string}>
          <ObjectView data={grille} />
        </Section>
      </StaggerItem>

      <StaggerItem>
        <Section
          title={(<SectionHeading icon={CalendarRangeIcon}>Échéances</SectionHeading>) as unknown as string}
          actions={
            <>
              <FormAction
                label="Générer automatiquement"
                icon={WandSparklesIcon}
                size="sm"
                fields={autogenFields(o.modes, o.mois)}
                onSubmit={(b) => autoGenererEcheancesGrilleFrais(id, b)}
                successMessage="Échéances générées"
                onDone={bump}
              />
              <FormAction
                label="Ajouter"
                icon={PlusIcon}
                size="sm"
                variant="primary"
                fields={echeanceFields(o.types, o.mois)}
                modalSize="lg"
                onSubmit={(b) => ajouterEcheanceGrilleFrais(id, b)}
                successMessage="Échéance ajoutée"
                onDone={bump}
              />
            </>
          }
        >
          <AsyncBlock
            load={() => getDetailGrilleFrais(id)}
            deps={[id, tick]}
            empty={
              <EmptyState
                compact
                title="Aucune échéance"
                text="Générez-les automatiquement ou ajoutez-les une par une."
              />
            }
          >
            {(rows) => (
              <MiniTable
                rows={rows}
                rowActions={(r) => (
                  <ConfirmAction
                    label="Supprimer"
                    icon={Trash2Icon}
                    iconOnly
                    size="sm"
                    variant="subtle"
                    danger
                    message={`Supprimer l'échéance « ${str(r.libelle)} » ?`}
                    confirmLabel="Supprimer"
                    run={() => supprimerEcheanceGrilleFrais(str(r.id))}
                    successMessage="Échéance supprimée"
                    onDone={bump}
                  />
                )}
              />
            )}
          </AsyncBlock>
        </Section>
      </StaggerItem>
    </Stagger>
  );
}

export function GrillesPanel({ anneeId }: { anneeId: string }) {
  const o = useOptionsGrille();
  const niveauLabel = (id: unknown) => o.niveaux.find((n) => n.value === str(id))?.label ?? "Niveau";

  return (
    <ResourceView
      load={() => listerGrillesFrais(anneeId)}
      deps={[anneeId]}
      columns={[
        {
          key: "niveau_id",
          label: "Niveau",
          render: (r) => (
            <span className="inline-flex items-center gap-2 font-medium">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: MODULE_COLOR }} aria-hidden />
              {niveauLabel(r.niveau_id)}
            </span>
          ),
        },
        { key: "frais_inscription_fcfa", label: "Inscription" },
        { key: "frais_scolarite_annuel_fcfa", label: "Scolarité" },
        { key: "nb_tranches_paiement", label: "Tranches" },
      ]}
      actions={(reload) => (
        <FormAction
          label="Nouvelle grille"
          icon={PlusIcon}
          variant="primary"
          fields={grilleFields(anneeId, o.niveaux)}
          modalSize="lg"
          onSubmit={creerGrilleFrais}
          successMessage="Grille créée"
          onDone={reload}
        />
      )}
      emptyTitle="Aucune grille de frais"
      wide
      detailTitle={(r) => niveauLabel(r.niveau_id)}
      renderDetail={(r) => <GrilleDetail grille={r} />}
    />
  );
}