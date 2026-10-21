import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlusIcon, Trash2Icon } from "lucide-react";
import type { FieldDef, FormValue, FormValues } from "../../types/ui";
import { applyFieldChange, initialValues } from "../../utils/formValues";
import { FieldControl } from "./FieldControl";

interface ListFieldProps {
  field: FieldDef;
  value: FormValue;
  parentValues: FormValues;
  onChange: (v: FormValue) => void;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function ListField({ field, value, parentValues, onChange }: ListFieldProps) {
  const rows = Array.isArray(value) ? (value as FormValues[]) : [];
  const sub = field.itemFields ?? [];
  const reduce = useReducedMotion();

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {rows.map((row, i) => (
          <motion.div
            key={i}
            layout={!reduce}
            initial={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="relative rounded-lg border border-[var(--em-border)] bg-[var(--em-surface-2)] py-3 pl-12 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <span
              className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[var(--em-accent-soft)] text-[11px] font-semibold text-[var(--em-accent)]"
              aria-hidden
            >
              {i + 1}
            </span>

            <div className="flex items-start gap-2">
              <div
                className="grid min-w-0 flex-1 gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
              >
                {sub
                  .filter((f) => !f.showIf || f.showIf(row))
                  .map((f) => (
                    <FieldControl
                      key={f.name}
                      field={f}
                      value={row[f.name]}
                      values={{ ...parentValues, ...row }}
                      onChange={(v, o) =>
                        onChange(rows.map((r, j) => (j === i ? applyFieldChange(sub, r, f.name, v, o) : r)))
                      }
                    />
                  ))}
              </div>

              <button
                type="button"
                aria-label={`Retirer la ligne ${i + 1}`}
                title={`Retirer la ligne ${i + 1}`}
                className="ecole_m-muted mt-[26px] grid h-9 w-9 shrink-0 place-items-center rounded-md outline-none transition-colors duration-150 hover:bg-[var(--em-danger-soft)] hover:text-[var(--em-danger)] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        type="button"
        layout={!reduce}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.14, ease: EASE_OUT }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--em-border)] px-3 py-2.5 text-[13px] font-medium text-[var(--em-accent)] outline-none transition-colors duration-150 hover:border-[var(--em-accent)] hover:bg-[var(--em-accent-soft)] focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]"
        onClick={() => onChange([...rows, initialValues(sub)])}
      >
        <PlusIcon className="h-4 w-4" aria-hidden />
        {field.addLabel ?? "Ajouter une ligne"}
      </motion.button>
    </div>
  );
}