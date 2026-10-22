import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Rocket, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSchool } from "../../contexts/SchoolContext";
import {
  lancerSeedDemo,
  getSeedDemoStatut,
} from "../../lib/api_ecole";

const POLL_MS = 3000;
const MAX_DURATION_MS = 915 * 60 * 1000; // 15 min de sécurité

export function SeedDemoButton() {
  const { entreprise } = useSchool();
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [logTail, setLogTail] = useState<string[]>([]);
  const [state, setState] = useState<string>("");
  const pollRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // ── Cleanup polling au démontage
  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const poll = async (tid: string) => {
    try {
      const t = await getSeedDemoStatut(tid);
      const s = String(t.state || "").toUpperCase();
      setState(s);

      // Récupérer le log depuis meta (Redis) ou result (final)
      const tail =
        t.meta?.log_tail ||
        t.result?.log_tail ||
        null;
      if (tail && Array.isArray(tail)) {
        setLogTail(tail);
      }

      if (s === "SUCCESS") {
        stopPolling();
        setRunning(false);
        toast.success("Seed démo terminé ✨");
        return;
      }
      if (s === "FAILURE" || s === "FAILED" || t.error) {
        stopPolling();
        setRunning(false);
        toast.error(t.error || "Seed échoué — voir les logs");
        return;
      }

      // Sécurité : abandonner après MAX_DURATION_MS
      if (Date.now() - startRef.current > MAX_DURATION_MS) {
        stopPolling();
        setRunning(false);
        toast.error("Seed interrompu (timeout 15 min)");
        return;
      }

      pollRef.current = window.setTimeout(() => poll(tid), POLL_MS);
    } catch (e: any) {
      // En cas d'erreur réseau ponctuelle : on retente
      pollRef.current = window.setTimeout(() => poll(tid), POLL_MS);
    }
  };

  const lancer = async () => {
    if (running) return;
    setRunning(true);
    setLogTail([]);
    setState("STARTING");
    startRef.current = Date.now();

    try {
      const res = await lancerSeedDemo();
      setTaskId(res.task_id);
      toast.success("Seed démarré — suivi en cours…");
      poll(res.task_id);
    } catch (e: any) {
      toast.error(e?.message || "Impossible de démarrer le seed");
      setRunning(false);
      setState("ERROR");
    }
  };

  const arreter = () => {
    stopPolling();
    setRunning(false);
    setState("CANCELLED");
    toast("Suivi arrêté (le seed continue côté serveur)", { icon: "ℹ️" });
  };

  return (
    <div className="ecole_m-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-[var(--em-accent)]" />
            <span className="text-[14px] font-semibold">Seed démo complet</span>
            {state && (
              <span className="ecole_m-muted text-[11px] font-mono uppercase">
                {state}
              </span>
            )}
          </div>
          <p className="ecole_m-muted text-[12px] mt-1">
            Génère 16 classes, ~600 élèves, notes, paiements, EDT, bulletins,
            absences, discipline, transport, bibliothèque — sur l'année 2025-2026.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {running ? (
            <>
              <Button variant="subtle" size="sm" onClick={arreter}>
                <X className="h-4 w-4" /> Arrêter le suivi
              </Button>
              <Button variant="secondary" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" /> En cours…
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={lancer}>
              <Rocket className="h-4 w-4" /> Lancer le seed
            </Button>
          )}
        </div>
      </div>

      {logTail.length > 0 && (
        <pre className="text-[11px] leading-snug bg-[var(--em-surface)] border border-[var(--em-border)] p-3 rounded-md max-h-72 overflow-y-auto font-mono whitespace-pre-wrap break-all">
          {logTail.join("\n")}
        </pre>
      )}

      {taskId && !running && state === "SUCCESS" && (
        <p className="text-[12px] text-[var(--em-accent)] font-medium">
          ✓ Seed terminé. Rafraîchis la page pour voir les nouvelles données.
        </p>
      )}
    </div>
  );
}