import React from "react";
import { motion } from "framer-motion";
import type { Column, Row } from "../../types/ui";
import { humanize, isHiddenKey } from "../../utils/format";
import { CellValue } from "./CellValue";

interface DataTableProps {
  rows: Row[];
  columns?: Column[];
  onRowClick?: (row: Row) => void;
  selectedKey?: string | null;
  rowKey?: (row: Row, index: number) => string;
  rowActions?: (row: Row) => React.ReactNode;
  compact?: boolean;
}

function autoColumns(rows: Row[]): Column[] {
  const first = rows[0] ?? {};
  return Object.keys(first)
    .filter((k) => {
      if (isHiddenKey(k) || k.endsWith("_b64")) return false;
      const v = first[k];
      return !(v && typeof v === "object" && !Array.isArray(v));
    })
    .slice(0, 7)
    .map((key) => ({ key }));
}

export function DataTable({ rows, columns, onRowClick, selectedKey, rowKey, rowActions, compact }: DataTableProps) {
  const cols = columns ?? autoColumns(rows);
  const keyOf = (r: Row, i: number) => (rowKey ? rowKey(r, i) : String(r.id ?? i));

  const cellPad = compact ? "px-3 py-2" : "px-4 py-3";
  const headPad = compact ? "px-3 py-2" : "px-4 py-2.5";

  return (
    <div className="flex flex-col">
      <div className="ecole_m-scroll overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  style={{ textAlign: c.align ?? "left" }}
                  className={`sticky top-0 z-[1] whitespace-nowrap border-b border-black/[0.06] bg-[#F9F9F9]/95 text-[12px] font-semibold text-[#5D5D5D] backdrop-blur ${headPad}`}>
                  {c.label ?? humanize(c.key)}
                </th>
              ))}
              {rowActions && (
                <th scope="col" className={`sticky top-0 z-[1] w-px border-b border-black/[0.06] bg-[#F9F9F9]/95 backdrop-blur ${headPad}`}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const k = keyOf(r, i);
              const selected = selectedKey === k;
              const clickable = !!onRowClick;
              return (
                <motion.tr
                  key={k}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03, ease: [0.23, 1, 0.32, 1] }}
                  data-clickable={clickable}
                  data-selected={selected}
                  aria-selected={clickable ? selected : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable ? () => onRowClick!(r) : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && e.key === "Enter") onRowClick(r);
                  }}
                  className={[
                    "group outline-none transition-[background-color] duration-150",
                    "focus-visible:bg-[var(--em-accent,#0067C0)]/[0.06]",
                    clickable ? "cursor-pointer" : "",
                    selected
                      ? "bg-[var(--em-accent,#0067C0)]/[0.08]"
                      : clickable
                        ? "hover:bg-black/[0.03] active:bg-black/[0.05]"
                        : ""
                  ].join(" ")}>
                  {cols.map((c, ci) => (
                    <td
                      key={c.key}
                      style={{ textAlign: c.align ?? "left" }}
                      className={`relative border-b border-black/[0.045] align-middle text-[13.5px] text-[#1A1A1A] group-last:border-b-0 ${cellPad} ${
                        ci === 0 ? "font-medium" : ""
                      }`}>
                      {ci === 0 && selected && (
                        <motion.span
                          layoutId="ecole-table-selection"
                          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--em-accent,#0067C0)]"
                          transition={{ type: "spring", stiffness: 520, damping: 40 }}
                          aria-hidden="true"
                        />
                      )}
                      {c.render ? c.render(r) : <CellValue k={c.key} v={r[c.key]} />}
                    </td>
                  ))}
                  {rowActions && (
                    <td
                      className={`border-b border-black/[0.045] group-last:border-b-0 ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5">{rowActions(r)}</div>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!compact && rows.length > 0 && (
        <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#F9F9F9]/60 px-4 py-2 text-[12px] text-[#5D5D5D]">
          <span>
            <span className="font-semibold tabular-nums text-[#1A1A1A]">{rows.length}</span> élément(s)
          </span>
          {onRowClick && <span className="hidden sm:inline">Cliquez sur une ligne pour voir le détail</span>}
        </div>
      )}
    </div>
  );
}