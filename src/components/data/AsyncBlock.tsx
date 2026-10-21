import React from "react";
import { useAsync } from "../../hooks/useAsync";
import { EmptyState, ErrorState, LoadingState } from "./States";

interface AsyncBlockProps<T> {
  load: () => Promise<T>;
  deps: unknown[];
  children: (data: T, reload: () => void) => React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  enabled?: boolean;
  rows?: number;
}

export function AsyncBlock<T>({ load, deps, children, empty, isEmpty, enabled = true, rows = 3 }: AsyncBlockProps<T>) {
  const { data, loading, error, reload } = useAsync(load, deps, enabled);

  if (!enabled) return null;
  if (loading && (data === null || data === undefined)) return <LoadingState rows={rows} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const vide = data === null || data === undefined || (isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0);

  if (vide) return <>{empty ?? <EmptyState compact title="Aucune information pour le moment" />}</>;
  return <>{children(data as T, reload)}</>;
}