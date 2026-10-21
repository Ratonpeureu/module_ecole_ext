import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircleIcon,
  Building2Icon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CrosshairIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LoaderCircleIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  XIcon,
} from 'lucide-react';

import { authRegister } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmailVerification } from '@/components/email_verification';
import RegisterMap from '@/components/register_map';

/* ═══════════════════════════════════════════════════════════════
   Types & constantes
   ═══════════════════════════════════════════════════════════════ */

interface FormState {
  nom: string;
  secteur: string;
  email_contact: string;
  telephone: string;
  adresse: string;
  site_web: string;
  description: string;
  verification_token: string | null;
  password: string;
  confirmPassword: string;
  secret_phrase: string;
  siege_lat: number | null;
  siege_lon: number | null;
}

const SECTORS = [
  'Technologies', 'Finance & Banque', 'Santé', 'Éducation',
  'Commerce & Retail', 'Industrie', 'Services',
  'Transport & Logistique', 'Immobilier', 'Autre',
];

const STEPS = [
  { id: 1, title: 'Informations', icon: Building2Icon, description: "Identité de l'établissement" },
  { id: 2, title: 'Sécurité', icon: ShieldIcon, description: 'Mot de passe et phrase secrète' },
  { id: 3, title: 'Localisation', icon: MapPinIcon, description: 'Position du siège' },
  { id: 4, title: 'Confirmation', icon: CheckIcon, description: 'Vérification finale' },
] as const;

const INITIAL: FormState = {
  nom: '',
  secteur: '',
  email_contact: '',
  telephone: '',
  adresse: '',
  site_web: '',
  description: '',
  verification_token: null,
  password: '',
  confirmPassword: '',
  secret_phrase: '',
  siege_lat: null,
  siege_lon: null,
};

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  /* ── Helpers ─────────────────────────────────────────── */

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[k as string];
        return n;
      });
    }
  };

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('siege_lat', pos.coords.latitude);
        update('siege_lon', pos.coords.longitude);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleMapClick = useCallback((la: number, ln: number) => {
    setForm((p) => ({ ...p, siege_lat: la, siege_lon: ln }));
  }, []);

  /* ── Validation par étape ────────────────────────────── */

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.nom.trim()) errs.nom = 'Nom requis';
      if (!form.email_contact.trim()) {
        errs.email_contact = 'Email requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_contact)) {
        errs.email_contact = 'Email invalide';
      }
      if (!form.verification_token) {
        errs.verification_token = 'Vérifiez votre email pour continuer';
      }
    }

    if (s === 2) {
      if (!form.password) errs.password = 'Mot de passe requis';
      else if (form.password.length < 6) errs.password = 'Minimum 6 caractères';
      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      if (!form.secret_phrase) errs.secret_phrase = 'Phrase secrète requise';
      else if (form.secret_phrase.length < 8) {
        errs.secret_phrase = 'Minimum 8 caractères';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  /* ── Soumission ──────────────────────────────────────── */

  const submit = async () => {
    // Revalide les étapes critiques (l'utilisateur peut avoir navigué en arrière)
    if (!validate(1)) { setStep(1); return; }
    if (!validate(2)) { setStep(2); return; }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await authRegister({
        nom: form.nom.trim(),
        secteur: form.secteur,
        email_contact: form.email_contact.trim(),
        telephone: form.telephone,
        adresse: form.adresse,
        site_web: form.site_web,
        description: form.description,
        password: form.password,
        secret_phrase: form.secret_phrase,
        verification_token: form.verification_token as string,
        siege_lat: form.siege_lat,
        siege_lon: form.siege_lon,
      });

      // Si le backend renvoie un token direct, on connecte l'utilisateur
      const tok = res?.token || res?.access_token;
      const ent =
        res?.entreprise ??
        (res?.entreprise_id
          ? {
              id: res.entreprise_id,
              email: form.email_contact.trim(),
              nom: res?.nom || form.nom.trim(),
              rhEmail: res?.rh_email || undefined,
            }
          : null);
      if (tok && ent) setAuth(tok, ent);

      setSuccess(res);
      toast.success('Inscription réussie');
    } catch (e: any) {
      setSubmitError(e?.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Écran de succès ─────────────────────────────────── */

  if (success) {
    const keys: string[] = Array.isArray(success.recovery_keys) ? success.recovery_keys : [];
    return (
      <div className="ecole_m ecole_m-desktop min-h-screen flex items-center justify-center p-6">
        <div className="ecole_m-card max-w-lg w-full p-8">
          <div className="text-center mb-6">
            <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-[var(--em-success)] text-white">
              <CheckCircle2Icon className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="ecole_m-display text-[22px] font-semibold mt-4 text-[#1A1A1A]">
              Inscription réussie
            </h2>
            <p className="text-[13px] text-[#5D5D5D] mt-1">
              Conservez précieusement ces clés de récupération.
            </p>
          </div>

          {keys.length > 0 && (
            <div className="rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-4 mb-5">
              <ul className="list-disc list-inside text-[12.5px] font-mono text-[#1A1A1A] space-y-1">
                {keys.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 text-[13px] text-[#5D5D5D]">
            {success.rh_email && (
              <p>
                Email RH :{' '}
                <strong className="text-[#1A1A1A]">{success.rh_email}</strong>
              </p>
            )}
            {success.slug && (
              <p>
                Slug :{' '}
                <strong className="text-[#1A1A1A] font-mono">{success.slug}</strong>
              </p>
            )}
          </div>

          <p className="text-[12px] text-[var(--em-danger)] mt-4">
            ⚠ Ces clés ne seront plus affichées.
          </p>

          <button
            onClick={() => navigate('/login', { replace: true })}
            className="ecole_m-btn ecole_m-btn--primary w-full mt-6 justify-center"
          >
            Accéder à la connexion
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulaire multi-étapes ─────────────────────────── */

  return (
    <div className="ecole_m ecole_m-desktop min-h-screen flex">
      {/* ── Sidebar étapes ──────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col bg-[var(--em-surface)] border-r border-[var(--em-border)]">
        <div className="p-6 border-b border-[var(--em-border)]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--em-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.12)]">
              <Building2Icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h1 className="text-[16px] font-semibold text-[#1A1A1A]">Inscription</h1>
              <p className="text-[12px] text-[#8A8A8A]">Créez votre espace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (done || active) setStep(s.id);
                }}
                disabled={!done && !active}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors"
                style={{
                  background: active ? 'var(--em-accent-soft)' : undefined,
                  border: active
                    ? '1px solid color-mix(in srgb, var(--em-accent) 35%, transparent)'
                    : '1px solid transparent',
                  opacity: !done && !active ? 0.4 : 1,
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{
                    background: done ? 'var(--em-success)' : active ? 'var(--em-accent)' : '#F0F0F0',
                    color: done || active ? '#fff' : '#8A8A8A',
                  }}
                >
                  {done ? <CheckIcon className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold ${active ? 'text-[#1A1A1A]' : 'text-[#5D5D5D]'}`}>
                    {s.title}
                  </p>
                  <p className="text-[11.5px] text-[#8A8A8A] truncate">{s.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--em-border)]">
          <div className="rounded-lg bg-[var(--em-accent-soft)] p-3 text-[12px] text-[#5D5D5D]">
            <ShieldIcon className="inline h-3.5 w-3.5 mr-1.5 text-[var(--em-accent)]" />
            Vos données sont chiffrées et protégées par une phrase secrète unique.
          </div>
        </div>
      </aside>

      {/* ── Contenu ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <div className="lg:hidden p-4 bg-[var(--em-surface)] border-b border-[var(--em-border)]">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-semibold text-[#1A1A1A]">Inscription</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
              Étape {step}/4
            </span>
          </div>
          <div className="flex gap-1 mt-3">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="h-1 flex-1 rounded-full"
                style={{ background: s.id <= step ? 'var(--em-accent)' : 'var(--em-border)' }}
              />
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-2xl mx-auto space-y-5">
            {submitError && (
              <div className="flex items-start gap-3 rounded-lg bg-[var(--em-danger-soft)] border border-[var(--em-danger)]/30 px-4 py-3 text-[13px] text-[var(--em-danger)]">
                <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="flex-1">{submitError}</span>
                <button
                  onClick={() => setSubmitError(null)}
                  aria-label="Fermer"
                  className="shrink-0"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* ═══ ÉTAPE 1 ═════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="ecole_m-display text-[20px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
                    Informations de l'établissement
                  </h2>
                  <p className="text-[13px] text-[#5D5D5D] mt-1">
                    Renseignez les informations de base et vérifiez votre email.
                  </p>
                </div>

                <Field label="Nom de l'établissement" required error={errors.nom}>
                  <div className="relative">
                    <Building2Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      value={form.nom}
                      onChange={(e) => update('nom', e.target.value)}
                      placeholder="École Les Palmiers"
                      className="ecole_m-input pl-10"
                    />
                  </div>
                </Field>

                <Field label="Secteur d'activité">
                  <select
                    value={form.secteur}
                    onChange={(e) => update('secteur', e.target.value)}
                    className="ecole_m-input"
                  >
                    <option value="">Sélectionnez un secteur</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email de contact" required error={errors.email_contact}>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                      <input
                        type="email"
                        value={form.email_contact}
                        onChange={(e) => {
                          update('email_contact', e.target.value);
                          // Changer l'email invalide le token → re-vérification obligatoire
                          update('verification_token', null);
                        }}
                        placeholder="contact@etablissement.com"
                        className="ecole_m-input pl-10"
                      />
                    </div>
                  </Field>

                  <Field label="Téléphone">
                    <div className="relative">
                      <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                      <input
                        type="tel"
                        value={form.telephone}
                        onChange={(e) => update('telephone', e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className="ecole_m-input pl-10"
                      />
                    </div>
                  </Field>
                </div>

                <EmailVerification
                  email={form.email_contact}
                  verificationToken={form.verification_token}
                  onVerified={(token) => update('verification_token', token)}
                />
                {errors.verification_token && (
                  <p className="text-[12px] text-[var(--em-danger)] -mt-2">
                    {errors.verification_token}
                  </p>
                )}

                <Field label="Adresse du siège">
                  <div className="relative">
                    <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      value={form.adresse}
                      onChange={(e) => update('adresse', e.target.value)}
                      placeholder="123 Rue de la Paix, Dakar"
                      className="ecole_m-input pl-10"
                    />
                  </div>
                </Field>

                <Field label="Site web">
                  <div className="relative">
                    <GlobeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      type="url"
                      value={form.site_web}
                      onChange={(e) => update('site_web', e.target.value)}
                      placeholder="https://www.etablissement.com"
                      className="ecole_m-input pl-10"
                    />
                  </div>
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={3}
                    placeholder="Décrivez brièvement votre établissement…"
                    className="ecole_m-input min-h-[90px] py-2"
                  />
                </Field>
              </div>
            )}

            {/* ═══ ÉTAPE 2 ═════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="ecole_m-display text-[20px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
                    Sécurité du compte
                  </h2>
                  <p className="text-[13px] text-[#5D5D5D] mt-1">
                    Définissez un mot de passe fort et une phrase secrète.
                  </p>
                </div>

                <Field label="Mot de passe" required error={errors.password}>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="ecole_m-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A]"
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}
                    >
                      {showPwd ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirmer le mot de passe" required error={errors.confirmPassword}>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      placeholder="Retapez votre mot de passe"
                      className="ecole_m-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A]"
                      aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div className="rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-4 text-[12.5px] text-[#5D5D5D]">
                  <p className="font-semibold text-[#1A1A1A] flex items-center gap-2 mb-1.5">
                    <ShieldIcon className="h-4 w-4 text-[var(--em-accent)]" />
                    Phrase secrète
                  </p>
                  <p>
                    Requise pour les actions sensibles (gestion des IPs, rotation des clés,
                    réinitialisation de mot de passe).
                  </p>
                </div>

                <Field label="Phrase secrète" required error={errors.secret_phrase}>
                  <div className="relative">
                    <ShieldIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={form.secret_phrase}
                      onChange={(e) => update('secret_phrase', e.target.value)}
                      placeholder="Une phrase mémorable (min. 8 caractères)"
                      className="ecole_m-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A]"
                      aria-label={showSecret ? 'Masquer' : 'Afficher'}
                    >
                      {showSecret ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11.5px] text-[#8A8A8A] mt-1">
                    Exemple : « Le soleil brille sur les montagnes enneigées »
                  </p>
                </Field>
              </div>
            )}

            {/* ═══ ÉTAPE 3 ═════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="ecole_m-display text-[20px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
                    Localisation du siège
                  </h2>
                  <p className="text-[13px] text-[#5D5D5D] mt-1">
                    Optionnel — sert de point de référence pour le pointage géolocalisé.
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--em-accent)]/30 bg-[var(--em-accent-soft)] p-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-[var(--em-accent)] shrink-0 mt-0.5" />
                    <div className="text-[12.5px] text-[#5D5D5D]">
                      <p className="font-semibold text-[#1A1A1A] mb-1">Point de référence</p>
                      <p>La position du siège sert de repère pour le pointage des employés.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={requestGeo}
                    disabled={geoStatus === 'loading'}
                    className="ecole_m-btn ecole_m-btn--primary ecole_m-btn--sm"
                  >
                    {geoStatus === 'loading' ? (
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <CrosshairIcon className="h-4 w-4" />
                    )}
                    Utiliser ma position
                  </button>
                  {geoStatus === 'granted' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-success-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--em-success)]">
                      <CheckCircle2Icon className="h-3 w-3" /> Géolocalisation activée
                    </span>
                  )}
                  {geoStatus === 'denied' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-danger-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--em-danger)]">
                      <AlertCircleIcon className="h-3 w-3" /> Refusée
                    </span>
                  )}
                </div>

                <div className="rounded-lg border border-[var(--em-border)] bg-[var(--em-surface)] p-4">
                  <p className="text-[12.5px] text-[#5D5D5D] mb-3">
                    Cliquez sur la carte pour choisir l'emplacement du siège :
                  </p>
                  <RegisterMap
                    lat={form.siege_lat}
                    lng={form.siege_lon}
                    onMapClick={handleMapClick}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Latitude">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.siege_lat ?? ''}
                      onChange={(e) =>
                        update('siege_lat', e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="14.7167"
                      className="ecole_m-input font-mono"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.siege_lon ?? ''}
                      onChange={(e) =>
                        update('siege_lon', e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="-17.4677"
                      className="ecole_m-input font-mono"
                    />
                  </Field>
                </div>

                {form.siege_lat !== null && form.siege_lon !== null && (
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-3 text-[12.5px]">
                    <MapPinIcon className="h-4 w-4 text-[var(--em-accent)]" />
                    <span className="font-mono text-[#1A1A1A]">
                      {form.siege_lat.toFixed(6)}, {form.siege_lon.toFixed(6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        update('siege_lat', null);
                        update('siege_lon', null);
                      }}
                      className="ml-auto text-[#5D5D5D] hover:text-[var(--em-danger)]"
                      aria-label="Effacer les coordonnées"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ÉTAPE 4 ═════════════════════════════ */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="ecole_m-display text-[20px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
                    Confirmation
                  </h2>
                  <p className="text-[13px] text-[#5D5D5D] mt-1">
                    Vérifiez vos informations avant de finaliser l'inscription.
                  </p>
                </div>

                <SummarySection title="Informations établissement" icon={Building2Icon}>
                  <SummaryRow label="Nom" value={form.nom} />
                  <SummaryRow label="Secteur" value={form.secteur} />
                  <SummaryRow
                    label="Email"
                    value={form.email_contact}
                    verified={!!form.verification_token}
                  />
                  <SummaryRow label="Téléphone" value={form.telephone} />
                </SummarySection>

                <SummarySection title="Sécurité" icon={ShieldIcon}>
                  <div className="col-span-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--em-success-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--em-success)]">
                      <CheckCircle2Icon className="h-3 w-3" /> Mot de passe défini
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--em-success-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--em-success)]">
                      <CheckCircle2Icon className="h-3 w-3" /> Phrase secrète définie
                    </span>
                  </div>
                </SummarySection>

                <SummarySection title="Localisation" icon={MapPinIcon}>
                  <div className="col-span-2">
                    {form.siege_lat !== null && form.siege_lon !== null ? (
                      <span className="font-mono text-[12.5px] text-[#1A1A1A]">
                        {form.siege_lat.toFixed(4)}, {form.siege_lon.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-[#8A8A8A]">
                        Non définie (optionnel)
                      </span>
                    )}
                  </div>
                </SummarySection>

                <div className="rounded-lg border border-[var(--em-accent)]/30 bg-[var(--em-accent-soft)] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldIcon className="h-5 w-5 text-[var(--em-accent)] shrink-0 mt-0.5" />
                    <div className="text-[12.5px] text-[#5D5D5D]">
                      <p className="font-semibold text-[#1A1A1A] mb-1">
                        Après l'inscription
                      </p>
                      <p>
                        Vous recevrez vos clés de récupération (8 clés à usage unique) et
                        pourrez télécharger votre clé de chiffrement une seule fois.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="p-4 lg:p-6 bg-[var(--em-surface)] border-t border-[var(--em-border)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="ecole_m-btn ecole_m-btn--subtle ecole_m-btn--sm disabled:opacity-30"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Précédent
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="ecole_m-btn ecole_m-btn--primary ecole_m-btn--sm"
              >
                Suivant
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="ecole_m-btn ecole_m-btn--primary ecole_m-btn--sm"
              >
                {submitting ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                {submitting ? 'Création…' : 'Créer mon compte'}
              </button>
            )}
          </div>

          <div className="max-w-2xl mx-auto mt-3 text-center text-[12px] text-[#5D5D5D]">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[var(--em-accent)] font-semibold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Petits composants locaux
   ═══════════════════════════════════════════════════════════════ */

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="ecole_m-label">
        {label}
        {required && <span className="text-[var(--em-danger)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-[var(--em-danger)] mt-1">{error}</p>}
    </div>
  );
}

function SummarySection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2Icon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--em-border)] bg-[var(--em-surface)] p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1A1A] mb-3">
        <Icon className="h-4 w-4 text-[var(--em-accent)]" /> {title}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-[13px]">{children}</dl>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11.5px] text-[#8A8A8A]">{label}</dt>
      <dd className="font-medium text-[#1A1A1A] flex items-center gap-1.5 break-all">
        {value || '—'}
        {verified && (
          <CheckCircle2Icon className="h-3.5 w-3.5 text-[var(--em-success)] shrink-0" />
        )}
      </dd>
    </div>
  );
}