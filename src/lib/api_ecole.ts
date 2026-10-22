// lib/api_ecole.ts — Module ÉCOLE : toutes les routes /api/ecole
// Source unique de vérité : le backend. Aucune logique métier côté client.
import { api, apiRaw } from "@/lib/api";
import type {
  OverrideEcheanceBody,
  OverrideEcheanceResultat,
  RegistresStatut,
  Row,
  SynchroRegistresParams,
  TacheLancee,
  TeleversementRegistreResultat,
  TypeRegistre
} from "../types/ui";
type Q = Record<string, unknown>;

const E = "/api/ecole";
const ECOLE_TASK_RESULT_PATH = `${E}/tasks`;
const s = (v: string) => encodeURIComponent(v);

export interface FichierBinaire {
  blob: Blob;
  filename: string;
  mimeType: string;
}

function extraireNomFichier(cd: string): string | null {
  const star = cd.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
      return star[1].trim();
    }
  }
  const plain = cd.match(/filename\s*=\s*"?([^";]+)"?/i);
  return plain ? plain[1].trim() : null;
}

async function fetchBinaire(
path: string,
fallbackName: string,
query?: Q,
method: "GET" | "POST" = "GET")
: Promise<FichierBinaire> {
  const res: Response = await apiRaw(path, { method, query, rawResponse: true });
  const cd = res.headers.get("content-disposition") || "";
  const mimeType = res.headers.get("content-type")?.split(";")[0].trim() || "application/octet-stream";
  return { blob: await res.blob(), filename: extraireNomFichier(cd) ?? fallbackName, mimeType };
}

const get = (path: string, query?: Q) => api(path, { query, rawJson: true });
const post = (path: string, body?: unknown, query?: Q) => api(path, { method: "POST", body, query, rawJson: true });
const patch = (path: string, body: unknown) => api(path, { method: "PATCH", body, rawJson: true });
const put = (path: string, body: unknown) => api(path, { method: "PUT", body, rawJson: true });
const del = (path: string, query?: Q) => api(path, { method: "DELETE", query, rawJson: true });

// ── Classes, années ──────────────────────────────────────────────────────
export const listerClasses = (anneeScolaireId: string): Promise<Row[]> => get(`${E}/classes`, { annee_scolaire_id: anneeScolaireId });
export const listerAnnees = (): Promise<Row[]> => get(`${E}/annees`);
export const getAnneeActive = (): Promise<Row | null> => get(`${E}/annees/active`);
export const creerAnnee = (body: Row): Promise<Row> => post(`${E}/annees`, body);

// ── Élèves & inscriptions ────────────────────────────────────────────────
export const creerEleve = (body: Row): Promise<Row> => post(`${E}/eleves`, body);
export const inscrireEleve = (body: Row): Promise<Row> => post(`${E}/inscriptions`, body);

// ── Notes & bulletins ────────────────────────────────────────────────────
export const saisirNote = (body: Row): Promise<Row> => post(`${E}/notes`, body);
export const getApercuBulletin = (params: {eleve_id: string;classe_id: string;periode_id: string;}): Promise<Row> =>
get(`${E}/bulletins/apercu`, params);
export const getClassementClasse = (classeId: string, periodeId: string): Promise<Row[]> =>
get(`${E}/classes/${s(classeId)}/classement`, { periode_id: periodeId });
export const publierBulletin = (body: Row): Promise<Row> => post(`${E}/bulletins/publier`, body);

// ── Tâches ───────────────────────────────────────────────────────────────
export const getTacheEcole = (taskId: string): Promise<Row> => get(`${E}/tasks/${s(taskId)}`);

// ── Finance ──────────────────────────────────────────────────────────────
export const enregistrerPaiement = (body: Row): Promise<Row> => post(`${E}/paiements`, body);
export const getSituationFinanciere = (eleveId: string): Promise<Row> => get(`${E}/eleves/${s(eleveId)}/situation-financiere`);

// ── Présences ────────────────────────────────────────────────────────────
export const faireAppel = (body: Row): Promise<Row> => post(`${E}/appels`, body);

// ── Référentiel ──────────────────────────────────────────────────────────
export const listerCycles = (): Promise<Row[]> => get(`${E}/referentiel/cycles`);
export const listerNiveaux = (cycleId: string): Promise<Row[]> => get(`${E}/referentiel/cycles/${s(cycleId)}/niveaux`);
export const listerSeries = (): Promise<Row[]> => get(`${E}/referentiel/series`);

// ── Classes (référentiel / EDT) ──────────────────────────────────────────
export const creerClasseDepuisReferentiel = (body: Row): Promise<Row> => post(`${E}/classes/creer-depuis-referentiel`, body);
export const basculerTypeEdt = (classeId: string, body: Row): Promise<Row> => post(`${E}/classes/${s(classeId)}/basculer-type-edt`, body);
export const getEmploiDuTempsClasse = (classeId: string): Promise<Row> => get(`${E}/classes/${s(classeId)}/emploi-du-temps`);

// ── Élèves ───────────────────────────────────────────────────────────────
export const listerEleves = (params: {q?: string;statut?: string;} = {}): Promise<Row[]> => get(`${E}/eleves`, params);
export const getEleve = (eleveId: string): Promise<Row> => get(`${E}/eleves/${s(eleveId)}`);

// ── Enseignants ──────────────────────────────────────────────────────────
export const creerEnseignant = (body: Row): Promise<Row> => post(`${E}/enseignants`, body);
export const listerEnseignants = (params: {q?: string;actif_seulement?: boolean;} = {}): Promise<Row[]> => get(`${E}/enseignants`, params);
export const getEnseignant = (employeId: string): Promise<Row> => get(`${E}/enseignants/${s(employeId)}`);
export const modifierEnseignant = (employeId: string, data: Row): Promise<Row> => patch(`${E}/enseignants/${s(employeId)}`, data);

// ── Initialisation ───────────────────────────────────────────────────────
export const initialiserEtablissement = (): Promise<Row> => post(`${E}/initialiser-etablissement`);

// ── Parents — codes enveloppe ────────────────────────────────────────────
export const genererCodeEnveloppeParent = (parentId: string, forceNouveau?: boolean): Promise<Row> =>
post(`${E}/parents/${s(parentId)}/generer-code-enveloppe`, undefined, { force_nouveau: forceNouveau });
export const getCodeEnveloppeParent = (parentId: string): Promise<Row> => get(`${E}/parents/${s(parentId)}/code-enveloppe`);
export const listerCodesEnveloppeParent = (parentId: string): Promise<Row[]> => get(`${E}/parents/${s(parentId)}/codes-enveloppe`);

// ── Appels ───────────────────────────────────────────────────────────────
export const listerAppelsClasse = (classeId: string, params: {date_debut?: string;date_fin?: string;} = {}): Promise<Row[]> =>
get(`${E}/classes/${s(classeId)}/appels`, params);
export const getAppel = (appelId: string): Promise<Row> => get(`${E}/appels/${s(appelId)}`);

// ── EDT template ─────────────────────────────────────────────────────────
export const getEdtTemplateClasse = (classeId: string): Promise<Row> => get(`${E}/classes/${s(classeId)}/edt-template`);

// ═══ route_ecole_extended.py ═══
export const creerMatiere = (data: Row): Promise<Row> => post(`${E}/matieres`, data);
export const listerMatieres = (): Promise<Row[]> => get(`${E}/matieres`);
export const supprimerMatiere = (matiereId: string): Promise<Row> => del(`${E}/matieres/${s(matiereId)}`);

export const affecterMatiereClasse = (data: Row): Promise<Row> => post(`${E}/matieres-classe`, data);
export const listerMatieresClasse = (classeId: string): Promise<Row[]> => get(`${E}/classes/${s(classeId)}/matieres`);
export const retirerMatiereClasse = (matiereClasseId: string): Promise<Row> => del(`${E}/matieres-classe/${s(matiereClasseId)}`);

export const creerPeriode = (data: Row): Promise<Row> => post(`${E}/periodes`, data);
export const listerPeriodes = (anneeScolaireId: string): Promise<Row[]> => get(`${E}/annees/${s(anneeScolaireId)}/periodes`);

export const creerBareme = (data: Row): Promise<Row> => post(`${E}/baremes-notation`, data);
export const listerBaremes = (): Promise<Row[]> => get(`${E}/baremes-notation`);

export const creerTypeEvaluation = (data: Row): Promise<Row> => post(`${E}/types-evaluation`, data);
export const listerTypesEvaluation = (): Promise<Row[]> => get(`${E}/types-evaluation`);

// ── Admissions ───────────────────────────────────────────────────────────
export const creerCandidature = (data: Row): Promise<Row> => post(`${E}/admissions/candidatures`, data);
export const listerCandidatures = (statut?: string): Promise<Row[]> => get(`${E}/admissions/candidatures`, { statut });
export const getCandidature = (id: string): Promise<Row> => get(`${E}/admissions/candidatures/${s(id)}`);
export const statuerCandidature = (id: string, body: Row): Promise<Row> => post(`${E}/admissions/candidatures/${s(id)}/statuer`, body);
export const convertirCandidature = (id: string, body: Row): Promise<Row> => post(`${E}/admissions/candidatures/${s(id)}/convertir`, body);
export const getTauxRemplissage = (anneeScolaireId: string): Promise<Row[]> =>
get(`${E}/admissions/taux-remplissage`, { annee_scolaire_id: anneeScolaireId });

// ── Bibliothèque ─────────────────────────────────────────────────────────
export const creerOuvrage = (data: Row): Promise<Row> => post(`${E}/bibliotheque/ouvrages`, data);
export const listerOuvrages = (q?: string): Promise<Row[]> => get(`${E}/bibliotheque/ouvrages`, { q });
export const supprimerOuvrage = (id: string): Promise<Row> => del(`${E}/bibliotheque/ouvrages/${s(id)}`);
export const emprunterOuvrage = (body: Row): Promise<Row> => post(`${E}/bibliotheque/emprunts`, body);
export const retournerEmprunt = (id: string): Promise<Row> => post(`${E}/bibliotheque/emprunts/${s(id)}/retourner`);
export const listerEmprunts = (params: {eleve_id?: string;statut?: string;} = {}): Promise<Row[]> =>
get(`${E}/bibliotheque/emprunts`, params);

// ── Transport ────────────────────────────────────────────────────────────
export const creerVehicule = (data: Row): Promise<Row> => post(`${E}/transport/vehicules`, data);
export const listerVehicules = (): Promise<Row[]> => get(`${E}/transport/vehicules`);
export const creerCircuit = (data: Row): Promise<Row> => post(`${E}/transport/circuits`, data);
export const listerCircuits = (): Promise<Row[]> => get(`${E}/transport/circuits`);
export const creerAbonnementTransport = (data: Row): Promise<Row> => post(`${E}/transport/abonnements`, data);
export const pointerTransport = (body: Row): Promise<Row> => post(`${E}/transport/pointer`, body);
export const getAnomaliesTransport = (dateTrajet: string): Promise<Row[]> => get(`${E}/transport/anomalies`, { date_trajet: dateTrajet });

// ── Infirmerie ───────────────────────────────────────────────────────────
export const enregistrerVisiteInfirmerie = (body: Row): Promise<Row> => post(`${E}/infirmerie/visites`, body);
export const listerVisitesInfirmerie = (eleveId?: string): Promise<Row[]> => get(`${E}/infirmerie/visites`, { eleve_id: eleveId });
export const getContactUrgenceEleve = (eleveId: string): Promise<Row> => get(`${E}/infirmerie/eleves/${s(eleveId)}/contact-urgence`);
export const creerProtocoleUrgence = (data: Row): Promise<Row> => post(`${E}/infirmerie/protocoles`, data);
export const getProtocoleUrgence = (eleveId: string): Promise<Row | null> => get(`${E}/infirmerie/eleves/${s(eleveId)}/protocole`);
export const getVaccinationsARelancer = (joursAvant?: number): Promise<Row[]> =>
get(`${E}/infirmerie/vaccinations/a-relancer`, { jours_avant: joursAvant });

// ── Finance avancée ──────────────────────────────────────────────────────
export const enregistrerPaiementAvecCredit = (body: Row): Promise<Row> => post(`${E}/finance/paiements-avec-credit`, body);
export const getSituationFinanciereComplete = (eleveId: string): Promise<Row> => get(`${E}/finance/eleves/${s(eleveId)}/situation-complete`);
export const listerMouvementsCredit = (eleveId: string): Promise<Row[]> => get(`${E}/finance/eleves/${s(eleveId)}/mouvements-credit`);
export const creerGrilleFrais = (data: Row): Promise<Row> => post(`${E}/finance/grilles-frais`, data);
export const listerGrillesFrais = (anneeScolaireId: string): Promise<Row[]> =>
get(`${E}/finance/grilles-frais`, { annee_scolaire_id: anneeScolaireId });
export const listerDepenses = (): Promise<Row[]> => get(`${E}/finance/depenses`);
export const creerDepense = (data: Row): Promise<Row> => post(`${E}/finance/depenses`, data);
export const creerDemandeAchat = (data: Row): Promise<Row> => post(`${E}/finance/demandes-achat`, data);
export const listerDemandesAchat = (statut?: string): Promise<Row[]> => get(`${E}/finance/demandes-achat`, { statut });
export const approuverDemandeAchat = (id: string): Promise<Row> => post(`${E}/finance/demandes-achat/${s(id)}/approuver`);

// ── Emploi du temps variable ─────────────────────────────────────────────
export const creerCreneau = (body: Row): Promise<Row> => post(`${E}/edt/creneaux`, body);
export const verifierConflitsCreneau = (params: Row): Promise<Row[]> => get(`${E}/edt/creneaux/verifier-conflits`, params);
export const remplacerCreneau = (creneauId: string, body: Row): Promise<Row> => post(`${E}/edt/creneaux/${s(creneauId)}/remplacer`, body);
export const getEdtClasse = (classeId: string): Promise<Row> => get(`${E}/edt/classes/${s(classeId)}`);
export const getEdtClasseADate = (classeId: string, dateReference: string): Promise<Row> =>
get(`${E}/edt/classes/${s(classeId)}/a-date`, { date_reference: dateReference });
export const getEdtEnseignant = (enseignantId: string): Promise<Row> => get(`${E}/edt/enseignants/${s(enseignantId)}`);

// ── Dashboard direction ──────────────────────────────────────────────────
export const getDashboardDirection = (anneeScolaireId: string): Promise<Row> =>
get(`${E}/dashboard/direction`, { annee_scolaire_id: anneeScolaireId });
export const getTauxAbsenteisme = (dateDebut: string, dateFin: string): Promise<Row[]> =>
get(`${E}/dashboard/absenteisme`, { date_debut: dateDebut, date_fin: dateFin });

// ── Livret scolaire ──────────────────────────────────────────────────────
export const getLivretAnnuel = (eleveId: string, anneeScolaireId: string): Promise<Row> =>
get(`${E}/livret/eleves/${s(eleveId)}/annees/${s(anneeScolaireId)}`);
export const cloturerAnneeEleve = (eleveId: string, anneeScolaireId: string, body: Row): Promise<Row> =>
post(`${E}/livret/eleves/${s(eleveId)}/annees/${s(anneeScolaireId)}/cloturer`, body);
export const getLivretParcours = (eleveId: string): Promise<Row[]> => get(`${E}/livret/eleves/${s(eleveId)}/parcours`);

// ── Code d'accès enfant ──────────────────────────────────────────────────
export const genererCodeAccesEleve = (eleveId: string): Promise<Row> => post(`${E}/eleves/${s(eleveId)}/generer-code-acces`);
export const getCodeAccesEleve = (eleveId: string): Promise<Row | null> => get(`${E}/eleves/${s(eleveId)}/code-acces`);

// ── Discipline ───────────────────────────────────────────────────────────
export const creerSanction = (body: Row): Promise<Row> => post(`${E}/discipline/sanctions`, body);
export const listerSanctionsEleve = (eleveId: string): Promise<Row[]> => get(`${E}/discipline/eleves/${s(eleveId)}/sanctions`);

// ── Patrimoine ───────────────────────────────────────────────────────────
export const creerSalle = (data: Row): Promise<Row> => post(`${E}/patrimoine/salles`, data);
export const listerSalles = (): Promise<Row[]> => get(`${E}/patrimoine/salles`);
export const creerMaterielPedagogique = (data: Row): Promise<Row> => post(`${E}/patrimoine/materiel`, data);
export const listerMaterielPedagogique = (): Promise<Row[]> => get(`${E}/patrimoine/materiel`);

// ── Événements, réunions, convocations, signatures ───────────────────────
export const creerEvenement = (data: Row): Promise<Row> => post(`${E}/evenements`, data);
export const listerEvenements = (): Promise<Row[]> => get(`${E}/evenements`);
export const creerReunion = (data: Row): Promise<Row> => post(`${E}/reunions`, data);
export const listerReunions = (): Promise<Row[]> => get(`${E}/reunions`);
export const creerConvocation = (body: Row): Promise<Row> => post(`${E}/convocations`, body);
export const listerConvocations = (statut?: string): Promise<Row[]> => get(`${E}/convocations`, { statut });
export const creerSignatureRequise = (data: Row): Promise<Row> => post(`${E}/signatures`, data);
export const listerSignatures = (params: {eleve_id?: string;signe?: boolean;} = {}): Promise<Row[]> => get(`${E}/signatures`, params);

// ── Notifications ────────────────────────────────────────────────────────
export const notifierAbsence = (body: Row): Promise<Row> => post(`${E}/notifications/absence`, body);
export const notifierUrgenceSante = (body: Row): Promise<Row> => post(`${E}/notifications/urgence-sante`, body);
export const getJournalNotifications = (eleveId?: string): Promise<Row[]> => get(`${E}/notifications/journal`, { eleve_id: eleveId });

// ── Parents ──────────────────────────────────────────────────────────────
export const creerCompteParent = (body: Row): Promise<Row> => post(`${E}/parents/creer-compte`, body);
export const listerParents = (q?: string): Promise<Row[]> => get(`${E}/parents`, { q });
export const getParent = (parentId: string): Promise<Row> => get(`${E}/parents/${s(parentId)}`);
export const listerEnfantsParent = (parentId: string): Promise<Row[]> => get(`${E}/parents/${s(parentId)}/enfants`);
export const lierEnfantParent = (parentId: string, body: Row): Promise<Row> => post(`${E}/parents/${s(parentId)}/lier-enfant`, body);

// ── Initialisation complète ──────────────────────────────────────────────
export const initialisationComplete = (): Promise<Row> => post(`${E}/initialisation/complete`);

// ── Cartes scolaires ─────────────────────────────────────────────────────
export const getCarteApercu = (eleveId: string, params: {face?: string;template?: string;} = {}): Promise<FichierBinaire> =>
fetchBinaire(`${E}/eleves/${s(eleveId)}/carte/apercu`, `carte_${eleveId}_${params.face ?? "recto"}.png`, {
  face: params.face,
  template: params.template
});
export const getCartePdf = (eleveId: string, params: {template?: string;persist?: boolean;} = {}): Promise<FichierBinaire> =>
fetchBinaire(`${E}/eleves/${s(eleveId)}/carte/pdf`, `carte_${eleveId}.pdf`, {
  template: params.template,
  persist: params.persist
});
export const getConfigCarte = (): Promise<Row> => get(`${E}/cartes/config`);
export const setConfigCarte = (data: Row): Promise<Row> => put(`${E}/cartes/config`, data);
export const lancerPlancheCartesClasse = (classeId: string, template?: string): Promise<Row> =>
post(`${E}/classes/${s(classeId)}/cartes/pdf`, undefined, { template });
export const plancheCartesClasseEtAttendre = (classeId: string, template?: string): Promise<unknown> =>
api(`${E}/classes/${s(classeId)}/cartes/pdf`, { method: "POST", query: { template }, taskResultPath: ECOLE_TASK_RESULT_PATH });
export const getCartesTemplates = (): Promise<Row> => get(`${E}/cartes/templates`);
export const telechargerPlancheCartes = (fichier: string): Promise<FichierBinaire> => fetchBinaire(`${E}/cartes/planches/${s(fichier)}`, fichier);

// ── Photos de classe ─────────────────────────────────────────────────────
export const listerPhotosClasse = (classeId: string, params: {annee_scolaire_id?: string;periode_id?: string;} = {}): Promise<Row[]> =>
get(`${E}/classes/${s(classeId)}/photos`, params);
export const ajouterPhotoClasse = (classeId: string, data: Row): Promise<Row> => post(`${E}/classes/${s(classeId)}/photos`, data);
export const supprimerPhoto = (photoId: string): Promise<Row> => del(`${E}/photos/${s(photoId)}`);
export const listerPhotosEleve = (eleveId: string): Promise<Row[]> => get(`${E}/eleves/${s(eleveId)}/photos`);

// ── Matériel scolaire / de classe ────────────────────────────────────────
export const getCatalogueMaterielScolaire = (params: {categorie?: string;q?: string;} = {}): Promise<Row[]> =>
get(`${E}/materiel-scolaire/catalogue`, params);
export const getCategoriesMaterielScolaire = (): Promise<string[]> => get(`${E}/materiel-scolaire/categories`);
export const listerMaterielClasse = (classeId: string): Promise<Row[]> => get(`${E}/classes/${s(classeId)}/materiel`);
export const ajouterMaterielClasse = (classeId: string, data: Row): Promise<Row> => post(`${E}/classes/${s(classeId)}/materiel`, data);
export const modifierMaterielClasse = (materielId: string, data: Row): Promise<Row> => patch(`${E}/materiel/${s(materielId)}`, data);
export const supprimerMaterielClasse = (materielId: string): Promise<Row> => del(`${E}/materiel/${s(materielId)}`);

// ── Parcours élève ───────────────────────────────────────────────────────
export const getParcoursCompletEleve = (eleveId: string): Promise<Row> => get(`${E}/eleves/${s(eleveId)}/parcours-complet`);
export const recalculerParcoursEleve = (eleveId: string): Promise<Row> => post(`${E}/eleves/${s(eleveId)}/recalculer-parcours`);

// ── Analytics ────────────────────────────────────────────────────────────
export const recalculerStatsEnseignant = (employeId: string, anneeScolaireId: string): Promise<Row> =>
post(`${E}/analytics/enseignants/${s(employeId)}/recalculer`, undefined, { annee_scolaire_id: anneeScolaireId });
export const getClassementEnseignants = (anneeScolaireId: string, tri?: string): Promise<Row[]> =>
get(`${E}/analytics/enseignants`, { annee_scolaire_id: anneeScolaireId, tri });
export const recalculerStatsClasse = (classeId: string, anneeScolaireId: string): Promise<Row> =>
post(`${E}/analytics/classes/${s(classeId)}/recalculer`, undefined, { annee_scolaire_id: anneeScolaireId });
export const getClassementClasses = (anneeScolaireId: string): Promise<Row[]> =>
get(`${E}/analytics/classes`, { annee_scolaire_id: anneeScolaireId });
export const recalculerCombinaisonsProfs = (): Promise<Row> => post(`${E}/analytics/combinaisons-profs/recalculer`);
export const getClassementCombinaisonsProfs = (fiabiliteMin?: string): Promise<Row[]> =>
get(`${E}/analytics/combinaisons-profs`, { fiabilite_min: fiabiliteMin });

// ── Grille de frais — détail ─────────────────────────────────────────────
export const getDetailGrilleFrais = (grilleId: string): Promise<Row[]> => get(`${E}/finance/grille-frais/${s(grilleId)}/detail`);
export const ajouterEcheanceGrilleFrais = (grilleId: string, data: Row): Promise<Row> =>
post(`${E}/finance/grille-frais/${s(grilleId)}/detail`, data);
export const supprimerEcheanceGrilleFrais = (detailId: string): Promise<Row> => del(`${E}/finance/grille-frais/detail/${s(detailId)}`);
export const autoGenererEcheancesGrilleFrais = (grilleId: string, body: Row = {}): Promise<Row[]> =>
post(`${E}/finance/grille-frais/${s(grilleId)}/detail/auto-generer`, body);
export const getOptionsGrilleFrais = (niveauId?: string): Promise<Row> => get(`${E}/finance/options-grille`, { niveau_id: niveauId });

// ── Configuration finance ────────────────────────────────────────────────
export const getConfigFinance = (): Promise<Row | null> => get(`${E}/finance/config-etablissement`);
export const setConfigFinance = (data: Row): Promise<Row> => post(`${E}/finance/config-etablissement`, data);

// ── Catégories de dépenses ───────────────────────────────────────────────
export const getCategoriesDepenses = (): Promise<Row[]> => get(`${E}/finance/categories-depenses`);
export const creerCategorieDepense = (data: Row): Promise<Row> => post(`${E}/finance/categories-depenses`, data);

// ── Seed catalogues ──────────────────────────────────────────────────────
export const seedCataloguesGlobaux = (): Promise<Row> => post(`${E}/seed/catalogues-globaux`);

// ── Paiements déclarés ───────────────────────────────────────────────────
export const listerPaiementsEnAttente = (): Promise<Row[]> => get(`${E}/finance/paiements-en-attente`);
export const validerPaiement = (id: string): Promise<Row> => post(`${E}/finance/paiements/${s(id)}/valider`);
export const rejeterPaiement = (id: string, body: Row): Promise<Row> => post(`${E}/finance/paiements/${s(id)}/rejeter`, body);

// ── Code d'activation parent ─────────────────────────────────────────────
export const genererCodeActivationParent = (body: Row = {}): Promise<Row> => post(`${E}/parents/generer-code-activation`, body);

// ── Enseignants — portail, affectations, charge ──────────────────────────
export const activerPortailEnseignant = (employeId: string, body: Row = {}): Promise<Row> =>
post(`${E}/enseignants/${s(employeId)}/activer-portail`, body);
export const listerAffectationsEnseignant = (
employeId: string,
params: {annee_scolaire_id?: string;inclure_historique?: boolean;} = {})
: Promise<Row[]> => get(`${E}/enseignants/${s(employeId)}/affectations`, params);
export const affecterEnseignantMasse = (employeId: string, body: Row): Promise<Row> =>
post(`${E}/enseignants/${s(employeId)}/affectations`, body);
export const retirerAffectationEnseignant = (matiereClasseId: string, params: {date_fin?: string;motif?: string;} = {}): Promise<Row> =>
del(`${E}/matieres-classe/${s(matiereClasseId)}/enseignant`, params);
export const changerEnseignant = (matiereClasseId: string, body: Row): Promise<Row> =>
post(`${E}/matieres-classe/${s(matiereClasseId)}/changer-enseignant`, body);
export const getChargeHoraireEnseignant = (employeId: string, anneeScolaireId?: string): Promise<Row> =>
get(`${E}/enseignants/${s(employeId)}/charge-horaire`, { annee_scolaire_id: anneeScolaireId });

// ── EDT bulk & historique ────────────────────────────────────────────────
export const creerCreneauxBulk = (classeId: string, body: Row): Promise<Row> => post(`${E}/edt/classes/${s(classeId)}/bulk`, body);
export const getHistoriqueEdtClasse = (classeId: string, params: {date_debut?: string;date_fin?: string;} = {}): Promise<Row[]> =>
get(`${E}/edt/classes/${s(classeId)}/historique`, params);

// ── Enseignants — parcours, stats ────────────────────────────────────────
export const getParcoursEnseignant = (employeId: string): Promise<Row> => get(`${E}/enseignants/${s(employeId)}/parcours`);
export const lancerRecalculParcoursTousEleves = (): Promise<Row> => post(`${E}/parcours/recalculer-tous`);
export const recalculerParcoursTousElevesEtAttendre = (): Promise<unknown> =>
api(`${E}/parcours/recalculer-tous`, { method: "POST", taskResultPath: ECOLE_TASK_RESULT_PATH });
export const lancerRecalculParcoursTousEnseignants = (): Promise<Row> => post(`${E}/enseignants/parcours/recalculer-tous`);
export const recalculerParcoursTousEnseignantsEtAttendre = (): Promise<unknown> =>
api(`${E}/enseignants/parcours/recalculer-tous`, { method: "POST", taskResultPath: ECOLE_TASK_RESULT_PATH });
export const getStatsCumuleesEnseignant = (employeId: string): Promise<Row> => get(`${E}/enseignants/${s(employeId)}/stats-cumulees`);

// ── Élèves sans classe ───────────────────────────────────────────────────
export const listerElevesSansClasse = (): Promise<Row[]> => get(`${E}/eleves-sans-classe`);

// ── Devoirs ──────────────────────────────────────────────────────────────
export const creerDevoir = (body: Row): Promise<Row> => post(`${E}/devoirs`, body);

// ── Enseignants — identité, par matière, titulaires, photo ───────────────
export const getIdentiteEnseignant = (employeId: string, anneeScolaireId?: string): Promise<Row> =>
get(`${E}/enseignants/${s(employeId)}/identite`, { annee_scolaire_id: anneeScolaireId });
export const listerEnseignantsParMatiere = (anneeScolaireId?: string): Promise<Row[]> =>
get(`${E}/enseignants-par-matiere`, { annee_scolaire_id: anneeScolaireId });
export const listerClassesTitulaires = (anneeScolaireId?: string): Promise<Row[]> =>
get(`${E}/classes-titulaires`, { annee_scolaire_id: anneeScolaireId });
export const getPhotoEnseignant = (employeId: string): Promise<FichierBinaire> =>
fetchBinaire(`${E}/enseignants/${s(employeId)}/photo`, `enseignant_${employeId}.jpg`);

// ── Documents élève ──────────────────────────────────────────────────────
export const telechargerDocumentEleve = (eleveId: string, docId: string): Promise<FichierBinaire> =>
fetchBinaire(`${E}/eleves/${s(eleveId)}/documents/${s(docId)}/fichier`, `document_${docId}`);

// ── Évaluations & notes ──────────────────────────────────────────────────
export const creerEvaluation = (body: Row): Promise<Row> => post(`${E}/evaluations`, body);
export const listerEvaluations = (matiereClasseId: string, periodeId?: string): Promise<Row[]> =>
get(`${E}/evaluations`, { matiere_classe_id: matiereClasseId, periode_id: periodeId });
export const listerNotes = (evaluationId: string): Promise<Row[]> => get(`${E}/notes`, { evaluation_id: evaluationId });
export const saisirAppreciation = (body: Row): Promise<Row> => post(`${E}/appreciations`, body);

// ── Bulletins (classe) ───────────────────────────────────────────────────
export const lancerPublicationBulletinsClasse = (body: Row): Promise<Row> => post(`${E}/bulletins/publier-classe`, body);
export const publierBulletinsClasseEtAttendre = (body: Row): Promise<unknown> =>
api(`${E}/bulletins/publier-classe`, { method: "POST", body, taskResultPath: ECOLE_TASK_RESULT_PATH });
export const listerBulletins = (classeId: string, periodeId: string): Promise<Row[]> =>
get(`${E}/bulletins`, { classe_id: classeId, periode_id: periodeId });
export const getBulletinPdf = (bulletinId: string): Promise<FichierBinaire> =>
fetchBinaire(`${E}/bulletins/${s(bulletinId)}/pdf`, `bulletin_${bulletinId}.pdf`);

// ── Élève — photo & documents ────────────────────────────────────────────
export async function uploaderPhotoEleve(eleveId: string, fichier: File): Promise<Row> {
  const fd = new FormData();
  fd.append("fichier", fichier);
  return api(`${E}/eleves/${s(eleveId)}/photo`, { method: "POST", formData: fd, rawJson: true });
}
export async function uploaderDocumentEleve(eleveId: string, typeDocument: string, fichier: File): Promise<Row> {
  const fd = new FormData();
  fd.append("type_document", typeDocument);
  fd.append("fichier", fichier);
  return api(`${E}/eleves/${s(eleveId)}/documents`, { method: "POST", formData: fd, rawJson: true });
}
export const listerDocumentsEleve = (eleveId: string): Promise<Row[]> => get(`${E}/eleves/${s(eleveId)}/documents`);
export const supprimerDocumentEleve = (eleveId: string, docId: string): Promise<Row> => del(`${E}/eleves/${s(eleveId)}/documents/${s(docId)}`);

// ── Élève — modification & sortie ────────────────────────────────────────
export const modifierEleve = (eleveId: string, data: Row): Promise<Row> => patch(`${E}/eleves/${s(eleveId)}`, data);
export const enregistrerSortieEleve = (eleveId: string, body: Row): Promise<Row> => post(`${E}/eleves/${s(eleveId)}/sortie`, body);

// ── Inscription — changement de classe ───────────────────────────────────
export const changerClasseInscription = (inscriptionId: string, body: Row): Promise<Row> => patch(`${E}/inscriptions/${s(inscriptionId)}`, body);

// ── Années — activation & promotion ──────────────────────────────────────
export const activerAnnee = (anneeId: string): Promise<Row> => post(`${E}/annees/${s(anneeId)}/activer`);
export const promouvoirAnnee = (anneeId: string, body: Row): Promise<Row> => post(`${E}/annees/${s(anneeId)}/promotion`, body);

// ── Parents — relation élève ─────────────────────────────────────────────
export const lierParentEleve = (parentId: string, body: Row): Promise<Row> => post(`${E}/parents/${s(parentId)}/relations`, body);



// ── Enseignants — accès portail (code d'activation) ──────────────────────

export const genererCodeActivationEnseignant = (employeId: string, forceNouveau?: boolean): Promise<Row> =>
  post(`${E}/enseignants/${s(employeId)}/generer-code-activation`, undefined, { force_nouveau: forceNouveau });

export const getStatutAccesEnseignant = (employeId: string): Promise<Row> =>
  get(`${E}/enseignants/${s(employeId)}/acces-portail`);

export const revoquerAccesEnseignant = (employeId: string): Promise<Row> =>
  post(`${E}/enseignants/${s(employeId)}/revoquer-acces`);

export const listerCodesActivationEnseignant = (employeId: string): Promise<Row[]> =>
  get(`${E}/enseignants/${s(employeId)}/codes-activation`);


// ── Registres Excel ──────────────────────────────────────────────────────

export const getStatutRegistres = (): Promise<RegistresStatut> => get(`${E}/registres/statut`);

export const telechargerRegistreClasse = (classeId: string, typeRegistre: TypeRegistre): Promise<FichierBinaire> =>
  fetchBinaire(
    `${E}/registres/classes/${s(classeId)}/${s(typeRegistre)}/telecharger`,
    `registre_${typeRegistre}_${classeId}.xlsx`
  );

export async function televerserRegistreClasse(
  classeId: string,
  typeRegistre: TypeRegistre,
  fichier: File
): Promise<TeleversementRegistreResultat> {
  const fd = new FormData();
  fd.append("fichier", fichier);
  return api(`${E}/registres/classes/${s(classeId)}/${s(typeRegistre)}/televerser`, {
    method: "POST",
    formData: fd,
    rawJson: true
  });
}

export const lancerSynchroRegistres = (params: SynchroRegistresParams = {}): Promise<TacheLancee> =>
  post(`${E}/registres/synchroniser`, undefined, {
    classe_id: params.classe_id,
    complet: params.complet,
    types: params.types
  });

export const synchroRegistresEtAttendre = (params: SynchroRegistresParams = {}): Promise<unknown> =>
  api(`${E}/registres/synchroniser`, {
    method: "POST",
    query: { classe_id: params.classe_id, complet: params.complet, types: params.types },
    taskResultPath: ECOLE_TASK_RESULT_PATH
  });

export const exporterFinanceEleve = (eleveId: string, anneeScolaireId?: string): Promise<FichierBinaire> =>
  fetchBinaire(`${E}/registres/eleves/${s(eleveId)}/finance`, `finance_${eleveId}.xlsx`, {
    annee_scolaire_id: anneeScolaireId
  });

// ── Finance — override d'une échéance ────────────────────────────────────

export const overrideEcheance = (echeanceId: string, body: OverrideEcheanceBody): Promise<OverrideEcheanceResultat> =>
  post(`${E}/finance/echeances/${s(echeanceId)}/override`, body);

export const retirerOverrideEcheance = (echeanceId: string): Promise<OverrideEcheanceResultat> =>
  del(`${E}/finance/echeances/${s(echeanceId)}/override`);





// ── SEED DÉMO (entreprise spécifique uniquement) ─────────────────────────

export interface SeedDemoLance {
  task_id: string;
  statut: string;
  message: string;
  suivi_url: string;
}

export const lancerSeedDemo = (): Promise<SeedDemoLance> =>
  post(`${E}/seed/demo-complet`);

export interface SeedDemoStatut {
  task_id: string;
  state: string;
  ready: boolean;
  meta?: { log_tail?: string[]; nb_lignes?: number };
  result?: { log_tail?: string[]; nb_lignes?: number; message?: string };
  error?: string;
  result_db?: string;
}

export const getSeedDemoStatut = (taskId: string): Promise<SeedDemoStatut> =>
  get(`${E}/tasks/${s(taskId)}`);




// ── App mobile Android (APK) ─────────────────────────────────────────────
const APP_MOBILE = "/api/ecole/app-mobile";

export interface AppMobileVersion {
  filename: string;
  size_bytes: number;
  size_mb: number;
  modified_at: string;
  sha256: string | null;
  download_url: string; // URL absolue calculée côté backend
}

export interface AppMobileVersionsResponse {
  latest: AppMobileVersion | null;
  all_versions: AppMobileVersion[];
}

/** Liste les APK disponibles avec taille, date et hash SHA-256. */
export const getAppMobileVersions = (): Promise<AppMobileVersionsResponse> =>
  api(`${APP_MOBILE}/versions`, { rawJson: true, auth: false });

/** URL cible encodée dans le QR + URL publique de l'image QR. */
export const getAppMobileQrTarget = (): Promise<{ target_url: string; qr_url: string; label: string }> =>
  api(`${APP_MOBILE}/qr-url`, { rawJson: true, auth: false });









