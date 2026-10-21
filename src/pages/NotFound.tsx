import React from "react";
import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { EmptyState } from "../components/data/States";

export function NotFound() {
  return (
    <div className="ecole_m ecole_m-desktop flex min-h-[60vh] items-center justify-center p-6">
      <div className="ecole_m-card w-full max-w-lg">
        <EmptyState icon={CompassIcon} title="Page introuvable" text="Cette page n'existe pas ou a été déplacée.">
          <Link to="/app" className="ecole_m-btn ecole_m-btn--primary">
            Retour à l'accueil
          </Link>
        </EmptyState>
      </div>
    </div>);

}