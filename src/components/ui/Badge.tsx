import React from "react";
import type { Tone } from "../../utils/format";

export function Badge({ tone = "neutral", children }: {tone?: Tone;children: React.ReactNode;}) {
  return <span className={`ecole_m-badge ecole_m-badge--${tone}`}>{children}</span>;
}