import React from "react";
import { initials } from "../../utils/format";

interface PersonCellProps {
  name: string;
  hint?: string;
  color: string;
}

export function PersonCell({ name, hint, color }: PersonCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
        {initials(name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        {hint ? <span className="ecole_m-muted block truncate text-[12px]">{hint}</span> : null}
      </span>
    </span>
  );
}