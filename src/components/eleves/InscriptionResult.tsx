import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRightIcon, CircleCheckIcon } from "lucide-react";
import { changerClasseInscription } from "../../lib/api_ecole";
import { changerClasseFields } from "../../data/fields/eleves";
import { ObjectView } from "../data/ObjectView";
import { FormAction } from "../form/FormAction";
import { EASE_OUT } from "./EleveMotion";
import { obj, str } from "../../utils/format";

/** Résultat d'une inscription : permet de corriger immédiatement la classe attribuée. */
export function InscriptionResult({ result, anneeId }: { result: unknown; anneeId: string }) {
  const inscriptionId = str(obj(obj(result).inscription).id);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
    >
      <div className="rounded-lg border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] p-4">
        <ObjectView data={result} />
      </div>

      {inscriptionId && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--em-border)] bg-[var(--em-accent-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[13px]">
            <CircleCheckIcon className="h-4 w-4 shrink-0 text-[var(--em-accent)]" aria-hidden />
            La classe attribuée peut encore être corrigée.
          </p>
          <FormAction
            label="Changer de classe"
            icon={ArrowLeftRightIcon}
            size="sm"
            fields={changerClasseFields(anneeId)}
            onSubmit={(b) => changerClasseInscription(inscriptionId, b)}
            successMessage="Classe modifiée"
            showResult
          />
        </div>
      )}
    </motion.div>
  );
}