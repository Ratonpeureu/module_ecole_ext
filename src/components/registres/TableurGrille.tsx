import React, { useMemo } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { HAUTEUR_ENTETE, LARGEUR_NUMEROS, useTableurGrille } from "../../hooks/useTableurGrille";
import type { OptionsGrille } from "../../hooks/useTableurGrille";
import { HAUTEUR_LIGNE_DEFAUT, affichageCellule, hauteurLigne, styleCellule } from "../../utils/xlsx";
import { fondConditionnel, reglesConditionnelles } from "../../utils/miseEnForme";

interface TableurGrilleProps extends OptionsGrille {
  modifiees: Set<string>;
}

const BORD = "border-b border-r border-black/[0.08]";

export function TableurGrille(props: TableurGrilleProps) {
  const g = useTableurGrille(props);
  const { ws, moteur, selection, modifiees, revision } = props;
  const regles = useMemo(() => reglesConditionnelles(ws), [ws]);
  const largeur = LARGEUR_NUMEROS + g.colonnes.reduce((s, c) => s + c.largeur, 0);
  const margeHaut = HAUTEUR_ENTETE + g.hauteurFixe;

  const rendreCellule = (l: number, col: number, top: number | null, cachee: boolean) => {
    const st = styleCellule(ws, l, col);
    const aff = affichageCellule(ws, moteur, l, col);
    const fond = (top === null ? fondConditionnel(regles, moteur, ws.name, l, col) : undefined) ?? st.fond;
    const sel = selection?.ligne === l && selection?.colonne === col;
    const enEdition = g.edition?.ligne === l && g.edition?.colonne === col;
    const modifiee = modifiees.has(`${l}:${col}`);
    const align = st.alignement ?? (aff.erreur ? "center" : aff.numerique ? "right" : "left");
    const retour = st.retour && !g.virtualise;
    return (
      <td
        key={col}
        role="gridcell"
        aria-selected={sel}
        data-cellule={`${l}:${col}`}
        onMouseDown={(e) => {
          if (e.button === 0 && !enEdition) props.onSelection({ ligne: l, colonne: col });
        }}
        onDoubleClick={() => g.commencerEdition({ ligne: l, colonne: col })}
        title={aff.texte.length > 18 ? aff.texte : undefined}
        style={{
          background: fond,
          color: aff.erreur ? "var(--em-warning)" : st.couleur,
          fontWeight: st.gras ? 600 : undefined,
          fontStyle: st.italique ? "italic" : undefined,
          textAlign: align,
          top: top ?? undefined,
          scrollMarginTop: top === null ? margeHaut : undefined,
          scrollMarginLeft: LARGEUR_NUMEROS
        }}
        className={`relative cursor-cell px-2 text-[12.5px] leading-tight ${BORD} ${top !== null ? "sticky z-[15]" : ""} ${
        fond ? "" : "bg-[var(--em-surface,#ffffff)]"} ${
        cachee ? "opacity-60" : ""}`}>
        
        <span className={retour ? "block whitespace-pre-wrap break-words py-1" : "block truncate"}>{aff.texte}</span>
        {modifiee &&
        <span
          aria-label="Cellule modifiée"
          className="absolute right-0 top-0 h-0 w-0 border-l-[7px] border-t-[7px] border-l-transparent border-t-[var(--em-accent)]" />

        }
        {sel && !enEdition &&
        <span aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ boxShadow: "inset 0 0 0 2px var(--em-accent)" }} />
        }
        {enEdition && g.edition && (
        g.edition.liste ?
        <select
          autoFocus
          aria-label="Valeur de la cellule"
          defaultValue={g.edition.texte}
          onChange={(e) => g.terminerEdition(e.target.value, [0, 0])}
          onKeyDown={g.onToucheEdition}
          onBlur={() => g.terminerEdition(null, [0, 0])}
          className="absolute inset-0 z-[2] h-full w-full min-w-[140px] rounded-none border-0 bg-[var(--em-surface,#ffffff)] px-1.5 text-[12.5px] text-[#1A1A1A] outline-none"
          style={{ boxShadow: "inset 0 0 0 2px var(--em-accent)" }}>
          
              <option value="">(vide)</option>
              {g.edition.liste.map((v) =>
          <option key={v} value={v}>
                  {v}
                </option>
          )}
            </select> :

        <input
          autoFocus
          aria-label="Valeur de la cellule"
          value={g.edition.texte}
          onChange={(e) => g.setTexteEdition(e.target.value)}
          onKeyDown={g.onToucheEdition}
          onFocus={(e) => {
            const n = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(n, n);
          }}
          onBlur={(e) => g.terminerEdition(e.currentTarget.value, [0, 0])}
          className="absolute inset-0 z-[2] h-full w-full min-w-[120px] border-0 bg-[var(--em-surface,#ffffff)] px-2 text-[12.5px] font-normal text-[#1A1A1A] outline-none"
          style={{ boxShadow: "inset 0 0 0 2px var(--em-accent)", textAlign: "left" }} />)


        }
      </td>);

  };

  const rendreLigne = (l: number, top: number | null, h: number) => {
    const ligneSel = selection?.ligne === l;
    return (
      <tr key={l} style={{ height: h }}>
        <th
          scope="row"
          style={top !== null ? { top } : undefined}
          className={`sticky left-0 select-none px-1 text-center text-[11.5px] font-medium tabular-nums transition-colors duration-150 ${BORD} ${
          top !== null ? "z-[25]" : "z-10"} ${
          ligneSel ? "bg-[var(--em-accent-soft)] text-[var(--em-accent)]" : "bg-[#F5F5F5] text-[#5D5D5D]"}`}>
          
          {l}
        </th>
        {g.colonnes.map((c) => rendreCellule(l, c.index, top, c.cachee))}
      </tr>);

  };

  const nbCol = g.colonnes.length + 1;

  return (
    <div
      ref={g.conteneur}
      tabIndex={0}
      role="grid"
      aria-label={`Feuille ${ws.name}`}
      aria-rowcount={ws.rowCount}
      aria-colcount={g.colonnes.length}
      data-revision={revision}
      onKeyDown={g.onTouche}
      onCopy={g.onCopier}
      onPaste={g.onColler}
      onScroll={g.onDefilement}
      className="ecole_m-scroll relative h-full overflow-auto bg-[var(--em-surface,#ffffff)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--em-accent)]">
      
      {g.colonnes.length === 0 ?
      <div className="grid h-full place-items-center text-[13px] text-[#5D5D5D]">Cette feuille est vide.</div> :

      <table className="border-separate border-spacing-0" style={{ width: largeur, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: LARGEUR_NUMEROS }} />
            {g.colonnes.map((c) =>
          <col key={c.index} style={{ width: c.largeur }} />
          )}
          </colgroup>
          <thead>
            <tr style={{ height: HAUTEUR_ENTETE }}>
              <th aria-label="Numéros de ligne" className={`sticky left-0 top-0 z-30 bg-[#EDEDED] ${BORD}`} />
              {g.colonnes.map((c) => {
              const triActif = g.tri?.colonne === c.index;
              const colSel = selection?.colonne === c.index;
              return (
                <th
                  key={c.index}
                  scope="col"
                  aria-sort={triActif ? g.tri?.sens === "asc" ? "ascending" : "descending" : undefined}
                  className={`sticky top-0 z-20 p-0 ${BORD} ${colSel ? "bg-[var(--em-accent-soft)]" : "bg-[#F5F5F5]"}`}>
                  
                    <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => g.basculerTri(c.index)}
                    title={c.cachee ? "Colonne masquée dans Excel — cliquer pour trier" : "Cliquer pour trier"}
                    className={`flex h-[26px] w-full items-center justify-center gap-1 text-[11.5px] font-semibold transition-colors duration-150 hover:bg-black/[0.05] ${
                    colSel || triActif ? "text-[var(--em-accent)]" : "text-[#5D5D5D]"} ${
                    c.cachee ? "italic opacity-70" : ""}`}>
                    
                      {c.lettre}
                      {triActif && (
                    g.tri?.sens === "asc" ? <ArrowUpIcon className="h-3 w-3" aria-hidden /> : <ArrowDownIcon className="h-3 w-3" aria-hidden />)}
                    </button>
                  </th>);

            })}
            </tr>
            {g.lignesFixes.map((l, i) => rendreLigne(l, g.topsFixes[i], g.hauteursFixes[i]))}
          </thead>
          <tbody>
            {g.espaceHaut > 0 &&
          <tr aria-hidden style={{ height: g.espaceHaut }}>
                <td colSpan={nbCol} />
              </tr>
          }
            {g.visibles.map((l) => rendreLigne(l, null, g.virtualise ? HAUTEUR_LIGNE_DEFAUT : hauteurLigne(ws, l)))}
            {g.espaceBas > 0 &&
          <tr aria-hidden style={{ height: g.espaceBas }}>
                <td colSpan={nbCol} />
              </tr>
          }
            {g.lignesCorps.length === 0 && props.recherche.trim() !== "" &&
          <tr>
                <td colSpan={nbCol} className="sticky left-0 px-4 py-8 text-left text-[13px] text-[#5D5D5D]">
                  Aucune ligne ne contient « {props.recherche.trim()} ».
                </td>
              </tr>
          }
          </tbody>
        </table>
      }
    </div>);

}