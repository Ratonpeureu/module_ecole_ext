import React from "react";
import { motion } from "framer-motion";
import { CalendarXIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";
import type { Row } from "../../types/ui";
import { str, valueLabel } from "../../utils/format";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const PALETTE = ["#0067C0", "#0F7B6C", "#8764B8", "#CA5010", "#C239B3", "#107C10", "#0099BC", "#E74856", "#4F6BED", "#8E562E"];

function colorFor(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function EdtGrid({ grille }: { grille: Record<string, unknown> }) {
  const keys = Object.keys(grille)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b))
    .filter((k) => Number(k) < 6 || (Array.isArray(grille[k]) && (grille[k] as unknown[]).length > 0));

  if (keys.length === 0)
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-black/[0.04] text-[#8A8A8A]">
          <CalendarXIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-[13.5px] text-[#5D5D5D]">Aucun créneau.</p>
      </div>
    );

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="ecole_m-scroll overflow-x-auto p-3">
      <div className="grid min-w-[760px] gap-2.5" style={{ gridTemplateColumns: `repeat(${keys.length}, minmax(0, 1fr))` }}>
        {keys.map((k) => {
          const slots = Array.isArray(grille[k]) ? (grille[k] as Row[]) : [];
          const isToday = Number(k) === todayIdx;
          return (
            <div
              key={k}
              className={`flex min-w-0 flex-col rounded-[10px] p-1.5 ${
                isToday ? "bg-[var(--em-accent,#0067C0)]/[0.06] ring-1 ring-[var(--em-accent,#0067C0)]/20" : "bg-[#F9F9F9]"
              }`}>
              <div className="mb-1.5 flex items-center justify-between gap-2 px-2 py-1.5">
                <h4 className={`text-[13px] font-semibold ${isToday ? "text-[var(--em-accent,#0067C0)]" : "text-[#1A1A1A]"}`}>
                  {DAYS[Number(k)] ?? `Jour ${k}`}
                </h4>
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                    isToday ? "bg-[var(--em-accent,#0067C0)] text-white" : "bg-black/[0.06] text-[#5D5D5D]"
                  }`}>
                  {slots.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                {slots.length === 0 && (
                  <div className="grid flex-1 place-items-center rounded-[8px] border border-dashed border-black/[0.12] px-3 py-5 text-[12.5px] text-[#8A8A8A]">
                    Libre
                  </div>
                )}
                {slots.map((c, i) => {
                  const title = str(c.matiere) || valueLabel(str(c.type)) || "Créneau";
                  const color = colorFor(title);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i, 6) * 0.04, ease: [0.23, 1, 0.32, 1] }}
                      className="relative overflow-hidden rounded-[8px] border bg-white py-2.5 pl-3.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      style={{ borderColor: `${color}2E` }}>
                      <span className="absolute inset-y-2 left-1 w-[3px] rounded-full" style={{ background: color }} aria-hidden="true" />
                      <p className="flex items-center gap-1.5 text-[12px] font-semibold tabular-nums" style={{ color }}>
                        <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {str(c.heure_debut)} – {str(c.heure_fin)}
                      </p>
                      <p className="mt-1 truncate text-[13.5px] font-semibold text-[#1A1A1A]">{title}</p>
                      {c.classe !== undefined && (
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-[#5D5D5D]">
                          <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{str(c.classe)}</span>
                        </p>
                      )}
                      {str(c.salle) && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[#5D5D5D]">
                          <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{str(c.salle)}</span>
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}