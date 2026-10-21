import type { FieldDef, FieldType, OptionItem } from "../types/ui";
import { optClassesFromField, optEleves, optEnseignants, optParents, optAnnees } from "./options";

const make =
(type: FieldType) =>
(name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, label, type, ...extra });

export const F = {
  text: make("text"),
  email: make("email"),
  tel: make("tel"),
  password: make("password"),
  number: make("number"),
  date: make("date"),
  time: make("time"),
  area: make("textarea"),
  select: make("select"),
  multi: make("multiselect"),
  bool: make("boolean"),
  color: make("color"),
  tags: make("tags"),
  list: make("list"),
  file: make("file")
};

export const req: Partial<FieldDef> = { required: true };

export const enumField = (name: string, label: string, options: OptionItem[], extra: Partial<FieldDef> = {}): FieldDef =>
F.select(name, label, { options, ...extra });

export const eleveField = (extra: Partial<FieldDef> = {}): FieldDef =>
F.select("eleve_id", "Élève", { load: optEleves, searchable: true, required: true, placeholder: "Rechercher un élève…", ...extra });

export const enseignantField = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef =>
F.select(name, label, { load: optEnseignants, searchable: true, placeholder: "Rechercher un enseignant…", ...extra });

export const parentField = (extra: Partial<FieldDef> = {}): FieldDef =>
F.select("parent_id", "Parent", { load: optParents, searchable: true, required: true, placeholder: "Rechercher un parent…", ...extra });

export const anneeField = (anneeId: string, extra: Partial<FieldDef> = {}): FieldDef =>
F.select("annee_scolaire_id", "Année scolaire", { load: optAnnees, defaultValue: anneeId, ...extra });

export const classeField = (anneeId: string, name = "classe_id", label = "Classe", extra: Partial<FieldDef> = {}): FieldDef =>
F.select(name, label, {
  load: optClassesFromField("annee_scolaire_id", anneeId),
  dependsOn: ["annee_scolaire_id"],
  searchable: true,
  ...extra
});