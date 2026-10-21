import type { ReactNode } from "react";

export type Row = Record<string, unknown>;

export type FormValue =
string |
number |
boolean |
string[] |
FormValues[] |
File |
null |
undefined;

export interface FormValues {
  [key: string]: FormValue;
}

export interface OptionItem {
  value: string;
  label: string;
  hint?: string;
  raw?: Row;
}

export type OptionLoader = (query: string, values: FormValues) => Promise<OptionItem[]>;

export type FieldType =
"text" |
"email" |
"tel" |
"password" |
"number" |
"date" |
"time" |
"textarea" |
"select" |
"multiselect" |
"boolean" |
"color" |
"tags" |
"list" |
"file";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: OptionItem[];
  load?: OptionLoader;
  dependsOn?: string[];
  searchable?: boolean;
  numeric?: boolean;
  labelTo?: string;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  defaultValue?: FormValue;
  full?: boolean;
  showIf?: (values: FormValues) => boolean;
  itemFields?: FieldDef[];
  addLabel?: string;
}

export interface Column {
  key: string;
  label?: string;
  render?: (row: Row) => ReactNode;
  align?: "left" | "right";
}


// ── Registres Excel ──────────────────────────────────────────────────────

/** registre_common : TYPE_APPELS, TYPE_NOTES, TYPE_FINANCE, TYPE_DOSSIER */
export type TypeRegistre = "appels" | "notes" | "finance" | "dossier";

/** registre_service.statut_registres → _i(r) */
export interface RegistreInfo {
  version: number;
  derniere_synchro: string | null;
  modifie_par: string | null;
  modifie_par_le: string | null;
}

export interface RegistreClasseStatut {
  classe_id: string;
  libelle: string;
  registres: Record<TypeRegistre, RegistreInfo | null>;
}

/** GET /api/ecole/registres/statut */
export interface RegistresStatut {
  annee: string | null;
  classes: RegistreClasseStatut[];
}

/** registre_notes_service.appliquer_corrections_notes */
export interface RapportImportNotes {
  appliquees: number;
  retirees: number;
  inchangees: number;
  anomalies: string[];
}

/** registre_finance_service.appliquer_overrides_finance */
export interface RapportImportFinance {
  appliques: number;
  retires: number;
  inchanges: number;
  anomalies: string[];
}

/** appels / dossier : avant=None → rapport reste {} */
export type RapportImportRegistre = RapportImportNotes | RapportImportFinance | Record<string, never>;

/** POST /api/ecole/registres/classes/{classe_id}/{type_registre}/televerser */
export interface TeleversementRegistreResultat {
  status: "registre_remplace";
  version: number;
  application: RapportImportRegistre;
}

/** POST /api/ecole/registres/synchroniser */
export interface TacheLancee {
  task_id: string;
}

export interface SynchroRegistresParams {
  classe_id?: string;
  complet?: boolean;
  types?: TypeRegistre[];
}

/** registres_tenant_task → synchroniser_registres_etablissement */
export interface SynchroRegistresErreur {
  classe: string;
  registre: TypeRegistre;
  erreur: string;
}

export type SynchroRegistresResultat =
  | { ignore: string }
  | { annee: string; classes: number; erreurs: SynchroRegistresErreur[] };

/** OverrideEcheanceBody.statut */
export type StatutOverrideEcheance = "Payé" | "Partiel" | "Impayé" | "Exonéré";

/** OverrideEcheanceBody */
export interface OverrideEcheanceBody {
  statut: StatutOverrideEcheance;
  montant?: number | null;
  motif?: string | null;
}

/** override_echeance → statut = _statut_db(e) */
export interface OverrideEcheanceResultat {
  echeance_id: string;
  statut: "paye" | "en_retard" | "paye_partiel" | "du";
  override_manuel: boolean;
}






