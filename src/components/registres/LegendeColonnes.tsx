import React from "react";
import { LEGENDE_COLONNES } from "../../data/registres";

export function LegendeColonnes() {
  return (
    <ul aria-label="Légende des colonnes" className="hidden shrink-0 items-center gap-3 xl:flex">
      {LEGENDE_COLONNES.map((l) =>
      <li key={l.libelle} className="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-[#5D5D5D]">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: l.couleur }} aria-hidden />
          {l.libelle}
        </li>
      )}
    </ul>);

}