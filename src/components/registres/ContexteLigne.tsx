import React from "react";
import { FileDownIcon, PencilIcon, RotateCcwIcon, UserRoundIcon, WalletIcon } from "lucide-react";
import type { Worksheet } from "exceljs";
import { exporterFinanceEleve, overrideEcheance, retirerOverrideEcheance } from "../../lib/api_ecole";
import type { StatutOverrideEcheance, TypeRegistre } from "../../types/ui";
import { COLONNES_REGISTRE as C, FEUILLE_ECHEANCES, FEUILLE_ELEVES_DOSSIER } from "../../data/registres";
import { overrideEcheanceFields } from "../../data/fields/registres";
import type { MoteurFormules } from "../../utils/formules";
import { affichageCellule, entetesFeuille } from "../../utils/xlsx";
import { saveFile } from "../../utils/files";
import { num, str } from "../../utils/format";
import type { Tone } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { AsyncButton } from "../form/AsyncButton";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";

interface ContexteLigneProps {
  type: TypeRegistre;
  ws: Worksheet;
  moteur: MoteurFormules;
  ligne: number;
  revision: number;
  onAction: (message: string) => void;
}

const MESSAGE_SYNCHRO =
"Échéance mise à jour. Le registre sera resynchronisé sous quelques secondes : rechargez-le avant d'enregistrer d'autres modifications.";

export function ContexteLigne({ type, ws, moteur, ligne, onAction }: ContexteLigneProps) {
  const h = entetesFeuille(ws);
  if (ligne < 2 || !h[C.cle]) return null;
  const cle = str(ws.getCell(ligne, h[C.cle]).value);
  if (!cle) return null;
  const v = (nom: string) => h[nom] ? affichageCellule(ws, moteur, ligne, h[nom]).texte : "";
  const brut = (nom: string) => h[nom] ? ws.getCell(ligne, h[nom]).value : null;
  const eleve = `${v(C.prenom)} ${v(C.nom)}`.trim();

  if (type === "finance" && ws.name === FEUILLE_ECHEANCES) {
    const overrideActif = v(C.overrideActif) === "Oui";
    const statut = v(C.statut);
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--em-border)] bg-black/[0.02] px-4 py-2">
        <WalletIcon className="ecole_m-muted h-4 w-4 shrink-0" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          <span className="font-semibold">{eleve || v(C.matricule)}</span>
          <span className="ecole_m-muted truncate">{v(C.echeance)}</span>
          {v(C.dateEcheance) && <span className="ecole_m-muted tabular-nums">{v(C.dateEcheance)}</span>}
          {statut && <Badge tone={toneStatutEcheance(statut)}>{statut}</Badge>}
          {overrideActif && <Badge tone="warning">Statut manuel : {v(C.statutManuel) || "actif"}</Badge>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <FormAction
            label="Statut manuel"
            icon={PencilIcon}
            size="sm"
            variant="primary"
            description="Le manuel prime sur l'automatique : l'échéance ne sera plus modifiée par les paiements ni par la détection d'impayés."
            fields={overrideEcheanceFields}
            initial={{
              statut: overrideActif ? str(brut(C.statutManuel)) : undefined,
              montant: overrideActif ? num(brut(C.montantManuel)) ?? undefined : undefined,
              motif: overrideActif ? str(brut(C.motifManuel)) : undefined
            }}
            submitLabel="Appliquer"
            successMessage="Statut manuel appliqué"
            showResult
            onSubmit={(b) =>
            overrideEcheance(cle, {
              statut: str(b.statut) as StatutOverrideEcheance,
              montant: str(b.statut) === "Partiel" ? num(b.montant) : undefined,
              motif: str(b.motif) || undefined
            })
            }
            onDone={() => onAction(MESSAGE_SYNCHRO)} />
          
          {overrideActif &&
          <ConfirmAction
            label="Retour en automatique"
            icon={RotateCcwIcon}
            size="sm"
            message="L'échéance reprendra son calcul automatique à partir des paiements."
            run={() => retirerOverrideEcheance(cle)}
            successMessage="Échéance repassée en automatique"
            showResult
            onDone={() => onAction(MESSAGE_SYNCHRO)} />

          }
        </div>
      </div>);

  }

  if (type === "dossier" && ws.name === FEUILLE_ELEVES_DOSSIER) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--em-border)] bg-black/[0.02] px-4 py-2">
        <UserRoundIcon className="ecole_m-muted h-4 w-4 shrink-0" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          <span className="font-semibold">{eleve}</span>
          <span className="ecole_m-muted font-mono text-[12px]">{v(C.matricule)}</span>
          {v(C.situation) && <span className="ecole_m-muted">{v(C.situation)}</span>}
          {v(C.statutFinancier) && <Badge tone={toneStatutEcheance(v(C.statutFinancier))}>{v(C.statutFinancier)}</Badge>}
        </div>
        <AsyncButton
          label="Exporter sa situation financière"
          icon={FileDownIcon}
          size="sm"
          successMessage="Export téléchargé"
          onClick={async () => saveFile(await exporterFinanceEleve(cle))} />
        
      </div>);

  }

  return null;
}

/** Couleurs des règles conditionnelles du registre financier (retard, avance, Partiel, Payé, Exonéré). */
function toneStatutEcheance(s: string): Tone {
  const t = s.toLowerCase();
  if (t.includes("retard")) return "danger";
  if (t.includes("avance")) return "info";
  if (t.includes("partiel")) return "warning";
  if (t.includes("payé") || t.includes("soldé") || t.includes("à jour")) return "success";
  return "neutral";
}