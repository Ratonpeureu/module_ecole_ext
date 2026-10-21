import React from "react";

export interface StatItem {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger" | "accent";
}

const TONE: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "",
  success: "text-[var(--em-success)]",
  danger: "text-[var(--em-danger)]",
  accent: "text-[var(--em-accent)]"
};

export function StatGrid({ items }: {items: StatItem[];}) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-[var(--em-surface-2)] p-4 sm:grid-cols-3">
      {items.map((s) =>
      <div key={s.label} className="min-w-0">
          <dt className="ecole_m-muted truncate text-[12px]">{s.label}</dt>
          <dd className={`mt-0.5 truncate text-[16px] font-semibold ${TONE[s.tone ?? "default"]}`}>{s.value}</dd>
        </div>
      )}
    </dl>);

}