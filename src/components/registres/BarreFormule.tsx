import React, { useEffect, useState } from "react";
import { SigmaIcon } from "lucide-react";

interface BarreFormuleProps {
  adresse: string;
  entete: string;
  texte: string;
  actif: boolean;
  onValider: (texte: string) => void;
}

export function BarreFormule({ adresse, entete, texte, actif, onValider }: BarreFormuleProps) {
  const [valeur, setValeur] = useState(texte);

  useEffect(() => setValeur(texte), [texte, adresse]);

  return (
    <div className="flex items-center gap-2 border-b border-[var(--em-border)] px-3 py-1.5">
      <span
        aria-label="Cellule sélectionnée"
        className="w-[72px] shrink-0 rounded-md border border-[var(--em-border)] bg-black/[0.02] px-2 py-1 text-center font-mono text-[12px] font-medium tabular-nums">
        
        {adresse || "—"}
      </span>
      <SigmaIcon className="ecole_m-muted h-4 w-4 shrink-0" aria-hidden />
      <input
        value={valeur}
        disabled={!actif}
        onChange={(e) => setValeur(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (valeur !== texte) onValider(valeur);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setValeur(texte);
          }
        }}
        onBlur={() => {
          if (actif && valeur !== texte) onValider(valeur);
        }}
        placeholder={actif ? "" : "Sélectionnez une cellule"}
        aria-label={entete ? `Contenu — ${entete}` : "Contenu de la cellule"}
        className="h-8 min-w-0 flex-1 rounded-md border border-[var(--em-border)] bg-transparent px-2.5 font-mono text-[12.5px] outline-none transition-[box-shadow,border-color] duration-150 focus:border-[var(--em-accent)] focus:ring-2 focus:ring-[var(--em-accent)]/20 disabled:opacity-50" />
      
      {entete &&
      <span className="ecole_m-muted hidden max-w-[240px] shrink-0 truncate text-[12px] lg:block" title={entete}>
          {entete}
        </span>
      }
    </div>);

}