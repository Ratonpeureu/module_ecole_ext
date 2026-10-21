// lib/api.ts — version corrigée (credentials include + alignement backend)
export const API_BASE = "https://rhmanager.site";

const TOKEN_KEY = "rh_token";
const ENT_KEY = "rh_entreprise";
export const SYSTEM_INBOX_ADDR = "system@internal.rh";

// ── Constantes existantes ─────────────────────────────────────
export const TOKEN_EXPIRED_EVENT = "mp-token-expired";

// Endpoints qui DOIVENT pouvoir renvoyer 401 sans déclencher de déconnexion
// (sinon boucle infinie sur la page de login)
const AUTH_WHITELIST = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/forgot-password/via-secret-phrase",
    "/auth/forgot-password/via-recovery-key",
    "/auth/recovery-keys/regenerate",
    "/auth/email/request-code",   // ← nouveau
];

let _redirecting = false;

function isAuthWhitelisted(url: string) {
    return AUTH_WHITELIST.some((p) => url.includes(p));
}

// ✅ Vérifier qu'on n'est PAS déjà sur /login avant de rediriger
function triggerTokenExpired() {
    if (_redirecting) return;

    // Si on est déjà sur login, ne rien faire
    if (window.location.pathname.startsWith("/login")) return;

    _redirecting = true;

    try {
        logout();
    } catch {}

    window.dispatchEvent(
        new CustomEvent(TOKEN_EXPIRED_EVENT, {
            detail: { reason: "token_expired" },
        }),
    );

    const currentPath = window.location.pathname + window.location.search;
    const cleanPath = currentPath.replace(/^\/ecole/, '') || '/';
    window.location.replace(
    `/ecole/login?_redirect=${encodeURIComponent(cleanPath)}&reason=expired`,
    );

    // Reset après navigation (pour les SPAs qui ne rechargent pas)
    setTimeout(() => {
        _redirecting = false;
    }, 3000);
}

// ── GESTION DE LA PHRASE SECRÈTE (conservé pour d'autres routes si besoin) ──
let _secretPhrase: string | null = null;
let _pendingSecretRequests: Array<{
    resolve: (secret: string) => void;
    reject: (err: Error) => void;
}> = [];

export function setSecretPhrase(phrase: string | null) {
    _secretPhrase = phrase;
    const copy = [..._pendingSecretRequests];
    _pendingSecretRequests = [];
    if (phrase) {
        copy.forEach((r) => r.resolve(phrase));
    } else {
        copy.forEach((r) => r.reject(new Error("Action annulée")));
    }
}
export async function authVerifySecret(secretPhrase: string) {
    return api("/auth/verify-secret", { method: "POST", secretPhrase });
}

export function clearSecretPhrase() {
    _secretPhrase = null;
}

/**
 * Demande la phrase secrète via le SecretPhraseGuard.
 * Retourne une promesse résolue avec la phrase (ou rejetée si annulation).
 * À appeler AVANT toute opération sensible.
 */
export function requestSecretPhrase(): Promise<string> {
    return new Promise((resolve, reject) => {
        _pendingSecretRequests.push({ resolve, reject });
        window.dispatchEvent(new Event("secret-phrase-required"));
    });
}

// ── helpers de stockage ─────────────────────────────────────────────
export function getToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(t: string | null) {
    try {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {}
}

export function getEntreprise(): {
    id: string;
    email: string;
    nom?: string;
} | null {
    try {
        const raw = localStorage.getItem(ENT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setEntreprise(
    e: { id: string; email: string; nom?: string; rhEmail?: string } | null,
) {
    try {
        if (e) localStorage.setItem(ENT_KEY, JSON.stringify(e));
        else localStorage.removeItem(ENT_KEY);
    } catch {}
}

export function logout() {
    setToken(null);
    setEntreprise(null);
}

// ── Types ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
    status: number;
    data: any;
    constructor(message: string, status: number, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

interface TaskResponse {
    task_id?: string;
    message?: string;
    state?: string;
    status?: string;
    result?: any;
    error?: string;
    info?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  formData?: FormData;
  query?: Record<string, any>;
  auth?: boolean;
  rawJson?: boolean;
  rawResponse?: boolean;
  taskResultPath?: string;
  secretPhrase?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ── Construction d'URL ────────────────────────────────────────────────
export function buildUrl(path: string, query?: Record<string, any>): string {
    // Si l'API_BASE est vide, on prend l'origine de la page courante
    const base = API_BASE || window.location.origin;
    // Construction robuste : même avec des chemins relatifs, ça marche
    const url = new URL(path, base);
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") return;
            url.searchParams.set(k, String(v));
        });
    }
    return url.toString();
}

async function rawFetch(
    path: string,
    opts: RequestOptions = {},
    _isRetry = false,
): Promise<any> {
    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    const useAuth = opts.auth !== false;
    if (useAuth) {
        const t = getToken();
        if (t) headers["Authorization"] = `Bearer ${t}`;
    }

    if (opts.secretPhrase) {
        headers["X-Secret-Phrase"] = opts.secretPhrase;
    }

    let body: any = undefined;
    if (opts.formData) {
        body = opts.formData;
    } else if (opts.body !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(opts.body);
    }

    const res = await fetch(buildUrl(path, opts.query), {
        method: opts.method ?? (body ? "POST" : "GET"),
        headers,
        body,
        credentials: "include",
    });

    // ── Abonnement expiré / requis ─────────────────────────────────
    if (
        res.status === 402 &&
        !path.includes("/abonnement") &&
        !path.includes("/auth")
    ) {
        let detail: { code?: string; statut?: string } = {};
        try {
            const data = await res.clone().json();
            detail = typeof data?.detail === "object" ? data.detail : {};
        } catch {}
        if (
            detail?.code === "abonnement_requis" &&
            !window.location.pathname.startsWith("/app/abonnement")
        ) {
            window.location.replace("/app/abonnement/expire");
        }
        throw new ApiError(
            typeof detail === "object" && "message" in detail
                ? String((detail as { message?: string }).message)
                : "Abonnement requis",
            402,
            detail,
        );
    }

    // ── Gestion intelligente du 403 ────────────────────────────────
    if (res.status === 403 && !_isRetry) {
        let errorMessage = "";
        let code = "";
        try {
            const data = await res.clone().json();
            errorMessage =
                typeof data?.detail === "string"
                    ? data.detail
                    : (data?.detail?.message ?? "");
            code = data?.detail?.code ?? "";
        } catch {}

        // a) Phrase secrète → Guard puis rejeu de la requête
        if (
            errorMessage.includes("secrète") ||
            errorMessage.includes("session expirée")
        ) {
            const secret = await requestSecretPhrase();
            await authVerifySecret(secret);
            return rawFetch(path, opts, true);
        }

        // b) Tout autre 403 → erreur remontée à l'appelant, sans déconnexion
        throw new ApiError(errorMessage || "Accès refusé", 403, null);
    }
    // ── Gestion du 401 (token expiré / invalide) ───────────────────
    if (res.status === 401 && !_isRetry && !isAuthWhitelisted(path)) {
        triggerTokenExpired();
        // On lève l'erreur quand même pour stopper les composants en attente
        throw new ApiError("Session expirée", 401, null);
    }
    if (opts.rawResponse) {
        if (!res.ok) {
            const data = await res.json().catch(() => null);

            throw new ApiError(
            data?.detail || data?.message || `Erreur ${res.status}`,
            res.status,
            data,
            );
        }

        return res;
        }

    // Suite normale (traitement JSON / erreur)
    let data: any;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        data = await res.json().catch(() => null);
    } else if (ct.includes("text/html")) {
        // Le backend a renvoyé du HTML → c'est presque sûrement un fallback SPA
        throw new ApiError(
            `Route introuvable côté serveur (HTML reçu) : ${path}`,
            res.status,
            null,
        );
    } else {
        data = await res.text().catch(() => null);
    }

    if (!res.ok) {
        const msg =
            data?.detail ||
            data?.message ||
            data?.error ||
            `Erreur ${res.status}`;
        throw new ApiError(
            typeof msg === "string" ? msg : JSON.stringify(msg),
            res.status,
            data,
        );
    }

    return data;
}

// ── Polling d'une tâche Celery ───────────────────────────────────────
async function pollTask(
    taskId: string,
    opts: {
        timeoutMs?: number;
        intervalMs?: number;
        taskResultPath?: string;
    } = {},
): Promise<any> {
    const timeout = opts.timeoutMs ?? 60000;
    const interval = opts.intervalMs ?? 800;
    const basePath = opts.taskResultPath ?? "/auth/task-result";
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const data: TaskResponse = await rawFetch(`${basePath}/${taskId}`);
        const rawState = (data.status || data.state || "")
            .toString()
            .toUpperCase();
        if (rawState === "SUCCESS") return data.result;
        if (rawState === "FAILURE") {
            const errMsg =
                data.error ||
                (typeof data.result === "string" ? data.result : null) ||
                "La tâche a échoué";
            throw new ApiError(errMsg, 500, data);
        }
        await new Promise((r) => setTimeout(r, interval));
    }
    throw new ApiError("Délai dépassé pour la tâche", 504);
}

export function downloadBase64(
    b64: string,
    filename: string,
    mime = "image/png",
) {
    const clean = b64.startsWith("data:") ? b64.split(",")[1] : b64;
    const bin = atob(clean);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Fonction api principale ──────────────────────────────────────────
export async function api(
    path: string,
    opts: RequestOptions = {},
): Promise<any> {
    const data = await rawFetch(path, opts);
    if (opts.rawJson) return data;
    if (data && typeof data === "object" && typeof data.task_id === "string") {
        return pollTask(data.task_id, { taskResultPath: opts.taskResultPath });
    }
    return data;
}

export const apiRaw = rawFetch;

// ═══════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════
export async function authRegister(payload: {
    nom: string;
    email_contact: string;
    password: string;
    secret_phrase: string;
    verification_token: string;   // ← nouveau, obligatoire
    secteur?: string;
    telephone?: string;
    adresse?: string;
    site_web?: string;
    description?: string;
    siege_lat?: number | null;
    siege_lon?: number | null;
}) {
    return api("/auth/register", {
        method: "POST",
        body: payload,
        auth: false,
    });
}
export async function authLogin(payload: { email: string; password: string }) {
    const result = await api("/auth/login", {
        method: "POST",
        body: payload,
        auth: false,
    });
    const token = result?.access_token || result?.token;
    if (token) setToken(token);
    setEntreprise({
        id: result.entreprise_id,
        email: payload.email,
        nom: result.nom,
        rhEmail: result.rh_email || undefined,
    });
    return result;
}

export async function authGetProfile(_entrepriseId?: string) {
    return api("/auth/profile/me");
}



// ═══════════════════════════════════════════════════════════════════════
// DOCUMENTS RH (phrase secrète retirée → plus d'argument secretPhrase)
// ═══════════════════════════════════════════════════════════════════════
export interface DocumentRH {
    id: string;
    entreprise_id: string;
    name: string;
    type: "facture" | "cv" | "paye" | "document" | "formulaire" | "rapport";
    category: string;
    date_created: string;
    date_modified: string;
    size: number;
    content?: string | null;
    image_url?: string | null;
    tags: string[];
    status: "draft" | "validated" | "archived";
    employee?: string | null;
    metadata?: Record<string, any>;
}

export interface FormulaireRH {
    id: string;
    entreprise_id: string;
    name: string;
    description: string;
    form_type?: FormType;
    is_anonymous?: boolean;
    fields: Array<{
        id: string;
        type: string;
        label: string;
        required: boolean;
        placeholder?: string;
        options?: string[];
        min?: number;
        max?: number;
    }>;
    responses: Array<Record<string, any>>;
    date_created: string;
}

export interface ReportRH {
    id: string;
    entreprise_id: string;
    name: string;
    type: "monthly" | "quarterly" | "annual" | "custom";
    date_range: { start: string; end: string };
    data: Array<{
        type: string;
        label: string;
        count: number;
        validated: number;
        draft: number;
    }>;
    charts: Array<{ type: string; title: string; dataKey: string }>;
    generated_at: string;
}

// Sans secretPhrase
export async function listDocuments(): Promise<DocumentRH[]> {
    return api("/api/documents/");
}

export async function createDocument(
    data: Partial<DocumentRH>,
): Promise<DocumentRH> {
    return api("/api/documents/", { method: "POST", body: data });
}

export async function updateDocument(
    id: string,
    updates: Partial<DocumentRH>,
): Promise<DocumentRH> {
    return api(`/api/documents/${id}`, { method: "PUT", body: updates });
}

export async function deleteDocument(
    id: string,
): Promise<{ deleted: boolean }> {
    return api(`/api/documents/${id}`, { method: "DELETE" });
}

export async function uploadDocument(file: File): Promise<DocumentRH> {
    const fd = new FormData();
    fd.append("file", file);
    return api("/api/documents/upload", { method: "POST", formData: fd });
}

export async function exportDocumentsExcel(): Promise<{
    file_b64: string;
    filename: string;
    mime: string;
}> {
    return api("/api/documents/export/excel");
}

export async function exportDocumentsCSV(): Promise<{
    file_b64: string;
    filename: string;
    mime: string;
}> {
    return api("/api/documents/export/csv");
}

export async function listForms(): Promise<FormulaireRH[]> {
    return api("/api/documents/forms");
}

export async function createForm(
    data: Partial<FormulaireRH>,
): Promise<FormulaireRH> {
    return api("/api/documents/forms", { method: "POST", body: data });
}

export async function addFormResponse(
    formId: string,
    response: Record<string, any>,
): Promise<FormulaireRH> {
    return api(`/api/documents/forms/${formId}/responses`, {
        method: "POST",
        body: response,
    });
}

export async function listReports(): Promise<ReportRH[]> {
    return api("/api/documents/reports");
}

export async function generateReport(data: {
    name: string;
    type?: string;
    start_date: string;
    end_date: string;
}): Promise<ReportRH> {
    return api("/api/documents/reports", { method: "POST", body: data });
}

export async function deleteReport(id: string): Promise<{ deleted: boolean }> {
    return api(`/api/documents/reports/${id}`, { method: "DELETE" });
}


// ═══════════════════════════════════════════════════════════════════════
// AUTH (suite) – Mot de passe oublié / clés de récupération
// ═══════════════════════════════════════════════════════════════════════

export async function forgotPasswordCheck(email: string) {
    return api("/auth/forgot-password", {
        method: "POST",
        body: { email },
        auth: false,
        rawJson: true,
    });
}

export async function resetPasswordViaSecretPhrase(
    email: string,
    secretPhrase: string,
    newPassword: string,
) {
    const headers: Record<string, string> = {
        "X-Secret-Phrase": secretPhrase,
        "Content-Type": "application/json",
    };
    const res = await fetch(
        buildUrl("/auth/forgot-password/via-secret-phrase"),
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                email,
                secret_phrase: secretPhrase,
                new_password: newPassword,
            }),
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
    return res.json();
}

export async function resetPasswordViaRecoveryKey(
    email: string,
    recoveryKey: string,
    newPassword: string,
) {
    const headers: Record<string, string> = {
        "X-Recovery-Key": recoveryKey,
        "Content-Type": "application/json",
    };
    const res = await fetch(
        buildUrl("/auth/forgot-password/via-recovery-key"),
        {
            method: "POST",
            headers,
            body: JSON.stringify({ email, new_password: newPassword }),
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
    return res.json();
}

export async function regenerateRecoveryKeys(
    email: string,
    secretPhrase: string,
) {
    const headers: Record<string, string> = {
        "X-Secret-Phrase": secretPhrase,
        "Content-Type": "application/json",
    };
    const res = await fetch(buildUrl("/auth/recovery-keys/regenerate"), {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
        credentials: "include",
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENTS / FORMULAIRES – Envoi & réponses
// ═══════════════════════════════════════════════════════════════════════

/** Envoyer un formulaire à un employé (pièce jointe JSON) */
export async function sendFormToEmployee(
    formId: string,
    employeEmail: string,
): Promise<{ message: string; email_id: string }> {
    return api(`/api/documents/forms/${formId}/send`, {
        method: "POST",
        body: { employe_email: employeEmail },
        rawJson: true,
    });
}

/** Envoyer un lien anonyme pour le formulaire */
export async function sendAnonymousFormLink(
    formId: string,
    employeEmail: string,
): Promise<{ message: string; lien: string }> {
    return api(`/api/documents/forms/${formId}/send-anonymous`, {
        method: "POST",
        body: { employe_email: employeEmail },
        rawJson: true,
    });
}

/** Récupérer les réponses d’un formulaire (RH) */
export async function getFormResponses(
    formId: string,
): Promise<Array<Record<string, any>>> {
    return api(`/api/documents/forms/${formId}/responses`, { rawJson: true });
}

/** Analyser un fichier CSV/Excel et obtenir le résultat JSON (avec graphiques) */
export async function analyzeFile(file: File): Promise<any> {
    const fd = new FormData();
    fd.append("file", file);
    // api() gère automatiquement le polling du task_id renvoyé par la route /analyze
    return api("/api/documents/analyze", {
        method: "POST",
        formData: fd,
    });
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENTS – URL du fichier (helper)
// ═══════════════════════════════════════════════════════════════════════

/** Construit l’URL publique d’un fichier uploadé (pour <img>, <iframe>, etc.) */
export function getDocumentFileUrl(
    entrepriseId: string,
    filename: string,
): string {
    return `${API_BASE}/api/documents/file/${encodeURIComponent(entrepriseId)}/${encodeURIComponent(filename)}`;
}

// ─── Templates de formulaires / sondages ─────────────────────────────
export type FormTemplateKey = "mood" | "scale" | "nps" | "classic";
export type FormType = "mood" | "scale" | "mixed" | "classic";

export interface FormTemplate {
    key: FormTemplateKey;
    name: string;
    form_type: FormType;
    description: string;
    fields_count: number;
    fields: Array<Record<string, any>>;
    is_anonymous: boolean;
}

// ─── Rapport de formulaire (sondage) ─────────────────────────────────
export interface FormFieldReport {
    field_id: string;
    field_type:
        | "mood"
        | "scale"
        | "choice"
        | "radio"
        | "checkbox"
        | "select"
        | "text"
        | string;
    label: string;
    total_answers: number;
    score_moyen?: number | null;
    moyenne?: number | null;
    mediane?: number | null;
    mode?: number | null;
    min?: number;
    max?: number;
    score_normalized?: number | null;
    satisfaction_rate?: number | null;
    positive_count?: number;
    negative_count?: number;
    tendance?: "positive" | "neutre" | "négative";
    filled_rate?: number;
    avg_length?: number;
    sample?: string[];
    distribution?: Array<{
        label: string;
        value: number;
        percent: number;
        score?: number;
        color?: string;
    }>;
    charts?: Array<{
        type: "bar" | "pie" | "gauge" | string;
        title: string;
        data?: any;
        value?: number;
        min?: number;
        max?: number;
        thresholds?: Array<{ at: number; color: string }>;
    }>;
}

export interface FormReport {
    form_id: string;
    form_name: string;
    form_type: FormType;
    description: string;
    generated_at: string;
    total_responses: number;
    is_anonymous: boolean;
    global_score: number | null;
    global_tendance: "positive" | "neutre" | "négative";
    fields: FormFieldReport[];
    summary_table: Array<{
        question: string;
        type: string;
        reponses: number;
        score?: number | null;
        satisfaction?: number | null;
        tendance: string;
    }>;
}

// ─── Templates de formulaires ───────────────────────────────────────
export async function listFormTemplates(): Promise<FormTemplate[]> {
    return api("/api/documents/forms/templates", { rawJson: true });
}

export async function createFormFromTemplate(payload: {
    template_key: FormTemplateKey;
    name?: string;
    description?: string;
    extra_fields?: Array<Record<string, any>>;
}): Promise<FormulaireRH> {
    return api("/api/documents/forms/from-template", {
        method: "POST",
        body: payload,
    });
}

// ─── Rapport d'un formulaire / sondage ───────────────────────────────
export async function getFormReport(formId: string): Promise<FormReport> {
    // La route renvoie un task_id → api() poll automatiquement
    return api(`/api/documents/forms/${formId}/report`);
}

// EXCEL REPORTS (fichiers Excel/CSV importés + persistés)
// ═══════════════════════════════════════════════════════════════════════

export interface ExcelAnalysis {
    columns: Record<string, string>;
    numeric_columns: string[];
    correlation_matrix: number[][];
    best_pair: {
        x: string;
        y: string;
        correlation: number;
        points: { x: number; y: number }[];
        trendline: { x: number; y: number }[];
    } | null;
    all_pairs: {
        x: string;
        y: string;
        correlation: number;
        points: { x: number; y: number }[];
    }[];
}

export interface ExcelReportSummary {
    id: string;
    name: string;
    filename: string;
    total_rows: number;
    headers: string[];
    created_at: string;
    analysis_summary: {
        numeric_columns: string[];
        best_pair: ExcelAnalysis["best_pair"];
    };
}

export interface ExcelReportMeta extends ExcelReportSummary {
    analysis: ExcelAnalysis;
}

export interface ExcelRowsPage {
    rows: Record<string, any>[];
    offset: number;
    limit: number;
    total: number; // total après filtre serveur
    total_unfiltered: number; // total réel du fichier
}

export interface ExcelReportFull extends ExcelReportSummary {
    rows: Record<string, any>[];
    analysis: ExcelAnalysis;
}

export async function listExcelReports(): Promise<ExcelReportSummary[]> {
    return api("/api/documents/excel-reports", { rawJson: true });
}

export async function getExcelReportById(id: string): Promise<ExcelReportMeta> {
    return api(`/api/documents/excel-reports/${id}`, { rawJson: true });
}

export async function createExcelReport(
    file: File,
    name?: string,
): Promise<ExcelReportFull> {
    const fd = new FormData();
    fd.append("file", file);
    if (name) fd.append("name", name);
    return api("/api/documents/excel-reports", {
        method: "POST",
        formData: fd,
        rawJson: true,
    });
}

export async function deleteExcelReport(
    id: string,
): Promise<{ deleted: boolean }> {
    return api(`/api/documents/excel-reports/${id}`, {
        method: "DELETE",
        rawJson: true,
    });
}

export function getExcelReportDownloadUrl(id: string): string {
    return `${API_BASE}/api/documents/excel-reports/${encodeURIComponent(id)}/download`;
}

export async function getExcelReportRows(
    id: string,
    opts: {
        offset?: number;
        limit?: number;
        search?: string;
        sort_col?: string;
        sort_dir?: "asc" | "desc";
    } = {},
): Promise<ExcelRowsPage> {
    return api(`/api/documents/excel-reports/${id}/rows`, {
        query: {
            offset: opts.offset ?? 0,
            limit: opts.limit ?? 50,
            search: opts.search || undefined,
            sort_col: opts.sort_col || undefined,
            sort_dir: opts.sort_dir || undefined,
        },
        rawJson: true,
    });
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENTS – Téléchargement / Aperçu / Mise à jour contenu & métadonnées
// ═══════════════════════════════════════════════════════════════════════

/**
 * Télécharge le fichier déchiffré d'un document (force le download navigateur).
 * Renvoie le Blob — utilisez `triggerBlobDownload` pour déclencher le téléchargement.
 */
export async function downloadDocument(
    docId: string,
): Promise<{ blob: Blob; filename: string }> {
    const t = getToken();
    const headers: Record<string, string> = {};
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const res = await fetch(buildUrl(`/api/documents/${docId}/download`), {
        headers,
        credentials: "include",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }

    // Extraire le filename depuis Content-Disposition
    const cd = res.headers.get("content-disposition") || "";
    const match = cd.match(/filename="?([^"]+)"?/i);
    const filename = match ? match[1] : `document-${docId}`;

    return { blob: await res.blob(), filename };
}

/**
 * URL d'aperçu inline (PDF, image, texte). Utilisable dans <iframe src> ou <img src>.
 * Note: le token est dans le cookie/Authorization — si vous l'utilisez dans une <iframe>,
 * préférez `fetchDocumentPreview` ci-dessous qui renvoie un objectURL authentifié.
 */
export function getDocumentPreviewUrl(docId: string): string {
    return `${API_BASE}/api/documents/${encodeURIComponent(docId)}/preview`;
}

/**
 * Récupère le fichier en preview et renvoie un objectURL utilisable dans
 * <iframe>, <img>, <embed>. Pensez à `URL.revokeObjectURL` quand vous n'en avez plus besoin.
 */
export async function fetchDocumentPreview(
    docId: string,
): Promise<{ url: string; mimeType: string; filename: string }> {
    const t = getToken();
    if (!t) throw new ApiError("Non authentifié", 401);

    const res = await fetch(buildUrl(`/api/documents/${docId}/preview`), {
        method: "GET",
        headers: { Authorization: `Bearer ${t}` },
        credentials: "include",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }

    const cd = res.headers.get("content-disposition") || "";
    const match = cd.match(/filename="?([^"]+)"?/i);
    const filename = match ? match[1] : `document-${docId}`;
    const mimeType =
        res.headers.get("content-type")?.split(";")[0].trim() ||
        "application/octet-stream";

    const blob = await res.blob();
    const url = URL.createObjectURL(blob); // ← blob: URL, utilisable par <embed> sans auth
    return { url, mimeType, filename };
}

/**
 * Remplace le contenu binaire d'un document existant (rechiffré côté serveur).
 */
export async function updateDocumentContent(
    docId: string,
    file: File,
): Promise<{ message: string; id: string }> {
    const fd = new FormData();
    fd.append("file", file);

    const t = getToken();
    const headers: Record<string, string> = {};
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const res = await fetch(buildUrl(`/api/documents/${docId}/content`), {
        method: "PUT",
        headers,
        body: fd,
        credentials: "include",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }
    return res.json();
}

/**
 * Met à jour uniquement les métadonnées d'un document (pas le fichier).
 * Champs autorisés côté backend : category, tags, status, employee, type, meta_data, name.
 */
export async function updateDocumentMetadata(
    docId: string,
    updates: Partial<{
        name: string;
        category: string;
        tags: string[];
        status: "draft" | "validated" | "archived";
        employee: string;
        type: DocumentRH["type"];
        meta_data: Record<string, any>;
        content: string; // ← AJOUT
    }>,
): Promise<{ message: string; id: string }> {
    return api(`/api/documents/${docId}/metadata`, {
        method: "PATCH",
        body: updates,
        rawJson: true,
    });
}

/** Déclenche le téléchargement d'un Blob côté navigateur. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Update form (synchrone, pas de Celery)
export async function updateForm(
    formId: string,
    updates: Partial<{
        name: string;
        description: string;
        fields: any[];
        form_type: FormType;
        is_anonymous: boolean;
    }>,
): Promise<FormulaireRH> {
    return api(`/api/documents/forms/${formId}`, {
        method: "PUT",
        body: updates,
        rawJson: true,
    });
}

// Delete form
export async function deleteForm(
    formId: string,
): Promise<{ deleted: boolean }> {
    return api(`/api/documents/forms/${formId}`, {
        method: "DELETE",
        rawJson: true,
    });
}

export async function updateExcelReport(
    id: string,
    file: File,
    name?: string,
): Promise<ExcelReportMeta> {
    const fd = new FormData();
    fd.append("file", file);
    if (name) fd.append("name", name);

    return api(`/api/documents/excel-reports/${id}`, {
        method: "PUT",
        formData: fd,
        rawJson: true,
    });
}

export async function sendFormToEmployees(
    formId: string,
    employeIds: string[],
): Promise<{
    message: string;
    results: Array<{ status: "success" | "error"; [k: string]: any }>;
}> {
    return api(`/api/documents/forms/${formId}/send`, {
        method: "POST",
        body: { employe_ids: employeIds },
        rawJson: true,
    });
}

// ═══════════════════════════════════════════════════════════════════════
// PAIE — Règles
// ═══════════════════════════════════════════════════════════════════════






// ═══════════════════════════════════════════════════════════════════════
// LEGAL — Téléchargement du fichier Excel d'exemple (planning employés)
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/legal/download/employes-test — fichier Excel d'exemple (Blob) */
export async function downloadEmployesTest(): Promise<{
    blob: Blob;
    filename: string;
}> {
    const t = getToken();
    const headers: Record<string, string> = {};
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const res = await fetch(buildUrl("/api/legal/download/employes-test"), {
        headers,
        credentials: "include",
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(
            data.detail || data.message || `Erreur ${res.status}`,
            res.status,
            data,
        );
    }
    const cd = res.headers.get("content-disposition") || "";
    const match = cd.match(/filename="?([^"]+)"?/i);
    const filename = match ? match[1] : "employes_test_rh_manager.xlsx";
    return { blob: await res.blob(), filename };
}




async function pollTaskDoc(
  taskId: string,
  opts: {
    timeoutMs?: number;
    intervalMs?: number;
    taskResultPath?: string;
  } = {},
): Promise<any> {
  const timeout = opts.timeoutMs ?? 60000;
  const interval = opts.intervalMs ?? 800;
  const basePath = opts.taskResultPath ?? "/auth/task-result";
  const start = Date.now();

  while (Date.now() - start < timeout) {
    let data: TaskResponse;
    try {
        data = await rawFetch(`${basePath}/${taskId}`);
    } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 410)) {
            throw new ApiError("Tâche introuvable ou expirée", e.status);
        }
        throw e;
    }

    // Le backend peut renvoyer `null` (ou un objet sans état) tant que la
    // tâche est en cours (état Celery "STARTED" non géré par la route, etc.).
    // Dans ce cas on considère la tâche comme toujours en attente et on
    // continue le polling — la source de vérité reste le backend.
    if (data && typeof data === "object") {
      const rawState = (data.status || data.state || "")
        .toString()
        .toUpperCase();

      if (rawState === "SUCCESS") return data.result;

      if (rawState === "FAILURE") {
        const errMsg =
          data.error ||
          (typeof data.result === "string" ? data.result : null) ||
          "La tâche a échoué";
        throw new ApiError(errMsg, 500, data);
      }
      // Tout autre état (PENDING, STARTED, etc.) → on continue d'attendre.
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  throw new ApiError("Délai dépassé pour la tâche", 504);
}

export type FormatDocumentGenere = "docx" | "xlsx";
export type DocumentEditMode = "simple" | "structure";

// Le contenu exact de `result` est produit par les tâches Celery côté backend
// (document_scan_task / document_edit_ia_task) et n'est pas contractualisé ici.
// On le laisse donc volontairement libre pour ne rien supposer.
export type ScanDocumentResult = Record<string, unknown>;
export type DocumentEditIAResult = Record<string, unknown>;

// ── Path du polling partagé (scan + edit-ia) ─────────────────────────────
const SCAN_TASK_RESULT_PATH = "/api/documents/scan/task-result";

/**
 * POST /api/documents/scan
 * Lance le scan OCR + IA d'une IMAGE (JPEG, PNG, .webp — max 10 Mo côté backend).
 * Retourne un task_id, puis on poll /scan/task-result/{task_id}.
 */
export async function documentScan(file: File): Promise<ScanDocumentResult> {
  const fd = new FormData();
  fd.append("file", file);

  // rawFetch renvoie { task_id, message } ; on poll ensuite la tâche.
  const data = await rawFetch("/api/documents/scan", {
    method: "POST",
    formData: fd,
  });

  if (data && typeof data.task_id === "string") {
    return (await pollTaskDoc(data.task_id, {
      taskResultPath: SCAN_TASK_RESULT_PATH,
    })) as ScanDocumentResult;
  }

  return data as ScanDocumentResult;
}

/**
 * GET /api/documents/scan/task-result/{task_id}
 * Lecture brute de l'état d'une tâche (sans polling).
 * Le backend renvoie { state, result?, error? }.
 */
export async function documentScanTaskResult(taskId: string): Promise<{
  state: string;
  result?: ScanDocumentResult;
  error?: string;
}> {
  return api(`/api/documents/scan/task-result/${taskId}`, { rawJson: true });
}


export interface DocumentTexteEditable {
  titre?: string;
  texte?: string;
  [key: string]: unknown;
}

export interface DocumentApercu {
  apercu_b64: string;
}

/**
 * GET /api/documents/{doc_id}/texte
 * Lit un document DOCX sous forme de texte éditable.
 */
export async function getDocumentTexte(
  docId: string,
): Promise<DocumentTexteEditable> {
  return api(`/api/documents/${encodeURIComponent(docId)}/texte`, {
    rawJson: true,
  });
}

/**
 * PUT /api/documents/{doc_id}/texte
 * Sauvegarde le texte et régénère le DOCX côté backend.
 */
export async function updateDocumentTexte(
  docId: string,
  payload: {
    titre?: string;
    texte: string;
  },
): Promise<{ message: string; id: string }> {
  return api(`/api/documents/${encodeURIComponent(docId)}/texte`, {
    method: "PUT",
    body: payload,
    rawJson: true,
  });
}

/**
 * GET /api/documents/{doc_id}/apercu
 * Retourne l'aperçu PNG de la première page en base64.
 */
export async function getDocumentApercu(
  docId: string,
): Promise<DocumentApercu> {
  return api(`/api/documents/${encodeURIComponent(docId)}/apercu`, {
    rawJson: true,
  });
}
/**
 * POST /api/documents/scan/edit-ia
 * Applique une instruction IA sur le texte simple (mode="simple") ou la
 * structure markdown (mode="structure"). Retourne un task_id ; le polling
 * passe par le même /scan/task-result/{task_id}.
 */
export async function documentEditIA(payload: {
  mode: DocumentEditMode;
  contenu_actuel: string;
  instruction: string;
  titre?: string;
  format_recommande?: FormatDocumentGenere;
}): Promise<DocumentEditIAResult> {
  return api("/api/documents/scan/edit-ia", {
    method: "POST",
    body: {
      mode: payload.mode,
      contenu_actuel: payload.contenu_actuel,
      instruction: payload.instruction,
      titre: payload.titre ?? "Document",
      format_recommande: payload.format_recommande ?? "docx",
    },
    // api() détecte le task_id de la réponse et poll automatiquement.
    taskResultPath: SCAN_TASK_RESULT_PATH,
  });
}

// ── Validation finale → création du DocumentRH ───────────────────────────
// Correspond exactement à ConfirmerScanDocumentBody côté backend.
export interface ConfirmerScanDocumentPayload {
  metadonnees: Record<string, any>;
  fichier_genere_b64?: string | null;
  fichier_genere_ext?: FormatDocumentGenere | null;
  fichier_genere_mime?: string | null;
  texte_integral?: string | null;
  structure_markdown?: string | null;
}

export interface ConfirmerScanDocumentResult {
  ok: boolean;
  document_id: string;
  type_fichier: FormatDocumentGenere;
}

/** POST /api/documents/scan/confirmer */
export async function documentScanConfirmer(
  payload: ConfirmerScanDocumentPayload,
): Promise<ConfirmerScanDocumentResult> {
  return api("/api/documents/scan/confirmer", {
    method: "POST",
    body: payload,
    rawJson: true,
  });
}

// ── Récupération des fichiers générés (docx / pdf) ───────────────────────

/**
 * GET /api/documents/scan/fichier/{fichier_id}
 * Télécharge le fichier généré (docx) — le backend renvoie le binaire en
 * pièce jointe. Utilise `triggerBlobDownload` pour déclencher le download.
 */
export async function downloadScanFichier(
  fichierId: string,
): Promise<{ blob: Blob; filename: string }> {
  const t = getToken();
  const headers: Record<string, string> = {};
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(
    buildUrl(`/api/documents/scan/fichier/${encodeURIComponent(fichierId)}`),
    { headers, credentials: "include" },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data.detail || data.message || `Erreur ${res.status}`,
      res.status,
      data,
    );
  }

  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="?([^"]+)"?/i);
  const filename = match ? match[1] : `${fichierId}.docx`;

  return { blob: await res.blob(), filename };
}

/**
 * GET /api/documents/scan/pdf/{pdf_id}
 * Récupère l'aperçu PDF généré et renvoie un objectURL utilisable dans
 * <iframe>/<embed>/<object>. Pensez à URL.revokeObjectURL après usage.
 */
export async function fetchScanPdfPreview(
  pdfId: string,
): Promise<{ url: string; filename: string }> {
  const t = getToken();
  const headers: Record<string, string> = {};
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(
    buildUrl(`/api/documents/scan/pdf/${encodeURIComponent(pdfId)}`),
    { headers, credentials: "include" },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data.detail || data.message || `Erreur ${res.status}`,
      res.status,
      data,
    );
  }

  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="?([^"]+)"?/i);
  const filename = match ? match[1] : `apercu_${pdfId}.pdf`;

  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), filename };
}

export function scanPdfPreviewUrl(pdfId: string): string {
  return `${API_BASE}/api/documents/scan/pdf/${encodeURIComponent(pdfId)}`;
}

/** URL directe du fichier généré (docx). */
export function scanFichierUrl(fichierId: string): string {
  return `${API_BASE}/api/documents/scan/fichier/${encodeURIComponent(fichierId)}`;
}



// ═══════════════════════════════════════════════════════════════════════
// AUTH — Vérification d'email par code à 6 chiffres
// ═══════════════════════════════════════════════════════════════════════

export interface EmailCodeRequestResult {
    message: string;
    expires_in_seconds: number;
}

export interface EmailCodeVerifyResult {
    verified: boolean;
    verification_token: string;
    expires_in_seconds: number;
}

/** Envoie un code à 6 chiffres à l'email fourni. Rejette si provider non autorisé. */
export async function authRequestEmailCode(email: string): Promise<EmailCodeRequestResult> {
    return api("/auth/email/request-code", {
        method: "POST",
        body: { email },
        auth: false,
        rawJson: true,
    });
}

/**
 * Vérifie le code saisi. Renvoie un verification_token (valide 15 min) à
 * transmettre tel quel à authRegister — sans lui, /auth/register refuse.
 */
export async function authVerifyEmailCode(
    email: string,
    code: string,
): Promise<EmailCodeVerifyResult> {
    return api("/auth/email/verify-code", {
        method: "POST",
        body: { email, code },
        auth: false,
        rawJson: true,
    });
}

// ═══════════════════════════════════════════════════════════════════════
// TELEPHONY WEBHOOKS
// ═══════════════════════════════════════════════════════════════════════

export interface WebhookEvent {
    event_type: string;
    event_source: string;
    data: Record<string, any>;
    timestamp?: string;
}

export interface WebhookResponse {
    success: boolean;
    message: string;
    event_id?: number;
}

export interface WebhookTestResponse {
    success: boolean;
    integration_id: number;
    entreprise_id: string;
    webhook_url: string;
    message: string;
}

/**
 * POST /v1/webhooks/telephony/{integration_id}
 * Envoie un événement webhook téléphonique
 */
export async function telephonyWebhookSend(
    integrationId: number,
    event: WebhookEvent,
): Promise<WebhookResponse> {
    return api(`/v1/webhooks/telephony/${integrationId}`, {
        method: "POST",
        body: event,
        rawJson: true,
    });
}

/**
 * GET /v1/webhooks/telephony/{integration_id}/test
 * Teste l'accessibilité du webhook
 */
export async function telephonyWebhookTest(
    integrationId: number,
): Promise<WebhookTestResponse> {
    return api(`/v1/webhooks/telephony/${integrationId}/test`, {
        rawJson: true,
    });
}

/**
 * POST /v1/webhooks/telephony/{integration_id}/test
 * Envoie un événement de test (sans vérification de signature)
 */
export async function telephonyWebhookTestSend(
    integrationId: number,
    event: WebhookEvent,
): Promise<WebhookResponse> {
    return api(`/v1/webhooks/telephony/${integrationId}/test`, {
        method: "POST",
        body: event,
        rawJson: true,
    });
}


// ═══════════════════════════════════════════════════════════════════════
// BLOG / ACTUALITÉS (public — aucune auth)
// ═══════════════════════════════════════════════════════════════════════

/** Item renvoyé par GET /api/blog/articles */
export interface BlogArticleListItem {
  slug: string;
  titre: string;
  chapo: string;
  categorie: string | null;
  image: string | null;
  date: string | null; // ISO 8601
}

/** Objet renvoyé par GET /api/blog/articles/{slug} */
export interface BlogArticleDetail {
  slug: string;
  titre: string;
  contenu_html: string;
  chapo: string;
  auteur: string;
  categorie: string | null;
  image: string | null;   // ← À AJOUTER
  tags: string[] | null;
  date: string | null;
}

/** Nombre d'articles par page côté backend (limit=20) */
export const BLOG_PAGE_SIZE = 20;

/** GET /api/blog/articles?categorie=&page= */
export async function listBlogArticles(
  opts: { categorie?: string; page?: number } = {},
): Promise<BlogArticleListItem[]> {
  return api("/api/blog/articles", {
    query: {
      categorie: opts.categorie || undefined,
      page: opts.page ?? 1,
    },
    auth: false,
    rawJson: true,
  });
}

/** GET /api/blog/articles/{slug} */
export async function getBlogArticle(slug: string): Promise<BlogArticleDetail> {
  return api(`/api/blog/articles/${encodeURIComponent(slug)}`, {
    auth: false,
    rawJson: true,
  });
}

export async function getBlogArticleSuggestions(
  slug: string,
): Promise<BlogArticleListItem[]> {
  return api(`/api/blog/articles/${encodeURIComponent(slug)}/suggestions`, {
    auth: false,
    rawJson: true,
  });
}







// Offer jobs
export interface JobOfferListItem {
  slug: string;
  poste: string;
  entreprise: string;
  resume_accrocheur: string;
  categorie_metier: string;
  secteur: string;
  type_contrat: string;
  localisation_ville: string;
  image: string | null;
  badges: string[];
  date: string | null;
}

export interface JobOfferDetail extends JobOfferListItem {
  entreprise_description: string | null;
  entreprise_lien_externe: string | null;
  entreprise_logo_url: string | null;
  niveau_experience: string;
  niveau_etudes: string | null;
  localisation_quartier: string | null;
  teletravail_possible: boolean;
  salaire_estime: string | null;
  mots_cles_seo: string[];
  url_source: string;
  domaine_source: string;
  date_publication_source: string | null;
  schema_jobposting: Record<string, any>;
}

export async function listJobOffers(opts: {
  categorie_metier?: string; secteur?: string; ville?: string;
  type_contrat?: string; page?: number;
} = {}): Promise<JobOfferListItem[]> {
  return api("/api/emploi/offres", { query: opts, auth: false, rawJson: true });
}

export async function getJobOffer(slug: string): Promise<JobOfferDetail> {
  return api(`/api/emploi/offres/${encodeURIComponent(slug)}`, { auth: false, rawJson: true });
}

export async function getJobOfferSuggestions(slug: string): Promise<JobOfferListItem[]> {
  return api(`/api/emploi/offres/${encodeURIComponent(slug)}/suggestions`, { auth: false, rawJson: true });
}

export interface SiteMarcheEmploi {
  site_id: string;
  domaine: string;
  nom: string;
  logo_url: string;
  nombre_offres_estime: number;
  estimation_precise: boolean;
  nouvelles_offres: number;
  echantillon: { titre: string; url: string }[];
}

export interface RapportMarche {
  poste: string;
  ville: string | null;
  total_offres_estime: number;
  estimation_precise: boolean;
  nb_sites_avec_offres: number;
  nouvelles_offres_total: number;
  sites: SiteMarcheEmploi[];
  date_generation: string;
  perime: boolean;
}

export async function getRapportMarche(
  poste: string,
  ville?: string,
  signal?: AbortSignal,
): Promise<RapportMarche> {
  const p = poste?.trim();
  if (!p) throw new Error("poste requis");

  const query: Record<string, string> = { poste: p };
  const v = ville?.trim();
  if (v) query.ville = v;

  return api("/api/emploi/marche", { query, auth: false, rawJson: true, signal });
}


