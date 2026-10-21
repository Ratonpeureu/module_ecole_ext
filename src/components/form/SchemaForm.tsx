import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { FieldDef, FormValue, FormValues, OptionItem, Row } from "../../types/ui";
import { applyFieldChange, cleanValues, initialValues, validate } from "../../utils/formValues";
import { errorMessage } from "../../utils/errors";
import { Button } from "../ui/Button";
import { ObjectView } from "../data/ObjectView";
import { FieldControl } from "./FieldControl";

export interface SchemaFormProps {
  fields: FieldDef[];
  initial?: Row;
  submitLabel?: string;
  onSubmit: (body: Row, values: FormValues) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
  successMessage?: string;
  showResult?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  columns?: 1 | 2;
  renderResult?: (result: unknown) => React.ReactNode;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const isFull = (f: FieldDef) => f.full || ["textarea", "list", "multiselect", "tags", "file"].includes(f.type);

export function SchemaForm({
  fields,
  initial,
  submitLabel = "Enregistrer",
  onSubmit,
  onSuccess,
  successMessage = "Enregistré avec succès",
  showResult,
  onCancel,
  cancelLabel = "Annuler",
  columns = 2,
  renderResult,
}: SchemaFormProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(fields, initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ value: unknown } | null>(null);
  const reduce = useReducedMotion();
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  const visible = fields.filter((f) => !f.showIf || f.showIf(values));

  const change = (name: string, v: FormValue, opt?: OptionItem | null) => {
    setValues((prev) => applyFieldChange(fields, prev, name, v, opt));
    setErrors((e) => {
      if (!e[name]) return e;
      const n = { ...e };
      delete n[name];
      return n;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(fields, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const r = await onSubmit(cleanValues(fields, values), values);
      toast.success(successMessage);
      if (showResult) setResult({ value: r });
      else onSuccess?.(r);
    } catch (err) {
      setServerError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Écran de résultat ─────────────────────────────────────── */
  if (result) {
    return (
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
      >
        <div className="flex items-center gap-3 rounded-lg border border-[var(--em-success)]/20 bg-[var(--em-success-soft)] px-4 py-3 text-[var(--em-success)]">
          <motion.span
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: EASE_OUT, delay: 0.06 }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--em-success)] text-white"
          >
            <CircleCheckIcon className="h-4.5 w-4.5" aria-hidden />
          </motion.span>
          <span className="font-semibold">{successMessage}</span>
        </div>

        {renderResult ? renderResult(result.value) : <ObjectView data={result.value} />}

        <div className="flex justify-end border-t border-[var(--em-border)] pt-4">
          <Button variant="primary" onClick={() => onSuccess?.(result.value)}>
            Terminer
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ── Formulaire ────────────────────────────────────────────── */
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className={`grid gap-x-4 gap-y-4 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        <AnimatePresence initial={false}>
          {visible.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: reduce ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{
                duration: 0.2,
                ease: EASE_OUT,
                delay: firstRender.current ? Math.min(i * 0.03, 0.2) : 0,
              }}
              className={isFull(f) && columns === 2 ? "md:col-span-2" : ""}
            >
              <FieldControl
                field={f}
                value={values[f.name]}
                values={values}
                onChange={(v, o) => change(f.name, v, o)}
                error={errors[f.name]}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {serverError && (
          <motion.div
            key="server-error"
            role="alert"
            initial={{ opacity: 0, y: reduce ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="flex gap-3 whitespace-pre-line rounded-lg border border-[#f0c6c1] bg-[var(--em-danger-soft)] px-4 py-3 text-[13.5px] text-[var(--em-danger)]"
          >
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--em-border)] pt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            {cancelLabel}
          </Button>
        )}
        <Button variant="primary" type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}