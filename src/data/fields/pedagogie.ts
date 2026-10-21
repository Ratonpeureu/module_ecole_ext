import type { FieldDef, OptionItem } from "../../types/ui";
import { anneeField, eleveField, enseignantField, enumField, F, req } from "../../utils/fieldBuilders";
import {
  fromEnum,
  optClasses,
  optCycles,
  optEleves,
  optMatieres,
  optMatieresClasse,
  optMatieresClasseFromField,
  optNiveauxFromField,
  optSallesNom,
  optSeries,
  optTypesEvaluation } from
"../../utils/options";
import { todayISO } from "../../utils/format";
import { JOURS, MOTIF_CHANGEMENT, STATUT_PRESENCE } from "../enums";

const jourField = (extra: Partial<FieldDef> = {}) => enumField("jour_semaine", "Jour", fromEnum(JOURS), { numeric: true, ...extra });

export const classeCreateFields = (anneeId: string): FieldDef[] => [
F.select("_cycle", "Cycle", { ...req, load: optCycles }),
F.select("niveau_id", "Niveau", { ...req, load: optNiveauxFromField("_cycle"), dependsOn: ["_cycle"], placeholder: "Choisissez d'abord un cycle" }),
F.text("libelle", "Nom de la classe", { ...req, placeholder: "Ex. : 6ème A" }),
F.select("serie_id", "Série", { load: optSeries, help: "Uniquement pour les niveaux à séries" }),
F.number("effectif_max", "Effectif maximum", { min: 1 }),
anneeField(anneeId)];


export const matiereClasseFields: FieldDef[] = [
F.select("matiere_id", "Matière", { ...req, load: optMatieres, searchable: true }),
enseignantField("enseignant_id", "Enseignant"),
F.number("coefficient", "Coefficient", { min: 0, step: 0.5 }),
F.number("volume_horaire_hebdo", "Heures par semaine", { min: 0, step: 0.5 })];


export const changerEnseignantFields = (): FieldDef[] => [
enseignantField("nouveau_enseignant_id", "Nouvel enseignant", { ...req, full: true }),
F.date("date_effet", "À partir du", { ...req, defaultValue: todayISO() }),
enumField("motif", "Motif", fromEnum(MOTIF_CHANGEMENT), req)];


export const retirerEnseignantFields = (): FieldDef[] => [
F.date("date_fin", "Fin de l'affectation", { defaultValue: todayISO() }),
enumField("motif", "Motif", fromEnum(MOTIF_CHANGEMENT))];


export const creneauFields = (classeId: string, withForce = true): FieldDef[] => [
F.select("matiere_classe_id", "Matière", { ...req, load: optMatieresClasse(classeId), full: true }),
jourField(req),
F.select("salle", "Salle", { load: optSallesNom }),
F.time("heure_debut", "Début", req),
F.time("heure_fin", "Fin", req),
...(withForce ? [F.bool("forcer_malgre_conflits", "Enregistrer même en cas de conflit", { full: true })] : [])];


export const remplacerCreneauFields = (): FieldDef[] => [
F.date("date_effet", "À partir du", { ...req, defaultValue: todayISO() }),
F.text("motif", "Motif du changement", req),
jourField({ label: "Nouveau jour" }),
F.select("salle", "Nouvelle salle", { load: optSallesNom }),
F.time("heure_debut", "Nouvelle heure de début"),
F.time("heure_fin", "Nouvelle heure de fin")];


export const bulkFields = (matieres: OptionItem[]): FieldDef[] => [
F.list("creneaux", "Créneaux à créer", {
  ...req,
  addLabel: "Ajouter un créneau",
  itemFields: [
  F.select("matiere_classe_id", "Matière", { ...req, options: matieres }),
  jourField(req),
  F.time("heure_debut", "Début", req),
  F.time("heure_fin", "Fin", req),
  F.select("salle", "Salle", { load: optSallesNom })]

}),
F.bool("forcer_malgre_conflits", "Enregistrer même en cas de conflit")];


export const evaluationFields = (): FieldDef[] => [
F.text("libelle", "Intitulé", { ...req, full: true, placeholder: "Ex. : Devoir surveillé n°1" }),
F.select("type_evaluation_id", "Type d'évaluation", { ...req, load: optTypesEvaluation }),
F.date("date_evaluation", "Date", { ...req, defaultValue: todayISO() }),
F.number("note_max", "Note maximale", { min: 1 }),
F.number("coefficient_evaluation", "Coefficient", { min: 0.1, step: 0.5 })];


export const noteFields = (noteMax?: number): FieldDef[] => [
eleveField({ full: true }),
F.number("valeur_numerique", "Note", { min: 0, max: noteMax, showIf: (v) => v.absent !== true, help: noteMax ? `Sur ${noteMax}` : undefined }),
F.bool("absent", "Absent à l'évaluation"),
F.area("commentaire", "Commentaire")];


export const appreciationFields: FieldDef[] = [eleveField({ full: true }), F.area("texte", "Appréciation", req)];

export const devoirFields = (anneeId: string): FieldDef[] => [
F.select("_classe", "Classe", { ...req, load: optClasses(anneeId), searchable: true }),
F.select("matiere_classe_id", "Matière", {
  ...req,
  load: optMatieresClasseFromField("_classe"),
  dependsOn: ["_classe"],
  placeholder: "Choisissez d'abord une classe"
}),
F.text("titre", "Titre", { ...req, full: true }),
F.area("consignes", "Consignes", req),
F.date("date_donnee", "Donné le", { ...req, defaultValue: todayISO() }),
F.date("date_limite", "À rendre le", req),
F.text("piece_jointe_url", "Lien d'une pièce jointe", { full: true })];


export const appelFields = (classeId: string): FieldDef[] => [
F.select("matiere_classe_id", "Matière", { ...req, load: optMatieresClasse(classeId) }),
F.date("date_appel", "Date", { ...req, defaultValue: todayISO() }),
F.time("heure_debut", "Heure du cours", req),
F.list("presences", "Élèves", {
  ...req,
  addLabel: "Ajouter un élève",
  itemFields: [
  F.select("eleve_id", "Élève", { ...req, load: optEleves, searchable: true }),
  enumField("statut", "Présence", fromEnum(STATUT_PRESENCE), { defaultValue: "present" }),
  F.number("minutes_retard", "Minutes de retard", { min: 0, max: 600, showIf: (v) => v.statut === "retard" }),
  F.text("motif_justification", "Justification", { showIf: (v) => v.statut === "absent_justifie" })]

})];


export const eleveOnlyField = (): FieldDef[] => [eleveField({ full: true })];