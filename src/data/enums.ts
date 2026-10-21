export const STATUT_ELEVE: Record<string, string> = {
  actif: "Actif",
  transfere: "Transféré",
  exclu: "Exclu",
  diplome: "Diplômé",
  abandon: "Abandon"
};
export const SEXE: Record<string, string> = { M: "Masculin", F: "Féminin" };
export const STATUT_SORTIE: Record<string, string> = {
  transfere: "Transféré",
  exclu: "Exclu",
  diplome: "Diplômé",
  abandon: "Abandon"
};
export const TYPE_DOCUMENT_ELEVE: Record<string, string> = {
  acte_naissance: "Acte de naissance",
  certificat_medical: "Certificat médical",
  bulletin_externe: "Bulletin externe",
  piece_identite_parent: "Pièce d'identité du parent",
  photo_identite: "Photo d'identité",
  vaccination: "Carnet de vaccination",
  carte_scolaire: "Carte scolaire",
  autre: "Autre document"
};
export const LIEN_PARENTE: Record<string, string> = { pere: "Père", mere: "Mère", tuteur: "Tuteur", autre: "Autre" };
export const CATEGORIE_MATIERE: Record<string, string> = {
  fondamentale: "Fondamentale",
  complementaire: "Complémentaire",
  optionnelle: "Optionnelle",
  sportive: "Sportive"
};
export const TYPE_BAREME: Record<string, string> = { numerique: "Numérique", competences: "Compétences", lettres: "Lettres" };
export const TYPE_EDT: Record<string, string> = { fixe: "Horaire fixe", variable: "Horaire variable" };
export const JOURS: Record<string, string> = {
  "0": "Lundi",
  "1": "Mardi",
  "2": "Mercredi",
  "3": "Jeudi",
  "4": "Vendredi",
  "5": "Samedi"
};
export const STATUT_PRESENCE: Record<string, string> = {
  present: "Présent",
  absent: "Absent",
  retard: "En retard",
  absent_justifie: "Absence justifiée"
};
export const STATUT_CANDIDATURE: Record<string, string> = {
  recue: "Reçue",
  test_planifie: "Test planifié",
  test_effectue: "Test effectué",
  acceptee: "Acceptée",
  liste_attente: "Liste d'attente",
  refusee: "Refusée",
  inscrite: "Inscrite"
};
export const DECISION_CANDIDATURE: Record<string, string> = {
  recue: "Reçue",
  test_planifie: "Test planifié",
  test_effectue: "Test effectué",
  acceptee: "Acceptée",
  liste_attente: "Liste d'attente",
  refusee: "Refusée"
};
export const CATEGORIE_OUVRAGE: Record<string, string> = {
  manuel_scolaire: "Manuel scolaire",
  roman: "Roman",
  bd: "Bande dessinée",
  documentaire: "Documentaire",
  general: "Général"
};
export const STATUT_EMPRUNT: Record<string, string> = {
  en_cours: "En cours",
  rendu: "Rendu",
  en_retard: "En retard",
  perdu: "Perdu"
};
export const SENS_CIRCUIT: Record<string, string> = { aller: "Aller", retour: "Retour" };
export const EVENEMENT_TRANSPORT: Record<string, string> = { montee: "Montée", descente: "Descente" };
export const TYPE_SANCTION: Record<string, string> = {
  avertissement: "Avertissement",
  blame: "Blâme",
  retenue: "Retenue",
  exclusion_temporaire: "Exclusion temporaire",
  exclusion_definitive: "Exclusion définitive"
};
export const TYPE_SALLE: Record<string, string> = {
  classe: "Salle de classe",
  laboratoire: "Laboratoire",
  informatique: "Salle informatique",
  sport: "Salle de sport",
  amphi: "Amphithéâtre"
};
export const CATEGORIE_MATERIEL_PEDA: Record<string, string> = {
  informatique: "Informatique",
  mobilier: "Mobilier",
  sport: "Sport",
  laboratoire: "Laboratoire",
  autre: "Autre"
};
export const ETAT_MATERIEL_PEDA: Record<string, string> = {
  neuf: "Neuf",
  bon: "Bon état",
  use: "Usé",
  hors_service: "Hors service"
};
export const ETAT_MATERIEL_CLASSE: Record<string, string> = {
  neuf: "Neuf",
  bon: "Bon état",
  use: "Usé",
  endommage: "Endommagé",
  hors_service: "Hors service",
  perdu: "Perdu",
  vendu: "Vendu"
};
export const STATUT_CONVOCATION: Record<string, string> = {
  envoyee: "Envoyée",
  confirmee: "Confirmée",
  honoree: "Honorée",
  absente: "Parent absent"
};
export const TYPE_DOC_SIGNATURE: Record<string, string> = {
  reglement_interieur: "Règlement intérieur",
  decharge_sortie: "Décharge de sortie",
  accuse_bulletin: "Accusé de réception du bulletin",
  autre: "Autre document"
};
export const STATUT_DEMANDE_ACHAT: Record<string, string> = {
  en_attente: "En attente",
  approuvee: "Approuvée",
  commandee: "Commandée",
  recue: "Reçue",
  rejetee: "Rejetée"
};
export const TRI_ENSEIGNANTS: Record<string, string> = {
  score: "Score de performance",
  moyenne: "Moyenne des élèves",
  taux_reussite: "Taux de réussite"
};
export const FIABILITE: Record<string, string> = { faible: "Faible", moyenne: "Moyenne", haute: "Haute" };
export const DECISION_CONSEIL: Record<string, string> = {
  passage: "Passage",
  redoublement: "Redoublement",
  orientation: "Orientation"
};
export const SUITE_VISITE: Record<string, string> = {
  retour_classe: "Retour en classe",
  renvoi: "Renvoi à la maison",
  hopital: "Hôpital",
  observation: "Sous observation"
};
export const MOTIF_CHANGEMENT: Record<string, string> = {
  remplacement: "Remplacement",
  reorganisation: "Réorganisation",
  arret_maladie: "Arrêt maladie",
  demission: "Démission",
  autre: "Autre"
};
export const STATUT_ANNEE: Record<string, string> = { a_venir: "À venir", en_cours: "En cours", archivee: "Archivée" };
export const FACE_CARTE: Record<string, string> = { recto: "Recto", verso: "Verso" };
export const CANAUX: Record<string, string> = { app: "Application", sms: "SMS", email: "E-mail" };
export const MODE_SALAIRE: Record<string, string> = { fixe: "Salaire fixe", horaire: "Taux horaire" };
export const STATUT_BULLETIN: Record<string, string> = { brouillon: "Brouillon", valide: "Validé", publie: "Publié" };
export const STATUT_EVALUATION: Record<string, string> = {
  planifiee: "Planifiée",
  saisie_en_cours: "Saisie en cours",
  validee: "Validée"
};
export const STATUT_ECHEANCE: Record<string, string> = {
  a_venir: "À venir",
  du: "Dû",
  paye_partiel: "Payé en partie",
  paye: "Payé",
  en_retard: "En retard"
};
export const STATUT_PAIEMENT: Record<string, string> = {
  en_attente_validation: "À valider",
  valide: "Validé",
  rejete: "Rejeté"
};
export const STATUT_DEPENSE: Record<string, string> = {
  en_attente: "En attente",
  approuvee: "Approuvée",
  payee: "Payée",
  rejetee: "Rejetée"
};
export const STATUT_AFFECTATION: Record<string, string> = { termine: "Terminée", annule: "Annulée" };
export const STATUT_REUNION: Record<string, string> = { planifiee: "Planifiée", terminee: "Terminée", annulee: "Annulée" };
export const TENDANCE: Record<string, string> = {
  stable: "Stable",
  hausse: "En hausse",
  baisse: "En baisse",
  positive: "Positive",
  neutre: "Neutre"
};
export const TYPE_MOUVEMENT: Record<string, string> = {
  alimentation: "Alimentation",
  utilisation: "Utilisation",
  remboursement: "Remboursement"
};
export const STATUT_ENVOI: Record<string, string> = { envoye: "Envoyé", echec: "Échec" };
export const SIGNE_FILTRE: Record<string, string> = { true: "Signés", false: "En attente de signature" };
export const AFFICHAGE_ACTIF: Record<string, string> = { true: "Actifs seulement", false: "Tous" };

export const VALUE_LABELS: Record<string, string> = {
  ...TYPE_DOCUMENT_ELEVE,
  ...LIEN_PARENTE,
  ...CATEGORIE_MATIERE,
  ...TYPE_BAREME,
  ...TYPE_EDT,
  ...STATUT_PRESENCE,
  ...STATUT_CANDIDATURE,
  ...CATEGORIE_OUVRAGE,
  ...STATUT_EMPRUNT,
  ...SENS_CIRCUIT,
  ...EVENEMENT_TRANSPORT,
  ...TYPE_SANCTION,
  ...TYPE_SALLE,
  ...CATEGORIE_MATERIEL_PEDA,
  ...ETAT_MATERIEL_CLASSE,
  ...STATUT_CONVOCATION,
  ...TYPE_DOC_SIGNATURE,
  ...STATUT_DEMANDE_ACHAT,
  ...FIABILITE,
  ...DECISION_CONSEIL,
  ...SUITE_VISITE,
  ...MOTIF_CHANGEMENT,
  ...STATUT_ANNEE,
  ...CANAUX,
  ...MODE_SALAIRE,
  ...STATUT_BULLETIN,
  ...STATUT_EVALUATION,
  ...STATUT_ECHEANCE,
  ...STATUT_PAIEMENT,
  ...STATUT_DEPENSE,
  ...STATUT_AFFECTATION,
  ...STATUT_REUNION,
  ...TENDANCE,
  ...TYPE_MOUVEMENT,
  ...STATUT_ENVOI,
  ...STATUT_ELEVE,
  ...SEXE
};