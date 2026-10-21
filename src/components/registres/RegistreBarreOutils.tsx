import React, { useRef } from "react";
import {
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  Redo2Icon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon,
  Undo2Icon,
  UploadIcon,
  XIcon } from
"lucide-react";
import { synchroRegistresEtAttendre } from "../../lib/api_ecole";
import type { TypeRegistre } from "../../types/ui";
import { synchroRegistreFields } from "../../data/fields/registres";
import { XLSX_MIME } from "../../utils/xlsx";
import { AsyncButton } from "../form/AsyncButton";
import { FormAction } from "../form/FormAction";
import { BoutonOutil } from "./BoutonOutil";

interface RegistreBarreOutilsProps {
  classeId: string;
  type: TypeRegistre;
  pret: boolean;
  nbModifs: number;
  envoi: boolean;
  peutAnnuler: boolean;
  peutRetablir: boolean;
  recherche: string;
  afficherMasquees: boolean;
  onEnregistrer: () => void;
  onAnnuler: () => void;
  onRetablir: () => void;
  onAbandonner: () => void;
  onRecharger: () => void;
  onTelecharger: () => Promise<void>;
  onTeleverser: (f: File) => void;
  onSynchronise: () => void;
  onRecherche: (v: string) => void;
  onAfficherMasquees: (v: boolean) => void;
}

const SEP = <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-[var(--em-border)] sm:block" aria-hidden />;

export function RegistreBarreOutils(p: RegistreBarreOutilsProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--em-border)] px-2 py-1.5">
      <BoutonOutil
        label={p.envoi ? "Enregistrement…" : "Enregistrer"}
        icon={p.envoi ? LoaderCircleIcon : SaveIcon}
        primary
        badge={p.nbModifs}
        disabled={!p.pret || p.envoi || p.nbModifs === 0}
        title="Enregistrer et téléverser le registre (Ctrl+S)"
        onClick={p.onEnregistrer} />
      
      <BoutonOutil label="Annuler (Ctrl+Z)" icon={Undo2Icon} iconOnly disabled={!p.peutAnnuler || p.envoi} onClick={p.onAnnuler} />
      <BoutonOutil label="Rétablir (Ctrl+Y)" icon={Redo2Icon} iconOnly disabled={!p.peutRetablir || p.envoi} onClick={p.onRetablir} />
      <BoutonOutil
        label="Abandonner les modifications"
        icon={RotateCcwIcon}
        iconOnly
        disabled={p.nbModifs === 0 || p.envoi}
        onClick={p.onAbandonner} />
      
      {SEP}
      <BoutonOutil label="Recharger" icon={RefreshCwIcon} iconOnly disabled={p.envoi} onClick={p.onRecharger} />
      <AsyncButton label="Télécharger le fichier" icon={DownloadIcon} iconOnly size="sm" variant="subtle" onClick={p.onTelecharger} />
      <BoutonOutil
        label="Téléverser un fichier"
        icon={UploadIcon}
        iconOnly
        disabled={p.envoi}
        title="Remplacer le registre par un fichier .xlsx téléchargé depuis l'application"
        onClick={() => input.current?.click()} />
      
      <input
        ref={input}
        type="file"
        accept={`.xlsx,${XLSX_MIME}`}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) p.onTeleverser(f);
        }} />
      
      <FormAction
        label="Synchroniser"
        icon={RefreshCwIcon}
        size="sm"
        description={
        p.nbModifs > 0 ?
        "Le registre sera recalculé depuis la base. Vos modifications non enregistrées seront perdues." :
        "Le registre sera recalculé depuis la base."
        }
        fields={synchroRegistreFields}
        submitLabel="Synchroniser"
        successMessage="Registre synchronisé"
        showResult
        onSubmit={(b) => synchroRegistresEtAttendre({ classe_id: p.classeId, types: [p.type], complet: b.complet === true })}
        onDone={p.onSynchronise} />
      
      <div className="ml-auto flex items-center gap-1">
        <label className="relative flex items-center">
          <span className="sr-only">Rechercher dans la feuille</span>
          <SearchIcon className="ecole_m-muted pointer-events-none absolute left-2.5 h-3.5 w-3.5" aria-hidden />
          <input
            value={p.recherche}
            onChange={(e) => p.onRecherche(e.target.value)}
            placeholder="Rechercher dans la feuille"
            className="h-8 w-[200px] rounded-md border border-[var(--em-border)] bg-transparent pl-8 pr-7 text-[12.5px] outline-none transition-[box-shadow,border-color] duration-150 focus:border-[var(--em-accent)] focus:ring-2 focus:ring-[var(--em-accent)]/20 lg:w-[240px]" />
          
          {p.recherche &&
          <button
            type="button"
            onClick={() => p.onRecherche("")}
            aria-label="Effacer la recherche"
            className="absolute right-1.5 grid h-5 w-5 place-items-center rounded transition-colors duration-150 hover:bg-black/[0.06]">
            
              <XIcon className="h-3 w-3" />
            </button>
          }
        </label>
        <BoutonOutil
          label={p.afficherMasquees ? "Masquer les colonnes cachées" : "Afficher les colonnes cachées"}
          icon={p.afficherMasquees ? EyeOffIcon : EyeIcon}
          iconOnly
          pressed={p.afficherMasquees}
          onClick={() => p.onAfficherMasquees(!p.afficherMasquees)} />
        
      </div>
    </div>);

}