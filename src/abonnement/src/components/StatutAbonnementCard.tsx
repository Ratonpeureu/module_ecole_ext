import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Clock, CheckCircle2, AlertOctagon, ArrowRight,
  CalendarDays, Wallet, Repeat, Users,
} from 'lucide-react';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR, formatFCFA } from '@/lib/utils';
import { Button } from './ui/Button';
import { Badge, StatusDot } from './ui/Badge';

const STATUT_META: Record<string, {
  label: string; solid: string; bg: string; text: string; Icon: any;
}> = {
  trial:       { label: 'Essai gratuit', Icon: Sparkles,      solid: '#c19c00', bg: '#fff4ce', text: '#8a5300' },
  actif:       { label: 'Actif',         Icon: CheckCircle2,  solid: '#0e7a0d', bg: '#dff6dd', text: '#0e7a0d' },
  expire:      { label: 'Expiré',        Icon: AlertOctagon,  solid: '#c42b1c', bg: '#fde7e9', text: '#c42b1c' },
  suspendu:    { label: 'Suspendu',      Icon: AlertOctagon,  solid: '#5a6472', bg: '#eef1f5', text: '#34312a' },
  introuvable: { label: 'Indisponible',  Icon: AlertOctagon,  solid: '#8b95a3', bg: '#eef1f5', text: '#34312a' },
};

export function StatutAbonnementCard() {
  const { status, loading, statutLive } = useAbonnement();
  if (!status && !loading) return null;

  const m = STATUT_META[statutLive] ?? STATUT_META.introuvable;
  const isTrial = statutLive === 'trial';
  const isActif = statutLive === 'actif';
  const isExpire = statutLive === 'expire' || statutLive === 'suspendu';

  const days = isTrial ? status?.trial_jours_restants : status?.jours_restants_abo;
  const totalTrial = status?.trial_jours ?? 14;
  const progress =
    isTrial && days != null && totalTrial > 0
      ? Math.max(0, Math.min(100, ((totalTrial - days) / totalTrial) * 100))
      : isActif && days != null
      ? Math.max(0, Math.min(100, ((30 - Math.min(30, days)) / 30) * 100))
      : 100;

  const formule = status?.formule;
  const isParEmploye = formule === 'par_employe';
  const nbEmployes = status?.nb_employes_actifs ?? 0;
  const nbAutorises = status?.nb_employes_autorises;
  const prixUnitaire = status?.prix_par_employe_fcfa ?? 0;
  const prixForfait = status?.prix_forfait_fcfa ?? 0;
  const tarifMensuel = status?.prochain_montant_estime_fcfa ?? (isParEmploye ? 0 : prixForfait);
  const tarifHint = isParEmploye && nbAutorises ? `${formatFCFA(prixUnitaire)} × ${nbAutorises}` : undefined;
  const quotaLabel = nbAutorises != null ? `${nbEmployes} / ${nbAutorises}` : `${nbEmployes} / ∞`;

  return (
    <div className="ecole_m-card overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.08)]"
            style={{ background: m.solid }}
          >
            <m.Icon className="h-7 w-7" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">Abonnement</Badge>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[.12em]"
                style={{ background: m.bg, color: m.text }}
              >
                <StatusDot tone={isActif ? 'success' : isTrial ? 'accent' : 'danger'} pulse={isActif || isTrial} />
                {m.label}
              </span>
              {formule && (
                <Badge tone="info">
                  {isParEmploye ? `Par employé · ${quotaLabel}` : 'Forfait illimité'}
                </Badge>
              )}
            </div>

            <h1 className="ecole_m-display text-2xl font-semibold tracking-[-0.015em] text-[var(--em-text)] sm:text-3xl">
              {isTrial && <>Il vous reste <span className="tabular-nums text-[var(--em-accent)]">{days ?? '—'}</span> jour{(days ?? 0) > 1 ? 's' : ''} d'essai</>}
              {isActif && <>Abonnement actif jusqu'au <span className="text-[var(--em-accent)]">{formatDateFR(status?.date_prochaine_echeance)}</span></>}
              {isExpire && <>Votre abonnement a expiré</>}
            </h1>

            <p className="ecole_m-muted mt-1.5 max-w-xl text-[13.5px]">
              {isTrial && 'Profitez de toutes les fonctionnalités, sans engagement.'}
              {isActif && `${status?.mois_prepaye_restants ?? 0} mois prépayés à venir · Renouvellement ${status?.auto_renouvellement ? 'automatique' : 'manuel'}.`}
              {isExpire && "Pour reprendre l'accès à votre espace, réglez votre abonnement ci-dessous."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {(isTrial || isExpire) && (
              <Link to="/abonnement/upgrade">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Activer maintenant
                </Button>
              </Link>
            )}
            {isActif && (
              <Link to="/abonnement/upgrade">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Prolonger
                </Button>
              </Link>
            )}
          </div>
        </div>

        {(isTrial || isActif) && (
          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-semibold text-[var(--em-text-2)]">
              <span className="uppercase tracking-[.12em]">{isTrial ? "Période d'essai" : 'Période courante'}</span>
              <span className="font-mono tabular-nums">{days ?? '—'} j restant{(days ?? 0) > 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, background: m.solid }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KeyFact
            label={isParEmploye ? 'Estimation mensuelle' : 'Tarif mensuel'}
            value={formatFCFA(tarifMensuel)}
            Icon={Wallet}
            hint={tarifHint}
          />
          <KeyFact
            label={isTrial ? "Fin de l'essai" : 'Prochaine échéance'}
            value={formatDateFR(isTrial ? status?.trial_end : status?.date_prochaine_echeance)}
            Icon={CalendarDays}
          />
          <KeyFact
            label={isParEmploye ? 'Employés' : 'Mois prépayés'}
            value={isParEmploye ? quotaLabel : `${status?.mois_prepaye_restants ?? 0} restants`}
            Icon={isParEmploye ? Users : Clock}
            hint={
              isParEmploye && nbAutorises != null
                ? nbEmployes >= nbAutorises
                  ? 'Quota atteint'
                  : `${nbAutorises - nbEmployes} place${nbAutorises - nbEmployes > 1 ? 's' : ''} libre${nbAutorises - nbEmployes > 1 ? 's' : ''}`
                : undefined
            }
          />
          <KeyFact
            label="Renouvellement"
            value={status?.auto_renouvellement ? 'Automatique' : 'Manuel'}
            Icon={Repeat}
          />
        </div>
      </div>
    </div>
  );
}

function KeyFact({ label, value, Icon, hint }: { label: string; value: string; Icon: any; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[var(--em-text-2)]">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        <p className="text-[10.5px] font-semibold uppercase tracking-[.12em]">{label}</p>
      </div>
      <p className="truncate text-[13.5px] font-semibold text-[var(--em-text)]">{value}</p>
      {hint && <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--em-text-2)]">{hint}</p>}
    </div>
  );
}