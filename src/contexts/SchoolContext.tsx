import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getEntreprise } from "@/lib/api";
import { getAnneeActive, listerAnnees } from "../lib/api_ecole";
import { useAsync } from "../hooks/useAsync";
import type { Row } from "../types/ui";
import { str } from "../utils/format";

interface SchoolContextValue {
  annees: Row[];
  anneeId: string;
  annee: Row | null;
  setAnneeId: (id: string) => void;
  loading: boolean;
  error: string | null;
  reload: () => void;
  entreprise: ReturnType<typeof getEntreprise>;
}

const SchoolContext = createContext<SchoolContextValue | null>(null);
const STORAGE_KEY = "ecole_m_annee";

export function SchoolProvider({ children }: {children: React.ReactNode;}) {
  const { data, loading, error, reload } = useAsync(async () => {
    const [annees, active] = await Promise.all([listerAnnees(), getAnneeActive()]);
    return { annees: annees ?? [], active };
  }, []);
  const [chosen, setChosen] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const annees = data?.annees ?? [];
  const activeId = data?.active ? str(data.active.id) : "";
  const anneeId = annees.some((a) => str(a.id) === chosen) ? chosen : activeId || str(annees[0]?.id);
  const annee = annees.find((a) => str(a.id) === anneeId) ?? null;

  useEffect(() => {
    if (!anneeId) return;
    try {
      localStorage.setItem(STORAGE_KEY, anneeId);
    } catch {}
  }, [anneeId]);

  const setAnneeId = useCallback((id: string) => setChosen(id), []);

  const value = useMemo<SchoolContextValue>(
    () => ({ annees, anneeId, annee, setAnneeId, loading, error, reload, entreprise: getEntreprise() }),
    [annees, anneeId, annee, setAnneeId, loading, error, reload]
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool(): SchoolContextValue {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool doit être utilisé dans SchoolProvider");
  return ctx;
}