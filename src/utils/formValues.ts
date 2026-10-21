import type { FieldDef, FormValue, FormValues, OptionItem, Row } from "../types/ui";

function emptyFor(f: FieldDef): FormValue {
  if (f.type === "boolean") return false;
  if (f.type === "multiselect" || f.type === "tags" || f.type === "list") return [];
  if (f.type === "file") return null;
  return "";
}

function fromInitial(f: FieldDef, v: unknown): FormValue {
  if (v === null || v === undefined) return undefined;
  if (f.type === "boolean") return v === true || v === 1 || v === "1" || v === "true";
  if (f.type === "list") {
    if (!Array.isArray(v)) return [];
    return (v as Row[]).map((item) => initialValues(f.itemFields ?? [], item));
  }
  if (f.type === "multiselect" || f.type === "tags") return Array.isArray(v) ? v.map(String) : [];
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v;
  return undefined;
}

export function initialValues(fields: FieldDef[], initial?: Row): FormValues {
  const out: FormValues = {};
  fields.forEach((f) => {
    const fromInit = initial ? fromInitial(f, initial[f.name]) : undefined;
    out[f.name] = fromInit !== undefined ? fromInit : f.defaultValue !== undefined ? f.defaultValue : emptyFor(f);
  });
  return out;
}

export function applyFieldChange(
fields: FieldDef[],
prev: FormValues,
name: string,
value: FormValue,
option?: OptionItem | null)
: FormValues {
  const next: FormValues = { ...prev, [name]: value };
  const field = fields.find((f) => f.name === name);
  if (field?.labelTo) next[field.labelTo] = option ? option.label : "";
  fields.forEach((f) => {
    if (f.dependsOn?.includes(name) && f.type === "select") next[f.name] = "";
  });
  return next;
}

function isEmpty(v: FormValue): boolean {
  return v === undefined || v === null || v === "" || Array.isArray(v) && v.length === 0;
}

export function validate(fields: FieldDef[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  fields.forEach((f) => {
    if (f.showIf && !f.showIf(values)) return;
    if (f.required && f.type !== "boolean" && isEmpty(values[f.name])) errors[f.name] = "Ce champ est obligatoire";
    if (f.type === "list" && Array.isArray(values[f.name])) {
      (values[f.name] as FormValues[]).forEach((row, i) => {
        const sub = validate(f.itemFields ?? [], row);
        if (Object.keys(sub).length) errors[f.name] = `Ligne ${i + 1} : complétez les champs obligatoires`;
      });
    }
  });
  return errors;
}

export function cleanValues(fields: FieldDef[], values: FormValues): Row {
  const out: Row = {};
  fields.forEach((f) => {
    if (f.name.startsWith("_")) return;
    if (f.showIf && !f.showIf(values)) return;
    const v = values[f.name];
    switch (f.type) {
      case "boolean":
        out[f.name] = Boolean(v);
        return;
      case "number":{
          if (isEmpty(v)) return;
          const n = Number(v);
          if (!Number.isNaN(n)) out[f.name] = n;
          return;
        }
      case "select":
        if (isEmpty(v)) return;
        out[f.name] = f.numeric ? Number(v) : v;
        return;
      case "multiselect":
      case "tags":
        if (Array.isArray(v) && v.length) out[f.name] = v;
        return;
      case "list":
        if (Array.isArray(v) && v.length) {
          out[f.name] = (v as FormValues[]).map((row) => cleanValues(f.itemFields ?? [], row));
        }
        return;
      case "file":
        if (v instanceof File) out[f.name] = v;
        return;
      default:
        if (typeof v === "string" && v.trim() !== "") out[f.name] = v.trim();
    }
  });
  return out;
}