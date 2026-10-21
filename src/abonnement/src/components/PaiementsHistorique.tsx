import React, { useState } from 'react';
import {
  CheckCircle2, Clock, XCircle, Receipt, Wallet, CreditCard,
  ChevronDown, FileText, ShieldCheck, ExternalLink,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { PaiementAbo } from '@/lib/api_routes/abonnement_api';
import { formatDateFR, formatDateTimeFR, formatFCFA } from '@/lib/utils';
import { Panel, EmptyState } from './ui/Panel';
import { Badge } from './ui/Badge';

const STATUT_BADGE: Record<PaiementAbo['statut'], { label: string; tone: 'success' | 'warning' | 'danger'; Icon: any }> = {
  confirme:   { label: 'Confirmé',   tone: 'success', Icon: CheckCircle2 },
  en_attente: { label: 'En attente', tone: 'warning', Icon: Clock },
  rejete:     { label: 'Rejeté',     tone: 'danger',  Icon: XCircle },
};

function preuveFilename(p: PaiementAbo): string | null {
  if (!p.preuve_url) return null;
  const segs = p.preuve_url.split('/');
  return segs[segs.length - 1] || null;
}
function preuveFullUrl(p: PaiementAbo): string | null {
  if (!p.preuve_url) return null;
  return p.preuve_url.startsWith('http') ? p.preuve_url : `${API_BASE}${p.preuve_url}`;
}

export function PaiementsHistorique({ paiements }: { paiements: PaiementAbo[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Panel
      title="Historique des paiements"
      subtitle={`${paiements.length} transaction${paiements.length > 1 ? 's' : ''}`}
      icon={<Receipt className="h-4 w-4" strokeWidth={2.4} />}
    >
      {paiements.length === 0 ? (
        <EmptyState
          title="Aucun paiement enregistré"
          description="Vos paiements et reçus apparaîtront ici après le premier règlement."
          icon={<Wallet className="h-6 w-6" strokeWidth={1.8} />}
        />
      ) : (
        <div className="space-y-2">
          {paiements.map((p, i) => {
            const sb = STATUT_BADGE[p.statut];
            const isOpen = expanded === p.id;
            const isPaypal = p.reference_virement?.startsWith('PAYPAL-') ?? false;
            const filename = preuveFilename(p);
            const fullUrl = preuveFullUrl(p);
            const isParEmploye = p.formule === 'par_employe';

            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-lg border border-[var(--em-border)] bg-white"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-[#F9F9F9]"
                >
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: isPaypal ? 'var(--em-info)' : 'var(--em-success)' }}
                  >
                    {isPaypal ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-semibold text-[var(--em-text)]">
                        {formatFCFA(p.montant_fcfa)}
                        <span className="ml-1.5 font-medium text-[var(--em-text-2)]">· {p.mois_couverts} mois</span>
                      </p>
                      <Badge tone={sb.tone}>{sb.label}</Badge>
                      <Badge tone="neutral">
                        {isParEmploye ? `Par employé${p.nb_employes ? ` (${p.nb_employes})` : ''}` : 'Forfait'}
                      </Badge>
                    </div>
                    <p className="truncate text-[11.5px] text-[var(--em-text-2)]">
                      {isPaypal ? 'Carte bancaire (PayPal)' : 'Virement bancaire'} · <span className="font-mono">{p.reference_virement || '—'}</span>
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-[11.5px] text-[var(--em-text-2)]">
                      {formatDateFR(p.created_at, { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--em-text-2)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-[var(--em-border)] bg-[#F9F9F9]/60 px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <Detail label="Montant" value={formatFCFA(p.montant_fcfa)} />
                      <Detail label="Mois couverts" value={`${p.mois_couverts}`} />
                      <Detail label="Formule" value={isParEmploye ? 'Par employé' : 'Forfait'} />
                      <Detail label="Nb employés" value={p.nb_employes !== null ? String(p.nb_employes) : '—'} />
                      <Detail label="Soumis le" value={formatDateTimeFR(p.created_at)} />
                      <Detail label="Confirmé le" value={p.confirme_le ? formatDateTimeFR(p.confirme_le) : '—'} />
                      <Detail label="Début période" value={formatDateFR(p.periode_debut)} />
                      <Detail label="Fin période" value={formatDateFR(p.periode_fin)} />
                    </div>

                    {p.note_entreprise && (
                      <div className="rounded-lg border border-[var(--em-border)] bg-white p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--em-text-2)]">Votre note</p>
                        <p className="text-[12px] text-[var(--em-text)]">{p.note_entreprise}</p>
                      </div>
                    )}
                    {p.note_admin && (
                      <div className="rounded-lg border border-[var(--em-info)]/30 bg-[var(--em-info-soft)] p-3">
                        <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--em-info)]">
                          <ShieldCheck className="h-3 w-3" /> Réponse administrateur
                        </p>
                        <p className="text-[12px] text-[var(--em-text)]">{p.note_admin}</p>
                      </div>
                    )}
                    {filename && (
                      <div className="flex items-center gap-2 rounded-lg border border-[var(--em-border)] bg-white p-3">
                        <FileText className="h-4 w-4 text-[var(--em-text-2)]" />
                        <span className="flex-1 truncate font-mono text-[12px] text-[var(--em-text)]">{filename}</span>
                        {fullUrl && (
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--em-accent)] hover:underline"
                          >
                            Voir <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Badge tone="info">Preuve jointe</Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--em-text-2)]">{label}</p>
      <p className="text-[12px] font-semibold text-[var(--em-text)]">{value}</p>
    </div>
  );
}