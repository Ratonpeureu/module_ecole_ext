import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, AlertTriangle, X, AlertOctagon } from 'lucide-react';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR } from '@/lib/utils';

const DISMISS_KEY = 'rh_trial_banner_dismissed_v1';

export function TrialBanner() {
  const { status, loading, isTrial, isActif, isBloque } = useAbonnement();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (loading || !status) return null;
  const enEssai = isTrial || status.statut === 'trial';

  if (isBloque) {
    const fromTrial = !status.date_prochaine_echeance && (status.statut === 'expire' || status.statut === 'introuvable');
    return (
      <div className="border-b border-[var(--em-danger)]/30 bg-[var(--em-danger-soft)]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 lg:px-8">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--em-danger)] text-white">
            <AlertOctagon className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-[var(--em-danger)]">
            {fromTrial ? 'Votre essai gratuit est terminé.' : 'Votre abonnement a expiré.'}
            <span className="ml-1 hidden font-medium sm:inline">Activez un abonnement pour continuer.</span>
          </p>
          <Link
            to="/abonnement/upgrade"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[var(--em-danger)] px-3 text-xs font-bold text-white hover:brightness-110"
          >
            Souscrire <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (enEssai) {
    const days = status.trial_jours_restants ?? 0;
    const urgent = days <= 3;
    if (dismissed && !urgent) return null;
    return (
      <div className={`border-b ${urgent ? 'border-[var(--em-danger)]/30 bg-[var(--em-danger-soft)]' : 'border-[var(--em-warning)]/30 bg-[var(--em-warning-soft)]'}`}>
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 lg:px-8">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white ${urgent ? 'bg-[var(--em-danger)]' : 'bg-[var(--em-warning)]'}`}>
            {urgent ? <AlertTriangle className="h-4 w-4" strokeWidth={2.4} /> : <Sparkles className="h-4 w-4" strokeWidth={2.4} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] font-semibold leading-tight ${urgent ? 'text-[var(--em-danger)]' : 'text-[var(--em-warning)]'}`}>
              {urgent ? 'Votre essai gratuit se termine bientôt.' : 'Vous êtes en essai gratuit.'}
              <span className="ml-1.5 inline-flex items-center gap-1 opacity-90">
                <Clock className="h-3 w-3" />
                <span className="font-mono font-bold tabular-nums">{days} jour{days > 1 ? 's' : ''} restants</span>
                {status.trial_end && (
                  <span className="hidden sm:inline"> · expire le {formatDateFR(status.trial_end, { day: '2-digit', month: 'long' })}</span>
                )}
              </span>
            </p>
          </div>
          <Link to="/abonnement/upgrade" className="hidden h-8 shrink-0 items-center gap-1.5 rounded-md bg-[var(--em-text)] px-3 text-xs font-bold text-white sm:inline-flex">
            Activer <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {!urgent && (
            <button
              type="button"
              onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--em-text-2)] hover:bg-black/[0.06]"
              aria-label="Masquer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isActif && status.jours_restants_abo != null && status.jours_restants_abo <= 7) {
    if (dismissed) return null;
    const days = status.jours_restants_abo;
    return (
      <div className="border-b border-[var(--em-warning)]/30 bg-[var(--em-warning-soft)]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2 lg:px-8">
          <Clock className="h-4 w-4 shrink-0 text-[var(--em-warning)]" />
          <p className="flex-1 text-[12px] font-semibold text-[var(--em-warning)]">
            Renouvellement dans <span className="font-mono">{days} jour{days > 1 ? 's' : ''}</span>
            <span className="ml-1 hidden sm:inline"> · échéance {formatDateFR(status.date_prochaine_echeance, { day: '2-digit', month: 'long' })}</span>
          </p>
          <Link to="/abonnement/upgrade" className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--em-warning)] hover:underline">
            Prolonger <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[var(--em-warning)] hover:bg-black/[0.06]"
            aria-label="Masquer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}