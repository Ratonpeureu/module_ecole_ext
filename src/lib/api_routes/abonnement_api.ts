import { api ,buildUrl,ApiError,getToken } from '@/lib/api'
import { API_BASE } from '../api';


// ═══════════════════════════════════════════════════════════════════════
// ABONNEMENT — Formules forfait | par_employe
// Paliers d'employés et durées sont INDÉPENDANTS :
//   - forfait     : 1 prix fixe × durée (avec mois offerts sur 6 et 12)
//   - par_employe : palier (1/3/6/12 employés) × durée (1/3/6/12 mois)
// ═══════════════════════════════════════════════════════════════════════

export type FormuleAbo = "forfait" | "par_employe";
export type StatutAbo =
    | "trial"
    | "actif"
    | "expire"
    | "suspendu"
    | "introuvable";
export type MoisPack = 1 | 3 | 6 | 12;
export type PalierEmploye = 1 | 3 | 6 | 12;

// ── Forfait ────────────────────────────────────────────────────────
export interface PackForfait {
    mois: number; // durée affichée (1/3/6/12)
    mois_factures: number; // mois réellement facturés
    mois_offerts: number; // mois_affiche - mois_factures
    nb_employes: null; // toujours null = illimité
    total_fcfa: number;
    prix_mois_fcfa: number;
    label: string;
    populaire: boolean;
    detail?: string;
    description_ligne?: string;
}

// ── Par employé ────────────────────────────────────────────────────
export interface DureeOption {
    mois: number; // 1/3/6/12
    total_fcfa: number;
    prix_mois_fcfa: number;
    detail?: string;
    description_ligne?: string;
}

export interface PalierOption {
    nb_employes: PalierEmploye;
    label: string;
    populaire: boolean;
    warning_depassement: {
        actif: boolean;
        message: string | null;
    };
    durees: DureeOption[];
}

// ── Réponse /abonnement/tarif (authentifié) ────────────────────────
export interface TarifForfaitBlock {
    label: string;
    description: string;
    packs: PackForfait[];
}

export interface TarifParEmployeBlock {
    label: string;
    description: string;
    etape_1: string;
    etape_2: string;
    nb_employes_actifs: number;
    paliers: PalierOption[];
}

export interface TarifResponse {
    formule_active: FormuleAbo;
    nb_employes_actifs: number;
    nb_employes_autorises: number | null; // null = forfait illimité
    prix_forfait_fcfa: number;
    prix_par_employe_fcfa: number;
    formules: {
        forfait: TarifForfaitBlock;
        par_employe: TarifParEmployeBlock;
    };
}

// ── Réponse /abonnement/tarif/public (sans auth) ───────────────────
export interface TarifPublicPackForfait {
    mois: number;
    mois_factures: number;
    mois_offerts: number;
    total_fcfa: number;
    prix_mois_fcfa: number;
    label: string;
    populaire: boolean;
    detail?: string;
}

export interface TarifPublicDuree {
    mois: number;
    total_fcfa: number;
    detail?: string;
}

export interface TarifPublicPalier {
    nb_employes: PalierEmploye;
    label: string;
    populaire: boolean;
    durees: TarifPublicDuree[];
}

export interface TarifPublicResponse {
    prix_forfait_fcfa: number;
    prix_par_employe_fcfa: number;
    trial_jours: number;
    formules: {
        forfait: { packs: TarifPublicPackForfait[] };
        par_employe: { paliers: TarifPublicPalier[] };
    };
}

// ── Paiements & historique ─────────────────────────────────────────
export interface PaiementAbo {
    id: string;
    montant_fcfa: number;
    mois_couverts: number;
    formule: FormuleAbo;
    nb_employes: number | null;
    statut: "en_attente" | "confirme" | "rejete";
    reference_virement: string | null;
    preuve_url: string | null;
    periode_debut: string | null;
    periode_fin: string | null;
    note_entreprise: string | null;
    note_admin: string | null;
    confirme_le: string | null;
    created_at: string;
}

export interface HistoriqueFormuleEntry {
    ancienne: FormuleAbo;
    nouvelle: FormuleAbo;
    nb_employes: number | null;
    date: string;
}

// ── Statut complet (/abonnement/status) ────────────────────────────
export interface AbonnementStatus {
    id?: string;
    statut: StatutAbo;
    formule?: FormuleAbo;
    trial_start?: string | null;
    trial_end?: string | null;
    trial_jours?: number | null;
    trial_jours_restants?: number | null;
    date_prochaine_echeance?: string | null;
    jours_restants_abo?: number | null;
    mois_prepaye_restants?: number;
    nb_employes_actifs?: number;
    nb_employes_autorises?: number | null; // null = forfait illimité
    nb_employes_restants?: number | null;
    prix_forfait_fcfa?: number;
    prix_par_employe_fcfa?: number;
    dernier_montant_fcfa?: number;
    prochain_montant_estime_fcfa?: number;
    auto_renouvellement?: boolean;
    paiements?: PaiementAbo[];
    historique_formule?: HistoriqueFormuleEntry[];
}

// ── Validation / changement de formule ─────────────────────────────
export interface ValiderFormuleResult {
    ok: boolean;
    raison?: string;
    message?: string;
    nb_employes_actifs?: number;
    nb_employes_autorises?: number | null;
    employes_a_supprimer?: number;
}

export interface ChangerFormuleResult {
    message: string;
    formule: FormuleAbo;
    nb_employes_autorises?: number | null;
    prochain_montant_estime_fcfa?: number;
    note?: string;
}

// ── Soumission virement ────────────────────────────────────────────
export interface RibInfo {
    banque: string;
    titulaire: string;
    iban: string;
    swift: string;
    agence: string;
    devise: string;
    delai: string;
}

export interface SoumettreVirementResult {
    message: string;
    paiement_id: string;
    montant_fcfa: number;
    mois_couverts: number;
    formule: FormuleAbo;
    nb_employes: number | null;
    rib: RibInfo;
}

// ── PayPal ─────────────────────────────────────────────────────────
export interface CreerOrdrePaypalResult {
    ordre_id: string;
    approve_url: string;
    montant_eur: number;
    montant_fcfa: number;
    mois_couverts: number;
    formule: FormuleAbo;
    nb_employes: number; // 0 si forfait, palier si par_employe
    description: string;
}

export interface CapturerPaypalResult {
    message: string;
    mois_couverts: number;
    formule: FormuleAbo;
    nb_employes: number | null;
    montant_fcfa: number;
    nouvelle_echeance?: string;
}

// ═══════════════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════════════

export async function abonnementStatus(): Promise<AbonnementStatus> {
    return api("/abonnement/status", { rawJson: true });
}

export async function abonnementTarif(): Promise<TarifResponse> {
    return api("/abonnement/tarif", { rawJson: true });
}

export async function abonnementTarifPublic(): Promise<TarifPublicResponse> {
    return api("/abonnement/tarif/public", { auth: false, rawJson: true });
}

// ═══════════════════════════════════════════════════════════════════
// RIB / Coordonnées bancaires
// ═══════════════════════════════════════════════════════════════════

export async function abonnementGetRib(): Promise<RibInfo> {
    return api("/abonnement/rib", { rawJson: true });
}

export async function abonnementGetRibPublic(): Promise<RibInfo> {
    return api("/abonnement/rib/public", { auth: false, rawJson: true });
}

// ═══════════════════════════════════════════════════════════════════
// CHANGEMENT DE FORMULE
// `nb_employes` = palier (1/3/6/12) — REQUIS pour par_employe, ignoré pour forfait
// ═══════════════════════════════════════════════════════════════════

/**
 * Vérifie sans appliquer.
 * - formule = "forfait"     → nb_employes ignoré, toujours possible
 * - formule = "par_employe" → nb_employes requis (palier 1/3/6/12)
 *                             échoue si trop d'employés actifs pour ce palier
 */
export async function abonnementValiderFormule(
    formule: FormuleAbo,
    nb_employes?: PalierEmploye | number,
): Promise<ValiderFormuleResult> {
    return api("/abonnement/formule/valider", {
        method: "POST",
        body: { formule, nb_employes: nb_employes ?? null },
        rawJson: true,
    });
}

/**
 * Applique le changement (prise d'effet immédiate sur les limites d'employés).
 */
export async function abonnementChangerFormule(
    formule: FormuleAbo,
    nb_employes?: PalierEmploye | number,
): Promise<ChangerFormuleResult> {
    return api("/abonnement/formule/changer", {
        method: "POST",
        body: { formule, nb_employes: nb_employes ?? null },
        rawJson: true,
    });
}

// ═══════════════════════════════════════════════════════════════════
// VIREMENT MANUEL
// `mois` = durée (1/3/6/12), `nb_employes` = palier (requis si par_employe)
// ═══════════════════════════════════════════════════════════════════

export async function abonnementSoumettreVirement(payload: {
    mois: MoisPack | number;
    formule: FormuleAbo;
    nb_employes?: PalierEmploye | number | null; // requis si formule = par_employe
    reference_virement: string;
    note_entreprise?: string;
    preuve?: File | null;
}): Promise<SoumettreVirementResult> {
    const fd = new FormData();
    fd.append("mois", String(payload.mois));
    fd.append("formule", payload.formule);
    if (payload.formule === "par_employe" && payload.nb_employes != null) {
        fd.append("nb_employes", String(payload.nb_employes));
    }
    fd.append("reference_virement", payload.reference_virement);
    if (payload.note_entreprise)
        fd.append("note_entreprise", payload.note_entreprise);
    if (payload.preuve) fd.append("preuve", payload.preuve);

    return api("/abonnement/virement/soumettre", {
        method: "POST",
        formData: fd,
        rawJson: true,
    });
}

/** URL absolue d'une preuve (utilisable dans <a> ou <img>). */
export function abonnementPreuveUrl(filename: string): string {
    return `${API_BASE}/abonnement/virement/preuve/${encodeURIComponent(filename)}`;
}

/** Télécharge une preuve en Blob (auth incluse). */
export async function abonnementDownloadPreuve(
    filename: string,
): Promise<Blob> {
    const t = getToken();
    const headers: Record<string, string> = {};
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const res = await fetch(
        buildUrl(`/abonnement/virement/preuve/${encodeURIComponent(filename)}`),
        {
            headers,
            credentials: "include",
        },
    );
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }
    return res.blob();
}

// ═══════════════════════════════════════════════════════════════════
// PAYPAL
// `mois` = durée, `nb_employes` = palier (requis si par_employe)
// ═══════════════════════════════════════════════════════════════════

export async function abonnementPaypalCreerOrdre(payload: {
    mois: MoisPack | number;
    formule: FormuleAbo;
    nb_employes?: PalierEmploye | number | null;
}): Promise<CreerOrdrePaypalResult> {
    return api("/abonnement/paypal/creer-ordre", {
        method: "POST",
        body: {
            mois: payload.mois,
            formule: payload.formule,
            nb_employes:
                payload.formule === "par_employe"
                    ? (payload.nb_employes ?? null)
                    : null,
        },
        rawJson: true,
    });
}

export async function abonnementPaypalCapturer(
    ordreId: string,
): Promise<CapturerPaypalResult> {
    return api(`/abonnement/paypal/capturer/${encodeURIComponent(ordreId)}`, {
        method: "POST",
        rawJson: true,
    });
}
