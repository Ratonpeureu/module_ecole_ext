import { API_BASE } from "@/lib/api";
import { VALUE_LABELS } from "../data/enums";
import type { Row } from "../types/ui";

export const str = (v: unknown): string => v === null || v === undefined ? "" : String(v);

export const num = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export const arr = (v: unknown): Row[] => Array.isArray(v) ? v as Row[] : [];

export const obj = (v: unknown): Row =>
v && typeof v === "object" && !Array.isArray(v) ? v as Row : {};

export const fullName = (r: Row): string =>
`${str(r.prenom)} ${str(r.nom)}`.trim() || str(r.nom_complet) || str(r.libelle) || str(r.titre);

export const initials = (label: string): string =>
label.
split(/\s+/).
filter(Boolean).
slice(0, 2).
map((w) => w.charAt(0).toUpperCase()).
join("");

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
export const formatNumber = (v: unknown): string => {
  const n = num(v);
  return n === null ? "—" : nf.format(n);
};
export const formatMoney = (v: unknown): string => {
  const n = num(v);
  return n === null ? "—" : `${nf.format(n)} FCFA`;
};
export const formatPct = (v: unknown): string => {
  const n = num(v);
  return n === null ? "—" : `${nf.format(n)} %`;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DT_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

export function formatDate(v: unknown): string {
  const s = str(v);
  if (!s) return "—";
  const d = DATE_RE.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(v: unknown): string {
  const s = str(v);
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = (): string => toISODate(new Date());
export const shiftISO = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const WORDS: Record<string, string> = {
  prenom: "prénom",
  eleve: "élève",
  eleves: "élèves",
  annee: "année",
  annees: "années",
  periode: "période",
  periodes: "périodes",
  matiere: "matière",
  matieres: "matières",
  evaluation: "évaluation",
  echeance: "échéance",
  echeances: "échéances",
  categorie: "catégorie",
  telephone: "téléphone",
  reussite: "réussite",
  generale: "générale",
  general: "général",
  numero: "numéro",
  depense: "dépense",
  cree: "créé",
  creee: "créée",
  crees: "créés",
  creees: "créées",
  genere: "généré",
  generes: "générés",
  publie: "publié",
  publies: "publiés",
  publiee: "publiée",
  valide: "validé",
  specialite: "spécialité",
  capacite: "capacité",
  vehicule: "véhicule",
  arrets: "arrêts",
  entree: "entrée",
  etablissement: "établissement",
  sante: "santé",
  reference: "référence",
  serie: "série",
  series: "séries",
  etat: "état",
  medicament: "médicament",
  medecin: "médecin",
  temperature: "température",
  symptomes: "symptômes",
  administre: "administré",
  donne: "donné",
  donnee: "donnée",
  carriere: "carrière",
  reelles: "réelles",
  ecart: "écart",
  mediane: "médiane",
  fiabilite: "fiabilité",
  evolution: "évolution",
  precedente: "précédente",
  departs: "départs",
  arrivees: "arrivées",
  decision: "décision",
  echelle: "échelle",
  competences: "compétences",
  bareme: "barème",
  recalcule: "recalculé",
  fcfa: "(FCFA)",
  pct: "(%)",
  nb: "nombre",
  hebdo: "hebdomadaire",
  deja: "déjà",
  derniere: "dernière",
  verification: "vérification",
  securite: "sécurité",
  activite: "activité",
  recu: "reçu",
  reponse: "réponse",
  debut: "début",
  prevue: "prévue",
  cle: "clé",
  cles: "clés",
  modele: "modèle",
  equipements: "équipements",
  evenement: "événement",
  legende: "légende",
  reunion: "réunion",
  organisee: "organisée",
  convoque: "convoqué",
  signe: "signé",
  envoye: "envoyé",
  archivee: "archivée",
  declenchement: "déclenchement",
  scolarite: "scolarité",
  excedent: "excédent",
  affecte: "affecté",
  credite: "crédité",
  reduction: "réduction",
  identite: "identité",
  fantome: "fantôme",
  presents: "présents",
  role: "rôle",
  unite: "unité",
  cout: "coût",
  estime: "estimé",
  designation: "désignation",
  quantite: "quantité",
  approuve: "approuvé",
  recue: "reçue",
  reception: "réception",
  deces: "décès",
  mise: "mise",
  a: "à",
  est: "",
  url: "lien",
  b64: "",
  fixe: "fixe",
  ohada: "OHADA",
  edt: "emploi du temps",
  qr: "QR",
  id: ""
};

export function humanize(key: string): string {
  const parts = key.
  split("_").
  filter(Boolean).
  map((w) => w in WORDS ? WORDS[w] : w).
  filter(Boolean);
  const s = parts.join(" ").replace(/\s+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : key;
}

export const valueLabel = (v: string): string => VALUE_LABELS[v] ?? humanize(v);

export const isHiddenKey = (k: string): boolean =>
k === "id" ||
k.endsWith("_id") ||
k.endsWith("_ids") ||
k === "combinaison_hash" ||
k === "telecharger" ||
k === "hashed_password" ||
k === "password_hash";

export const isStatusKey = (k: string): boolean =>
/^(statut|etat|fiabilite|tendance|global_tendance|type_sanction|statut_.+|.+_statut|type_mouvement|sens|lien|categorie|type_salle|type_document|type_frais|mode|type_bareme|type_organisation_edt.*)$/.test(
  k
);

const OK = new Set([
"valide", "validee", "paye", "payee", "actif", "active", "publie", "rendu", "acceptee", "confirmee",
"honoree", "en_cours", "envoye", "positive", "hausse", "haute", "neuf", "bon", "inscrite", "terminee",
"approuvee", "commandee", "present", "diplome", "passage", "alimentation", "recue"]
);
const WARN = new Set([
"en_attente", "en_attente_validation", "a_venir", "du", "paye_partiel", "planifiee", "saisie_en_cours",
"test_planifie", "test_effectue", "liste_attente", "brouillon", "envoyee", "moyenne", "use", "retard",
"neutre", "endommage", "absent_justifie", "redoublement", "orientation"]
);
const BAD = new Set([
"rejete", "rejetee", "en_retard", "exclu", "refusee", "annulee", "annule", "abandon", "perdu",
"hors_service", "echec", "negative", "négative", "baisse", "faible", "absent", "absente", "vendu",
"exclusion_definitive", "exclusion_temporaire"]
);

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export function statusTone(v: string): Tone {
  if (OK.has(v)) return "success";
  if (WARN.has(v)) return "warning";
  if (BAD.has(v)) return "danger";
  return "info";
}

export function resolveUrl(u: string): string {
  if (!u) return "";
  if (/^(https?:|data:|blob:)/.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

export function formatValue(k: string, v: unknown): string {
  if (typeof v === "number") {
    if (/fcfa|montant|solde|valeur_acquisition|cout/.test(k)) return formatMoney(v);
    if (/_pct$|^taux|_rate$|percentile/.test(k)) return formatPct(v);
    return formatNumber(v);
  }
  const s = str(v);
  if (DATE_RE.test(s)) return formatDate(s);
  if (DT_RE.test(s)) return formatDateTime(s);
  return s;
}