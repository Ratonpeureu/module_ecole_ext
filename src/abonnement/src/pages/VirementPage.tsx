import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '@/abonnement/src/abonnement.css';
import {
  ArrowLeft, Copy, Check, Upload, FileText, Wallet, ShieldCheck,
  Sparkles, ArrowRight, X, AlertCircle, ClipboardCheck, Loader2,
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  abonnementSoumettreVirement,
  abonnementGetRib,
  abonnementTarif,
  RibInfo,
  FormuleAbo,
  TarifResponse,
  PalierEmploye,
} from '@/lib/api_routes/abonnement_api';
import { useAbonnement } from '@/lib/AbonnementContext';
import { cn, formatFCFA } from '@/lib/utils';

const ALLOWED_MOIS    = [1, 3, 6, 12] as const;
const ALLOWED_PALIERS = [1, 3, 6, 12] as const;

export default function AbonnementVirementPage() {
  const [params] = useSearchParams();

  const moisParam = parseInt(params.get('mois') || '1', 10);
  const mois = (ALLOWED_MOIS as readonly number[]).includes(moisParam) ? moisParam : 1;

  const formuleParam = (params.get('formule') || 'forfait') as FormuleAbo;
  const formule: FormuleAbo = formuleParam === 'par_employe' ? 'par_employe' : 'forfait';

  // Palier d'employés — pertinent uniquement pour par_employe
  const palierParam = parseInt(params.get('nb_employes') || '0', 10);
  const nbEmployes: PalierEmploye | null =
    formule === 'par_employe' && (ALLOWED_PALIERS as readonly number[]).includes(palierParam)
      ? (palierParam as PalierEmploye)
      : null;

  const navigate = useNavigate();
  const { refresh } = useAbonnement();

  const [rib, setRib] = useState<RibInfo | null>(null);
  const [tarif, setTarif] = useState<TarifResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const suggestedRef = useMemo(
    () => `RH-${mois}M-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    [mois],
  );

  useEffect(() => {
    (async () => {
      try {
        const [r, t] = await Promise.all([abonnementGetRib(), abonnementTarif()]);
        setRib(r);
        setTarif(t);
      } catch (e: any) {
        setError(e?.message || 'Impossible de charger les informations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Garde-fou : si par_employe sans palier, on retourne à l'étape précédente
  useEffect(() => {
    if (formule === 'par_employe' && nbEmployes == null && !loading) {
      navigate('/abonnement/upgrade', { replace: true });
    }
  }, [formule, nbEmployes, loading, navigate]);

  // Montant calculé depuis tarif backend (forfait → packs, par_employe → palier.durees)
  const computed = useMemo(() => {
    if (!tarif) return { total: 0, prixMensuel: 0, detail: undefined as string | undefined };

    if (formule === 'forfait') {
      const pack = tarif.formules.forfait.packs.find((p) => p.mois === mois);
      if (!pack) return { total: 0, prixMensuel: 0, detail: undefined };
      return {
        total: pack.total_fcfa,
        prixMensuel: pack.prix_mois_fcfa,
        detail: pack.detail,
      };
    }

    const palier = tarif.formules.par_employe.paliers.find(
      (p) => p.nb_employes === nbEmployes,
    );
    const duree = palier?.durees.find((d) => d.mois === mois);
    if (!duree) return { total: 0, prixMensuel: 0, detail: undefined };
    return {
      total: duree.total_fcfa,
      prixMensuel: duree.prix_mois_fcfa,
      detail: duree.detail,
    };
  }, [tarif, formule, mois, nbEmployes]);

  const montant      = computed.total;
  const prixMensuel  = computed.prixMensuel ?? (montant && mois ? Math.round(montant / mois) : 0);
  const detailPack   = computed.detail;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* noop */ }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxMB = 5;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxMB} Mo)`);
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setError('Format accepté : JPG, PNG, PDF');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reference.trim().length < 4) {
      setError('Veuillez saisir une référence de virement valide (≥ 4 caractères)');
      return;
    }

    if (formule === 'par_employe' && nbEmployes == null) {
      setError('Palier d\'employés manquant — relancez depuis l\'étape précédente');
      return;
    }

    setSubmitting(true);
    try {
      await abonnementSoumettreVirement({
        mois,
        formule,
        nb_employes: formule === 'par_employe' ? nbEmployes : undefined,
        reference_virement: reference.trim(),
        note_entreprise: note.trim() || undefined,
        preuve: file,
      });
      await refresh();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Échec de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <VirementSuccess
        mois={mois}
        montant={montant}
        onClose={() => navigate('/abonnement')}
      />
    );
  }

  return (
    <div className="abonnement-scope space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-200/70 bg-paper shadow-raise">
        <div
          className="pointer-events-none absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5C51866 0%, transparent 60%)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-30" />
        <div className="relative px-6 sm:px-8 py-6 sm:py-7">
          <Link
            to="/abonnement/upgrade"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour aux formules
          </Link>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-ink-900 text-white text-[10px] font-bold uppercase tracking-[.16em] shadow-raise mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Paiement par virement · Étape 2 sur 2
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-ink-900 tracking-tight leading-tight">
            Réglez par{' '}
            <span className="relative inline-block">
              <span className="relative z-10">virement bancaire</span>
              <span
                className="absolute left-0 right-0 bottom-1 h-2 -z-0 rounded-sm opacity-60"
                style={{ background: 'linear-gradient(90deg, #F5C518 0%, transparent 100%)' }}
              />
            </span>
          </h1>
          <p className="mt-2 text-sm text-ink-500 max-w-2xl">
            Effectuez le virement sur le compte ci-dessous, puis renvoyez la
            référence et la preuve. Votre accès sera réactivé sous 24 heures
            ouvrées après validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Coordonnées bancaires"
            subtitle="Virement à effectuer sur ce compte"
            icon={<Wallet className="w-4 h-4" strokeWidth={2.4} />}
            right={<Badge tone="accent">RIB officiel</Badge>}>
            {loading || !rib ? (
              <div className="flex items-center gap-2 py-8 justify-center text-ink-500">
                <Loader2 className="w-4 h-4 animate-spin-slow" />
                <span className="text-sm">Chargement du RIB…</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <RibField label="Bénéficiaire" value={rib.titulaire} keyId="t" copied={copied} onCopy={copy} />
                <RibField label="Banque"       value={rib.banque}    keyId="b" copied={copied} onCopy={copy} />
                <RibField label="Agence"       value={rib.agence}    keyId="a" copied={copied} onCopy={copy} />
                <RibField label="IBAN"         value={rib.iban}      keyId="i" copied={copied} onCopy={copy} mono />
                <RibField label="SWIFT / BIC"  value={rib.swift}     keyId="s" copied={copied} onCopy={copy} mono />

                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200/60">
                  <div className="flex items-start gap-2 text-amber-900">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="text-[12px]">
                      <p className="font-bold">À indiquer en référence du virement :</p>
                      <p className="font-mono mt-0.5">{suggestedRef}</p>
                      <p className="text-amber-700 mt-1.5">
                        Vous renseignerez cette même référence dans le formulaire ci-contre.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Confirmer le virement"
            subtitle="Notifiez-nous une fois le transfert effectué"
            icon={<ClipboardCheck className="w-4 h-4" strokeWidth={2.4} />}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Référence du virement" required>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={`Ex : ${suggestedRef}`}
                  className="w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-sm font-mono
                             focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition"
                />
                <p className="text-[11px] text-ink-500 mt-1">
                  Telle que renseignée auprès de votre banque, ou code de transaction.
                </p>
              </Field>

              <Field label="Preuve de virement (recommandé)">
                <FileUpload
                  file={file}
                  onChange={handleFileChange}
                  onClear={() => setFile(null)}
                />
              </Field>

              <Field label="Note (facultatif)">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Informations complémentaires (date, banque émettrice…)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-ink-200 bg-white text-sm
                             focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition resize-none"
                />
              </Field>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={submitting}
                  rightIcon={!submitting ? <ArrowRight className="w-4 h-4" /> : undefined}
                  fullWidth>
                  Soumettre la preuve
                </Button>
                <Link to="/abonnement/upgrade">
                  <Button type="button" variant="ghost" size="lg">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </Panel>
        </div>

        <div>
          <div className="lg:sticky lg:top-24 space-y-4">
            <Panel
              title="Récapitulatif"
              subtitle="Montant à virer"
              icon={<Sparkles className="w-4 h-4" strokeWidth={2.4} />}>
              <div className="space-y-3">
                <RecapRow
                  label="Formule"
                  value={
                    formule === 'forfait'
                      ? 'Forfait illimité'
                      : nbEmployes
                      ? `Par employé · ${nbEmployes} max`
                      : 'Par employé'
                  }
                />
                <RecapRow label="Durée" value={`${mois} mois`} small />
                {prixMensuel > 0 && (
                  <RecapRow label="Tarif mensuel" value={formatFCFA(prixMensuel)} small />
                )}
                {detailPack && (
                  <RecapRow label="Détail" value={detailPack} small muted />
                )}

                <div className="border-t border-ink-200/60 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[.14em] font-semibold text-ink-500">
                      Total à virer
                    </span>
                    <span className="font-display text-2xl font-black text-ink-900 tabular-nums">
                      {formatFCFA(montant)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-ink-200/60 space-y-2 text-[11px] text-ink-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Compte vérifié et sécurisé
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-600" /> Validation sous 24 h ouvrées
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Reçu envoyé après confirmation
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sous-composants (inchangés)
// ─────────────────────────────────────────────────────────────────

function RibField({
  label, value, keyId, copied, onCopy, mono,
}: { label: string; value: string; keyId: string; copied: string | null; onCopy: (v: string, k: string) => void; mono?: boolean }) {
  const isCopied = copied === keyId;
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-paper border border-ink-200/60 hover:border-ink-300 transition group">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[.14em] font-semibold text-ink-500">{label}</p>
        <p className={cn('text-sm font-semibold text-ink-900 truncate', mono && 'font-mono')}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, keyId)}
        className={cn(
          'shrink-0 h-9 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition',
          isCopied
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-white border border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50',
        )}>
        {isCopied ? <><Check className="w-3.5 h-3.5" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
      </button>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[.14em] font-bold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FileUpload({
  file, onChange, onClear,
}: { file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void }) {
  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 bg-white">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' }}>
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900 truncate">{file.name}</p>
          <p className="text-[11px] text-ink-500">{(file.size / 1024).toFixed(1)} Ko</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <label className="block cursor-pointer">
      <input type="file" accept=".jpg,.webp,.png,.pdf" onChange={onChange} className="sr-only" />
      <div
        className="flex flex-col items-center justify-center gap-2 py-7 px-4 rounded-xl
                   border-2 border-dashed border-ink-300 bg-paper hover:bg-ink-50
                   hover:border-accent-500 transition group">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-ink-100 text-ink-500 group-hover:bg-accent-100 group-hover:text-accent-700 transition">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-ink-900">Cliquez pour téléverser</p>
        <p className="text-[11px] text-ink-500">JPG, PNG ou PDF · max 5 Mo</p>
      </div>
    </label>
  );
}

function RecapRow({ label, value, small, muted }: { label: string; value: string; small?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          'uppercase tracking-[.14em] font-semibold text-ink-500',
          small ? 'text-[10px]' : 'text-[11px]',
        )}>
        {label}
      </span>
      <span
        className={cn(
          'font-semibold tabular-nums',
          small ? 'text-[12px]' : 'text-sm',
          muted ? 'text-ink-500' : 'text-ink-900',
        )}>
        {value}
      </span>
    </div>
  );
}

function VirementSuccess({
  mois, montant, onClose,
}: { mois: number; montant: number; onClose: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="max-w-lg w-full">
        <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-paper shadow-raise-lg">
          <div
            className="pointer-events-none absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #34D39966 0%, transparent 60%)' }}
          />
          <div className="pointer-events-none absolute inset-0 bg-dotted opacity-30" />
          <div className="relative p-8 text-center">
            <div
              className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-5 animate-scale-in"
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
                boxShadow: '0 14px 30px -8px rgba(16,185,129,0.6)',
              }}>
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <Badge tone="success" className="mb-3">Soumission enregistrée</Badge>
            <h2 className="font-display text-3xl font-black text-ink-900">Preuve envoyée</h2>
            <p className="mt-2 text-ink-500 max-w-md mx-auto">
              Votre virement de{' '}
              <span className="font-bold text-ink-900">{formatFCFA(montant)}</span>{' '}
              pour <span className="font-bold text-ink-900">{mois} mois</span>{' '}
              est en cours de vérification. Vous recevrez un email dès la confirmation (sous 24h ouvrées).
            </p>
            <div className="mt-6 pt-6 border-t border-ink-200/60 grid grid-cols-3 gap-3 text-[11px]">
              <Step n="1" label="Soumis" done />
              <Step n="2" label="Vérification" pending />
              <Step n="3" label="Accès activé" />
            </div>
            <div className="mt-6 flex gap-2 justify-center">
              <Button variant="accent" onClick={onClose} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Retour à l'abonnement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, label, done, pending }: { n: string; label: string; done?: boolean; pending?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
          done && 'bg-emerald-500 text-white',
          pending && 'border-2 border-amber-500 text-amber-700 bg-amber-50 animate-pulse',
          !done && !pending && 'border-2 border-ink-200 text-ink-400 bg-paper',
        )}>
        {done ? <Check className="w-4 h-4" strokeWidth={3} /> : n}
      </div>
      <span
        className={cn(
          'font-semibold uppercase tracking-[.14em]',
          done ? 'text-emerald-700' : pending ? 'text-amber-700' : 'text-ink-400',
        )}>
        {label}
      </span>
    </div>
  );
}