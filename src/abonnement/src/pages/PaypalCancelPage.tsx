import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function PaypalCancelPage() {
  return (
    <div className="ecole_m ecole_m-desktop flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="ecole_m-card overflow-hidden p-8 text-center">
          <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#eef1f5]">
            <XCircle className="h-10 w-10 text-[var(--em-text-2)]" strokeWidth={2.2} />
          </div>
          <Badge tone="neutral" className="mb-3">Paiement annulé</Badge>
          <h2 className="ecole_m-display text-2xl font-semibold text-[var(--em-text)]">Aucune transaction</h2>
          <p className="ecole_m-muted mt-2 text-[13px]">
            Vous avez annulé le paiement avant sa finalisation. Aucun montant n'a été débité.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link to="/abonnement/upgrade"><Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>Reprendre</Button></Link>
            <Link to="/abonnement"><Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />}>Mon abonnement</Button></Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[var(--em-border)] pt-4 text-[11.5px] text-[var(--em-text-2)]">
            <Sparkles className="h-3 w-3 text-[var(--em-accent)]" /> Vous pouvez aussi régler par virement bancaire.
          </div>
        </div>
      </div>
    </div>
  );
}