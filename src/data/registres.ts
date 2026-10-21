import type { TypeRegistre } from "../types/ui";

/** registre_service.HANDLERS[...].libelle */
export const TYPE_REGISTRE: Record<TypeRegistre, string> = {
  appels: "Appels",
  notes: "Notes",
  finance: "Finances",
  dossier: "Dossier"
};

/** registre_service.ORDRE */
export const ORDRE_REGISTRES: TypeRegistre[] = ["appels", "notes", "finance", "dossier"];

/** OverrideEcheanceBody.statut */
export const STATUT_OVERRIDE: Record<string, string> = {
  "Payé": "Payé",
  "Partiel": "Partiel",
  "Impayé": "Impayé",
  "Exonéré": "Exonéré"
};

/** registre_common._FILLS */
export const LEGENDE_COLONNES = [
  { couleur: "#1B3A6B", libelle: "Automatique" },
  { couleur: "#0A7075", libelle: "Formule" },
  { couleur: "#D97706", libelle: "Direction (modifiable)" },
  { couleur: "#6B7280", libelle: "Clé technique" }
];

/** registre_finance_service.F_ECH / registre_dossier_service.F_ELEVES */
export const FEUILLE_ECHEANCES = "Échéances";
export const FEUILLE_ELEVES_DOSSIER = "Élèves";

/** Intitulés de colonnes écrits  */
export const COLONNES_REGISTRE = {
  cle: "clé",
  matricule: "Matricule",
  nom: "Nom",
  prenom: "Prénom",
  echeance: "Échéance",
  dateEcheance: "Date échéance",
  solde: "Solde",
  statut: "Statut",
  overrideActif: "Override actif",
  statutManuel: "Statut manuel",
  montantManuel: "Montant payé manuel",
  motifManuel: "Motif manuel",
  situation: "Situation",
  statutFinancier: "Statut financier"
} as const;

/** Clés des rapports appliquer_corrections_notes / appliquer_overrides_finance */
export const LIBELLES_RAPPORT: Record<string, string> = {
  appliquees: "Corrections appliquées",
  retirees: "Corrections retirées",
  inchangees: "Lignes inchangées",
  appliques: "Statuts manuels appliqués",
  retires: "Statuts manuels retirés",
  inchanges: "Lignes inchangées"
};
