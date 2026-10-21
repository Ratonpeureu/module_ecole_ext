import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CircleCheckIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { TeleversementRegistreResultat } from "../../types/ui";
import { LIBELLES_RAPPORT } from "../../data/registres";
import { EASE_OUT } from "../eleves/EleveMotion";
import { formatNumber, humanize } from "../../utils/format";

export function RapportTeleversement({ rapport, onFermer }: {rapport: TeleversementRegistreResultat;onFermer: () => void;}) {
  const reduce = useReducedMotion();
  const app = rapport.application as Record<string, unknown>;
  const stats = Object.entries(app).filter(([, v]) => typeof v === "number");
  const anomalies = Array.isArray(app.anomalies) ? app.anomalies as string[] : [];

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: reduce ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -6 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="border-b border-[var(--em-border)] bg-[var(--em-accent-soft)] px-4 py-3">
      
      <div className="flex items-start gap-3">
        <CircleCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--em-accent)]" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13.5px] font-semibold">
            Registre enregistré — version {formatNumber(rapport.version)}
          </p>
          {stats.length > 0 &&
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px]">
              {stats.map(([k, v]) =>
            <div key={k} className="flex items-baseline gap-1.5">
                  <dt className="ecole_m-muted">{LIBELLES_RAPPORT[k] ?? humanize(k)}</dt>
                  <dd className="font-semibold tabular-nums">{formatNumber(v)}</dd>
                </div>
            )}
            </dl>
          }
          {anomalies.length > 0 &&
          <div className="rounded-md border border-[var(--em-warning)]/25 bg-[var(--em-warning-soft)] px-3 py-2 text-[12.5px] text-[var(--em-warning)]">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <TriangleAlertIcon className="h-3.5 w-3.5" aria-hidden />
                {anomalies.length} anomalie(s) ignorée(s)
              </p>
              <ul className="ecole_m-scroll max-h-28 list-disc space-y-0.5 overflow-y-auto pl-5">
                {anomalies.map((a, i) =>
              <li key={i}>{a}</li>
              )}
              </ul>
            </div>
          }
        </div>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le rapport"
          className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md outline-none transition-colors duration-150 hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]">
          
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>);

}