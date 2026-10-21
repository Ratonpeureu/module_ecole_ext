import React from "react";
import { num } from "../../utils/format";

export function RankBadge({ value, color }: { value: unknown; color: string }) {
  const n = num(value);
  if (n == null) return <span className="ecole_m-muted">—</span>;
  const podium = n <= 3;
  return (
    <span
      className="inline-grid h-7 min-w-[28px] place-items-center rounded-full px-2 text-[12px] font-semibold tabular-nums"
      style={podium ? { background: color, color: "#fff" } : { background: `color-mix(in srgb, ${color} 10%, transparent)`, color }}>
      {n}
    </span>
  );
}