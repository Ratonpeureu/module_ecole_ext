import { useCallback, useEffect, useRef, useState } from "react";
import type { CellValue, Workbook } from "exceljs";
import { telechargerRegistreClasse, televerserRegistreClasse } from "../lib/api_ecole";
import type { TeleversementRegistreResultat, TypeRegistre } from "../types/ui";
import type { ModificationCellule } from "../types/tableur";
import { MoteurFormules } from "../utils/formules";
import { chargerClasseur, exporterClasseur, feuilleActive, feuillesVisibles } from "../utils/xlsx";
import { errorMessage } from "../utils/errors";
import { saveFile } from "../utils/files";

type EtatClasseur = "chargement" | "pret" | "erreur";

const SEP = "\u0000";
const cle = (f: string, l: number, c: number) => `${f}${SEP}${l}:${c}`;
const meme = (a: CellValue | undefined, b: CellValue | undefined) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export function useRegistreClasseur(classeId: string, type: TypeRegistre) {
  const wbRef = useRef<Workbook | null>(null);
  const moteurRef = useRef<MoteurFormules | null>(null);
  const requete = useRef(0);
  const originaux = useRef(new Map<string, CellValue>());
  const pileAnnuler = useRef<ModificationCellule[][]>([]);
  const pileRetablir = useRef<ModificationCellule[][]>([]);

  const [etat, setEtat] = useState<EtatClasseur>("chargement");
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState("");
  const [feuilles, setFeuilles] = useState<string[]>([]);
  const [feuille, setFeuille] = useState("");
  const [revision, setRevision] = useState(0);
  const [nbModifs, setNbModifs] = useState(0);
  const [peutAnnuler, setPeutAnnuler] = useState(false);
  const [peutRetablir, setPeutRetablir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [rapport, setRapport] = useState<TeleversementRegistreResultat | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  const majPiles = () => {
    setPeutAnnuler(pileAnnuler.current.length > 0);
    setPeutRetablir(pileRetablir.current.length > 0);
  };

  const charger = useCallback(async () => {
    const id = ++requete.current;
    setEtat("chargement");
    setErreur(null);
    try {
      const f = await telechargerRegistreClasse(classeId, type);
      const wb = await chargerClasseur(f.blob);
      if (id !== requete.current) return;
      wbRef.current = wb;
      moteurRef.current = new MoteurFormules(wb);
      const noms = feuillesVisibles(wb);
      const actif = feuilleActive(wb);
      setFeuilles(noms);
      setFeuille((prev) => (noms.includes(prev) ? prev : actif && noms.includes(actif) ? actif : noms[0] ?? ""));
      setNomFichier(f.filename);
      originaux.current = new Map();
      pileAnnuler.current = [];
      pileRetablir.current = [];
      setNbModifs(0);
      majPiles();
      setRevision((r) => r + 1);
      setEtat("pret");
    } catch (e) {
      if (id !== requete.current) return;
      setErreur(errorMessage(e));
      setEtat("erreur");
    }
  }, [classeId, type]);

  useEffect(() => {
    setRapport(null);
    setErreurEnvoi(null);
    void charger();
  }, [charger]);

  useEffect(() => {
    if (!nbModifs) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [nbModifs]);

  const appliquer = useCallback((mods: ModificationCellule[]): ModificationCellule[] => {
    const wb = wbRef.current;
    if (!wb) return [];
    const inverses: ModificationCellule[] = [];
    mods.forEach((m) => {
      const ws = wb.getWorksheet(m.feuille);
      if (!ws) return;
      const cell = ws.getCell(m.ligne, m.colonne);
      const avant = cell.value;
      if (meme(avant, m.valeur)) return;
      inverses.push({ ...m, valeur: avant });
      cell.value = m.valeur;
      const k = cle(m.feuille, m.ligne, m.colonne);
      if (!originaux.current.has(k)) originaux.current.set(k, avant);
      else if (meme(originaux.current.get(k), m.valeur)) originaux.current.delete(k);
    });
    if (inverses.length) {
      moteurRef.current?.invalider();
      setNbModifs(originaux.current.size);
      setRevision((r) => r + 1);
    }
    return inverses;
  }, []);

  const ecrire = useCallback(
    (mods: ModificationCellule[]) => {
      const inv = appliquer(mods);
      if (!inv.length) return;
      pileAnnuler.current.push(inv.reverse());
      pileRetablir.current = [];
      majPiles();
    },
    [appliquer]
  );

  const annuler = useCallback(() => {
    const g = pileAnnuler.current.pop();
    if (!g) return;
    pileRetablir.current.push(appliquer(g).reverse());
    majPiles();
  }, [appliquer]);

  const retablir = useCallback(() => {
    const g = pileRetablir.current.pop();
    if (!g) return;
    pileAnnuler.current.push(appliquer(g).reverse());
    majPiles();
  }, [appliquer]);

  const cellulesModifiees = useCallback((nomFeuille: string): Set<string> => {
    const out = new Set<string>();
    const prefixe = `${nomFeuille}${SEP}`;
    originaux.current.forEach((_, k) => {
      if (k.startsWith(prefixe)) out.add(k.slice(prefixe.length));
    });
    return out;
  }, []);

  const envoyer = useCallback(
    async (fichier: () => Promise<File>) => {
      setEnvoi(true);
      setErreurEnvoi(null);
      setRapport(null);
      try {
        const f = await fichier();
        const r = await televerserRegistreClasse(classeId, type, f);
        setRapport(r);
        await charger();
      } catch (e) {
        setErreurEnvoi(errorMessage(e));
      } finally {
        setEnvoi(false);
      }
    },
    [classeId, type, charger]
  );

  const enregistrer = useCallback(() => {
    const wb = wbRef.current;
    if (!wb) return Promise.resolve();
    return envoyer(() => exporterClasseur(wb, nomFichier || `registre_${type}.xlsx`));
  }, [envoyer, nomFichier, type]);

  const televerserFichier = useCallback((f: File) => envoyer(async () => f), [envoyer]);

  const telecharger = useCallback(async () => {
    saveFile(await telechargerRegistreClasse(classeId, type));
  }, [classeId, type]);

  return {
    etat,
    erreur,
    classeur: wbRef.current,
    moteur: moteurRef.current,
    nomFichier,
    feuilles,
    feuille,
    setFeuille,
    revision,
    nbModifs,
    cellulesModifiees,
    ecrire,
    annuler,
    retablir,
    peutAnnuler,
    peutRetablir,
    charger,
    enregistrer,
    televerserFichier,
    telecharger,
    envoi,
    rapport,
    fermerRapport: () => setRapport(null),
    erreurEnvoi,
    fermerErreurEnvoi: () => setErreurEnvoi(null)
  };
}
