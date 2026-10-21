import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { Column, Row } from "../../types/ui";
import { DataTable } from "../data/DataTable";
import { EmptyState, ErrorState, LoadingState } from "../data/States";
import { ObjectView } from "../data/ObjectView";
import { DetailPanel } from "./DetailPanel";

export interface DetailCtx {
  reload: () => void;
  close: () => void;
}

interface ResourceViewProps {
  load: () => Promise<Row[]>;
  deps: unknown[];
  columns?: Column[];
  rowKey?: (row: Row) => string;
  toolbar?: React.ReactNode;
  actions?: (reload: () => void) => React.ReactNode;
  renderDetail?: (row: Row, ctx: DetailCtx) => React.ReactNode;
  detailTitle?: (row: Row) => string;
  detailSubtitle?: (row: Row) => string;
  rowActions?: (row: Row, reload: () => void) => React.ReactNode;
  emptyTitle?: string;
  emptyText?: string;
  emptyIcon?: LucideIcon;
  enabled?: boolean;
  disabledState?: React.ReactNode;
  wide?: boolean;
  noDetail?: boolean;
}

const SURFACE =
  "rounded-[12px] border border-black/[0.06] bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] backdrop-blur-xl";

export function ResourceView({
  load,
  deps,
  columns,
  rowKey,
  toolbar,
  actions,
  renderDetail,
  detailTitle,
  detailSubtitle,
  rowActions,
  emptyTitle = "Aucun élément pour le moment",
  emptyText,
  emptyIcon,
  enabled = true,
  disabledState,
  wide,
  noDetail
}: ResourceViewProps) {
  const { data, loading, error, reload } = useAsync(load, deps, enabled);
  const [selKey, setSelKey] = useState<string | null>(null);
  const depKey = deps.map((d) => String(d)).join("|");

  useEffect(() => {
    setSelKey(null);
  }, [depKey]);

  const keyOf = (r: Row) => (rowKey ? rowKey(r) : String(r.id ?? JSON.stringify(r)));
  const rows = data ?? [];
  const selected = selKey ? rows.find((r) => keyOf(r) === selKey) ?? null : null;
  const close = () => setSelKey(null);

  let body: React.ReactNode;
  if (!enabled) body = disabledState;
  else if (loading && !data) body = <LoadingState />;
  else if (error) body = <ErrorState message={error} onRetry={reload} />;
  else if (rows.length === 0) body = <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} />;
  else
    body = (
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => keyOf(r)}
        selectedKey={selKey}
        onRowClick={noDetail ? undefined : (r) => setSelKey((k) => (k === keyOf(r) ? null : keyOf(r)))}
        rowActions={rowActions ? (r) => rowActions(r, reload) : undefined}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      {(toolbar || actions) && (
        <div className={`${SURFACE} flex flex-wrap items-end justify-between gap-3 px-4 py-3.5`}>
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{toolbar}</div>
          {actions && <div className="flex flex-wrap gap-2">{actions(reload)}</div>}
        </div>
      )}

      <div className={`${SURFACE} relative min-w-0 overflow-hidden`}>
        {loading && data && (
          <span className="absolute inset-x-0 top-0 z-10 h-[2px] overflow-hidden" aria-hidden="true">
            <motion.span
              className="block h-full w-1/3 rounded-full bg-[var(--em-accent,#0067C0)]"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
          </span>
        )}
        {body}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="rv-backdrop"
            className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[2px] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            aria-hidden="true"
          />
        )}
        {selected && (
          <DetailPanel
            key={selKey ?? "detail"}
            wide={wide}
            title={detailTitle ? detailTitle(selected) : "Détail"}
            subtitle={detailSubtitle ? detailSubtitle(selected) : undefined}
            onClose={close}>
            {renderDetail ? renderDetail(selected, { reload, close }) : <ObjectView data={selected} />}
          </DetailPanel>
        )}
      </AnimatePresence>
    </div>
  );
}