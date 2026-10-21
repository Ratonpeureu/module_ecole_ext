import React from "react";
import { DownloadIcon, FileUpIcon, Trash2Icon } from "lucide-react";
import {
  listerDocumentsEleve,
  supprimerDocumentEleve,
  telechargerDocumentEleve,
  uploaderDocumentEleve,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { documentEleveFields } from "../../data/fields/eleves";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { EmptyState } from "../data/States";
import { AsyncButton } from "../form/AsyncButton";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { CommandBar, Stagger, StaggerItem } from "./EleveMotion";
import { saveFile } from "../../utils/files";
import { formatNumber, num, str } from "../../utils/format";

export function EleveDocuments({ eleveId }: { eleveId: string }) {
  const [tick, bump] = useTick();

  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <CommandBar hint="Acte de naissance, certificat médical, pièces des parents…">
          <FormAction
            label="Ajouter un document"
            icon={FileUpIcon}
            size="sm"
            variant="primary"
            fields={documentEleveFields}
            onSubmit={(b) => uploaderDocumentEleve(eleveId, str(b.type_document), b.fichier as File)}
            successMessage="Document ajouté"
            onDone={bump}
          />
        </CommandBar>
      </StaggerItem>

      <StaggerItem>
        <Section title="Dossier numérique">
          <AsyncBlock
            load={() => listerDocumentsEleve(eleveId)}
            deps={[eleveId, tick]}
            empty={
              <EmptyState
                compact
                title="Aucun document"
                text="Acte de naissance, certificat médical, pièces des parents…"
              />
            }
          >
            {(rows) => (
              <MiniTable
                rows={rows}
                columns={[
                  { key: "type_document", label: "Type" },
                  { key: "nom_fichier_original", label: "Fichier" },
                  {
                    key: "taille_octets",
                    label: "Taille",
                    render: (r) => `${formatNumber(Math.round((num(r.taille_octets) ?? 0) / 1024))} Ko`,
                  },
                  { key: "created_at", label: "Ajouté le" },
                ]}
                rowActions={(r) => (
                  <div className="flex items-center gap-0.5">
                    <AsyncButton
                      label="Télécharger"
                      icon={DownloadIcon}
                      iconOnly
                      size="sm"
                      variant="subtle"
                      onClick={async () => saveFile(await telechargerDocumentEleve(eleveId, str(r.id)))}
                    />
                    <ConfirmAction
                      label="Supprimer"
                      icon={Trash2Icon}
                      iconOnly
                      size="sm"
                      variant="subtle"
                      danger
                      message={`Supprimer le document « ${str(r.nom_fichier_original)} » ?`}
                      confirmLabel="Supprimer"
                      run={() => supprimerDocumentEleve(eleveId, str(r.id))}
                      successMessage="Document supprimé"
                      onDone={bump}
                    />
                  </div>
                )}
              />
            )}
          </AsyncBlock>
        </Section>
      </StaggerItem>
    </Stagger>
  );
}