import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Worksheet } from "exceljs";
import type { CelluleRef, CibleCollage, TriColonne } from "../types/tableur";
import { ErreurFormule } from "../utils/formules";
import type { MoteurFormules, ValeurCalc } from "../utils/formules";
import {
  HAUTEUR_LIGNE_DEFAUT,
  affichageCellule,
  colonnesFeuille,
  hauteurLigne,
  lignesFigees,
  listeValidation,
  texteSaisie
} from "../utils/xlsx";

export const HAUTEUR_ENTETE = 26;
export const LARGEUR_NUMEROS = 52;
const SEUIL_VIRTUALISATION = 200;
const MARGE = 12;

export interface EditionCellule extends CelluleRef {
  texte: string;
  liste: string[] | null;
}

export interface OptionsGrille {
  ws: Worksheet;
  moteur: MoteurFormules;
  revision: number;
  recherche: string;
  afficherMasquees: boolean;
  selection: CelluleRef | null;
  onSelection: (s: CelluleRef) => void;
  onValider: (ligne: number, colonne: number, texte: string) => void;
  onEffacer: (cellules: CelluleRef[]) => void;
  onColler: (cibles: CibleCollage[]) => void;
  onAnnuler: () => void;
  onRetablir: () => void;
}

const borner = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function useTableurGrille(o: OptionsGrille) {
  const { ws, moteur, revision, selection } = o;
  const conteneur = useRef<HTMLDivElement>(null);
  const editionRef = useRef<EditionCellule | null>(null);
  const [edition, setEditionEtat] = useState<EditionCellule | null>(null);
  const [tri, setTri] = useState<TriColonne | null>(null);
  const [defil, setDefil] = useState(0);
  const [hauteur, setHauteur] = useState(600);

  const setEdition = (e: EditionCellule | null) => {
    editionRef.current = e;
    setEditionEtat(e);
  };

  useEffect(() => {
    setTri(null);
    setEdition(null);
    setDefil(0);
    conteneur.current?.scrollTo({ top: 0, left: 0 });
  }, [ws]);

  useEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHauteur(el.clientHeight));
    ro.observe(el);
    setHauteur(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const colonnes = useMemo(
    () => colonnesFeuille(ws).filter((c) => o.afficherMasquees || !c.cachee),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ws, o.afficherMasquees, revision]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nbFigees = useMemo(() => Math.min(lignesFigees(ws), ws.rowCount), [ws, revision]);
  const lignesFixes = useMemo(() => Array.from({ length: nbFigees }, (_, i) => i + 1), [nbFigees]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hauteursFixes = useMemo(() => lignesFixes.map((l) => hauteurLigne(ws, l)), [lignesFixes, ws, revision]);
  const topsFixes = useMemo(() => {
    const out: number[] = [];
    hauteursFixes.forEach((_, i) => out.push(i === 0 ? HAUTEUR_ENTETE : out[i - 1] + hauteursFixes[i - 1]));
    return out;
  }, [hauteursFixes]);

  const lignesCorps = useMemo(() => {
    let lignes: number[] = [];
    for (let l = nbFigees + 1; l <= ws.rowCount; l++) lignes.push(l);
    const q = o.recherche.trim().toLowerCase();
    if (q) {
      lignes = lignes.filter((l) => colonnes.some((c) => affichageCellule(ws, moteur, l, c.index).texte.toLowerCase().includes(q)));
    }
    if (tri) {
      const sens = tri.sens === "asc" ? 1 : -1;
      const v = new Map(lignes.map((l) => [l, moteur.valeur(ws.name, l, tri.colonne)] as const));
      lignes.sort((a, b) => comparerTri(v.get(a) ?? null, v.get(b) ?? null, sens));
    }
    return lignes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws, moteur, revision, o.recherche, colonnes, tri, nbFigees]);

  const lignes = useMemo(() => [...lignesFixes, ...lignesCorps], [lignesFixes, lignesCorps]);
  const virtualise = lignesCorps.length > SEUIL_VIRTUALISATION;
  const hauteurFixe = hauteursFixes.reduce((s, h) => s + h, 0);
  const H = HAUTEUR_LIGNE_DEFAUT;
  const debut = virtualise ? Math.max(0, Math.floor((defil - hauteurFixe) / H) - MARGE) : 0;
  const fin = virtualise ? Math.min(lignesCorps.length, Math.ceil((defil + hauteur) / H) + MARGE) : lignesCorps.length;
  const visibles = lignesCorps.slice(debut, fin);
  const espaceHaut = debut * H;
  const espaceBas = (lignesCorps.length - fin) * H;

  const deplacer = useCallback(
    (dl: number, dc: number, depuis?: CelluleRef) => {
      if (!lignes.length || !colonnes.length) return;
      const s = depuis ?? selection ?? { ligne: lignes[0], colonne: colonnes[0].index };
      const iL = Math.max(0, lignes.indexOf(s.ligne));
      const iC = Math.max(0, colonnes.findIndex((c) => c.index === s.colonne));
      o.onSelection({
        ligne: lignes[borner(iL + dl, 0, lignes.length - 1)],
        colonne: colonnes[borner(iC + dc, 0, colonnes.length - 1)].index
      });
    },
    [lignes, colonnes, selection, o]
  );

  const commencerEdition = useCallback(
    (cible?: CelluleRef, texteInitial?: string) => {
      const s = cible ?? selection;
      if (!s) return;
      const cell = ws.getCell(s.ligne, s.colonne);
      setEdition({
        ligne: s.ligne,
        colonne: s.colonne,
        texte: texteInitial ?? texteSaisie(cell.value),
        liste: listeValidation(ws, s.ligne, s.colonne)
      });
    },
    [ws, selection]
  );

  const terminerEdition = (texte: string | null, mouvement: [number, number]) => {
    const e = editionRef.current;
    if (!e) return;
    setEdition(null);
    if (texte !== null) o.onValider(e.ligne, e.colonne, texte);
    if (mouvement[0] || mouvement[1]) deplacer(mouvement[0], mouvement[1], { ligne: e.ligne, colonne: e.colonne });
    requestAnimationFrame(() => conteneur.current?.focus({ preventScroll: true }));
  };

  const setTexteEdition = (texte: string) => {
    if (editionRef.current) setEdition({ ...editionRef.current, texte });
  };

  const onToucheEdition = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.stopPropagation();
    const valeur = e.currentTarget.value;
    if (e.key === "Enter") {
      e.preventDefault();
      terminerEdition(valeur, [e.shiftKey ? -1 : 1, 0]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      terminerEdition(valeur, [0, e.shiftKey ? -1 : 1]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      terminerEdition(null, [0, 0]);
    }
  };

  const onTouche = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editionRef.current) return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod && k === "z") {
      e.preventDefault();
      if (e.shiftKey) o.onRetablir();
      else o.onAnnuler();
      return;
    }
    if (mod && k === "y") {
      e.preventDefault();
      o.onRetablir();
      return;
    }
    if (mod) return;
    if (!selection) {
      if (e.key.startsWith("Arrow") || e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        deplacer(0, 0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        deplacer(1, 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        deplacer(-1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        deplacer(0, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        deplacer(0, -1);
        break;
      case "Tab":
        e.preventDefault();
        deplacer(0, e.shiftKey ? -1 : 1);
        break;
      case "Enter":
        e.preventDefault();
        deplacer(e.shiftKey ? -1 : 1, 0);
        break;
      case "PageDown":
        e.preventDefault();
        deplacer(20, 0);
        break;
      case "PageUp":
        e.preventDefault();
        deplacer(-20, 0);
        break;
      case "Home":
        e.preventDefault();
        deplacer(0, -colonnes.length);
        break;
      case "End":
        e.preventDefault();
        deplacer(0, colonnes.length);
        break;
      case "F2":
        e.preventDefault();
        commencerEdition();
        break;
      case "Delete":
      case "Backspace":
        e.preventDefault();
        o.onEffacer([selection]);
        break;
      default:
        if (e.key.length === 1 && !e.altKey) {
          e.preventDefault();
          commencerEdition(undefined, e.key);
        }
    }
  };

  const onCopier = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (editionRef.current || !selection) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", affichageCellule(ws, moteur, selection.ligne, selection.colonne).texte);
  };

  const onColler = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (editionRef.current || !selection) return;
    const brut = e.clipboardData.getData("text/plain");
    if (!brut) return;
    e.preventDefault();
    const grille = brut
      .replace(/\r\n?/g, "\n")
      .replace(/\n$/, "")
      .split("\n")
      .map((l) => l.split("\t"));
    const iL = lignes.indexOf(selection.ligne);
    const iC = colonnes.findIndex((c) => c.index === selection.colonne);
    const cibles: CibleCollage[] = [];
    grille.forEach((r, dl) =>
      r.forEach((texte, dc) => {
        const l = lignes[iL + dl];
        const c = colonnes[iC + dc];
        if (l !== undefined && c) cibles.push({ ligne: l, colonne: c.index, texte });
      })
    );
    if (cibles.length) o.onColler(cibles);
  };

  const onDefilement = (e: React.UIEvent<HTMLDivElement>) => {
    if (virtualise) setDefil(e.currentTarget.scrollTop);
  };

  const basculerTri = (colonne: number) => {
    setTri((t) => (!t || t.colonne !== colonne ? { colonne, sens: "asc" } : t.sens === "asc" ? { colonne, sens: "desc" } : null));
  };

  useEffect(() => {
    const el = conteneur.current;
    if (!el || !selection) return;
    if (virtualise) {
      const i = lignesCorps.indexOf(selection.ligne);
      if (i >= 0) {
        const haut = HAUTEUR_ENTETE + hauteurFixe + i * H;
        const visibleHaut = el.scrollTop + HAUTEUR_ENTETE + hauteurFixe;
        if (haut < visibleHaut) el.scrollTop = haut - HAUTEUR_ENTETE - hauteurFixe;
        else if (haut + H > el.scrollTop + el.clientHeight) el.scrollTop = haut + H - el.clientHeight;
      }
    }
    const id = requestAnimationFrame(() => {
      el.querySelector<HTMLElement>(`[data-cellule="${selection.ligne}:${selection.colonne}"]`)?.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return {
    conteneur,
    colonnes,
    lignesFixes,
    hauteursFixes,
    topsFixes,
    lignesCorps,
    visibles,
    virtualise,
    espaceHaut,
    espaceBas,
    hauteurFixe,
    tri,
    basculerTri,
    edition,
    commencerEdition,
    terminerEdition,
    setTexteEdition,
    onToucheEdition,
    onTouche,
    onCopier,
    onColler,
    onDefilement
  };
}

function comparerTri(a: ValeurCalc, b: ValeurCalc, sens: number): number {
  const vide = (x: ValeurCalc) => x === null || x === "" || x instanceof ErreurFormule;
  if (vide(a) && vide(b)) return 0;
  if (vide(a)) return 1;
  if (vide(b)) return -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * sens;
  if (typeof a === "number") return -sens;
  if (typeof b === "number") return sens;
  return String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" }) * sens;
}
