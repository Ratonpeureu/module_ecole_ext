import React from "react";
import type { Column, Row } from "../../types/ui";
import { DataTable } from "./DataTable";

interface MiniTableProps {
  rows: Row[];
  columns?: Column[];
  rowActions?: (row: Row) => React.ReactNode;
  rowKey?: (row: Row, i: number) => string;
}

export function MiniTable({ rows, columns, rowActions, rowKey }: MiniTableProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <DataTable rows={rows} columns={columns} rowActions={rowActions} rowKey={rowKey} compact />
    </div>
  );
}