import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowRight, Sparkles, ShieldOff, Database, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR } from '@/lib/utils';

export default function AbonnementExpirePage() {
  const { status, statutLive } = useAbonnement();
  const fromTrial = !status?.date_prochaine_echeance;
  const isSuspendu = statutLive === 'suspendu';
  const isIntrouvable = statutLive === 'introuvable';

  return (
    <div className="ecole_m ecole_m-desktop flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="ecole_m-card overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-wrap items-start gap-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--em-danger)] text-white">
                <AlertOctagon className="h-9 w-9" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <Badge tone="danger" className="mb-2">
                  {isSuspendu ? 'Abonnement suspendu' : isIntrouvable ? 'Abonnement introuvable' : fromTrial ? 'Essai terminé' : 'Abonnement expiré'}
                </Badge>
                <h1 className="ecole_m-display text-3xl font-semibold tracking-[-0.02em] text-[var(--em-text)] sm:text-4xl">
                  {fromTrial ? <>Votre essai gratuit est <span className="text-[var(--em-danger)]">terminé</span></> : isSuspendu ? <>Votre abonnement est <span className="text-[var(--em-danger)]">suspendu</span></> : <>Votre abonnement a <span className="text-[var(--em-danger)]">expiré</span></>}
                </h1>
                <p className="ecole_m-muted mt-2 text-[14px]">
                  {fromTrial && 'Pour continuer, activez votre abonnement. Vos données sont conservées en lieu sûr.'}
                  {!fromTrial && !isSuspendu && `Votre dernier paiement couvrait la période jusqu'au ${formatDateFR(status?.date_prochaine_echeance)}. Régularisez votre situation pour reprendre l'accès.`}
                  {isSuspendu && "Contactez notre support pour rétablir votre accès."}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <ReassureCard Icon={Database} title="Données préservées" subtitle="Vos employés, pointages et bulletins restent intacts." />
              <ReassureCard Icon={Clock} title="Reprise immédiate" subtitle="Activation instantanée après paiement par carte." />
              <ReassureCard Icon={ShieldOff} title="Aucune perte" subtitle="Sauvegardes quotidiennes conservées 90 jours." />
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-[var(--em-border)] pt-6 sm:flex-row sm:items-center">
              <Link to="/abonnement/upgrade" className="flex-1">
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Activer mon abonnement
                </Button>
              </Link>
              <Link to="/abonnement">
                <Button variant="outline" size="lg">Consulter mes paiements</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReassureCard({ Icon, title, subtitle }: { Icon: any; title: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-[var(--em-border)] bg-white p-4">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <p className="text-[13.5px] font-semibold text-[var(--em-text)]">{title}</p>
      <p className="ecole_m-muted mt-0.5 text-[12px]">{subtitle}</p>
    </div>
  );
}