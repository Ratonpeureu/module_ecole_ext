// Lecture / écriture des classeurs Excel des registres (ExcelJS, chargé à la demande).
import type { CellValue, Workbook, Worksheet } from "exceljs";
import type { AffichageCellule, ColonneTableur, StyleCellule } from "../types/tableur";
import { ErreurFormule, MoteurFormules, dateDepuisSerial } from "./formules";

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const HAUTEUR_LIGNE_DEFAUT = 28;

type ExcelJSModule = typeof import("exceljs");

async function bibliotheque(): Promise<ExcelJSModule> {
  const mod = (await import("exceljs")) as ExcelJSModule & { default?: ExcelJSModule };
  return mod.default ?? mod;
}

export async function chargerClasseur(blob: Blob): Promise<Workbook> {
  const L = await bibliotheque();
  const wb = new L.Workbook();
  await wb.xlsx.load(await blob.arrayBuffer());
  return wb;
}

export async function exporterClasseur(wb: Workbook, nom: string): Promise<File> {
  wb.calcProperties.fullCalcOnLoad = true;
  const buf = await wb.xlsx.writeBuffer();
  return new File([buf], nom, { type: XLSX_MIME });
}

export function lettreColonne(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

export function feuillesVisibles(wb: Workbook): string[] {
  return wb.worksheets.filter((ws) => !ws.state || ws.state === "visible").map((ws) => ws.name);
}

export function feuilleActive(wb: Workbook): string | null {
  const i = wb.views?.[0]?.activeTab ?? 0;
  return wb.worksheets[i]?.name ?? null;
}

export function colonnesFeuille(ws: Worksheet): ColonneTableur[] {
  const n = ws.columnCount;
  return Array.from({ length: n }, (_, i) => {
    const col = ws.getColumn(i + 1);
    return {
      index: i + 1,
      lettre: lettreColonne(i + 1),
      largeur: Math.round((col.width ?? 8.43) * 7 + 5),
      cachee: !!col.hidden
    };
  });
}

export function lignesFigees(ws: Worksheet): number {
  const v = (ws.views ?? [])[0] as { state?: string; ySplit?: number } | undefined;
  return v?.state === "frozen" ? v.ySplit ?? 0 : 0;
}

export function hauteurLigne(ws: Worksheet, ligne: number): number {
  const h = ws.findRow(ligne)?.height;
  return h ? Math.max(20, Math.round((h * 4) / 3)) : HAUTEUR_LIGNE_DEFAUT;
}

const hex = (argb?: string): string | undefined => (argb && argb.length >= 6 ? `#${argb.slice(-6)}` : undefined);

export function styleCellule(ws: Worksheet, ligne: number, colonne: number): StyleCellule {
  const row = ws.findRow(ligne);
  if (!row) return { gras: false, italique: false, retour: false };
  const cell = row.getCell(colonne);
  const fill = cell.fill;
  const fond = fill && fill.type === "pattern" && fill.pattern === "solid" ? hex(fill.fgColor?.argb) : undefined;
  const font = cell.font;
  const h = cell.alignment?.horizontal;
  return {
    fond,
    couleur: hex(font?.color?.argb),
    gras: !!font?.bold,
    italique: !!font?.italic,
    alignement: h === "center" || h === "left" || h === "right" ? h : undefined,
    retour: !!cell.alignment?.wrapText
  };
}

export function listeValidation(ws: Worksheet, ligne: number, colonne: number): string[] | null {
  try {
    const dv = ws.getCell(ligne, colonne).dataValidation;
    if (!dv || dv.type !== "list" || !dv.formulae?.length) return null;
    const f = String(dv.formulae[0]);
    if (!f.startsWith('"')) return null;
    return f.slice(1, -1).split(",");
  } catch {
    return null;
  }
}

export function entetesFeuille(ws: Worksheet): Record<string, number> {
  const out: Record<string, number> = {};
  const row = ws.findRow(1);
  if (!row) return out;
  row.eachCell((cell, col) => {
    const v = cell.value;
    if (v !== null && v !== undefined && v !== "") out[String(v).trim()] = col;
  });
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateUTC = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;

function estFormatDate(fmt?: string): boolean {
  if (!fmt) return false;
  const nu = fmt.replace(/"[^"]*"/g, "").replace(/\[[^\]]*\]/g, "");
  return /[dy]/i.test(nu) && !nu.includes("#") && !nu.includes("0");
}

function formaterNombre(n: number, fmt?: string): string {
  if (estFormatDate(fmt)) return dateUTC(dateDepuisSerial(n));
  if (fmt && fmt.includes("%")) {
    const dec = (fmt.split(".")[1] ?? "").replace(/[^0]/g, "").length;
    return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n * 100)} %`;
  }
  if (fmt && /[#0]/.test(fmt) && fmt !== "General") {
    const dec = (fmt.split(".")[1] ?? "").replace(/[^0#]/g, "").length;
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: (fmt.split(".")[1] ?? "").replace(/[^0]/g, "").length,
      maximumFractionDigits: dec,
      useGrouping: fmt.includes(",")
    }).format(n);
  }
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 10, useGrouping: false }).format(n);
}

const VIDE: AffichageCellule = { texte: "", numerique: false, erreur: false };

export function affichageCellule(ws: Worksheet, moteur: MoteurFormules, ligne: number, colonne: number): AffichageCellule {
  const row = ws.findRow(ligne);
  if (!row) return VIDE;
  const cell = row.getCell(colonne);
  const brut = cell.value;
  if (brut instanceof Date) return { texte: dateUTC(brut), numerique: true, erreur: false };
  const v = moteur.valeur(ws.name, ligne, colonne);
  if (v instanceof ErreurFormule) return { texte: v.code, numerique: false, erreur: true };
  if (v === null) return VIDE;
  if (typeof v === "number") return { texte: formaterNombre(v, cell.numFmt), numerique: true, erreur: false };
  if (typeof v === "boolean") return { texte: v ? "VRAI" : "FAUX", numerique: false, erreur: false };
  return { texte: v, numerique: false, erreur: false };
}

export function texteSaisie(v: CellValue): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return dateUTC(v);
  if (typeof v === "number") return String(v).replace(".", ",");
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "VRAI" : "FAUX";
  const o = v as unknown as Record<string, unknown>;
  if (typeof o.formula === "string") return `=${o.formula}`;
  if (typeof o.sharedFormula === "string") return `=${o.sharedFormula}`;
  if (Array.isArray(o.richText)) return (o.richText as { text?: string }[]).map((r) => r.text ?? "").join("");
  if ("error" in o) return String(o.error);
  if ("text" in o) return String(o.text ?? "");
  return "";
}

export function parserSaisie(texte: string, avant: CellValue): CellValue {
  if (texte === "") return null;
  const t = texte.trim();
  if (t.startsWith("=") && t.length > 1) return { formula: t.slice(1) } as unknown as CellValue;
  const avantTexte = typeof avant === "string" && avant !== "";
  if (!avantTexte) {
    const d = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
    if (d) return new Date(Date.UTC(Number(d[3]), Number(d[2]) - 1, Number(d[1])));
    const n = t.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    if (/^-?\d+(\.\d+)?$/.test(n)) return Number(n);
  }
  return texte;
}
