import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import {
  abonnementStatus,
  AbonnementStatus,
  StatutAbo,
  FormuleAbo,

} from '@/lib/api_routes/abonnement_api';
import { TOKEN_EXPIRED_EVENT } from '@/lib/api';
import { useAuth } from './auth';

// ── Types ──────────────────────────────────────────────────────────────
interface AbonnementCtx {
  status: AbonnementStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  // Drapeaux dérivés (pour les guards & l'UI)
  statutLive: StatutAbo | 'inconnu';
  isTrial: boolean;
  isActif: boolean;
  isExpire: boolean;
  isSuspendu: boolean;
  isIntrouvable: boolean;
  isBloque: boolean;        // expire | suspendu | introuvable → refuser l'accès produit
  hasAcces: boolean;        // trial | actif → autorise l'accès

  // Infos pratiques pour l'UI
  formule: FormuleAbo | null;
  trialJoursRestants: number | null;
  joursRestantsAbo: number | null;
  prochainMontantFcfa: number | null;

  // Quota employés (formule par_employe)
  nbEmployesActifs: number | null;
  nbEmployesAutorises: number | null;   // null = illimité (forfait)
  nbEmployesRestants: number | null;    // null = illimité
  quotaAtteint: boolean;                 // true si par_employe et restants <= 0
  quotaProche: boolean;                  // true si par_employe et restants <= 1

  // Bannière "à renouveler bientôt"
  showRenewalWarning: boolean;
}

const Ctx = createContext<AbonnementCtx | null>(null);

// ── Constantes ─────────────────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 10 * 60_000;   // 10 min — aligné sur le cache backend (12h)
const MIN_REFRESH_GAP_MS = 2 * 100_000;     // anti-rafale sur focus répétés
const WARN_DAYS_BEFORE_EXPIRY = 5;





// ── Provider ───────────────────────────────────────────────────────────
export function AbonnementProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<AbonnementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastStatutRef = useRef<StatutAbo | 'inconnu'>('inconnu');
  const lastFetchTsRef = useRef<number>(0);

  const refresh = useCallback(async (force = false) => {
    if (!isAuthenticated) {
      setStatus(null);
      setLoading(false);
      return;
    }
    const now = Date.now();
    if (!force && now - lastFetchTsRef.current < MIN_REFRESH_GAP_MS) {
      return;
    }
    lastFetchTsRef.current = now;
    try {
      setError(null);
      const s = await abonnementStatus();
      setStatus(s);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger l'abonnement");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
    const t = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, refresh]);

  // Reset à la déconnexion
  useEffect(() => {
    const onClear = () => {
      setStatus(null);
      setError(null);
      setLoading(false);
      lastStatutRef.current = 'inconnu';
    };

    window.addEventListener(TOKEN_EXPIRED_EVENT, onClear);
    return () => window.removeEventListener(TOKEN_EXPIRED_EVENT, onClear);
  }, []);

  // Resync quand l'onglet redevient visible
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isAuthenticated, refresh]);
  
  // Toasts sur transitions de statut (trial → expire, etc.)
  useEffect(() => {
    if (!status) return;
    const prev = lastStatutRef.current;
    const cur = status.statut;

    if (prev !== 'inconnu' && prev !== cur) {
      if (cur === 'expire') {
        toast.error('Votre abonnement a expiré. Renouvelez pour continuer.', {
          id: 'abo-expire',
          duration: 8000,
        });
      } else if (cur === 'suspendu') {
        toast.error('Votre abonnement est suspendu. Contactez le support.', {
          id: 'abo-suspendu',
          duration: 8000,
        });
      } else if (cur === 'actif' && (prev === 'trial' || prev === 'expire')) {
        toast.success('Abonnement activé ✅', { id: 'abo-actif' });
      }
    }
    lastStatutRef.current = cur;
  }, [status]);

  // Valeur du contexte
  const value = useMemo<AbonnementCtx>(() => {
    const statutLive: StatutAbo | 'inconnu' = status?.statut ?? 'inconnu';
    const isTrial = statutLive === 'trial';
    const isActif = statutLive === 'actif';
    const isExpire = statutLive === 'expire';
    const isSuspendu = statutLive === 'suspendu';
    const isIntrouvable = statutLive === 'introuvable';
    const hasAcces = isTrial || isActif;
    const isBloque = isExpire || isSuspendu || isIntrouvable;

    const formule = (status?.formule as FormuleAbo) ?? null;
    const trialJoursRestants = status?.trial_jours_restants ?? null;
    const joursRestantsAbo = status?.jours_restants_abo ?? null;

    // Quota employés (uniquement pertinent pour la formule par_employe)
    const nbEmployesActifs = status?.nb_employes_actifs ?? null;
    const nbEmployesAutorises = status?.nb_employes_autorises ?? null;
    const nbEmployesRestants = status?.nb_employes_restants ?? null;
    const quotaAtteint =
      formule === 'par_employe' &&
      nbEmployesRestants !== null &&
      nbEmployesRestants <= 0;
    const quotaProche =
      formule === 'par_employe' &&
      nbEmployesRestants !== null &&
      nbEmployesRestants <= 1 &&
      nbEmployesRestants > 0;

    // Bannière de pré-expiration
    const showRenewalWarning =
      (isTrial && trialJoursRestants !== null && trialJoursRestants <= WARN_DAYS_BEFORE_EXPIRY) ||
      (isActif && joursRestantsAbo !== null && joursRestantsAbo <= WARN_DAYS_BEFORE_EXPIRY);

    return {
      status,
      loading,
      error,
      refresh,
      statutLive,
      isTrial,
      isActif,
      isExpire,
      isSuspendu,
      isIntrouvable,
      isBloque,
      hasAcces,
      formule,
      trialJoursRestants,
      joursRestantsAbo,
      prochainMontantFcfa: status?.prochain_montant_estime_fcfa ?? null,
      nbEmployesActifs,
      nbEmployesAutorises,
      nbEmployesRestants,
      quotaAtteint,
      quotaProche,
      showRenewalWarning,
    };
  }, [status, loading, error, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────
export function useAbonnement(): AbonnementCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAbonnement must be used within AbonnementProvider');
  return v;
}