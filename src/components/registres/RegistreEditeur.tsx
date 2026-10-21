import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon, CalendarCheckIcon, FolderOpenIcon, InfoIcon, LoaderCircleIcon, PenLineIcon, RefreshCwIcon, TriangleAlertIcon, WalletIcon, XIcon, LucideIcon } from "lucide-react";
import { RegistreClasseStatut, TypeRegistre } from "../../types/ui";
import { CelluleRef, CibleCollage } from "../../types/tableur";
import { ORDRE_REGISTRES, TYPE_REGISTRE } from "../../data/registres";
import { useRegistreClasseur } from "../../hooks/useRegistreClasseur";
import { affichageCellule, lettreColonne, lignesFigees, parserSaisie, texteSaisie } from "../../utils/xlsx";
import { formatDateTime, formatNumber } from "../../utils/format";
import { FluentTabs, FluentTab } from "../ui/FluentTabs";
import { Select } from "../ui/Select";
import { EASE_OUT } from "../eleves/EleveMotion";
import { BarreFormule } from "./BarreFormule";
import { ContexteLigne } from "./ContexteLigne";
import { FeuilleOnglets } from "./FeuilleOnglets";
import { LegendeColonnes } from "./LegendeColonnes";
import { RapportTeleversement } from "./RapportTeleversement";
import { RegistreBarreOutils } from "./RegistreBarreOutils";
import { TableurGrille } from "./TableurGrille";
const ICONES: Record<TypeRegistre, LucideIcon> = {
  appels: CalendarCheckIcon,
  notes: PenLineIcon,
  finance: WalletIcon,
  dossier: FolderOpenIcon
};
const ONGLETS: FluentTab[] = ORDRE_REGISTRES.map((t) => ({
  id: t,
  label: TYPE_REGISTRE[t],
  icon: ICONES[t]
}));
interface RegistreEditeurProps {
  classeId: string;
  type: TypeRegistre;
  classes: RegistreClasseStatut[];
  accent: string;
  onChanger: (classeId: string, type: TypeRegistre) => void;
  onFermer: () => void;
  onStatutChange: () => void;
}
export function RegistreEditeur({
  classeId,
  type,
  classes,
  accent,
  onChanger,
  onFermer,
  onStatutChange
}: RegistreEditeurProps) {
  const r = useRegistreClasseur(classeId, type);
  const reduce = useReducedMotion();
  const [selection, setSelection] = useState<CelluleRef | null>(null);
  const [recherche, setRecherche] = useState("");
  const [afficherMasquees, setAfficherMasquees] = useState(false);
  const [bandeau, setBandeau] = useState<string | null>(null);
  const ws = r.etat === "pret" && r.classeur ? r.classeur.getWorksheet(r.feuille) ?? null : null;
  const moteur = r.moteur;
  const classe = classes.find((c) => c.classe_id === classeId);
  const info = classe?.registres[type] ?? null;
  useEffect(() => {
    setSelection(null);
    setRecherche("");
  }, [r.feuille, classeId, type]);
  useEffect(() => {
    setBandeau(null);
  }, [classeId, type]);
  useEffect(() => {
    if (r.rapport) onStatutChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.rapport]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (r.nbModifs > 0 && !r.envoi) void r.enregistrer();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [r]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modifiees = useMemo(() => r.cellulesModifiees(r.feuille), [r.feuille, r.revision, r.cellulesModifiees]);
  const garde = (action: () => void) => {
    if (r.nbModifs > 0 && !window.confirm(`${r.nbModifs} modification(s) non enregistrée(s) seront perdues. Continuer ?`)) return;
    action();
  };
  const ecrireTexte = (ligne: number, colonne: number, texte: string) => {
    if (!ws) return;
    r.ecrire([{
      feuille: ws.name,
      ligne,
      colonne,
      valeur: parserSaisie(texte, ws.getCell(ligne, colonne).value)
    }]);
  };
  const effacer = (cellules: CelluleRef[]) => {
    if (!ws) return;
    r.ecrire(cellules.map((c) => ({
      feuille: ws.name,
      ligne: c.ligne,
      colonne: c.colonne,
      valeur: null
    })));
  };
  const coller = (cibles: CibleCollage[]) => {
    if (!ws) return;
    r.ecrire(cibles.map((c) => ({
      feuille: ws.name,
      ligne: c.ligne,
      colonne: c.colonne,
      valeur: parserSaisie(c.texte, ws.getCell(c.ligne, c.colonne).value)
    })));
  };
  const adresse = selection ? `${lettreColonne(selection.colonne)}${selection.ligne}` : "";
  const texteSel = ws && selection ? texteSaisie(ws.getCell(selection.ligne, selection.colonne).value) : "";
  const entete = ws && moteur && selection && selection.ligne > 1 && lignesFigees(ws) >= 1 ? affichageCellule(ws, moteur, 1, selection.colonne).texte : "";
  return <div className="flex h-[calc(100vh-190px)] min-h-[560px] flex-col overflow-hidden rounded-xl border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* ── En-tête : classe, type de registre, version ─────────── */}
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--em-border)] px-3 py-2.5">
        <button type="button" onClick={() => garde(onFermer)} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium outline-none transition-colors duration-150 hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Registres
        </button>
        <span className="h-5 w-px bg-[var(--em-border)]" aria-hidden />
        <div className="w-[180px]">
          <Select compact ariaLabel="Classe" value={classeId} onChange={(v) => {
          const id = String(v);
          if (id !== classeId) garde(() => onChanger(id, type));
        }} options={classes.map((c) => ({
          value: c.classe_id,
          label: c.libelle
        }))} searchable />
        </div>
        <div className="min-w-0">
          <FluentTabs tabs={ONGLETS} value={type} onChange={(id) => {
          if (id !== type) garde(() => onChanger(classeId, id as TypeRegistre));
        }} idPrefix="registre" label="Type de registre" accent={accent} />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5D5D5D]">
          {info ? <>
              <span className="font-medium tabular-nums">Version {formatNumber(info.version)}</span>
              {info.derniere_synchro && <span>Synchronisé le {formatDateTime(info.derniere_synchro)}</span>}
              {info.modifie_par && <span className="inline-flex items-center gap-1.5" title={info.modifie_par_le ? formatDateTime(info.modifie_par_le) : undefined}>
                  <span className="h-2 w-2 rounded-full bg-[#D97706]" aria-hidden />
                  Modifié par {info.modifie_par}
                </span>}
            </> : <span>Nouveau registre</span>}
        </div>
      </header>

      <RegistreBarreOutils classeId={classeId} type={type} pret={r.etat === "pret"} nbModifs={r.nbModifs} envoi={r.envoi} peutAnnuler={r.peutAnnuler} peutRetablir={r.peutRetablir} recherche={recherche} afficherMasquees={afficherMasquees} onEnregistrer={() => void r.enregistrer()} onAnnuler={r.annuler} onRetablir={r.retablir} onAbandonner={() => {
      if (window.confirm(`Abandonner ${r.nbModifs} modification(s) et recharger le registre ?`)) void r.charger();
    }} onRecharger={() => garde(() => void r.charger())} onTelecharger={r.telecharger} onTeleverser={(f) => garde(() => void r.televerserFichier(f))} onSynchronise={() => {
      void r.charger();
      onStatutChange();
    }} onRecherche={setRecherche} onAfficherMasquees={setAfficherMasquees} />

      <BarreFormule adresse={adresse} entete={entete} texte={texteSel} actif={!!selection && !!ws && !r.envoi} onValider={(t) => selection && ecrireTexte(selection.ligne, selection.colonne, t)} />

      {ws && moteur && selection && <ContexteLigne key={`${ws.name}-${selection.ligne}-${r.revision}`} type={type} ws={ws} moteur={moteur} ligne={selection.ligne} revision={r.revision} onAction={(m) => {
      setBandeau(m);
      onStatutChange();
    }} />}

      <AnimatePresence initial={false}>
        {r.rapport && <RapportTeleversement key="rapport" rapport={r.rapport} onFermer={r.fermerRapport} />}
        {r.erreurEnvoi && <motion.div key="erreur" role="alert" initial={{
        opacity: 0,
        y: reduce ? 0 : -6
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: reduce ? 0 : -6
      }} transition={{
        duration: 0.2,
        ease: EASE_OUT
      }} className="flex items-start gap-3 border-b border-[var(--em-warning)]/25 bg-[var(--em-warning-soft)] px-4 py-3 text-[13px] text-[var(--em-warning)]">
            <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="flex-1 whitespace-pre-line">{r.erreurEnvoi}</p>
            <button type="button" onClick={r.fermerErreurEnvoi} aria-label="Fermer" className="grid h-6 w-6 place-items-center rounded transition-colors duration-150 hover:bg-black/[0.06]">
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </motion.div>}
        {bandeau && <motion.div key="bandeau" role="status" initial={{
        opacity: 0,
        y: reduce ? 0 : -6
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: reduce ? 0 : -6
      }} transition={{
        duration: 0.2,
        ease: EASE_OUT
      }} className="flex flex-wrap items-center gap-3 border-b border-[var(--em-border)] bg-[var(--em-accent-soft)] px-4 py-2.5 text-[13px]">
            <InfoIcon className="h-4 w-4 shrink-0 text-[var(--em-accent)]" aria-hidden />
            <p className="min-w-0 flex-1">{bandeau}</p>
            <button type="button" onClick={() => garde(() => {
          setBandeau(null);
          void r.charger();
        })} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--em-accent)] px-2.5 text-[12.5px] font-medium text-white transition-opacity duration-150 hover:opacity-90">
              <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />
              Recharger
            </button>
            <button type="button" onClick={() => setBandeau(null)} aria-label="Fermer" className="grid h-6 w-6 place-items-center rounded transition-colors duration-150 hover:bg-black/[0.06]">
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </motion.div>}
      </AnimatePresence>

      {/* ── Feuille ──────────────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1">
        {r.etat === "chargement" && <div className="absolute inset-0 z-40 grid place-items-center bg-[var(--em-surface,#ffffff)]/70 backdrop-blur-[2px]">
            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] px-4 py-2.5 text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <LoaderCircleIcon className="h-4 w-4 animate-spin text-[var(--em-accent)]" aria-hidden />
              Ouverture du classeur…
            </div>
          </div>}
        {r.etat === "erreur" && <div className="grid h-full place-items-center px-6">
            <div className="max-w-md text-center">
              <TriangleAlertIcon className="mx-auto h-8 w-8 text-[var(--em-warning)]" aria-hidden />
              <p className="mt-3 text-[15px] font-semibold">Impossible d'ouvrir ce registre</p>
              <p className="ecole_m-muted mt-1 whitespace-pre-line text-[13px]">{r.erreur}</p>
              <button type="button" onClick={() => void r.charger()} className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--em-accent)] px-3 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90">
                <RefreshCwIcon className="h-4 w-4" aria-hidden />
                Réessayer
              </button>
            </div>
          </div>}
        {ws && moteur && <TableurGrille ws={ws} moteur={moteur} revision={r.revision} recherche={recherche} afficherMasquees={afficherMasquees} selection={selection} onSelection={setSelection} onValider={ecrireTexte} onEffacer={effacer} onColler={coller} onAnnuler={r.annuler} onRetablir={r.retablir} modifiees={modifiees} />}
      </div>

      {/* ── Pied : feuilles, état ───────────────────────────────── */}
      <footer className="flex items-start gap-3 border-t border-[var(--em-border)] bg-black/[0.02] pr-3">
        <FeuilleOnglets feuilles={r.feuilles} valeur={r.feuille} onChange={r.setFeuille} />
        <div className="flex shrink-0 items-center gap-3 py-2 text-[11.5px] text-[#5D5D5D]">
          {ws && <span className="tabular-nums">{formatNumber(ws.rowCount)} ligne(s)</span>}
          {r.nbModifs > 0 && <span className="font-medium tabular-nums text-[var(--em-accent)]">{r.nbModifs} modification(s) non enregistrée(s)</span>}
          <span className="hidden lg:inline">Double-clic ou F2 pour modifier</span>
          <LegendeColonnes />
        </div>
      </footer>
    </div>;
}