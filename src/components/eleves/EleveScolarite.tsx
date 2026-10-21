import React from "react";
import { GavelIcon, RefreshCwIcon, UserPlusIcon } from "lucide-react";
import {
  cloturerAnneeEleve,
  getLivretAnnuel,
  getLivretParcours,
  getParcoursCompletEleve,
  inscrireEleve,
  listerEmprunts,
  listerPhotosEleve,
  recalculerParcoursEleve,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { clotureFields, inscriptionFields } from "../../data/fields/eleves";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { StatGrid } from "../data/StatGrid";
import { EmptyState } from "../data/States";
import { AsyncButton } from "../form/AsyncButton";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { InscriptionResult } from "./InscriptionResult";
import { CommandBar, Stagger, StaggerItem } from "./EleveMotion";
import { arr, formatNumber, resolveUrl, str } from "../../utils/format";

export function EleveScolarite({ eleveId, anneeId }: { eleveId: string; anneeId: string }) {
  const [tick, bump] = useTick();

  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <CommandBar hint="Inscription et décisions du conseil de classe">
          <FormAction
            label="Inscrire dans une classe"
            icon={UserPlusIcon}
            size="sm"
            variant="primary"
            fields={inscriptionFields(anneeId)}
            onSubmit={(b) => inscrireEleve({ ...b, eleve_id: eleveId })}
            successMessage="Inscription enregistrée"
            showResult
            renderResult={(r) => <InscriptionResult result={r} anneeId={anneeId} />}
            onDone={bump}
          />
          <FormAction
            label="Clôturer l'année"
            icon={GavelIcon}
            size="sm"
            description="Enregistrez la décision du conseil de classe pour l'année sélectionnée."
            fields={clotureFields(anneeId)}
            onSubmit={(b) => cloturerAnneeEleve(eleveId, anneeId, b)}
            successMessage="Année clôturée"
            onDone={bump}
          />
        </CommandBar>
      </StaggerItem>

      <StaggerItem>
        <Section title="Année en cours">
          <AsyncBlock load={() => getLivretAnnuel(eleveId, anneeId)} deps={[eleveId, anneeId, tick]}>
            {(l) => (
              <div className="space-y-4">
                <StatGrid
                  items={[
                    { label: "Moyenne annuelle", value: formatNumber(l.moyenne_annuelle), tone: "accent" },
                    { label: "Périodes publiées", value: formatNumber(l.nb_periodes_publiees) },
                  ]}
                />
                {arr(l.bulletins_periode).length > 0 && <MiniTable rows={arr(l.bulletins_periode)} />}
              </div>
            )}
          </AsyncBlock>
        </Section>
      </StaggerItem>

      <div className="grid gap-5 xl:grid-cols-2">
        <StaggerItem>
          <Section title="Livret scolaire">
            <AsyncBlock
              load={() => getLivretParcours(eleveId)}
              deps={[eleveId, tick]}
              empty={<EmptyState compact title="Aucune année clôturée" />}
            >
              {(rows) => <MiniTable rows={rows} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>

        <StaggerItem>
          <Section
            title="Parcours complet"
            actions={
              <AsyncButton
                label="Mettre à jour"
                icon={RefreshCwIcon}
                size="sm"
                successMessage="Parcours mis à jour"
                onClick={async () => {
                  await recalculerParcoursEleve(eleveId);
                  bump();
                }}
              />
            }
          >
            <AsyncBlock
              load={() => getParcoursCompletEleve(eleveId)}
              deps={[eleveId, tick]}
              isEmpty={(d) => arr(d.annees).length === 0}
              empty={
                <EmptyState
                  compact
                  title="Parcours pas encore calculé"
                  text="Cliquez sur « Mettre à jour » pour le générer."
                />
              }
            >
              {(p) => <ObjectView data={p} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <StaggerItem>
          <Section title="Photos de classe">
            <AsyncBlock
              load={() => listerPhotosEleve(eleveId)}
              deps={[eleveId]}
              empty={<EmptyState compact title="Aucune photo" />}
            >
              {(rows) => (
                <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {rows.map((p) => (
                    <StaggerItem key={str(p.id)}>
                      <figure className="overflow-hidden rounded-lg border border-[var(--em-border)] bg-black/[0.02] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                        <img
                          src={resolveUrl(str(p.url_photo || p.thumbnail_url))}
                          alt={str(p.titre) || "Photo de classe"}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        {str(p.titre) && (
                          <figcaption className="truncate border-t border-[var(--em-border)] px-2.5 py-2 text-[12px] font-medium">
                            {str(p.titre)}
                          </figcaption>
                        )}
                      </figure>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </AsyncBlock>
          </Section>
        </StaggerItem>

        <StaggerItem>
          <Section title="Emprunts à la bibliothèque">
            <AsyncBlock
              load={() => listerEmprunts({ eleve_id: eleveId })}
              deps={[eleveId]}
              empty={<EmptyState compact title="Aucun emprunt" />}
            >
              {(rows) => <MiniTable rows={rows} />}
            </AsyncBlock>
          </Section>
        </StaggerItem>
      </div>
    </Stagger>
  );
}