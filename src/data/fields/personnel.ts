import type { FieldDef } from "../../types/ui";
import { anneeField, classeField, eleveField, enumField, F, req } from "../../utils/fieldBuilders";
import { fromEnum, optClassesFromField, optMatieresClasseFromField, optTousNiveaux } from "../../utils/options";
import { DECISION_CANDIDATURE, LIEN_PARENTE, MODE_SALAIRE, SEXE } from "../enums";

export const enseignantCreateFields = (anneeId: string): FieldDef[] => [
F.text("nom", "Nom", req),
F.text("prenom", "Prénom", req),
F.email("email", "E-mail personnel"),
F.tel("telephone", "Téléphone"),
F.text("poste", "Poste", { placeholder: "Enseignant" }),
F.text("specialite_principale", "Spécialité"),
F.number("volume_horaire_contractuel", "Heures prévues au contrat (par semaine)", { min: 0 }),
F.text("type_contrat", "Type de contrat", { placeholder: "CDI" }),
F.date("date_embauche", "Date d'embauche"),
F.email("email_interne", "E-mail interne"),
F.text("adresse", "Adresse", { full: true }),
anneeField(anneeId),
F.select("_classe", "Classe (pour choisir les matières)", {
  load: optClassesFromField("annee_scolaire_id", anneeId),
  dependsOn: ["annee_scolaire_id"],
  searchable: true
}),
F.multi("matiere_classe_ids", "Matières enseignées", {
  load: optMatieresClasseFromField("_classe"),
  dependsOn: ["_classe"],
  help: "Changez de classe pour ajouter des matières d'autres classes. Indiquez au moins une matière ou une classe titulaire."
}),
classeField(anneeId, "classe_titulaire_id", "Classe dont il est titulaire"),
F.date("date_debut_affectation", "Début des affectations"),
F.bool("forcer_remplacement", "Remplacer l'enseignant actuel si la matière est déjà attribuée", { full: true }),

F.bool("generer_code_acces", "Générer un code d'accès au portail enseignant", { defaultValue: true })];


export const enseignantEditFields: FieldDef[] = [
F.text("nom", "Nom"),
F.text("prenom", "Prénom"),
F.text("poste", "Poste"),
F.text("departement", "Département"),
F.tel("telephone", "Téléphone"),
F.email("email", "E-mail"),
F.email("email_interne", "E-mail interne"),
F.text("specialite_principale", "Spécialité"),
F.number("volume_horaire_contractuel", "Heures au contrat (par semaine)", { min: 0 }),
F.text("type_contrat", "Type de contrat"),
F.date("date_embauche", "Date d'embauche"),
enumField("mode_salaire", "Mode de rémunération", Object.entries(MODE_SALAIRE).map(([value, label]) => ({ value, label }))),
F.number("taux_horaire", "Taux horaire", { min: 0, showIf: (v) => v.mode_salaire === "horaire" }),
F.text("adresse", "Adresse", { full: true })];


export const portailFields: FieldDef[] = [
  F.bool("force_nouveau", "Forcer la génération d'un nouveau code", { full: true })];
  
export const affectationFields = (anneeId: string): FieldDef[] => [
anneeField(anneeId, req),
F.select("_classe", "Classe", {
  load: optClassesFromField("annee_scolaire_id", anneeId),
  dependsOn: ["annee_scolaire_id"],
  searchable: true
}),
F.multi("matiere_classe_ids", "Matières à confier", {
  ...req,
  load: optMatieresClasseFromField("_classe"),
  dependsOn: ["_classe"],
  help: "Changez de classe pour sélectionner des matières dans plusieurs classes."
}),
F.date("date_debut", "À partir du"),
F.bool("forcer_remplacement", "Remplacer l'enseignant actuel si nécessaire")];


export const parentCreateFields: FieldDef[] = [
F.text("nom", "Nom", req),
F.text("prenom", "Prénom", req),
F.tel("telephone", "Téléphone", req),
F.email("email", "E-mail", req)];


export const lierEnfantFields: FieldDef[] = [
F.text("code", "Code d'accès de l'enfant", req),
enumField("lien", "Lien de parenté", fromEnum(LIEN_PARENTE))];


export const relationFields: FieldDef[] = [
eleveField({ full: true }),
enumField("lien", "Lien de parenté", fromEnum(LIEN_PARENTE)),
F.bool("est_contact_principal", "Contact principal"),
F.bool("est_responsable_financier", "Responsable financier"),
F.bool("autorise_recuperation", "Autorisé à récupérer l'enfant", { defaultValue: true })];


export const codeActivationFields: FieldDef[] = [
F.text("libelle_reference", "Référence (facultatif)", { full: true, placeholder: "Ex. : famille Diop" })];


export const candidatureFields = (anneeId: string): FieldDef[] => [
F.text("nom_candidat", "Nom du candidat", req),
F.text("prenom_candidat", "Prénom du candidat", req),
F.date("date_naissance", "Date de naissance", req),
enumField("sexe", "Sexe", fromEnum(SEXE)),
F.select("niveau_demande_id", "Niveau demandé", { ...req, load: optTousNiveaux, searchable: true }),
anneeField(anneeId, req),
F.text("etablissement_provenance", "Établissement de provenance", { full: true }),
F.text("nom_parent", "Nom du parent", req),
F.tel("telephone_parent", "Téléphone du parent", req),
F.email("email_parent", "E-mail du parent"),
F.date("date_test", "Date du test d'entrée"),
F.number("note_test_entree", "Note au test d'entrée", { min: 0 })];


export const statuerFields: FieldDef[] = [
enumField("nouveau_statut", "Nouveau statut", fromEnum(DECISION_CANDIDATURE), { ...req, full: true }),
F.area("commentaire", "Commentaire")];


export const convertirFields = (anneeId: string): FieldDef[] => [
F.text("matricule", "Matricule attribué", req),
anneeField(anneeId),
classeField(anneeId, "classe_id", "Classe", { ...req, full: true })];


export const eleveRelationOnly: FieldDef[] = [eleveField({ full: true })];