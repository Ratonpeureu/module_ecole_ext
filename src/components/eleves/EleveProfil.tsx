import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CameraIcon, DoorOpenIcon, EyeIcon, FileDownIcon, HashIcon, KeyRoundIcon, PencilIcon } from "lucide-react";
import {
  enregistrerSortieEleve,
  genererCodeAccesEleve,
  getCartePdf,
  getCarteApercu,
  getCodeAccesEleve,
  getEleve,
  modifierEleve,
  uploaderPhotoEleve,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { eleveEditFields, sortieFields } from "../../data/fields/eleves";
import { FACE_CARTE } from "../../data/enums";
import { AsyncBlock } from "../data/AsyncBlock";
import { ObjectView } from "../data/ObjectView";
import { EmptyState } from "../data/States";
import { Badge } from "../ui/Badge";
import { ConfirmAction } from "../form/ConfirmAction";
import { FileAction } from "../form/FileAction";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { EASE_OUT, Stagger, StaggerItem } from "./EleveMotion";
import { enumField, F } from "../../utils/fieldBuilders";
import { fromEnum, optTemplatesCarte } from "../../utils/options";
import { openFile, saveFile } from "../../utils/files";
import { fullName, initials, resolveUrl, statusTone, str, valueLabel } from "../../utils/format";

const carteFields = [
  enumField("face", "Face", fromEnum(FACE_CARTE), { defaultValue: "recto" }),
  F.select("template", "Modèle", { load: optTemplatesCarte }),
];

export function EleveProfil({ eleveId, onChanged }: { eleveId: string; onChanged: () => void }) {
  const [tick, bump] = useTick();
  const reduce = useReducedMotion();
  const refresh = () => {
    bump();
    onChanged();
  };

  return (
    <AsyncBlock load={() => getEleve(eleveId)} deps={[eleveId, tick]} rows={5}>
      {(e) => {
        const name = fullName(e);
        return (
          <Stagger className="space-y-5">
            {/* ── En-tête de profil ─────────────────────────────── */}
            <StaggerItem>
              <header className="overflow-hidden rounded-xl border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="h-20 bg-[var(--em-accent-soft)]" aria-hidden />
                <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.24, ease: EASE_OUT }}
                      className="-mt-10 shrink-0 rounded-full bg-[var(--em-surface,#ffffff)] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
                    >
                      {str(e.photo_url) ? (
                        <img
                          src={resolveUrl(str(e.photo_url))}
                          alt={name}
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--em-accent-soft)] text-[24px] font-semibold text-[var(--em-accent)]">
                          {initials(name)}
                        </span>
                      )}
                    </motion.div>
                    <div className="min-w-0 pb-0.5">
                      <h2 className="truncate text-[20px] font-semibold leading-tight">{name}</h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="ecole_m-muted inline-flex items-center gap-1 rounded-md border border-[var(--em-border)] px-2 py-0.5 font-mono text-[12px]">
                          <HashIcon className="h-3 w-3" aria-hidden />
                          Matricule {str(e.matricule)}
                        </span>
                        <Badge tone={statusTone(str(e.statut))}>{valueLabel(str(e.statut))}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FormAction
                      label="Modifier"
                      icon={PencilIcon}
                      size="sm"
                      fields={eleveEditFields}
                      initial={e}
                      onSubmit={(b) => modifierEleve(eleveId, b)}
                      successMessage="Fiche mise à jour"
                      onDone={refresh}
                    />
                    <FileAction
                      label="Changer la photo"
                      icon={CameraIcon}
                      accept="image/*"
                      onFile={(f) => uploaderPhotoEleve(eleveId, f)}
                      successMessage="Photo mise à jour"
                      onDone={refresh}
                    />
                    {str(e.statut) === "actif" && (
                      <FormAction
                        label="Enregistrer une sortie"
                        icon={DoorOpenIcon}
                        size="sm"
                        description="Transfert, exclusion, diplôme ou abandon."
                        fields={sortieFields()}
                        onSubmit={(b) => enregistrerSortieEleve(eleveId, b)}
                        successMessage="Sortie enregistrée"
                        showResult
                        onDone={refresh}
                      />
                    )}
                  </div>
                </div>
              </header>
            </StaggerItem>

            {/* ── Corps : informations + colonne latérale ───────── */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <StaggerItem>
                <Section title="Informations">
                  <ObjectView data={e} hide={["photo_url", "nom", "prenom", "matricule", "statut"]} />
                </Section>
              </StaggerItem>

              <div className="space-y-5">
                <StaggerItem>
                  <Section title="Carte scolaire">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      <FormAction
                        label="Aperçu de la carte"
                        icon={EyeIcon}
                        size="sm"
                        fields={carteFields}
                        submitLabel="Afficher"
                        successMessage="Aperçu prêt"
                        onSubmit={async (b) => {
                          const f = await getCarteApercu(eleveId, {
                            face: str(b.face) || undefined,
                            template: str(b.template) || undefined,
                          });
                          openFile(f);
                          return f.filename;
                        }}
                      />
                      <FormAction
                        label="Télécharger la carte"
                        icon={FileDownIcon}
                        size="sm"
                        fields={[
                          F.select("template", "Modèle", { load: optTemplatesCarte }),
                          F.bool("persist", "Conserver une copie dans le dossier"),
                        ]}
                        submitLabel="Télécharger"
                        successMessage="Carte téléchargée"
                        onSubmit={async (b) => {
                          const f = await getCartePdf(eleveId, {
                            template: str(b.template) || undefined,
                            persist: b.persist === true,
                          });
                          saveFile(f);
                          return f.filename;
                        }}
                      />
                    </div>
                  </Section>
                </StaggerItem>

                <StaggerItem>
                  <Section
                    title="Code d'accès pour les parents"
                    description="Ce code permet à un parent de rattacher l'enfant à son compte."
                    actions={
                      <ConfirmAction
                        label="Générer un code"
                        icon={KeyRoundIcon}
                        size="sm"
                        message="Un nouveau code d'accès sera créé pour cet élève."
                        run={() => genererCodeAccesEleve(eleveId)}
                        successMessage="Code généré"
                        showResult
                        onDone={bump}
                      />
                    }
                  >
                    <AsyncBlock
                      load={() => getCodeAccesEleve(eleveId)}
                      deps={[eleveId, tick]}
                      isEmpty={(d) => !d}
                      empty={<EmptyState compact title="Aucun code actif" />}
                    >
                      {(c) => (
                        <div className="space-y-3">
                          {c && str(c.code) && (
                            <motion.div
                              key={str(c.code)}
                              initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.22, ease: EASE_OUT }}
                              className="rounded-lg border border-dashed border-[var(--em-accent)]/40 bg-[var(--em-accent-soft)] px-4 py-4 text-center"
                            >
                              <p className="font-mono text-[22px] font-semibold tracking-[0.24em] text-[var(--em-accent)] select-all">
                                {str(c.code)}
                              </p>
                            </motion.div>
                          )}
                          <ObjectView data={c} hide={["code"]} />
                        </div>
                      )}
                    </AsyncBlock>
                  </Section>
                </StaggerItem>
              </div>
            </div>
          </Stagger>
        );
      }}
    </AsyncBlock>
  );
}