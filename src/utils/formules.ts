// Évaluation des formules Excel présentes dans les registres (lecture seule, côté affichage).
import type { Workbook } from "exceljs";

const EPOCH = Date.UTC(1899, 11, 30);
const JOUR = 86400000;

export function serialDepuisDate(d: Date): number {
  return (d.getTime() - EPOCH) / JOUR;
}

export function dateDepuisSerial(n: number): Date {
  return new Date(EPOCH + Math.round(n * JOUR));
}

export function indexColonne(lettres: string): number {
  let n = 0;
  for (const ch of lettres.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export class ErreurFormule {
  constructor(public readonly code: string) {}
}

export type ValeurCalc = number | string | boolean | null | ErreurFormule;

interface Plage {
  feuille: string;
  l1: number;
  c1: number;
  l2: number;
  c2: number;
}

class PlageVal {
  constructor(public readonly p: Plage) {}
}

type Valeur = ValeurCalc | PlageVal;

interface PartieRef {
  col: number;
  ligne: number | null;
  absCol: boolean;
  absLigne: boolean;
}

type Noeud =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "bool"; v: boolean }
  | { k: "ref"; feuille: string | null; a: PartieRef; b: PartieRef | null }
  | { k: "fn"; nom: string; args: Noeud[] }
  | { k: "bin"; op: string; a: Noeud; b: Noeud }
  | { k: "neg"; a: Noeud }
  | { k: "pct"; a: Noeud };

type Jeton =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "id"; v: string; feuille: string | null }
  | { t: "fn"; v: string }
  | { t: "op"; v: string }
  | { t: "(" }
  | { t: ")" }
  | { t: "," };

interface Decalage {
  dl: number;
  dc: number;
}

const AUCUN: Decalage = { dl: 0, dc: 0 };
const RE_ID = /^[A-Za-z_$\\][\w.$]*/;

export class MoteurFormules {
  private readonly cache = new Map<string, ValeurCalc>();
  private readonly enCours = new Set<string>();
  private readonly arbres = new Map<string, Noeud | ErreurFormule>();

  constructor(private readonly classeur: Workbook) {}

  invalider(): void {
    this.cache.clear();
  }

  valeur(feuille: string, ligne: number, colonne: number): ValeurCalc {
    const k = `${feuille}!${ligne}:${colonne}`;
    if (this.cache.has(k)) return this.cache.get(k) ?? null;
    if (this.enCours.has(k)) return new ErreurFormule("#CIRC!");
    this.enCours.add(k);
    try {
      const v = this.calculer(feuille, ligne, colonne);
      this.cache.set(k, v);
      return v;
    } finally {
      this.enCours.delete(k);
    }
  }

  condition(formule: string, feuille: string, dl: number, dc: number): boolean {
    const v = this.evaluer(formule.replace(/^=/, ""), feuille, { dl, dc });
    return v === true || (typeof v === "number" && v !== 0);
  }

  private calculer(feuille: string, ligne: number, colonne: number): ValeurCalc {
    const ws = this.classeur.getWorksheet(feuille);
    if (!ws) return new ErreurFormule("#REF!");
    const row = ws.findRow(ligne);
    if (!row) return null;
    const cell = row.getCell(colonne);
    const v = cell.value as unknown;
    if (v === null || v === undefined) return null;
    if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return v;
    if (v instanceof Date) return serialDepuisDate(v);
    const o = v as Record<string, unknown>;
    if ("formula" in o || "sharedFormula" in o) {
      const f = cell.formula;
      if (f) return this.evaluer(f, feuille, AUCUN);
      return depuisResultat(o.result);
    }
    if (Array.isArray(o.richText)) return (o.richText as { text?: string }[]).map((r) => r.text ?? "").join("");
    if ("error" in o) return new ErreurFormule(String(o.error));
    if ("text" in o) return String(o.text ?? "");
    return null;
  }

  private evaluer(formule: string, feuille: string, d: Decalage): ValeurCalc {
    let arbre = this.arbres.get(formule);
    if (!arbre) {
      try {
        arbre = analyser(formule);
      } catch (e) {
        arbre = e instanceof ErreurFormule ? e : new ErreurFormule("#VALUE!");
      }
      this.arbres.set(formule, arbre);
    }
    if (arbre instanceof ErreurFormule) return arbre;
    try {
      return this.scalaire(this.eval(arbre, feuille, d));
    } catch (e) {
      return e instanceof ErreurFormule ? e : new ErreurFormule("#VALUE!");
    }
  }

  private scalaire(v: Valeur): ValeurCalc {
    if (v instanceof PlageVal) return this.valeur(v.p.feuille, v.p.l1, v.p.c1);
    return v;
  }

  private nombre(v: Valeur): number {
    const s = this.scalaire(v);
    if (s instanceof ErreurFormule) throw s;
    if (s === null) return 0;
    if (typeof s === "number") return s;
    if (typeof s === "boolean") return s ? 1 : 0;
    const x = Number(s.trim().replace(",", "."));
    if (s.trim() === "" || Number.isNaN(x)) throw new ErreurFormule("#VALUE!");
    return x;
  }

  private vrai(v: ValeurCalc): boolean {
    if (v instanceof ErreurFormule) throw v;
    if (v === null) return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const u = v.toUpperCase();
    if (u === "TRUE" || u === "VRAI") return true;
    if (u === "FALSE" || u === "FAUX") return false;
    throw new ErreurFormule("#VALUE!");
  }

  private eval(n: Noeud, feuille: string, d: Decalage): Valeur {
    switch (n.k) {
      case "num":
      case "str":
      case "bool":
        return n.v;
      case "ref": {
        const f = n.feuille ?? feuille;
        const col = (p: PartieRef) => p.col + (p.absCol ? 0 : d.dc);
        const lig = (p: PartieRef, defaut: number) => (p.ligne === null ? defaut : p.ligne + (p.absLigne ? 0 : d.dl));
        if (!n.b) {
          if (n.a.ligne === null) throw new ErreurFormule("#REF!");
          return this.valeur(f, lig(n.a, 1), col(n.a));
        }
        const l1 = lig(n.a, 1);
        const l2 = lig(n.b, Number.MAX_SAFE_INTEGER);
        const c1 = col(n.a);
        const c2 = col(n.b);
        return new PlageVal({
          feuille: f,
          l1: Math.min(l1, l2),
          l2: Math.max(l1, l2),
          c1: Math.min(c1, c2),
          c2: Math.max(c1, c2)
        });
      }
      case "neg":
        return -this.nombre(this.eval(n.a, feuille, d));
      case "pct":
        return this.nombre(this.eval(n.a, feuille, d)) / 100;
      case "bin":
        return this.binaire(n.op, this.scalaire(this.eval(n.a, feuille, d)), this.scalaire(this.eval(n.b, feuille, d)));
      case "fn":
        return this.fonction(n.nom, n.args, feuille, d);
    }
  }

  private binaire(op: string, a: ValeurCalc, b: ValeurCalc): ValeurCalc {
    if (a instanceof ErreurFormule) return a;
    if (b instanceof ErreurFormule) return b;
    switch (op) {
      case "+":
        return this.nombre(a) + this.nombre(b);
      case "-":
        return this.nombre(a) - this.nombre(b);
      case "*":
        return this.nombre(a) * this.nombre(b);
      case "/": {
        const y = this.nombre(b);
        return y === 0 ? new ErreurFormule("#DIV/0!") : this.nombre(a) / y;
      }
      case "^":
        return Math.pow(this.nombre(a), this.nombre(b));
      case "&":
        return texte(a) + texte(b);
      default: {
        const c = comparer(a, b);
        if (op === "=") return c === 0;
        if (op === "<>") return c !== 0;
        if (op === "<") return c < 0;
        if (op === ">") return c > 0;
        if (op === "<=") return c <= 0;
        return c >= 0;
      }
    }
  }

  private fonction(nom: string, args: Noeud[], feuille: string, d: Decalage): Valeur {
    const ev = (i: number): Valeur => this.eval(args[i], feuille, d);
    const sc = (i: number): ValeurCalc => (i < args.length ? this.scalaire(ev(i)) : null);
    const sur = (i: number): ValeurCalc => {
      try {
        return sc(i);
      } catch (e) {
        if (e instanceof ErreurFormule) return e;
        throw e;
      }
    };
    switch (nom) {
      case "IF": {
        if (args.length < 2) throw new ErreurFormule("#VALUE!");
        const c = sc(0);
        if (c instanceof ErreurFormule) return c;
        return this.vrai(c) ? ev(1) : args.length > 2 ? ev(2) : false;
      }
      case "IFERROR": {
        const v = sur(0);
        return v instanceof ErreurFormule ? ev(1) : v;
      }
      case "AND": {
        for (let i = 0; i < args.length; i++) if (!this.vrai(sc(i))) return false;
        return true;
      }
      case "OR": {
        for (let i = 0; i < args.length; i++) if (this.vrai(sc(i))) return true;
        return false;
      }
      case "NOT":
        return !this.vrai(sc(0));
      case "ISNUMBER":
        return typeof sur(0) === "number";
      case "ISBLANK":
        return sur(0) === null;
      case "ISERROR":
        return sur(0) instanceof ErreurFormule;
      case "SUM":
        return this.nombres(args, feuille, d).reduce((s, x) => s + x, 0);
      case "MAX": {
        const xs = this.nombres(args, feuille, d);
        return xs.length ? xs.reduce((m, x) => (x > m ? x : m), xs[0]) : 0;
      }
      case "MIN": {
        const xs = this.nombres(args, feuille, d);
        return xs.length ? xs.reduce((m, x) => (x < m ? x : m), xs[0]) : 0;
      }
      case "ROUND": {
        const f = Math.pow(10, args.length > 1 ? this.nombre(sc(1)) : 0);
        return Math.round(this.nombre(sc(0)) * f) / f;
      }
      case "ABS":
        return Math.abs(this.nombre(sc(0)));
      case "SEARCH":
      case "FIND": {
        const a = texte(sc(0));
        const b = texte(sc(1));
        const depart = args.length > 2 ? this.nombre(sc(2)) - 1 : 0;
        const i = nom === "SEARCH" ? b.toLowerCase().indexOf(a.toLowerCase(), depart) : b.indexOf(a, depart);
        return i < 0 ? new ErreurFormule("#VALUE!") : i + 1;
      }
      case "LEN":
        return texte(sc(0)).length;
      case "TODAY":
        return aujourdhui();
      case "YEAR":
        return dateDepuisSerial(this.nombre(sc(0))).getUTCFullYear();
      case "MONTH":
        return dateDepuisSerial(this.nombre(sc(0))).getUTCMonth() + 1;
      case "DAY":
        return dateDepuisSerial(this.nombre(sc(0))).getUTCDate();
      case "SUMIFS":
        return this.conditions(args.slice(1), feuille, d, args[0]);
      case "COUNTIFS":
        return this.conditions(args, feuille, d, null);
      case "SUMIF":
        return this.conditions([args[0], args[1]], feuille, d, args[2] ?? args[0]);
      case "COUNTIF":
        return this.conditions([args[0], args[1]], feuille, d, null);
      default:
        return new ErreurFormule("#NAME?");
    }
  }

  private nombres(args: Noeud[], feuille: string, d: Decalage): number[] {
    const out: number[] = [];
    args.forEach((a) => {
      const v = this.eval(a, feuille, d);
      if (v instanceof PlageVal) {
        this.parcourir(v.p, (x) => {
          if (x instanceof ErreurFormule) throw x;
          if (typeof x === "number") out.push(x);
        });
      } else if (v instanceof ErreurFormule) {
        throw v;
      } else if (v !== null) {
        out.push(this.nombre(v));
      }
    });
    return out;
  }

  private parcourir(p: Plage, fn: (v: ValeurCalc) => void): void {
    const ws = this.classeur.getWorksheet(p.feuille);
    const lmax = this.derniereLigne(p);
    const cmax = Math.min(p.c2, ws ? ws.columnCount : 0);
    for (let l = p.l1; l <= lmax; l++) for (let c = p.c1; c <= cmax; c++) fn(this.valeur(p.feuille, l, c));
  }

  private derniereLigne(p: Plage): number {
    const ws = this.classeur.getWorksheet(p.feuille);
    return Math.min(p.l2, ws ? ws.rowCount : 0);
  }

  private conditions(crit: Noeud[], feuille: string, d: Decalage, somme: Noeud | null): ValeurCalc {
    const plages: Plage[] = [];
    const tests: ((v: ValeurCalc) => boolean)[] = [];
    for (let i = 0; i + 1 < crit.length; i += 2) {
      const r = this.eval(crit[i], feuille, d);
      if (!(r instanceof PlageVal)) return new ErreurFormule("#VALUE!");
      const cv = this.scalaire(this.eval(crit[i + 1], feuille, d));
      if (cv instanceof ErreurFormule) return cv;
      plages.push(r.p);
      tests.push(critere(cv));
    }
    let sp: Plage | null = null;
    if (somme) {
      const s = this.eval(somme, feuille, d);
      if (!(s instanceof PlageVal)) return new ErreurFormule("#VALUE!");
      sp = s.p;
    }
    const base = sp ?? plages[0];
    if (!base) return new ErreurFormule("#VALUE!");
    const nbL = this.derniereLigne(base) - base.l1 + 1;
    const nbC = base.c2 - base.c1 + 1;
    let total = 0;
    for (let dl = 0; dl < nbL; dl++) {
      for (let dc = 0; dc < nbC; dc++) {
        let ok = true;
        for (let k = 0; k < plages.length; k++) {
          const p = plages[k];
          if (!tests[k](this.valeur(p.feuille, p.l1 + dl, p.c1 + dc))) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        if (sp) {
          const v = this.valeur(sp.feuille, sp.l1 + dl, sp.c1 + dc);
          if (typeof v === "number") total += v;
        } else {
          total++;
        }
      }
    }
    return total;
  }
}

function depuisResultat(r: unknown): ValeurCalc {
  if (r === null || r === undefined) return null;
  if (typeof r === "number" || typeof r === "string" || typeof r === "boolean") return r;
  if (r instanceof Date) return serialDepuisDate(r);
  if (typeof r === "object" && r && "error" in r) return new ErreurFormule(String((r as { error: unknown }).error));
  return null;
}

function aujourdhui(): number {
  const d = new Date();
  return (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / JOUR;
}

function texte(v: ValeurCalc): string {
  if (v instanceof ErreurFormule) throw v;
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "VRAI" : "FAUX";
  return String(v);
}

function rang(v: ValeurCalc): number {
  return typeof v === "number" ? 0 : typeof v === "string" ? 1 : typeof v === "boolean" ? 2 : 3;
}

function comparer(a: ValeurCalc, b: ValeurCalc): number {
  let x = a;
  let y = b;
  if (x === null) x = typeof y === "string" ? "" : typeof y === "boolean" ? false : 0;
  if (y === null) y = typeof x === "string" ? "" : typeof x === "boolean" ? false : 0;
  const rx = rang(x);
  const ry = rang(y);
  if (rx !== ry) return rx < ry ? -1 : 1;
  if (typeof x === "number" && typeof y === "number") return x === y ? 0 : x < y ? -1 : 1;
  if (typeof x === "string" && typeof y === "string") {
    const p = x.toLowerCase();
    const q = y.toLowerCase();
    return p === q ? 0 : p < q ? -1 : 1;
  }
  if (typeof x === "boolean" && typeof y === "boolean") return x === y ? 0 : x ? 1 : -1;
  return 0;
}

function joker(s: string): RegExp {
  const esc = s.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${esc}$`, "is");
}

function critere(c: ValeurCalc): (v: ValeurCalc) => boolean {
  if (typeof c === "number" || typeof c === "boolean") return (v) => !(v instanceof ErreurFormule) && comparer(v, c) === 0;
  const s = c === null || c instanceof ErreurFormule ? "" : c;
  const m = /^(<=|>=|<>|<|>|=)?([\s\S]*)$/.exec(s);
  const op = m?.[1] ?? "";
  const reste = m?.[2] ?? "";
  const n = reste.trim() !== "" && !Number.isNaN(Number(reste.replace(",", "."))) ? Number(reste.replace(",", ".")) : null;
  if (op === "" || op === "=" || op === "<>") {
    let egal: (v: ValeurCalc) => boolean;
    if (n !== null) egal = (v) => (typeof v === "number" ? v === n : typeof v === "string" && v.trim().toLowerCase() === reste.toLowerCase());
    else if (reste === "") egal = (v) => v === null || v === "";
    else if (/[*?]/.test(reste)) {
      const re = joker(reste);
      egal = (v) => typeof v === "string" && re.test(v);
    } else egal = (v) => typeof v === "string" && v.toLowerCase() === reste.toLowerCase();
    return op === "<>" ? (v) => !egal(v) : egal;
  }
  if (n === null) {
    return (v) => {
      if (typeof v !== "string") return false;
      const r = comparer(v, reste);
      return op === "<" ? r < 0 : op === ">" ? r > 0 : op === "<=" ? r <= 0 : r >= 0;
    };
  }
  return (v) => {
    if (typeof v !== "number") return false;
    return op === "<" ? v < n : op === ">" ? v > n : op === "<=" ? v <= n : v >= n;
  };
}

function lireCite(src: string, i: number, q: string): [string, number] {
  let s = "";
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === q) {
      if (src[j + 1] === q) {
        s += q;
        j += 2;
        continue;
      }
      return [s, j + 1];
    }
    s += src[j++];
  }
  throw new ErreurFormule("#VALUE!");
}

function decouper(src: string): Jeton[] {
  const out: Jeton[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      const [s, j] = lireCite(src, i, '"');
      out.push({ t: "str", v: s });
      i = j;
      continue;
    }
    if (ch === "(") {
      out.push({ t: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ t: ")" });
      i++;
      continue;
    }
    if (ch === "," || ch === ";") {
      out.push({ t: "," });
      i++;
      continue;
    }
    const deux = src.slice(i, i + 2);
    if (deux === "<=" || deux === ">=" || deux === "<>") {
      out.push({ t: "op", v: deux });
      i += 2;
      continue;
    }
    if ("+-*/&=<>%^".includes(ch)) {
      out.push({ t: "op", v: ch });
      i++;
      continue;
    }
    if (/[\d.]/.test(ch)) {
      const nb = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (nb) {
        out.push({ t: "num", v: Number(nb[0]) });
        i += nb[0].length;
        continue;
      }
    }
    let feuille: string | null = null;
    if (ch === "'") {
      const [s, j] = lireCite(src, i, "'");
      if (src[j] !== "!") throw new ErreurFormule("#REF!");
      feuille = s;
      i = j + 1;
    }
    let m = RE_ID.exec(src.slice(i));
    if (!m) throw new ErreurFormule("#NAME?");
    let id = m[0];
    i += id.length;
    if (feuille === null && src[i] === "!") {
      feuille = id;
      i++;
      m = RE_ID.exec(src.slice(i));
      if (!m) throw new ErreurFormule("#REF!");
      id = m[0];
      i += id.length;
    }
    if (feuille === null && src[i] === "(") {
      out.push({ t: "fn", v: id.toUpperCase().replace(/^_XLFN\./, "") });
      i++;
      continue;
    }
    const haut = id.toUpperCase();
    if (feuille === null && ["TRUE", "FALSE", "VRAI", "FAUX"].includes(haut)) {
      out.push({ t: "bool", v: haut === "TRUE" || haut === "VRAI" });
      continue;
    }
    if (src[i] === ":") {
      const m2 = /^:(\$?[A-Za-z]{1,3}\$?\d*)/.exec(src.slice(i));
      if (m2) {
        id += m2[0];
        i += m2[0].length;
      }
    }
    out.push({ t: "id", v: id, feuille });
  }
  return out;
}

function partie(s: string): PartieRef | null {
  const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d*)$/.exec(s);
  if (!m) return null;
  return { col: indexColonne(m[2]), absCol: m[1] === "$", ligne: m[4] ? Number(m[4]) : null, absLigne: m[3] === "$" };
}

function reference(id: string, feuille: string | null): Noeud {
  const [x, y] = id.split(":");
  const a = partie(x);
  const b = y !== undefined ? partie(y) : null;
  if (!a || (y !== undefined && !b)) throw new ErreurFormule("#NAME?");
  return { k: "ref", feuille, a, b };
}

function analyser(src: string): Noeud {
  const j = decouper(src);
  let p = 0;
  const op = (vals: string[]): string | null => {
    const t = j[p];
    if (t && t.t === "op" && vals.includes(t.v)) {
      p++;
      return t.v;
    }
    return null;
  };
  const primaire = (): Noeud => {
    const t = j[p++];
    if (!t) throw new ErreurFormule("#VALUE!");
    switch (t.t) {
      case "num":
        return { k: "num", v: t.v };
      case "str":
        return { k: "str", v: t.v };
      case "bool":
        return { k: "bool", v: t.v };
      case "(": {
        const e = comparaison();
        if (j[p++]?.t !== ")") throw new ErreurFormule("#VALUE!");
        return e;
      }
      case "fn": {
        const args: Noeud[] = [];
        if (j[p]?.t === ")") {
          p++;
          return { k: "fn", nom: t.v, args };
        }
        for (;;) {
          args.push(comparaison());
          const s = j[p++];
          if (s?.t === ")") break;
          if (s?.t !== ",") throw new ErreurFormule("#VALUE!");
        }
        return { k: "fn", nom: t.v, args };
      }
      case "id":
        return reference(t.v, t.feuille);
      default:
        throw new ErreurFormule("#VALUE!");
    }
  };
  const suffixe = (): Noeud => {
    let a = primaire();
    while (op(["%"])) a = { k: "pct", a };
    return a;
  };
  const unaire = (): Noeud => {
    if (op(["-"])) return { k: "neg", a: unaire() };
    if (op(["+"])) return unaire();
    return suffixe();
  };
  const puissance = (): Noeud => {
    let a = unaire();
    while (op(["^"])) a = { k: "bin", op: "^", a, b: unaire() };
    return a;
  };
  const multiplicatif = (): Noeud => {
    let a = puissance();
    let o: string | null;
    while ((o = op(["*", "/"]))) a = { k: "bin", op: o, a, b: puissance() };
    return a;
  };
  const additif = (): Noeud => {
    let a = multiplicatif();
    let o: string | null;
    while ((o = op(["+", "-"]))) a = { k: "bin", op: o, a, b: multiplicatif() };
    return a;
  };
  const concat = (): Noeud => {
    let a = additif();
    while (op(["&"])) a = { k: "bin", op: "&", a, b: additif() };
    return a;
  };
  function comparaison(): Noeud {
    let a = concat();
    let o: string | null;
    while ((o = op(["=", "<>", "<", ">", "<=", ">="]))) a = { k: "bin", op: o, a, b: concat() };
    return a;
  }
  const e = comparaison();
  if (p !== j.length) throw new ErreurFormule("#VALUE!");
  return e;
}
