import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRightIcon, Building2Icon, LoaderCircleIcon } from 'lucide-react';
import { authLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'expired') {
      toast.error('Session expirée — veuillez vous reconnecter.', {
        id: 'session-expired',
        duration: 6000,
      });
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await authLogin({ email, password });
      const tok = res?.token || res?.access_token;
      const ent =
        res?.entreprise ??
        (res?.entreprise_id
          ? { id: res.entreprise_id, email, nom: res?.nom, rhEmail: res?.rh_email || undefined }
          : null);
      if (tok && ent) setAuth(tok, ent);
      toast.success('Connecté');
      const rawRedirect = searchParams.get('_redirect') || '/';
      const redirect = rawRedirect.replace(/^\/ecole/, '') || '/';
      navigate(redirect, { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Échec de la connexion');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ecole_m ecole_m-desktop min-h-screen grid lg:grid-cols-2">
      {/* Volet éditorial */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-[var(--em-surface)] border-r border-[var(--em-border)]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--em-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.12)]">
            <Building2Icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="text-[14px] font-semibold text-[#1A1A1A]">École Manager</div>
        </div>

        <div className="max-w-md">
          <div className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#8A8A8A] mb-4">
            Plateforme scolaire
          </div>
          <p className="ecole_m-display text-[32px] leading-tight font-semibold text-[#1A1A1A] tracking-[-0.02em]">
            Pilotez votre <span className="text-[var(--em-accent)]">établissement</span>, les{' '}
            <span className="text-[var(--em-accent)]">élèves</span>, les{' '}
            <span className="text-[var(--em-accent)]">notes</span> et la{' '}
            <span className="text-[var(--em-accent)]">finance</span> en un seul endroit.
          </p>
          <div className="mt-6 h-[3px] w-12 rounded-full bg-[var(--em-accent)]" />
          <p className="mt-6 text-[14px] text-[#5D5D5D] leading-relaxed">
            Élèves, classes, emplois du temps, bulletins, vie scolaire, registres Excel.
            Une plateforme complète pour piloter votre école.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#8A8A8A]">
          <span>École Manager</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--em-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.12)]">
              <Building2Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="text-[14px] font-semibold text-[#1A1A1A]">École Manager</div>
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#8A8A8A] mb-3">
            Connexion
          </div>
          <h1 className="ecole_m-display text-[30px] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
            Accédez à votre <span className="text-[var(--em-accent)]">espace</span>
          </h1>
          <p className="text-[14px] text-[#5D5D5D] mt-2 mb-8">
            Saisissez vos identifiants pour continuer.
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="email" className="ecole_m-label">
                Email professionnel <span className="text-[var(--em-danger)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@etablissement.com"
                className="ecole_m-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="ecole_m-label">
                Mot de passe <span className="text-[var(--em-danger)]">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ecole_m-input"
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot_password"
                className="text-[12px] text-[#5D5D5D] hover:text-[var(--em-accent)] border-b border-dashed border-[var(--em-border-strong)] hover:border-[var(--em-accent)] pb-px transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="ecole_m-btn ecole_m-btn--primary w-full justify-center h-10"
            >
              {busy ? (
                <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Se connecter
              {!busy && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[var(--em-border)] text-center text-[12px] text-[#5D5D5D]">
            Pas encore de compte ?{' '}
            <Link
              to="/signup"
              className="text-[#1A1A1A] hover:text-[var(--em-accent)] font-semibold border-b border-dashed border-[var(--em-border-strong)] hover:border-[var(--em-accent)] pb-px transition-colors"
            >
              Créer un établissement
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}