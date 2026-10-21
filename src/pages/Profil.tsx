import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRoundIcon,
  MailIcon,
  Building2Icon,
  ShieldCheckIcon,
  LogOutIcon,
  RefreshCwIcon,
  KeyRoundIcon,
  CopyIcon,
  CheckIcon,
  FingerprintIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '../components/layout/PageHeader';
import { Section } from '../components/layout/Section';
import { StatutAbonnementCard } from '../abonnement/src/components/StatutAbonnementCard';
import { initials } from '../utils/format';

const COLOR = '#0067c0';

export default function Profil() {
  const { entreprise, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = entreprise?.nom || entreprise?.email || 'Mon compte';
  const shortInitials = initials(name) || '?';

  const copy = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* noop */
    }
  };

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        icon={UserRoundIcon}
        color={COLOR}
        title="Mon profil"
        subtitle="Informations du compte, sécurité et abonnement"
        actions={
          <>
            <button
              type="button"
              onClick={refresh}
              className="ecole_m-btn ecole_m-btn--secondary ecole_m-btn--sm"
            >
              <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="ecole_m-btn ecole_m-btn--danger ecole_m-btn--sm"
            >
              <LogOutIcon className="h-3.5 w-3.5" aria-hidden />
              Se déconnecter
            </button>
          </>
        }
      />

      {/* ═════ Carte identité ═════ */}
      <section className="ecole_m-card overflow-hidden">
        <div
          className="h-24"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #0067c0 18%, transparent) 0%, transparent 100%)',
          }}
          aria-hidden
        />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4 -mt-12">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-[28px] font-semibold text-white shadow-lg ring-4 ring-white"
              style={{ background: COLOR }}
              aria-hidden
            >
              {shortInitials}
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-[22px] font-semibold leading-tight tracking-tight">
                {name}
              </h1>
              <p className="mt-0.5 truncate text-[13.5px] text-[var(--em-text-2)]">
                {entreprise?.email || 'Adresse e-mail non renseignée'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-success-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--em-success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              Session active
            </span>
          </div>
        </div>
      </section>

      {/* ═════ Informations du compte ═════ */}
      <Section title="Informations du compte">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow
            label="Nom de l'établissement"
            value={entreprise?.nom}
            icon={Building2Icon}
          />
          <InfoRow
            label="Email de contact"
            value={entreprise?.email}
            icon={MailIcon}
            copyable
            copied={copied === 'email'}
            onCopy={() => copy(entreprise?.email || '', 'email')}
          />
          <InfoRow
            label="Email RH"
            value={entreprise?.rhEmail}
            icon={ShieldCheckIcon}
            copyable
            copied={copied === 'rh'}
            onCopy={() => copy(entreprise?.rhEmail || '', 'rh')}
          />
          <InfoRow
            label="Identifiant établissement"
            value={entreprise?.id}
            icon={FingerprintIcon}
            mono
            copyable
            copied={copied === 'id'}
            onCopy={() => copy(entreprise?.id || '', 'id')}
          />
        </div>
      </Section>

      {/* ═════ Sécurité ═════ */}
      <Section title="Sécurité">
        <div className="ecole_m-card divide-y divide-[var(--em-border)] overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
              <KeyRoundIcon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Mot de passe</p>
              <p className="text-[12.5px] text-[var(--em-text-2)]">
                Vous pouvez le modifier via la procédure de récupération sécurisée.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/forgot_password')}
              className="ecole_m-btn ecole_m-btn--secondary ecole_m-btn--sm"
            >
              Modifier
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--em-danger-soft)] text-[var(--em-danger)]">
              <LogOutIcon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[var(--em-danger)]">
                Déconnexion
              </p>
              <p className="text-[12.5px] text-[var(--em-text-2)]">
                Vous devrez saisir vos identifiants à nouveau pour accéder à votre espace.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="ecole_m-btn ecole_m-btn--danger ecole_m-btn--sm"
            >
              <LogOutIcon className="h-3.5 w-3.5" aria-hidden />
              Se déconnecter
            </button>
          </div>
        </div>
      </Section>

      {/* ═════ Abonnement ═════ */}
      <Section title="Mon abonnement">
        <StatutAbonnementCard />
      </Section>

      {/* ═════ Note de sécurité ═════ */}
      <div className="flex items-start gap-3 rounded-lg border border-[var(--em-warning)]/30 bg-[var(--em-warning-soft)] px-4 py-3 text-[13px] text-[var(--em-warning)]">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Ne partagez jamais votre mot de passe ni votre phrase secrète. En cas d'activité
          suspecte, déconnectez-vous puis contactez le support.
        </p>
      </div>
    </div>
  );
}

/* ─────────── Sous-composant ─────────── */

function InfoRow({
  label,
  value,
  icon: Icon,
  mono,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="ecole_m-card p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--em-text-2)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p
          className={`truncate text-[13.5px] font-semibold ${
            mono ? 'font-mono text-[12px]' : ''
          }`}
          title={value || undefined}
        >
          {value || '—'}
        </p>
        {copyable && value && (
          <button
            type="button"
            onClick={onCopy}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--em-text-2)] transition-colors hover:bg-[var(--em-surface-2)] hover:text-[var(--em-text)]"
            aria-label="Copier la valeur"
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-[var(--em-success)]" aria-hidden />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  );
}