import React, { useState } from "react";
import { DownloadIcon, IdCardIcon, LayoutTemplateIcon, PrinterIcon, SlidersHorizontalIcon } from "lucide-react";
import { getCartesTemplates, getConfigCarte, lancerPlancheCartesClasse, plancheCartesClasseEtAttendre, setConfigCarte, telechargerPlancheCartes } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { PanelHeader } from "../../components/layout/PanelHeader";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { ObjectView } from "../../components/data/ObjectView";
import { ClassePicker } from "../../components/ui/ClassePicker";
import { PageStage, Reveal } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { SchemaForm } from "../../components/form/SchemaForm";
import { F } from "../../utils/fieldBuilders";
import { optTaillesCarte, optTemplatesCarte } from "../../utils/options";
import { saveFile } from "../../utils/files";
import { str } from "../../utils/format";

const COLOR = "#005B70";

const configFields = [
F.select("template", "Modèle par défaut", { load: optTemplatesCarte }),
F.select("size", "Format", { load: optTaillesCarte }),
F.color("bg_color", "Couleur de fond"),
F.color("accent", "Couleur d'accent"),
F.color("accent_light", "Accent clair"),
F.color("text_color", "Couleur du texte"),
F.color("sec_color", "Couleur secondaire"),
F.text("font_family", "Police"),
F.number("font_size", "Taille du texte", { min: 1 }),
F.number("corner_r", "Arrondi des coins", { min: 0 }),
F.text("qr_payload_prefix", "Préfixe du code QR"),
F.bool("show_photo", "Afficher la photo"),
F.bool("show_qr", "Afficher le code QR"),
F.bool("show_signature_line", "Afficher la ligne de signature")];

export function Cartes() {
  const [classeId, setClasseId] = useState("");

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={IdCardIcon} color={COLOR} title="Cartes scolaires" subtitle="Modèles, réglages et impression par classe" />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <div className="space-y-5">
                <ContextBar
                icon={PrinterIcon}
                color={COLOR}
                title="Impression par classe"
                text="Générez la planche de cartes de tous les élèves d'une classe."
                steps={[{ label: "Classe", done: !!classeId }]}
                actions={
                classeId ?
                <>
                        <FormAction
                    label="Lancer en arrière-plan"
                    icon={PrinterIcon}
                    fields={[F.select("template", "Modèle", { load: optTemplatesCarte })]}
                    submitLabel="Lancer"
                    successMessage="Génération lancée"
                    showResult
                    onSubmit={(b) => lancerPlancheCartesClasse(classeId, str(b.template) || undefined)} />
                        <FormAction
                    label="Générer et attendre"
                    icon={PrinterIcon}
                    variant="primary"
                    fields={[F.select("template", "Modèle", { load: optTemplatesCarte })]}
                    submitLabel="Générer"
                    successMessage="Planche prête"
                    showResult
                    onSubmit={(b) => plancheCartesClasseEtAttendre(classeId, str(b.template) || undefined)} />
                      </> :
                null
                }>
                  <ClassePicker anneeId={anneeId} value={classeId} onChange={setClasseId} />
                </ContextBar>

                <section className="ecole_m-card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                      <DownloadIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-[14px] font-semibold leading-tight">Planche déjà générée</h2>
                      <p className="ecole_m-muted mt-0.5 text-[12.5px]">Téléchargez une planche à partir du nom de son fichier.</p>
                    </div>
                  </div>
                  <FormAction
                  label="Télécharger une planche"
                  icon={DownloadIcon}
                  fields={[F.text("fichier", "Nom du fichier de la planche", { required: true, full: true })]}
                  submitLabel="Télécharger"
                  successMessage="Planche téléchargée"
                  onSubmit={async (b) => {
                    const f = await telechargerPlancheCartes(str(b.fichier));
                    saveFile(f);
                    return f.filename;
                  }} />
                </section>

                <section className="ecole_m-card overflow-hidden">
                  <PanelHeader icon={LayoutTemplateIcon} color={COLOR} title="Modèles disponibles" />
                  <div className="p-5">
                    <AsyncBlock load={getCartesTemplates} deps={[]}>
                      {(d) => <ObjectView data={d} />}
                    </AsyncBlock>
                  </div>
                </section>
              </div>

              <section className="ecole_m-card overflow-hidden xl:sticky xl:top-4">
                <PanelHeader icon={SlidersHorizontalIcon} color={COLOR} title="Réglages des cartes" />
                <div className="p-5">
                  <AsyncBlock load={getConfigCarte} deps={[]} isEmpty={() => false}>
                    {(c) =>
                  <SchemaForm fields={configFields} initial={c ?? undefined} submitLabel="Enregistrer" successMessage="Réglages enregistrés" onSubmit={setConfigCarte} />
                  }
                  </AsyncBlock>
                </div>
              </section>
            </div>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}