import { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LoaderCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useAbonnement } from '@/lib/AbonnementContext';

// Routes accessibles même si l'abonnement est bloqué (expiré / suspendu / introuvable)
const ALLOWED_WHEN_BLOCKED = [
  '/abonnement',
  '/abonnement/upgrade',
  '/abonnement/virement',
  '/abonnement/paypal/succes',
  '/abonnement/paypal/annule',
  '/abonnement/expire',
  '/parametres',
];

export function AbonnementGuard() {
  const { loading, status, isBloque, statutLive, error } = useAbonnement();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnAllowed = ALLOWED_WHEN_BLOCKED.some((p) =>
    location.pathname.startsWith(p)
  );

  useEffect(() => {
    if (loading && !status) return;
    if (isBloque && !isOnAllowed) {
      navigate('/abonnement/expire', {
        replace: true,
        state: {
          from: location.pathname,
          statut: statutLive,
        },
      });
    }
  }, [loading, status, isBloque, statutLive, isOnAllowed, location.pathname, navigate]);

  // ── Premier chargement — pas encore de statut connu ──────────────
  if (loading && !status) {
    return (
      <div className="ecole_m ecole_m-desktop flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--em-text-2)]">
          <LoaderCircleIcon className="h-7 w-7 animate-spin text-[var(--em-accent)]" />
          <p className="text-[13.5px] font-semibold">
            Vérification de votre abonnement…
          </p>
        </div>
      </div>
    );
  }

  // ── Erreur réseau au tout premier chargement (pas de status) ─────
  if (error && !status) {
    return (
      <div className="ecole_m ecole_m-desktop flex min-h-[60vh] items-center justify-center p-6">
        <div className="ecole_m-card max-w-md p-6 text-center">
          <span className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-[var(--em-danger-soft)] text-[var(--em-danger)]">
            <AlertCircleIcon className="h-6 w-6" />
          </span>
          <p className="text-[14px] font-semibold text-[var(--em-danger)]">
            Impossible de vérifier votre abonnement
          </p>
          <p className="ecole_m-muted mt-1 text-[12.5px]">{error}</p>
        </div>
      </div>
    );
  }

  // ── Abonnement bloqué : on affiche un loader le temps de la redirection
  if (!loading && status && isBloque && !isOnAllowed) {
    return (
      <div className="ecole_m ecole_m-desktop flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--em-text-2)]">
          <LoaderCircleIcon className="h-7 w-7 animate-spin text-[var(--em-accent)]" />
          <p className="text-[13.5px] font-semibold">Redirection…</p>
        </div>
      </div>
    );
  }

  // ── Accès autorisé ───────────────────────────────────────────────
  return <Outlet />;
}