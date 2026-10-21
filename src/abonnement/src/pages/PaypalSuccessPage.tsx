import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, LoaderCircleIcon, AlertOctagon, ArrowRight, CreditCard, ShieldCheck, CalendarDays } from 'lucide-react';
import { abonnementPaypalCapturer, CapturerPaypalResult } from '@/lib/api_routes/abonnement_api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAbonnement } from '@/lib/AbonnementContext';
import { formatDateFR, formatFCFA } from '@/lib/utils';

type State = 'loading' | 'success' | 'error';

export default function PaypalSuccessPage() {
  const [params] = useSearchParams();
  const ordreId = params.get('token') || params.get('ordre_id') || '';
  const { refresh } = useAbonnement();
  const [state, setState] = useState<State>('loading');
  const [result, setResult] = useState<CapturerPaypalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ordreId) { setError('Référence de paiement manquante'); setState('error'); return; }
      try {
        const r = await abonnementPaypalCapturer(ordreId);
        if (cancelled) return;
        await refresh();
        setResult(r);
        setState('success');
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'La capture du paiement a échoué');
        setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [ordreId, refresh]);

  const formuleLabel = result?.formule === 'par_employe' ? `par employé${result.nb_employes ? ` · ${result.nb_employes}` : ''}` : 'forfait illimité';

  return (
    <div className="ecole_m ecole_m-desktop flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="ecole_m-card overflow-hidden p-8 text-center">
          {state === 'loading' && (
            <>
              <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--em-info-soft)]">
                <LoaderCircleIcon className="h-10 w-10 animate-spin text-[var(--em-info)]" />
              </div>
              <Badge tone="info" className="mb-3">Traitement en cours</Badge>
              <h2 className="ecole_m-display text-2xl font-semibold text-[var(--em-text)]">Confirmation du paiement…</h2>
              <p className="ecole_m-muted mt-2 text-[13px]">Ne fermez pas cette fenêtre.</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[var(--em-text-2)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--em-success)]" /> Connexion sécurisée
              </div>
            </>
          )}

          {state === 'success' && result && (
            <>
              <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--em-success)]">
                <Check className="h-10 w-10 text-white" strokeWidth={3} />
              </div>
              <Badge tone="success" className="mb-3">Paiement confirmé</Badge>
              <h2 className="ecole_m-display text-2xl font-semibold text-[var(--em-text)]">Bienvenue parmi nous</h2>
              <p className="ecole_m-muted mt-2 text-[13px]">
                Votre abonnement <span className="font-bold text-[var(--em-text)]">{result.mois_couverts} mois</span> ({formuleLabel}) est désormais actif.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <SuccessFact label="Montant payé" value={formatFCFA(result.montant_fcfa)} Icon={CreditCard} />
                <SuccessFact label="Prochaine échéance" value={formatDateFR(result.nouvelle_echeance)} Icon={CalendarDays} />
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <Link to="/"><Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>Accéder à mon espace</Button></Link>
                <Link to="/abonnement"><Button variant="outline" size="lg">Voir le reçu</Button></Link>
              </div>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--em-danger)]">
                <AlertOctagon className="h-10 w-10 text-white" strokeWidth={2.4} />
              </div>
              <Badge tone="danger" className="mb-3">Échec de la capture</Badge>
              <h2 className="ecole_m-display text-2xl font-semibold text-[var(--em-text)]">Paiement non finalisé</h2>
              <p className="ecole_m-muted mt-2 text-[13px]">{error || "Une erreur est survenue. Aucun montant n'a été débité."}</p>
              <div className="mt-6 flex justify-center gap-2">
                <Link to="/abonnement/upgrade"><Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>Réessayer</Button></Link>
                <Link to="/abonnement"><Button variant="ghost">Annuler</Button></Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessFact({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="rounded-lg border border-[var(--em-border)] bg-white p-3 text-left">
      <div className="mb-0.5 flex items-center gap-1.5 text-[var(--em-text-2)]">
        <Icon className="h-3 w-3" />
        <p className="text-[10px] font-bold uppercase tracking-[.12em]">{label}</p>
      </div>
      <p className="truncate text-[13px] font-semibold text-[var(--em-text)]">{value}</p>
    </div>
  );
}