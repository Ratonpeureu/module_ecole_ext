import type { FieldDef } from "../../types/ui";
import { anneeField, classeField, eleveField, enumField, F, req } from "../../utils/fieldBuilders";
import { fromEnum, optClasses } from "../../utils/options";
import { todayISO } from "../../utils/format";
import { DECISION_CONSEIL, SEXE, STATUT_SORTIE, SUITE_VISITE, TYPE_DOCUMENT_ELEVE, TYPE_SANCTION } from "../enums";

const withEleve = (on: boolean, fields: FieldDef[], labelTo?: string): FieldDef[] =>
on ? [eleveField({ full: true, labelTo }), ...fields] : fields;

export const eleveCreateFields = (anneeId: string): FieldDef[] => [
F.text("matricule", "Matricule", req),
enumField("sexe", "Sexe", fromEnum(SEXE)),
F.text("nom", "Nom", req),
F.text("prenom", "Prénom", req),
F.date("date_naissance", "Date de naissance", req),
F.text("lieu_naissance", "Lieu de naissance"),
anneeField(anneeId),
classeField(anneeId, "classe_id", "Classe", req),
F.date("date_inscription", "Date d'inscription", { defaultValue: todayISO() }),
F.text("etablissement_provenance", "Établissement de provenance"),
F.bool("est_redoublant", "Redoublant"),
F.text("groupe_sanguin", "Groupe sanguin"),
F.area("allergies", "Allergies"),
F.area("besoins_particuliers", "Besoins particuliers")];


export const eleveEditFields: FieldDef[] = [
F.text("nom", "Nom"),
F.text("prenom", "Prénom"),
F.date("date_naissance", "Date de naissance"),
F.text("lieu_naissance", "Lieu de naissance"),
enumField("sexe", "Sexe", fromEnum(SEXE)),
F.text("groupe_sanguin", "Groupe sanguin"),
F.text("etablissement_provenance", "Établissement de provenance", { full: true }),
F.area("allergies", "Allergies"),
F.area("besoins_particuliers", "Besoins particuliers")];


export const sortieFields = (): FieldDef[] => [
enumField("statut", "Motif de sortie", fromEnum(STATUT_SORTIE), req),
F.date("date_sortie", "Date de sortie", { ...req, defaultValue: todayISO() }),
F.area("motif_sortie", "Précisions")];


export const inscriptionFields = (anneeId: string): FieldDef[] => [
anneeField(anneeId, req),
classeField(anneeId, "classe_id", "Classe", req),
F.date("date_inscription", "Date d'inscription", { ...req, defaultValue: todayISO() }),
F.bool("est_redoublant", "Redoublant")];


export const changerClasseFields = (anneeId: string): FieldDef[] => [
F.select("classe_id", "Nouvelle classe", { ...req, load: optClasses(anneeId), searchable: true, full: true })];


export const clotureFields = (anneeId: string): FieldDef[] => [
F.select("classe_id", "Classe de l'année", { ...req, load: optClasses(anneeId), searchable: true }),
enumField("decision", "Décision du conseil", fromEnum(DECISION_CONSEIL), req),
F.area("observations", "Observations du conseil")];


export const documentEleveFields: FieldDef[] = [
enumField("type_document", "Type de document", fromEnum(TYPE_DOCUMENT_ELEVE), { ...req, full: true }),
F.file("fichier", "Fichier", req)];


export const paiementFields = (): FieldDef[] => [
F.number("montant_fcfa", "Montant (FCFA)", { ...req, min: 1 }),
F.date("date_paiement", "Date du paiement", { ...req, defaultValue: todayISO() }),
F.text("mode_paiement", "Mode de paiement", { ...req, full: true, placeholder: "Espèces, virement, mobile money…" })];


export const visiteFields = (withE: boolean): FieldDef[] =>
withEleve(withE, [
F.text("motif", "Motif de la visite", { ...req, full: true }),
F.area("symptomes", "Symptômes"),
F.number("temperature_c", "Température (°C)", { step: 0.1 }),
enumField("suite_donnee", "Suite donnée", fromEnum(SUITE_VISITE)),
F.text("soin_administre", "Soin administré"),
F.text("medicament_donne", "Médicament donné"),
F.bool("renvoi_domicile", "Renvoyé à la maison"),
F.bool("parent_contacte", "Parent contacté")]
);

export const protocoleFields = (withE: boolean): FieldDef[] =>
withEleve(withE, [
F.text("condition", "Condition médicale", { ...req, full: true }),
F.area("protocole_texte", "Protocole à suivre", req),
F.text("medicament_urgence", "Médicament d'urgence"),
F.text("localisation_medicament", "Emplacement du médicament"),
F.text("medecin_traitant_contact", "Contact du médecin traitant"),
F.date("valide_par_medecin_le", "Validé par le médecin le")]
);

export const sanctionFields = (withE: boolean): FieldDef[] =>
withEleve(withE, [
enumField("type_sanction", "Type de sanction", fromEnum(TYPE_SANCTION), req),
F.date("date_sanction", "Date", { ...req, defaultValue: todayISO() }),
F.number("duree_jours", "Durée (jours)", {
  ...req,
  min: 1,
  showIf: (v) => v.type_sanction === "exclusion_temporaire"
}),
F.area("motif", "Motif", req)]
);

export const urgenceFields = (withE: boolean): FieldDef[] =>
withEleve(withE, [F.area("motif", "Motif de l'alerte", { ...req, placeholder: "Ex. : malaise en classe, l'élève a été pris en charge" })], "eleve_nom");

export const absenceFields = (withE: boolean): FieldDef[] =>
withEleve(
  withE,
  [F.date("date_absence", "Date de l'absence", { ...req, defaultValue: todayISO() }), F.bool("justifiee", "Absence justifiée")],
  "eleve_nom"
);