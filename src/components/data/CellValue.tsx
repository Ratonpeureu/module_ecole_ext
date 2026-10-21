import React from "react";
import { Badge } from "../ui/Badge";
import { formatValue, isStatusKey, statusTone, valueLabel } from "../../utils/format";

const DASH = <span className="text-[#A0A0A0]" aria-label="Non renseigné">—</span>;

export function CellValue({ k, v }: { k: string; v: unknown }) {
  if (v === null || v === undefined || v === "") return DASH;

  if (typeof v === "boolean") return <Badge tone={v ? "success" : "neutral"}>{v ? "Oui" : "Non"}</Badge>;

  if (isStatusKey(k) && typeof v === "string") return <Badge tone={statusTone(v)}>{valueLabel(v)}</Badge>;

  if (Array.isArray(v)) {
    if (v.length === 0) return DASH;
    if (v.every((x) => x === null || typeof x !== "object")) {
      return (
        <span className="flex flex-wrap gap-1">
          {v.map((x, i) => (
            <span
              key={i}
              className="inline-flex h-6 items-center rounded-[5px] border border-black/[0.06] bg-[#F5F5F5] px-2 text-[12px] font-medium text-[#1A1A1A]">
              {valueLabel(String(x))}
            </span>
          ))}
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-[5px] bg-[var(--em-accent,#0067C0)]/[0.08] px-2 text-[12px] font-medium text-[var(--em-accent,#0067C0)]">
        <span className="tabular-nums">{v.length}</span> élément(s)
      </span>
    );
  }

  if (typeof v === "object") return <span className="text-[12.5px] font-medium text-[var(--em-accent,#0067C0)]">Voir le détail</span>;

  return <>{formatValue(k, v)}</>;
}