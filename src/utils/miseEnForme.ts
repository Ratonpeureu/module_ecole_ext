// Mise en forme conditionnelle (règles « expression ») lue depuis le classeur.
import type { Worksheet } from "exceljs";
import { indexColonne } from "./formules";
import type { MoteurFormules } from "./formules";

export interface RegleConditionnelle {
  l1: number;
  c1: number;
  l2: number;
  c2: number;
  formule: string;
  fond: string;
  priorite: number;
}

interface RegleBrute {
  type: string;
  formulae?: string[];
  priority?: number;
  style?: { fill?: { bgColor?: { argb?: string }; fgColor?: { argb?: string } } };
}

export function reglesConditionnelles(ws: Worksheet): RegleConditionnelle[] {
  const brut = (ws as unknown as { conditionalFormattings?: { ref: string; rules: RegleBrute[] }[] }).conditionalFormattings ?? [];
  const out: RegleConditionnelle[] = [];
  brut.forEach((cf) => {
    cf.ref.split(/\s+/).forEach((ref) => {
      const m = /^\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?$/.exec(ref);
      if (!m) return;
      const c1 = indexColonne(m[1]);
      const l1 = Number(m[2]);
      const c2 = m[3] ? indexColonne(m[3]) : c1;
      const l2 = m[4] ? Number(m[4]) : l1;
      cf.rules.forEach((r) => {
        if (r.type !== "expression" || !r.formulae?.[0]) return;
        const argb = r.style?.fill?.bgColor?.argb ?? r.style?.fill?.fgColor?.argb;
        if (!argb) return;
        out.push({ l1, c1, l2, c2, formule: String(r.formulae[0]), fond: `#${argb.slice(-6)}`, priorite: r.priority ?? 0 });
      });
    });
  });
  return out.sort((a, b) => a.priorite - b.priorite);
}

export function fondConditionnel(
  regles: RegleConditionnelle[],
  moteur: MoteurFormules,
  feuille: string,
  ligne: number,
  colonne: number
): string | undefined {
  for (const r of regles) {
    if (ligne < r.l1 || ligne > r.l2 || colonne < r.c1 || colonne > r.c2) continue;
    if (moteur.condition(r.formule, feuille, ligne - r.l1, colonne - r.c1)) return r.fond;
  }
  return undefined;
}
