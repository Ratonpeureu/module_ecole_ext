import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Smartphone, Apple, PlayCircle, ShieldCheck,
  Wallet, BookOpen, CalendarClock, BellRing, Play, MonitorPlay,
  LoaderCircleIcon, AlertCircleIcon, Copy, CheckIcon, PackageOpen
} from 'lucide-react';

import { getAppMobileVersions, type AppMobileVersion } from '../lib/api_ecole';

import logoApp from '../assets/app_gomor/log_app_gomor.png';
import visual1 from '../assets/app_gomor/Application mobile finances et éducation.png';
import visual2 from '../assets/app_gomor/Présentation élégante d’une application éducative mobile.png';
import visual3 from '../assets/app_gomor/screen_vide_emploi_dutemp.png';
import videoApp from '../assets/app_gomor/video_record_app.mp4';

export function MobileAppPromo() {
  const [activeMedia, setActiveMedia] = useState<'video' | 'screens'>('video');
  const [version, setVersion] = useState<AppMobileVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    getAppMobileVersions()
      .then((r) => {
        if (!alive) return;
        setVersion(r.latest);
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message || "Impossible de récupérer l'APK");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const downloadUrl = version?.download_url ?? "";

  const copyUrl = async () => {
    if (!downloadUrl) return;
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  return (
    <div className="ecole_m-card overflow-hidden">
      {/* Header */}
      <div className="relative flex flex-col items-center overflow-hidden border-b border-[var(--em-border)] bg-gradient-to-br from-[var(--em-accent-soft)] to-white p-6 text-center sm:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[var(--em-accent)]/10 blur-3xl" />
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5"
          >
            <img src={logoApp} alt="Gomor App Logo" className="h-full w-full object-contain" />
          </motion.div>
          <h2 className="ecole_m-display text-[26px] font-bold tracking-tight text-[var(--em-text)]">
            Gomor Parent
          </h2>
          <p className="ecole_m-muted mx-auto mt-2 max-w-lg text-[14px]">
            L'application officielle pour les parents. Suivez la scolarité, les finances et la vie scolaire de votre enfant en temps réel.
          </p>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        {/* ── Colonne gauche : Installation ────────────────────── */}
        <div className="flex flex-col border-b border-[var(--em-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
          
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-success-soft)] px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--em-success)]">
              <ShieldCheck className="h-4 w-4" /> 100% Sécurisé
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--em-warning-soft)] px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--em-warning)]">
              <Smartphone className="h-4 w-4" /> Android (APK)
            </span>
          </div>

          {loading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-[var(--em-text-2)]">
              <LoaderCircleIcon className="h-8 w-8 animate-spin text-[var(--em-accent)]" />
              <p className="text-[13.5px] font-semibold">Chargement de l'application…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--em-danger)]/30 bg-[var(--em-danger-soft)] p-6 text-center">
              <AlertCircleIcon className="h-8 w-8 text-[var(--em-danger)]" />
              <p className="text-[13.5px] font-semibold text-[var(--em-danger)]">Erreur de connexion</p>
              <p className="ecole_m-muted text-[12.5px]">{error}</p>
            </div>
          )}

          {!loading && !error && !version && (
             <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--em-border)] bg-[#F9F9F9] p-6 text-center">
              <PackageOpen className="h-10 w-10 text-[var(--em-text-3)]" />
              <p className="text-[14px] font-semibold text-[var(--em-text)]">APK bientôt disponible</p>
              <p className="ecole_m-muted max-w-sm text-[12.5px]">
                L'application n'est pas encore prête sur le serveur. Veuillez réessayer plus tard ou contacter l'administrateur.
              </p>
            </div>
          )}

          {!loading && !error && version && (
            <>
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <div className="group relative shrink-0 rounded-2xl border-2 border-dashed border-[var(--em-accent)]/30 bg-white p-4 shadow-sm transition-all hover:border-[var(--em-accent)] hover:shadow-md">
                  <QRCodeSVG
                    value={downloadUrl}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#1a1d21"
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: logoApp,
                      x: undefined,
                      y: undefined,
                      height: 34,
                      width: 34,
                      excavate: true,
                    }}
                  />
                  <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--em-accent)]">
                    Scanner pour installer
                  </p>
                </div>

                <div className="flex flex-1 flex-col items-center gap-4 sm:items-start">
                  <h3 className="text-[18px] font-semibold text-[var(--em-text)]">Télécharger l'APK</h3>
                  <p className="text-center text-[13px] leading-relaxed text-[var(--em-text-2)] sm:text-left">
                    Scannez le QR code avec votre téléphone Android, ou téléchargez directement le fichier.
                  </p>

                  <div className="w-full rounded-lg border border-[var(--em-border)] bg-[#F9F9F9] p-3 text-[12px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[var(--em-text)] truncate">{version.filename}</span>
                      <span className="shrink-0 rounded-full bg-[var(--em-accent-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--em-accent)]">
                        {version.size_mb} Mo
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--em-text-3)]">
                      Mis à jour le {new Date(version.modified_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <a
                    href={downloadUrl}
                    className="ecole_m-btn ecole_m-btn--primary w-full justify-center py-2.5 shadow-lg sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger l'APK
                  </a>

                  <button
                    type="button"
                    onClick={copyUrl}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--em-text-2)] hover:text-[var(--em-accent)]"
                  >
                    {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Lien copié" : "Copier le lien direct"}
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <p className="mb-3 text-[12px] font-semibold text-[var(--em-text-2)]">Bientôt disponible sur :</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--em-border)] bg-white px-3 py-1.5 opacity-60 grayscale">
                    <PlayCircle className="h-6 w-6 text-[#5D5D5D]" />
                    <div className="text-left">
                      <p className="text-[9px] font-bold uppercase text-[var(--em-text-2)]">Bientôt</p>
                      <p className="text-[12px] font-bold text-[var(--em-text)]">Google Play</p>
                    </div>
                  </div>
                  <div className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--em-border)] bg-white px-3 py-1.5 opacity-60 grayscale">
                    <Apple className="h-6 w-6 text-[#5D5D5D]" />
                    <div className="text-left">
                      <p className="text-[9px] font-bold uppercase text-[var(--em-text-2)]">Bientôt</p>
                      <p className="text-[12px] font-bold text-[var(--em-text)]">App Store</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Colonne droite : Aperçu Visuel ──────── */}
        <div className="flex flex-col bg-[#F9F9F9] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[var(--em-text)]">Aperçu de l'application</h3>
            <div className="flex rounded-lg border border-[var(--em-border)] bg-white p-1 shadow-sm">
              <button
                onClick={() => setActiveMedia('video')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${activeMedia === 'video' ? 'bg-[var(--em-accent)] text-white' : 'text-[var(--em-text-2)] hover:bg-[#F0F0F0]'}`}
              >
                <Play className="h-3.5 w-3.5" /> Vidéo
              </button>
              <button
                onClick={() => setActiveMedia('screens')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${activeMedia === 'screens' ? 'bg-[var(--em-accent)] text-white' : 'text-[var(--em-text-2)] hover:bg-[#F0F0F0]'}`}
              >
                <MonitorPlay className="h-3.5 w-3.5" /> Captures
              </button>
            </div>
          </div>

          <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto overflow-hidden rounded-[2rem] border-[8px] border-[var(--em-text)] bg-black shadow-2xl">
            <AnimatePresence mode="wait">
              {activeMedia === 'video' ? (
                <motion.video
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={videoApp}
                  controls
                  autoPlay
                  muted
                  loop
                  className="h-full w-full object-cover"
                  poster={visual1}
                />
              ) : (
                <motion.div
                  key="screens"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full w-full flex-col items-center justify-center bg-white p-4"
                >
                  <img src={visual3} alt="Aperçu 3" className="w-full rounded-md border border-gray-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
            <FeatureItem icon={BookOpen} label="Notes & Bulletins" />
            <FeatureItem icon={Wallet} label="Paiements" />
            <FeatureItem icon={CalendarClock} label="Emploi du temps" />
            <FeatureItem icon={BellRing} label="Notifications" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--em-border)] bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--em-accent-soft)] text-[var(--em-accent)]">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="text-[13px] font-semibold text-[var(--em-text)] leading-tight">{label}</span>
    </div>
  );
}