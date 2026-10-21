import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2Icon,
  PinOffIcon,
  PinIcon,
  UserRoundIcon,
  SettingsIcon,
  LogOutIcon,
  RotateCcwIcon,
} from "lucide-react";
import { modules } from "../../data/modules";
import type { ModuleDef } from "../../data/modules";
import { useSchool } from "../../contexts/SchoolContext";
import { useAuth } from "@/lib/auth";
import { Select } from "../ui/Select";
import { StartMenu } from "./StartMenu";
import { initials, str } from "../../utils/format";

function isActive(m: ModuleDef, path: string) {
  if (m.path === "/") {
    return path === "/" || path === "";
  }
  return path.startsWith(m.path);
}

const STORAGE_KEY = "ecole_taskbar_pinned";

// Valeurs par défaut (ex: Accueil, Élèves, Notes, etc.)
const DEFAULT_PINNED = modules.filter((m) => m.pinned).map((m) => m.path);

const TASK_BTN =
  "group relative grid h-11 w-11 shrink-0 place-items-center rounded-[6px] outline-none " +
  "transition-[background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "hover:bg-white/70 active:scale-[0.92] focus-visible:ring-2 focus-visible:ring-[var(--em-accent,#0067C0)] " +
  "data-[active=true]:bg-white/85 data-[active=true]:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.08)]";

const TIP =
  "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[6px] " +
  "border border-black/[0.08] bg-[#F9F9F9]/95 px-2.5 py-1 text-[12px] font-medium text-[#1A1A1A] opacity-0 " +
  "shadow-[0_8px_16px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-[opacity,transform] duration-150 ease-out " +
  "group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div
      className="hidden rounded-[6px] px-2.5 py-1 text-right leading-tight text-[#1A1A1A] transition-colors duration-150 hover:bg-white/70 md:block"
      aria-label="Date et heure"
    >
      <p className="text-[12px] font-semibold tabular-nums">
        {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className="text-[11.5px] tabular-nums text-[#5D5D5D]">
        {now.toLocaleDateString("fr-FR")}
      </p>
    </div>
  );
}

function StartGlyph({ open }: { open: boolean }) {
  return (
    <motion.span
      className="grid grid-cols-2 gap-[2px]"
      aria-hidden="true"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      {[1, 0.85, 0.85, 0.7].map((o, i) => (
        <span
          key={i}
          className="h-[9px] w-[9px] rounded-[2px] bg-[var(--em-accent,#0067C0)]"
          style={{ opacity: o }}
        />
      ))}
    </motion.span>
  );
}

function ActivePill() {
  return (
    <motion.span
      layoutId="ecole-taskbar-pill"
      aria-hidden="true"
      className="absolute bottom-[3px] left-[calc(50%-8px)] h-[3px] w-4 rounded-full bg-[var(--em-accent,#0067C0)]"
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    />
  );
}

export function Taskbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { entreprise, logout } = useAuth();
  const [startOpen, setStartOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { annees, anneeId, setAnneeId, entreprise: schoolEntreprise } = useSchool();

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ── INITIALISATION SÉCURISÉE ──
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Si on a des icônes, on les garde. Si c'est vide ([]), on passe aux défauts.
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    // Si aucune sauvegarde valide : on charge les défauts
    return DEFAULT_PINNED;
  });

  const togglePin = (path: string) => {
    setPinned((prev) => {
      const next = prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // ── FONCTION : RESTAURER LES DÉFAUTS ──
  const resetPinned = () => {
    setPinned(DEFAULT_PINNED);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PINNED));
    } catch {}
  };

  // Menu contextuel (clic droit sur les icônes)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu contextuel global (clic droit sur la barre de tâches vide)
  const [barCtxMenu, setBarCtxMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setCtxMenu(null);
      setBarCtxMenu(null);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    setStartOpen(false);
    setCtxMenu(null);
    setBarCtxMenu(null);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (profileMenuRef.current?.contains(e.target as Node)) return;
      setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  // Calcul des modules à afficher
  const activePinned = pinned.length > 0 ? pinned : DEFAULT_PINNED;
  const pinnedModules = modules.filter((m) => activePinned.includes(m.path));
  const current = modules.find((m) => isActive(m, pathname));
  
  const items =
    current && !activePinned.includes(current.path)
      ? [...pinnedModules, current]
      : pinnedModules;

  const name = entreprise?.nom || entreprise?.email || "Mon compte";
  const shortInitials = initials(name) || "?";

  return (
    <>
      <StartMenu
        open={startOpen}
        onClose={() => setStartOpen(false)}
        pinned={pinned}
        onTogglePin={togglePin}
      />

      {/* Menu contextuel des icônes */}
      <AnimatePresence>
        {ctxMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[100] min-w-[200px] rounded-lg border border-[var(--em-border)] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            style={{
              left: Math.min(ctxMenu.x, window.innerWidth - 220),
              top: Math.min(ctxMenu.y, window.innerHeight - 100),
            }}
          >
            <button
              type="button"
              onClick={() => { togglePin(ctxMenu.path); setCtxMenu(null); }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[var(--em-accent-soft)] hover:text-[var(--em-accent)]"
            >
              {pinned.includes(ctxMenu.path) ? (
                <><PinOffIcon className="h-4 w-4" /> Détacher de la barre</>
              ) : (
                <><PinIcon className="h-4 w-4" /> Épingler à la barre</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu contextuel global (clic droit sur la barre) */}
      <AnimatePresence>
        {barCtxMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[100] min-w-[220px] rounded-lg border border-[var(--em-border)] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            style={{
              left: Math.min(barCtxMenu.x, window.innerWidth - 240),
              top: Math.min(barCtxMenu.y, window.innerHeight - 100),
            }}
          >
            <button
              type="button"
              onClick={() => { resetPinned(); setBarCtxMenu(null); }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[var(--em-accent-soft)] hover:text-[var(--em-accent)]"
            >
              <RotateCcwIcon className="h-4 w-4" /> Restaurer les icônes par défaut
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        onContextMenu={(e) => {
          // Si on fait un clic droit sur le fond de la barre (pas sur une icône)
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setBarCtxMenu({ x: e.clientX, y: e.clientY - 60 });
          }
        }}
        className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-black/[0.07] bg-[#F3F3F3]/80 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl backdrop-saturate-150"
        aria-label="Barre des tâches"
      >
        <div className="flex h-full items-center gap-3 px-3 pointer-events-auto">
          <div className="hidden min-w-0 flex-1 items-center gap-2.5 xl:flex">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[var(--em-accent,#0067C0)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.12)]">
              <Building2Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold text-[#1A1A1A]">
                {schoolEntreprise?.nom || "Mon établissement"}
              </p>
              {current && (
                <p className="truncate text-[11.5px] text-[#5D5D5D]">{current.label}</p>
              )}
            </div>
          </div>

          <div 
            className="ecole_m-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:justify-center lg:overflow-visible xl:flex-none"
            onContextMenu={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
                setBarCtxMenu({ x: e.clientX, y: e.clientY - 60 });
              }
            }}
          >
            <button
              type="button"
              className={TASK_BTN}
              data-active={startOpen}
              aria-label="Démarrer"
              aria-expanded={startOpen}
              onClick={() => setStartOpen((o) => !o)}
            >
              <StartGlyph open={startOpen} />
              <span className={TIP}>Démarrer</span>
            </button>

            <span className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" aria-hidden="true" />

            <AnimatePresence mode="popLayout">
              {items.map((m) => {
                const active = isActive(m, pathname);
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.path}
                    layoutId={`taskbar-${m.path}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCtxMenu({ x: e.clientX, y: e.clientY - 40, path: m.path });
                    }}
                  >
                    <Link
                      to={m.path}
                      className={TASK_BTN}
                      data-active={active}
                      aria-label={m.label}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className="grid h-8 w-8 place-items-center rounded-[7px] transition-transform duration-150 ease-out group-hover:-translate-y-[1px]"
                        style={{
                          background: active ? `${m.color}29` : `${m.color}17`,
                        }}
                      >
                        <Icon
                          className="h-[19px] w-[19px]"
                          style={{ color: m.color }}
                          strokeWidth={2.1}
                          aria-hidden="true"
                        />
                      </span>
                      {active && <ActivePill />}
                      <span className={TIP}>{m.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 xl:flex-1">
            {annees.length > 0 && (
              <div className="w-[150px] sm:w-[180px]">
                <Select
                  compact
                  ariaLabel="Année scolaire"
                  value={anneeId}
                  onChange={(v) => setAnneeId(String(v))}
                  options={annees.map((a) => ({
                    value: str(a.id),
                    label: str(a.libelle),
                    hint: a.est_active ? "Active" : undefined,
                  }))}
                  searchable={false}
                />
              </div>
            )}
            <Clock />

            {/* Bouton Profil + Menu Déconnexion */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className={TASK_BTN}
                data-active={profileMenuOpen}
                aria-label="Ouvrir le menu du profil"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full bg-[var(--em-accent,#0067C0)] text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.12)] transition-transform duration-150 group-hover:scale-105"
                  aria-hidden
                >
                  {shortInitials}
                </span>
                <span className={TIP}>Mon profil</span>
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    role="menu"
                    aria-label="Menu du profil"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute bottom-full right-0 z-[100] mb-2 w-[280px] overflow-hidden rounded-xl border border-[var(--em-border)] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
                  >
                    <div className="flex items-center gap-3 border-b border-[var(--em-border)] bg-[#F9F9F9] p-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--em-accent,#0067C0)] text-[15px] font-semibold text-white" aria-hidden>
                        {shortInitials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-[#1A1A1A]">{name}</p>
                        {entreprise?.email && (
                          <p className="truncate text-[11.5px] text-[#5D5D5D]">{entreprise.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-1">
                      <Link
                        to="/profil"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-[var(--em-surface-2)]"
                      >
                        <UserRoundIcon className="h-4 w-4" aria-hidden />
                        Mon profil
                      </Link>
                      <Link
                        to="/parametres"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-[var(--em-surface-2)]"
                      >
                        <SettingsIcon className="h-4 w-4" aria-hidden />
                        Paramètres
                      </Link>
                    </div>

                    <div className="h-px bg-[var(--em-border)]" />

                    <div className="p-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--em-danger)] transition-colors hover:bg-[var(--em-danger-soft)]"
                      >
                        <LogOutIcon className="h-4 w-4" aria-hidden />
                        Se déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}