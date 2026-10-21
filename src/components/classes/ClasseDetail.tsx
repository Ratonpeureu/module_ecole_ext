import React, { useState } from "react";
import {
  ArrowLeftRightIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CalendarCogIcon,
  ImageIcon,
  ImagePlusIcon,
  LinkIcon,
  PackageIcon,
  PackagePlusIcon,
  PencilIcon,
  PrinterIcon,
  RefreshCwIcon,
  Trash2Icon,
  UnlinkIcon
} from "lucide-react";
import {
  affecterMatiereClasse,
  ajouterMaterielClasse,
  ajouterPhotoClasse,
  basculerTypeEdt,
  changerEnseignant,
  getEdtTemplateClasse,
  getEmploiDuTempsClasse,
  listerMaterielClasse,
  listerMatieresClasse,
  listerPhotosClasse,
  modifierMaterielClasse,
  plancheCartesClasseEtAttendre,
  recalculerStatsClasse,
  retirerAffectationEnseignant,
  retirerMatiereClasse,
  supprimerMaterielClasse,
  supprimerPhoto
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { changerEnseignantFields, matiereClasseFields, retirerEnseignantFields } from "../../data/fields/pedagogie";
import { materielClasseEditFields, materielClasseFields, photoClasseFields } from "../../data/fields/services";
import { TYPE_EDT } from "../../data/enums";
import type { Row } from "../../types/ui";
import { AsyncBlock } from "../data/AsyncBlock";
import { EdtGrid } from "../data/EdtGrid";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { EmptyState } from "../data/States";
import { AsyncButton } from "../form/AsyncButton";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { Tabs } from "../ui/Tabs";
import type { TabItem } from "../ui/Tabs";
import { enumField, F, req } from "../../utils/fieldBuilders";
import { fromEnum, optTemplatesCarte } from "../../utils/options";
import { obj, resolveUrl, str, valueLabel } from "../../utils/format";

const TABS: TabItem[] = [
  { id: "matieres", label: "Matières", icon: BookOpenIcon },
  { id: "edt", label: "Organisation", icon: CalendarClockIcon },
  { id: "materiel", label: "Matériel", icon: PackageIcon },
  { id: "photos", label: "Photos", icon: ImageIcon }
];

export function ClasseDetail({ classe, anneeId }: { classe: Row; anneeId: string }) {
  const id = str(classe.id);
  const [tab, setTab] = useState("matieres");
  const [tick, bump] = useTick();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-black/[0.06] bg-[#F9F9F9] p-2">
        <AsyncButton
          label="Recalculer les statistiques"
          icon={RefreshCwIcon}
          size="sm"
          successMessage="Statistiques mises à jour"
          onClick={() => recalculerStatsClasse(id, anneeId)}
        />
        <FormAction
          label="Imprimer les cartes"
          icon={PrinterIcon}
          size="sm"
          fields={[F.select("template", "Modèle", { load: optTemplatesCarte })]}
          submitLabel="Générer la planche"
          successMessage="Planche prête"
          showResult
          onSubmit={(b) => plancheCartesClasseEtAttendre(id, str(b.template) || undefined)}
        />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "matieres" && (
        <Section
          title="Matières enseignées"
          actions={
            <FormAction
              label="Ajouter une matière"
              icon={LinkIcon}
              size="sm"
              variant="primary"
              fields={matiereClasseFields}
              onSubmit={(b) => affecterMatiereClasse({ ...b, classe_id: id })}
              successMessage="Matière ajoutée"
              onDone={bump}
            />
          }>
          <AsyncBlock load={() => listerMatieresClasse(id)} deps={[id, tick]} empty={<EmptyState compact title="Aucune matière" />}>
            {(rows) => (
              <MiniTable
                rows={rows}
                rowKey={(r, i) => str(r.matiere_classe_id) || String(i)}
                columns={[
                  { key: "matiere" },
                  { key: "coefficient" },
                  {
                    key: "enseignant_id",
                    label: "Enseignant",
                    render: (r) =>
                      r.enseignant_id ? (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0F7B0F]">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          Attribué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#9D5D00]">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          Non attribué
                        </span>
                      )
                  }
                ]}
                rowActions={(r) => {
                  const mc = str(r.matiere_classe_id);
                  return (
                    <>
                      <FormAction
                        label="Changer d'enseignant"
                        icon={ArrowLeftRightIcon}
                        iconOnly
                        size="sm"
                        variant="subtle"
                        fields={changerEnseignantFields()}
                        onSubmit={(b) => changerEnseignant(mc, b)}
                        successMessage="Enseignant changé"
                        onDone={bump}
                      />
                      {Boolean(r.enseignant_id) && (
                        <FormAction
                          label="Retirer l'enseignant"
                          icon={UnlinkIcon}
                          iconOnly
                          size="sm"
                          variant="subtle"
                          fields={retirerEnseignantFields()}
                          onSubmit={(b) =>
                            retirerAffectationEnseignant(mc, { date_fin: str(b.date_fin) || undefined, motif: str(b.motif) || undefined })
                          }
                          successMessage="Enseignant retiré"
                          showResult
                          onDone={bump}
                        />
                      )}
                      <ConfirmAction
                        label="Retirer la matière"
                        icon={Trash2Icon}
                        iconOnly
                        size="sm"
                        variant="subtle"
                        danger
                        message={`Retirer ${str(r.matiere)} de cette classe ?`}
                        confirmLabel="Retirer"
                        run={() => retirerMatiereClasse(mc)}
                        successMessage="Matière retirée"
                        onDone={bump}
                      />
                    </>
                  );
                }}
              />
            )}
          </AsyncBlock>
        </Section>
      )}

      {tab === "edt" && (
        <div className="space-y-5">
          <Section
            title="Emploi du temps"
            description={`Organisation actuelle : ${valueLabel(str(classe.type_organisation_edt_effectif))}`}
            actions={
              <FormAction
                label="Changer d'organisation"
                icon={CalendarCogIcon}
                size="sm"
                fields={[enumField("nouveau_type", "Nouvelle organisation", fromEnum(TYPE_EDT), req)]}
                onSubmit={(b) => basculerTypeEdt(id, b)}
                successMessage="Organisation modifiée"
                showResult
                onDone={bump}
              />
            }>
            <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-white">
              <AsyncBlock load={() => getEmploiDuTempsClasse(id)} deps={[id, tick]}>
                {(d) => <EdtGrid grille={obj(d.grille)} />}
              </AsyncBlock>
            </div>
          </Section>
          <Section title="Modèle de la classe">
            <AsyncBlock load={() => getEdtTemplateClasse(id)} deps={[id, tick]}>
              {(d) => <ObjectView data={d} hide={["grille_vide"]} />}
            </AsyncBlock>
          </Section>
        </div>
      )}

      {tab === "materiel" && (
        <Section
          title="Matériel de la classe"
          actions={
            <FormAction
              label="Ajouter du matériel"
              icon={PackagePlusIcon}
              size="sm"
              variant="primary"
              fields={materielClasseFields}
              modalSize="lg"
              onSubmit={(b) => ajouterMaterielClasse(id, b)}
              successMessage="Matériel ajouté"
              onDone={bump}
            />
          }>
          <AsyncBlock load={() => listerMaterielClasse(id)} deps={[id, tick]} empty={<EmptyState compact title="Aucun matériel" />}>
            {(rows) => (
              <MiniTable
                rows={rows}
                rowActions={(r) => (
                  <>
                    <FormAction
                      label="Modifier"
                      icon={PencilIcon}
                      iconOnly
                      size="sm"
                      variant="subtle"
                      fields={materielClasseEditFields}
                      initial={r}
                      onSubmit={(b) => modifierMaterielClasse(str(r.id), b)}
                      successMessage="Matériel modifié"
                      onDone={bump}
                    />
                    <ConfirmAction
                      label="Supprimer"
                      icon={Trash2Icon}
                      iconOnly
                      size="sm"
                      variant="subtle"
                      danger
                      message={`Supprimer « ${str(r.designation)} » ?`}
                      confirmLabel="Supprimer"
                      run={() => supprimerMaterielClasse(str(r.id))}
                      successMessage="Matériel supprimé"
                      onDone={bump}
                    />
                  </>
                )}
              />
            )}
          </AsyncBlock>
        </Section>
      )}

      {tab === "photos" && (
        <Section
          title="Photos de classe"
          actions={
            <FormAction
              label="Ajouter une photo"
              icon={ImagePlusIcon}
              size="sm"
              variant="primary"
              fields={photoClasseFields(anneeId)}
              modalSize="lg"
              onSubmit={(b) => ajouterPhotoClasse(id, { ...b, annee_scolaire_id: anneeId })}
              successMessage="Photo ajoutée"
              onDone={bump}
            />
          }>
          <AsyncBlock
            load={() => listerPhotosClasse(id, { annee_scolaire_id: anneeId })}
            deps={[id, anneeId, tick]}
            empty={<EmptyState compact title="Aucune photo" />}>
            {(rows) => (
              <div className="grid grid-cols-2 gap-3">
                {rows.map((p) => (
                  <figure
                    key={str(p.id)}
                    className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="bg-[#F3F3F3]">
                      <img
                        src={resolveUrl(str(p.url_photo || p.thumbnail_url))}
                        alt={str(p.titre) || "Photo de classe"}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                    <figcaption className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <span className="truncate text-[12.5px] font-medium text-[#1A1A1A]">{str(p.titre) || str(p.legende)}</span>
                      <ConfirmAction
                        label="Supprimer"
                        icon={Trash2Icon}
                        iconOnly
                        size="sm"
                        variant="subtle"
                        danger
                        message="Supprimer cette photo ?"
                        confirmLabel="Supprimer"
                        run={() => supprimerPhoto(str(p.id))}
                        successMessage="Photo supprimée"
                        onDone={bump}
                      />
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </AsyncBlock>
        </Section>
      )}
    </div>
  );
}