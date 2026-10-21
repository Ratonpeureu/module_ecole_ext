import type { FieldDef } from "../../types/ui";
import { enumField, F, req } from "../../utils/fieldBuilders";
import { fromEnum, optAnnees, optClasses, optClassesFromField } from "../../utils/options";
import { CATEGORIE_MATIERE, STATUT_ANNEE, TYPE_BAREME } from "../enums";

export const anneeFields: FieldDef[] = [
F.text("libelle", "Libellé", { ...req, full: true, placeholder: "Ex. : 2026-2027" }),
F.date("date_debut", "Rentrée", req),
F.date("date_fin", "Fin d'année", req),
enumField("statut", "Statut", fromEnum(STATUT_ANNEE), { defaultValue: "en_cours" }),
F.bool("est_active", "Définir comme année active", { defaultValue: true })];


export const periodeFields: FieldDef[] = [
F.text("libelle", "Libellé", { ...req, placeholder: "Ex. : Trimestre 1" }),
F.number("ordre", "Ordre", { min: 1 }),
F.date("date_debut", "Début", req),
F.date("date_fin", "Fin", req),
F.date("date_limite_saisie_notes", "Limite de saisie des notes"),
F.bool("bulletins_publies", "Bulletins déjà publiés")];


export const matiereFields: FieldDef[] = [
F.text("libelle", "Libellé", req),
F.text("code", "Code", { ...req, placeholder: "Ex. : MATH" }),
enumField("categorie", "Catégorie", fromEnum(CATEGORIE_MATIERE)),
F.color("couleur_affichage", "Couleur d'affichage")];


export const baremeFields: FieldDef[] = [
F.text("libelle", "Libellé", req),
enumField("type_bareme", "Type", fromEnum(TYPE_BAREME), req),
F.number("note_max", "Note maximale", { min: 1, showIf: (v) => v.type_bareme !== "competences" }),
F.number("seuil_reussite", "Seuil de réussite", { min: 0, showIf: (v) => v.type_bareme !== "competences" }),
F.list("echelle_lettres", "Échelle de lettres", {
  showIf: (v) => v.type_bareme === "lettres",
  addLabel: "Ajouter une lettre",
  itemFields: [F.text("lettre", "Lettre", req), F.number("equivalent_num", "Équivalent chiffré", req)]
}),
F.tags("echelle_competences", "Niveaux de compétence", {
  showIf: (v) => v.type_bareme === "competences",
  placeholder: "Ex. : Acquis, puis Entrée"
})];


export const typeEvaluationFields: FieldDef[] = [
F.text("libelle", "Libellé", { ...req, placeholder: "Ex. : Composition" }),
F.number("poids_dans_moyenne", "Poids dans la moyenne", { min: 0, step: 0.5 })];


export const promotionFields = (sourceAnneeId: string): FieldDef[] => [
F.select("annee_cible_id", "Année de destination", { ...req, load: optAnnees, full: true }),
F.list("regles", "Passages de classe", {
  ...req,
  addLabel: "Ajouter une classe",
  itemFields: [
  F.select("classe_source_id", "Classe actuelle", { ...req, load: optClasses(sourceAnneeId) }),
  F.select("classe_passage_id", "Classe supérieure", {
    ...req,
    load: optClassesFromField("annee_cible_id", ""),
    dependsOn: ["annee_cible_id"]
  }),
  F.select("classe_redoublement_id", "Classe de redoublement", {
    load: optClassesFromField("annee_cible_id", ""),
    dependsOn: ["annee_cible_id"]
  })]

})];