import { useMemo } from "react";
import type { Row } from "../types/ui";
import { str } from "../utils/format";
import { useAsync } from "./useAsync";

/** Charge une liste depuis le serveur et renvoie une table identifiant → libellé (affichage uniquement). */
export function useLookup(load: () => Promise<Row[]>, label: (r: Row) => string, deps: unknown[] = [], key = "id") {
  const { data } = useAsync(load, deps);
  return useMemo(() => {
    const m = new Map<string, string>();
    (data ?? []).forEach((r) => m.set(str(r[key]), label(r)));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}