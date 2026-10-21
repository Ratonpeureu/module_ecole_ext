import React, { useEffect, useMemo, useState } from 'react';
import '@/abonnement/src/abonnement.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Wallet, Check, Sparkles, ShieldCheck,
  TrendingDown, ArrowRight, Globe2, Users, Layers,
} from 'lucide-react';
import {
  abonnementTarif,
  abonnementPaypalCreerOrdre,
  TarifResponse,
  FormuleAbo,
  PackForfait,
  PalierOption,
  DureeOption,
  PalierEmploye,
} from '@/lib/api_routes/abonnement_api';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatEUR, formatFCFA, fcfaToEur } from '@/lib/utils';

type Method = 'paypal' | 'virement';

export default function AbonnementUpgradePage() {
  const navigate = useNavigate();
  const [tarif, setTarif] = useState<TarifResponse | null>(null);
  const [formule, setFormule] = useState<FormuleAbo>('forfait');
  const [selectedMois, setSelectedMois] = useState<number>(3);
  const [selectedPalier, setSelectedPalier] = useState<PalierEmploye>(3);
  const [method, setMethod] = useState<Method>('virement');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const t = await abonnementTarif();
        setTarif(t);
        setFormule(t.formule_active);
      } catch (e: any) {
        setError(e?.message || 'Impossible de charger les tarifs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Données dérivées selon la formule ─────────────────────────
  const forfaitPacks: PackForfait[] = useMemo(
    () => tarif?.formules.forfait.packs ?? [],
    [tarif],
  );

  const paliers: PalierOption[] = useMemo(
    () => tarif?.formules.par_employe.paliers ?? [],
    [tarif],
  );

  const selectedPalierObj: PalierOption | undefined = useMemo(
    () => paliers.find((p) => p.nb_employes === selectedPalier),
    [paliers, selectedPalier],
  );

  const dureesParEmploye: DureeOption[] = selectedPalierObj?.durees ?? [];

  // Option courante (durée sélectionnée dans la formule active)
  const currentForfait =
    formule === 'forfait'
      ? forfaitPacks.find((p) => p.mois === selectedMois) ?? null
      : null;

  const currentDuree =
    formule === 'par_employe'
      ? dureesParEmploye.find((d) => d.mois === selectedMois) ?? null
      : null;

  const totalFcfa =
    currentForfait?.total_fcfa ?? currentDuree?.total_fcfa ?? 0;

  const prixMensuelEffectif =
    currentForfait?.prix_mois_fcfa ??
    currentDuree?.prix_mois_fcfa ??
    (selectedMois > 0 ? Math.round(totalFcfa / selectedMois) : 0);

  const hasSelection =
    (formule === 'forfait' && !!currentForfait) ||
    (formule === 'par_employe' && !!currentDuree);

  // Dépassement de quota : uniquement par_employe, désormais sur le palier
  const depassement =
    formule === 'par_employe' && selectedPalierObj?.warning_depassement.actif
      ? selectedPalierObj.warning_depassement.message
      : null;

  const handleSubmit = async () => {
    if (!hasSelection) return;
    setError(null);

    if (formule === 'par_employe' && depassement) {
      setError(depassement);
      return;
    }

    setSubmitting(true);
    try {
      if (method === 'paypal') {
        const ordre = await abonnementPaypalCreerOrdre({
          mois: selectedMois,
          formule,
          nb_employes: formule === 'par_employe' ? selectedPalier : null,
        });
        window.location.href = ordre.approve_url;
      } else {
        const qs = new URLSearchParams({
          mois: String(selectedMois),
          formule,
        });
        if (formule === 'par_employe') {
          qs.set('nb_employes', String(selectedPalier));
        }
        navigate(`/app/abonnement/virement?${qs.toString()}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="abonnement-scope space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-200/70 bg-paper shadow-raise">
        <div
          className="pointer-events-none absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5C51866 0%, transparent 60%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5C51844 0%, transparent 60%)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-40" />
        <div className="relative px-6 sm:px-8 py-6 sm:py-7">
          <Link
            to="/abonnement"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'abonnement
          </Link>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-ink-900 text-white text-[10px] font-bold uppercase tracking-[.16em] shadow-raise mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Activation · Étape 1 sur 2
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-ink-900 tracking-tight leading-tight">
            Choisissez votre{' '}
            <span className="relative inline-block">
              <span className="relative z-10">formule</span>
              <span
                className="absolute left-0 right-0 bottom-1 h-2 -z-0 rounded-sm opacity-60"
                style={{ background: 'linear-gradient(90deg, #F5C518 0%, transparent 100%)' }}
              />
            </span>
          </h1>
          <p className="mt-2 text-sm text-ink-500 max-w-2xl">
            Forfait illimité ou facturation par employé · 1, 3, 6 ou 12 mois prépayés · paiement carte ou virement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sélection de la formule */}
          <Panel
            title="Type de formule"
            subtitle="Choisissez le modèle qui vous convient"
            icon={<Layers className="w-4 h-4" strokeWidth={2.4} />}>
            {loading || !tarif ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="h-32 rounded-xl bg-ink-100 animate-shimmer" />
                <div className="h-32 rounded-xl bg-ink-100 animate-shimmer" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <FormuleCard
                  active={formule === 'forfait'}
                  onClick={() => setFormule('forfait')}
                  Icon={Sparkles}
                  title={tarif.formules.forfait.label}
                  subtitle={tarif.formules.forfait.description}
                  hint={`${formatFCFA(tarif.prix_forfait_fcfa)} / mois`}
                />
                <FormuleCard
                  active={formule === 'par_employe'}
                  onClick={() => setFormule('par_employe')}
                  Icon={Users}
                  title={tarif.formules.par_employe.label}
                  subtitle={tarif.formules.par_employe.description}
                  hint={`${formatFCFA(tarif.prix_par_employe_fcfa)} / employé / mois · ${tarif.nb_employes_actifs} actuel${
                    tarif.nb_employes_actifs > 1 ? 's' : ''
                  }`}
                />
              </div>
            )}
          </Panel>

          {/* PALIER — uniquement pour par_employe */}
          {formule === 'par_employe' && (
            <Panel
              title="Nombre d'employés"
              subtitle={tarif?.formules.par_employe.etape_1 ?? "Choisissez votre palier"}
              icon={<Users className="w-4 h-4" strokeWidth={2.4} />}>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-ink-100 animate-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {paliers.map((p) => (
                    <PalierCard
                      key={p.nb_employes}
                      palier={p}
                      selected={selectedPalier === p.nb_employes}
                      onClick={() => setSelectedPalier(p.nb_employes)}
                    />
                  ))}
                </div>
              )}
              {selectedPalierObj?.warning_depassement.actif && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-900">
                  ⚠︎ {selectedPalierObj.warning_depassement.message}
                </div>
              )}
            </Panel>
          )}

          {/* Durée */}
          <Panel
            title="Durée d'engagement"
            subtitle={
              formule === 'par_employe'
                ? (tarif?.formules.par_employe.etape_2 ?? "Choisissez votre durée d'engagement")
                : 'Plus la durée est longue, mieux vous êtes couvert'
            }
            icon={<Sparkles className="w-4 h-4" strokeWidth={2.4} />}>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-ink-100 animate-shimmer" />
                ))}
              </div>
            ) : formule === 'forfait' ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {forfaitPacks.map((p) => (
                  <ForfaitPackCard
                    key={p.mois}
                    pack={p}
                    selected={selectedMois === p.mois}
                    onClick={() => setSelectedMois(p.mois)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {dureesParEmploye.map((d) => (
                  <DureeCard
                    key={d.mois}
                    duree={d}
                    nbEmployes={selectedPalier}
                    selected={selectedMois === d.mois}
                    onClick={() => setSelectedMois(d.mois)}
                  />
                ))}
              </div>
            )}
          </Panel>

          {/* Méthode */}
          <Panel
            title="Mode de paiement"
            subtitle="Choisissez votre méthode préférée"
            icon={<CreditCard className="w-4 h-4" strokeWidth={2.4} />}>
            <div className="grid sm:grid-cols-2 gap-3">
              <MethodCard
                active={method === 'virement'}
                onClick={() => setMethod('virement')}
                Icon={Wallet}
                title="Virement bancaire"
                subtitle="Local · Devise FCFA"
                bullets={['Téléchargez le RIB', 'Joindre une preuve', 'Validation sous 24h ouvrées']}
                gradient="linear-gradient(135deg, #FFE26B 0%, #F5C518 100%)"
                solid="#F5C518"
                light
              />
            </div>
          </Panel>
        </div>

        {/* Sticky récap */}
        <div>
          <div className="lg:sticky lg:top-24 space-y-4">
            <Panel
              title="Récapitulatif"
              subtitle="Vérifiez avant de payer"
              icon={<Check className="w-4 h-4" strokeWidth={2.4} />}>
              <div className="space-y-3">
                <Row
                  label="Formule"
                  value={
                    formule === 'forfait'
                      ? 'Forfait illimité'
                      : `Par employé · ${selectedPalier} max`
                  }
                />
                <Row label="Durée" value={hasSelection ? `${selectedMois} mois` : '—'} small />
                <Row
                  label="Tarif mensuel"
                  value={hasSelection ? formatFCFA(prixMensuelEffectif) : '—'}
                  small
                />
                <Row
                  label="Méthode"
                  value={method === 'paypal' ? 'Carte bancaire' : 'Virement bancaire'}
                  small
                />
                {method === 'paypal' && hasSelection && (
                  <Row
                    label="Équivalent EUR"
                    value={formatEUR(fcfaToEur(totalFcfa))}
                    small
                    muted
                  />
                )}
                <div className="border-t border-ink-200/60 pt-3 mt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[.14em] font-semibold text-ink-500">
                      Total à régler
                    </span>
                    <span className="font-display text-2xl font-black text-ink-900 tabular-nums">
                      {hasSelection ? formatFCFA(totalFcfa) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {depassement && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-900">
                  ⚠︎ {depassement}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 space-y-2">
                <Button
                  variant="accent"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  rightIcon={!submitting ? <ArrowRight className="w-4 h-4" /> : undefined}
                  onClick={handleSubmit}
                  disabled={!hasSelection || loading || !!depassement}>
                  {method === 'paypal' ? 'Payer par carte' : 'Procéder au virement'}
                </Button>
                <Link to="/abonnement">
                  <Button variant="ghost" fullWidth size="sm">
                    Annuler
                  </Button>
                </Link>
              </div>

              <div className="mt-5 pt-5 border-t border-ink-200/60 space-y-2 text-[11px] text-ink-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement sécurisé
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600" /> Conversion EUR au taux BCEAO fixe
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-600" /> Accès immédiat après confirmation
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
// Sous-composants
// ─────────────────────────────────────────────────────────────────

function FormuleCard({
  active, onClick, Icon, title, subtitle, hint,
}: { active: boolean; onClick: () => void; Icon: any; title: string; subtitle: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left rounded-2xl p-5 border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        active
          ? 'border-accent-500 bg-gradient-to-b from-accent-100/80 to-paper shadow-glow-y'
          : 'border-ink-200 bg-paper hover:border-ink-300 shadow-flat',
      )}>
      {active && (
        <span
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #D9A60D 100%)' }}>
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-ink-900 shadow-flat mb-3"
        style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #F5C518 100%)' }}>
        <Icon className="w-6 h-6" strokeWidth={2.2} />
      </div>
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>
      <p className="text-[12px] font-mono font-semibold text-ink-700 mt-2">{hint}</p>
    </button>
  );
}

function PalierCard({
  palier, selected, onClick,
}: { palier: PalierOption; selected: boolean; onClick: () => void }) {
  const depasse = palier.warning_depassement.actif;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left rounded-2xl p-4 border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        selected
          ? 'border-accent-500 bg-gradient-to-b from-accent-100/80 to-paper shadow-glow-y'
          : 'border-ink-200 bg-paper hover:border-ink-300 shadow-flat',
      )}>
      {selected && (
        <span
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #D9A60D 100%)' }}>
          <Check className="w-3 h-3" strokeWidth={3} />
        </span>
      )}
      {palier.populaire && !selected && (
        <Badge tone="info" className="absolute -top-2 right-2">Populaire</Badge>
      )}
      <p className="font-display text-2xl font-black text-ink-900 leading-none">
        {palier.nb_employes}
      </p>
      <p className="text-[11px] uppercase tracking-[.14em] font-bold text-ink-500 mt-1">
        {palier.label}
      </p>
      {depasse && (
        <p className="mt-2 text-[10px] font-semibold text-amber-700 inline-flex items-start gap-1">
          ⚠︎ Quota dépassé
        </p>
      )}
    </button>
  );
}

function ForfaitPackCard({
  pack, selected, onClick,
}: { pack: PackForfait; selected: boolean; onClick: () => void }) {
  const prixMensuel = pack.prix_mois_fcfa ?? Math.round(pack.total_fcfa / pack.mois);
  const isBest = pack.mois === 12;
  const isPopular = pack.populaire;
  const hasOffert = pack.mois_offerts > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left rounded-2xl p-5 border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        selected
          ? 'border-accent-500 bg-gradient-to-b from-accent-100/80 to-paper shadow-glow-y'
          : 'border-ink-200 bg-paper hover:border-ink-300 shadow-flat',
      )}>
      {selected && (
        <span
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #D9A60D 100%)' }}>
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
      {isBest && !selected && (
        <Badge tone="accent" className="absolute -top-2 right-3">
          <TrendingDown className="w-2.5 h-2.5" /> Meilleure couverture
        </Badge>
      )}
      {isPopular && !isBest && !selected && (
        <Badge tone="info" className="absolute -top-2 right-3">Populaire</Badge>
      )}
      <p className="text-[11px] uppercase tracking-[.14em] font-bold text-ink-500">
        {pack.label || 'Pack'}
      </p>
      <p className="font-display text-3xl font-black text-ink-900 mt-1 leading-none">
        {pack.mois} <span className="text-base font-bold text-ink-500">mois</span>
      </p>
      {hasOffert && (
        <p className="text-[11px] font-semibold text-emerald-700 mt-1.5 inline-flex items-center gap-1">
          🎁 {pack.mois_offerts} mois offert{pack.mois_offerts > 1 ? 's' : ''}
        </p>
      )}
      <p className="mt-3 text-xl font-black tabular-nums text-ink-900">
        {formatFCFA(pack.total_fcfa)}
      </p>
      <p className="text-[11px] text-ink-500 mt-0.5">
        soit{' '}
        <span className="font-mono font-semibold text-ink-700">{formatFCFA(prixMensuel)}</span> /mois
      </p>
      {pack.detail && (
        <p className="text-[10px] font-mono text-ink-500 mt-1 truncate" title={pack.detail}>
          {pack.detail}
        </p>
      )}
    </button>
  );
}

function DureeCard({
  duree, nbEmployes, selected, onClick,
}: { duree: DureeOption; nbEmployes: number; selected: boolean; onClick: () => void }) {
  const prixMensuel = duree.prix_mois_fcfa ?? Math.round(duree.total_fcfa / duree.mois);
  const isBest = duree.mois === 12;
  const isPopular = duree.mois === 3;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left rounded-2xl p-5 border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        selected
          ? 'border-accent-500 bg-gradient-to-b from-accent-100/80 to-paper shadow-glow-y'
          : 'border-ink-200 bg-paper hover:border-ink-300 shadow-flat',
      )}>
      {selected && (
        <span
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #D9A60D 100%)' }}>
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
      {isBest && !selected && (
        <Badge tone="accent" className="absolute -top-2 right-3">
          <TrendingDown className="w-2.5 h-2.5" /> Meilleur tarif
        </Badge>
      )}
      {isPopular && !isBest && !selected && (
        <Badge tone="info" className="absolute -top-2 right-3">Populaire</Badge>
      )}
      <p className="text-[11px] uppercase tracking-[.14em] font-bold text-ink-500">
        Engagement {duree.mois} mois
      </p>
      <p className="font-display text-3xl font-black text-ink-900 mt-1 leading-none">
        {duree.mois} <span className="text-base font-bold text-ink-500">mois</span>
      </p>
      <p className="text-[11px] font-semibold text-ink-700 mt-1.5 inline-flex items-center gap-1">
        <Users className="w-3 h-3" /> {nbEmployes} employé{nbEmployes > 1 ? 's' : ''} max
      </p>
      <p className="mt-3 text-xl font-black tabular-nums text-ink-900">
        {formatFCFA(duree.total_fcfa)}
      </p>
      <p className="text-[11px] text-ink-500 mt-0.5">
        soit{' '}
        <span className="font-mono font-semibold text-ink-700">{formatFCFA(prixMensuel)}</span> /mois
      </p>
      {duree.detail && (
        <p className="text-[10px] font-mono text-ink-500 mt-1 truncate" title={duree.detail}>
          {duree.detail}
        </p>
      )}
    </button>
  );
}

function MethodCard({
  active, onClick, Icon, title, subtitle, bullets, gradient, solid, tag, light,
}: { active: boolean; onClick: () => void; Icon: any; title: string; subtitle: string; bullets: string[]; gradient: string; solid: string; tag?: string; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative text-left rounded-2xl p-5 border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        active
          ? 'border-accent-500 bg-gradient-to-b from-accent-100/60 to-paper shadow-glow-y'
          : 'border-ink-200 bg-paper hover:border-ink-300 shadow-flat',
      )}>
      {tag && (
        <Badge tone="success" className="absolute -top-2 right-3">
          {tag}
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-flat"
          style={{ background: gradient, color: light ? '#0B0A07' : '#fff', boxShadow: `0 6px 14px -4px ${solid}80` }}>
          <Icon className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-bold text-ink-900">{title}</p>
          <p className="text-[12px] text-ink-500">{subtitle}</p>
        </div>
        {active && (
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #FFE26B 0%, #D9A60D 100%)' }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-ink-700">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function Row({
  label, value, small, muted,
}: { label: string; value: string; small?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          'uppercase tracking-[.14em] font-semibold',
          small ? 'text-[10px] text-ink-500' : 'text-[11px] text-ink-500',
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