import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlusIcon } from "lucide-react";
import { useSchool } from "../../contexts/SchoolContext";
import { EmptyState, ErrorState, LoadingState } from "../data/States";

export function WithAnnee({ children }: {children: (anneeId: string) => React.ReactNode;}) {
  const { anneeId, loading, error, reload, annees } = useSchool();
  if (loading && annees.length === 0)
  return (
    <div className="ecole_m-card">
        <LoadingState />
      </div>);

  if (error)
  return (
    <div className="ecole_m-card">
        <ErrorState message={error} onRetry={reload} />
      </div>);

  if (!anneeId)
  return (
    <div className="ecole_m-card">
        <EmptyState icon={CalendarPlusIcon} title="Aucune année scolaire" text="Créez une année scolaire pour commencer à utiliser ce module.">
          <Link to="/parametres" className="ecole_m-btn ecole_m-btn--primary">
            Créer une année scolaire
          </Link>
        </EmptyState>
      </div>);

  return <>{children(anneeId)}</>;
}