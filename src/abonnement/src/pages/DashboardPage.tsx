import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Coffee, UserX, Clock, CalendarDays, ArrowRight, Sparkles, Activity, Bell, CreditCard } from 'lucide-react';
import { Panel, EmptyState } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR } from '@/lib/utils';

function KpiCard({ label, value, sub, Icon, color }: { label: string; value: number | string; sub?: string; Icon: any; color: string }) {
  return (
    <div className="ecole_m-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--em-text-2)]">{label}</p>
          <p className="ecole_m-display mt-2 text-3xl font-semibold leading-none tabular-nums text-[var(--em-text)]">{value}</p>
          {sub && <p className="mt-1.5 text-[11.5px] text-[var(--em-text-2)]">{sub}</p>}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: color }}>
          <Icon className="h-6 w-6" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { status, isTrial } = useAbonnement();
  const today = useMemo(
    () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    []
  );

  return (
    <div className="ecole_m ecole_m-desktop p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="ecole_m-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--em-text)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--em-accent)]" />
                Tableau de bord
              </div>
              <h1 className="ecole_m-display text-[26px] font-semibold tracking-[-0.015em] text-[var(--em-text)]">
                Aujourd'hui, <span className="text-[var(--em-accent)] capitalize">{today}</span>
              </h1>
              <p className="ecole_m-muted mt-1.5 max-w-xl text-[13.5px]">
                Présence, pointages et événements RH en temps réel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/app/pointage"><Button variant="primary" leftIcon={<Clock className="h-4 w-4" />}>Pointage</Button></Link>
              <Link to="/app/calendrier"><Button variant="outline" leftIcon={<CalendarDays className="h-4 w-4" />}>Agenda</Button></Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Effectif total" value={48} sub="employés inscrits" Icon={Users} color="var(--em-text)" />
          <KpiCard label="En service" value={32} sub="en poste actuellement" Icon={UserCheck} color="var(--em-success)" />
          <KpiCard label="En pause" value={6} sub="pause en cours" Icon={Coffee} color="var(--em-warning)" />
          <KpiCard label="Absents" value={10} sub="pas encore pointé" Icon={UserX} color="var(--em-danger)" />
        </div>

        {isTrial && status && (
          <div className="ecole_m-card border-[var(--em-accent)]/30 bg-[var(--em-accent-soft)] p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--em-accent)] text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--em-text-2)]">
                  Essai gratuit · {status.trial_jours_restants} jours restants
                </p>
                <p className="ecole_m-display mt-0.5 text-[16px] font-semibold text-[var(--em-text)]">
                  Activez votre abonnement avant le {formatDateFR(status.trial_end, { day: '2-digit', month: 'long' })}
                </p>
              </div>
              <Link to="/abonnement/upgrade">
                <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>Voir les formules</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Présence du jour" subtitle="32 employés en activité" icon={<UserCheck className="h-4 w-4" />}>
              <EmptyState title="Aperçu de votre équipe" description="Cette section affichera la liste détaillée des présences une fois connectée." icon={<Activity className="h-6 w-6" strokeWidth={1.8} />} />
            </Panel>
          </div>
          <div>
            <Panel title="Alertes" subtitle="0 alerte active" icon={<Bell className="h-4 w-4" />}>
              <EmptyState title="Aucune alerte" description="Vous serez notifié des retards et anomalies en temps réel." icon={<Sparkles className="h-6 w-6" strokeWidth={1.8} />} />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}