import React, { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlertIcon, FileCheck2Icon, UploadIcon } from "lucide-react";
import type { FieldDef, FormValue, FormValues, OptionItem } from "../../types/ui";
import { Select } from "../ui/Select";
import { ListField } from "./ListField";
import { TagInput } from "./TagInput";

interface FieldControlProps {
  field: FieldDef;
  value: FormValue;
  values: FormValues;
  onChange: (v: FormValue, option?: OptionItem | null) => void;
  error?: string;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Champ texte Windows 11 : trait inférieur qui passe à l'accent au focus. */
const INPUT =
  "block w-full min-w-0 rounded-md border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] px-3 text-[14px] text-inherit " +
  "shadow-[inset_0_-1px_0_rgba(0,0,0,0.22)] outline-none transition-[box-shadow,border-color,background-color] duration-150 " +
  "placeholder:text-[var(--em-text-3)] hover:bg-[var(--em-surface-2)] " +
  "focus:bg-[var(--em-surface,#ffffff)] focus:shadow-[inset_0_-2px_0_var(--em-accent)] " +
  "aria-[invalid=true]:border-[var(--em-danger)] aria-[invalid=true]:shadow-[inset_0_-2px_0_var(--em-danger)] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

function Required() {
  return (
    <span className="ml-0.5 text-[var(--em-danger)]" aria-hidden>
      *
    </span>
  );
}

function FieldHint({ help, error }: { help?: string; error?: string }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p
          key="error"
          role="alert"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium leading-snug text-[var(--em-danger)]"
        >
          <CircleAlertIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </motion.p>
      ) : help ? (
        <motion.p
          key="help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          className="ecole_m-muted mt-1.5 text-[12px] leading-snug"
        >
          {help}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function FieldControl({ field, value, values, onChange, error }: FieldControlProps) {
  const id = useId();
  const loadKey = (field.dependsOn ?? []).map((d) => String(values[d] ?? "")).join("|");
  const load = field.load ? (q: string) => field.load!(q, values) : undefined;
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "";

  /* ── Interrupteur ──────────────────────────────────────────── */
  if (field.type === "boolean") {
    return (
      <label
        htmlFor={id}
        className="-mx-2 flex min-h-[36px] cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-black/[0.03]"
      >
        <span className="relative mt-0.5 inline-flex h-5 w-10 shrink-0">
          <input
            id={id}
            type="checkbox"
            role="switch"
            aria-checked={value === true}
            className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-black/45 bg-transparent transition-colors duration-150 peer-checked:border-transparent peer-checked:bg-[var(--em-accent)] peer-hover:bg-black/[0.04] peer-checked:peer-hover:bg-[var(--em-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--em-accent)] peer-focus-visible:ring-offset-2"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-black/60 transition-[transform,background-color,width] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] peer-checked:translate-x-5 peer-checked:bg-white peer-active:w-3.5"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-medium leading-5">{field.label}</span>
          {field.help && <span className="ecole_m-muted mt-0.5 block text-[12px] leading-snug">{field.help}</span>}
        </span>
      </label>
    );
  }

  /* ── Liste de sous-formulaires ─────────────────────────────── */
  if (field.type === "list") {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-2 text-[13px] font-semibold">
          {field.label}
          {field.required && <Required />}
        </legend>
        <ListField field={field} value={value} parentValues={values} onChange={onChange} />
        <FieldHint help={field.help} error={error} />
      </fieldset>
    );
  }

  let control: React.ReactNode;

  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          className={`${INPUT} min-h-[96px] resize-y py-2 leading-relaxed`}
          value={text}
          placeholder={field.placeholder}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case "select":
    case "multiselect":
      control = (
        <Select
          id={id}
          ariaLabel={field.label}
          value={field.type === "multiselect" ? (Array.isArray(value) ? (value as string[]) : []) : text}
          onChange={(v, o) => onChange(v, o)}
          options={field.options}
          load={load}
          loadKey={loadKey}
          multiple={field.type === "multiselect"}
          searchable={field.searchable}
          placeholder={field.placeholder}
          invalid={!!error}
          clearable={!field.required}
        />
      );
      break;

    case "tags":
      control = (
        <TagInput
          id={id}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(v)}
          placeholder={field.placeholder}
        />
      );
      break;

    case "file": {
      const file = value instanceof File ? value : null;
      control = (
        <label
          className={`group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3.5 py-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--em-accent)] ${
            error
              ? "border-[var(--em-danger)] bg-[var(--em-danger-soft)]"
              : file
                ? "border-[var(--em-accent)] bg-[var(--em-accent-soft)]"
                : "border-[var(--em-border)] bg-[var(--em-surface-2)] hover:border-[var(--em-accent)] hover:bg-[var(--em-accent-soft)]"
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--em-surface,#ffffff)] text-[var(--em-accent)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={file ? "ok" : "vide"}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
              >
                {file ? <FileCheck2Icon className="h-4 w-4" /> : <UploadIcon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-medium">{file ? file.name : "Choisir un fichier"}</span>
            <span className="ecole_m-muted block truncate text-[12px]">
              {file
                ? `${Math.max(1, Math.round(file.size / 1024)).toLocaleString("fr-FR")} Ko`
                : field.accept
                  ? `Formats acceptés : ${field.accept}`
                  : "Cliquez pour parcourir vos fichiers"}
            </span>
          </span>
          {file && <span className="shrink-0 text-[12px] font-semibold text-[var(--em-accent)]">Changer</span>}
          <input
            id={id}
            type="file"
            accept={field.accept}
            className="sr-only"
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      );
      break;
    }

    case "color": {
      const hex = /^#[0-9a-f]{6}$/i.test(text) ? text : "#0067c0";
      control = (
        <div className="flex gap-2">
          <label
            className="relative h-9 w-12 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[var(--em-border)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.22)] transition-shadow duration-150 focus-within:ring-2 focus-within:ring-[var(--em-accent)]"
            style={{ backgroundColor: hex }}
          >
            <input
              type="color"
              aria-label={field.label}
              value={hex}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <input
            id={id}
            className={`${INPUT} h-9 font-mono uppercase`}
            value={text}
            placeholder="#0067C0"
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
      break;
    }

    default:
      control = (
        <input
          id={id}
          type={field.type}
          className={`${INPUT} h-9`}
          value={text}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step ?? (field.type === "number" ? "any" : undefined)}
          aria-invalid={!!error}
          autoComplete={field.type === "password" ? "new-password" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium leading-5">
        {field.label}
        {field.required && <Required />}
      </label>
      {control}
      <FieldHint help={field.help} error={error} />
    </div>
  );
}