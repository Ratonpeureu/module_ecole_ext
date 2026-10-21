import type { FieldDef, OptionItem } from "../../types/ui";
import { anneeField, eleveField, enseignantField, enumField, F, parentField, req } from "../../utils/fieldBuilders";
import {
  fromEnum,
  optCatalogueMateriel,
  optCategoriesDepenses,
  optCategoriesDepensesRacines,
  optCircuits,
  optClasses,
  optEleves,
  optEvenements,
  optOuvrages,
  optPeriodes,
  optSalles,
  optVehicules } from
"../../utils/options";
import { todayISO } from "../../utils/format";
import {
  CANAUX,
  CATEGORIE_MATERIEL_PEDA,
  CATEGORIE_OUVRAGE,
  ETAT_MATERIEL_CLASSE,
  ETAT_MATERIEL_PEDA,
  EVENEMENT_TRANSPORT,
  SENS_CIRCUIT,
  TYPE_DOC_SIGNATURE,
  TYPE_SALLE } from
"../enums";

// ── Finance ───────────────────────────────────────────────────────────────
export const grilleFields = (anneeId: string, niveaux: OptionItem[]): FieldDef[] => [
F.select("niveau_id", "Niveau", { ...req, options: niveaux, searchable: true }),
anneeField(anneeId, req),
F.number("frais_inscription_fcfa", "Frais d'inscription (FCFA)", { min: 0 }),
F.number("frais_scolarite_annuel_fcfa", "Scolarité annuelle (FCFA)", { min: 0 }),
F.number("frais_cantine_mensuel_fcfa", "Cantine par mois (FCFA)", { min: 0 }),
F.number("frais_transport_mensuel_fcfa", "Transport par mois (FCFA)", { min: 0 }),
F.number("frais_uniforme_fcfa", "Uniforme (FCFA)", { min: 0 }),
F.number("frais_examen_fcfa", "Examen (FCFA)", { min: 0 }),
F.number("nb_tranches_paiement", "Nombre de tranches", { min: 1 })];


export const echeanceFields = (types: OptionItem[], mois: OptionItem[]): FieldDef[] => [
F.text("libelle", "Libellé", { ...req, full: true }),
F.select("type_frais", "Type de frais", { ...req, options: types }),
F.number("montant_fcfa", "Montant (FCFA)", { ...req, min: 0 }),
F.number("ordre", "Ordre", { ...req, min: 1, defaultValue: "1" }),
F.select("mois_declenchement", "Mois d'échéance", { options: mois, numeric: true }),
F.number("jour_du_mois", "Jour du mois", { min: 1, max: 31 }),
F.date("date_echeance_fixe", "Ou date fixe"),
F.number("ordre_affichage", "Ordre d'affichage", { min: 0 }),
F.bool("obligatoire", "Obligatoire", { defaultValue: true }),
F.area("description", "Description")];


export const autogenFields = (modes: OptionItem[], mois: OptionItem[]): FieldDef[] => [
F.select("mode", "Rythme de facturation", { options: modes }),
F.number("nb_tranches", "Nombre de tranches", { min: 1 }),
F.select("mois_debut", "Premier mois", { options: mois, numeric: true }),
F.number("jour_du_mois", "Jour du mois", { min: 1, max: 31 })];


export const depenseFields = (): FieldDef[] => [
F.text("libelle", "Libellé", { ...req, full: true }),
F.select("categorie", "Catégorie", { ...req, load: optCategoriesDepenses, searchable: true }),
F.number("montant_fcfa", "Montant (FCFA)", { ...req, min: 0 }),
F.date("date_depense", "Date", { ...req, defaultValue: todayISO() }),
F.text("fournisseur_nom", "Fournisseur"),
F.text("compte_comptable_ohada", "Compte comptable"),
F.text("justificatif_url", "Lien du justificatif")];


export const achatFields: FieldDef[] = [
F.text("designation", "Désignation", { ...req, full: true }),
F.number("quantite", "Quantité", { ...req, min: 1 }),
F.text("unite", "Unité", { placeholder: "unité, lot, rame…" }),
F.number("cout_estime_fcfa", "Coût estimé (FCFA)", { min: 0 }),
F.area("justification", "Justification")];


export const categorieDepenseFields: FieldDef[] = [
F.text("code", "Code", req),
F.text("libelle", "Libellé", req),
F.select("parent_id", "Catégorie parente", { load: optCategoriesDepensesRacines }),
F.text("compte_comptable_ohada", "Compte comptable"),
F.number("ordre", "Ordre", { min: 0 }),
F.area("description", "Description")];


export const configFinanceFields = (mois: OptionItem[]): FieldDef[] => [
F.select("mois_debut_annee_financiere", "Premier mois de l'année financière", { options: mois, numeric: true }),
F.number("jour_facturation_mensuelle", "Jour de facturation mensuelle", { min: 1, max: 31 }),
F.number("jours_grace_avant_retard", "Jours de grâce avant retard", { min: 0 }),
F.number("envoyer_rappel_avant_jours", "Rappel envoyé (jours avant)", { min: 0 }),
F.multi("canaux_notification", "Canaux de notification", { options: fromEnum(CANAUX) }),
F.text("compte_bancaire_principal", "Compte bancaire principal"),
F.text("operateur_mobile_money", "Opérateur mobile money"),
F.tel("numero_mobile_money", "Numéro mobile money"),
F.bool("autoriser_paiement_partiel", "Autoriser les paiements partiels"),
F.bool("autoriser_paiement_anticipe", "Autoriser les paiements anticipés"),
F.bool("appliquer_penalites_retard", "Appliquer des pénalités de retard"),
F.bool("generer_recus_automatiquement", "Générer les reçus automatiquement")];


// ── Bibliothèque ──────────────────────────────────────────────────────────
export const ouvrageFields: FieldDef[] = [
F.text("titre", "Titre", { ...req, full: true }),
F.text("auteur", "Auteur"),
F.text("isbn", "ISBN"),
enumField("categorie", "Catégorie", fromEnum(CATEGORIE_OUVRAGE)),
F.text("niveau_cible", "Niveau conseillé"),
F.number("nb_exemplaires_total", "Nombre d'exemplaires", { min: 1 })];


export const empruntFields = (ouvrageId?: string): FieldDef[] => [
...(ouvrageId ? [] : [F.select("ouvrage_id", "Ouvrage", { ...req, load: optOuvrages, searchable: true, full: true })]),
enumField("_type", "Emprunteur", [
{ value: "eleve", label: "Un élève" },
{ value: "employe", label: "Un enseignant" }],
{ ...req, defaultValue: "eleve", full: true }),
eleveField({ full: true, showIf: (v) => v._type === "eleve" }),
enseignantField("employe_id", "Enseignant", { ...req, full: true, showIf: (v) => v._type === "employe" })];


// ── Transport ─────────────────────────────────────────────────────────────
export const vehiculeFields: FieldDef[] = [
F.text("immatriculation", "Immatriculation", req),
F.text("modele", "Modèle"),
F.number("capacite_places", "Nombre de places", { min: 1 }),
F.date("date_derniere_visite_technique", "Dernière visite technique"),
F.date("date_expiration_assurance", "Fin de l'assurance"),
F.bool("actif", "En service", { defaultValue: true })];


export const circuitFields: FieldDef[] = [
F.text("libelle", "Nom du circuit", req),
F.select("vehicule_id", "Véhicule", { ...req, load: optVehicules }),
enumField("sens", "Sens", fromEnum(SENS_CIRCUIT), req),
F.time("heure_depart", "Heure de départ", req),
F.list("arrets", "Arrêts", {
  addLabel: "Ajouter un arrêt",
  itemFields: [
  F.text("nom", "Arrêt", req),
  F.number("ordre", "Ordre", { ...req, min: 1 }),
  F.time("heure_estimee", "Heure estimée", req)]

})];


export const abonnementFields = (): FieldDef[] => [
eleveField({ full: true }),
F.text("arret_nom", "Arrêt", req),
F.date("date_debut", "À partir du", { ...req, defaultValue: todayISO() }),
F.select("circuit_aller_id", "Circuit aller", { load: optCircuits }),
F.select("circuit_retour_id", "Circuit retour", { load: optCircuits }),
F.bool("actif", "Abonnement actif", { defaultValue: true })];


export const pointageFields = (): FieldDef[] => [
eleveField({ full: true }),
F.select("circuit_id", "Circuit", { ...req, load: optCircuits }),
F.date("date_trajet", "Date du trajet", { ...req, defaultValue: todayISO() }),
enumField("evenement", "Événement", fromEnum(EVENEMENT_TRANSPORT), req)];


// ── Patrimoine ────────────────────────────────────────────────────────────
export const salleFields: FieldDef[] = [
F.text("nom", "Nom de la salle", req),
enumField("type_salle", "Type", fromEnum(TYPE_SALLE)),
F.number("capacite", "Capacité", { min: 1 }),
F.bool("actif", "Disponible", { defaultValue: true }),
F.tags("equipements", "Équipements", { placeholder: "Ex. : vidéoprojecteur, puis Entrée" })];


export const materielPedaFields: FieldDef[] = [
F.text("designation", "Désignation", { ...req, full: true }),
enumField("categorie", "Catégorie", fromEnum(CATEGORIE_MATERIEL_PEDA)),
enumField("etat", "État", fromEnum(ETAT_MATERIEL_PEDA)),
F.number("quantite_totale", "Quantité totale", { min: 0 }),
F.number("quantite_disponible", "Quantité disponible", { min: 0 }),
F.select("salle_affectation_id", "Salle", { load: optSalles }),
F.date("date_acquisition", "Date d'acquisition"),
F.number("valeur_acquisition_fcfa", "Valeur d'acquisition (FCFA)", { min: 0 })];


export const materielClasseFields: FieldDef[] = [
F.select("materiel_catalogue_id", "Article du catalogue", {
  load: optCatalogueMateriel,
  searchable: true,
  labelTo: "designation",
  full: true
}),
F.text("designation", "Désignation", { ...req, full: true }),
F.number("quantite", "Quantité", { min: 1 }),
enumField("etat", "État", fromEnum(ETAT_MATERIEL_CLASSE)),
F.number("valeur_acquisition_fcfa", "Valeur (FCFA)", { min: 0 }),
F.date("date_acquisition", "Date d'acquisition"),
F.date("date_derniere_verification", "Dernière vérification"),
F.text("numero_serie", "Numéro de série"),
F.text("localisation_detail", "Emplacement précis", { full: true }),
F.area("remarques", "Remarques")];


export const materielClasseEditFields: FieldDef[] = [
F.text("designation", "Désignation", { full: true }),
enumField("etat", "État", fromEnum(ETAT_MATERIEL_CLASSE)),
F.date("date_acquisition", "Date d'acquisition"),
F.number("valeur_acquisition_fcfa", "Valeur (FCFA)", { min: 0 })];


// ── Vie scolaire ──────────────────────────────────────────────────────────
export const evenementFields = (anneeId: string): FieldDef[] => [
F.text("titre", "Titre", { ...req, full: true }),
F.date("date_debut", "Début", req),
F.date("date_fin", "Fin"),
F.select("classe_id", "Classe concernée", { load: optClasses(anneeId), help: "Laissez vide pour tout l'établissement" }),
F.text("lieu", "Lieu"),
F.area("description", "Description"),
F.bool("necessite_autorisation_parentale", "Autorisation parentale requise", { full: true })];


export const reunionFields = (anneeId: string): FieldDef[] => [
F.text("titre", "Objet", { ...req, full: true }),
F.date("date_reunion", "Date", req),
F.time("heure_debut", "Heure", req),
F.select("classe_id", "Classe", { load: optClasses(anneeId) }),
F.select("eleve_id", "Élève concerné", { load: optEleves, searchable: true }),
F.text("lieu", "Lieu", { full: true }),
F.area("compte_rendu", "Compte rendu")];


export const convocationFields = (): FieldDef[] => [
eleveField(),
parentField(),
F.date("date_convocation", "Date", { ...req, defaultValue: todayISO() }),
F.time("heure", "Heure", req),
F.area("motif", "Motif", req)];


export const signatureFields: FieldDef[] = [
eleveField(),
parentField(),
enumField("type_document", "Document", fromEnum(TYPE_DOC_SIGNATURE), req),
F.text("titre", "Titre", req),
F.text("document_url", "Lien du document"),
F.date("date_limite", "À signer avant le")];


export const photoClasseFields = (anneeId: string): FieldDef[] => [
F.text("url_photo", "Lien de la photo", { ...req, full: true }),
F.text("titre", "Titre"),
F.select("periode_id", "Période", { load: optPeriodes(anneeId) }),
F.date("date_prise", "Date de prise de vue"),
F.text("lieu_prise", "Lieu"),
F.text("photographe", "Photographe"),
F.select("evenement_id", "Événement", { load: optEvenements }),
F.text("legende", "Légende", { full: true }),
F.area("description", "Description"),
F.multi("eleves_presents", "Élèves présents", { load: optEleves }),
F.number("nb_eleves_visibles", "Nombre d'élèves visibles", { min: 0 }),
F.number("ordre_affichage", "Ordre d'affichage", { min: 0 }),
F.tags("tags", "Mots-clés"),
F.bool("est_publiee", "Publier la photo", { defaultValue: true })];