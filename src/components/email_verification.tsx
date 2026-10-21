import { useEffect, useState } from 'react';
import {
  MailIcon, ShieldCheckIcon, LoaderCircleIcon, AlertCircleIcon,
  CheckCircle2Icon, RotateCcwIcon,
} from 'lucide-react';
import { authRequestEmailCode, authVerifyEmailCode } from '@/lib/api';
import { EmailCodeInput } from './email_code_input';

interface EmailVerificationProps {
  email: string;
  verificationToken: string | null;
  onVerified: (token: string) => void;
}

export function EmailVerification({ email, verificationToken, onVerified }: EmailVerificationProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const requestCode = async () => {
    setError(null);
    if (!email.trim()) { setError('Email requis'); return; }
    setSending(true);
    try {
      const res = await authRequestEmailCode(email.trim());
      setCodeSent(true);
      setCode('');
      setSecondsLeft(res.expires_in_seconds ?? 600);
    } catch (e: any) {
      setError(e?.message || "Impossible d'envoyer le code");
    } finally {
      setSending(false);
    }
  };

  const verify = async (value: string) => {
    if (value.length !== 6) return;
    setError(null);
    setVerifying(true);
    try {
      const res = await authVerifyEmailCode(email.trim(), value);
      onVerified(res.verification_token);
    } catch (e: any) {
      setError(e?.message || 'Code invalide');
    } finally {
      setVerifying(false);
    }
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── État vérifié ─────────────────────────────────────── */
  if (verificationToken) {
    return (
      <div className="rounded-lg border border-[var(--em-border)] bg-[var(--em-surface)] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--em-success-soft)] text-[var(--em-success)]">
            <CheckCircle2Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-[#1A1A1A]">Email vérifié</p>
            <p className="text-[12.5px] text-[#5D5D5D] break-all">{email}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-success-soft)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--em-success)]">
            <CheckCircle2Icon className="h-3 w-3" /> Valide
          </span>
        </div>
      </div>
    );
  }

  /* ── État non vérifié ─────────────────────────────────── */
  return (
    <div className="rounded-lg border border-[var(--em-accent)]/30 bg-[var(--em-accent-soft)] p-4">
      <div className="flex items-start gap-3">
        <ShieldCheckIcon className="h-5 w-5 text-[var(--em-accent)] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-[#1A1A1A]">
            Vérification de l'email
          </p>
          <p className="text-[12.5px] text-[#5D5D5D] mt-1">
            Un code à 6 chiffres sera envoyé à votre adresse. Obligatoire pour continuer.
          </p>

          {!codeSent ? (
            <button
              type="button"
              onClick={requestCode}
              disabled={sending || !email.trim()}
              className="ecole_m-btn ecole_m-btn--primary ecole_m-btn--sm mt-3 disabled:opacity-50"
            >
              {sending ? <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" /> : <MailIcon className="h-3.5 w-3.5" />}
              Envoyer le code
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-[12.5px] text-[#5D5D5D]">
                Code envoyé à <strong className="text-[#1A1A1A] break-all">{email}</strong>
              </p>

              <EmailCodeInput
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={verifying}
                hasError={!!error}
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => verify(code)}
                  disabled={verifying || code.length !== 6}
                  className="ecole_m-btn ecole_m-btn--primary ecole_m-btn--sm disabled:opacity-50"
                >
                  {verifying
                    ? <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
                    : <CheckCircle2Icon className="h-3.5 w-3.5" />}
                  Vérifier
                </button>
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={sending || secondsLeft > 0}
                  className="ecole_m-btn ecole_m-btn--secondary ecole_m-btn--sm disabled:opacity-40"
                >
                  <RotateCcwIcon className="h-3 w-3" />
                  Renvoyer
                </button>
                {secondsLeft > 0 && (
                  <span className="text-[11.5px] font-mono text-[#5D5D5D]">
                    Expire dans {mmss(secondsLeft)}
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-[var(--em-danger)] mt-2 flex items-center gap-1">
              <AlertCircleIcon className="h-3 w-3 shrink-0" /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}