import React from "react";
import { ChevronRightIcon, FilePlusIcon } from "lucide-react";
import type { RegistreInfo } from "../../types/ui";
import { formatDateTime, formatNumber } from "../../utils/format";

interface CelluleRegistreProps {
  info: RegistreInfo | null;
  libelle: string;
  onOuvrir: () => void;
}

export function CelluleRegistre({ info, libelle, onOuvrir }: CelluleRegistreProps) {
  return (
    <button
      type="button"
      onClick={onOuvrir}
      aria-label={`Ouvrir le registre ${libelle}`}
      className={`group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left outline-none transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[var(--em-accent)]/40 hover:bg-[var(--em-accent-soft)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)] ${
      info ? "border-[var(--em-border)]" : "border-dashed border-[var(--em-border)]"}`
      }>
      
      <span className="min-w-0 flex-1">
        {info ?
        <>
            <span className="block text-[13px] font-semibold tabular-nums">Version {formatNumber(info.version)}</span>
            <span className="ecole_m-muted block truncate text-[11.5px]">
              {info.derniere_synchro ? `Synchro ${formatDateTime(info.derniere_synchro)}` : "Jamais synchronisé"}
            </span>
            {info.modifie_par &&
          <span
            className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-[#B45309]"
            title={info.modifie_par_le ? formatDateTime(info.modifie_par_le) : undefined}>
            
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97706]" aria-hidden />
                <span className="truncate">{info.modifie_par}</span>
              </span>
          }
          </> :

        <>
            <span className="ecole_m-muted flex items-center gap-1.5 text-[13px] font-medium">
              <FilePlusIcon className="h-3.5 w-3.5" aria-hidden />
              Non généré
            </span>
            <span className="ecole_m-muted block text-[11.5px]">Créé à l'ouverture</span>
          </>
        }
      </span>
      <ChevronRightIcon
        className="ecole_m-muted h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--em-accent)]"
        aria-hidden />
      
    </button>);

}