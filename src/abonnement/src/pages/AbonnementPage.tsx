import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCwIcon, Receipt, History, Repeat, AlertTriangleIcon } from 'lucide-react';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR } from '@/lib/utils';
import { StatutAbonnementCard } from '../components/StatutAbonnementCard';
import { PaiementsHistorique } from '../components/PaiementsHistorique';
import { Panel, EmptyState } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function AbonnementPage() {
  const { status, loading, error, refresh, isActif } = useAbonnement();

  if (loading && !status) {
    return (
      <div className="ecole_m ecole_m-desktop space-y-6 p-4 md:p-6">
        <div className="h-48 animate-pulse rounded-xl bg-black/[0.04]" />
        <div className="h-64 animate-pulse rounded-xl bg-black/[0.04]" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="ecole_m ecole_m-desktop p-4 md:p-6">
        <Panel title="Abonnement" icon={<Receipt className="h-4 w-4" />}>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--em-danger-soft)] text-[var(--em-danger)]">
              <AlertTriangleIcon className="h-5 w-5" />
            </span>
            <p className="text-[13.5px] font-semibold text-[var(--em-danger)]">Impossible de charger votre abonnement</p>
            <p className="ecole_m-muted text-[12.5px]">{error}</p>
            <Button variant="primary" size="sm" leftIcon={<RefreshCwIcon className="h-3.5 w-3.5" />} onClick={() => refresh()}>
              Réessayer
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const paiements = status?.paiements ?? [];
  const historiqueFormule = status?.historique_formule ?? [];

  return (
    <div className="ecole_m ecole_m-desktop p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="ecole_m-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--em-text)]">Mon abonnement</h1>
            <p className="ecole_m-muted mt-0.5 text-[13.5px]">Statut, échéances et historique de paiement.</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />} onClick={() => refresh()} disabled={loading}>
            Actualiser
          </Button>
        </div>

        <StatutAbonnementCard />

        <Panel title="Gérer mon abonnement" subtitle="Activer, prolonger ou changer de formule" icon={<Repeat className="h-4 w-4" />}>
          <Link to="/abonnement/upgrade" className="inline-block">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {isActif ? 'Prolonger mon abonnement' : 'Activer mon abonnement'}
            </Button>
          </Link>
        </Panel>

        <PaiementsHistorique paiements={paiements} />

        {historiqueFormule.length > 0 && (
          <Panel title="Historique des formules" subtitle={`${historiqueFormule.length} changement${historiqueFormule.length > 1 ? 's' : ''}`} icon={<History className="h-4 w-4" />}>
            <div className="space-y-2">
              {historiqueFormule.map((h, i) => (
                <div key={`${h.date}-${i}`} className="flex items-center gap-3 rounded-lg border border-[var(--em-border)] bg-white p-3.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--em-text)] text-white">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{h.ancienne === 'par_employe' ? 'Par employé' : 'Forfait'}</Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--em-text-2)]" />
                      <Badge tone="info">{h.nouvelle === 'par_employe' ? `Par employé${h.nb_employes ? ` (${h.nb_employes})` : ''}` : 'Forfait'}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-[var(--em-text-2)]">{formatDateFR(h.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {!loading && status && paiements.length === 0 && historiqueFormule.length === 0 && (
          <Panel title="Historique" icon={<Receipt className="h-4 w-4" />}>
            <EmptyState title="Aucun historique pour le moment" description="Vos paiements et changements de formule apparaîtront ici." />
          </Panel>
        )}
      </div>
    </div>
  );
}