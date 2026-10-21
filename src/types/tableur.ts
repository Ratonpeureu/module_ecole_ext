import type { CellValue } from "exceljs";

export interface ColonneTableur {
  index: number;
  lettre: string;
  largeur: number;
  cachee: boolean;
}

export interface CelluleRef {
  ligne: number;
  colonne: number;
}

export interface CibleCollage extends CelluleRef {
  texte: string;
}

export interface StyleCellule {
  fond?: string;
  couleur?: string;
  gras: boolean;
  italique: boolean;
  alignement?: "left" | "center" | "right";
  retour: boolean;
}

export interface AffichageCellule {
  texte: string;
  numerique: boolean;
  erreur: boolean;
}

export interface ModificationCellule {
  feuille: string;
  ligne: number;
  colonne: number;
  valeur: CellValue;
}

export type SensTri = "asc" | "desc";

export interface TriColonne {
  colonne: number;
  sens: SensTri;
}
