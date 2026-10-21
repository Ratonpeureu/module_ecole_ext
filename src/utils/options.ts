import * as E from "../lib/api_ecole";
import type { OptionItem, OptionLoader, Row } from "../types/ui";
import { fullName, str } from "./format";

export const fromEnum = (map: Record<string, string>): OptionItem[] =>
Object.entries(map).map(([value, label]) => ({ value, label }));

const toOptions = (rows: Row[], label: (r: Row) => string, hint?: (r: Row) => string, value = "id"): OptionItem[] =>
rows.map((r) => ({ value: str(r[value]), label: label(r) || str(r[value]), hint: hint ? hint(r) : undefined, raw: r }));

export const optEleves: OptionLoader = async (q) =>
toOptions(await E.listerEleves({ q: q || undefined }), fullName, (r) => str(r.matricule));

export const optEnseignants: OptionLoader = async (q) =>
toOptions(await E.listerEnseignants({ q: q || undefined }), fullName, (r) => str(r.specialite_principale || r.poste));

export const optParents: OptionLoader = async (q) =>
toOptions(await E.listerParents(q || undefined), fullName, (r) => str(r.telephone));

export const optAnnees: OptionLoader = async () =>
toOptions(await E.listerAnnees(), (r) => str(r.libelle), (r) => r.est_active ? "Active" : "");

export const optClasses = (anneeId: string): OptionLoader => async () =>
anneeId ? toOptions(await E.listerClasses(anneeId), (r) => str(r.libelle)) : [];

/** Classes de l'année choisie dans le champ `field` (ou de l'année courante à défaut). */
export const optClassesFromField = (field: string, fallbackAnneeId: string): OptionLoader => async (_q, v) => {
  const annee = str(v[field]) || fallbackAnneeId;
  return annee ? toOptions(await E.listerClasses(annee), (r) => str(r.libelle)) : [];
};

export const optMatieresClasse = (classeId: string): OptionLoader => async () =>
classeId ?
toOptions(await E.listerMatieresClasse(classeId), (r) => str(r.matiere), (r) => `Coef. ${str(r.coefficient)}`, "matiere_classe_id") :
[];

export const optMatieresClasseFromField = (field: string): OptionLoader => async (_q, v) => {
  const classe = str(v[field]);
  return classe ?
  toOptions(await E.listerMatieresClasse(classe), (r) => str(r.matiere), (r) => `Coef. ${str(r.coefficient)}`, "matiere_classe_id") :
  [];
};

export const optMatieres: OptionLoader = async () =>
toOptions(await E.listerMatieres(), (r) => str(r.libelle), (r) => str(r.code));

export const optPeriodes = (anneeId: string): OptionLoader => async () =>
anneeId ? toOptions(await E.listerPeriodes(anneeId), (r) => str(r.libelle)) : [];

export const optCycles: OptionLoader = async () => toOptions(await E.listerCycles(), (r) => str(r.libelle), (r) => str(r.examen_fin_cycle));

export const optNiveauxFromField = (field: string): OptionLoader => async (_q, v) => {
  const cycle = str(v[field]);
  return cycle ? toOptions(await E.listerNiveaux(cycle), (r) => str(r.libelle), (r) => str(r.code)) : [];
};

export const optTousNiveaux: OptionLoader = async () => {
  const cycles = await E.listerCycles();
  const lists = await Promise.all(cycles.map((c) => E.listerNiveaux(str(c.id))));
  return lists.flatMap((niveaux, i) => toOptions(niveaux, (r) => str(r.libelle), () => str(cycles[i].libelle)));
};

export const optSeries: OptionLoader = async () => toOptions(await E.listerSeries(), (r) => str(r.libelle), (r) => str(r.code));
export const optTypesEvaluation: OptionLoader = async () =>
toOptions(await E.listerTypesEvaluation(), (r) => str(r.libelle), (r) => `Poids ${str(r.poids_dans_moyenne)}`);
export const optVehicules: OptionLoader = async () =>
toOptions(await E.listerVehicules(), (r) => str(r.immatriculation), (r) => str(r.modele));
export const optCircuits: OptionLoader = async () =>
toOptions(await E.listerCircuits(), (r) => str(r.libelle), (r) => `${str(r.sens)} · ${str(r.heure_depart)}`);
export const optSalles: OptionLoader = async () =>
toOptions(await E.listerSalles(), (r) => str(r.nom), (r) => `${str(r.capacite)} places`);
export const optSallesNom: OptionLoader = async () =>
toOptions(await E.listerSalles(), (r) => str(r.nom), (r) => `${str(r.capacite)} places`, "nom");
export const optOuvrages: OptionLoader = async (q) =>
toOptions(await E.listerOuvrages(q || undefined), (r) => str(r.titre), (r) => `${str(r.nb_exemplaires_disponibles)} disponible(s)`);
export const optCatalogueMateriel: OptionLoader = async (q) =>
toOptions(await E.getCatalogueMaterielScolaire({ q: q || undefined }), (r) => str(r.libelle), (r) => str(r.categorie));
export const optEvenements: OptionLoader = async () =>
toOptions(await E.listerEvenements(), (r) => str(r.titre), (r) => str(r.date_debut));

export const optCategoriesDepenses: OptionLoader = async () => {
  const tree = await E.getCategoriesDepenses();
  const out: OptionItem[] = [];
  tree.forEach((n) => {
    out.push({ value: str(n.code), label: str(n.libelle), hint: str(n.compte_comptable_ohada) });
    (Array.isArray(n.enfants) ? n.enfants as Row[] : []).forEach((c) =>
    out.push({ value: str(c.code), label: `${str(n.libelle)} › ${str(c.libelle)}`, hint: str(c.compte_comptable_ohada) })
    );
  });
  return out;
};

export const optCategoriesDepensesRacines: OptionLoader = async () =>
toOptions(await E.getCategoriesDepenses(), (r) => str(r.libelle), (r) => str(r.code));

export const optTemplatesCarte: OptionLoader = async () => {
  const r = await E.getCartesTemplates();
  const list = Array.isArray(r.templates) ? r.templates as Row[] : [];
  return list.map((t) => ({ value: str(t.id), label: str(t.id), hint: str(t.desc) }));
};

export const optTaillesCarte: OptionLoader = async () => {
  const r = await E.getCartesTemplates();
  const list = Array.isArray(r.sizes) ? r.sizes as Row[] : [];
  return list.map((t) => ({ value: str(t.id), label: str(t.id), hint: `${str(t.w)} × ${str(t.h)}` }));
};